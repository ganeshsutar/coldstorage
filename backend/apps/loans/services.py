from decimal import Decimal

from django.db import transaction
from django.db.models import Count, Q, Sum
from django.utils import timezone

from apps.accounting.models import Account, PartyLedger, VoucherType
from apps.inventory.models import Amad


class LoanService:
    """Service for loan and advance operations."""

    def __init__(self, organization):
        self.organization = organization

    @transaction.atomic
    def create_advance(self, form_input: dict, user=None):
        """Create a new pre-season advance (Pesgi)."""
        from .models import Advance, AdvanceStatus, LoanLedger, LoanLedgerType

        party = Account.objects.get(
            id=form_input["party_id"],
            organization=self.organization,
        )

        advance = Advance(
            organization=self.organization,
            date=form_input["date"],
            expected_date=form_input.get("expected_date"),
            party=party,
            party_name=party.name,
            bags=form_input.get("bags", 0),
            amount=form_input["amount"],
            payment_mode=form_input.get("payment_mode", "CASH"),
            cheque_number=form_input.get("cheque_number"),
            cheque_date=form_input.get("cheque_date"),
            bank_name=form_input.get("bank_name"),
            upi_reference=form_input.get("upi_reference"),
            bardana_voucher=form_input.get("bardana_voucher"),
            narration=form_input.get("narration", ""),
            status=AdvanceStatus.ACTIVE,
        )
        advance.save()

        # Create party ledger entry (debit - money given to party)
        ledger_entry = PartyLedger.objects.create(
            organization=self.organization,
            account=party,
            voucher_type=VoucherType.DR,
            voucher_number=advance.advance_no,
            date=advance.date,
            narration=f"Advance (Pesgi) - {advance.advance_no}",
            amount=advance.amount,
            principal_amount=advance.amount,
        )
        advance.ledger_entry = ledger_entry
        advance.save(update_fields=["ledger_entry", "updated_at"])

        # Create loan ledger entry
        LoanLedger.objects.create(
            organization=self.organization,
            party=party,
            date=advance.date,
            entry_type=LoanLedgerType.DR,
            amount=advance.amount,
            narration=f"Advance (Pesgi) - {advance.advance_no}",
            reference_type="ADVANCE",
            reference_id=advance.id,
            running_balance=self._get_party_running_balance(party) + advance.amount,
        )

        # Recalculate party balance
        party.recalculate_balance()

        return advance

    @transaction.atomic
    def cancel_advance(self, advance_id: str, reason: str, user=None):
        """Cancel an advance and create reversal entries."""
        from .models import Advance, AdvanceStatus, LoanLedger, LoanLedgerType

        advance = Advance.objects.get(
            id=advance_id,
            organization=self.organization,
        )

        if advance.status == AdvanceStatus.CANCELLED:
            raise ValueError("Advance is already cancelled")

        if advance.adjusted_amount > 0:
            raise ValueError("Cannot cancel advance with existing adjustments")

        # Create reversal party ledger entry
        PartyLedger.objects.create(
            organization=self.organization,
            account=advance.party,
            voucher_type=VoucherType.CR,
            voucher_number=advance.advance_no,
            date=timezone.now().date(),
            narration=f"Reversal - Advance {advance.advance_no} cancelled: {reason}",
            amount=advance.amount,
            principal_amount=advance.amount,
        )

        # Create reversal loan ledger entry
        LoanLedger.objects.create(
            organization=self.organization,
            party=advance.party,
            date=timezone.now().date(),
            entry_type=LoanLedgerType.CR,
            amount=advance.amount,
            narration=f"Reversal - Advance {advance.advance_no} cancelled",
            reference_type="ADVANCE",
            reference_id=advance.id,
            running_balance=self._get_party_running_balance(advance.party) - advance.amount,
        )

        advance.status = AdvanceStatus.CANCELLED
        advance.cancelled_at = timezone.now()
        advance.cancelled_by = user
        advance.cancel_reason = reason
        advance.save()

        # Recalculate party balance
        advance.party.recalculate_balance()

        return advance

    @transaction.atomic
    def create_loan(self, form_input: dict, user=None):
        """Create a new loan against stored goods (Karz)."""
        from .models import LoanAgainstGoods, LoanLedger, LoanLedgerType, LoanStatus

        party = Account.objects.get(
            id=form_input["party_id"],
            organization=self.organization,
        )
        amad = Amad.objects.get(
            id=form_input["amad_id"],
            organization=self.organization,
        )

        # Validate amad belongs to the party
        if str(amad.party_id) != str(party.id):
            raise ValueError("Selected amad does not belong to the specified party")

        # Validate amad is not fully dispatched
        if amad.is_fully_dispatched:
            raise ValueError("Cannot create loan against fully dispatched goods")

        loan = LoanAgainstGoods(
            organization=self.organization,
            date=form_input["date"],
            party=party,
            party_name=party.name,
            amad=amad,
            amad_no=amad.amad_no,
            amount=form_input["amount"],
            interest_rate=form_input.get("interest_rate", Decimal("1.50")),
            payment_mode=form_input.get("payment_mode", "CASH"),
            cheque_number=form_input.get("cheque_number"),
            cheque_date=form_input.get("cheque_date"),
            bank_name=form_input.get("bank_name"),
            upi_reference=form_input.get("upi_reference"),
            narration=form_input.get("narration", ""),
            status=LoanStatus.ACTIVE,
        )
        loan.save()

        # Create party ledger entry (debit - money given to party)
        ledger_entry = PartyLedger.objects.create(
            organization=self.organization,
            account=party,
            voucher_type=VoucherType.DR,
            voucher_number=loan.loan_no,
            date=loan.date,
            narration=f"Loan against goods - {loan.loan_no} (Amad: {amad.amad_no})",
            amount=loan.amount,
            principal_amount=loan.amount,
        )
        loan.ledger_entry = ledger_entry
        loan.save(update_fields=["ledger_entry", "updated_at"])

        # Create loan ledger entry
        LoanLedger.objects.create(
            organization=self.organization,
            party=party,
            date=loan.date,
            entry_type=LoanLedgerType.DR,
            amount=loan.amount,
            interest_rate=loan.interest_rate,
            amad=amad,
            amad_no=amad.amad_no,
            narration=f"Loan against goods - {loan.loan_no}",
            reference_type="LOAN",
            reference_id=loan.id,
            running_balance=self._get_party_running_balance(party) + loan.amount,
        )

        # Recalculate party balance
        party.recalculate_balance()

        return loan

    @transaction.atomic
    def cancel_loan(self, loan_id: str, reason: str, user=None):
        """Cancel a loan and create reversal entries."""
        from .models import LoanAgainstGoods, LoanLedger, LoanLedgerType, LoanStatus

        loan = LoanAgainstGoods.objects.get(
            id=loan_id,
            organization=self.organization,
        )

        if loan.status == LoanStatus.CANCELLED:
            raise ValueError("Loan is already cancelled")

        if loan.repaid_amount > 0:
            raise ValueError("Cannot cancel loan with existing repayments")

        # Create reversal party ledger entry
        PartyLedger.objects.create(
            organization=self.organization,
            account=loan.party,
            voucher_type=VoucherType.CR,
            voucher_number=loan.loan_no,
            date=timezone.now().date(),
            narration=f"Reversal - Loan {loan.loan_no} cancelled: {reason}",
            amount=loan.amount,
            principal_amount=loan.amount,
        )

        # Create reversal loan ledger entry
        LoanLedger.objects.create(
            organization=self.organization,
            party=loan.party,
            date=timezone.now().date(),
            entry_type=LoanLedgerType.CR,
            amount=loan.amount,
            narration=f"Reversal - Loan {loan.loan_no} cancelled",
            reference_type="LOAN",
            reference_id=loan.id,
            running_balance=self._get_party_running_balance(loan.party) - loan.amount,
        )

        loan.status = LoanStatus.CANCELLED
        loan.cancelled_at = timezone.now()
        loan.cancelled_by = user
        loan.cancel_reason = reason
        loan.save()

        # Recalculate party balance
        loan.party.recalculate_balance()

        return loan

    def calculate_interest(self, party_id=None, to_date=None):
        """Calculate interest on active loans. Returns list of interest items."""
        from .models import LoanAgainstGoods, LoanStatus

        if to_date is None:
            to_date = timezone.now().date()

        queryset = LoanAgainstGoods.objects.filter(
            organization=self.organization,
            status__in=[LoanStatus.ACTIVE, LoanStatus.PARTIAL],
        )
        if party_id:
            queryset = queryset.filter(party_id=party_id)

        results = []
        for loan in queryset.select_related("party", "amad"):
            days = (to_date - loan.date).days
            if days <= 0:
                continue

            # Interest = Principal x Rate x Days / (360 x 100)
            interest = (loan.balance_amount * loan.interest_rate * days / (Decimal("360") * Decimal("100"))).quantize(Decimal("0.01"))

            results.append({
                "loan_id": str(loan.id),
                "loan_no": loan.loan_no,
                "party_id": str(loan.party_id),
                "party_name": loan.party_name,
                "amad_no": loan.amad_no,
                "principal": loan.balance_amount,
                "interest_rate": loan.interest_rate,
                "days": days,
                "interest": interest,
                "from_date": str(loan.date),
                "to_date": str(to_date),
            })

        return results

    def get_loan_stats(self) -> dict:
        """Get loan statistics for dashboard KPI cards."""
        from .models import Advance, AdvanceStatus, LoanAgainstGoods, LoanStatus

        # Active advances
        active_advances = Advance.objects.filter(
            organization=self.organization,
            status=AdvanceStatus.ACTIVE,
        ).aggregate(
            count=Count("id"),
            total_amount=Sum("amount"),
            total_balance=Sum("balance_amount"),
        )

        # Active loans
        active_loans = LoanAgainstGoods.objects.filter(
            organization=self.organization,
            status__in=[LoanStatus.ACTIVE, LoanStatus.PARTIAL],
        ).aggregate(
            count=Count("id"),
            total_amount=Sum("amount"),
            total_balance=Sum("balance_amount"),
        )

        # Interest accrued (calculate on-the-fly)
        interest_items = self.calculate_interest()
        total_interest = sum(item["interest"] for item in interest_items)

        # Overdue advances (expected_date has passed)
        today = timezone.now().date()
        overdue_count = Advance.objects.filter(
            organization=self.organization,
            status=AdvanceStatus.ACTIVE,
            expected_date__lt=today,
        ).count()

        return {
            "active_advances_count": active_advances["count"] or 0,
            "active_advances_amount": active_advances["total_amount"] or Decimal("0.00"),
            "active_advances_balance": active_advances["total_balance"] or Decimal("0.00"),
            "active_loans_count": active_loans["count"] or 0,
            "active_loans_amount": active_loans["total_amount"] or Decimal("0.00"),
            "active_loans_balance": active_loans["total_balance"] or Decimal("0.00"),
            "total_interest_accrued": total_interest,
            "overdue_advances_count": overdue_count,
        }

    def get_party_loan_ledger(self, party_id):
        """Get loan ledger entries for a party."""
        from .models import LoanLedger

        return LoanLedger.objects.filter(
            organization=self.organization,
            party_id=party_id,
        ).order_by("date", "serial_number")

    def get_party_loan_summary(self, party_id):
        """Get summary of active advances and loans for a party."""
        from .models import Advance, AdvanceStatus, LoanAgainstGoods, LoanStatus

        advances = Advance.objects.filter(
            organization=self.organization,
            party_id=party_id,
            status=AdvanceStatus.ACTIVE,
        )
        loans = LoanAgainstGoods.objects.filter(
            organization=self.organization,
            party_id=party_id,
            status__in=[LoanStatus.ACTIVE, LoanStatus.PARTIAL],
        )

        return {
            "advances": advances,
            "loans": loans,
        }

    def _get_party_running_balance(self, party):
        """Get the current running balance for a party from the loan ledger."""
        from .models import LoanLedger

        last_entry = LoanLedger.objects.filter(
            organization=self.organization,
            party=party,
        ).order_by("-serial_number").first()

        return last_entry.running_balance if last_entry else Decimal("0.00")
