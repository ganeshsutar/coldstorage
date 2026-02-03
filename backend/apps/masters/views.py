from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounting.views import OrganizationMixin

from .models import Bank, GstRate, LaborRate
from .serializers import (
    BankCreateSerializer,
    BankDetailSerializer,
    BankListSerializer,
    GstRateCreateSerializer,
    GstRateDetailSerializer,
    GstRateListSerializer,
    LaborRateCreateSerializer,
    LaborRateDetailSerializer,
    LaborRateListSerializer,
)


class GstRateViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for GST Rate model."""

    queryset = GstRate.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return GstRateListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return GstRateCreateSerializer
        return GstRateDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization"] = self.get_organization()
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get("is_active")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        return queryset

    @action(detail=False, methods=["get"])
    def default(self, request):
        """Get the default GST rate for the organization."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        default_rate = GstRate.objects.filter(
            organization=organization,
            is_default=True,
            is_active=True,
        ).first()

        if not default_rate:
            # Fall back to first active GST18 or any active rate
            default_rate = GstRate.objects.filter(
                organization=organization,
                code="GST18",
                is_active=True,
            ).first()

            if not default_rate:
                default_rate = GstRate.objects.filter(
                    organization=organization,
                    is_active=True,
                ).first()

        if not default_rate:
            return Response(
                {"error": "No GST rate found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = GstRateDetailSerializer(default_rate)
        return Response(serializer.data)


class BankViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Bank model."""

    queryset = Bank.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return BankListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return BankCreateSerializer
        return BankDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization"] = self.get_organization()
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get("is_active")
        search = self.request.query_params.get("search")

        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset


class LaborRateViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Labor Rate model."""

    queryset = LaborRate.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return LaborRateListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return LaborRateCreateSerializer
        return LaborRateDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization"] = self.get_organization()
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get("is_active")
        rate_type = self.request.query_params.get("rate_type")

        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        if rate_type:
            queryset = queryset.filter(rate_type=rate_type)

        return queryset

    @action(detail=False, methods=["get"], url_path="by-type")
    def by_type(self, request):
        """Get labor rates by type."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        rate_type = request.query_params.get("type")
        if not rate_type:
            return Response(
                {"error": "Type parameter is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        rates = LaborRate.objects.filter(
            organization=organization,
            rate_type=rate_type,
            is_active=True,
        ).order_by("-effective_from")

        serializer = LaborRateListSerializer(rates, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="current")
    def current_rates(self, request):
        """Get current effective rates for all types."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from django.utils import timezone
        from .models import RateType

        today = timezone.now().date()
        result = {}

        for rate_type in RateType.values:
            # Get rate without packet type (flat rate)
            flat_rate = LaborRate.get_current_rate(organization, rate_type, as_of_date=today)
            result[rate_type] = {
                "flat_rate": str(flat_rate) if flat_rate else None,
                "by_packet": {}
            }

            # Get rates by packet type
            from .models import PacketType
            for packet_type in PacketType.values:
                pkt_rate = LaborRate.get_current_rate(
                    organization, rate_type, packet_type, as_of_date=today
                )
                if pkt_rate:
                    result[rate_type]["by_packet"][packet_type] = str(pkt_rate)

        return Response(result)
