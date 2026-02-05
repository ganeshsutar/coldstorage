import uuid
from decimal import Decimal

from django.db import models

from apps.accounting.models import Account, PartyLedger
from apps.authentication.models import Organization
from apps.inventory.models import Amad, Commodity


class DealStatus(models.TextChoices):
    """Status of a deal (sauda)."""

    OPEN = "OPEN", "Open"
    PARTIAL = "PARTIAL", "Partially Dispatched"
    DISPATCHED = "DISPATCHED", "Fully Dispatched"
    CANCELLED = "CANCELLED", "Cancelled"
    COMPLETED = "COMPLETED", "Completed"


class GatePassStatus(models.TextChoices):
    """Status of a gate pass."""

    DRAFT = "DRAFT", "Draft"
    DONE = "DONE", "Done"
    CANCELLED = "CANCELLED", "Cancelled"


class Sauda(models.Model):
    """
    Sauda (Deal) - Trading deal between a seller and buyer for a commodity.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="saudas",
    )
    deal_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated: S/YYYY-NNNNN",
    )
    deal_date = models.DateField(db_index=True)

    # Parties
    seller = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="saudas_as_seller",
        help_text="Seller party account",
    )
    buyer = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="saudas_as_buyer",
        help_text="Buyer party account",
    )

    # Commodity details
    commodity = models.ForeignKey(
        Commodity,
        on_delete=models.PROTECT,
        related_name="saudas",
    )
    variety = models.CharField(max_length=100, blank=True, null=True)

    # Quantity and pricing
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Total quantity in bags/packets",
    )
    rate = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Rate per unit",
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Total deal amount",
    )

    # Due date
    due_days = models.PositiveIntegerField(
        default=0,
        help_text="Number of days for delivery",
    )
    due_date = models.DateField(
        null=True,
        blank=True,
        help_text="Delivery due date",
    )

    # Dispatch tracking
    dispatched_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Quantity already dispatched",
    )
    balance_quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Remaining quantity to be dispatched",
    )

    # Status
    status = models.CharField(
        max_length=15,
        choices=DealStatus.choices,
        default=DealStatus.OPEN,
    )

    # Terms
    payment_terms = models.TextField(blank=True, null=True)
    delivery_location = models.CharField(max_length=255, blank=True, null=True)
    remarks = models.TextField(blank=True, null=True)

    # Audit fields
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cancelled_saudas",
    )
    cancel_reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "trading_sauda"
        verbose_name = "sauda"
        verbose_name_plural = "saudas"
        ordering = ["-deal_date", "-deal_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "deal_no"],
                name="unique_organization_deal_no",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "deal_date"]),
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["organization", "seller"]),
            models.Index(fields=["organization", "buyer"]),
        ]

    def __str__(self):
        return f"Sauda {self.deal_no} - {self.seller.name} → {self.buyer.name}"

    def save(self, *args, **kwargs):
        # Auto-generate deal number if not set
        if not self.deal_no:
            self.deal_no = self._generate_deal_no()

        # Calculate amount
        self.amount = (self.quantity * self.rate).quantize(Decimal("0.01"))

        # Calculate balance quantity
        self.balance_quantity = self.quantity - self.dispatched_quantity

        super().save(*args, **kwargs)

    def _generate_deal_no(self):
        """Generate deal number in format S/YYYY-NNNNN."""
        year = self.deal_date.year
        last_deal = Sauda.objects.filter(
            organization=self.organization,
            deal_no__startswith=f"S/{year}-",
        ).order_by("-deal_no").first()

        if last_deal:
            try:
                last_num = int(last_deal.deal_no.split("-")[1])
                return f"S/{year}-{last_num + 1:05d}"
            except (ValueError, IndexError):
                pass
        return f"S/{year}-00001"


class GatePass(models.Model):
    """
    Gate Pass - Records goods dispatch with transport details.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="gate_passes",
    )
    gp_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated: GP/YYYY-NNNNN",
    )
    gp_date = models.DateField(db_index=True)
    gp_time = models.TimeField(null=True, blank=True)

    # Parties
    seller = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="gate_passes_as_seller",
    )
    buyer = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="gate_passes_as_buyer",
    )

    # Link to deal (optional)
    sauda = models.ForeignKey(
        Sauda,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="gate_passes",
    )

    # Transport details
    transport_name = models.CharField(max_length=255, blank=True, null=True)
    vehicle_no = models.CharField(max_length=50, blank=True, null=True)
    driver_name = models.CharField(max_length=255, blank=True, null=True)
    driver_contact = models.CharField(max_length=20, blank=True, null=True)
    bilti_no = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Transport receipt number",
    )

    # Totals (computed from items)
    total_packets = models.PositiveIntegerField(default=0)
    total_weight = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Total weight in kg",
    )
    rate = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    # Status
    status = models.CharField(
        max_length=15,
        choices=GatePassStatus.choices,
        default=GatePassStatus.DRAFT,
    )

    remarks = models.TextField(blank=True, null=True)

    # Audit fields
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cancelled_gate_passes",
    )
    cancel_reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "trading_gate_pass"
        verbose_name = "gate pass"
        verbose_name_plural = "gate passes"
        ordering = ["-gp_date", "-gp_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "gp_no"],
                name="unique_organization_gp_no",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "gp_date"]),
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["organization", "seller"]),
            models.Index(fields=["organization", "buyer"]),
        ]

    def __str__(self):
        return f"GP {self.gp_no} - {self.seller.name} → {self.buyer.name}"

    def save(self, *args, **kwargs):
        # Auto-generate GP number if not set
        if not self.gp_no:
            self.gp_no = self._generate_gp_no()

        super().save(*args, **kwargs)

    def _generate_gp_no(self):
        """Generate gate pass number in format GP/YYYY-NNNNN."""
        year = self.gp_date.year
        last_gp = GatePass.objects.filter(
            organization=self.organization,
            gp_no__startswith=f"GP/{year}-",
        ).order_by("-gp_no").first()

        if last_gp:
            try:
                last_num = int(last_gp.gp_no.split("-")[1])
                return f"GP/{year}-{last_num + 1:05d}"
            except (ValueError, IndexError):
                pass
        return f"GP/{year}-00001"


class GatePassItem(models.Model):
    """
    Gate Pass Item - Individual amad line items in a gate pass.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gate_pass = models.ForeignKey(
        GatePass,
        on_delete=models.CASCADE,
        related_name="items",
    )
    amad = models.ForeignKey(
        Amad,
        on_delete=models.PROTECT,
        related_name="gate_pass_items",
    )

    # Packet details
    pkt1 = models.PositiveIntegerField(default=0)
    pkt2 = models.PositiveIntegerField(default=0)
    pkt3 = models.PositiveIntegerField(default=0)

    # Weight and pricing
    weight = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Weight in kg",
    )
    rate = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "trading_gate_pass_item"
        verbose_name = "gate pass item"
        verbose_name_plural = "gate pass items"
        ordering = ["created_at"]
        indexes = [
            models.Index(fields=["gate_pass"]),
            models.Index(fields=["amad"]),
        ]

    def __str__(self):
        return f"GP Item: Amad {self.amad.amad_no} in {self.gate_pass.gp_no}"

    def save(self, *args, **kwargs):
        # Calculate amount
        self.amount = (self.weight * self.rate).quantize(Decimal("0.01"))
        super().save(*args, **kwargs)


class Katai(models.Model):
    """
    Katai (Grading) - Records commodity grading/sorting details.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="katais",
    )
    katai_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated: KT/YYYY-NNNNN",
    )
    katai_date = models.DateField(db_index=True)

    # Party and source
    party = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="katais",
    )
    amad = models.ForeignKey(
        Amad,
        on_delete=models.PROTECT,
        related_name="katais",
    )

    # Grading details
    bags_graded = models.PositiveIntegerField(
        default=0,
        help_text="Total bags graded",
    )

    # Output breakdown
    mota_bags = models.PositiveIntegerField(default=0, help_text="Mota (large) grade bags")
    chatta_bags = models.PositiveIntegerField(default=0, help_text="Chatta (flat) grade bags")
    beej_bags = models.PositiveIntegerField(default=0, help_text="Beej (seed) grade bags")
    mix_bags = models.PositiveIntegerField(default=0, help_text="Mix grade bags")
    gulla_bags = models.PositiveIntegerField(default=0, help_text="Gulla grade bags")

    # Charges
    charge_per_bag = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    total_charges = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    # Labor
    labor_name = models.CharField(max_length=255, blank=True, null=True)

    remarks = models.TextField(blank=True, null=True)

    # Ledger entry
    ledger_entry = models.ForeignKey(
        PartyLedger,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="katai_entries",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "trading_katai"
        verbose_name = "katai"
        verbose_name_plural = "katais"
        ordering = ["-katai_date", "-katai_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "katai_no"],
                name="unique_organization_katai_no",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "katai_date"]),
            models.Index(fields=["organization", "party"]),
        ]

    def __str__(self):
        return f"Katai {self.katai_no} - {self.party.name}"

    def save(self, *args, **kwargs):
        # Auto-generate katai number if not set
        if not self.katai_no:
            self.katai_no = self._generate_katai_no()

        # Calculate total charges
        self.total_charges = (self.bags_graded * self.charge_per_bag).quantize(Decimal("0.01"))

        super().save(*args, **kwargs)

    def _generate_katai_no(self):
        """Generate katai number in format KT/YYYY-NNNNN."""
        year = self.katai_date.year
        last_katai = Katai.objects.filter(
            organization=self.organization,
            katai_no__startswith=f"KT/{year}-",
        ).order_by("-katai_no").first()

        if last_katai:
            try:
                last_num = int(last_katai.katai_no.split("-")[1])
                return f"KT/{year}-{last_num + 1:05d}"
            except (ValueError, IndexError):
                pass
        return f"KT/{year}-00001"
