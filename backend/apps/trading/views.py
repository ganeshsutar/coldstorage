from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounting.views import OrganizationMixin
from apps.inventory.models import Amad

from .models import DealStatus, GatePass, GatePassStatus, Katai, Sauda
from .serializers import (
    AvailableAmadSerializer,
    GatePassCreateSerializer,
    GatePassDetailSerializer,
    GatePassListSerializer,
    KataiCreateSerializer,
    KataiDetailSerializer,
    KataiListSerializer,
    SaudaCreateSerializer,
    SaudaDetailSerializer,
    SaudaListSerializer,
    TradingStatsSerializer,
)
from .services import GatePassService, KataiService, TradingService


class SaudaViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Sauda (Deal) model."""

    queryset = Sauda.objects.select_related("seller", "buyer", "commodity")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return SaudaListSerializer
        if self.action == "create":
            return SaudaCreateSerializer
        return SaudaDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization"] = self.get_organization()
        return context

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter options
        deal_status = self.request.query_params.get("status")
        seller_id = self.request.query_params.get("seller_id")
        buyer_id = self.request.query_params.get("buyer_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if deal_status:
            queryset = queryset.filter(status=deal_status)
        if seller_id:
            queryset = queryset.filter(seller_id=seller_id)
        if buyer_id:
            queryset = queryset.filter(buyer_id=buyer_id)
        if from_date:
            queryset = queryset.filter(deal_date__gte=from_date)
        if to_date:
            queryset = queryset.filter(deal_date__lte=to_date)

        return queryset.prefetch_related("gate_passes")

    def create(self, request, *args, **kwargs):
        """Create a new deal."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = SaudaCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = TradingService(organization)
        try:
            sauda = service.create_deal(serializer.validated_data, user=request.user)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            SaudaDetailSerializer(sauda).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel a deal."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get("reason", "")
        if not reason:
            return Response(
                {"error": "Cancellation reason is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = TradingService(organization)
        try:
            sauda = service.cancel_deal(pk, reason, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Sauda.DoesNotExist:
            return Response(
                {"error": "Deal not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(SaudaDetailSerializer(sauda).data)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get trading statistics."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = TradingService(organization)
        stats_data = service.get_deal_stats()

        serializer = TradingStatsSerializer(stats_data)
        return Response(serializer.data)

    @action(detail=True, methods=["get"], url_path="available-amads")
    def available_amads(self, request, pk=None):
        """Get amads available for dispatch for a deal's seller."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            sauda = Sauda.objects.get(id=pk, organization=organization)
        except Sauda.DoesNotExist:
            return Response(
                {"error": "Deal not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        amads = Amad.objects.filter(
            organization=organization,
            party=sauda.seller,
            is_fully_dispatched=False,
        ).select_related("party", "commodity").order_by("date", "amad_no")

        serializer = AvailableAmadSerializer(amads, many=True)
        return Response(serializer.data)


class GatePassViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for GatePass model."""

    queryset = GatePass.objects.select_related("seller", "buyer", "sauda")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return GatePassListSerializer
        if self.action == "create":
            return GatePassCreateSerializer
        return GatePassDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization"] = self.get_organization()
        return context

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter options
        gp_status = self.request.query_params.get("status")
        seller_id = self.request.query_params.get("seller_id")
        buyer_id = self.request.query_params.get("buyer_id")
        sauda_id = self.request.query_params.get("sauda_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if gp_status:
            queryset = queryset.filter(status=gp_status)
        if seller_id:
            queryset = queryset.filter(seller_id=seller_id)
        if buyer_id:
            queryset = queryset.filter(buyer_id=buyer_id)
        if sauda_id:
            queryset = queryset.filter(sauda_id=sauda_id)
        if from_date:
            queryset = queryset.filter(gp_date__gte=from_date)
        if to_date:
            queryset = queryset.filter(gp_date__lte=to_date)

        return queryset.prefetch_related("items", "items__amad")

    def create(self, request, *args, **kwargs):
        """Create a gate pass."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = GatePassCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = GatePassService(organization)
        try:
            gp = service.create_gate_pass(serializer.validated_data, user=request.user)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            GatePassDetailSerializer(gp).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"], url_path="mark-done")
    def mark_done(self, request, pk=None):
        """Mark a gate pass as done."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = GatePassService(organization)
        try:
            gp = service.mark_done(pk, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except GatePass.DoesNotExist:
            return Response(
                {"error": "Gate pass not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(GatePassDetailSerializer(gp).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel a gate pass."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get("reason", "")
        if not reason:
            return Response(
                {"error": "Cancellation reason is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = GatePassService(organization)
        try:
            gp = service.cancel_gate_pass(pk, reason, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except GatePass.DoesNotExist:
            return Response(
                {"error": "Gate pass not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(GatePassDetailSerializer(gp).data)


class KataiViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Katai (Grading) model."""

    queryset = Katai.objects.select_related("party", "amad")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return KataiListSerializer
        if self.action == "create":
            return KataiCreateSerializer
        return KataiDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization"] = self.get_organization()
        return context

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter options
        party_id = self.request.query_params.get("party_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if party_id:
            queryset = queryset.filter(party_id=party_id)
        if from_date:
            queryset = queryset.filter(katai_date__gte=from_date)
        if to_date:
            queryset = queryset.filter(katai_date__lte=to_date)

        return queryset

    def create(self, request, *args, **kwargs):
        """Create a katai record."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = KataiCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = KataiService(organization)
        try:
            katai = service.create_katai(serializer.validated_data, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            KataiDetailSerializer(katai).data,
            status=status.HTTP_201_CREATED,
        )
