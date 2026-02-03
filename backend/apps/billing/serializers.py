from decimal import Decimal

from rest_framework import serializers

from apps.inventory.models import Amad
from apps.masters.serializers import GstRateListSerializer

from .models import (
    BillStatus,
    ChargeComponent,
    GstType,
    PaymentMode,
    PriceBreakup,
    Receipt,
    ReceiptAllocation,
    RentBillHeader,
    RentBillItem,
)


# =============================================================================
# Rent Bill Item Serializers
# =============================================================================


class RentBillItemListSerializer(serializers.ModelSerializer):
    """Serializer for listing rent bill items."""

    class Meta:
        model = RentBillItem
        fields = [
            "id",
            "amad_no",
            "amad_date",
            "commodity_name",
            "total_packets",
            "weight_qtl",
            "storage_days",
            "grace_days",
            "billable_days",
            "rate_per_qtl",
            "rent_amount",
        ]


class RentBillItemCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating rent bill items."""

    class Meta:
        model = RentBillItem
        fields = [
            "amad",
            "dispatch_date",
            "grace_days",
            "rate_per_qtl",
            "rate_per_bag",
            "rent_amount",
        ]


# =============================================================================
# Price Breakup Serializers
# =============================================================================


class PriceBreakupSerializer(serializers.ModelSerializer):
    """Serializer for price breakups."""

    component_display = serializers.CharField(source="get_component_display", read_only=True)

    class Meta:
        model = PriceBreakup
        fields = [
            "id",
            "component",
            "component_display",
            "hsn_code",
            "description",
            "rate",
            "quantity",
            "unit",
            "amount",
        ]


# =============================================================================
# Rent Bill Serializers
# =============================================================================


class RentBillListSerializer(serializers.ModelSerializer):
    """Serializer for listing rent bills."""

    party_code = serializers.CharField(source="party.code", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    gst_type_display = serializers.CharField(source="get_gst_type_display", read_only=True)

    class Meta:
        model = RentBillHeader
        fields = [
            "id",
            "bill_no",
            "bill_date",
            "party",
            "party_code",
            "party_name",
            "taxable_amount",
            "total_gst",
            "net_amount",
            "paid_amount",
            "balance_amount",
            "status",
            "status_display",
            "gst_type",
            "gst_type_display",
        ]


class RentBillDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for rent bill."""

    party_code = serializers.CharField(source="party.code", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    gst_type_display = serializers.CharField(source="get_gst_type_display", read_only=True)
    items = RentBillItemListSerializer(many=True, read_only=True)
    breakups = PriceBreakupSerializer(many=True, read_only=True)
    gst_rate_info = GstRateListSerializer(source="gst_rate", read_only=True)

    class Meta:
        model = RentBillHeader
        fields = [
            "id",
            "organization",
            "bill_no",
            "bill_date",
            "party",
            "party_code",
            "party_name",
            "party_gstin",
            "party_state",
            # Charges
            "rent_amount",
            "loading_charges",
            "unloading_charges",
            "dala_charges",
            "katai_charges",
            "insurance_amount",
            "reload_charges",
            "dump_charges",
            "other_charges",
            "discount_amount",
            # Computed
            "taxable_amount",
            # GST
            "gst_rate",
            "gst_rate_info",
            "gst_type",
            "gst_type_display",
            "cgst_rate",
            "cgst_amount",
            "sgst_rate",
            "sgst_amount",
            "igst_rate",
            "igst_amount",
            "total_gst",
            # TDS
            "tds_rate",
            "tds_amount",
            # Final
            "total_amount",
            "round_off",
            "net_amount",
            "paid_amount",
            "balance_amount",
            # Status
            "status",
            "status_display",
            # Audit
            "confirmed_at",
            "cancelled_at",
            "cancel_reason",
            "notes",
            # Related
            "items",
            "breakups",
            # Timestamps
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "bill_no",
            "taxable_amount",
            "cgst_amount",
            "sgst_amount",
            "igst_amount",
            "total_gst",
            "tds_amount",
            "total_amount",
            "round_off",
            "net_amount",
            "balance_amount",
            "confirmed_at",
            "cancelled_at",
            "created_at",
            "updated_at",
        ]


class RentBillItemInputSerializer(serializers.Serializer):
    """Serializer for bill item input in wizard."""

    amad_id = serializers.UUIDField()
    dispatch_date = serializers.DateField(required=False)
    grace_days = serializers.IntegerField(required=False, default=0)
    rate_per_qtl = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    rent_amount = serializers.DecimalField(
        max_digits=15, decimal_places=2, required=False
    )


class RentBillCreateSerializer(serializers.Serializer):
    """Serializer for creating rent bills via wizard."""

    bill_date = serializers.DateField()
    party_id = serializers.UUIDField()
    gst_rate_id = serializers.UUIDField(required=False, allow_null=True)
    gst_type = serializers.ChoiceField(choices=GstType.choices, default=GstType.INTRA_STATE)

    # Charges
    loading_charges = serializers.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal("0.00")
    )
    unloading_charges = serializers.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal("0.00")
    )
    dala_charges = serializers.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal("0.00")
    )
    katai_charges = serializers.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal("0.00")
    )
    insurance_amount = serializers.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal("0.00")
    )
    reload_charges = serializers.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal("0.00")
    )
    dump_charges = serializers.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal("0.00")
    )
    other_charges = serializers.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal("0.00")
    )
    discount_amount = serializers.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal("0.00")
    )

    # TDS
    tds_rate = serializers.DecimalField(
        max_digits=5, decimal_places=2, default=Decimal("0.00")
    )

    # Items
    items = RentBillItemInputSerializer(many=True)

    # Notes
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)


# =============================================================================
# Billable Amad Serializers
# =============================================================================


class BillableAmadSerializer(serializers.ModelSerializer):
    """Serializer for amads available for billing."""

    party_code = serializers.CharField(source="party.code", read_only=True)
    party_name = serializers.CharField(source="party.name", read_only=True)
    commodity_name = serializers.CharField(source="commodity.name", read_only=True)
    room_number = serializers.CharField(source="room.number", read_only=True)
    weight_qtl = serializers.SerializerMethodField()
    suggested_rent = serializers.SerializerMethodField()
    storage_days = serializers.SerializerMethodField()

    class Meta:
        model = Amad
        fields = [
            "id",
            "amad_no",
            "date",
            "party",
            "party_code",
            "party_name",
            "commodity",
            "commodity_name",
            "room",
            "room_number",
            "pkt1",
            "pkt2",
            "pkt3",
            "total_packets",
            "total_weight",
            "weight_qtl",
            "remaining_packets",
            "remaining_weight",
            "grace_days",
            "rent_rate",
            "is_fully_dispatched",
            "storage_days",
            "suggested_rent",
        ]

    def get_weight_qtl(self, obj):
        return obj.total_weight / 100

    def get_storage_days(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        return (today - obj.date).days

    def get_suggested_rent(self, obj):
        from django.utils import timezone
        today = timezone.now().date()
        days = (today - obj.date).days
        billable_days = max(0, days - obj.grace_days)
        weight_qtl = obj.total_weight / 100
        # Monthly rate converted to daily
        daily_rate = obj.rent_rate / 30
        return round(weight_qtl * daily_rate * billable_days, 2)


# =============================================================================
# Receipt Serializers
# =============================================================================


class ReceiptAllocationSerializer(serializers.ModelSerializer):
    """Serializer for receipt allocations."""

    bill_no = serializers.CharField(source="rent_bill.bill_no", read_only=True)
    bill_date = serializers.DateField(source="rent_bill.bill_date", read_only=True)
    bill_amount = serializers.DecimalField(
        source="rent_bill.net_amount",
        max_digits=15,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = ReceiptAllocation
        fields = [
            "id",
            "rent_bill",
            "bill_no",
            "bill_date",
            "bill_amount",
            "allocated_amount",
        ]


class ReceiptListSerializer(serializers.ModelSerializer):
    """Serializer for listing receipts."""

    party_code = serializers.CharField(source="party.code", read_only=True)
    party_name = serializers.CharField(source="party.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_mode_display = serializers.CharField(source="get_payment_mode_display", read_only=True)

    class Meta:
        model = Receipt
        fields = [
            "id",
            "receipt_no",
            "receipt_date",
            "party",
            "party_code",
            "party_name",
            "amount",
            "payment_mode",
            "payment_mode_display",
            "status",
            "status_display",
        ]


class ReceiptDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for receipt."""

    party_code = serializers.CharField(source="party.code", read_only=True)
    party_name = serializers.CharField(source="party.name", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_mode_display = serializers.CharField(source="get_payment_mode_display", read_only=True)
    allocations = ReceiptAllocationSerializer(many=True, read_only=True)

    class Meta:
        model = Receipt
        fields = [
            "id",
            "organization",
            "receipt_no",
            "receipt_date",
            "party",
            "party_code",
            "party_name",
            "amount",
            "amount_in_words",
            "payment_mode",
            "payment_mode_display",
            # Cheque
            "cheque_no",
            "cheque_date",
            "bank_name",
            "branch_name",
            "is_pdc",
            "is_cleared",
            # Bank
            "bank_ref_no",
            "upi_ref_no",
            # Details
            "narration",
            "status",
            "status_display",
            # Audit
            "confirmed_at",
            "cancelled_at",
            "cancel_reason",
            # Allocations
            "allocations",
            # Timestamps
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "receipt_no",
            "confirmed_at",
            "cancelled_at",
            "created_at",
            "updated_at",
        ]


class ReceiptAllocationInputSerializer(serializers.Serializer):
    """Serializer for allocation input."""

    rent_bill_id = serializers.UUIDField()
    allocated_amount = serializers.DecimalField(max_digits=15, decimal_places=2)


class ReceiptCreateSerializer(serializers.Serializer):
    """Serializer for creating receipts."""

    receipt_date = serializers.DateField()
    party_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    payment_mode = serializers.ChoiceField(choices=PaymentMode.choices, default=PaymentMode.CASH)

    # Cheque details
    cheque_no = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    cheque_date = serializers.DateField(required=False, allow_null=True)
    bank_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    branch_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    is_pdc = serializers.BooleanField(default=False)

    # Bank details
    bank_ref_no = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    upi_ref_no = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    # Narration
    narration = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    # Allocations
    allocations = ReceiptAllocationInputSerializer(many=True, required=False)

    def validate(self, attrs):
        payment_mode = attrs.get("payment_mode")

        if payment_mode == PaymentMode.CHEQUE:
            if not attrs.get("cheque_no"):
                raise serializers.ValidationError({
                    "cheque_no": "Cheque number is required for cheque payments."
                })

        return attrs


# =============================================================================
# Statistics Serializers
# =============================================================================


class BillingStatsSerializer(serializers.Serializer):
    """Serializer for billing statistics."""

    bills_this_month = serializers.IntegerField()
    bills_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    pending_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    collections_this_month = serializers.DecimalField(max_digits=15, decimal_places=2)
    gst_payable = serializers.DecimalField(max_digits=15, decimal_places=2)


class PartyOutstandingSerializer(serializers.Serializer):
    """Serializer for party outstanding bills."""

    party_id = serializers.UUIDField()
    party_code = serializers.CharField()
    party_name = serializers.CharField()
    total_bills = serializers.IntegerField()
    total_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    paid_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    outstanding_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    bills = RentBillListSerializer(many=True)
