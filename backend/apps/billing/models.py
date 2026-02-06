import uuid
from decimal import Decimal

from django.db import models

from apps.accounting.models import Account, PartyLedger
from apps.authentication.models import Organization
from apps.inventory.models import Amad
from apps.masters.models import GstRate


class BillStatus(models.TextChoices):
    """Status of a rent bill."""

    DRAFT = "DRAFT", "Draft"
    CONFIRMED = "CONFIRMED", "Confirmed"
    PARTIAL_PAID = "PARTIAL_PAID", "Partially Paid"
    PAID = "PAID", "Paid"
    CANCELLED = "CANCELLED", "Cancelled"


class GstType(models.TextChoices):
    """Type of GST transaction."""

    INTRA_STATE = "INTRA", "Intra-State (CGST + SGST)"
    INTER_STATE = "INTER", "Inter-State (IGST)"


class PaymentMode(models.TextChoices):
    """Mode of payment for receipts."""

    CASH = "CASH", "Cash"
    CHEQUE = "CHEQUE", "Cheque"
    BANK = "BANK", "Bank Transfer"
    UPI = "UPI", "UPI"


class ChargeComponent(models.TextChoices):
    """Types of charge components in bills."""

    RENT = "RENT", "Storage Rent"
    LOADING = "LOADING", "Loading Charges"
    UNLOADING = "UNLOADING", "Unloading Charges"
    DALA = "DALA", "Dala Charges"
    KATAI = "KATAI", "Katai Charges"
    INSURANCE = "INSURANCE", "Insurance"
    RELOAD = "RELOAD", "Reload Charges"
    DUMP = "DUMP", "Dump Charges"
    OTHER = "OTHER", "Other Charges"


class RentBillHeader(models.Model):
    """
    Rent Bill Header (KB_He) - Main billing document for cold storage rent.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="rent_bills",
    )
    bill_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated: KB/YYYY-NNNNN",
    )
    bill_date = models.DateField(db_index=True)

    # Party information (denormalized for historical accuracy)
    party = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="rent_bills",
        help_text="Party account",
    )
    party_name = models.CharField(max_length=255)
    party_gstin = models.CharField(max_length=20, blank=True, null=True)
    party_state = models.CharField(max_length=100, blank=True, null=True)

    # Charge amounts
    rent_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Total storage rent",
    )
    loading_charges = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    unloading_charges = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    dala_charges = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    katai_charges = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    insurance_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    reload_charges = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    dump_charges = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    other_charges = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    # Discount
    discount_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    # Computed taxable amount
    taxable_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Total before GST",
    )

    # GST details (rates denormalized for historical accuracy)
    gst_rate = models.ForeignKey(
        GstRate,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="rent_bills",
        help_text="GST rate applied",
    )
    gst_type = models.CharField(
        max_length=10,
        choices=GstType.choices,
        default=GstType.INTRA_STATE,
    )
    cgst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    cgst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    sgst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    sgst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    igst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    igst_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    total_gst = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    # TDS (Tax Deducted at Source)
    tds_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    tds_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    # Final amounts
    total_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Taxable + GST",
    )
    round_off = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    net_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Total after rounding",
    )

    # Payment tracking
    paid_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    balance_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    # Status
    status = models.CharField(
        max_length=15,
        choices=BillStatus.choices,
        default=BillStatus.DRAFT,
    )

    # Audit fields
    confirmed_at = models.DateTimeField(null=True, blank=True)
    confirmed_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="confirmed_rent_bills",
    )
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cancelled_rent_bills",
    )
    cancel_reason = models.TextField(blank=True, null=True)

    # Notes
    notes = models.TextField(blank=True, null=True)

    # Ledger entry
    ledger_entry = models.ForeignKey(
        PartyLedger,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="rent_bill_entries",
        help_text="Associated ledger entry",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "billing_rent_bill_header"
        verbose_name = "Rent Bill"
        verbose_name_plural = "Rent Bills"
        ordering = ["-bill_date", "-bill_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "bill_no"],
                name="unique_organization_bill_no",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "bill_date"]),
            models.Index(fields=["organization", "party"]),
            models.Index(fields=["organization", "status"]),
        ]

    def __str__(self):
        return f"Bill {self.bill_no} - {self.party_name}"

    def save(self, *args, **kwargs):
        # Auto-generate bill number if not set
        if not self.bill_no:
            from apps.system.services import SequenceService
            self.bill_no = SequenceService.get_next_number(self.organization, "RENT_BILL", self.bill_date.year)

        # Denormalize party info
        if self.party:
            self.party_name = self.party.name
            self.party_gstin = self.party.gst_number
            self.party_state = self.party.state

        # Calculate taxable amount
        self.taxable_amount = (
            self.rent_amount
            + self.loading_charges
            + self.unloading_charges
            + self.dala_charges
            + self.katai_charges
            + self.insurance_amount
            + self.reload_charges
            + self.dump_charges
            + self.other_charges
            - self.discount_amount
        )

        # Calculate GST
        if self.gst_type == GstType.INTER_STATE:
            self.igst_amount = (self.taxable_amount * self.igst_rate / 100).quantize(Decimal("0.01"))
            self.cgst_amount = Decimal("0.00")
            self.sgst_amount = Decimal("0.00")
            self.total_gst = self.igst_amount
        else:
            self.cgst_amount = (self.taxable_amount * self.cgst_rate / 100).quantize(Decimal("0.01"))
            self.sgst_amount = (self.taxable_amount * self.sgst_rate / 100).quantize(Decimal("0.01"))
            self.igst_amount = Decimal("0.00")
            self.total_gst = self.cgst_amount + self.sgst_amount

        # Calculate TDS
        self.tds_amount = (self.taxable_amount * self.tds_rate / 100).quantize(Decimal("0.01"))

        # Calculate totals
        self.total_amount = self.taxable_amount + self.total_gst

        # Round off to nearest rupee
        rounded_amount = round(self.total_amount)
        self.round_off = Decimal(str(rounded_amount)) - self.total_amount
        self.net_amount = Decimal(str(rounded_amount))

        # Update balance
        self.balance_amount = self.net_amount - self.paid_amount - self.tds_amount

        # Update status based on payment
        if self.status not in [BillStatus.DRAFT, BillStatus.CANCELLED]:
            if self.balance_amount <= 0:
                self.status = BillStatus.PAID
            elif self.paid_amount > 0:
                self.status = BillStatus.PARTIAL_PAID

        super().save(*args, **kwargs)

    def apply_gst_rate(self, gst_rate):
        """Apply a GST rate to this bill."""
        self.gst_rate = gst_rate
        self.cgst_rate = gst_rate.cgst_rate
        self.sgst_rate = gst_rate.sgst_rate
        self.igst_rate = gst_rate.igst_rate


class RentBillItem(models.Model):
    """
    Rent Bill Item (KB_Trn) - Line items for each Amad in a rent bill.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="rent_bill_items",
    )
    rent_bill = models.ForeignKey(
        RentBillHeader,
        on_delete=models.CASCADE,
        related_name="items",
    )
    amad = models.ForeignKey(
        Amad,
        on_delete=models.PROTECT,
        related_name="bill_items",
    )

    # Denormalized amad info
    amad_no = models.CharField(max_length=20)
    amad_date = models.DateField()
    commodity_name = models.CharField(max_length=255)
    party_name = models.CharField(max_length=255)

    # Quantities
    pkt1 = models.PositiveIntegerField(default=0)
    pkt2 = models.PositiveIntegerField(default=0)
    pkt3 = models.PositiveIntegerField(default=0)
    total_packets = models.PositiveIntegerField(default=0)
    weight_qtl = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Weight in quintals",
    )

    # Billing calculation
    arrival_date = models.DateField()
    dispatch_date = models.DateField(null=True, blank=True)
    storage_days = models.PositiveIntegerField(default=0)
    grace_days = models.PositiveIntegerField(default=0)
    billable_days = models.PositiveIntegerField(default=0)

    # Rates and amounts
    rate_per_qtl = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Rent rate per quintal per month",
    )
    rate_per_bag = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Rent rate per bag",
    )
    rent_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "billing_rent_bill_item"
        verbose_name = "Rent Bill Item"
        verbose_name_plural = "Rent Bill Items"
        ordering = ["amad_date", "amad_no"]
        indexes = [
            models.Index(fields=["organization"]),
            models.Index(fields=["rent_bill"]),
            models.Index(fields=["amad"]),
        ]

    def __str__(self):
        return f"Item: {self.amad_no} in Bill {self.rent_bill.bill_no}"

    def save(self, *args, **kwargs):
        # Denormalize amad info
        if self.amad:
            self.amad_no = self.amad.amad_no
            self.amad_date = self.amad.date
            self.commodity_name = self.amad.commodity.name if self.amad.commodity else ""
            self.party_name = self.amad.party.name if self.amad.party else ""
            self.arrival_date = self.amad.date

            # Copy packet counts if not set
            if self.total_packets == 0:
                self.pkt1 = self.amad.pkt1
                self.pkt2 = self.amad.pkt2
                self.pkt3 = self.amad.pkt3
                self.total_packets = self.amad.total_packets
                self.weight_qtl = self.amad.total_weight / 100  # kg to quintals

        # Calculate billable days
        if self.dispatch_date and self.arrival_date:
            self.storage_days = (self.dispatch_date - self.arrival_date).days
            self.billable_days = max(0, self.storage_days - self.grace_days)

        super().save(*args, **kwargs)


class PriceBreakup(models.Model):
    """
    Price Breakup (PBrk) - Detailed breakdown of charges in a bill.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="price_breakups",
    )
    rent_bill = models.ForeignKey(
        RentBillHeader,
        on_delete=models.CASCADE,
        related_name="breakups",
    )
    component = models.CharField(
        max_length=20,
        choices=ChargeComponent.choices,
    )
    hsn_code = models.CharField(max_length=20, blank=True, null=True)
    description = models.CharField(max_length=255, blank=True, null=True)
    rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    quantity = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    unit = models.CharField(max_length=20, blank=True, null=True)
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "billing_price_breakup"
        verbose_name = "Price Breakup"
        verbose_name_plural = "Price Breakups"
        ordering = ["component"]
        indexes = [
            models.Index(fields=["organization"]),
            models.Index(fields=["rent_bill"]),
        ]

    def __str__(self):
        return f"{self.get_component_display()}: {self.amount}"


class Receipt(models.Model):
    """
    Receipt (Rect) - Payment receipt against rent bills.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="receipts",
    )
    receipt_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated: RV/YYYY-NNNNN",
    )
    receipt_date = models.DateField(db_index=True)

    # Party
    party = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="receipts",
    )

    # Amount
    amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
    )
    amount_in_words = models.CharField(max_length=500, blank=True, null=True)

    # Payment details
    payment_mode = models.CharField(
        max_length=10,
        choices=PaymentMode.choices,
        default=PaymentMode.CASH,
    )

    # Cheque details
    cheque_no = models.CharField(max_length=50, blank=True, null=True)
    cheque_date = models.DateField(null=True, blank=True)
    bank_name = models.CharField(max_length=255, blank=True, null=True)
    branch_name = models.CharField(max_length=255, blank=True, null=True)
    is_pdc = models.BooleanField(
        default=False,
        help_text="Is Post Dated Cheque?",
    )
    is_cleared = models.BooleanField(
        default=True,
        help_text="Has the cheque cleared?",
    )

    # Bank transfer details
    bank_ref_no = models.CharField(max_length=100, blank=True, null=True)
    upi_ref_no = models.CharField(max_length=100, blank=True, null=True)

    # Narration
    narration = models.TextField(blank=True, null=True)

    # Status
    status = models.CharField(
        max_length=15,
        choices=BillStatus.choices,
        default=BillStatus.DRAFT,
    )

    # Audit fields
    confirmed_at = models.DateTimeField(null=True, blank=True)
    confirmed_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="confirmed_receipts",
    )
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cancelled_receipts",
    )
    cancel_reason = models.TextField(blank=True, null=True)

    # Ledger entry
    ledger_entry = models.ForeignKey(
        PartyLedger,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="receipt_entries",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "billing_receipt"
        verbose_name = "Receipt"
        verbose_name_plural = "Receipts"
        ordering = ["-receipt_date", "-receipt_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "receipt_no"],
                name="unique_organization_receipt_no",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "receipt_date"]),
            models.Index(fields=["organization", "party"]),
            models.Index(fields=["organization", "status"]),
        ]

    def __str__(self):
        return f"Receipt {self.receipt_no} - {self.party.name}"

    def save(self, *args, **kwargs):
        # Auto-generate receipt number if not set
        if not self.receipt_no:
            from apps.system.services import SequenceService
            self.receipt_no = SequenceService.get_next_number(self.organization, "RECEIPT", self.receipt_date.year)

        super().save(*args, **kwargs)



class ReceiptAllocation(models.Model):
    """
    Receipt Allocation - Links receipts to specific rent bills.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="receipt_allocations",
    )
    receipt = models.ForeignKey(
        Receipt,
        on_delete=models.CASCADE,
        related_name="allocations",
    )
    rent_bill = models.ForeignKey(
        RentBillHeader,
        on_delete=models.PROTECT,
        related_name="receipt_allocations",
    )
    allocated_amount = models.DecimalField(
        max_digits=15,
        decimal_places=2,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "billing_receipt_allocation"
        verbose_name = "Receipt Allocation"
        verbose_name_plural = "Receipt Allocations"
        constraints = [
            models.UniqueConstraint(
                fields=["receipt", "rent_bill"],
                name="unique_receipt_bill_allocation",
            )
        ]
        indexes = [
            models.Index(fields=["organization"]),
            models.Index(fields=["receipt"]),
            models.Index(fields=["rent_bill"]),
        ]

    def __str__(self):
        return f"{self.receipt.receipt_no} -> {self.rent_bill.bill_no}: {self.allocated_amount}"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Update the bill's paid amount
        self._update_bill_paid_amount()

    def delete(self, *args, **kwargs):
        rent_bill = self.rent_bill
        super().delete(*args, **kwargs)
        # Recalculate bill paid amount after deletion
        self._recalculate_bill_paid(rent_bill)

    def _update_bill_paid_amount(self):
        """Update the associated bill's paid amount."""
        self._recalculate_bill_paid(self.rent_bill)

    def _recalculate_bill_paid(self, rent_bill):
        """Recalculate and update a bill's paid amount from all allocations."""
        from django.db.models import Sum

        total_paid = ReceiptAllocation.objects.filter(
            rent_bill=rent_bill,
            receipt__status__in=[BillStatus.CONFIRMED, BillStatus.PAID],
        ).aggregate(total=Sum("allocated_amount"))["total"] or Decimal("0.00")

        rent_bill.paid_amount = total_paid
        rent_bill.save(update_fields=["paid_amount", "balance_amount", "status", "updated_at"])
