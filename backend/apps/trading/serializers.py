from decimal import Decimal

from rest_framework import serializers

from apps.inventory.models import Amad

from .models import (
    DealStatus,
    GatePass,
    GatePassItem,
    GatePassStatus,
    Katai,
    Sauda,
)


# =============================================================================
# Sauda (Deal) Serializers
# =============================================================================


class SaudaListSerializer(serializers.ModelSerializer):
    """Serializer for listing deals."""

    seller_name = serializers.CharField(source="seller.name", read_only=True)
    buyer_name = serializers.CharField(source="buyer.name", read_only=True)
    commodity_name = serializers.CharField(source="commodity.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Sauda
        fields = [
            "id",
            "deal_no",
            "deal_date",
            "seller",
            "seller_name",
            "buyer",
            "buyer_name",
            "commodity",
            "commodity_name",
            "variety",
            "quantity",
            "rate",
            "amount",
            "status",
            "status_display",
            "dispatched_quantity",
            "balance_quantity",
        ]


class GatePassNestedSerializer(serializers.ModelSerializer):
    """Minimal gate pass serializer for nesting in deal detail."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = GatePass
        fields = [
            "id",
            "gp_no",
            "gp_date",
            "total_packets",
            "total_weight",
            "vehicle_no",
            "status",
            "status_display",
        ]


class SaudaDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for a deal."""

    seller_name = serializers.CharField(source="seller.name", read_only=True)
    buyer_name = serializers.CharField(source="buyer.name", read_only=True)
    commodity_name = serializers.CharField(source="commodity.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    gate_passes = GatePassNestedSerializer(many=True, read_only=True)

    class Meta:
        model = Sauda
        fields = [
            "id",
            "organization",
            "deal_no",
            "deal_date",
            "seller",
            "seller_name",
            "buyer",
            "buyer_name",
            "commodity",
            "commodity_name",
            "variety",
            "quantity",
            "rate",
            "amount",
            "due_days",
            "due_date",
            "dispatched_quantity",
            "balance_quantity",
            "status",
            "status_display",
            "payment_terms",
            "delivery_location",
            "remarks",
            "cancelled_at",
            "cancel_reason",
            "gate_passes",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "deal_no",
            "amount",
            "dispatched_quantity",
            "balance_quantity",
            "cancelled_at",
            "created_at",
            "updated_at",
        ]


class SaudaCreateSerializer(serializers.Serializer):
    """Serializer for creating a deal."""

    deal_date = serializers.DateField()
    seller_id = serializers.UUIDField()
    buyer_id = serializers.UUIDField()
    commodity_id = serializers.UUIDField()
    variety = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    quantity = serializers.DecimalField(max_digits=12, decimal_places=2)
    rate = serializers.DecimalField(max_digits=15, decimal_places=2)
    due_days = serializers.IntegerField(required=False, default=0)
    due_date = serializers.DateField(required=False, allow_null=True)
    payment_terms = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    delivery_location = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    remarks = serializers.CharField(required=False, allow_blank=True, allow_null=True)


# =============================================================================
# Gate Pass Serializers
# =============================================================================


class GatePassItemSerializer(serializers.ModelSerializer):
    """Serializer for gate pass items in list/detail."""

    amad_no = serializers.CharField(source="amad.amad_no", read_only=True)

    class Meta:
        model = GatePassItem
        fields = [
            "id",
            "amad",
            "amad_no",
            "pkt1",
            "pkt2",
            "pkt3",
            "weight",
            "rate",
            "amount",
        ]


class GatePassListSerializer(serializers.ModelSerializer):
    """Serializer for listing gate passes."""

    seller_name = serializers.CharField(source="seller.name", read_only=True)
    buyer_name = serializers.CharField(source="buyer.name", read_only=True)
    sauda_deal_no = serializers.CharField(source="sauda.deal_no", read_only=True, default=None)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = GatePass
        fields = [
            "id",
            "gp_no",
            "gp_date",
            "seller",
            "seller_name",
            "buyer",
            "buyer_name",
            "sauda",
            "sauda_deal_no",
            "total_packets",
            "total_weight",
            "vehicle_no",
            "status",
            "status_display",
        ]


class GatePassDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for a gate pass."""

    seller_name = serializers.CharField(source="seller.name", read_only=True)
    buyer_name = serializers.CharField(source="buyer.name", read_only=True)
    sauda_deal_no = serializers.CharField(source="sauda.deal_no", read_only=True, default=None)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    items = GatePassItemSerializer(many=True, read_only=True)

    class Meta:
        model = GatePass
        fields = [
            "id",
            "organization",
            "gp_no",
            "gp_date",
            "gp_time",
            "seller",
            "seller_name",
            "buyer",
            "buyer_name",
            "sauda",
            "sauda_deal_no",
            "transport_name",
            "vehicle_no",
            "driver_name",
            "driver_contact",
            "bilti_no",
            "total_packets",
            "total_weight",
            "rate",
            "amount",
            "status",
            "status_display",
            "remarks",
            "cancelled_at",
            "cancel_reason",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "gp_no",
            "total_packets",
            "total_weight",
            "amount",
            "cancelled_at",
            "created_at",
            "updated_at",
        ]


class GatePassItemInputSerializer(serializers.Serializer):
    """Serializer for gate pass item input."""

    amad_id = serializers.UUIDField()
    pkt1 = serializers.IntegerField(required=False, default=0)
    pkt2 = serializers.IntegerField(required=False, default=0)
    pkt3 = serializers.IntegerField(required=False, default=0)
    weight = serializers.DecimalField(max_digits=12, decimal_places=2, required=False, default=Decimal("0.00"))
    rate = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, default=Decimal("0.00"))


class GatePassCreateSerializer(serializers.Serializer):
    """Serializer for creating a gate pass."""

    gp_date = serializers.DateField()
    gp_time = serializers.TimeField(required=False, allow_null=True)
    seller_id = serializers.UUIDField()
    buyer_id = serializers.UUIDField()
    sauda_id = serializers.UUIDField(required=False, allow_null=True)
    transport_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    vehicle_no = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    driver_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    driver_contact = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bilti_no = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    rate = serializers.DecimalField(max_digits=15, decimal_places=2, required=False, default=Decimal("0.00"))
    remarks = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    items = GatePassItemInputSerializer(many=True)


# =============================================================================
# Katai (Grading) Serializers
# =============================================================================


class KataiListSerializer(serializers.ModelSerializer):
    """Serializer for listing katai records."""

    party_name = serializers.CharField(source="party.name", read_only=True)
    amad_no = serializers.CharField(source="amad.amad_no", read_only=True)

    class Meta:
        model = Katai
        fields = [
            "id",
            "katai_no",
            "katai_date",
            "party",
            "party_name",
            "amad",
            "amad_no",
            "bags_graded",
            "total_charges",
        ]


class KataiDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for a katai record."""

    party_name = serializers.CharField(source="party.name", read_only=True)
    amad_no = serializers.CharField(source="amad.amad_no", read_only=True)

    class Meta:
        model = Katai
        fields = [
            "id",
            "organization",
            "katai_no",
            "katai_date",
            "party",
            "party_name",
            "amad",
            "amad_no",
            "bags_graded",
            "mota_bags",
            "chatta_bags",
            "beej_bags",
            "mix_bags",
            "gulla_bags",
            "charge_per_bag",
            "total_charges",
            "labor_name",
            "remarks",
            "ledger_entry",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "katai_no",
            "total_charges",
            "ledger_entry",
            "created_at",
            "updated_at",
        ]


class KataiCreateSerializer(serializers.Serializer):
    """Serializer for creating a katai record."""

    katai_date = serializers.DateField()
    party_id = serializers.UUIDField()
    amad_id = serializers.UUIDField()
    bags_graded = serializers.IntegerField()
    mota_bags = serializers.IntegerField(required=False, default=0)
    chatta_bags = serializers.IntegerField(required=False, default=0)
    beej_bags = serializers.IntegerField(required=False, default=0)
    mix_bags = serializers.IntegerField(required=False, default=0)
    gulla_bags = serializers.IntegerField(required=False, default=0)
    charge_per_bag = serializers.DecimalField(max_digits=10, decimal_places=2, required=False, default=Decimal("0.00"))
    labor_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    remarks = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate(self, attrs):
        bags_graded = attrs.get("bags_graded", 0)
        output_sum = (
            attrs.get("mota_bags", 0)
            + attrs.get("chatta_bags", 0)
            + attrs.get("beej_bags", 0)
            + attrs.get("mix_bags", 0)
            + attrs.get("gulla_bags", 0)
        )
        if output_sum != bags_graded:
            raise serializers.ValidationError(
                f"Output bags sum ({output_sum}) must equal bags graded ({bags_graded})"
            )
        return attrs


# =============================================================================
# Statistics Serializer
# =============================================================================


class TradingStatsSerializer(serializers.Serializer):
    """Serializer for trading statistics."""

    open_deals_count = serializers.IntegerField()
    open_deals_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    dispatched_today_bags = serializers.IntegerField()
    dispatched_today_gps = serializers.IntegerField()
    pending_delivery_value = serializers.DecimalField(max_digits=15, decimal_places=2)
    pending_delivery_count = serializers.IntegerField()
    grading_done_bags = serializers.IntegerField()


# =============================================================================
# Available Amad Serializer (for gate pass creation)
# =============================================================================


class AvailableAmadSerializer(serializers.ModelSerializer):
    """Serializer for amads available for dispatch in a gate pass."""

    party_name = serializers.CharField(source="party.name", read_only=True)
    commodity_name = serializers.CharField(source="commodity.name", read_only=True)

    class Meta:
        model = Amad
        fields = [
            "id",
            "amad_no",
            "date",
            "party",
            "party_name",
            "commodity",
            "commodity_name",
            "pkt1",
            "pkt2",
            "pkt3",
            "total_packets",
            "total_weight",
            "remaining_packets",
            "remaining_weight",
            "is_fully_dispatched",
        ]
