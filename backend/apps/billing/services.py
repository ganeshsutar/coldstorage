from dataclasses import dataclass
from decimal import Decimal
from typing import List, Optional

from django.db import transaction
from django.utils import timezone

from apps.accounting.models import Account, PartyLedger, VoucherType
from apps.inventory.models import Amad
from apps.masters.models import GstRate


@dataclass
class RentCalculation:
    """Data class for rent calculation result."""

    amad_no: str
    amad_date: any
    dispatch_date: any
    weight_qtl: Decimal
    storage_days: int
    grace_days: int
    billable_days: int
    rate_per_qtl: Decimal
    rent_amount: Decimal


class BillingService:
    """Service for billing operations."""

    def __init__(self, organization):
        self.organization = organization

    def get_billable_amads(self, party_id: Optional[str] = None) -> List[Amad]:
        """
        Get amads that are available for billing.

        An amad is billable if:
        - It has remaining stock (not fully dispatched) OR
        - It is fully dispatched but not yet billed
        """
        queryset = Amad.objects.filter(
            organization=self.organization,
        ).select_related("party", "commodity", "room")

        if party_id:
            queryset = queryset.filter(party_id=party_id)

        # Get amads that still have stock or haven't been billed
        # For simplicity, we'll return amads with remaining stock
        queryset = queryset.filter(is_fully_dispatched=False)

        return list(queryset.order_by("date", "amad_no"))

    def calculate_rent(
        self,
        amad: Amad,
        dispatch_date=None,
        grace_days: Optional[int] = None,
        rate_per_qtl: Optional[Decimal] = None,
    ) -> RentCalculation:
        """
        Calculate rent for an amad.

        Args:
            amad: The Amad record
            dispatch_date: Date of dispatch/billing (defaults to today)
            grace_days: Override grace days (defaults to amad's grace_days)
            rate_per_qtl: Override rate (defaults to amad's rent_rate)

        Returns:
            RentCalculation with all computed values
        """
        if dispatch_date is None:
            dispatch_date = timezone.now().date()

        if grace_days is None:
            grace_days = amad.grace_days

        if rate_per_qtl is None:
            rate_per_qtl = amad.rent_rate

        # Calculate days
        storage_days = (dispatch_date - amad.date).days
        billable_days = max(0, storage_days - grace_days)

        # Calculate weight in quintals
        weight_qtl = amad.total_weight / Decimal("100")

        # Calculate rent (monthly rate converted to daily)
        daily_rate = rate_per_qtl / Decimal("30")
        rent_amount = (weight_qtl * daily_rate * billable_days).quantize(Decimal("0.01"))

        return RentCalculation(
            amad_no=amad.amad_no,
            amad_date=amad.date,
            dispatch_date=dispatch_date,
            weight_qtl=weight_qtl,
            storage_days=storage_days,
            grace_days=grace_days,
            billable_days=billable_days,
            rate_per_qtl=rate_per_qtl,
            rent_amount=rent_amount,
        )

    def calculate_bill_amounts(
        self,
        rent_amount: Decimal,
        loading_charges: Decimal = Decimal("0.00"),
        unloading_charges: Decimal = Decimal("0.00"),
        dala_charges: Decimal = Decimal("0.00"),
        katai_charges: Decimal = Decimal("0.00"),
        insurance_amount: Decimal = Decimal("0.00"),
        reload_charges: Decimal = Decimal("0.00"),
        dump_charges: Decimal = Decimal("0.00"),
        other_charges: Decimal = Decimal("0.00"),
        discount_amount: Decimal = Decimal("0.00"),
        gst_rate: Optional[GstRate] = None,
        gst_type: str = "INTRA",
        tds_rate: Decimal = Decimal("0.00"),
    ) -> dict:
        """
        Calculate all bill amounts including GST and TDS.

        Returns dict with all computed values.
        """
        # Calculate taxable amount
        taxable_amount = (
            rent_amount
            + loading_charges
            + unloading_charges
            + dala_charges
            + katai_charges
            + insurance_amount
            + reload_charges
            + dump_charges
            + other_charges
            - discount_amount
        )

        # Get GST rates
        cgst_rate = gst_rate.cgst_rate if gst_rate else Decimal("9.00")
        sgst_rate = gst_rate.sgst_rate if gst_rate else Decimal("9.00")
        igst_rate = gst_rate.igst_rate if gst_rate else Decimal("18.00")

        # Calculate GST based on type
        if gst_type == "INTER":
            igst_amount = (taxable_amount * igst_rate / 100).quantize(Decimal("0.01"))
            cgst_amount = Decimal("0.00")
            sgst_amount = Decimal("0.00")
            total_gst = igst_amount
        else:
            cgst_amount = (taxable_amount * cgst_rate / 100).quantize(Decimal("0.01"))
            sgst_amount = (taxable_amount * sgst_rate / 100).quantize(Decimal("0.01"))
            igst_amount = Decimal("0.00")
            total_gst = cgst_amount + sgst_amount

        # Calculate TDS
        tds_amount = (taxable_amount * tds_rate / 100).quantize(Decimal("0.01"))

        # Calculate totals
        total_amount = taxable_amount + total_gst

        # Round off
        rounded_amount = round(total_amount)
        round_off = Decimal(str(rounded_amount)) - total_amount
        net_amount = Decimal(str(rounded_amount))

        # Balance (TDS is deducted from receivable)
        balance_amount = net_amount - tds_amount

        return {
            "taxable_amount": taxable_amount,
            "cgst_rate": cgst_rate,
            "cgst_amount": cgst_amount,
            "sgst_rate": sgst_rate,
            "sgst_amount": sgst_amount,
            "igst_rate": igst_rate,
            "igst_amount": igst_amount,
            "total_gst": total_gst,
            "tds_rate": tds_rate,
            "tds_amount": tds_amount,
            "total_amount": total_amount,
            "round_off": round_off,
            "net_amount": net_amount,
            "balance_amount": balance_amount,
        }

    @transaction.atomic
    def create_rent_bill(self, form_input: dict, user=None) -> "RentBillHeader":
        """
        Create a rent bill from wizard form input.

        Args:
            form_input: Dict with bill_date, party_id, gst_rate_id, gst_type,
                       charges, items, etc.
            user: User creating the bill

        Returns:
            Created RentBillHeader instance
        """
        from .models import (
            BillStatus,
            ChargeComponent,
            GstType,
            PriceBreakup,
            RentBillHeader,
            RentBillItem,
        )

        # Get party
        party = Account.objects.get(
            id=form_input["party_id"],
            organization=self.organization,
        )

        # Get GST rate
        gst_rate = None
        if form_input.get("gst_rate_id"):
            gst_rate = GstRate.objects.get(
                id=form_input["gst_rate_id"],
                organization=self.organization,
            )
        else:
            # Get default GST rate
            gst_rate = GstRate.objects.filter(
                organization=self.organization,
                is_default=True,
                is_active=True,
            ).first()

        # Calculate rent for each item
        items_data = form_input.get("items", [])
        total_rent = Decimal("0.00")
        item_calculations = []

        for item in items_data:
            amad = Amad.objects.get(
                id=item["amad_id"],
                organization=self.organization,
            )

            calc = self.calculate_rent(
                amad=amad,
                dispatch_date=item.get("dispatch_date") or form_input["bill_date"],
                grace_days=item.get("grace_days"),
                rate_per_qtl=item.get("rate_per_qtl"),
            )

            # Allow override of rent amount
            rent_amount = item.get("rent_amount") or calc.rent_amount
            total_rent += rent_amount

            item_calculations.append({
                "amad": amad,
                "calc": calc,
                "rent_amount": rent_amount,
                "dispatch_date": item.get("dispatch_date") or form_input["bill_date"],
            })

        # Create bill header
        bill = RentBillHeader(
            organization=self.organization,
            bill_date=form_input["bill_date"],
            party=party,
            gst_type=form_input.get("gst_type", GstType.INTRA_STATE),
            rent_amount=total_rent,
            loading_charges=form_input.get("loading_charges", Decimal("0.00")),
            unloading_charges=form_input.get("unloading_charges", Decimal("0.00")),
            dala_charges=form_input.get("dala_charges", Decimal("0.00")),
            katai_charges=form_input.get("katai_charges", Decimal("0.00")),
            insurance_amount=form_input.get("insurance_amount", Decimal("0.00")),
            reload_charges=form_input.get("reload_charges", Decimal("0.00")),
            dump_charges=form_input.get("dump_charges", Decimal("0.00")),
            other_charges=form_input.get("other_charges", Decimal("0.00")),
            discount_amount=form_input.get("discount_amount", Decimal("0.00")),
            tds_rate=form_input.get("tds_rate", Decimal("0.00")),
            notes=form_input.get("notes"),
            status=BillStatus.DRAFT,
        )

        if gst_rate:
            bill.apply_gst_rate(gst_rate)

        bill.save()

        # Create bill items
        for item_data in item_calculations:
            amad = item_data["amad"]
            calc = item_data["calc"]

            RentBillItem.objects.create(
                organization=self.organization,
                rent_bill=bill,
                amad=amad,
                dispatch_date=item_data["dispatch_date"],
                grace_days=calc.grace_days,
                rate_per_qtl=calc.rate_per_qtl,
                rent_amount=item_data["rent_amount"],
            )

        # Create price breakups
        self._create_price_breakups(bill)

        return bill

    def _create_price_breakups(self, bill: "RentBillHeader"):
        """Create price breakup records for a bill."""
        from .models import ChargeComponent, PriceBreakup

        breakups = []

        if bill.rent_amount > 0:
            breakups.append(PriceBreakup(
                organization=self.organization,
                rent_bill=bill,
                component=ChargeComponent.RENT,
                hsn_code=bill.gst_rate.hsn_code if bill.gst_rate else "996721",
                description="Cold Storage Rent",
                amount=bill.rent_amount,
            ))

        charge_mappings = [
            (ChargeComponent.LOADING, bill.loading_charges, "Loading Charges"),
            (ChargeComponent.UNLOADING, bill.unloading_charges, "Unloading Charges"),
            (ChargeComponent.DALA, bill.dala_charges, "Dala Charges"),
            (ChargeComponent.KATAI, bill.katai_charges, "Katai Charges"),
            (ChargeComponent.INSURANCE, bill.insurance_amount, "Insurance"),
            (ChargeComponent.RELOAD, bill.reload_charges, "Reload Charges"),
            (ChargeComponent.DUMP, bill.dump_charges, "Dump Charges"),
            (ChargeComponent.OTHER, bill.other_charges, "Other Charges"),
        ]

        for component, amount, description in charge_mappings:
            if amount > 0:
                breakups.append(PriceBreakup(
                    organization=self.organization,
                    rent_bill=bill,
                    component=component,
                    description=description,
                    amount=amount,
                ))

        PriceBreakup.objects.bulk_create(breakups)

    @transaction.atomic
    def confirm_bill(self, bill_id: str, user=None) -> "RentBillHeader":
        """
        Confirm a draft bill and create ledger entry.

        Args:
            bill_id: UUID of the bill
            user: User confirming the bill

        Returns:
            Updated RentBillHeader instance
        """
        from .models import BillStatus, RentBillHeader

        bill = RentBillHeader.objects.get(
            id=bill_id,
            organization=self.organization,
        )

        if bill.status != BillStatus.DRAFT:
            raise ValueError(f"Cannot confirm bill in status: {bill.status}")

        # Create ledger entry
        ledger_entry = PartyLedger.objects.create(
            organization=self.organization,
            account=bill.party,
            voucher_type=VoucherType.JV,
            voucher_number=bill.bill_no,
            date=bill.bill_date,
            narration=f"Rent Bill {bill.bill_no}",
            amount=bill.net_amount,
            principal_amount=bill.taxable_amount,
            other_charges=bill.total_gst,
        )

        # Update bill
        bill.status = BillStatus.CONFIRMED
        bill.confirmed_at = timezone.now()
        bill.confirmed_by = user
        bill.ledger_entry = ledger_entry
        bill.save()

        # Update party account balance
        bill.party.recalculate_balance()

        return bill

    @transaction.atomic
    def cancel_bill(self, bill_id: str, reason: str, user=None) -> "RentBillHeader":
        """
        Cancel a bill.

        Args:
            bill_id: UUID of the bill
            reason: Cancellation reason
            user: User cancelling the bill

        Returns:
            Updated RentBillHeader instance
        """
        from .models import BillStatus, RentBillHeader

        bill = RentBillHeader.objects.get(
            id=bill_id,
            organization=self.organization,
        )

        if bill.status == BillStatus.CANCELLED:
            raise ValueError("Bill is already cancelled")

        if bill.paid_amount > 0:
            raise ValueError("Cannot cancel bill with payments. Reverse payments first.")

        # If bill was confirmed, reverse the ledger entry
        if bill.ledger_entry:
            # Create reversal entry
            PartyLedger.objects.create(
                organization=self.organization,
                account=bill.party,
                voucher_type=VoucherType.JV,
                voucher_number=f"{bill.bill_no}-REV",
                date=timezone.now().date(),
                narration=f"Reversal of Rent Bill {bill.bill_no}: {reason}",
                amount=-bill.net_amount,
                principal_amount=-bill.taxable_amount,
                other_charges=-bill.total_gst,
            )
            bill.party.recalculate_balance()

        bill.status = BillStatus.CANCELLED
        bill.cancelled_at = timezone.now()
        bill.cancelled_by = user
        bill.cancel_reason = reason
        bill.save()

        return bill

    @transaction.atomic
    def create_receipt(self, form_input: dict, user=None) -> "Receipt":
        """
        Create a receipt and optionally allocate to bills.

        Args:
            form_input: Dict with receipt details and allocations
            user: User creating the receipt

        Returns:
            Created Receipt instance
        """
        from .models import BillStatus, Receipt, ReceiptAllocation, RentBillHeader

        # Get party
        party = Account.objects.get(
            id=form_input["party_id"],
            organization=self.organization,
        )

        # Create receipt
        receipt = Receipt(
            organization=self.organization,
            receipt_date=form_input["receipt_date"],
            party=party,
            amount=form_input["amount"],
            payment_mode=form_input.get("payment_mode", "CASH"),
            cheque_no=form_input.get("cheque_no"),
            cheque_date=form_input.get("cheque_date"),
            bank_name=form_input.get("bank_name"),
            branch_name=form_input.get("branch_name"),
            is_pdc=form_input.get("is_pdc", False),
            bank_ref_no=form_input.get("bank_ref_no"),
            upi_ref_no=form_input.get("upi_ref_no"),
            narration=form_input.get("narration"),
            status=BillStatus.DRAFT,
        )

        # Convert amount to words
        receipt.amount_in_words = self._amount_to_words(form_input["amount"])
        receipt.save()

        # Create allocations
        allocations = form_input.get("allocations", [])
        for alloc in allocations:
            rent_bill = RentBillHeader.objects.get(
                id=alloc["rent_bill_id"],
                organization=self.organization,
            )
            ReceiptAllocation.objects.create(
                organization=self.organization,
                receipt=receipt,
                rent_bill=rent_bill,
                allocated_amount=alloc["allocated_amount"],
            )

        return receipt

    @transaction.atomic
    def confirm_receipt(self, receipt_id: str, user=None) -> "Receipt":
        """
        Confirm a receipt and update bill payments.

        Args:
            receipt_id: UUID of the receipt
            user: User confirming the receipt

        Returns:
            Updated Receipt instance
        """
        from .models import BillStatus, Receipt

        receipt = Receipt.objects.get(
            id=receipt_id,
            organization=self.organization,
        )

        if receipt.status != BillStatus.DRAFT:
            raise ValueError(f"Cannot confirm receipt in status: {receipt.status}")

        # Create ledger entry (credit entry for receipt)
        ledger_entry = PartyLedger.objects.create(
            organization=self.organization,
            account=receipt.party,
            voucher_type=VoucherType.CR,
            voucher_number=receipt.receipt_no,
            date=receipt.receipt_date,
            narration=f"Receipt {receipt.receipt_no} - {receipt.get_payment_mode_display()}",
            amount=receipt.amount,
            principal_amount=receipt.amount,
        )

        receipt.status = BillStatus.CONFIRMED
        receipt.confirmed_at = timezone.now()
        receipt.confirmed_by = user
        receipt.ledger_entry = ledger_entry
        receipt.is_cleared = receipt.payment_mode != "CHEQUE" or not receipt.is_pdc
        receipt.save()

        # Update allocated bills
        for allocation in receipt.allocations.all():
            allocation._update_bill_paid_amount()

        # Update party balance
        receipt.party.recalculate_balance()

        return receipt

    @transaction.atomic
    def cancel_receipt(self, receipt_id: str, reason: str, user=None) -> "Receipt":
        """
        Cancel a receipt and reverse allocations.

        Args:
            receipt_id: UUID of the receipt
            reason: Cancellation reason
            user: User cancelling the receipt

        Returns:
            Updated Receipt instance
        """
        from .models import BillStatus, Receipt

        receipt = Receipt.objects.get(
            id=receipt_id,
            organization=self.organization,
        )

        if receipt.status == BillStatus.CANCELLED:
            raise ValueError("Receipt is already cancelled")

        # Store bills to update
        bills_to_update = [alloc.rent_bill for alloc in receipt.allocations.all()]

        # Delete allocations
        receipt.allocations.all().delete()

        # Recalculate bill payments
        for bill in bills_to_update:
            bill.paid_amount = Decimal("0.00")
            bill.save()

        # Reverse ledger entry if confirmed
        if receipt.ledger_entry:
            PartyLedger.objects.create(
                organization=self.organization,
                account=receipt.party,
                voucher_type=VoucherType.DR,
                voucher_number=f"{receipt.receipt_no}-REV",
                date=timezone.now().date(),
                narration=f"Reversal of Receipt {receipt.receipt_no}: {reason}",
                amount=receipt.amount,
                principal_amount=receipt.amount,
            )
            receipt.party.recalculate_balance()

        receipt.status = BillStatus.CANCELLED
        receipt.cancelled_at = timezone.now()
        receipt.cancelled_by = user
        receipt.cancel_reason = reason
        receipt.save()

        return receipt

    def get_party_outstanding(self, party_id: str) -> dict:
        """
        Get outstanding bills for a party.

        Returns dict with party info, bills, and totals.
        """
        from .models import BillStatus, RentBillHeader

        party = Account.objects.get(
            id=party_id,
            organization=self.organization,
        )

        bills = RentBillHeader.objects.filter(
            organization=self.organization,
            party=party,
            status__in=[BillStatus.CONFIRMED, BillStatus.PARTIAL_PAID],
        ).order_by("bill_date", "bill_no")

        total_amount = sum(b.net_amount for b in bills)
        paid_amount = sum(b.paid_amount for b in bills)
        outstanding = total_amount - paid_amount

        return {
            "party_id": str(party.id),
            "party_code": party.code,
            "party_name": party.name,
            "total_bills": bills.count(),
            "total_amount": total_amount,
            "paid_amount": paid_amount,
            "outstanding_amount": outstanding,
            "bills": list(bills),
        }

    def get_billing_stats(self) -> dict:
        """Get billing statistics for dashboard."""
        from django.db.models import Sum

        from .models import BillStatus, Receipt, RentBillHeader

        today = timezone.now().date()
        month_start = today.replace(day=1)

        # Bills this month
        bills_this_month = RentBillHeader.objects.filter(
            organization=self.organization,
            bill_date__gte=month_start,
            status__in=[BillStatus.CONFIRMED, BillStatus.PARTIAL_PAID, BillStatus.PAID],
        )

        bills_count = bills_this_month.count()
        bills_amount = bills_this_month.aggregate(total=Sum("net_amount"))["total"] or Decimal("0.00")

        # Pending amount (all unpaid)
        pending = RentBillHeader.objects.filter(
            organization=self.organization,
            status__in=[BillStatus.CONFIRMED, BillStatus.PARTIAL_PAID],
        ).aggregate(total=Sum("balance_amount"))["total"] or Decimal("0.00")

        # Collections this month
        collections = Receipt.objects.filter(
            organization=self.organization,
            receipt_date__gte=month_start,
            status__in=[BillStatus.CONFIRMED, BillStatus.PAID],
        ).aggregate(total=Sum("amount"))["total"] or Decimal("0.00")

        # GST payable this month
        gst_payable = bills_this_month.aggregate(total=Sum("total_gst"))["total"] or Decimal("0.00")

        return {
            "bills_this_month": bills_count,
            "bills_amount": bills_amount,
            "pending_amount": pending,
            "collections_this_month": collections,
            "gst_payable": gst_payable,
        }

    def _amount_to_words(self, amount: Decimal) -> str:
        """Convert amount to words in Indian format."""
        ones = [
            "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
            "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
            "Seventeen", "Eighteen", "Nineteen"
        ]
        tens = [
            "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
        ]

        def two_digit(n):
            if n < 20:
                return ones[n]
            return tens[n // 10] + (" " + ones[n % 10] if n % 10 else "")

        def three_digit(n):
            if n < 100:
                return two_digit(n)
            return ones[n // 100] + " Hundred" + (" and " + two_digit(n % 100) if n % 100 else "")

        amount = int(amount)
        if amount == 0:
            return "Zero Rupees Only"

        crore = amount // 10000000
        amount %= 10000000
        lakh = amount // 100000
        amount %= 100000
        thousand = amount // 1000
        amount %= 1000
        hundred = amount

        result = []
        if crore:
            result.append(three_digit(crore) + " Crore")
        if lakh:
            result.append(two_digit(lakh) + " Lakh")
        if thousand:
            result.append(two_digit(thousand) + " Thousand")
        if hundred:
            result.append(three_digit(hundred))

        return "Rupees " + " ".join(result) + " Only"
