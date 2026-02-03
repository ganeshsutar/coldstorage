from decimal import Decimal

from rest_framework import serializers

from .models import (
    Amad,
    AmadNikasi,
    AmadType,
    Commodity,
    NikasiType,
    Rent,
    Room,
    Takpatti,
    Village,
)


# =============================================================================
# Master Serializers
# =============================================================================


class CommodityListSerializer(serializers.ModelSerializer):
    """Serializer for listing commodities."""

    class Meta:
        model = Commodity
        fields = [
            "id",
            "code",
            "name",
            "name_hindi",
            "variety",
            "grace_days",
            "default_rent_rate",
            "is_active",
        ]


class CommodityDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for commodity."""

    class Meta:
        model = Commodity
        fields = [
            "id",
            "organization",
            "code",
            "name",
            "name_hindi",
            "variety",
            "grace_days",
            "default_rent_rate",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class CommodityCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating commodities."""

    class Meta:
        model = Commodity
        fields = [
            "code",
            "name",
            "name_hindi",
            "variety",
            "grace_days",
            "default_rent_rate",
            "is_active",
        ]

    def validate_code(self, value):
        organization = self.context.get("organization")
        if organization:
            exists = Commodity.objects.filter(
                organization=organization, code=value
            ).exclude(pk=self.instance.pk if self.instance else None).exists()
            if exists:
                raise serializers.ValidationError("A commodity with this code already exists.")
        return value


class RoomListSerializer(serializers.ModelSerializer):
    """Serializer for listing rooms."""

    class Meta:
        model = Room
        fields = [
            "id",
            "number",
            "name",
            "name_hindi",
            "capacity_quintals",
            "floor_count",
            "rack_count",
            "racks_per_row",
            "is_sugar_free",
            "occupancy_color",
            "target_temperature",
            "min_temperature",
            "max_temperature",
            "is_active",
        ]


class RoomDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for room."""

    class Meta:
        model = Room
        fields = [
            "id",
            "organization",
            "number",
            "name",
            "name_hindi",
            "capacity_quintals",
            "floor_count",
            "rack_count",
            "racks_per_row",
            "is_sugar_free",
            "occupancy_color",
            "target_temperature",
            "min_temperature",
            "max_temperature",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class RoomCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating rooms."""

    class Meta:
        model = Room
        fields = [
            "number",
            "name",
            "name_hindi",
            "capacity_quintals",
            "floor_count",
            "rack_count",
            "racks_per_row",
            "is_sugar_free",
            "occupancy_color",
            "target_temperature",
            "min_temperature",
            "max_temperature",
            "is_active",
        ]

    def validate_number(self, value):
        organization = self.context.get("organization")
        if organization:
            exists = Room.objects.filter(
                organization=organization, number=value
            ).exclude(pk=self.instance.pk if self.instance else None).exists()
            if exists:
                raise serializers.ValidationError("A room with this number already exists.")
        return value


class VillageListSerializer(serializers.ModelSerializer):
    """Serializer for listing villages."""

    class Meta:
        model = Village
        fields = [
            "id",
            "code",
            "name",
            "name_hindi",
            "post",
            "district",
            "state",
            "is_active",
        ]


class VillageDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for village."""

    class Meta:
        model = Village
        fields = [
            "id",
            "organization",
            "code",
            "name",
            "name_hindi",
            "post",
            "district",
            "state",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class VillageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating villages."""

    class Meta:
        model = Village
        fields = [
            "code",
            "name",
            "name_hindi",
            "post",
            "district",
            "state",
            "is_active",
        ]

    def validate_code(self, value):
        organization = self.context.get("organization")
        if organization:
            exists = Village.objects.filter(
                organization=organization, code=value
            ).exclude(pk=self.instance.pk if self.instance else None).exists()
            if exists:
                raise serializers.ValidationError("A village with this code already exists.")
        return value


# =============================================================================
# Amad Serializers
# =============================================================================


class AmadListSerializer(serializers.ModelSerializer):
    """Serializer for listing amads."""

    party_code = serializers.CharField(source="party.code", read_only=True)
    party_name = serializers.CharField(source="party.name", read_only=True)
    commodity_name = serializers.CharField(source="commodity.name", read_only=True)
    room_number = serializers.CharField(source="room.number", read_only=True)
    village_name = serializers.CharField(source="village.name", read_only=True)

    class Meta:
        model = Amad
        fields = [
            "id",
            "amad_no",
            "date",
            "party",
            "party_code",
            "party_name",
            "village",
            "village_name",
            "commodity",
            "commodity_name",
            "room",
            "room_number",
            "total_packets",
            "total_weight",
            "remaining_packets",
            "remaining_weight",
            "amad_type",
            "is_fully_dispatched",
        ]


class AmadDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for amad."""

    party_code = serializers.CharField(source="party.code", read_only=True)
    party_name = serializers.CharField(source="party.name", read_only=True)
    commodity_code = serializers.CharField(source="commodity.code", read_only=True)
    commodity_name = serializers.CharField(source="commodity.name", read_only=True)
    room_number = serializers.CharField(source="room.number", read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)
    village_code = serializers.CharField(source="village.code", read_only=True)
    village_name = serializers.CharField(source="village.name", read_only=True)

    class Meta:
        model = Amad
        fields = [
            "id",
            "organization",
            "amad_no",
            "date",
            "party",
            "party_code",
            "party_name",
            "village",
            "village_code",
            "village_name",
            "commodity",
            "commodity_code",
            "commodity_name",
            "room",
            "room_number",
            "room_name",
            "pkt1",
            "pwt1",
            "pkt2",
            "pwt2",
            "pkt3",
            "pwt3",
            "total_packets",
            "total_weight",
            "marks",
            "grace_days",
            "rent_rate",
            "amad_type",
            "e_way_bill",
            "is_fully_dispatched",
            "remaining_packets",
            "remaining_weight",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "amad_no",
            "total_packets",
            "total_weight",
            "remaining_packets",
            "remaining_weight",
            "is_fully_dispatched",
            "created_at",
            "updated_at",
        ]


class AmadCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating amads."""

    class Meta:
        model = Amad
        fields = [
            "date",
            "party",
            "village",
            "commodity",
            "room",
            "pkt1",
            "pwt1",
            "pkt2",
            "pwt2",
            "pkt3",
            "pwt3",
            "marks",
            "grace_days",
            "rent_rate",
            "amad_type",
            "e_way_bill",
        ]

    def validate(self, attrs):
        # Ensure at least some packets/weight are provided
        pkt1 = attrs.get("pkt1", 0) or 0
        pkt2 = attrs.get("pkt2", 0) or 0
        pkt3 = attrs.get("pkt3", 0) or 0

        if pkt1 + pkt2 + pkt3 == 0:
            raise serializers.ValidationError(
                {"pkt1": "At least one packet type must have a value."}
            )

        return attrs


# =============================================================================
# Rent Serializers
# =============================================================================


class RentListSerializer(serializers.ModelSerializer):
    """Serializer for listing rents."""

    party_code = serializers.CharField(source="party.code", read_only=True)
    party_name = serializers.CharField(source="party.name", read_only=True)
    amad_no = serializers.CharField(source="amad.amad_no", read_only=True)
    commodity_name = serializers.CharField(source="amad.commodity.name", read_only=True)

    class Meta:
        model = Rent
        fields = [
            "id",
            "serial_no",
            "date",
            "party",
            "party_code",
            "party_name",
            "amad",
            "amad_no",
            "commodity_name",
            "packets",
            "weight",
            "storage_days",
            "rent_amount",
            "gst_amount",
            "total_amount",
            "nikasi_type",
        ]


class RentDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for rent."""

    party_code = serializers.CharField(source="party.code", read_only=True)
    party_name = serializers.CharField(source="party.name", read_only=True)
    amad_no = serializers.CharField(source="amad.amad_no", read_only=True)
    amad_date = serializers.DateField(source="amad.date", read_only=True)
    commodity_name = serializers.CharField(source="amad.commodity.name", read_only=True)
    receiver_name_from_account = serializers.CharField(
        source="receiver_account.name", read_only=True
    )

    class Meta:
        model = Rent
        fields = [
            "id",
            "organization",
            "serial_no",
            "date",
            "party",
            "party_code",
            "party_name",
            "receiver_name",
            "receiver_account",
            "receiver_name_from_account",
            "amad",
            "amad_no",
            "amad_date",
            "commodity_name",
            "packets",
            "weight",
            "storage_days",
            "rent_rate",
            "rent_amount",
            "gst_percent",
            "gst_amount",
            "total_amount",
            "nikasi_type",
            "vehicle_no",
            "narration",
            "ledger_entry",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "serial_no",
            "total_amount",
            "created_at",
            "updated_at",
        ]


class RentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating rents."""

    class Meta:
        model = Rent
        fields = [
            "date",
            "party",
            "receiver_name",
            "receiver_account",
            "amad",
            "packets",
            "weight",
            "storage_days",
            "rent_rate",
            "rent_amount",
            "gst_percent",
            "gst_amount",
            "nikasi_type",
            "vehicle_no",
            "narration",
        ]

    def validate(self, attrs):
        amad = attrs.get("amad")
        packets = attrs.get("packets", 0)
        weight = attrs.get("weight", Decimal("0.00"))

        if amad:
            # Validate packets don't exceed remaining
            if packets > amad.remaining_packets:
                raise serializers.ValidationError({
                    "packets": f"Cannot dispatch more than {amad.remaining_packets} remaining packets."
                })

            # Validate weight doesn't exceed remaining
            if weight > amad.remaining_weight:
                raise serializers.ValidationError({
                    "weight": f"Cannot dispatch more than {amad.remaining_weight} kg remaining weight."
                })

            # Ensure party matches amad's party
            if attrs.get("party") != amad.party:
                raise serializers.ValidationError({
                    "party": "Party must match the Amad's depositor party."
                })

        return attrs


class RentCalculationSerializer(serializers.Serializer):
    """Serializer for rent calculation preview."""

    amad_id = serializers.UUIDField()
    dispatch_date = serializers.DateField()
    packets = serializers.IntegerField(min_value=1)
    weight = serializers.DecimalField(max_digits=12, decimal_places=2, min_value=Decimal("0.01"))


class RentCalculationResultSerializer(serializers.Serializer):
    """Serializer for rent calculation result."""

    amad_no = serializers.CharField()
    amad_date = serializers.DateField()
    dispatch_date = serializers.DateField()
    packets = serializers.IntegerField()
    weight = serializers.DecimalField(max_digits=12, decimal_places=2)
    weight_quintals = serializers.DecimalField(max_digits=12, decimal_places=4)
    storage_days = serializers.IntegerField()
    grace_days = serializers.IntegerField()
    billable_days = serializers.IntegerField()
    rent_rate = serializers.DecimalField(max_digits=10, decimal_places=2)
    rent_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    gst_percent = serializers.DecimalField(max_digits=5, decimal_places=2)
    gst_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)


# =============================================================================
# Takpatti Serializers
# =============================================================================


class TakpattiListSerializer(serializers.ModelSerializer):
    """Serializer for listing takpattis."""

    amad_no = serializers.CharField(source="amad.amad_no", read_only=True)
    party_name = serializers.CharField(source="amad.party.name", read_only=True)
    room_number = serializers.CharField(source="room.number", read_only=True)

    class Meta:
        model = Takpatti
        fields = [
            "id",
            "takpatti_no",
            "date",
            "amad",
            "amad_no",
            "party_name",
            "packets",
            "gross_weight",
            "tare_weight",
            "net_weight",
            "room",
            "room_number",
            "floor_no",
        ]


class TakpattiDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for takpatti."""

    amad_no = serializers.CharField(source="amad.amad_no", read_only=True)
    party_name = serializers.CharField(source="amad.party.name", read_only=True)
    room_number = serializers.CharField(source="room.number", read_only=True)
    room_name = serializers.CharField(source="room.name", read_only=True)

    class Meta:
        model = Takpatti
        fields = [
            "id",
            "organization",
            "takpatti_no",
            "date",
            "amad",
            "amad_no",
            "party_name",
            "packets",
            "gross_weight",
            "tare_weight",
            "net_weight",
            "room",
            "room_number",
            "room_name",
            "floor_no",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "takpatti_no",
            "net_weight",
            "created_at",
            "updated_at",
        ]


class TakpattiCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating takpattis."""

    class Meta:
        model = Takpatti
        fields = [
            "date",
            "amad",
            "packets",
            "gross_weight",
            "tare_weight",
            "room",
            "floor_no",
        ]


# =============================================================================
# AmadNikasi Serializers
# =============================================================================


class AmadNikasiSerializer(serializers.ModelSerializer):
    """Serializer for amad-nikasi links."""

    amad_no = serializers.CharField(source="amad.amad_no", read_only=True)
    rent_serial_no = serializers.CharField(source="rent.serial_no", read_only=True)

    class Meta:
        model = AmadNikasi
        fields = [
            "id",
            "amad",
            "amad_no",
            "rent",
            "rent_serial_no",
            "packets_dispatched",
            "weight_dispatched",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


# =============================================================================
# Stock Summary Serializers
# =============================================================================


class StockSummarySerializer(serializers.Serializer):
    """Serializer for stock summary."""

    total_amads = serializers.IntegerField()
    active_amads = serializers.IntegerField()
    total_packets = serializers.IntegerField()
    total_weight = serializers.DecimalField(max_digits=15, decimal_places=2)
    remaining_packets = serializers.IntegerField()
    remaining_weight = serializers.DecimalField(max_digits=15, decimal_places=2)
    fully_dispatched = serializers.IntegerField()


class PartyStockSerializer(serializers.Serializer):
    """Serializer for party-wise stock."""

    party_id = serializers.UUIDField()
    party_code = serializers.CharField()
    party_name = serializers.CharField()
    amads = AmadListSerializer(many=True)
    total_packets = serializers.IntegerField()
    total_weight = serializers.DecimalField(max_digits=15, decimal_places=2)
    remaining_packets = serializers.IntegerField()
    remaining_weight = serializers.DecimalField(max_digits=15, decimal_places=2)


class CommodityStockSerializer(serializers.Serializer):
    """Serializer for commodity-wise stock summary."""

    commodity_id = serializers.UUIDField()
    commodity_code = serializers.CharField()
    commodity_name = serializers.CharField()
    total_packets = serializers.IntegerField()
    total_weight = serializers.DecimalField(max_digits=15, decimal_places=2)
    remaining_packets = serializers.IntegerField()
    remaining_weight = serializers.DecimalField(max_digits=15, decimal_places=2)


class RoomStockSerializer(serializers.Serializer):
    """Serializer for room-wise stock summary."""

    room_id = serializers.UUIDField()
    room_number = serializers.CharField()
    room_name = serializers.CharField()
    capacity_quintals = serializers.DecimalField(max_digits=10, decimal_places=2)
    occupied_quintals = serializers.DecimalField(max_digits=12, decimal_places=2)
    utilization_percent = serializers.DecimalField(max_digits=5, decimal_places=2)
    total_packets = serializers.IntegerField()
