from django.contrib import admin

from .models import GatePass, GatePassItem, Katai, Sauda


class GatePassItemInline(admin.TabularInline):
    model = GatePassItem
    extra = 0
    readonly_fields = ["amount"]


@admin.register(Sauda)
class SaudaAdmin(admin.ModelAdmin):
    list_display = [
        "deal_no",
        "deal_date",
        "seller",
        "buyer",
        "commodity",
        "quantity",
        "rate",
        "amount",
        "status",
        "organization",
    ]
    list_filter = ["organization", "status", "deal_date"]
    search_fields = ["deal_no", "seller__name", "buyer__name", "commodity__name"]
    ordering = ["organization", "-deal_date", "-deal_no"]
    readonly_fields = [
        "deal_no",
        "amount",
        "dispatched_quantity",
        "balance_quantity",
    ]


@admin.register(GatePass)
class GatePassAdmin(admin.ModelAdmin):
    list_display = [
        "gp_no",
        "gp_date",
        "seller",
        "buyer",
        "sauda",
        "total_packets",
        "vehicle_no",
        "status",
        "organization",
    ]
    list_filter = ["organization", "status", "gp_date"]
    search_fields = ["gp_no", "seller__name", "buyer__name", "vehicle_no"]
    ordering = ["organization", "-gp_date", "-gp_no"]
    inlines = [GatePassItemInline]
    readonly_fields = ["gp_no", "total_packets", "total_weight", "amount"]


@admin.register(Katai)
class KataiAdmin(admin.ModelAdmin):
    list_display = [
        "katai_no",
        "katai_date",
        "party",
        "amad",
        "bags_graded",
        "total_charges",
        "organization",
    ]
    list_filter = ["organization", "katai_date"]
    search_fields = ["katai_no", "party__name", "amad__amad_no"]
    ordering = ["organization", "-katai_date", "-katai_no"]
    readonly_fields = ["katai_no", "total_charges"]
