from rest_framework import serializers

from apps.authentication.models import Organization, OrganizationMembership, User

from .models import UserActivityLog


# ============== Company Settings Serializers ==============


class CompanySettingsSerializer(serializers.Serializer):
    """Serializer for company settings."""

    # From Organization model
    name = serializers.CharField(max_length=255)
    name_hindi = serializers.CharField(max_length=255, required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(max_length=100, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    gst_no = serializers.CharField(max_length=20, required=False, allow_blank=True)
    logo_url = serializers.URLField(required=False, allow_blank=True)

    # From Organization.settings JSON
    pan = serializers.CharField(max_length=20, required=False, allow_blank=True)
    tan = serializers.CharField(max_length=20, required=False, allow_blank=True)
    cin = serializers.CharField(max_length=30, required=False, allow_blank=True)
    owner_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    owner_aadhar = serializers.CharField(max_length=20, required=False, allow_blank=True)
    upi_id = serializers.CharField(max_length=100, required=False, allow_blank=True)
    fax = serializers.CharField(max_length=20, required=False, allow_blank=True)


class TaxSettingsSerializer(serializers.Serializer):
    """Serializer for tax settings."""

    default_cgst = serializers.DecimalField(
        max_digits=5, decimal_places=2, required=False
    )
    default_sgst = serializers.DecimalField(
        max_digits=5, decimal_places=2, required=False
    )
    default_igst = serializers.DecimalField(
        max_digits=5, decimal_places=2, required=False
    )


class BankSettingsSerializer(serializers.Serializer):
    """Serializer for bank details."""

    bank_name = serializers.CharField(max_length=100, required=False, allow_blank=True)
    account_no = serializers.CharField(max_length=30, required=False, allow_blank=True)
    ifsc_code = serializers.CharField(max_length=20, required=False, allow_blank=True)
    branch = serializers.CharField(max_length=100, required=False, allow_blank=True)


class FinancialYearSerializer(serializers.Serializer):
    """Serializer for financial year settings."""

    financial_year_start = serializers.IntegerField(min_value=1, max_value=12)
    current_year = serializers.CharField(max_length=20, required=False, allow_blank=True)
    from_date = serializers.DateField(required=False)
    to_date = serializers.DateField(required=False)


# ============== User Management Serializers ==============


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model (nested)."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "phone",
            "avatar_url",
            "is_active",
            "last_login_at",
            "created_at",
        ]
        read_only_fields = ["id", "last_login_at", "created_at"]


class OrganizationUserListSerializer(serializers.ModelSerializer):
    """Serializer for listing organization users."""

    user = UserSerializer(read_only=True)
    role_display = serializers.CharField(source="get_role_display", read_only=True)
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = OrganizationMembership
        fields = [
            "id",
            "user",
            "role",
            "role_display",
            "status",
            "status_display",
            "is_default",
            "permissions",
            "loan_per_bag_limit",
            "backdate_entry_limit",
            "joined_at",
            "created_at",
        ]


class OrganizationUserCreateSerializer(serializers.Serializer):
    """Serializer for creating organization users."""

    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True, min_length=8)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=OrganizationMembership.Role.choices)
    permissions = serializers.JSONField(required=False, default=dict)
    loan_per_bag_limit = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )
    backdate_entry_limit = serializers.IntegerField(required=False, allow_null=True)

    def validate_email(self, value):
        # Check if user already exists in this organization
        organization = self.context.get("organization")
        if organization:
            existing = OrganizationMembership.objects.filter(
                organization=organization, user__email=value
            ).exists()
            if existing:
                raise serializers.ValidationError(
                    "A user with this email already exists in this organization."
                )
        return value


class OrganizationUserUpdateSerializer(serializers.Serializer):
    """Serializer for updating organization users."""

    full_name = serializers.CharField(max_length=255, required=False)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    role = serializers.ChoiceField(
        choices=OrganizationMembership.Role.choices, required=False
    )
    status = serializers.ChoiceField(
        choices=OrganizationMembership.Status.choices, required=False
    )
    permissions = serializers.JSONField(required=False)
    loan_per_bag_limit = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False, allow_null=True
    )
    backdate_entry_limit = serializers.IntegerField(required=False, allow_null=True)
    is_active = serializers.BooleanField(required=False)


class UserPermissionsSerializer(serializers.Serializer):
    """Serializer for user permissions."""

    permissions = serializers.JSONField()


# ============== Configuration Serializers ==============


class GeneralConfigSerializer(serializers.Serializer):
    """Serializer for general configuration settings."""

    software_mode = serializers.ChoiceField(
        choices=[("S", "Standard"), ("A", "Advanced")], required=False
    )
    multi_chamber = serializers.BooleanField(required=False)
    partial_lot = serializers.BooleanField(required=False)
    map_required = serializers.BooleanField(required=False)
    separate_voucher_numbers = serializers.BooleanField(required=False)
    marka_on = serializers.ChoiceField(
        choices=[("L", "Lot"), ("P", "Packet")], required=False
    )
    rack_quantity = serializers.IntegerField(min_value=0, required=False)


class RentConfigSerializer(serializers.Serializer):
    """Serializer for rent configuration settings."""

    rent_on = serializers.ChoiceField(
        choices=[("Q", "Quintal"), ("P", "Packet"), ("W", "Weight")], required=False
    )
    rent_through = serializers.ChoiceField(
        choices=[("L", "Ledger"), ("B", "Bill")], required=False
    )
    rent_days = serializers.IntegerField(min_value=0, required=False)


class InterestConfigSerializer(serializers.Serializer):
    """Serializer for interest configuration settings."""

    interest_rate = serializers.DecimalField(
        max_digits=5, decimal_places=2, required=False
    )
    days_in_year = serializers.IntegerField(required=False)
    calculate_interest = serializers.BooleanField(required=False)
    interest_on_rent = serializers.BooleanField(required=False)
    interest_on_loan = serializers.BooleanField(required=False)
    interest_on_bardana = serializers.BooleanField(required=False)


class PacketsConfigSerializer(serializers.Serializer):
    """Serializer for packets configuration settings."""

    pkt1_name = serializers.CharField(max_length=20, required=False)
    pkt1_weight = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    pkt2_name = serializers.CharField(max_length=20, required=False)
    pkt2_weight = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    pkt3_name = serializers.CharField(max_length=20, required=False)
    pkt3_weight = serializers.DecimalField(
        max_digits=10, decimal_places=2, required=False
    )
    mix_packets = serializers.BooleanField(required=False)


class ChargesConfigSerializer(serializers.Serializer):
    """Serializer for labor charges configuration settings."""

    katai1 = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    katai2 = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    katai3 = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    load1 = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    load2 = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    load3 = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    unload1 = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    unload2 = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    unload3 = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    reload1 = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    reload2 = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)
    reload3 = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)


# ============== Audit Log Serializers ==============


class UserActivityLogSerializer(serializers.ModelSerializer):
    """Serializer for user activity logs."""

    user_email = serializers.EmailField(source="user.email", read_only=True)
    user_name = serializers.CharField(source="user.full_name", read_only=True)
    action_type_display = serializers.CharField(
        source="get_action_type_display", read_only=True
    )

    class Meta:
        model = UserActivityLog
        fields = [
            "id",
            "user",
            "user_email",
            "user_name",
            "action_type",
            "action_type_display",
            "module",
            "entry_type",
            "entry_id",
            "details",
            "ip_address",
            "created_at",
        ]


# ============== Dashboard Settings Serializers ==============


class DashboardSettingsSerializer(serializers.Serializer):
    """Serializer for dashboard settings."""

    show_summary_inward = serializers.BooleanField(required=False)
    show_bag_grading = serializers.BooleanField(required=False)
    show_pending_dues = serializers.BooleanField(required=False)
    show_low_stock_alert = serializers.BooleanField(required=False)
    show_chamber_occupancy = serializers.BooleanField(required=False)
    show_recent_transactions = serializers.BooleanField(required=False)
    show_todays_collections = serializers.BooleanField(required=False)
    print_takpatti = serializers.BooleanField(required=False)
    print_gate_pass = serializers.BooleanField(required=False)
    print_receipt = serializers.BooleanField(required=False)
    auto_print_rent_bill = serializers.BooleanField(required=False)
    default_date_range = serializers.IntegerField(min_value=1, max_value=365, required=False)
    auto_refresh_interval = serializers.IntegerField(min_value=1, max_value=60, required=False)
    default_page_size = serializers.IntegerField(min_value=10, max_value=100, required=False)
