from rest_framework import serializers

from .models import (
    BillType,
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


# =============================================================================
# RoomFloor Serializers
# =============================================================================


class RoomFloorListSerializer(serializers.ModelSerializer):
    """Serializer for listing room floors."""

    room_number = serializers.CharField(source="room.number", read_only=True)

    class Meta:
        model = RoomFloor
        fields = [
            "id",
            "room",
            "room_number",
            "floor_number",
            "from_rack",
            "to_rack",
            "rack_count",
            "is_active",
        ]


class RoomFloorDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for room floor."""

    room_number = serializers.CharField(source="room.number", read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)

    class Meta:
        model = RoomFloor
        fields = [
            "id",
            "organization",
            "room",
            "room_number",
            "room_name",
            "floor_number",
            "from_rack",
            "to_rack",
            "rack_count",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization", "rack_count", "created_at", "updated_at"]


class RoomFloorCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating room floors."""

    class Meta:
        model = RoomFloor
        fields = [
            "room",
            "floor_number",
            "from_rack",
            "to_rack",
            "is_active",
        ]

    def validate(self, attrs):
        if attrs.get("from_rack", 0) > attrs.get("to_rack", 0):
            raise serializers.ValidationError({
                "from_rack": "Starting rack must be less than or equal to ending rack."
            })
        return attrs


# =============================================================================
# Loading Serializers
# =============================================================================


class LoadingListSerializer(serializers.ModelSerializer):
    """Serializer for listing loading records."""

    party_name = serializers.CharField(source="amad.party.name", read_only=True)
    commodity_name = serializers.CharField(source="amad.commodity.name", read_only=True)
    room_number = serializers.CharField(source="room.number", read_only=True)

    class Meta:
        model = Loading
        fields = [
            "id",
            "amad",
            "amad_no",
            "date",
            "party_name",
            "commodity_name",
            "room",
            "room_number",
            "floor_number",
            "rack_number",
            "aisle",
            "quantity",
            "created_at",
        ]


class LoadingDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for loading."""

    party_name = serializers.CharField(source="amad.party.name", read_only=True)
    party_code = serializers.CharField(source="amad.party.code", read_only=True)
    commodity_name = serializers.CharField(source="amad.commodity.name", read_only=True)
    room_number = serializers.CharField(source="room.number", read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)

    class Meta:
        model = Loading
        fields = [
            "id",
            "organization",
            "amad",
            "amad_no",
            "date",
            "party_name",
            "party_code",
            "commodity_name",
            "room",
            "room_number",
            "room_name",
            "floor_number",
            "rack_number",
            "aisle",
            "quantity",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization", "amad_no", "created_at", "updated_at"]


class LoadingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating loading records."""

    class Meta:
        model = Loading
        fields = [
            "amad",
            "date",
            "room",
            "floor_number",
            "rack_number",
            "aisle",
            "quantity",
        ]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value


class BulkLoadingCreateSerializer(serializers.Serializer):
    """Serializer for bulk loading creation."""

    amad = serializers.UUIDField()
    date = serializers.DateField()
    locations = serializers.ListField(
        child=serializers.DictField(),
        min_length=1,
    )

    def validate_locations(self, value):
        for loc in value:
            required = ["room", "floor_number", "rack_number", "quantity"]
            for field in required:
                if field not in loc:
                    raise serializers.ValidationError(f"Each location must have: {required}")
        return value


# =============================================================================
# Unloading Serializers
# =============================================================================


class UnloadingListSerializer(serializers.ModelSerializer):
    """Serializer for listing unloading records."""

    amad_no = serializers.CharField(source="amad.amad_no", read_only=True)
    party_name = serializers.CharField(source="amad.party.name", read_only=True)
    room_number = serializers.CharField(source="room.number", read_only=True)
    rent_serial_no = serializers.CharField(source="rent.serial_no", read_only=True)

    class Meta:
        model = Unloading
        fields = [
            "id",
            "amad",
            "amad_no",
            "date",
            "party_name",
            "rent",
            "rent_serial_no",
            "room",
            "room_number",
            "floor_number",
            "rack_number",
            "quantity",
            "bill_type",
            "created_at",
        ]


class UnloadingDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for unloading."""

    amad_no = serializers.CharField(source="amad.amad_no", read_only=True)
    party_name = serializers.CharField(source="amad.party.name", read_only=True)
    party_code = serializers.CharField(source="amad.party.code", read_only=True)
    commodity_name = serializers.CharField(source="amad.commodity.name", read_only=True)
    room_number = serializers.CharField(source="room.number", read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)
    rent_serial_no = serializers.CharField(source="rent.serial_no", read_only=True)
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)

    class Meta:
        model = Unloading
        fields = [
            "id",
            "organization",
            "amad",
            "amad_no",
            "date",
            "party_name",
            "party_code",
            "commodity_name",
            "rent",
            "rent_serial_no",
            "room",
            "room_number",
            "room_name",
            "floor_number",
            "rack_number",
            "quantity",
            "bill_type",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class UnloadingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating unloading records."""

    class Meta:
        model = Unloading
        fields = [
            "amad",
            "rent",
            "date",
            "room",
            "floor_number",
            "rack_number",
            "quantity",
            "bill_type",
        ]

    def validate_quantity(self, value):
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than zero.")
        return value


# =============================================================================
# Shifting Serializers
# =============================================================================


class ShiftingItemSerializer(serializers.ModelSerializer):
    """Serializer for shifting items within a header."""

    amad_no = serializers.CharField(source="amad.amad_no", read_only=True)
    party_name = serializers.CharField(source="amad.party.name", read_only=True)
    from_room_number = serializers.CharField(source="from_room.number", read_only=True)
    to_room_number = serializers.CharField(source="to_room.number", read_only=True)

    class Meta:
        model = Shifting
        fields = [
            "id",
            "amad",
            "amad_no",
            "party_name",
            "from_room",
            "from_room_number",
            "from_floor",
            "from_rack",
            "to_room",
            "to_room_number",
            "to_floor",
            "to_rack",
            "quantity",
            "narration",
        ]


class ShiftHeaderListSerializer(serializers.ModelSerializer):
    """Serializer for listing shift headers."""

    from_room_number = serializers.CharField(source="from_room.number", read_only=True)
    to_room_number = serializers.CharField(source="to_room.number", read_only=True)
    item_count = serializers.IntegerField(source="items.count", read_only=True)
    total_quantity = serializers.SerializerMethodField()

    class Meta:
        model = ShiftHeader
        fields = [
            "id",
            "shift_no",
            "date",
            "from_room",
            "from_room_number",
            "to_room",
            "to_room_number",
            "item_count",
            "total_quantity",
            "remarks",
            "created_at",
        ]

    def get_total_quantity(self, obj):
        return sum(item.quantity for item in obj.items.all())


class ShiftHeaderDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for shift header with items."""

    from_room_number = serializers.CharField(source="from_room.number", read_only=True)
    from_room_name = serializers.CharField(source="from_room.name", read_only=True)
    to_room_number = serializers.CharField(source="to_room.number", read_only=True)
    to_room_name = serializers.CharField(source="to_room.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)
    items = ShiftingItemSerializer(many=True, read_only=True)

    class Meta:
        model = ShiftHeader
        fields = [
            "id",
            "organization",
            "shift_no",
            "date",
            "from_room",
            "from_room_number",
            "from_room_name",
            "to_room",
            "to_room_number",
            "to_room_name",
            "remarks",
            "items",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization", "shift_no", "created_at", "updated_at"]


class ShiftingCreateItemSerializer(serializers.Serializer):
    """Serializer for creating individual shift items."""

    amad = serializers.UUIDField()
    from_room = serializers.UUIDField()
    from_floor = serializers.IntegerField(min_value=1)
    from_rack = serializers.IntegerField(min_value=1)
    to_room = serializers.UUIDField()
    to_floor = serializers.IntegerField(min_value=1)
    to_rack = serializers.IntegerField(min_value=1)
    quantity = serializers.IntegerField(min_value=1)
    narration = serializers.CharField(required=False, allow_blank=True)


class ShiftHeaderCreateSerializer(serializers.Serializer):
    """Serializer for creating shift with items."""

    date = serializers.DateField()
    from_room = serializers.UUIDField()
    to_room = serializers.UUIDField()
    remarks = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(
        child=ShiftingCreateItemSerializer(),
        min_length=1,
    )


# =============================================================================
# Temperature Serializers
# =============================================================================


class TemperatureThresholdSerializer(serializers.ModelSerializer):
    """Serializer for temperature thresholds."""

    room_number = serializers.CharField(source="room.number", read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)

    class Meta:
        model = TemperatureThreshold
        fields = [
            "id",
            "organization",
            "room",
            "room_number",
            "room_name",
            "target_low",
            "target_high",
            "warning_deviation",
            "critical_deviation",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class TemperatureThresholdCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating temperature thresholds."""

    class Meta:
        model = TemperatureThreshold
        fields = [
            "room",
            "target_low",
            "target_high",
            "warning_deviation",
            "critical_deviation",
        ]

    def validate(self, attrs):
        if attrs.get("target_low", 0) > attrs.get("target_high", 0):
            raise serializers.ValidationError({
                "target_low": "Target low must be less than or equal to target high."
            })
        return attrs


class TemperatureReadingListSerializer(serializers.ModelSerializer):
    """Serializer for listing temperature readings."""

    room_number = serializers.CharField(source="room.number", read_only=True)

    class Meta:
        model = TemperatureReading
        fields = [
            "id",
            "room",
            "room_number",
            "floor_number",
            "reading_datetime",
            "low_temp",
            "high_temp",
            "status",
        ]


class TemperatureReadingDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for temperature reading."""

    room_number = serializers.CharField(source="room.number", read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)

    class Meta:
        model = TemperatureReading
        fields = [
            "id",
            "organization",
            "room",
            "room_number",
            "room_name",
            "floor_number",
            "reading_datetime",
            "low_temp",
            "high_temp",
            "status",
            "created_by",
            "created_by_name",
            "created_at",
        ]
        read_only_fields = ["id", "organization", "status", "created_at"]


class TemperatureReadingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating temperature readings."""

    class Meta:
        model = TemperatureReading
        fields = [
            "room",
            "floor_number",
            "reading_datetime",
            "low_temp",
            "high_temp",
        ]


class TemperatureAlertSerializer(serializers.Serializer):
    """Serializer for temperature alerts."""

    room_id = serializers.UUIDField()
    room_number = serializers.CharField()
    room_name = serializers.CharField()
    status = serializers.ChoiceField(choices=TemperatureStatus.choices)
    latest_reading = TemperatureReadingListSerializer()
    threshold = TemperatureThresholdSerializer()


# =============================================================================
# Meter Reading Serializers
# =============================================================================


class MeterReadingListSerializer(serializers.ModelSerializer):
    """Serializer for listing meter readings."""

    room_number = serializers.CharField(source="room.number", read_only=True)

    class Meta:
        model = MeterReading
        fields = [
            "id",
            "room",
            "room_number",
            "date",
            "reading_value",
            "photo_url",
            "created_at",
        ]


class MeterReadingDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for meter reading."""

    room_number = serializers.CharField(source="room.number", read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)

    class Meta:
        model = MeterReading
        fields = [
            "id",
            "organization",
            "room",
            "room_number",
            "room_name",
            "date",
            "reading_value",
            "photo_url",
            "notes",
            "created_by",
            "created_by_name",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class MeterReadingCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating meter readings."""

    class Meta:
        model = MeterReading
        fields = [
            "room",
            "date",
            "reading_value",
            "photo_url",
            "notes",
        ]


# =============================================================================
# Rack Occupancy Serializers
# =============================================================================


class RackOccupancySerializer(serializers.ModelSerializer):
    """Serializer for rack occupancy."""

    room_number = serializers.CharField(source="room.number", read_only=True)

    class Meta:
        model = RackOccupancy
        fields = [
            "id",
            "room",
            "room_number",
            "floor_number",
            "rack_number",
            "current_quantity",
            "last_updated",
        ]


class RackContentsSerializer(serializers.Serializer):
    """Serializer for rack contents with amad details."""

    rack = RackOccupancySerializer()
    items = serializers.ListField(child=serializers.DictField())
    history = serializers.ListField(child=serializers.DictField())


# =============================================================================
# Room Map Serializers
# =============================================================================


class FloorConfigSerializer(serializers.Serializer):
    """Serializer for floor configuration in room map."""

    floor_number = serializers.IntegerField()
    from_rack = serializers.IntegerField()
    to_rack = serializers.IntegerField()
    rack_count = serializers.IntegerField()


class RoomSummarySerializer(serializers.Serializer):
    """Serializer for room summary statistics."""

    total_racks = serializers.IntegerField()
    occupied_racks = serializers.IntegerField()
    total_capacity = serializers.IntegerField()
    current_load = serializers.IntegerField()
    occupancy_percent = serializers.DecimalField(max_digits=5, decimal_places=2)


class RoomMapSerializer(serializers.Serializer):
    """Serializer for complete room map visualization data."""

    room_id = serializers.UUIDField()
    room_number = serializers.CharField()
    room_name = serializers.CharField()
    floor_count = serializers.IntegerField()
    rack_count = serializers.IntegerField()
    racks_per_row = serializers.IntegerField()
    floors = FloorConfigSerializer(many=True)
    occupancy = RackOccupancySerializer(many=True)
    summary = RoomSummarySerializer()
