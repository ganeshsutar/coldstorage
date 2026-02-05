from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from apps.accounting.models import PartyLedger, VoucherType

from .models import (
    BardanaCondition,
    BardanaIssueHeader,
    BardanaIssueItem,
    BardanaReturnHeader,
    BardanaReturnItem,
    BardanaStatus,
    BardanaType,
)


class BardanaService:
    """Service for bardana operations."""

    def __init__(self, organization):
        self.organization = organization

    # -------------------------------------------------------------------------
    # Issue operations
    # -------------------------------------------------------------------------

    @transaction.atomic
    def create_issue(self, data, user=None):
        """Create a bardana issue with items."""
        from apps.accounting.models import Account

        party = Account.objects.get(
            id=data["party_id"],
            organization=self.organization,
        )

        header = BardanaIssueHeader(
            organization=self.organization,
            date=data["date"],
            party=party,
            remarks=data.get("remarks", ""),
            status=BardanaStatus.DRAFT,
            is_advance=data.get("is_advance", False),
            interest_rate_pm=data.get("interest_rate_pm", Decimal("0.00")),
            expected_arrival_date=data.get("expected_arrival_date"),
            expected_bags=data.get("expected_bags"),
            reference_no=data.get("reference_no", ""),
        )
        header.save()

        for item_data in data.get("items", []):
            bardana_type = BardanaType.objects.get(
                id=item_data["bardana_type_id"],
                organization=self.organization,
            )
            BardanaIssueItem.objects.create(
                organization=self.organization,
                issue_header=header,
                bardana_type=bardana_type,
                qty=item_data["qty"],
                rate=item_data.get("rate", bardana_type.rate_per_unit),
            )

        # Recalculate totals
        header.save()

        return header

    @transaction.atomic
    def confirm_issue(self, issue_id, user=None):
        """Confirm a draft issue and create ledger entry (debit)."""
        header = BardanaIssueHeader.objects.get(
            id=issue_id,
            organization=self.organization,
        )

        if header.status != BardanaStatus.DRAFT:
            raise ValueError(f"Cannot confirm issue in status: {header.status}")

        # Create ledger entry (debit — party owes for bardana)
        ledger_entry = PartyLedger.objects.create(
            organization=self.organization,
            account=header.party,
            voucher_type=VoucherType.JV,
            voucher_number=header.voucher_no,
            date=header.date,
            narration=f"Bardana Issue {header.voucher_no}",
            amount=header.total_amount,
            principal_amount=header.total_amount,
        )

        header.status = BardanaStatus.CONFIRMED
        header.confirmed_at = timezone.now()
        header.confirmed_by = user
        header.ledger_entry = ledger_entry
        header.save()

        header.party.recalculate_balance()

        return header

    @transaction.atomic
    def cancel_issue(self, issue_id, reason, user=None):
        """Cancel an issue and reverse ledger entry."""
        header = BardanaIssueHeader.objects.get(
            id=issue_id,
            organization=self.organization,
        )

        if header.status == BardanaStatus.CANCELLED:
            raise ValueError("Issue is already cancelled")

        # Reverse ledger entry if confirmed
        if header.ledger_entry:
            PartyLedger.objects.create(
                organization=self.organization,
                account=header.party,
                voucher_type=VoucherType.JV,
                voucher_number=f"{header.voucher_no}-REV",
                date=timezone.now().date(),
                narration=f"Reversal of Bardana Issue {header.voucher_no}: {reason}",
                amount=-header.total_amount,
                principal_amount=-header.total_amount,
            )
            header.party.recalculate_balance()

        header.status = BardanaStatus.CANCELLED
        header.cancelled_at = timezone.now()
        header.cancelled_by = user
        header.cancel_reason = reason
        header.save()

        return header

    # -------------------------------------------------------------------------
    # Return operations
    # -------------------------------------------------------------------------

    @transaction.atomic
    def create_return(self, data, user=None):
        """Create a bardana return with items."""
        from apps.accounting.models import Account

        party = Account.objects.get(
            id=data["party_id"],
            organization=self.organization,
        )

        header = BardanaReturnHeader(
            organization=self.organization,
            date=data["date"],
            party=party,
            remarks=data.get("remarks", ""),
            status=BardanaStatus.DRAFT,
        )
        header.save()

        for item_data in data.get("items", []):
            bardana_type = BardanaType.objects.get(
                id=item_data["bardana_type_id"],
                organization=self.organization,
            )
            BardanaReturnItem.objects.create(
                organization=self.organization,
                return_header=header,
                bardana_type=bardana_type,
                qty=item_data["qty"],
                rate=item_data.get("rate", bardana_type.rate_per_unit),
                condition=item_data.get("condition", BardanaCondition.GOOD),
            )

        # Recalculate totals
        header.save()

        return header

    @transaction.atomic
    def confirm_return(self, return_id, user=None):
        """Confirm a draft return and create ledger entry (credit)."""
        header = BardanaReturnHeader.objects.get(
            id=return_id,
            organization=self.organization,
        )

        if header.status != BardanaStatus.DRAFT:
            raise ValueError(f"Cannot confirm return in status: {header.status}")

        # Create ledger entry (credit — reduce party's bardana liability)
        ledger_entry = PartyLedger.objects.create(
            organization=self.organization,
            account=header.party,
            voucher_type=VoucherType.CR,
            voucher_number=header.voucher_no,
            date=header.date,
            narration=f"Bardana Return {header.voucher_no}",
            amount=header.total_amount,
            principal_amount=header.total_amount,
        )

        header.status = BardanaStatus.CONFIRMED
        header.confirmed_at = timezone.now()
        header.confirmed_by = user
        header.ledger_entry = ledger_entry
        header.save()

        header.party.recalculate_balance()

        return header

    @transaction.atomic
    def cancel_return(self, return_id, reason, user=None):
        """Cancel a return and reverse ledger entry."""
        header = BardanaReturnHeader.objects.get(
            id=return_id,
            organization=self.organization,
        )

        if header.status == BardanaStatus.CANCELLED:
            raise ValueError("Return is already cancelled")

        # Reverse ledger entry if confirmed
        if header.ledger_entry:
            PartyLedger.objects.create(
                organization=self.organization,
                account=header.party,
                voucher_type=VoucherType.DR,
                voucher_number=f"{header.voucher_no}-REV",
                date=timezone.now().date(),
                narration=f"Reversal of Bardana Return {header.voucher_no}: {reason}",
                amount=header.total_amount,
                principal_amount=header.total_amount,
            )
            header.party.recalculate_balance()

        header.status = BardanaStatus.CANCELLED
        header.cancelled_at = timezone.now()
        header.cancelled_by = user
        header.cancel_reason = reason
        header.save()

        return header

    # -------------------------------------------------------------------------
    # Queries
    # -------------------------------------------------------------------------

    def get_stock_summary(self):
        """Get stock summary by bardana type with KPIs."""
        types = BardanaType.objects.filter(
            organization=self.organization,
            is_active=True,
        )

        today = timezone.now().date()
        summary = []
        total_stock = 0
        total_issued_today = 0
        total_outstanding = 0
        total_returns_pending = 0

        for bt in types:
            # Total issued (confirmed)
            issued = BardanaIssueItem.objects.filter(
                organization=self.organization,
                bardana_type=bt,
                issue_header__status=BardanaStatus.CONFIRMED,
            ).aggregate(total=Sum("qty"))["total"] or 0

            # Total returned (confirmed)
            returned = BardanaReturnItem.objects.filter(
                organization=self.organization,
                bardana_type=bt,
                return_header__status=BardanaStatus.CONFIRMED,
            ).aggregate(total=Sum("qty"))["total"] or 0

            # Issued today
            issued_today = BardanaIssueItem.objects.filter(
                organization=self.organization,
                bardana_type=bt,
                issue_header__status=BardanaStatus.CONFIRMED,
                issue_header__date=today,
            ).aggregate(total=Sum("qty"))["total"] or 0

            # Returns pending (draft returns)
            returns_pending = BardanaReturnItem.objects.filter(
                organization=self.organization,
                bardana_type=bt,
                return_header__status=BardanaStatus.DRAFT,
            ).aggregate(total=Sum("qty"))["total"] or 0

            current_stock = bt.opening_stock - issued + returned
            outstanding = issued - returned

            summary.append({
                "id": str(bt.id),
                "code": bt.code,
                "name": bt.name,
                "rate_per_unit": bt.rate_per_unit,
                "opening_stock": bt.opening_stock,
                "total_issued": issued,
                "total_returned": returned,
                "current_stock": current_stock,
                "outstanding": outstanding,
                "issued_today": issued_today,
                "returns_pending": returns_pending,
            })

            total_stock += current_stock
            total_issued_today += issued_today
            total_outstanding += outstanding
            total_returns_pending += returns_pending

        return {
            "kpis": {
                "total_stock": total_stock,
                "issued_today": total_issued_today,
                "total_outstanding": total_outstanding,
                "returns_pending": total_returns_pending,
            },
            "types": summary,
        }

    def get_party_outstanding(self, party_id):
        """Get bardana outstanding for a specific party."""
        from apps.accounting.models import Account

        party = Account.objects.get(
            id=party_id,
            organization=self.organization,
        )

        types = BardanaType.objects.filter(
            organization=self.organization,
            is_active=True,
        )

        type_outstanding = []
        total_issued = 0
        total_returned = 0

        for bt in types:
            issued = BardanaIssueItem.objects.filter(
                organization=self.organization,
                bardana_type=bt,
                issue_header__party=party,
                issue_header__status=BardanaStatus.CONFIRMED,
            ).aggregate(total=Sum("qty"))["total"] or 0

            returned = BardanaReturnItem.objects.filter(
                organization=self.organization,
                bardana_type=bt,
                return_header__party=party,
                return_header__status=BardanaStatus.CONFIRMED,
            ).aggregate(total=Sum("qty"))["total"] or 0

            outstanding = issued - returned
            if outstanding > 0:
                type_outstanding.append({
                    "bardana_type_id": str(bt.id),
                    "bardana_type_code": bt.code,
                    "bardana_type_name": bt.name,
                    "issued": issued,
                    "returned": returned,
                    "outstanding": outstanding,
                    "rate": bt.rate_per_unit,
                    "amount": outstanding * bt.rate_per_unit,
                })
                total_issued += issued
                total_returned += returned

        return {
            "party_id": str(party.id),
            "party_name": party.name,
            "total_issued": total_issued,
            "total_returned": total_returned,
            "total_outstanding": total_issued - total_returned,
            "types": type_outstanding,
        }

    def get_all_party_outstanding(self):
        """Get bardana outstanding for all parties."""
        from apps.accounting.models import Account

        # Get all parties that have confirmed bardana issues
        party_ids = BardanaIssueHeader.objects.filter(
            organization=self.organization,
            status=BardanaStatus.CONFIRMED,
        ).values_list("party_id", flat=True).distinct()

        result = []
        for party_id in party_ids:
            outstanding = self.get_party_outstanding(party_id)
            if outstanding["total_outstanding"] > 0:
                result.append(outstanding)

        return result

    def calculate_interest(self, issue, as_of_date=None):
        """Calculate interest on an advance bardana issue."""
        if not issue.is_advance or issue.interest_rate_pm <= 0:
            return Decimal("0.00")

        if as_of_date is None:
            as_of_date = timezone.now().date()

        days = (as_of_date - issue.date).days
        if days <= 0:
            return Decimal("0.00")

        # Simple interest: P * R * T / (100 * 30) where T is in days
        daily_rate = issue.interest_rate_pm / Decimal("30")
        interest = (issue.total_amount * daily_rate * days / Decimal("100")).quantize(
            Decimal("0.01")
        )

        return interest
