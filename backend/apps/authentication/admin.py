from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Organization, OrganizationMembership, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Admin configuration for User model."""

    list_display = ["email", "full_name", "is_active", "is_staff", "created_at"]
    list_filter = ["is_active", "is_staff", "email_verified", "created_at"]
    search_fields = ["email", "full_name", "phone"]
    ordering = ["-created_at"]

    fieldsets = [
        (None, {"fields": ["email", "password"]}),
        ("Personal Info", {"fields": ["full_name", "phone", "avatar_url"]}),
        (
            "Permissions",
            {
                "fields": [
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "email_verified",
                    "groups",
                    "user_permissions",
                ]
            },
        ),
        ("Important dates", {"fields": ["last_login_at", "created_at", "updated_at"]}),
    ]

    readonly_fields = ["last_login_at", "created_at", "updated_at"]

    add_fieldsets = [
        (
            None,
            {
                "classes": ["wide"],
                "fields": ["email", "full_name", "password1", "password2"],
            },
        ),
    ]


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    """Admin configuration for Organization model."""

    list_display = ["name", "slug", "billing_status", "is_active", "created_at"]
    list_filter = ["billing_status", "is_active", "is_configured"]
    search_fields = ["name", "slug", "email", "gst_no"]
    ordering = ["-created_at"]
    prepopulated_fields = {"slug": ["name"]}

    fieldsets = [
        (None, {"fields": ["name", "name_hindi", "slug"]}),
        (
            "Contact Info",
            {"fields": ["address", "city", "state", "phone", "email", "gst_no"]},
        ),
        ("Branding", {"fields": ["logo_url"]}),
        (
            "Settings",
            {"fields": ["timezone", "financial_year_start", "settings"]},
        ),
        (
            "Billing",
            {"fields": ["billing_status", "subscription_plan"]},
        ),
        (
            "Status",
            {"fields": ["is_active", "is_configured", "created_at", "updated_at"]},
        ),
    ]

    readonly_fields = ["created_at", "updated_at"]


@admin.register(OrganizationMembership)
class OrganizationMembershipAdmin(admin.ModelAdmin):
    """Admin configuration for OrganizationMembership model."""

    list_display = ["user", "organization", "role", "status", "is_default", "joined_at"]
    list_filter = ["role", "status", "is_default"]
    search_fields = ["user__email", "user__full_name", "organization__name"]
    ordering = ["-created_at"]
    raw_id_fields = ["user", "organization", "invited_by"]

    fieldsets = [
        (None, {"fields": ["user", "organization"]}),
        ("Role & Status", {"fields": ["role", "status", "is_default"]}),
        ("Invitation", {"fields": ["invited_by", "invited_at", "joined_at"]}),
        ("Timestamps", {"fields": ["created_at", "updated_at"]}),
    ]

    readonly_fields = ["created_at", "updated_at"]
