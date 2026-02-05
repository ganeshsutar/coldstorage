import uuid
from decimal import Decimal

from django.db import models

from apps.accounting.models import Account, PartyLedger
from apps.authentication.models import Organization


class BardanaStatus(models.TextChoices):
    """Status of a bardana transaction."""

    DRAFT = "DRAFT", "Draft"
    CONFIRMED = "CONFIRMED", "Confirmed"
    CANCELLED = "CANCELLED", "Cancelled"


class BardanaCondition(models.TextChoices):
    """Condition of returned bardana."""

    GOOD = "GOOD", "Good"
    FAIR = "FAIR", "Fair"
    DAMAGED = "DAMAGED", "Damaged"


class BardanaType(models.Model):
    """Master data for types of bardana (packaging material)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="bardana_types",
    )
    code = models.CharField(max_length=20, db_index=True)
    name = models.CharField(max_length=100)
    rate_per_unit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    opening_stock = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bardana_type"
        verbose_name = "Bardana Type"
        verbose_name_plural = "Bardana Types"
        ordering = ["code"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "code"],
                name="unique_organization_bardana_code",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "is_active"]),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"


class BardanaIssueHeader(models.Model):
    """Header for bardana issue vouchers."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="bardana_issues",
    )
    voucher_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated: BI/YYYY-NNNNN",
    )
    date = models.DateField(db_index=True)

    # Party information
    party = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="bardana_issues",
    )
    party_name = models.CharField(max_length=255)

    # Totals
    total_qty = models.PositiveIntegerField(default=0)
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    remarks = models.TextField(blank=True, null=True)

    # Status
    status = models.CharField(
        max_length=15,
        choices=BardanaStatus.choices,
        default=BardanaStatus.DRAFT,
    )

    # Advance fields
    is_advance = models.BooleanField(default=False)
    interest_rate_pm = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Monthly interest rate percentage",
    )
    expected_arrival_date = models.DateField(null=True, blank=True)
    expected_bags = models.PositiveIntegerField(null=True, blank=True)
    reference_no = models.CharField(max_length=50, blank=True, null=True)

    # Audit fields
    confirmed_at = models.DateTimeField(null=True, blank=True)
    confirmed_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="confirmed_bardana_issues",
    )
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cancelled_bardana_issues",
    )
    cancel_reason = models.TextField(blank=True, null=True)

    # Ledger entry
    ledger_entry = models.ForeignKey(
        PartyLedger,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bardana_issue_entries",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bardana_issue_header"
        verbose_name = "Bardana Issue"
        verbose_name_plural = "Bardana Issues"
        ordering = ["-date", "-voucher_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "voucher_no"],
                name="unique_organization_bardana_issue_no",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "date"]),
            models.Index(fields=["organization", "party"]),
            models.Index(fields=["organization", "status"]),
        ]

    def __str__(self):
        return f"Issue {self.voucher_no} - {self.party_name}"

    def save(self, *args, **kwargs):
        # Auto-generate voucher number if not set
        if not self.voucher_no:
            self.voucher_no = self._generate_voucher_no()

        # Denormalize party name
        if self.party:
            self.party_name = self.party.name

        # Sum items to totals
        if self.pk:
            items = self.items.all()
            self.total_qty = sum(item.qty for item in items)
            self.total_amount = sum(item.amount for item in items)

        super().save(*args, **kwargs)

    def _generate_voucher_no(self):
        """Generate voucher number in format BI/YYYY-NNNNN."""
        year = self.date.year
        last = BardanaIssueHeader.objects.filter(
            organization=self.organization,
            voucher_no__startswith=f"BI/{year}-",
        ).order_by("-voucher_no").first()

        if last:
            try:
                last_num = int(last.voucher_no.split("-")[1])
                return f"BI/{year}-{last_num + 1:05d}"
            except (ValueError, IndexError):
                pass
        return f"BI/{year}-00001"


class BardanaIssueItem(models.Model):
    """Line items for a bardana issue."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="bardana_issue_items",
    )
    issue_header = models.ForeignKey(
        BardanaIssueHeader,
        on_delete=models.CASCADE,
        related_name="items",
    )
    bardana_type = models.ForeignKey(
        BardanaType,
        on_delete=models.PROTECT,
        related_name="issue_items",
    )
    qty = models.PositiveIntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bardana_issue_item"
        verbose_name = "Bardana Issue Item"
        verbose_name_plural = "Bardana Issue Items"
        indexes = [
            models.Index(fields=["organization"]),
            models.Index(fields=["issue_header"]),
        ]

    def __str__(self):
        return f"{self.bardana_type.name} x {self.qty} in {self.issue_header.voucher_no}"

    def save(self, *args, **kwargs):
        self.amount = Decimal(str(self.qty)) * self.rate
        super().save(*args, **kwargs)


class BardanaReturnHeader(models.Model):
    """Header for bardana return vouchers."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="bardana_returns",
    )
    voucher_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated: BR/YYYY-NNNNN",
    )
    date = models.DateField(db_index=True)

    # Party information
    party = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="bardana_returns",
    )
    party_name = models.CharField(max_length=255)

    # Totals
    total_qty = models.PositiveIntegerField(default=0)
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    remarks = models.TextField(blank=True, null=True)

    # Status
    status = models.CharField(
        max_length=15,
        choices=BardanaStatus.choices,
        default=BardanaStatus.DRAFT,
    )

    # Audit fields
    confirmed_at = models.DateTimeField(null=True, blank=True)
    confirmed_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="confirmed_bardana_returns",
    )
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cancelled_bardana_returns",
    )
    cancel_reason = models.TextField(blank=True, null=True)

    # Ledger entry
    ledger_entry = models.ForeignKey(
        PartyLedger,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="bardana_return_entries",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bardana_return_header"
        verbose_name = "Bardana Return"
        verbose_name_plural = "Bardana Returns"
        ordering = ["-date", "-voucher_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "voucher_no"],
                name="unique_organization_bardana_return_no",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "date"]),
            models.Index(fields=["organization", "party"]),
            models.Index(fields=["organization", "status"]),
        ]

    def __str__(self):
        return f"Return {self.voucher_no} - {self.party_name}"

    def save(self, *args, **kwargs):
        # Auto-generate voucher number if not set
        if not self.voucher_no:
            self.voucher_no = self._generate_voucher_no()

        # Denormalize party name
        if self.party:
            self.party_name = self.party.name

        # Sum items to totals
        if self.pk:
            items = self.items.all()
            self.total_qty = sum(item.qty for item in items)
            self.total_amount = sum(item.amount for item in items)

        super().save(*args, **kwargs)

    def _generate_voucher_no(self):
        """Generate voucher number in format BR/YYYY-NNNNN."""
        year = self.date.year
        last = BardanaReturnHeader.objects.filter(
            organization=self.organization,
            voucher_no__startswith=f"BR/{year}-",
        ).order_by("-voucher_no").first()

        if last:
            try:
                last_num = int(last.voucher_no.split("-")[1])
                return f"BR/{year}-{last_num + 1:05d}"
            except (ValueError, IndexError):
                pass
        return f"BR/{year}-00001"


class BardanaReturnItem(models.Model):
    """Line items for a bardana return."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="bardana_return_items",
    )
    return_header = models.ForeignKey(
        BardanaReturnHeader,
        on_delete=models.CASCADE,
        related_name="items",
    )
    bardana_type = models.ForeignKey(
        BardanaType,
        on_delete=models.PROTECT,
        related_name="return_items",
    )
    qty = models.PositiveIntegerField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    condition = models.CharField(
        max_length=20,
        choices=BardanaCondition.choices,
        default=BardanaCondition.GOOD,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "bardana_return_item"
        verbose_name = "Bardana Return Item"
        verbose_name_plural = "Bardana Return Items"
        indexes = [
            models.Index(fields=["organization"]),
            models.Index(fields=["return_header"]),
        ]

    def __str__(self):
        return f"{self.bardana_type.name} x {self.qty} in {self.return_header.voucher_no}"

    def save(self, *args, **kwargs):
        self.amount = Decimal(str(self.qty)) * self.rate
        super().save(*args, **kwargs)
