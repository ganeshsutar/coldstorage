import uuid
from decimal import Decimal

from django.db import models

from apps.accounting.models import Account, PartyLedger
from apps.authentication.models import Organization


class AmadType(models.TextChoices):
    """Type of goods arrival."""

    SEEDHI = "SEEDHI", "Seedhi (Direct)"
    DUMP = "DUMP", "Dump"


class NikasiType(models.TextChoices):
    """Type of goods dispatch."""

    SEEDHI = "SEEDHI", "Seedhi (Direct)"
    KATAI = "KATAI", "Katai (Cut)"


# =============================================================================
# Master Tables
# =============================================================================


class Commodity(models.Model):
    """Commodity/Product master for cold storage items."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="commodities",
    )
    code = models.CharField(max_length=20, db_index=True)
    name = models.CharField(max_length=255)
    name_hindi = models.CharField(max_length=255, blank=True, null=True)
    variety = models.CharField(max_length=100, blank=True, null=True)
    grace_days = models.PositiveIntegerField(
        default=0,
        help_text="Number of grace days before rent starts",
    )
    default_rent_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Default rent rate per quintal per month",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory_commodity"
        verbose_name = "commodity"
        verbose_name_plural = "commodities"
        ordering = ["code"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "code"],
                name="unique_organization_commodity_code",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "is_active"]),
        ]

    def __str__(self):
        if self.variety:
            return f"{self.code} - {self.name} ({self.variety})"
        return f"{self.code} - {self.name}"


class Room(models.Model):
    """Cold storage room/chamber master."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="rooms",
    )
    number = models.CharField(max_length=20, db_index=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    capacity_quintals = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Room capacity in quintals",
    )
    floor_count = models.PositiveSmallIntegerField(
        default=1,
        help_text="Number of floors in this room",
    )
    # Warehouse-specific fields
    rack_count = models.PositiveIntegerField(
        default=0,
        help_text="Total number of racks in this room",
    )
    racks_per_row = models.PositiveIntegerField(
        default=10,
        help_text="Number of racks per row for grid display",
    )
    is_sugar_free = models.BooleanField(
        default=False,
        help_text="Indicates if this room is for sugar-free storage",
    )
    occupancy_color = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="Color code for visual map display (e.g., #4CAF50)",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory_room"
        verbose_name = "room"
        verbose_name_plural = "rooms"
        ordering = ["number"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "number"],
                name="unique_organization_room_number",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "is_active"]),
        ]

    def __str__(self):
        if self.name:
            return f"Room {self.number} - {self.name}"
        return f"Room {self.number}"


class Village(models.Model):
    """Village/Location master for party addresses."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="villages",
    )
    code = models.CharField(max_length=20, db_index=True)
    name = models.CharField(max_length=255)
    name_hindi = models.CharField(max_length=255, blank=True, null=True)
    post = models.CharField(max_length=255, blank=True, null=True)
    district = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory_village"
        verbose_name = "village"
        verbose_name_plural = "villages"
        ordering = ["code"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "code"],
                name="unique_organization_village_code",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "is_active"]),
            models.Index(fields=["organization", "district"]),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"


# =============================================================================
# Transaction Tables
# =============================================================================


class Amad(models.Model):
    """Amad (Goods Arrival) - Records goods received at cold storage."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="amads",
    )
    amad_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated: YYYY-NNNNN",
    )
    date = models.DateField(db_index=True)

    # Party and location
    party = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="amads",
        help_text="Party account (depositor)",
    )
    village = models.ForeignKey(
        Village,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="amads",
    )

    # Commodity and storage
    commodity = models.ForeignKey(
        Commodity,
        on_delete=models.PROTECT,
        related_name="amads",
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="amads",
    )

    # Packet details - 3 categories by size/type
    pkt1 = models.PositiveIntegerField(
        default=0,
        help_text="Packet count - Type 1 (e.g., large bags)",
    )
    pwt1 = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Total weight for Type 1 packets (kg)",
    )
    pkt2 = models.PositiveIntegerField(
        default=0,
        help_text="Packet count - Type 2 (e.g., medium bags)",
    )
    pwt2 = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Total weight for Type 2 packets (kg)",
    )
    pkt3 = models.PositiveIntegerField(
        default=0,
        help_text="Packet count - Type 3 (e.g., small bags)",
    )
    pwt3 = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Total weight for Type 3 packets (kg)",
    )

    # Computed totals
    total_packets = models.PositiveIntegerField(default=0)
    total_weight = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Total weight in kg",
    )

    # Additional details
    marks = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Identification marks on packets",
    )
    grace_days = models.PositiveIntegerField(
        default=0,
        help_text="Grace days before rent starts (from commodity or overridden)",
    )
    rent_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Rent rate per quintal per month",
    )

    # Type and documentation
    amad_type = models.CharField(
        max_length=10,
        choices=AmadType.choices,
        default=AmadType.SEEDHI,
    )
    e_way_bill = models.CharField(max_length=50, blank=True, null=True)

    # Dispatch tracking
    is_fully_dispatched = models.BooleanField(default=False)
    remaining_packets = models.PositiveIntegerField(default=0)
    remaining_weight = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory_amad"
        verbose_name = "amad"
        verbose_name_plural = "amads"
        ordering = ["-date", "-amad_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "amad_no"],
                name="unique_organization_amad_no",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "date"]),
            models.Index(fields=["organization", "party"]),
            models.Index(fields=["organization", "is_fully_dispatched"]),
            models.Index(fields=["party", "is_fully_dispatched"]),
        ]

    def __str__(self):
        return f"Amad {self.amad_no} - {self.party.name}"

    def save(self, *args, **kwargs):
        # Calculate totals
        self.total_packets = self.pkt1 + self.pkt2 + self.pkt3
        self.total_weight = self.pwt1 + self.pwt2 + self.pwt3

        # Initialize remaining if new
        if not self.pk:
            self.remaining_packets = self.total_packets
            self.remaining_weight = self.total_weight

        # Auto-generate amad number if not set
        if not self.amad_no:
            self.amad_no = self._generate_amad_no()

        # Copy commodity defaults if not set
        if self.commodity and not self.grace_days:
            self.grace_days = self.commodity.grace_days
        if self.commodity and self.rent_rate == Decimal("0.00"):
            self.rent_rate = self.commodity.default_rent_rate

        super().save(*args, **kwargs)

    def _generate_amad_no(self):
        """Generate amad number in format YYYY-NNNNN."""
        year = self.date.year
        last_amad = Amad.objects.filter(
            organization=self.organization,
            amad_no__startswith=f"{year}-",
        ).order_by("-amad_no").first()

        if last_amad:
            try:
                last_num = int(last_amad.amad_no.split("-")[1])
                return f"{year}-{last_num + 1:05d}"
            except (ValueError, IndexError):
                pass
        return f"{year}-00001"

    def update_remaining(self):
        """Update remaining packets and weight after dispatch."""
        from django.db.models import Sum

        dispatched = self.dispatch_links.aggregate(
            total_packets=Sum("packets_dispatched"),
            total_weight=Sum("weight_dispatched"),
        )

        dispatched_packets = dispatched["total_packets"] or 0
        dispatched_weight = dispatched["total_weight"] or Decimal("0.00")

        self.remaining_packets = self.total_packets - dispatched_packets
        self.remaining_weight = self.total_weight - dispatched_weight
        self.is_fully_dispatched = self.remaining_packets <= 0

        self.save(update_fields=["remaining_packets", "remaining_weight", "is_fully_dispatched"])


class Rent(models.Model):
    """Rent/Nikasi (Goods Dispatch) - Records goods dispatched from cold storage."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="rents",
    )
    serial_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated serial number",
    )
    date = models.DateField(db_index=True)

    # Party info
    party = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="rents_as_depositor",
        help_text="Original depositor party",
    )
    receiver_name = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="Name of person receiving goods (if different from party)",
    )
    receiver_account = models.ForeignKey(
        Account,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rents_as_receiver",
        help_text="Receiver account for stock transfers",
    )

    # Source amad (primary link - for single amad dispatch)
    amad = models.ForeignKey(
        Amad,
        on_delete=models.PROTECT,
        related_name="rents",
        help_text="Primary source Amad",
    )

    # Quantities
    packets = models.PositiveIntegerField(default=0)
    weight = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Weight in kg",
    )

    # Rent calculation
    storage_days = models.PositiveIntegerField(
        default=0,
        help_text="Number of days goods were stored",
    )
    rent_rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Rent rate per quintal per month",
    )
    rent_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    gst_percent = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("18.00"),
    )
    gst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    # Dispatch details
    nikasi_type = models.CharField(
        max_length=10,
        choices=NikasiType.choices,
        default=NikasiType.SEEDHI,
    )
    vehicle_no = models.CharField(max_length=20, blank=True, null=True)
    narration = models.TextField(blank=True, null=True)

    # Link to accounting
    ledger_entry = models.ForeignKey(
        PartyLedger,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rent_entries",
        help_text="Associated ledger entry for rent charge",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory_rent"
        verbose_name = "rent"
        verbose_name_plural = "rents"
        ordering = ["-date", "-serial_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "serial_no"],
                name="unique_organization_rent_serial_no",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "date"]),
            models.Index(fields=["organization", "party"]),
            models.Index(fields=["amad"]),
        ]

    def __str__(self):
        return f"Rent {self.serial_no} - {self.party.name}"

    def save(self, *args, **kwargs):
        # Auto-generate serial number if not set
        if not self.serial_no:
            self.serial_no = self._generate_serial_no()

        # Calculate totals
        self.total_amount = self.rent_amount + self.gst_amount

        super().save(*args, **kwargs)

    def _generate_serial_no(self):
        """Generate serial number in format YYYY-NNNNN."""
        year = self.date.year
        last_rent = Rent.objects.filter(
            organization=self.organization,
            serial_no__startswith=f"{year}-",
        ).order_by("-serial_no").first()

        if last_rent:
            try:
                last_num = int(last_rent.serial_no.split("-")[1])
                return f"{year}-{last_num + 1:05d}"
            except (ValueError, IndexError):
                pass
        return f"{year}-00001"


class Takpatti(models.Model):
    """Takpatti (Weighment Slip) - Records weighment details for an Amad."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="takpattis",
    )
    takpatti_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated takpatti number",
    )
    date = models.DateField(db_index=True)

    # Link to Amad
    amad = models.ForeignKey(
        Amad,
        on_delete=models.CASCADE,
        related_name="takpattis",
    )

    # Weighment details
    packets = models.PositiveIntegerField(default=0)
    gross_weight = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Gross weight in kg",
    )
    tare_weight = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Tare weight (container/bag weight) in kg",
    )
    net_weight = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Net weight in kg",
    )

    # Storage location
    room = models.ForeignKey(
        Room,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="takpattis",
    )
    floor_no = models.PositiveSmallIntegerField(
        default=1,
        help_text="Floor number within the room",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory_takpatti"
        verbose_name = "takpatti"
        verbose_name_plural = "takpattis"
        ordering = ["-date", "-takpatti_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "takpatti_no"],
                name="unique_organization_takpatti_no",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "date"]),
            models.Index(fields=["amad"]),
        ]

    def __str__(self):
        return f"Takpatti {self.takpatti_no} - Amad {self.amad.amad_no}"

    def save(self, *args, **kwargs):
        # Auto-generate takpatti number if not set
        if not self.takpatti_no:
            self.takpatti_no = self._generate_takpatti_no()

        # Calculate net weight
        self.net_weight = self.gross_weight - self.tare_weight

        super().save(*args, **kwargs)

    def _generate_takpatti_no(self):
        """Generate takpatti number in format YYYY-NNNNN."""
        year = self.date.year
        last_takpatti = Takpatti.objects.filter(
            organization=self.organization,
            takpatti_no__startswith=f"{year}-",
        ).order_by("-takpatti_no").first()

        if last_takpatti:
            try:
                last_num = int(last_takpatti.takpatti_no.split("-")[1])
                return f"{year}-{last_num + 1:05d}"
            except (ValueError, IndexError):
                pass
        return f"{year}-00001"


class AmadNikasi(models.Model):
    """Link table between Amad and Rent for multi-amad dispatches."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="amad_nikasis",
    )
    amad = models.ForeignKey(
        Amad,
        on_delete=models.CASCADE,
        related_name="dispatch_links",
    )
    rent = models.ForeignKey(
        Rent,
        on_delete=models.CASCADE,
        related_name="source_amads",
    )
    packets_dispatched = models.PositiveIntegerField(default=0)
    weight_dispatched = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "inventory_amad_nikasi"
        verbose_name = "amad nikasi link"
        verbose_name_plural = "amad nikasi links"
        constraints = [
            models.UniqueConstraint(
                fields=["amad", "rent"],
                name="unique_amad_rent_link",
            )
        ]
        indexes = [
            models.Index(fields=["organization"]),
            models.Index(fields=["amad"]),
            models.Index(fields=["rent"]),
        ]

    def __str__(self):
        return f"Amad {self.amad.amad_no} -> Rent {self.rent.serial_no}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update amad remaining after save
        self.amad.update_remaining()

    def delete(self, *args, **kwargs):
        amad = self.amad
        super().delete(*args, **kwargs)
        # Update amad remaining after delete
        amad.update_remaining()
