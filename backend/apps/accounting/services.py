from datetime import date, timedelta
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from .models import (
    Account,
    InterestCalculation,
    InterestCalculationTemp,
    PartyLedger,
    VoucherType,
)


class InterestCalculationService:
    """Service for calculating and posting interest on party accounts."""

    def __init__(self, organization):
        self.organization = organization

    def calculate_interest(
        self,
        from_date: date,
        to_date: date,
        account_ids: list = None,
        days_in_year: int = 365,
    ) -> list[InterestCalculation]:
        """
        Calculate interest for accounts based on daily balances.

        Interest formula: Principal x Rate x Days / (Days in Year x 100)

        Args:
            from_date: Start date for calculation
            to_date: End date for calculation
            account_ids: Optional list of account IDs. If None, calculates for all.
            days_in_year: Days in year for calculation (default 365)

        Returns:
            List of InterestCalculation objects created
        """
        accounts = Account.objects.filter(
            organization=self.organization,
            account_type="ACCOUNT",
            is_active=True,
        )

        if account_ids:
            accounts = accounts.filter(id__in=account_ids)

        # Only accounts with non-zero interest rate
        accounts = accounts.filter(interest_rate__gt=0)

        calculations = []

        with transaction.atomic():
            for account in accounts:
                calc = self._calculate_account_interest(
                    account=account,
                    from_date=from_date,
                    to_date=to_date,
                    days_in_year=days_in_year,
                )
                if calc:
                    calculations.append(calc)

        return calculations

    def _calculate_account_interest(
        self,
        account: Account,
        from_date: date,
        to_date: date,
        days_in_year: int,
    ) -> InterestCalculation | None:
        """Calculate interest for a single account."""
        # Get all ledger entries for the period
        ledger_entries = PartyLedger.objects.filter(
            account=account,
            date__lte=to_date,
        ).order_by("date", "serial_number")

        if not ledger_entries.exists():
            return None

        # Build daily balance history
        balance_changes = {}
        running_balance = account.opening_balance

        for entry in ledger_entries:
            if entry.voucher_type in [VoucherType.DR, VoucherType.JV]:
                running_balance += entry.amount
            else:
                running_balance -= entry.amount

            if entry.date >= from_date:
                balance_changes[entry.date] = running_balance

        if not balance_changes:
            # No changes in period, use current balance
            balance_changes[from_date] = account.closing_balance

        # Calculate interest for each balance period
        total_interest = Decimal("0.00")
        temp_entries = []

        sorted_dates = sorted(balance_changes.keys())
        for i, change_date in enumerate(sorted_dates):
            period_start = change_date
            period_end = sorted_dates[i + 1] - timedelta(days=1) if i + 1 < len(sorted_dates) else to_date
            balance = balance_changes[change_date]

            if period_end < period_start:
                continue

            days = (period_end - period_start).days + 1
            if days <= 0:
                continue

            # Interest = Principal x Rate x Days / (Days in Year x 100)
            interest = (abs(balance) * account.interest_rate * days) / (days_in_year * 100)
            interest = interest.quantize(Decimal("0.01"))

            if interest > 0:
                total_interest += interest
                balance_type = (
                    InterestCalculation.BalanceType.DEBIT
                    if balance >= 0
                    else InterestCalculation.BalanceType.CREDIT
                )
                temp_entries.append({
                    "from_date": period_start,
                    "to_date": period_end,
                    "days": days,
                    "principal": abs(balance),
                    "interest_rate": account.interest_rate,
                    "calculated_interest": interest,
                    "balance_type": balance_type,
                })

        if total_interest <= 0:
            return None

        # Determine final balance type
        final_balance = balance_changes.get(sorted_dates[-1], account.closing_balance)
        balance_type = (
            InterestCalculation.BalanceType.DEBIT
            if final_balance >= 0
            else InterestCalculation.BalanceType.CREDIT
        )

        # Create interest calculation record
        calculation = InterestCalculation.objects.create(
            organization=self.organization,
            account=account,
            date=to_date,
            balance=total_interest,
            interest_rate=account.interest_rate,
            balance_type=balance_type,
        )

        # Create temp entries for audit trail
        for temp_data in temp_entries:
            InterestCalculationTemp.objects.create(
                organization=self.organization,
                account=account,
                calculation=calculation,
                **temp_data,
            )

        return calculation

    def post_interest(
        self,
        calculation_ids: list,
        posting_date: date,
        narration: str = "Interest charged",
    ) -> list[PartyLedger]:
        """
        Post calculated interest to party ledgers.

        Args:
            calculation_ids: List of InterestCalculation IDs to post
            posting_date: Date for ledger entries
            narration: Narration for ledger entries

        Returns:
            List of PartyLedger entries created
        """
        calculations = InterestCalculation.objects.filter(
            organization=self.organization,
            id__in=calculation_ids,
            is_posted=False,
        )

        ledger_entries = []

        with transaction.atomic():
            for calc in calculations:
                # Create ledger entry for interest
                if calc.balance_type == InterestCalculation.BalanceType.DEBIT:
                    voucher_type = VoucherType.JV
                else:
                    voucher_type = VoucherType.JV

                entry = PartyLedger.objects.create(
                    organization=self.organization,
                    account=calc.account,
                    voucher_type=voucher_type,
                    date=posting_date,
                    narration=f"{narration} from {calc.date}",
                    amount=calc.balance,
                    principal_amount=Decimal("0.00"),
                    interest_amount=calc.balance,
                    other_charges=Decimal("0.00"),
                    external_ref=str(calc.id),
                    external_ref_type="INTEREST_CALCULATION",
                )

                # Update calculation as posted
                calc.is_posted = True
                calc.posted_at = timezone.now()
                calc.posted_ledger_entry = entry
                calc.save()

                # Recalculate account balance
                calc.account.recalculate_balance()

                ledger_entries.append(entry)

        return ledger_entries

    def get_pending_calculations(self, account_id: str = None) -> list[InterestCalculation]:
        """Get all unposted interest calculations."""
        queryset = InterestCalculation.objects.filter(
            organization=self.organization,
            is_posted=False,
        )

        if account_id:
            queryset = queryset.filter(account_id=account_id)

        return list(queryset.select_related("account"))
