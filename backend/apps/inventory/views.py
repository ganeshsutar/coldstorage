from decimal import Decimal

from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounting.views import OrganizationMixin

from .models import Amad, AmadNikasi, Commodity, Rent, Room, Takpatti, Village
from .serializers import (
    AmadCreateSerializer,
    AmadDetailSerializer,
    AmadListSerializer,
    AmadNikasiSerializer,
    CommodityCreateSerializer,
    CommodityDetailSerializer,
    CommodityListSerializer,
    CommodityStockSerializer,
    PartyStockSerializer,
    RentCalculationResultSerializer,
    RentCalculationSerializer,
    RentCreateSerializer,
    RentDetailSerializer,
    RentListSerializer,
    RoomCreateSerializer,
    RoomDetailSerializer,
    RoomListSerializer,
    RoomStockSerializer,
    StockSummarySerializer,
    TakpattiCreateSerializer,
    TakpattiDetailSerializer,
    TakpattiListSerializer,
    VillageCreateSerializer,
    VillageDetailSerializer,
    VillageListSerializer,
)
from .services import InventoryService


# =============================================================================
# Master ViewSets
# =============================================================================


class CommodityViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Commodity model."""

    queryset = Commodity.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return CommodityListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return CommodityCreateSerializer
        return CommodityDetailSerializer

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


class RoomViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Room model."""

    queryset = Room.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return RoomListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return RoomCreateSerializer
        return RoomDetailSerializer

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


class VillageViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Village model."""

    queryset = Village.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return VillageListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return VillageCreateSerializer
        return VillageDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["organization"] = self.get_organization()
        return context

    def get_queryset(self):
        queryset = super().get_queryset()
        is_active = self.request.query_params.get("is_active")
        district = self.request.query_params.get("district")
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        if district:
            queryset = queryset.filter(district__icontains=district)
        return queryset


# =============================================================================
# Transaction ViewSets
# =============================================================================


class AmadViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Amad model."""

    queryset = Amad.objects.select_related("party", "commodity", "room", "village")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return AmadListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return AmadCreateSerializer
        return AmadDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter options
        is_fully_dispatched = self.request.query_params.get("is_fully_dispatched")
        party_id = self.request.query_params.get("party_id")
        commodity_id = self.request.query_params.get("commodity_id")
        room_id = self.request.query_params.get("room_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if is_fully_dispatched is not None:
            queryset = queryset.filter(is_fully_dispatched=is_fully_dispatched.lower() == "true")
        if party_id:
            queryset = queryset.filter(party_id=party_id)
        if commodity_id:
            queryset = queryset.filter(commodity_id=commodity_id)
        if room_id:
            queryset = queryset.filter(room_id=room_id)
        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)

        return queryset

    @action(detail=False, methods=["get"])
    def summary(self, request):
        """Get overall stock summary."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = InventoryService(organization)
        summary = service.get_stock_summary()
        serializer = StockSummarySerializer(summary)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="party-stock/(?P<party_id>[^/.]+)")
    def party_stock(self, request, party_id=None):
        """Get stock for a specific party."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from apps.accounting.models import Account
        try:
            party = Account.objects.get(id=party_id, organization=organization)
        except Account.DoesNotExist:
            return Response(
                {"error": "Party not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        service = InventoryService(organization)
        stock = service.get_party_stock(party)

        # Serialize the amads list separately
        stock["amads"] = AmadListSerializer(stock["amads"], many=True).data

        serializer = PartyStockSerializer(stock)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def due_for_nikasi(self, request):
        """Get amads that are due for dispatch."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        days = int(request.query_params.get("days", 180))
        service = InventoryService(organization)
        amads = service.get_amads_due_for_nikasi(days)
        serializer = AmadListSerializer(amads, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def commodity_stock(self, request):
        """Get stock grouped by commodity."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = InventoryService(organization)
        stock = service.get_commodity_stock()
        serializer = CommodityStockSerializer(stock, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def room_stock(self, request):
        """Get stock grouped by room with utilization."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = InventoryService(organization)
        stock = service.get_room_stock()
        serializer = RoomStockSerializer(stock, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def today_summary(self, request):
        """Get today's arrivals and dispatches summary."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        from datetime import datetime
        date_str = request.query_params.get("date")
        target_date = None
        if date_str:
            try:
                target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        service = InventoryService(organization)
        summary = service.get_today_summary(target_date)
        return Response(summary)


class RentViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Rent model."""

    queryset = Rent.objects.select_related(
        "party", "receiver_account", "amad", "amad__commodity", "ledger_entry"
    )
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return RentListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return RentCreateSerializer
        return RentDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter options
        party_id = self.request.query_params.get("party_id")
        amad_id = self.request.query_params.get("amad_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if party_id:
            queryset = queryset.filter(party_id=party_id)
        if amad_id:
            queryset = queryset.filter(amad_id=amad_id)
        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)

        return queryset

    def perform_create(self, serializer):
        """Create rent with AmadNikasi link and optional ledger entry."""
        organization = self.get_organization()
        rent = serializer.save(organization=organization)

        # Create AmadNikasi link
        AmadNikasi.objects.create(
            organization=organization,
            amad=rent.amad,
            rent=rent,
            packets_dispatched=rent.packets,
            weight_dispatched=rent.weight,
        )

        # Create ledger entry if total_amount > 0
        if rent.total_amount > Decimal("0.00"):
            service = InventoryService(organization)
            calculation = service.calculate_rent(
                amad=rent.amad,
                dispatch_date=rent.date,
                packets=rent.packets,
                weight=rent.weight,
                gst_percent=rent.gst_percent,
            )
            ledger_entry = service._create_rent_ledger_entry(rent, calculation)
            rent.ledger_entry = ledger_entry
            rent.save(update_fields=["ledger_entry"])

    @action(detail=False, methods=["post"])
    def calculate_rent(self, request):
        """Preview rent calculation without creating records."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = RentCalculationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amad_id = serializer.validated_data["amad_id"]
        try:
            amad = Amad.objects.get(id=amad_id, organization=organization)
        except Amad.DoesNotExist:
            return Response(
                {"error": "Amad not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        service = InventoryService(organization)
        calculation = service.calculate_rent(
            amad=amad,
            dispatch_date=serializer.validated_data["dispatch_date"],
            packets=serializer.validated_data["packets"],
            weight=serializer.validated_data["weight"],
        )

        result_serializer = RentCalculationResultSerializer({
            "amad_no": calculation.amad_no,
            "amad_date": calculation.amad_date,
            "dispatch_date": calculation.dispatch_date,
            "packets": calculation.packets,
            "weight": calculation.weight,
            "weight_quintals": calculation.weight_quintals,
            "storage_days": calculation.storage_days,
            "grace_days": calculation.grace_days,
            "billable_days": calculation.billable_days,
            "rent_rate": calculation.rent_rate,
            "rent_amount": calculation.rent_amount,
            "gst_percent": calculation.gst_percent,
            "gst_amount": calculation.gst_amount,
            "total_amount": calculation.total_amount,
        })
        return Response(result_serializer.data)

    @action(detail=False, methods=["post"])
    def create_with_ledger(self, request):
        """Create rent with automatic ledger entry."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = RentCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        amad = serializer.validated_data["amad"]

        service = InventoryService(organization)
        try:
            rent = service.create_dispatch(
                amad=amad,
                dispatch_date=serializer.validated_data["date"],
                packets=serializer.validated_data["packets"],
                weight=serializer.validated_data["weight"],
                nikasi_type=serializer.validated_data.get("nikasi_type", "SEEDHI"),
                receiver_name=serializer.validated_data.get("receiver_name"),
                receiver_account=serializer.validated_data.get("receiver_account"),
                vehicle_no=serializer.validated_data.get("vehicle_no"),
                narration=serializer.validated_data.get("narration"),
                gst_percent=serializer.validated_data.get("gst_percent", Decimal("18.00")),
                create_ledger_entry=True,
            )
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            RentDetailSerializer(rent).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"])
    def transfer_stock(self, request):
        """Transfer stock from one party to another."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Validate input
        amad_id = request.data.get("amad_id")
        to_party_id = request.data.get("to_party_id")
        packets = request.data.get("packets")
        weight = request.data.get("weight")
        transfer_date = request.data.get("date")
        narration = request.data.get("narration")

        if not all([amad_id, to_party_id, packets, weight, transfer_date]):
            return Response(
                {"error": "Missing required fields: amad_id, to_party_id, packets, weight, date"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            amad = Amad.objects.get(id=amad_id, organization=organization)
        except Amad.DoesNotExist:
            return Response(
                {"error": "Amad not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        from apps.accounting.models import Account
        try:
            to_party = Account.objects.get(id=to_party_id, organization=organization)
        except Account.DoesNotExist:
            return Response(
                {"error": "Destination party not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        from datetime import datetime
        try:
            transfer_date = datetime.strptime(transfer_date, "%Y-%m-%d").date()
        except ValueError:
            return Response(
                {"error": "Invalid date format. Use YYYY-MM-DD."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = InventoryService(organization)
        try:
            new_amad = service.transfer_stock(
                amad=amad,
                to_party=to_party,
                transfer_date=transfer_date,
                packets=int(packets),
                weight=Decimal(str(weight)),
                narration=narration,
            )
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            {
                "message": "Stock transferred successfully",
                "new_amad": AmadDetailSerializer(new_amad).data,
            },
            status=status.HTTP_201_CREATED,
        )


class TakpattiViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Takpatti model."""

    queryset = Takpatti.objects.select_related("amad", "amad__party", "room")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return TakpattiListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return TakpattiCreateSerializer
        return TakpattiDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter options
        amad_id = self.request.query_params.get("amad_id")
        room_id = self.request.query_params.get("room_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if amad_id:
            queryset = queryset.filter(amad_id=amad_id)
        if room_id:
            queryset = queryset.filter(room_id=room_id)
        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)

        return queryset


class AmadNikasiViewSet(OrganizationMixin, viewsets.ReadOnlyModelViewSet):
    """ViewSet for AmadNikasi model (read-only)."""

    queryset = AmadNikasi.objects.select_related("amad", "rent")
    permission_classes = [IsAuthenticated]
    serializer_class = AmadNikasiSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter options
        amad_id = self.request.query_params.get("amad_id")
        rent_id = self.request.query_params.get("rent_id")

        if amad_id:
            queryset = queryset.filter(amad_id=amad_id)
        if rent_id:
            queryset = queryset.filter(rent_id=rent_id)

        return queryset
