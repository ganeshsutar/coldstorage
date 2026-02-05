from decimal import Decimal

from django.db import transaction
from django.db.models import Count, Q, Sum
from django.utils import timezone

from apps.accounting.models import Account, PartyLedger, VoucherType
from apps.inventory.models import Amad


class TradingService:
    """Service for deal (sauda) operations."""

    def __init__(self, organization):
        self.organization = organization

    @transaction.atomic
    def create_deal(self, form_input: dict, user=None):
        """Create a new deal (sauda)."""
        from .models import DealStatus, Sauda

        seller = Account.objects.get(
            id=form_input["seller_id"],
            organization=self.organization,
        )
        buyer = Account.objects.get(
            id=form_input["buyer_id"],
            organization=self.organization,
        )

        from apps.inventory.models import Commodity

        commodity = Commodity.objects.get(
            id=form_input["commodity_id"],
            organization=self.organization,
        )

        sauda = Sauda(
            organization=self.organization,
            deal_date=form_input["deal_date"],
            seller=seller,
            buyer=buyer,
            commodity=commodity,
            variety=form_input.get("variety", ""),
            quantity=form_input["quantity"],
            rate=form_input["rate"],
            due_days=form_input.get("due_days", 0),
            due_date=form_input.get("due_date"),
            payment_terms=form_input.get("payment_terms", ""),
            delivery_location=form_input.get("delivery_location", ""),
            remarks=form_input.get("remarks", ""),
            status=DealStatus.OPEN,
        )
        sauda.save()
        return sauda

    @transaction.atomic
    def cancel_deal(self, deal_id: str, reason: str, user=None):
        """Cancel a deal. Only allowed if no dispatches have been made."""
        from .models import DealStatus, Sauda

        sauda = Sauda.objects.get(
            id=deal_id,
            organization=self.organization,
        )

        if sauda.status == DealStatus.CANCELLED:
            raise ValueError("Deal is already cancelled")

        if sauda.dispatched_quantity > 0:
            raise ValueError("Cannot cancel deal with existing dispatches")

        sauda.status = DealStatus.CANCELLED
        sauda.cancelled_at = timezone.now()
        sauda.cancelled_by = user
        sauda.cancel_reason = reason
        sauda.save()

        return sauda

    def get_deal_stats(self) -> dict:
        """Get trading statistics for dashboard KPI cards."""
        from .models import DealStatus, GatePassStatus, Sauda, GatePass, Katai

        today = timezone.now().date()

        # Open deals
        open_deals = Sauda.objects.filter(
            organization=self.organization,
            status__in=[DealStatus.OPEN, DealStatus.PARTIAL],
        ).aggregate(
            count=Count("id"),
            total_value=Sum("amount"),
        )

        # Dispatched today
        dispatched_today = GatePass.objects.filter(
            organization=self.organization,
            gp_date=today,
            status__in=[GatePassStatus.DRAFT, GatePassStatus.DONE],
        ).aggregate(
            bags=Sum("total_packets"),
            gps=Count("id"),
        )

        # Pending delivery
        pending_delivery = Sauda.objects.filter(
            organization=self.organization,
            status__in=[DealStatus.OPEN, DealStatus.PARTIAL],
        ).aggregate(
            value=Sum("amount"),
            count=Count("id"),
        )

        # Grading done (this month)
        month_start = today.replace(day=1)
        grading_done = Katai.objects.filter(
            organization=self.organization,
            katai_date__gte=month_start,
        ).aggregate(
            bags=Sum("bags_graded"),
        )

        return {
            "open_deals_count": open_deals["count"] or 0,
            "open_deals_value": open_deals["total_value"] or Decimal("0.00"),
            "dispatched_today_bags": dispatched_today["bags"] or 0,
            "dispatched_today_gps": dispatched_today["gps"] or 0,
            "pending_delivery_value": pending_delivery["value"] or Decimal("0.00"),
            "pending_delivery_count": pending_delivery["count"] or 0,
            "grading_done_bags": grading_done["bags"] or 0,
        }


class GatePassService:
    """Service for gate pass operations."""

    def __init__(self, organization):
        self.organization = organization

    @transaction.atomic
    def create_gate_pass(self, form_input: dict, user=None):
        """Create a gate pass with items."""
        from .models import DealStatus, GatePass, GatePassItem, GatePassStatus, Sauda

        seller = Account.objects.get(
            id=form_input["seller_id"],
            organization=self.organization,
        )
        buyer = Account.objects.get(
            id=form_input["buyer_id"],
            organization=self.organization,
        )

        sauda = None
        if form_input.get("sauda_id"):
            sauda = Sauda.objects.get(
                id=form_input["sauda_id"],
                organization=self.organization,
            )

        gp = GatePass(
            organization=self.organization,
            gp_date=form_input["gp_date"],
            gp_time=form_input.get("gp_time"),
            seller=seller,
            buyer=buyer,
            sauda=sauda,
            transport_name=form_input.get("transport_name", ""),
            vehicle_no=form_input.get("vehicle_no", ""),
            driver_name=form_input.get("driver_name", ""),
            driver_contact=form_input.get("driver_contact", ""),
            bilti_no=form_input.get("bilti_no", ""),
            rate=form_input.get("rate", Decimal("0.00")),
            remarks=form_input.get("remarks", ""),
            status=GatePassStatus.DRAFT,
        )
        gp.save()

        # Create items
        total_packets = 0
        total_weight = Decimal("0.00")
        total_amount = Decimal("0.00")

        for item_data in form_input.get("items", []):
            amad = Amad.objects.get(
                id=item_data["amad_id"],
                organization=self.organization,
            )
            item = GatePassItem(
                gate_pass=gp,
                amad=amad,
                pkt1=item_data.get("pkt1", 0),
                pkt2=item_data.get("pkt2", 0),
                pkt3=item_data.get("pkt3", 0),
                weight=item_data.get("weight", Decimal("0.00")),
                rate=item_data.get("rate", gp.rate),
            )
            item.save()

            item_packets = item.pkt1 + item.pkt2 + item.pkt3
            total_packets += item_packets
            total_weight += item.weight
            total_amount += item.amount

            # Update amad remaining
            amad.remaining_packets = max(0, amad.remaining_packets - item_packets)
            amad.remaining_weight = max(Decimal("0.00"), amad.remaining_weight - item.weight)
            amad.is_fully_dispatched = amad.remaining_packets <= 0
            amad.save(update_fields=["remaining_packets", "remaining_weight", "is_fully_dispatched", "updated_at"])

        # Update GP totals
        gp.total_packets = total_packets
        gp.total_weight = total_weight
        gp.amount = total_amount
        gp.save(update_fields=["total_packets", "total_weight", "amount", "updated_at"])

        # Update sauda dispatched quantity
        if sauda:
            sauda.dispatched_quantity += total_packets
            sauda.balance_quantity = sauda.quantity - sauda.dispatched_quantity
            if sauda.balance_quantity <= 0:
                sauda.status = DealStatus.DISPATCHED
            elif sauda.dispatched_quantity > 0:
                sauda.status = DealStatus.PARTIAL
            sauda.save(update_fields=[
                "dispatched_quantity", "balance_quantity", "status", "updated_at",
            ])

        return gp

    @transaction.atomic
    def mark_done(self, gp_id: str, user=None):
        """Mark a gate pass as done."""
        from .models import GatePass, GatePassStatus

        gp = GatePass.objects.get(
            id=gp_id,
            organization=self.organization,
        )

        if gp.status != GatePassStatus.DRAFT:
            raise ValueError(f"Cannot mark gate pass as done in status: {gp.status}")

        gp.status = GatePassStatus.DONE
        gp.save(update_fields=["status", "updated_at"])

        return gp

    @transaction.atomic
    def cancel_gate_pass(self, gp_id: str, reason: str, user=None):
        """Cancel a gate pass and reverse quantities."""
        from .models import DealStatus, GatePass, GatePassStatus

        gp = GatePass.objects.get(
            id=gp_id,
            organization=self.organization,
        )

        if gp.status == GatePassStatus.CANCELLED:
            raise ValueError("Gate pass is already cancelled")

        # Reverse amad quantities
        for item in gp.items.select_related("amad"):
            amad = item.amad
            item_packets = item.pkt1 + item.pkt2 + item.pkt3
            amad.remaining_packets += item_packets
            amad.remaining_weight += item.weight
            amad.is_fully_dispatched = amad.remaining_packets <= 0
            amad.save(update_fields=["remaining_packets", "remaining_weight", "is_fully_dispatched", "updated_at"])

        # Reverse sauda quantities
        if gp.sauda:
            sauda = gp.sauda
            sauda.dispatched_quantity -= gp.total_packets
            sauda.balance_quantity = sauda.quantity - sauda.dispatched_quantity
            if sauda.dispatched_quantity <= 0:
                sauda.status = DealStatus.OPEN
            elif sauda.balance_quantity > 0:
                sauda.status = DealStatus.PARTIAL
            sauda.save(update_fields=[
                "dispatched_quantity", "balance_quantity", "status", "updated_at",
            ])

        gp.status = GatePassStatus.CANCELLED
        gp.cancelled_at = timezone.now()
        gp.cancelled_by = user
        gp.cancel_reason = reason
        gp.save(update_fields=["status", "cancelled_at", "cancelled_by", "cancel_reason", "updated_at"])

        return gp


class KataiService:
    """Service for katai (grading) operations."""

    def __init__(self, organization):
        self.organization = organization

    @transaction.atomic
    def create_katai(self, form_input: dict, user=None):
        """Create a katai (grading) record."""
        from .models import Katai

        party = Account.objects.get(
            id=form_input["party_id"],
            organization=self.organization,
        )
        amad = Amad.objects.get(
            id=form_input["amad_id"],
            organization=self.organization,
        )

        # Validate output sum equals bags_graded
        bags_graded = form_input["bags_graded"]
        output_sum = (
            form_input.get("mota_bags", 0)
            + form_input.get("chatta_bags", 0)
            + form_input.get("beej_bags", 0)
            + form_input.get("mix_bags", 0)
            + form_input.get("gulla_bags", 0)
        )
        if output_sum != bags_graded:
            raise ValueError(
                f"Output bags sum ({output_sum}) must equal bags graded ({bags_graded})"
            )

        katai = Katai(
            organization=self.organization,
            katai_date=form_input["katai_date"],
            party=party,
            amad=amad,
            bags_graded=bags_graded,
            mota_bags=form_input.get("mota_bags", 0),
            chatta_bags=form_input.get("chatta_bags", 0),
            beej_bags=form_input.get("beej_bags", 0),
            mix_bags=form_input.get("mix_bags", 0),
            gulla_bags=form_input.get("gulla_bags", 0),
            charge_per_bag=form_input.get("charge_per_bag", Decimal("0.00")),
            labor_name=form_input.get("labor_name", ""),
            remarks=form_input.get("remarks", ""),
        )
        katai.save()

        # Create ledger entry for charges if charge > 0
        if katai.total_charges > 0:
            ledger_entry = PartyLedger.objects.create(
                organization=self.organization,
                account=party,
                voucher_type=VoucherType.JV,
                voucher_number=katai.katai_no,
                date=katai.katai_date,
                narration=f"Katai charges - {katai.katai_no}",
                amount=katai.total_charges,
                principal_amount=katai.total_charges,
            )
            katai.ledger_entry = ledger_entry
            katai.save(update_fields=["ledger_entry", "updated_at"])

            # Recalculate party balance
            party.recalculate_balance()

        return katai
