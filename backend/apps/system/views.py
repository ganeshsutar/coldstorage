from django.db import models, transaction
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounting.views import OrganizationMixin
from apps.authentication.models import OrganizationMembership, User

from .models import UserActivityLog
from .serializers import (
    BankSettingsSerializer,
    ChargesConfigSerializer,
    CompanySettingsSerializer,
    DashboardSettingsSerializer,
    FinancialYearSerializer,
    GeneralConfigSerializer,
    InterestConfigSerializer,
    OrganizationUserCreateSerializer,
    OrganizationUserListSerializer,
    OrganizationUserUpdateSerializer,
    PacketsConfigSerializer,
    RentConfigSerializer,
    TaxSettingsSerializer,
    UserActivityLogSerializer,
    UserPermissionsSerializer,
)
from .services import ActivityLogger


class CompanySettingsView(OrganizationMixin, APIView):
    """View for company settings."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        settings = organization.settings.get("company", {})
        data = {
            # From Organization model
            "name": organization.name,
            "name_hindi": organization.name_hindi or "",
            "address": organization.address or "",
            "city": organization.city or "",
            "state": organization.state or "",
            "phone": organization.phone or "",
            "email": organization.email or "",
            "gst_no": organization.gst_no or "",
            "logo_url": organization.logo_url or "",
            # From settings JSON
            "pan": settings.get("pan", ""),
            "tan": settings.get("tan", ""),
            "cin": settings.get("cin", ""),
            "owner_name": settings.get("owner_name", ""),
            "owner_aadhar": settings.get("owner_aadhar", ""),
            "upi_id": settings.get("upi_id", ""),
            "fax": settings.get("fax", ""),
        }
        return Response(data)

    def patch(self, request):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer = CompanySettingsSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Update Organization model fields
        model_fields = [
            "name",
            "name_hindi",
            "address",
            "city",
            "state",
            "phone",
            "email",
            "gst_no",
            "logo_url",
        ]
        for field in model_fields:
            if field in data:
                setattr(organization, field, data[field])

        # Update settings JSON
        settings_fields = ["pan", "tan", "cin", "owner_name", "owner_aadhar", "upi_id", "fax"]
        company_settings = organization.settings.get("company", {})
        for field in settings_fields:
            if field in data:
                company_settings[field] = data[field]
        organization.settings["company"] = company_settings

        organization.save()

        # Log the change
        ActivityLogger.log_config_change(
            organization=organization,
            user=request.user,
            config_type="Company Settings",
            old_value=None,
            new_value=data,
            request=request,
        )

        return self.get(request)


class TaxSettingsView(OrganizationMixin, APIView):
    """View for tax settings."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        settings = organization.settings.get("tax", {})
        data = {
            "default_cgst": settings.get("default_cgst", 9.0),
            "default_sgst": settings.get("default_sgst", 9.0),
            "default_igst": settings.get("default_igst", 18.0),
        }
        return Response(data)

    def patch(self, request):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer = TaxSettingsSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        tax_settings = organization.settings.get("tax", {})
        old_value = tax_settings.copy()
        tax_settings.update(data)
        organization.settings["tax"] = tax_settings
        organization.save()

        ActivityLogger.log_config_change(
            organization=organization,
            user=request.user,
            config_type="Tax Settings",
            old_value=old_value,
            new_value=tax_settings,
            request=request,
        )

        return self.get(request)


class BankSettingsView(OrganizationMixin, APIView):
    """View for bank settings."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        settings = organization.settings.get("bank", {})
        data = {
            "bank_name": settings.get("bank_name", ""),
            "account_no": settings.get("account_no", ""),
            "ifsc_code": settings.get("ifsc_code", ""),
            "branch": settings.get("branch", ""),
        }
        return Response(data)

    def patch(self, request):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer = BankSettingsSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        bank_settings = organization.settings.get("bank", {})
        old_value = bank_settings.copy()
        bank_settings.update(data)
        organization.settings["bank"] = bank_settings
        organization.save()

        ActivityLogger.log_config_change(
            organization=organization,
            user=request.user,
            config_type="Bank Settings",
            old_value=old_value,
            new_value=bank_settings,
            request=request,
        )

        return self.get(request)


class FinancialYearView(OrganizationMixin, APIView):
    """View for financial year settings."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        settings = organization.settings.get("financial_year", {})
        data = {
            "financial_year_start": organization.financial_year_start,
            "current_year": settings.get("current_year", ""),
            "from_date": settings.get("from_date"),
            "to_date": settings.get("to_date"),
        }
        return Response(data)

    def patch(self, request):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer = FinancialYearSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if "financial_year_start" in data:
            organization.financial_year_start = data.pop("financial_year_start")

        fy_settings = organization.settings.get("financial_year", {})
        old_value = fy_settings.copy()
        for key, value in data.items():
            if hasattr(value, "isoformat"):
                fy_settings[key] = value.isoformat()
            else:
                fy_settings[key] = value
        organization.settings["financial_year"] = fy_settings
        organization.save()

        ActivityLogger.log_config_change(
            organization=organization,
            user=request.user,
            config_type="Financial Year",
            old_value=old_value,
            new_value=fy_settings,
            request=request,
        )

        return self.get(request)


class OrganizationUserViewSet(OrganizationMixin, viewsets.ViewSet):
    """ViewSet for managing organization users."""

    permission_classes = [IsAuthenticated]

    def list(self, request):
        """List all users in the organization."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        memberships = OrganizationMembership.objects.filter(
            organization=organization
        ).select_related("user").order_by("user__full_name")

        serializer = OrganizationUserListSerializer(memberships, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """Get details of a specific user."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            membership = OrganizationMembership.objects.select_related("user").get(
                id=pk, organization=organization
            )
        except OrganizationMembership.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrganizationUserListSerializer(membership)
        return Response(serializer.data)

    @transaction.atomic
    def create(self, request):
        """Create a new user in the organization."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer = OrganizationUserCreateSerializer(
            data=request.data, context={"organization": organization}
        )
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Create user
        user = User.objects.create_user(
            email=data["email"],
            password=data["password"],
            full_name=data["full_name"],
            phone=data.get("phone", ""),
        )

        # Create membership
        membership = OrganizationMembership.objects.create(
            user=user,
            organization=organization,
            role=data["role"],
            status=OrganizationMembership.Status.ACTIVE,
            permissions=data.get("permissions", {}),
            loan_per_bag_limit=data.get("loan_per_bag_limit"),
            backdate_entry_limit=data.get("backdate_entry_limit"),
            invited_by=request.user,
            invited_at=timezone.now(),
            joined_at=timezone.now(),
        )

        ActivityLogger.log_create(
            organization=organization,
            user=request.user,
            module="System",
            entry_type="User",
            entry_id=str(user.id),
            details={"email": user.email, "role": data["role"]},
            request=request,
        )

        response_serializer = OrganizationUserListSerializer(membership)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)

    @transaction.atomic
    def partial_update(self, request, pk=None):
        """Update a user in the organization."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            membership = OrganizationMembership.objects.select_related("user").get(
                id=pk, organization=organization
            )
        except OrganizationMembership.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrganizationUserUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Update user fields
        user = membership.user
        if "full_name" in data:
            user.full_name = data["full_name"]
        if "phone" in data:
            user.phone = data["phone"]
        if "is_active" in data:
            user.is_active = data["is_active"]
        user.save()

        # Update membership fields
        if "role" in data:
            membership.role = data["role"]
        if "status" in data:
            membership.status = data["status"]
        if "permissions" in data:
            membership.permissions = data["permissions"]
        if "loan_per_bag_limit" in data:
            membership.loan_per_bag_limit = data["loan_per_bag_limit"]
        if "backdate_entry_limit" in data:
            membership.backdate_entry_limit = data["backdate_entry_limit"]
        membership.save()

        ActivityLogger.log_update(
            organization=organization,
            user=request.user,
            module="System",
            entry_type="User",
            entry_id=str(user.id),
            details={"changes": data},
            request=request,
        )

        response_serializer = OrganizationUserListSerializer(membership)
        return Response(response_serializer.data)

    @transaction.atomic
    def destroy(self, request, pk=None):
        """Remove a user from the organization."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            membership = OrganizationMembership.objects.select_related("user").get(
                id=pk, organization=organization
            )
        except OrganizationMembership.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # Prevent deleting self
        if membership.user == request.user:
            return Response(
                {"error": "Cannot remove yourself from the organization"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_email = membership.user.email
        user_id = str(membership.user.id)

        # Delete membership (not the user - they might be in other organizations)
        membership.delete()

        ActivityLogger.log_delete(
            organization=organization,
            user=request.user,
            module="System",
            entry_type="User",
            entry_id=user_id,
            details={"email": user_email},
            request=request,
        )

        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["get", "patch"])
    def permissions(self, request, pk=None):
        """Get or update user permissions."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            membership = OrganizationMembership.objects.get(
                id=pk, organization=organization
            )
        except OrganizationMembership.DoesNotExist:
            return Response(
                {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if request.method == "GET":
            return Response({"permissions": membership.permissions})

        serializer = UserPermissionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old_permissions = membership.permissions.copy()
        membership.permissions = serializer.validated_data["permissions"]
        membership.save()

        ActivityLogger.log_config_change(
            organization=organization,
            user=request.user,
            config_type="User Permissions",
            old_value=old_permissions,
            new_value=membership.permissions,
            request=request,
        )

        return Response({"permissions": membership.permissions})


class ConfigurationView(OrganizationMixin, APIView):
    """View for system configuration (ControlBox settings)."""

    permission_classes = [IsAuthenticated]

    CONFIG_SERIALIZERS = {
        "general": GeneralConfigSerializer,
        "rent": RentConfigSerializer,
        "interest": InterestConfigSerializer,
        "packets": PacketsConfigSerializer,
        "charges": ChargesConfigSerializer,
    }

    DEFAULT_CONFIG = {
        "general": {
            "software_mode": "S",
            "multi_chamber": True,
            "partial_lot": True,
            "map_required": False,
            "separate_voucher_numbers": True,
            "marka_on": "L",
            "rack_quantity": 500,
        },
        "rent": {
            "rent_on": "Q",
            "rent_through": "L",
            "rent_days": 0,
        },
        "interest": {
            "interest_rate": 1.5,
            "days_in_year": 360,
            "calculate_interest": True,
            "interest_on_rent": True,
            "interest_on_loan": True,
            "interest_on_bardana": True,
        },
        "packets": {
            "pkt1_name": "80KG",
            "pkt1_weight": 80.0,
            "pkt2_name": "70KG",
            "pkt2_weight": 70.0,
            "pkt3_name": "50KG",
            "pkt3_weight": 50.0,
            "mix_packets": True,
        },
        "charges": {
            "katai1": 5.0,
            "katai2": 4.0,
            "katai3": 3.0,
            "load1": 4.0,
            "load2": 3.5,
            "load3": 3.0,
            "unload1": 4.0,
            "unload2": 3.5,
            "unload3": 3.0,
            "reload1": 3.0,
            "reload2": 2.5,
            "reload3": 2.0,
        },
    }

    def get(self, request, config_type):
        if config_type not in self.CONFIG_SERIALIZERS:
            return Response(
                {"error": f"Invalid config type: {config_type}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        config = organization.settings.get("config", {})
        data = config.get(config_type, self.DEFAULT_CONFIG.get(config_type, {}))
        return Response(data)

    def patch(self, request, config_type):
        if config_type not in self.CONFIG_SERIALIZERS:
            return Response(
                {"error": f"Invalid config type: {config_type}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer_class = self.CONFIG_SERIALIZERS[config_type]
        serializer = serializer_class(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        # Convert Decimal to float for JSON storage
        for key, value in data.items():
            if hasattr(value, "as_tuple"):  # Decimal check
                data[key] = float(value)

        config = organization.settings.get("config", {})
        type_config = config.get(config_type, self.DEFAULT_CONFIG.get(config_type, {}))
        old_value = type_config.copy()
        type_config.update(data)
        config[config_type] = type_config
        organization.settings["config"] = config
        organization.save()

        ActivityLogger.log_config_change(
            organization=organization,
            user=request.user,
            config_type=f"Configuration ({config_type})",
            old_value=old_value,
            new_value=type_config,
            request=request,
        )

        return Response(type_config)


class UserActivityLogViewSet(OrganizationMixin, viewsets.ReadOnlyModelViewSet):
    """ViewSet for viewing user activity logs (read-only)."""

    permission_classes = [IsAuthenticated]
    serializer_class = UserActivityLogSerializer

    def get_queryset(self):
        organization = self.get_organization()
        if not organization:
            return UserActivityLog.objects.none()

        queryset = UserActivityLog.objects.filter(
            organization=organization
        ).select_related("user")

        # Apply filters
        user_id = self.request.query_params.get("user")
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        action_type = self.request.query_params.get("action_type")
        if action_type:
            queryset = queryset.filter(action_type=action_type)

        module = self.request.query_params.get("module")
        if module:
            queryset = queryset.filter(module__icontains=module)

        from_date = self.request.query_params.get("from_date")
        if from_date:
            queryset = queryset.filter(created_at__date__gte=from_date)

        to_date = self.request.query_params.get("to_date")
        if to_date:
            queryset = queryset.filter(created_at__date__lte=to_date)

        search = self.request.query_params.get("search")
        if search:
            queryset = queryset.filter(
                models.Q(entry_type__icontains=search)
                | models.Q(entry_id__icontains=search)
                | models.Q(user__email__icontains=search)
            )

        return queryset.order_by("-created_at")


class DashboardSettingsView(OrganizationMixin, APIView):
    """View for dashboard settings."""

    permission_classes = [IsAuthenticated]

    DEFAULT_SETTINGS = {
        "show_summary_inward": True,
        "show_bag_grading": True,
        "show_pending_dues": True,
        "show_low_stock_alert": True,
        "show_chamber_occupancy": True,
        "show_recent_transactions": True,
        "show_todays_collections": False,
        "print_takpatti": False,
        "print_gate_pass": True,
        "print_receipt": True,
        "auto_print_rent_bill": False,
        "default_date_range": 30,
        "auto_refresh_interval": 5,
        "default_page_size": 20,
    }

    def get(self, request):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        settings = organization.settings.get("dashboard", {})
        # Merge with defaults
        data = {**self.DEFAULT_SETTINGS, **settings}
        return Response(data)

    def patch(self, request):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"}, status=status.HTTP_400_BAD_REQUEST
            )

        serializer = DashboardSettingsSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        dashboard_settings = organization.settings.get("dashboard", {})
        old_value = dashboard_settings.copy()
        dashboard_settings.update(data)
        organization.settings["dashboard"] = dashboard_settings
        organization.save()

        ActivityLogger.log_config_change(
            organization=organization,
            user=request.user,
            config_type="Dashboard Settings",
            old_value=old_value,
            new_value=dashboard_settings,
            request=request,
        )

        return self.get(request)
