from dataclasses import dataclass
from datetime import date, datetime, timedelta
from decimal import Decimal
from typing import List, Optional

from django.db import transaction
from django.db.models import Q, Sum

from apps.inventory.models import Amad, Rent, Room

from .models import (
    Loading,
    MeterReading,
    RackOccupancy,
    RoomFloor,
    ShiftHeader,
    Shifting,
    TemperatureReading,
    TemperatureStatus,
    TemperatureThreshold,
    Unloading,
)


@dataclass
class RackSuggestion:
    """Suggestion for rack placement."""

    room_id: str
    room_number: str
    floor_number: int
    rack_number: int
    current_quantity: int
    available_space: int


@dataclass
class UnloadSuggestion:
    """Suggestion for unloading (FIFO based)."""

    room_id: str
    floor_number: int
    rack_number: int
    quantity: int
    loaded_date: date


@dataclass
class AmadLocation:
    """Location of an amad's goods."""

    room_id: str
    room_number: str
    floor_number: int
    rack_number: int
    quantity: int
    loaded_date: date


@dataclass
class TemperatureStatusData:
    """Temperature status data for a room."""

    room_id: str
    room_number: str
    room_name: Optional[str]
    status: str
    latest_low: Optional[Decimal]
    latest_high: Optional[Decimal]
    last_reading_time: Optional[datetime]
    target_low: Optional[Decimal]
    target_high: Optional[Decimal]


@dataclass
class RoomMapData:
    """Complete room map data."""

    room_id: str
    room_number: str
    room_name: Optional[str]
    floor_count: int
    rack_count: int
    racks_per_row: int
    floors: List[dict]
    occupancy: List[dict]
    summary: dict


class WarehouseService:
    """Business logic for warehouse operations."""

    def __init__(self, organization):
        self.organization = organization

    # =========================================================================
    # Room Map Operations
    # =========================================================================

    def get_room_map(self, room_id: str) -> RoomMapData:
        """Get complete room map visualization data."""
        try:
            room = Room.objects.get(id=room_id, organization=self.organization)
        except Room.DoesNotExist:
            raise ValueError("Room not found")

        # Get floor configurations
        floor_configs = RoomFloor.objects.filter(
            organization=self.organization,
            room=room,
            is_active=True,
        ).order_by("floor_number")

        floors = []
        for fc in floor_configs:
            floors.append({
                "floor_number": fc.floor_number,
                "from_rack": fc.from_rack,
                "to_rack": fc.to_rack,
                "rack_count": fc.rack_count,
            })

        # Get rack occupancy
        occupancy = RackOccupancy.objects.filter(
            organization=self.organization,
            room=room,
        ).order_by("floor_number", "rack_number")

        occupancy_data = []
        for occ in occupancy:
            occupancy_data.append({
                "id": str(occ.id),
                "room": str(occ.room_id),
                "room_number": room.number,
                "floor_number": occ.floor_number,
                "rack_number": occ.rack_number,
                "current_quantity": occ.current_quantity,
                "last_updated": occ.last_updated.isoformat(),
            })

        # Calculate summary
        total_racks = room.rack_count
        occupied_racks = len([o for o in occupancy if o.current_quantity > 0])
        current_load = sum(o.current_quantity for o in occupancy)

        summary = {
            "total_racks": total_racks,
            "occupied_racks": occupied_racks,
            "total_capacity": total_racks * 100,  # Assume 100 bags per rack capacity
            "current_load": current_load,
            "occupancy_percent": Decimal(occupied_racks / total_racks * 100) if total_racks > 0 else Decimal(0),
        }

        return RoomMapData(
            room_id=str(room.id),
            room_number=room.number,
            room_name=room.name,
            floor_count=room.floor_count,
            rack_count=room.rack_count,
            racks_per_row=room.racks_per_row,
            floors=floors,
            occupancy=occupancy_data,
            summary=summary,
        )

    def get_rack_occupancy(self, room_id: str, floor: int, rack: int) -> Optional[RackOccupancy]:
        """Get occupancy for a specific rack."""
        try:
            return RackOccupancy.objects.get(
                organization=self.organization,
                room_id=room_id,
                floor_number=floor,
                rack_number=rack,
            )
        except RackOccupancy.DoesNotExist:
            return None

    def get_rack_contents(self, room_id: str, floor: int, rack: int) -> dict:
        """Get detailed contents of a rack including amad details and history."""
        occupancy = self.get_rack_occupancy(room_id, floor, rack)

        # Get current items in this rack
        loadings = Loading.objects.filter(
            organization=self.organization,
            room_id=room_id,
            floor_number=floor,
            rack_number=rack,
        ).select_related("amad", "amad__party", "amad__commodity").order_by("date")

        # Calculate net quantity per amad
        amad_quantities = {}
        for loading in loadings:
            if loading.amad_id not in amad_quantities:
                amad_quantities[loading.amad_id] = {
                    "amad_id": str(loading.amad_id),
                    "amad_no": loading.amad_no,
                    "party_name": loading.amad.party.name,
                    "commodity_name": loading.amad.commodity.name,
                    "quantity": 0,
                    "loaded_date": loading.date.isoformat(),
                }
            amad_quantities[loading.amad_id]["quantity"] += loading.quantity

        # Subtract unloadings
        unloadings = Unloading.objects.filter(
            organization=self.organization,
            room_id=room_id,
            floor_number=floor,
            rack_number=rack,
        )
        for unloading in unloadings:
            if unloading.amad_id in amad_quantities:
                amad_quantities[unloading.amad_id]["quantity"] -= unloading.quantity

        # Subtract shift outs
        shift_outs = Shifting.objects.filter(
            organization=self.organization,
            from_room_id=room_id,
            from_floor=floor,
            from_rack=rack,
        )
        for shift in shift_outs:
            if shift.amad_id in amad_quantities:
                amad_quantities[shift.amad_id]["quantity"] -= shift.quantity

        # Add shift ins
        shift_ins = Shifting.objects.filter(
            organization=self.organization,
            to_room_id=room_id,
            to_floor=floor,
            to_rack=rack,
        ).select_related("amad", "amad__party", "amad__commodity")
        for shift in shift_ins:
            if shift.amad_id not in amad_quantities:
                amad_quantities[shift.amad_id] = {
                    "amad_id": str(shift.amad_id),
                    "amad_no": shift.amad.amad_no,
                    "party_name": shift.amad.party.name,
                    "commodity_name": shift.amad.commodity.name,
                    "quantity": 0,
                    "loaded_date": shift.shift_header.date.isoformat(),
                }
            amad_quantities[shift.amad_id]["quantity"] += shift.quantity

        # Filter out items with zero quantity
        items = [item for item in amad_quantities.values() if item["quantity"] > 0]

        # Get history
        history = []

        # Add loading history
        for loading in loadings:
            history.append({
                "date": loading.date.isoformat(),
                "type": "load",
                "amad_no": loading.amad_no,
                "quantity": loading.quantity,
                "user": loading.created_by.full_name if loading.created_by else "Unknown",
            })

        # Add unloading history
        for unloading in unloadings.select_related("amad", "created_by"):
            history.append({
                "date": unloading.date.isoformat(),
                "type": "unload",
                "amad_no": unloading.amad.amad_no,
                "quantity": unloading.quantity,
                "user": unloading.created_by.full_name if unloading.created_by else "Unknown",
            })

        # Add shift history
        for shift in shift_outs.select_related("amad", "shift_header"):
            history.append({
                "date": shift.shift_header.date.isoformat(),
                "type": "shift_out",
                "amad_no": shift.amad.amad_no,
                "quantity": shift.quantity,
                "user": shift.shift_header.created_by.full_name if shift.shift_header.created_by else "Unknown",
            })
        for shift in shift_ins.select_related("shift_header"):
            history.append({
                "date": shift.shift_header.date.isoformat(),
                "type": "shift_in",
                "amad_no": shift.amad.amad_no,
                "quantity": shift.quantity,
                "user": shift.shift_header.created_by.full_name if shift.shift_header.created_by else "Unknown",
            })

        # Sort history by date descending
        history.sort(key=lambda x: x["date"], reverse=True)

        return {
            "rack": {
                "id": str(occupancy.id) if occupancy else None,
                "room": str(room_id),
                "floor_number": floor,
                "rack_number": rack,
                "current_quantity": occupancy.current_quantity if occupancy else 0,
            },
            "items": items,
            "history": history[:50],  # Limit to 50 history entries
        }

    # =========================================================================
    # Loading Operations
    # =========================================================================

    def find_available_racks(self, room_id: str, quantity: int) -> List[RackSuggestion]:
        """Find racks with available space for the given quantity."""
        try:
            room = Room.objects.get(id=room_id, organization=self.organization)
        except Room.DoesNotExist:
            raise ValueError("Room not found")

        # Get all floor configs
        floor_configs = RoomFloor.objects.filter(
            organization=self.organization,
            room=room,
            is_active=True,
        ).order_by("floor_number")

        suggestions = []
        rack_capacity = 100  # Assumed capacity per rack

        for fc in floor_configs:
            for rack_num in range(fc.from_rack, fc.to_rack + 1):
                # Get current occupancy
                try:
                    occ = RackOccupancy.objects.get(
                        organization=self.organization,
                        room=room,
                        floor_number=fc.floor_number,
                        rack_number=rack_num,
                    )
                    current = occ.current_quantity
                except RackOccupancy.DoesNotExist:
                    current = 0

                available = rack_capacity - current
                if available > 0:
                    suggestions.append(RackSuggestion(
                        room_id=str(room.id),
                        room_number=room.number,
                        floor_number=fc.floor_number,
                        rack_number=rack_num,
                        current_quantity=current,
                        available_space=available,
                    ))

        # Sort by available space descending (prefer emptier racks)
        suggestions.sort(key=lambda x: x.available_space, reverse=True)
        return suggestions

    @transaction.atomic
    def create_loading(self, amad_id: str, locations: List[dict], user=None) -> List[Loading]:
        """Create multiple loading records for an amad."""
        try:
            amad = Amad.objects.get(id=amad_id, organization=self.organization)
        except Amad.DoesNotExist:
            raise ValueError("Amad not found")

        loadings = []
        for loc in locations:
            loading = Loading.objects.create(
                organization=self.organization,
                amad=amad,
                date=loc["date"],
                room_id=loc["room"],
                floor_number=loc["floor_number"],
                rack_number=loc["rack_number"],
                aisle=loc.get("aisle"),
                quantity=loc["quantity"],
                created_by=user,
            )
            loadings.append(loading)

        return loadings

    # =========================================================================
    # Unloading Operations
    # =========================================================================

    def get_amad_locations(self, amad_id: str) -> List[AmadLocation]:
        """Get all locations where an amad's goods are stored."""
        try:
            amad = Amad.objects.get(id=amad_id, organization=self.organization)
        except Amad.DoesNotExist:
            raise ValueError("Amad not found")

        # Get all loadings for this amad
        loadings = Loading.objects.filter(
            organization=self.organization,
            amad=amad,
        ).select_related("room")

        # Group by location
        location_quantities = {}
        for loading in loadings:
            key = (str(loading.room_id), loading.floor_number, loading.rack_number)
            if key not in location_quantities:
                location_quantities[key] = {
                    "room_id": str(loading.room_id),
                    "room_number": loading.room.number,
                    "floor_number": loading.floor_number,
                    "rack_number": loading.rack_number,
                    "quantity": 0,
                    "loaded_date": loading.date,
                }
            location_quantities[key]["quantity"] += loading.quantity
            # Track earliest loading date for FIFO
            if loading.date < location_quantities[key]["loaded_date"]:
                location_quantities[key]["loaded_date"] = loading.date

        # Subtract unloadings
        unloadings = Unloading.objects.filter(
            organization=self.organization,
            amad=amad,
        )
        for unloading in unloadings:
            key = (str(unloading.room_id), unloading.floor_number, unloading.rack_number)
            if key in location_quantities:
                location_quantities[key]["quantity"] -= unloading.quantity

        # Subtract shift outs
        shift_outs = Shifting.objects.filter(
            organization=self.organization,
            amad=amad,
        )
        for shift in shift_outs:
            from_key = (str(shift.from_room_id), shift.from_floor, shift.from_rack)
            to_key = (str(shift.to_room_id), shift.to_floor, shift.to_rack)

            if from_key in location_quantities:
                location_quantities[from_key]["quantity"] -= shift.quantity

            # Add to destination
            if to_key not in location_quantities:
                location_quantities[to_key] = {
                    "room_id": str(shift.to_room_id),
                    "room_number": shift.to_room.number,
                    "floor_number": shift.to_floor,
                    "rack_number": shift.to_rack,
                    "quantity": 0,
                    "loaded_date": shift.shift_header.date,
                }
            location_quantities[to_key]["quantity"] += shift.quantity

        # Filter and convert to list
        locations = []
        for data in location_quantities.values():
            if data["quantity"] > 0:
                locations.append(AmadLocation(
                    room_id=data["room_id"],
                    room_number=data["room_number"],
                    floor_number=data["floor_number"],
                    rack_number=data["rack_number"],
                    quantity=data["quantity"],
                    loaded_date=data["loaded_date"],
                ))

        # Sort by loaded_date (FIFO - oldest first)
        locations.sort(key=lambda x: x.loaded_date)
        return locations

    def suggest_unload_locations(self, amad_id: str, quantity: int) -> List[UnloadSuggestion]:
        """Suggest locations to unload from using FIFO."""
        locations = self.get_amad_locations(amad_id)

        suggestions = []
        remaining = quantity

        for loc in locations:
            if remaining <= 0:
                break

            unload_qty = min(loc.quantity, remaining)
            suggestions.append(UnloadSuggestion(
                room_id=loc.room_id,
                floor_number=loc.floor_number,
                rack_number=loc.rack_number,
                quantity=unload_qty,
                loaded_date=loc.loaded_date,
            ))
            remaining -= unload_qty

        return suggestions

    @transaction.atomic
    def create_unloading(self, amad_id: str, rent_id: Optional[str], locations: List[dict], user=None) -> List[Unloading]:
        """Create unloading records."""
        try:
            amad = Amad.objects.get(id=amad_id, organization=self.organization)
        except Amad.DoesNotExist:
            raise ValueError("Amad not found")

        rent = None
        if rent_id:
            try:
                rent = Rent.objects.get(id=rent_id, organization=self.organization)
            except Rent.DoesNotExist:
                raise ValueError("Rent not found")

        unloadings = []
        for loc in locations:
            unloading = Unloading.objects.create(
                organization=self.organization,
                amad=amad,
                rent=rent,
                date=loc["date"],
                room_id=loc["room"],
                floor_number=loc["floor_number"],
                rack_number=loc["rack_number"],
                quantity=loc["quantity"],
                bill_type=loc.get("bill_type", "RENT"),
                created_by=user,
            )
            unloadings.append(unloading)

        return unloadings

    # =========================================================================
    # Shifting Operations
    # =========================================================================

    @transaction.atomic
    def create_shifting(self, data: dict, user=None) -> ShiftHeader:
        """Create a shift operation with items."""
        from_room = Room.objects.get(id=data["from_room"], organization=self.organization)
        to_room = Room.objects.get(id=data["to_room"], organization=self.organization)

        # Create header
        header = ShiftHeader.objects.create(
            organization=self.organization,
            date=data["date"],
            from_room=from_room,
            to_room=to_room,
            remarks=data.get("remarks", ""),
            created_by=user,
        )

        # Create items
        for item_data in data["items"]:
            amad = Amad.objects.get(id=item_data["amad"], organization=self.organization)
            item_from_room = Room.objects.get(id=item_data["from_room"], organization=self.organization)
            item_to_room = Room.objects.get(id=item_data["to_room"], organization=self.organization)

            Shifting.objects.create(
                organization=self.organization,
                shift_header=header,
                amad=amad,
                from_room=item_from_room,
                from_floor=item_data["from_floor"],
                from_rack=item_data["from_rack"],
                to_room=item_to_room,
                to_floor=item_data["to_floor"],
                to_rack=item_data["to_rack"],
                quantity=item_data["quantity"],
                narration=item_data.get("narration", ""),
            )

        return header

    def validate_shifting(self, data: dict) -> dict:
        """Validate shift data before committing."""
        errors = []

        for idx, item in enumerate(data.get("items", [])):
            # Check source rack has enough quantity
            rack_contents = self.get_rack_contents(
                item["from_room"],
                item["from_floor"],
                item["from_rack"],
            )

            amad_item = next(
                (i for i in rack_contents["items"] if i["amad_id"] == str(item["amad"])),
                None,
            )

            if not amad_item:
                errors.append(f"Item {idx + 1}: Amad not found in source rack")
            elif amad_item["quantity"] < item["quantity"]:
                errors.append(
                    f"Item {idx + 1}: Insufficient quantity in source rack "
                    f"(available: {amad_item['quantity']}, requested: {item['quantity']})"
                )

        return {
            "valid": len(errors) == 0,
            "errors": errors,
        }

    # =========================================================================
    # Occupancy Management
    # =========================================================================

    def update_rack_occupancy(self, room_id: str, floor: int, rack: int):
        """Recalculate and update occupancy for a specific rack."""
        # Get net quantity for this rack
        loaded = Loading.objects.filter(
            organization=self.organization,
            room_id=room_id,
            floor_number=floor,
            rack_number=rack,
        ).aggregate(total=Sum("quantity"))["total"] or 0

        unloaded = Unloading.objects.filter(
            organization=self.organization,
            room_id=room_id,
            floor_number=floor,
            rack_number=rack,
        ).aggregate(total=Sum("quantity"))["total"] or 0

        shifted_out = Shifting.objects.filter(
            organization=self.organization,
            from_room_id=room_id,
            from_floor=floor,
            from_rack=rack,
        ).aggregate(total=Sum("quantity"))["total"] or 0

        shifted_in = Shifting.objects.filter(
            organization=self.organization,
            to_room_id=room_id,
            to_floor=floor,
            to_rack=rack,
        ).aggregate(total=Sum("quantity"))["total"] or 0

        current_quantity = loaded - unloaded - shifted_out + shifted_in

        RackOccupancy.objects.update_or_create(
            organization=self.organization,
            room_id=room_id,
            floor_number=floor,
            rack_number=rack,
            defaults={"current_quantity": max(0, current_quantity)},
        )

    def recalculate_room_occupancy(self, room_id: str):
        """Full recalculation of all racks in a room."""
        room = Room.objects.get(id=room_id, organization=self.organization)

        # Clear existing occupancy for this room
        RackOccupancy.objects.filter(
            organization=self.organization,
            room=room,
        ).delete()

        # Get all floor configs
        floor_configs = RoomFloor.objects.filter(
            organization=self.organization,
            room=room,
            is_active=True,
        )

        for fc in floor_configs:
            for rack_num in range(fc.from_rack, fc.to_rack + 1):
                self.update_rack_occupancy(room_id, fc.floor_number, rack_num)

    # =========================================================================
    # Temperature Operations
    # =========================================================================

    def get_temperature_status(self, room_id: str) -> TemperatureStatusData:
        """Get temperature status for a room."""
        room = Room.objects.get(id=room_id, organization=self.organization)

        # Get latest reading
        latest_reading = TemperatureReading.objects.filter(
            organization=self.organization,
            room=room,
        ).order_by("-reading_datetime").first()

        # Get threshold
        try:
            threshold = room.temperature_threshold
            target_low = threshold.target_low
            target_high = threshold.target_high
        except TemperatureThreshold.DoesNotExist:
            target_low = None
            target_high = None

        return TemperatureStatusData(
            room_id=str(room.id),
            room_number=room.number,
            room_name=room.name,
            status=latest_reading.status if latest_reading else "UNKNOWN",
            latest_low=latest_reading.low_temp if latest_reading else None,
            latest_high=latest_reading.high_temp if latest_reading else None,
            last_reading_time=latest_reading.reading_datetime if latest_reading else None,
            target_low=target_low,
            target_high=target_high,
        )

    def check_temperature_alerts(self) -> List[dict]:
        """Get all rooms with non-normal temperature status."""
        alerts = []

        # Get latest reading per room
        rooms = Room.objects.filter(
            organization=self.organization,
            is_active=True,
        )

        for room in rooms:
            latest_reading = TemperatureReading.objects.filter(
                organization=self.organization,
                room=room,
            ).order_by("-reading_datetime").first()

            if latest_reading and latest_reading.status != TemperatureStatus.NORMAL:
                try:
                    threshold = room.temperature_threshold
                    threshold_data = {
                        "target_low": str(threshold.target_low),
                        "target_high": str(threshold.target_high),
                        "warning_deviation": str(threshold.warning_deviation),
                        "critical_deviation": str(threshold.critical_deviation),
                    }
                except TemperatureThreshold.DoesNotExist:
                    threshold_data = None

                alerts.append({
                    "room_id": str(room.id),
                    "room_number": room.number,
                    "room_name": room.name,
                    "status": latest_reading.status,
                    "latest_reading": {
                        "id": str(latest_reading.id),
                        "reading_datetime": latest_reading.reading_datetime.isoformat(),
                        "low_temp": str(latest_reading.low_temp),
                        "high_temp": str(latest_reading.high_temp),
                        "status": latest_reading.status,
                    },
                    "threshold": threshold_data,
                })

        return alerts

    def get_temperature_history(self, room_id: str, days: int = 7) -> List[TemperatureReading]:
        """Get temperature history for a room."""
        from_date = datetime.now() - timedelta(days=days)

        return TemperatureReading.objects.filter(
            organization=self.organization,
            room_id=room_id,
            reading_datetime__gte=from_date,
        ).order_by("-reading_datetime")

    def get_latest_temperatures(self) -> List[dict]:
        """Get latest temperature reading per room."""
        results = []

        rooms = Room.objects.filter(
            organization=self.organization,
            is_active=True,
        )

        for room in rooms:
            latest = TemperatureReading.objects.filter(
                organization=self.organization,
                room=room,
            ).order_by("-reading_datetime").first()

            if latest:
                results.append({
                    "room_id": str(room.id),
                    "room_number": room.number,
                    "room_name": room.name,
                    "low_temp": str(latest.low_temp),
                    "high_temp": str(latest.high_temp),
                    "status": latest.status,
                    "reading_datetime": latest.reading_datetime.isoformat(),
                })
            else:
                results.append({
                    "room_id": str(room.id),
                    "room_number": room.number,
                    "room_name": room.name,
                    "low_temp": None,
                    "high_temp": None,
                    "status": "OFFLINE",
                    "reading_datetime": None,
                })

        return results
