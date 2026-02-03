from dataclasses import dataclass
from datetime import date
from decimal import Decimal
from typing import Optional

from django.db import transaction
from django.db.models import Sum

from apps.accounting.models import Account, PartyLedger, VoucherType

from .models import Amad, AmadNikasi, Rent


@dataclass
class RentCalculation:
    """Data class for rent calculation result."""

    amad_no: str
    amad_date: date
    dispatch_date: date
    packets: int
    weight: Decimal
    weight_quintals: Decimal
    storage_days: int
    grace_days: int
    billable_days: int
    rent_rate: Decimal
    rent_amount: Decimal
    gst_percent: Decimal
    gst_amount: Decimal
    total_amount: Decimal


class InventoryService:
    """Service for inventory business logic."""

    def __init__(self, organization):
        self.organization = organization

    def generate_amad_number(self, amad_date: date) -> str:
        """Generate unique amad number for a given date."""
        year = amad_date.year
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

    def calculate_rent(
        self,
        amad: Amad,
        dispatch_date: date,
        packets: int,
        weight: Decimal,
        gst_percent: Decimal = Decimal("18.00"),
    ) -> RentCalculation:
        """
        Calculate rent for goods dispatch.

        Rent formula:
        - Storage days = dispatch_date - amad_date + 1
        - Billable days = max(0, storage_days - grace_days)
        - Weight in quintals = weight / 100
        - Rent = (weight_quintals * rent_rate * billable_days) / 30
        - GST = rent * gst_percent / 100
        - Total = rent + GST
        """
        # Calculate storage days (inclusive of both dates)
        storage_days = (dispatch_date - amad.date).days + 1
        grace_days = amad.grace_days
        billable_days = max(0, storage_days - grace_days)

        # Convert weight to quintals (1 quintal = 100 kg)
        weight_quintals = weight / Decimal("100")

        # Calculate rent (rate is per quintal per month, so divide by 30)
        rent_rate = amad.rent_rate
        rent_amount = (weight_quintals * rent_rate * Decimal(billable_days)) / Decimal("30")
        rent_amount = rent_amount.quantize(Decimal("0.01"))

        # Calculate GST
        gst_amount = (rent_amount * gst_percent) / Decimal("100")
        gst_amount = gst_amount.quantize(Decimal("0.01"))

        total_amount = rent_amount + gst_amount

        return RentCalculation(
            amad_no=amad.amad_no,
            amad_date=amad.date,
            dispatch_date=dispatch_date,
            packets=packets,
            weight=weight,
            weight_quintals=weight_quintals,
            storage_days=storage_days,
            grace_days=grace_days,
            billable_days=billable_days,
            rent_rate=rent_rate,
            rent_amount=rent_amount,
            gst_percent=gst_percent,
            gst_amount=gst_amount,
            total_amount=total_amount,
        )

    @transaction.atomic
    def create_dispatch(
        self,
        amad: Amad,
        dispatch_date: date,
        packets: int,
        weight: Decimal,
        nikasi_type: str = "SEEDHI",
        receiver_name: Optional[str] = None,
        receiver_account: Optional[Account] = None,
        vehicle_no: Optional[str] = None,
        narration: Optional[str] = None,
        gst_percent: Decimal = Decimal("18.00"),
        create_ledger_entry: bool = True,
    ) -> Rent:
        """
        Create a dispatch (rent/nikasi) entry with associated records.

        This method:
        1. Validates that sufficient stock is available
        2. Calculates rent amount
        3. Creates the Rent record
        4. Creates AmadNikasi link record
        5. Updates Amad remaining quantities
        6. Optionally creates a PartyLedger entry
        """
        # Validate stock availability
        if packets > amad.remaining_packets:
            raise ValueError(f"Insufficient packets. Available: {amad.remaining_packets}")
        if weight > amad.remaining_weight:
            raise ValueError(f"Insufficient weight. Available: {amad.remaining_weight}")

        # Calculate rent
        calculation = self.calculate_rent(
            amad=amad,
            dispatch_date=dispatch_date,
            packets=packets,
            weight=weight,
            gst_percent=gst_percent,
        )

        # Create Rent record
        rent = Rent.objects.create(
            organization=self.organization,
            date=dispatch_date,
            party=amad.party,
            receiver_name=receiver_name,
            receiver_account=receiver_account,
            amad=amad,
            packets=packets,
            weight=weight,
            storage_days=calculation.storage_days,
            rent_rate=calculation.rent_rate,
            rent_amount=calculation.rent_amount,
            gst_percent=gst_percent,
            gst_amount=calculation.gst_amount,
            nikasi_type=nikasi_type,
            vehicle_no=vehicle_no,
            narration=narration,
        )

        # Create AmadNikasi link
        AmadNikasi.objects.create(
            organization=self.organization,
            amad=amad,
            rent=rent,
            packets_dispatched=packets,
            weight_dispatched=weight,
        )

        # Note: AmadNikasi.save() automatically updates amad.remaining via amad.update_remaining()

        # Create ledger entry if requested and amount > 0
        if create_ledger_entry and calculation.total_amount > Decimal("0.00"):
            ledger_entry = self._create_rent_ledger_entry(rent, calculation)
            rent.ledger_entry = ledger_entry
            rent.save(update_fields=["ledger_entry"])

        return rent

    def _create_rent_ledger_entry(
        self,
        rent: Rent,
        calculation: RentCalculation,
    ) -> PartyLedger:
        """Create a ledger entry for rent charges."""
        # Get next serial number for this account
        last_entry = PartyLedger.objects.filter(
            organization=self.organization,
            account=rent.party,
        ).order_by("-serial_number").first()
        serial_number = (last_entry.serial_number + 1) if last_entry else 1

        narration = (
            f"Rent for Amad {rent.amad.amad_no} - "
            f"{rent.packets} pkts, {rent.weight} kg, "
            f"{calculation.storage_days} days"
        )
        if rent.narration:
            narration = f"{narration}. {rent.narration}"

        ledger_entry = PartyLedger.objects.create(
            organization=self.organization,
            account=rent.party,
            serial_number=serial_number,
            voucher_type=VoucherType.DR,  # Debit entry - party owes rent
            date=rent.date,
            narration=narration,
            amount=calculation.total_amount,
            principal_amount=calculation.rent_amount,
            other_charges=calculation.gst_amount,
            external_ref=str(rent.id),
            external_ref_type="RENT",
        )

        # Update account balance
        rent.party.recalculate_balance()

        return ledger_entry

    @transaction.atomic
    def transfer_stock(
        self,
        amad: Amad,
        to_party: Account,
        transfer_date: date,
        packets: int,
        weight: Decimal,
        narration: Optional[str] = None,
    ) -> Amad:
        """
        Transfer stock from one party to another.

        This method:
        1. Creates a dispatch (nikasi) from the original amad
        2. Creates a new amad for the receiving party
        3. Does NOT charge rent (rent_amount = 0)
        """
        # Validate stock availability
        if packets > amad.remaining_packets:
            raise ValueError(f"Insufficient packets. Available: {amad.remaining_packets}")
        if weight > amad.remaining_weight:
            raise ValueError(f"Insufficient weight. Available: {amad.remaining_weight}")

        # Create dispatch from original amad (no rent charge)
        rent = Rent.objects.create(
            organization=self.organization,
            date=transfer_date,
            party=amad.party,
            receiver_name=to_party.name,
            receiver_account=to_party,
            amad=amad,
            packets=packets,
            weight=weight,
            storage_days=0,
            rent_rate=Decimal("0.00"),
            rent_amount=Decimal("0.00"),
            gst_percent=Decimal("0.00"),
            gst_amount=Decimal("0.00"),
            nikasi_type="SEEDHI",
            narration=narration or f"Stock transfer to {to_party.name}",
        )

        # Create AmadNikasi link
        AmadNikasi.objects.create(
            organization=self.organization,
            amad=amad,
            rent=rent,
            packets_dispatched=packets,
            weight_dispatched=weight,
        )

        # Create new amad for receiving party
        # Calculate proportional packet distribution
        total_original = amad.total_packets
        ratio = Decimal(packets) / Decimal(total_original) if total_original > 0 else Decimal("0")

        new_amad = Amad.objects.create(
            organization=self.organization,
            date=transfer_date,
            party=to_party,
            village=amad.village,
            commodity=amad.commodity,
            room=amad.room,
            pkt1=int(amad.pkt1 * ratio) if packets == amad.total_packets else packets,
            pwt1=weight if packets == amad.total_packets else weight,
            pkt2=0,
            pwt2=Decimal("0.00"),
            pkt3=0,
            pwt3=Decimal("0.00"),
            marks=amad.marks,
            grace_days=amad.grace_days,
            rent_rate=amad.rent_rate,
            amad_type=amad.amad_type,
            e_way_bill=None,  # Transfer doesn't need e-way bill by default
        )

        return new_amad

    def get_party_stock(self, party: Account) -> dict:
        """Get stock summary for a specific party."""
        amads = Amad.objects.filter(
            organization=self.organization,
            party=party,
            is_fully_dispatched=False,
        )

        totals = amads.aggregate(
            total_packets=Sum("total_packets"),
            total_weight=Sum("total_weight"),
            remaining_packets=Sum("remaining_packets"),
            remaining_weight=Sum("remaining_weight"),
        )

        return {
            "party_id": str(party.id),
            "party_code": party.code,
            "party_name": party.name,
            "amads": list(amads),
            "total_packets": totals["total_packets"] or 0,
            "total_weight": totals["total_weight"] or Decimal("0.00"),
            "remaining_packets": totals["remaining_packets"] or 0,
            "remaining_weight": totals["remaining_weight"] or Decimal("0.00"),
        }

    def get_stock_summary(self) -> dict:
        """Get overall stock summary for the organization."""
        all_amads = Amad.objects.filter(organization=self.organization)
        active_amads = all_amads.filter(is_fully_dispatched=False)

        totals = all_amads.aggregate(
            total_packets=Sum("total_packets"),
            total_weight=Sum("total_weight"),
            remaining_packets=Sum("remaining_packets"),
            remaining_weight=Sum("remaining_weight"),
        )

        return {
            "total_amads": all_amads.count(),
            "active_amads": active_amads.count(),
            "total_packets": totals["total_packets"] or 0,
            "total_weight": totals["total_weight"] or Decimal("0.00"),
            "remaining_packets": totals["remaining_packets"] or 0,
            "remaining_weight": totals["remaining_weight"] or Decimal("0.00"),
            "fully_dispatched": all_amads.count() - active_amads.count(),
        }

    def get_commodity_stock(self) -> list:
        """Get stock grouped by commodity."""
        from django.db.models import Count

        results = (
            Amad.objects.filter(
                organization=self.organization,
                is_fully_dispatched=False,
            )
            .values(
                "commodity__id",
                "commodity__code",
                "commodity__name",
            )
            .annotate(
                total_packets=Sum("total_packets"),
                total_weight=Sum("total_weight"),
                remaining_packets=Sum("remaining_packets"),
                remaining_weight=Sum("remaining_weight"),
                amad_count=Count("id"),
            )
            .order_by("commodity__name")
        )

        return [
            {
                "commodity_id": r["commodity__id"],
                "commodity_code": r["commodity__code"],
                "commodity_name": r["commodity__name"],
                "total_packets": r["total_packets"] or 0,
                "total_weight": r["total_weight"] or Decimal("0.00"),
                "remaining_packets": r["remaining_packets"] or 0,
                "remaining_weight": r["remaining_weight"] or Decimal("0.00"),
            }
            for r in results
        ]

    def get_room_stock(self) -> list:
        """Get stock grouped by room with utilization."""
        from .models import Room

        rooms = Room.objects.filter(
            organization=self.organization,
            is_active=True,
        )

        result = []
        for room in rooms:
            amads = Amad.objects.filter(
                organization=self.organization,
                room=room,
                is_fully_dispatched=False,
            )
            totals = amads.aggregate(
                remaining_packets=Sum("remaining_packets"),
                remaining_weight=Sum("remaining_weight"),
            )

            remaining_weight = totals["remaining_weight"] or Decimal("0.00")
            # Convert weight to quintals for utilization calculation
            occupied_quintals = remaining_weight / Decimal("100")
            capacity = room.capacity_quintals or Decimal("1.00")
            utilization = (occupied_quintals / capacity * Decimal("100")).quantize(Decimal("0.01"))

            result.append({
                "room_id": str(room.id),
                "room_number": room.number,
                "room_name": room.name,
                "capacity_quintals": room.capacity_quintals,
                "occupied_quintals": occupied_quintals,
                "utilization_percent": min(utilization, Decimal("100.00")),
                "total_packets": totals["remaining_packets"] or 0,
            })

        return sorted(result, key=lambda x: x["room_number"])

    def get_amads_due_for_nikasi(self, days_threshold: int = 180) -> list:
        """Get amads that have been stored for more than threshold days."""
        from datetime import timedelta
        from django.utils import timezone

        cutoff_date = timezone.now().date() - timedelta(days=days_threshold)

        amads = Amad.objects.filter(
            organization=self.organization,
            is_fully_dispatched=False,
            date__lte=cutoff_date,
        ).select_related("party", "commodity", "room").order_by("date")

        return list(amads)

    def get_today_summary(self, target_date: Optional[date] = None) -> dict:
        """Get summary for a specific date (defaults to today)."""
        from django.utils import timezone

        if target_date is None:
            target_date = timezone.now().date()

        # Today's arrivals
        today_amads = Amad.objects.filter(
            organization=self.organization,
            date=target_date,
        )
        today_amad_totals = today_amads.aggregate(
            packets=Sum("total_packets"),
            weight=Sum("total_weight"),
        )

        # Today's dispatches
        today_rents = Rent.objects.filter(
            organization=self.organization,
            date=target_date,
        )
        today_rent_totals = today_rents.aggregate(
            packets=Sum("packets"),
            weight=Sum("weight"),
            amount=Sum("total_amount"),
        )

        return {
            "date": target_date,
            "arrivals": {
                "count": today_amads.count(),
                "packets": today_amad_totals["packets"] or 0,
                "weight": today_amad_totals["weight"] or Decimal("0.00"),
            },
            "dispatches": {
                "count": today_rents.count(),
                "packets": today_rent_totals["packets"] or 0,
                "weight": today_rent_totals["weight"] or Decimal("0.00"),
                "amount": today_rent_totals["amount"] or Decimal("0.00"),
            },
        }
