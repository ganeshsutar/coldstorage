from django.contrib import admin

from .models import (
    Loading,
    MeterReading,
    RackOccupancy,
    RoomFloor,
    ShiftHeader,
    Shifting,
    TemperatureReading,
    TemperatureThreshold,
    Unloading,
)


@admin.register(RoomFloor)
class RoomFloorAdmin(admin.ModelAdmin):
    list_display = ["room", "floor_number", "from_rack", "to_rack", "is_active"]
    list_filter = ["organization", "room", "is_active"]
    search_fields = ["room__number", "room__name"]


@admin.register(Loading)
class LoadingAdmin(admin.ModelAdmin):
    list_display = ["amad_no", "date", "room", "floor_number", "rack_number", "quantity"]
    list_filter = ["organization", "date", "room"]
    search_fields = ["amad_no", "amad__party__name"]
    date_hierarchy = "date"


@admin.register(Unloading)
class UnloadingAdmin(admin.ModelAdmin):
    list_display = ["amad", "date", "room", "floor_number", "rack_number", "quantity", "bill_type"]
    list_filter = ["organization", "date", "room", "bill_type"]
    search_fields = ["amad__amad_no", "amad__party__name"]
    date_hierarchy = "date"


class ShiftingInline(admin.TabularInline):
    model = Shifting
    extra = 1


@admin.register(ShiftHeader)
class ShiftHeaderAdmin(admin.ModelAdmin):
    list_display = ["shift_no", "date", "from_room", "to_room", "created_by"]
    list_filter = ["organization", "date", "from_room", "to_room"]
    search_fields = ["shift_no"]
    date_hierarchy = "date"
    inlines = [ShiftingInline]


@admin.register(Shifting)
class ShiftingAdmin(admin.ModelAdmin):
    list_display = [
        "shift_header",
        "amad",
        "from_room",
        "from_floor",
        "from_rack",
        "to_room",
        "to_floor",
        "to_rack",
        "quantity",
    ]
    list_filter = ["organization", "from_room", "to_room"]


@admin.register(TemperatureThreshold)
class TemperatureThresholdAdmin(admin.ModelAdmin):
    list_display = ["room", "target_low", "target_high", "warning_deviation", "critical_deviation"]
    list_filter = ["organization"]


@admin.register(TemperatureReading)
class TemperatureReadingAdmin(admin.ModelAdmin):
    list_display = ["room", "reading_datetime", "low_temp", "high_temp", "status"]
    list_filter = ["organization", "room", "status"]
    date_hierarchy = "reading_datetime"


@admin.register(MeterReading)
class MeterReadingAdmin(admin.ModelAdmin):
    list_display = ["room", "date", "reading_value"]
    list_filter = ["organization", "room"]
    date_hierarchy = "date"


@admin.register(RackOccupancy)
class RackOccupancyAdmin(admin.ModelAdmin):
    list_display = ["room", "floor_number", "rack_number", "current_quantity", "last_updated"]
    list_filter = ["organization", "room"]
    search_fields = ["room__number"]
