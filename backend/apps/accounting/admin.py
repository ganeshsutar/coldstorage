from django.contrib import admin

from .models import (
    Account,
    Daybook,
    DaybookTransaction,
    InterestCalculation,
    InterestCalculationTemp,
    PartyBankDetails,
    PartyLedger,
    PartyLedgerOpening,
)


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    """Admin configuration for Account model."""

    list_display = [
        "code",
        "name",
        "account_type",
        "balance_nature",
        "level",
        "closing_balance",
        "is_active",
        "organization",
    ]
    list_filter = ["account_type", "balance_nature", "is_active", "organization"]
    search_fields = ["code", "name", "name_hindi", "pan_number", "gst_number"]
    ordering = ["code"]
    raw_id_fields = ["parent", "organization"]

    fieldsets = [
        (None, {"fields": ["organization", "code", "name", "name_hindi"]}),
        ("Hierarchy", {"fields": ["parent", "level", "account_type", "balance_nature"]}),
        (
            "Balances",
            {
                "fields": [
                    "opening_balance",
                    "debit_balance",
                    "credit_balance",
                    "closing_balance",
                    "principal_balance",
                    "interest_balance",
                    "other_charges_balance",
                ]
            },
        ),
        (
            "Identity Documents",
            {"fields": ["pan_number", "aadhar_number", "gst_number"]},
        ),
        (
            "Contact Info",
            {"fields": ["address", "city", "state", "pincode", "phone", "email"]},
        ),
        ("Settings", {"fields": ["interest_rate", "is_active"]}),
        ("Timestamps", {"fields": ["created_at", "updated_at"]}),
    ]

    readonly_fields = [
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


@admin.register(PartyLedger)
class PartyLedgerAdmin(admin.ModelAdmin):
    """Admin configuration for PartyLedger model."""

    list_display = [
        "account",
        "serial_number",
        "voucher_type",
        "voucher_number",
        "date",
        "amount",
        "running_balance",
    ]
    list_filter = ["voucher_type", "date", "organization"]
    search_fields = ["account__code", "account__name", "voucher_number", "narration"]
    ordering = ["-date", "-serial_number"]
    raw_id_fields = ["account", "organization", "daybook_transaction"]
    date_hierarchy = "date"

    fieldsets = [
        (None, {"fields": ["organization", "account"]}),
        (
            "Voucher Info",
            {"fields": ["serial_number", "voucher_type", "voucher_number", "date", "narration"]},
        ),
        (
            "Amounts",
            {
                "fields": [
                    "amount",
                    "principal_amount",
                    "interest_amount",
                    "other_charges",
                    "running_balance",
                ]
            },
        ),
        ("References", {"fields": ["external_ref", "external_ref_type", "daybook_transaction"]}),
        ("Timestamps", {"fields": ["created_at", "updated_at"]}),
    ]

    readonly_fields = ["serial_number", "running_balance", "created_at", "updated_at"]


@admin.register(PartyLedgerOpening)
class PartyLedgerOpeningAdmin(admin.ModelAdmin):
    """Admin configuration for PartyLedgerOpening model."""

    list_display = [
        "account",
        "financial_year",
        "opening_balance",
        "principal_opening",
        "interest_opening",
    ]
    list_filter = ["financial_year", "organization"]
    search_fields = ["account__code", "account__name"]
    raw_id_fields = ["account", "organization"]

    fieldsets = [
        (None, {"fields": ["organization", "account", "financial_year"]}),
        (
            "Opening Balances",
            {
                "fields": [
                    "opening_balance",
                    "principal_opening",
                    "interest_opening",
                    "other_charges_opening",
                ]
            },
        ),
        ("Timestamps", {"fields": ["created_at", "updated_at"]}),
    ]

    readonly_fields = ["created_at", "updated_at"]


@admin.register(Daybook)
class DaybookAdmin(admin.ModelAdmin):
    """Admin configuration for Daybook model."""

    list_display = [
        "date",
        "cash_opening_dr",
        "cash_receipts",
        "cash_payments",
        "cash_closing_dr",
        "is_closed",
        "organization",
    ]
    list_filter = ["is_closed", "date", "organization"]
    search_fields = ["notes"]
    ordering = ["-date"]
    raw_id_fields = ["organization"]
    date_hierarchy = "date"

    fieldsets = [
        (None, {"fields": ["organization", "date"]}),
        (
            "Cash",
            {
                "fields": [
                    "cash_opening_dr",
                    "cash_opening_cr",
                    "cash_receipts",
                    "cash_payments",
                    "cash_closing_dr",
                    "cash_closing_cr",
                ]
            },
        ),
        (
            "Bank",
            {
                "fields": [
                    "bank_opening_dr",
                    "bank_opening_cr",
                    "bank_receipts",
                    "bank_payments",
                    "bank_closing_dr",
                    "bank_closing_cr",
                ]
            },
        ),
        ("Notes", {"fields": ["notes", "is_closed"]}),
        ("Timestamps", {"fields": ["created_at", "updated_at"]}),
    ]

    readonly_fields = [
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


@admin.register(DaybookTransaction)
class DaybookTransactionAdmin(admin.ModelAdmin):
    """Admin configuration for DaybookTransaction model."""

    list_display = [
        "voucher_number",
        "voucher_type",
        "date",
        "debit_account",
        "credit_account",
        "amount",
    ]
    list_filter = ["voucher_type", "date", "organization"]
    search_fields = [
        "voucher_number",
        "debit_account__code",
        "credit_account__code",
        "narration",
    ]
    ordering = ["-date", "-voucher_number"]
    raw_id_fields = ["organization", "daybook", "debit_account", "credit_account"]
    date_hierarchy = "date"

    fieldsets = [
        (None, {"fields": ["organization", "daybook"]}),
        (
            "Voucher Info",
            {"fields": ["voucher_type", "voucher_number", "date", "narration"]},
        ),
        (
            "Accounts",
            {"fields": ["debit_account", "credit_account", "amount"]},
        ),
        (
            "Bank Details",
            {"fields": ["is_bank_receipt", "cheque_number", "cheque_date"]},
        ),
        ("Timestamps", {"fields": ["created_at", "updated_at"]}),
    ]

    readonly_fields = ["voucher_number", "created_at", "updated_at"]


@admin.register(InterestCalculation)
class InterestCalculationAdmin(admin.ModelAdmin):
    """Admin configuration for InterestCalculation model."""

    list_display = [
        "account",
        "date",
        "balance",
        "interest_rate",
        "balance_type",
        "is_posted",
        "posted_at",
    ]
    list_filter = ["is_posted", "balance_type", "date", "organization"]
    search_fields = ["account__code", "account__name"]
    ordering = ["-date"]
    raw_id_fields = ["organization", "account", "posted_ledger_entry"]
    date_hierarchy = "date"

    fieldsets = [
        (None, {"fields": ["organization", "account"]}),
        (
            "Calculation",
            {"fields": ["date", "balance", "interest_rate", "balance_type"]},
        ),
        (
            "Posting",
            {"fields": ["is_posted", "posted_at", "posted_ledger_entry"]},
        ),
        ("Timestamps", {"fields": ["created_at", "updated_at"]}),
    ]

    readonly_fields = ["is_posted", "posted_at", "created_at", "updated_at"]


@admin.register(InterestCalculationTemp)
class InterestCalculationTempAdmin(admin.ModelAdmin):
    """Admin configuration for InterestCalculationTemp model."""

    list_display = [
        "account",
        "from_date",
        "to_date",
        "days",
        "principal",
        "interest_rate",
        "calculated_interest",
    ]
    list_filter = ["balance_type", "organization"]
    search_fields = ["account__code", "account__name"]
    ordering = ["from_date"]
    raw_id_fields = ["organization", "account", "calculation"]

    fieldsets = [
        (None, {"fields": ["organization", "account", "calculation"]}),
        (
            "Period",
            {"fields": ["from_date", "to_date", "days"]},
        ),
        (
            "Calculation",
            {"fields": ["principal", "interest_rate", "calculated_interest", "balance_type"]},
        ),
        ("Timestamps", {"fields": ["created_at"]}),
    ]

    readonly_fields = ["created_at"]


@admin.register(PartyBankDetails)
class PartyBankDetailsAdmin(admin.ModelAdmin):
    """Admin configuration for PartyBankDetails model."""

    list_display = [
        "account",
        "bank_name",
        "account_number",
        "ifsc_code",
        "is_primary",
        "is_active",
    ]
    list_filter = ["is_primary", "is_active", "organization"]
    search_fields = ["account__code", "account__name", "bank_name", "account_number", "ifsc_code"]
    raw_id_fields = ["organization", "account"]

    fieldsets = [
        (None, {"fields": ["organization", "account"]}),
        (
            "Bank Details",
            {
                "fields": [
                    "bank_name",
                    "branch_name",
                    "account_number",
                    "ifsc_code",
                    "account_holder_name",
                ]
            },
        ),
        ("Status", {"fields": ["is_primary", "is_active"]}),
        ("Timestamps", {"fields": ["created_at", "updated_at"]}),
    ]

    readonly_fields = ["created_at", "updated_at"]
