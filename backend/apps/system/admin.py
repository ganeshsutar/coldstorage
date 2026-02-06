from django.contrib import admin

from .models import SequenceConfig, SequenceCounter, UserActivityLog


@admin.register(UserActivityLog)
class UserActivityLogAdmin(admin.ModelAdmin):
    list_display = [
        "created_at",
        "user",
        "action_type",
        "module",
        "entry_type",
        "entry_id",
        "ip_address",
    ]
    list_filter = ["action_type", "module", "created_at"]
    search_fields = ["user__email", "entry_id", "module", "entry_type"]
    readonly_fields = [
        "id",
        "organization",
        "user",
        "action_type",
        "module",
        "entry_type",
        "entry_id",
        "details",
        "ip_address",
        "user_agent",
        "created_at",
    ]
    ordering = ["-created_at"]

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(SequenceConfig)
class SequenceConfigAdmin(admin.ModelAdmin):
    list_display = ["key", "label", "prefix", "separator", "include_year", "padding", "organization"]
    list_filter = ["organization", "include_year"]
    search_fields = ["key", "label"]


@admin.register(SequenceCounter)
class SequenceCounterAdmin(admin.ModelAdmin):
    list_display = ["key", "year", "last_number", "organization"]
    list_filter = ["organization", "year"]
    search_fields = ["key"]
