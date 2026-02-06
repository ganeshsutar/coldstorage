import uuid
from decimal import Decimal

from django.db import models

from apps.accounting.models import Account, PartyLedger
from apps.authentication.models import Organization
from apps.inventory.models import Amad


class AdvanceStatus(models.TextChoices):
    """Status of a pre-season advance (Pesgi)."""

    ACTIVE = "ACTIVE", "Active"
    ADJUSTED = "ADJUSTED", "Adjusted"
    CANCELLED = "CANCELLED", "Cancelled"


class LoanStatus(models.TextChoices):
    """Status of a loan against stored goods (Karz)."""

    ACTIVE = "ACTIVE", "Active"
    PARTIAL = "PARTIAL", "Partially Repaid"
    REPAID = "REPAID", "Repaid"
    CANCELLED = "CANCELLED", "Cancelled"


class PaymentMode(models.TextChoices):
    """Mode of payment."""

    CASH = "CASH", "Cash"
    CHEQUE = "CHEQUE", "Cheque"
    BANK = "BANK", "Bank Transfer"
    UPI = "UPI", "UPI"


class LoanLedgerType(models.TextChoices):
    """Type of loan ledger entry."""

    DR = "DR", "Debit"
    CR = "CR", "Credit"


class Advance(models.Model):
    """
    Advance (Pesgi) - Pre-season advances to farmers.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="advances",
    )
    advance_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated: ADV/YYYY-NNNNN",
    )
    date = models.DateField(db_index=True)
    expected_date = models.DateField(
        null=True,
        blank=True,
        help_text="Expected date of goods arrival",
    )

    # Party
    party = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="advances",
        help_text="Farmer/party receiving advance",
    )
    party_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Denormalized party name for quick display",
    )

    # Amount & Payment
    bags = models.PositiveIntegerField(
        default=0,
        help_text="Expected bags from the party",
    )
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    payment_mode = models.CharField(
        max_length=10,
        choices=PaymentMode.choices,
        default=PaymentMode.CASH,
    )
    cheque_number = models.CharField(max_length=50, blank=True, null=True)
    cheque_date = models.DateField(null=True, blank=True)
    bank_name = models.CharField(max_length=255, blank=True, null=True)
    upi_reference = models.CharField(max_length=100, blank=True, null=True)

    # Additional
    bardana_voucher = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        help_text="Bardana (packaging) voucher reference",
    )
    narration = models.TextField(blank=True, null=True)

    # Status & Adjustment
    status = models.CharField(
        max_length=15,
        choices=AdvanceStatus.choices,
        default=AdvanceStatus.ACTIVE,
    )
    adjusted_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    balance_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    # Ledger link
    ledger_entry = models.ForeignKey(
        PartyLedger,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="advance_entries",
    )

    # Audit fields
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cancelled_advances",
    )
    cancel_reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "loans_advance"
        verbose_name = "advance"
        verbose_name_plural = "advances"
        ordering = ["-date", "-advance_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "advance_no"],
                name="unique_organization_advance_no",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "date"]),
            models.Index(fields=["organization", "party"]),
            models.Index(fields=["organization", "status"]),
        ]

    def __str__(self):
        return f"Advance {self.advance_no} - {self.party_name}"

    def save(self, *args, **kwargs):
        # Auto-generate advance number if not set
        if not self.advance_no:
            from apps.system.services import SequenceService
            self.advance_no = SequenceService.get_next_number(self.organization, "ADVANCE", self.date.year)

        # Denormalize party name
        if self.party_id and not self.party_name:
            self.party_name = self.party.name

        # Calculate balance
        self.balance_amount = self.amount - self.adjusted_amount

        super().save(*args, **kwargs)



class LoanAgainstGoods(models.Model):
    """
    Loan Against Goods (Karz) - Loans secured by stored inventory.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="loans_against_goods",
    )
    loan_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated: LN/YYYY-NNNNN",
    )
    date = models.DateField(db_index=True)

    # Party
    party = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="loans_against_goods",
        help_text="Party taking the loan",
    )
    party_name = models.CharField(
        max_length=255,
        blank=True,
        help_text="Denormalized party name",
    )

    # Collateral
    amad = models.ForeignKey(
        Amad,
        on_delete=models.PROTECT,
        related_name="loans",
        help_text="Amad (stored goods) used as collateral",
    )
    amad_no = models.CharField(
        max_length=20,
        blank=True,
        help_text="Denormalized amad number",
    )

    # Amount & Interest
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("1.50"),
        help_text="Monthly interest rate percentage",
    )

    # Payment
    payment_mode = models.CharField(
        max_length=10,
        choices=PaymentMode.choices,
        default=PaymentMode.CASH,
    )
    cheque_number = models.CharField(max_length=50, blank=True, null=True)
    cheque_date = models.DateField(null=True, blank=True)
    bank_name = models.CharField(max_length=255, blank=True, null=True)
    upi_reference = models.CharField(max_length=100, blank=True, null=True)

    narration = models.TextField(blank=True, null=True)

    # Status & Repayment
    status = models.CharField(
        max_length=15,
        choices=LoanStatus.choices,
        default=LoanStatus.ACTIVE,
    )
    repaid_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    balance_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    accrued_interest = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    # Ledger link
    ledger_entry = models.ForeignKey(
        PartyLedger,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="loan_entries",
    )

    # Audit fields
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cancelled_loans",
    )
    cancel_reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "loans_loan_against_goods"
        verbose_name = "loan against goods"
        verbose_name_plural = "loans against goods"
        ordering = ["-date", "-loan_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "loan_no"],
                name="unique_organization_loan_no",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "date"]),
            models.Index(fields=["organization", "party"]),
            models.Index(fields=["organization", "status"]),
            models.Index(fields=["organization", "amad"]),
        ]

    def __str__(self):
        return f"Loan {self.loan_no} - {self.party_name}"

    def save(self, *args, **kwargs):
        # Auto-generate loan number if not set
        if not self.loan_no:
            from apps.system.services import SequenceService
            self.loan_no = SequenceService.get_next_number(self.organization, "LOAN", self.date.year)

        # Denormalize
        if self.party_id and not self.party_name:
            self.party_name = self.party.name
        if self.amad_id and not self.amad_no:
            self.amad_no = self.amad.amad_no

        # Calculate balance
        self.balance_amount = self.amount - self.repaid_amount

        super().save(*args, **kwargs)



class LoanLedger(models.Model):
    """
    Loan Ledger - Party-wise loan transaction history.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="loan_ledger_entries",
    )
    party = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="loan_ledger_entries",
    )
    serial_number = models.PositiveIntegerField(db_index=True)
    date = models.DateField(db_index=True)
    entry_type = models.CharField(
        max_length=5,
        choices=LoanLedgerType.choices,
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    interest_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    running_balance = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    # Reference
    amad = models.ForeignKey(
        Amad,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="loan_ledger_entries",
    )
    amad_no = models.CharField(max_length=20, blank=True, null=True)
    narration = models.TextField(blank=True, null=True)
    reference_type = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="ADVANCE, LOAN, or INTEREST",
    )
    reference_id = models.UUIDField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "loans_loan_ledger"
        verbose_name = "loan ledger entry"
        verbose_name_plural = "loan ledger entries"
        ordering = ["-date", "-serial_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "party", "serial_number"],
                name="unique_loan_ledger_serial",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "date"]),
            models.Index(fields=["party", "date"]),
        ]

    def __str__(self):
        return f"Loan Ledger #{self.serial_number} - {self.party.name}"

    def save(self, *args, **kwargs):
        if not self.serial_number:
            last_entry = LoanLedger.objects.filter(
                organization=self.organization,
                party=self.party,
            ).order_by("-serial_number").first()
            self.serial_number = (last_entry.serial_number + 1) if last_entry else 1

        super().save(*args, **kwargs)
