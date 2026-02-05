from django.contrib import admin

from .models import Advance, LoanAgainstGoods, LoanLedger


@admin.register(Advance)
class AdvanceAdmin(admin.ModelAdmin):
    list_display = [
        "advance_no",
        "date",
        "party_name",
        "amount",
        "balance_amount",
        "status",
        "organization",
    ]
    list_filter = ["organization", "status", "date", "payment_mode"]
    search_fields = ["advance_no", "party_name", "party__name"]
    ordering = ["organization", "-date", "-advance_no"]
    readonly_fields = ["advance_no", "party_name", "adjusted_amount", "balance_amount"]


@admin.register(LoanAgainstGoods)
class LoanAgainstGoodsAdmin(admin.ModelAdmin):
    list_display = [
        "loan_no",
        "date",
        "party_name",
        "amad_no",
        "amount",
        "balance_amount",
        "interest_rate",
        "status",
        "organization",
    ]
    list_filter = ["organization", "status", "date", "payment_mode"]
    search_fields = ["loan_no", "party_name", "party__name", "amad_no"]
    ordering = ["organization", "-date", "-loan_no"]
    readonly_fields = [
        "loan_no",
        "party_name",
        "amad_no",
        "repaid_amount",
        "balance_amount",
        "accrued_interest",
    ]


@admin.register(LoanLedger)
class LoanLedgerAdmin(admin.ModelAdmin):
    list_display = [
        "party",
        "serial_number",
        "date",
        "entry_type",
        "amount",
        "running_balance",
        "reference_type",
        "organization",
    ]
    list_filter = ["organization", "entry_type", "reference_type", "date"]
    search_fields = ["party__name", "narration"]
    ordering = ["organization", "party", "-serial_number"]
    readonly_fields = ["serial_number", "running_balance"]
