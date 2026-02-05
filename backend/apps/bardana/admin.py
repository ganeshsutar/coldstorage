from django.contrib import admin

from .models import (
    BardanaIssueHeader,
    BardanaIssueItem,
    BardanaReturnHeader,
    BardanaReturnItem,
    BardanaType,
)


@admin.register(BardanaType)
class BardanaTypeAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "rate_per_unit", "opening_stock", "is_active", "organization"]
    list_filter = ["organization", "is_active"]
    search_fields = ["code", "name"]
    ordering = ["organization", "code"]


class BardanaIssueItemInline(admin.TabularInline):
    model = BardanaIssueItem
    extra = 0


@admin.register(BardanaIssueHeader)
class BardanaIssueHeaderAdmin(admin.ModelAdmin):
    list_display = [
        "voucher_no",
        "date",
        "party_name",
        "total_qty",
        "total_amount",
        "status",
        "organization",
    ]
    list_filter = ["organization", "status", "date"]
    search_fields = ["voucher_no", "party_name"]
    ordering = ["organization", "-date", "-voucher_no"]
    inlines = [BardanaIssueItemInline]
    readonly_fields = ["voucher_no", "total_qty", "total_amount"]


class BardanaReturnItemInline(admin.TabularInline):
    model = BardanaReturnItem
    extra = 0


@admin.register(BardanaReturnHeader)
class BardanaReturnHeaderAdmin(admin.ModelAdmin):
    list_display = [
        "voucher_no",
        "date",
        "party_name",
        "total_qty",
        "total_amount",
        "status",
        "organization",
    ]
    list_filter = ["organization", "status", "date"]
    search_fields = ["voucher_no", "party_name"]
    ordering = ["organization", "-date", "-voucher_no"]
    inlines = [BardanaReturnItemInline]
    readonly_fields = ["voucher_no", "total_qty", "total_amount"]
