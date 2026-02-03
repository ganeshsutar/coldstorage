from django.contrib import admin

from .models import Amad, AmadNikasi, Commodity, Rent, Room, Takpatti, Village


@admin.register(Commodity)
class CommodityAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "variety", "grace_days", "default_rent_rate", "is_active"]
    list_filter = ["is_active", "organization"]
    search_fields = ["code", "name", "name_hindi", "variety"]
    ordering = ["code"]


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):
    list_display = ["number", "name", "capacity_quintals", "floor_count", "is_active"]
    list_filter = ["is_active", "organization"]
    search_fields = ["number", "name"]
    ordering = ["number"]


@admin.register(Village)
class VillageAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "post", "district", "state", "is_active"]
    list_filter = ["is_active", "district", "state", "organization"]
    search_fields = ["code", "name", "name_hindi", "post", "district"]
    ordering = ["code"]


@admin.register(Amad)
class AmadAdmin(admin.ModelAdmin):
    list_display = [
        "amad_no",
        "date",
        "party",
        "commodity",
        "total_packets",
        "total_weight",
        "is_fully_dispatched",
    ]
    list_filter = ["is_fully_dispatched", "amad_type", "date", "organization"]
    search_fields = ["amad_no", "party__name", "commodity__name"]
    ordering = ["-date", "-amad_no"]
    date_hierarchy = "date"


@admin.register(Rent)
class RentAdmin(admin.ModelAdmin):
    list_display = [
        "serial_no",
        "date",
        "party",
        "amad",
        "packets",
        "weight",
        "total_amount",
    ]
    list_filter = ["nikasi_type", "date", "organization"]
    search_fields = ["serial_no", "party__name", "amad__amad_no"]
    ordering = ["-date", "-serial_no"]
    date_hierarchy = "date"


@admin.register(Takpatti)
class TakpattiAdmin(admin.ModelAdmin):
    list_display = [
        "takpatti_no",
        "date",
        "amad",
        "packets",
        "net_weight",
    ]
    list_filter = ["date", "organization"]
    search_fields = ["takpatti_no", "amad__amad_no"]
    ordering = ["-date", "-takpatti_no"]
    date_hierarchy = "date"


@admin.register(AmadNikasi)
class AmadNikasiAdmin(admin.ModelAdmin):
    list_display = ["amad", "rent", "packets_dispatched", "weight_dispatched"]
    list_filter = ["organization"]
    search_fields = ["amad__amad_no", "rent__serial_no"]
