from django.contrib import admin

from .models import Bank, GstRate, LaborRate


@admin.register(GstRate)
class GstRateAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "description",
        "cgst_rate",
        "sgst_rate",
        "igst_rate",
        "hsn_code",
        "is_default",
        "is_active",
        "organization",
    ]
    list_filter = ["organization", "is_active", "is_default"]
    search_fields = ["code", "description", "hsn_code"]
    ordering = ["organization", "code"]


@admin.register(Bank)
class BankAdmin(admin.ModelAdmin):
    list_display = [
        "code",
        "name",
        "ifsc_pattern",
        "is_active",
        "organization",
    ]
    list_filter = ["organization", "is_active"]
    search_fields = ["code", "name", "ifsc_pattern"]
    ordering = ["organization", "name"]


@admin.register(LaborRate)
class LaborRateAdmin(admin.ModelAdmin):
    list_display = [
        "rate_type",
        "packet_type",
        "rate",
        "effective_from",
        "is_active",
        "organization",
    ]
    list_filter = ["organization", "rate_type", "is_active"]
    search_fields = ["rate_type"]
    ordering = ["organization", "-effective_from", "rate_type"]
