from decimal import Decimal

from rest_framework import serializers

from apps.inventory.models import Amad

from .models import (
    Advance,
    AdvanceStatus,
    LoanAgainstGoods,
    LoanLedger,
    LoanLedgerType,
    LoanStatus,
    PaymentMode,
)


# =============================================================================
# Advance Serializers
# =============================================================================


class AdvanceListSerializer(serializers.ModelSerializer):
    """Serializer for listing advances."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_mode_display = serializers.CharField(source="get_payment_mode_display", read_only=True)

    class Meta:
        model = Advance
        fields = [
            "id",
            "advance_no",
            "date",
            "party",
            "party_name",
            "bags",
            "amount",
            "adjusted_amount",
            "balance_amount",
            "payment_mode",
            "payment_mode_display",
            "status",
            "status_display",
        ]


class AdvanceDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for an advance."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_mode_display = serializers.CharField(source="get_payment_mode_display", read_only=True)

    class Meta:
        model = Advance
        fields = [
            "id",
            "organization",
            "advance_no",
            "date",
            "expected_date",
            "party",
            "party_name",
            "bags",
            "amount",
            "payment_mode",
            "payment_mode_display",
            "cheque_number",
            "cheque_date",
            "bank_name",
            "upi_reference",
            "bardana_voucher",
            "narration",
            "status",
            "status_display",
            "adjusted_amount",
            "balance_amount",
            "ledger_entry",
            "cancelled_at",
            "cancel_reason",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "advance_no",
            "party_name",
            "adjusted_amount",
            "balance_amount",
            "ledger_entry",
            "cancelled_at",
            "created_at",
            "updated_at",
        ]


class AdvanceCreateSerializer(serializers.Serializer):
    """Serializer for creating an advance."""

    date = serializers.DateField()
    expected_date = serializers.DateField(required=False, allow_null=True)
    party_id = serializers.UUIDField()
    bags = serializers.IntegerField(required=False, default=0)
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    payment_mode = serializers.ChoiceField(choices=PaymentMode.choices, default=PaymentMode.CASH)
    cheque_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    cheque_date = serializers.DateField(required=False, allow_null=True)
    bank_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    upi_reference = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    bardana_voucher = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    narration = serializers.CharField(required=False, allow_blank=True, allow_null=True)


# =============================================================================
# Loan Against Goods Serializers
# =============================================================================


class LoanListSerializer(serializers.ModelSerializer):
    """Serializer for listing loans."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_mode_display = serializers.CharField(source="get_payment_mode_display", read_only=True)

    class Meta:
        model = LoanAgainstGoods
        fields = [
            "id",
            "loan_no",
            "date",
            "party",
            "party_name",
            "amad",
            "amad_no",
            "amount",
            "interest_rate",
            "repaid_amount",
            "balance_amount",
            "accrued_interest",
            "payment_mode",
            "payment_mode_display",
            "status",
            "status_display",
        ]


class LoanDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for a loan."""

    status_display = serializers.CharField(source="get_status_display", read_only=True)
    payment_mode_display = serializers.CharField(source="get_payment_mode_display", read_only=True)

    class Meta:
        model = LoanAgainstGoods
        fields = [
            "id",
            "organization",
            "loan_no",
            "date",
            "party",
            "party_name",
            "amad",
            "amad_no",
            "amount",
            "interest_rate",
            "payment_mode",
            "payment_mode_display",
            "cheque_number",
            "cheque_date",
            "bank_name",
            "upi_reference",
            "narration",
            "status",
            "status_display",
            "repaid_amount",
            "balance_amount",
            "accrued_interest",
            "ledger_entry",
            "cancelled_at",
            "cancel_reason",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "loan_no",
            "party_name",
            "amad_no",
            "repaid_amount",
            "balance_amount",
            "accrued_interest",
            "ledger_entry",
            "cancelled_at",
            "created_at",
            "updated_at",
        ]


class LoanCreateSerializer(serializers.Serializer):
    """Serializer for creating a loan."""

    date = serializers.DateField()
    party_id = serializers.UUIDField()
    amad_id = serializers.UUIDField()
    amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    interest_rate = serializers.DecimalField(
        max_digits=5, decimal_places=2, required=False, default=Decimal("1.50")
    )
    payment_mode = serializers.ChoiceField(choices=PaymentMode.choices, default=PaymentMode.CASH)
    cheque_number = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    cheque_date = serializers.DateField(required=False, allow_null=True)
    bank_name = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    upi_reference = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    narration = serializers.CharField(required=False, allow_blank=True, allow_null=True)


# =============================================================================
# Collateral Amad Serializer
# =============================================================================


class CollateralAmadSerializer(serializers.ModelSerializer):
    """Serializer for amads eligible as loan collateral."""

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
            "total_packets",
            "total_weight",
            "remaining_packets",
            "remaining_weight",
            "is_fully_dispatched",
        ]


# =============================================================================
# Loan Ledger Serializers
# =============================================================================


class LoanLedgerEntrySerializer(serializers.ModelSerializer):
    """Serializer for loan ledger entries."""

    entry_type_display = serializers.CharField(source="get_entry_type_display", read_only=True)

    class Meta:
        model = LoanLedger
        fields = [
            "id",
            "serial_number",
            "date",
            "entry_type",
            "entry_type_display",
            "amount",
            "interest_rate",
            "running_balance",
            "amad_no",
            "narration",
            "reference_type",
            "reference_id",
            "created_at",
        ]


class PartyLoanLedgerSerializer(serializers.Serializer):
    """Serializer for party loan ledger response."""

    party_id = serializers.UUIDField()
    party_name = serializers.CharField()
    total_dr = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_cr = serializers.DecimalField(max_digits=15, decimal_places=2)
    outstanding = serializers.DecimalField(max_digits=15, decimal_places=2)
    entries = LoanLedgerEntrySerializer(many=True)


# =============================================================================
# Statistics Serializers
# =============================================================================


class LoanStatsSerializer(serializers.Serializer):
    """Serializer for loan statistics."""

    active_advances_count = serializers.IntegerField()
    active_advances_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    active_advances_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    active_loans_count = serializers.IntegerField()
    active_loans_amount = serializers.DecimalField(max_digits=15, decimal_places=2)
    active_loans_balance = serializers.DecimalField(max_digits=15, decimal_places=2)
    total_interest_accrued = serializers.DecimalField(max_digits=15, decimal_places=2)
    overdue_advances_count = serializers.IntegerField()


class InterestCalculationItemSerializer(serializers.Serializer):
    """Serializer for interest calculation items."""

    loan_id = serializers.UUIDField()
    loan_no = serializers.CharField()
    party_id = serializers.UUIDField()
    party_name = serializers.CharField()
    amad_no = serializers.CharField()
    principal = serializers.DecimalField(max_digits=15, decimal_places=2)
    interest_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    days = serializers.IntegerField()
    interest = serializers.DecimalField(max_digits=15, decimal_places=2)
    from_date = serializers.DateField()
    to_date = serializers.DateField()
