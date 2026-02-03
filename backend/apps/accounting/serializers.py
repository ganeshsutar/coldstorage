from rest_framework import serializers

from .models import (
    Account,
    AccountType,
    BalanceNature,
    Daybook,
    DaybookTransaction,
    InterestCalculation,
    InterestCalculationTemp,
    PartyBankDetails,
    PartyLedger,
    PartyLedgerOpening,
    VoucherType,
)


class AccountListSerializer(serializers.ModelSerializer):
    """Serializer for listing accounts."""

    parent_name = serializers.CharField(source="parent.name", read_only=True)
    children_count = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = [
            "id",
            "code",
            "name",
            "name_hindi",
            "parent",
            "parent_name",
            "level",
            "account_type",
            "balance_nature",
            "closing_balance",
            "is_active",
            "children_count",
        ]

    def get_children_count(self, obj):
        return obj.children.count()


class AccountDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for account."""

    parent_name = serializers.CharField(source="parent.name", read_only=True)

    class Meta:
        model = Account
        fields = [
            "id",
            "organization",
            "code",
            "name",
            "name_hindi",
            "parent",
            "parent_name",
            "level",
            "account_type",
            "balance_nature",
            "opening_balance",
            "debit_balance",
            "credit_balance",
            "closing_balance",
            "principal_balance",
            "interest_balance",
            "other_charges_balance",
            "pan_number",
            "aadhar_number",
            "gst_number",
            "address",
            "city",
            "state",
            "pincode",
            "phone",
            "email",
            "interest_rate",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "level",
            "debit_balance",
            "credit_balance",
            "closing_balance",
            "principal_balance",
            "interest_balance",
            "other_charges_balance",
            "created_at",
            "updated_at",
        ]


class AccountCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating accounts."""

    class Meta:
        model = Account
        fields = [
            "code",
            "name",
            "name_hindi",
            "parent",
            "account_type",
            "balance_nature",
            "opening_balance",
            "pan_number",
            "aadhar_number",
            "gst_number",
            "address",
            "city",
            "state",
            "pincode",
            "phone",
            "email",
            "interest_rate",
            "is_active",
        ]

    def validate_code(self, value):
        organization = self.context.get("organization")
        if organization:
            exists = Account.objects.filter(
                organization=organization, code=value
            ).exclude(pk=self.instance.pk if self.instance else None).exists()
            if exists:
                raise serializers.ValidationError("An account with this code already exists.")
        return value

    def validate_parent(self, value):
        if value and value.account_type != AccountType.GROUP:
            raise serializers.ValidationError("Parent must be a GROUP type account.")
        return value


class AccountTreeSerializer(serializers.ModelSerializer):
    """Serializer for hierarchical account tree."""

    children = serializers.SerializerMethodField()

    class Meta:
        model = Account
        fields = [
            "id",
            "code",
            "name",
            "name_hindi",
            "level",
            "account_type",
            "balance_nature",
            "closing_balance",
            "is_active",
            "children",
        ]

    def get_children(self, obj):
        if hasattr(obj, "children_list"):
            return AccountTreeSerializer(obj.children_list, many=True).data
        return []


class PartyLedgerSerializer(serializers.ModelSerializer):
    """Serializer for party ledger entries."""

    account_code = serializers.CharField(source="account.code", read_only=True)
    account_name = serializers.CharField(source="account.name", read_only=True)

    class Meta:
        model = PartyLedger
        fields = [
            "id",
            "account",
            "account_code",
            "account_name",
            "serial_number",
            "voucher_type",
            "voucher_number",
            "date",
            "narration",
            "amount",
            "principal_amount",
            "interest_amount",
            "other_charges",
            "running_balance",
            "external_ref",
            "external_ref_type",
            "daybook_transaction",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "serial_number",
            "running_balance",
            "created_at",
            "updated_at",
        ]


class PartyLedgerCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating party ledger entries."""

    class Meta:
        model = PartyLedger
        fields = [
            "account",
            "voucher_type",
            "voucher_number",
            "date",
            "narration",
            "amount",
            "principal_amount",
            "interest_amount",
            "other_charges",
            "external_ref",
            "external_ref_type",
            "daybook_transaction",
        ]

    def validate(self, attrs):
        amount = attrs.get("amount", 0)
        principal = attrs.get("principal_amount", 0)
        interest = attrs.get("interest_amount", 0)
        other = attrs.get("other_charges", 0)

        if amount == 0 and (principal or interest or other):
            attrs["amount"] = principal + interest + other
        elif amount > 0 and principal == 0 and interest == 0 and other == 0:
            attrs["principal_amount"] = amount

        return attrs


class PartyLedgerOpeningSerializer(serializers.ModelSerializer):
    """Serializer for party ledger openings."""

    account_code = serializers.CharField(source="account.code", read_only=True)
    account_name = serializers.CharField(source="account.name", read_only=True)

    class Meta:
        model = PartyLedgerOpening
        fields = [
            "id",
            "account",
            "account_code",
            "account_name",
            "financial_year",
            "opening_balance",
            "principal_opening",
            "interest_opening",
            "other_charges_opening",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class DaybookSerializer(serializers.ModelSerializer):
    """Serializer for daybook."""

    transactions_count = serializers.SerializerMethodField()

    class Meta:
        model = Daybook
        fields = [
            "id",
            "date",
            "cash_opening_dr",
            "cash_opening_cr",
            "cash_receipts",
            "cash_payments",
            "cash_closing_dr",
            "cash_closing_cr",
            "bank_opening_dr",
            "bank_opening_cr",
            "bank_receipts",
            "bank_payments",
            "bank_closing_dr",
            "bank_closing_cr",
            "notes",
            "is_closed",
            "transactions_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "cash_receipts",
            "cash_payments",
            "cash_closing_dr",
            "cash_closing_cr",
            "bank_receipts",
            "bank_payments",
            "bank_closing_dr",
            "bank_closing_cr",
            "created_at",
            "updated_at",
        ]

    def get_transactions_count(self, obj):
        return obj.transactions.count()


class DaybookTransactionSerializer(serializers.ModelSerializer):
    """Serializer for daybook transactions."""

    debit_account_code = serializers.CharField(source="debit_account.code", read_only=True)
    debit_account_name = serializers.CharField(source="debit_account.name", read_only=True)
    credit_account_code = serializers.CharField(source="credit_account.code", read_only=True)
    credit_account_name = serializers.CharField(source="credit_account.name", read_only=True)

    class Meta:
        model = DaybookTransaction
        fields = [
            "id",
            "daybook",
            "date",
            "voucher_type",
            "voucher_number",
            "debit_account",
            "debit_account_code",
            "debit_account_name",
            "credit_account",
            "credit_account_code",
            "credit_account_name",
            "amount",
            "narration",
            "is_bank_receipt",
            "cheque_number",
            "cheque_date",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "voucher_number", "created_at", "updated_at"]


class DaybookTransactionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating daybook transactions."""

    class Meta:
        model = DaybookTransaction
        fields = [
            "date",
            "voucher_type",
            "debit_account",
            "credit_account",
            "amount",
            "narration",
            "is_bank_receipt",
            "cheque_number",
            "cheque_date",
        ]

    def validate(self, attrs):
        if attrs["debit_account"] == attrs["credit_account"]:
            raise serializers.ValidationError("Debit and credit accounts cannot be the same.")
        return attrs


class InterestCalculationSerializer(serializers.ModelSerializer):
    """Serializer for interest calculations."""

    account_code = serializers.CharField(source="account.code", read_only=True)
    account_name = serializers.CharField(source="account.name", read_only=True)

    class Meta:
        model = InterestCalculation
        fields = [
            "id",
            "account",
            "account_code",
            "account_name",
            "date",
            "balance",
            "interest_rate",
            "balance_type",
            "is_posted",
            "posted_at",
            "posted_ledger_entry",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "is_posted",
            "posted_at",
            "posted_ledger_entry",
            "created_at",
            "updated_at",
        ]


class InterestCalculationTempSerializer(serializers.ModelSerializer):
    """Serializer for interest calculation temp entries."""

    account_code = serializers.CharField(source="account.code", read_only=True)
    account_name = serializers.CharField(source="account.name", read_only=True)

    class Meta:
        model = InterestCalculationTemp
        fields = [
            "id",
            "account",
            "account_code",
            "account_name",
            "calculation",
            "from_date",
            "to_date",
            "days",
            "principal",
            "interest_rate",
            "calculated_interest",
            "balance_type",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class InterestCalculationRequestSerializer(serializers.Serializer):
    """Serializer for interest calculation request."""

    account_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=False,
        help_text="List of account IDs. If empty, calculates for all accounts.",
    )
    from_date = serializers.DateField(required=True)
    to_date = serializers.DateField(required=True)
    days_in_year = serializers.IntegerField(default=365, min_value=360, max_value=366)

    def validate(self, attrs):
        if attrs["from_date"] > attrs["to_date"]:
            raise serializers.ValidationError("from_date must be before to_date")
        return attrs


class InterestPostingRequestSerializer(serializers.Serializer):
    """Serializer for posting interest to ledger."""

    calculation_ids = serializers.ListField(
        child=serializers.UUIDField(),
        required=True,
        help_text="List of interest calculation IDs to post.",
    )
    posting_date = serializers.DateField(required=True)
    narration = serializers.CharField(
        required=False,
        default="Interest charged",
        max_length=500,
    )


class PartyBankDetailsSerializer(serializers.ModelSerializer):
    """Serializer for party bank details."""

    account_code = serializers.CharField(source="account.code", read_only=True)
    account_name = serializers.CharField(source="account.name", read_only=True)

    class Meta:
        model = PartyBankDetails
        fields = [
            "id",
            "account",
            "account_code",
            "account_name",
            "bank_name",
            "branch_name",
            "account_number",
            "ifsc_code",
            "account_holder_name",
            "is_primary",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
