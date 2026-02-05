from decimal import Decimal

from rest_framework import serializers

from .models import (
    BardanaCondition,
    BardanaIssueHeader,
    BardanaIssueItem,
    BardanaReturnHeader,
    BardanaReturnItem,
    BardanaStatus,
    BardanaType,
)


# =============================================================================
# BardanaType Serializers
# =============================================================================


class BardanaTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = BardanaType
        fields = [
            "id",
            "code",
            "name",
            "rate_per_unit",
            "opening_stock",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class BardanaTypeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BardanaType
        fields = ["code", "name", "rate_per_unit", "opening_stock", "is_active"]


# =============================================================================
# BardanaIssueItem Serializers
# =============================================================================


class BardanaIssueItemSerializer(serializers.ModelSerializer):
    bardana_type_code = serializers.CharField(source="bardana_type.code", read_only=True)
    bardana_type_name = serializers.CharField(source="bardana_type.name", read_only=True)

    class Meta:
        model = BardanaIssueItem
        fields = [
            "id",
            "bardana_type",
            "bardana_type_code",
            "bardana_type_name",
            "qty",
            "rate",
            "amount",
        ]
        read_only_fields = ["id", "amount"]


class BardanaIssueItemInputSerializer(serializers.Serializer):
    bardana_type_id = serializers.UUIDField()
    qty = serializers.IntegerField(min_value=1)
    rate = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


# =============================================================================
# BardanaIssue Serializers
# =============================================================================


class BardanaIssueListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = BardanaIssueHeader
        fields = [
            "id",
            "voucher_no",
            "date",
            "party",
            "party_name",
            "total_qty",
            "total_amount",
            "is_advance",
            "status",
            "status_display",
        ]


class BardanaIssueDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    items = BardanaIssueItemSerializer(many=True, read_only=True)

    class Meta:
        model = BardanaIssueHeader
        fields = [
            "id",
            "organization",
            "voucher_no",
            "date",
            "party",
            "party_name",
            "total_qty",
            "total_amount",
            "remarks",
            "status",
            "status_display",
            "is_advance",
            "interest_rate_pm",
            "expected_arrival_date",
            "expected_bags",
            "reference_no",
            "confirmed_at",
            "cancelled_at",
            "cancel_reason",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "voucher_no",
            "total_qty",
            "total_amount",
            "confirmed_at",
            "cancelled_at",
            "created_at",
            "updated_at",
        ]


class BardanaIssueCreateSerializer(serializers.Serializer):
    date = serializers.DateField()
    party_id = serializers.UUIDField()
    remarks = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    is_advance = serializers.BooleanField(default=False)
    interest_rate_pm = serializers.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal("0.00")
    )
    expected_arrival_date = serializers.DateField(required=False, allow_null=True)
    expected_bags = serializers.IntegerField(required=False, allow_null=True)
    reference_no = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    items = BardanaIssueItemInputSerializer(many=True)


# =============================================================================
# BardanaReturnItem Serializers
# =============================================================================


class BardanaReturnItemSerializer(serializers.ModelSerializer):
    bardana_type_code = serializers.CharField(source="bardana_type.code", read_only=True)
    bardana_type_name = serializers.CharField(source="bardana_type.name", read_only=True)
    condition_display = serializers.CharField(source="get_condition_display", read_only=True)

    class Meta:
        model = BardanaReturnItem
        fields = [
            "id",
            "bardana_type",
            "bardana_type_code",
            "bardana_type_name",
            "qty",
            "rate",
            "amount",
            "condition",
            "condition_display",
        ]
        read_only_fields = ["id", "amount"]


class BardanaReturnItemInputSerializer(serializers.Serializer):
    bardana_type_id = serializers.UUIDField()
    qty = serializers.IntegerField(min_value=1)
    rate = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    condition = serializers.ChoiceField(
        choices=BardanaCondition.choices, default=BardanaCondition.GOOD
    )


# =============================================================================
# BardanaReturn Serializers
# =============================================================================


class BardanaReturnListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = BardanaReturnHeader
        fields = [
            "id",
            "voucher_no",
            "date",
            "party",
            "party_name",
            "total_qty",
            "total_amount",
            "status",
            "status_display",
        ]


class BardanaReturnDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    items = BardanaReturnItemSerializer(many=True, read_only=True)

    class Meta:
        model = BardanaReturnHeader
        fields = [
            "id",
            "organization",
            "voucher_no",
            "date",
            "party",
            "party_name",
            "total_qty",
            "total_amount",
            "remarks",
            "status",
            "status_display",
            "confirmed_at",
            "cancelled_at",
            "cancel_reason",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "voucher_no",
            "total_qty",
            "total_amount",
            "confirmed_at",
            "cancelled_at",
            "created_at",
            "updated_at",
        ]


class BardanaReturnCreateSerializer(serializers.Serializer):
    date = serializers.DateField()
    party_id = serializers.UUIDField()
    remarks = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    items = BardanaReturnItemInputSerializer(many=True)


# =============================================================================
# Stats Serializers
# =============================================================================


class StockKpisSerializer(serializers.Serializer):
    total_stock = serializers.IntegerField()
    issued_today = serializers.IntegerField()
    total_outstanding = serializers.IntegerField()
    returns_pending = serializers.IntegerField()


class StockTypeSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    code = serializers.CharField()
    name = serializers.CharField()
    rate_per_unit = serializers.DecimalField(max_digits=10, decimal_places=2)
    opening_stock = serializers.IntegerField()
    total_issued = serializers.IntegerField()
    total_returned = serializers.IntegerField()
    current_stock = serializers.IntegerField()
    outstanding = serializers.IntegerField()
    issued_today = serializers.IntegerField()
    returns_pending = serializers.IntegerField()


class StockSummarySerializer(serializers.Serializer):
    kpis = StockKpisSerializer()
    types = StockTypeSerializer(many=True)


class PartyTypeOutstandingSerializer(serializers.Serializer):
    bardana_type_id = serializers.UUIDField()
    bardana_type_code = serializers.CharField()
    bardana_type_name = serializers.CharField()
    issued = serializers.IntegerField()
    returned = serializers.IntegerField()
    outstanding = serializers.IntegerField()
    rate = serializers.DecimalField(max_digits=10, decimal_places=2)
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)


class PartyOutstandingSerializer(serializers.Serializer):
    party_id = serializers.UUIDField()
    party_name = serializers.CharField()
    total_issued = serializers.IntegerField()
    total_returned = serializers.IntegerField()
    total_outstanding = serializers.IntegerField()
    types = PartyTypeOutstandingSerializer(many=True)
