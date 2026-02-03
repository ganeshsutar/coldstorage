from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounting.views import OrganizationMixin

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
from .serializers import (
    BulkLoadingCreateSerializer,
    LoadingCreateSerializer,
    LoadingDetailSerializer,
    LoadingListSerializer,
    MeterReadingCreateSerializer,
    MeterReadingDetailSerializer,
    MeterReadingListSerializer,
    RackContentsSerializer,
    RackOccupancySerializer,
    RoomFloorCreateSerializer,
    RoomFloorDetailSerializer,
    RoomFloorListSerializer,
    RoomMapSerializer,
    ShiftHeaderCreateSerializer,
    ShiftHeaderDetailSerializer,
    ShiftHeaderListSerializer,
    ShiftingItemSerializer,
    TemperatureReadingCreateSerializer,
    TemperatureReadingDetailSerializer,
    TemperatureReadingListSerializer,
    TemperatureThresholdCreateSerializer,
    TemperatureThresholdSerializer,
    UnloadingCreateSerializer,
    UnloadingDetailSerializer,
    UnloadingListSerializer,
)
from .services import WarehouseService


# =============================================================================
# RoomFloor ViewSet
# =============================================================================


class RoomFloorViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for RoomFloor model."""

    queryset = RoomFloor.objects.select_related("room")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return RoomFloorListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return RoomFloorCreateSerializer
        return RoomFloorDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        room_id = self.request.query_params.get("room_id")
        if room_id:
            queryset = queryset.filter(room_id=room_id)
        return queryset

    @action(detail=False, methods=["get"], url_path="by-room/(?P<room_id>[^/.]+)")
    def by_room(self, request, room_id=None):
        """Get all floor configurations for a specific room."""
        floors = self.get_queryset().filter(room_id=room_id, is_active=True)
        serializer = RoomFloorListSerializer(floors, many=True)
        return Response(serializer.data)


# =============================================================================
# Loading ViewSet
# =============================================================================


class LoadingViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Loading model."""

    queryset = Loading.objects.select_related(
        "amad", "amad__party", "amad__commodity", "room", "created_by"
    )
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return LoadingListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return LoadingCreateSerializer
        return LoadingDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

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

    def perform_create(self, serializer):
        organization = self.get_organization()
        serializer.save(organization=organization, created_by=self.request.user)

    @action(detail=False, methods=["get"], url_path="rack-contents/(?P<room_id>[^/.]+)/(?P<floor>[0-9]+)/(?P<rack>[0-9]+)")
    def rack_contents(self, request, room_id=None, floor=None, rack=None):
        """Get contents of a specific rack."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = WarehouseService(organization)
        try:
            contents = service.get_rack_contents(room_id, int(floor), int(rack))
            return Response(contents)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"], url_path="available-racks/(?P<room_id>[^/.]+)")
    def available_racks(self, request, room_id=None):
        """Get racks with available space."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        quantity = int(request.query_params.get("quantity", 1))
        service = WarehouseService(organization)

        try:
            suggestions = service.find_available_racks(room_id, quantity)
            return Response([{
                "room_id": s.room_id,
                "room_number": s.room_number,
                "floor_number": s.floor_number,
                "rack_number": s.rack_number,
                "current_quantity": s.current_quantity,
                "available_space": s.available_space,
            } for s in suggestions])
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"], url_path="by-amad/(?P<amad_id>[^/.]+)")
    def by_amad(self, request, amad_id=None):
        """Get loading records for a specific amad."""
        loadings = self.get_queryset().filter(amad_id=amad_id)
        serializer = LoadingListSerializer(loadings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["post"])
    def bulk_create(self, request):
        """Create multiple loading records at once."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = BulkLoadingCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = WarehouseService(organization)
        try:
            loadings = service.create_loading(
                amad_id=str(serializer.validated_data["amad"]),
                locations=[
                    {
                        "date": serializer.validated_data["date"],
                        **loc,
                    }
                    for loc in serializer.validated_data["locations"]
                ],
                user=request.user,
            )
            return Response(
                LoadingListSerializer(loadings, many=True).data,
                status=status.HTTP_201_CREATED,
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# =============================================================================
# Unloading ViewSet
# =============================================================================


class UnloadingViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Unloading model."""

    queryset = Unloading.objects.select_related(
        "amad", "amad__party", "amad__commodity", "rent", "room", "created_by"
    )
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return UnloadingListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return UnloadingCreateSerializer
        return UnloadingDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        amad_id = self.request.query_params.get("amad_id")
        rent_id = self.request.query_params.get("rent_id")
        room_id = self.request.query_params.get("room_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if amad_id:
            queryset = queryset.filter(amad_id=amad_id)
        if rent_id:
            queryset = queryset.filter(rent_id=rent_id)
        if room_id:
            queryset = queryset.filter(room_id=room_id)
        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)

        return queryset

    def perform_create(self, serializer):
        organization = self.get_organization()
        serializer.save(organization=organization, created_by=self.request.user)

    @action(detail=False, methods=["get"], url_path="by-rent/(?P<rent_id>[^/.]+)")
    def by_rent(self, request, rent_id=None):
        """Get unloading records for a specific rent/dispatch."""
        unloadings = self.get_queryset().filter(rent_id=rent_id)
        serializer = UnloadingListSerializer(unloadings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"], url_path="available-to-unload/(?P<amad_id>[^/.]+)")
    def available_to_unload(self, request, amad_id=None):
        """Get available quantity by location for an amad."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = WarehouseService(organization)
        try:
            locations = service.get_amad_locations(amad_id)
            return Response([{
                "room_id": loc.room_id,
                "room_number": loc.room_number,
                "floor_number": loc.floor_number,
                "rack_number": loc.rack_number,
                "quantity": loc.quantity,
                "loaded_date": loc.loaded_date.isoformat(),
            } for loc in locations])
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"], url_path="suggest-unload/(?P<amad_id>[^/.]+)")
    def suggest_unload(self, request, amad_id=None):
        """Suggest locations to unload from using FIFO."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        quantity = int(request.query_params.get("quantity", 1))
        service = WarehouseService(organization)

        try:
            suggestions = service.suggest_unload_locations(amad_id, quantity)
            return Response([{
                "room_id": s.room_id,
                "floor_number": s.floor_number,
                "rack_number": s.rack_number,
                "quantity": s.quantity,
                "loaded_date": s.loaded_date.isoformat(),
            } for s in suggestions])
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# =============================================================================
# Shifting ViewSets
# =============================================================================


class ShiftHeaderViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for ShiftHeader model."""

    queryset = ShiftHeader.objects.select_related(
        "from_room", "to_room", "created_by"
    ).prefetch_related("items")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return ShiftHeaderListSerializer
        if self.action in ["create"]:
            return ShiftHeaderCreateSerializer
        return ShiftHeaderDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        from_room_id = self.request.query_params.get("from_room_id")
        to_room_id = self.request.query_params.get("to_room_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if from_room_id:
            queryset = queryset.filter(from_room_id=from_room_id)
        if to_room_id:
            queryset = queryset.filter(to_room_id=to_room_id)
        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)

        return queryset

    def create(self, request, *args, **kwargs):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ShiftHeaderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = WarehouseService(organization)
        try:
            header = service.create_shifting(
                data=serializer.validated_data,
                user=request.user,
            )
            return Response(
                ShiftHeaderDetailSerializer(header).data,
                status=status.HTTP_201_CREATED,
            )
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"])
    def validate(self, request):
        """Validate shift data before committing."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = ShiftHeaderCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = WarehouseService(organization)
        result = service.validate_shifting(serializer.validated_data)
        return Response(result)


class ShiftingViewSet(OrganizationMixin, viewsets.ReadOnlyModelViewSet):
    """ViewSet for Shifting model (read-only, items are created via ShiftHeader)."""

    queryset = Shifting.objects.select_related(
        "shift_header", "amad", "amad__party", "from_room", "to_room"
    )
    permission_classes = [IsAuthenticated]
    serializer_class = ShiftingItemSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        amad_id = self.request.query_params.get("amad_id")
        shift_header_id = self.request.query_params.get("shift_header_id")

        if amad_id:
            queryset = queryset.filter(amad_id=amad_id)
        if shift_header_id:
            queryset = queryset.filter(shift_header_id=shift_header_id)

        return queryset


# =============================================================================
# Temperature ViewSets
# =============================================================================


class TemperatureThresholdViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for TemperatureThreshold model."""

    queryset = TemperatureThreshold.objects.select_related("room")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return TemperatureThresholdCreateSerializer
        return TemperatureThresholdSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        room_id = self.request.query_params.get("room_id")
        if room_id:
            queryset = queryset.filter(room_id=room_id)
        return queryset


class TemperatureReadingViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for TemperatureReading model."""

    queryset = TemperatureReading.objects.select_related("room", "created_by")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return TemperatureReadingListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return TemperatureReadingCreateSerializer
        return TemperatureReadingDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        room_id = self.request.query_params.get("room_id")
        status_filter = self.request.query_params.get("status")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if room_id:
            queryset = queryset.filter(room_id=room_id)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if from_date:
            queryset = queryset.filter(reading_datetime__date__gte=from_date)
        if to_date:
            queryset = queryset.filter(reading_datetime__date__lte=to_date)

        return queryset

    def perform_create(self, serializer):
        organization = self.get_organization()
        serializer.save(organization=organization, created_by=self.request.user)

    @action(detail=False, methods=["get"])
    def alerts(self, request):
        """Get rooms with out-of-range temperatures."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = WarehouseService(organization)
        alerts = service.check_temperature_alerts()
        return Response(alerts)

    @action(detail=False, methods=["get"], url_path="room-history/(?P<room_id>[^/.]+)")
    def room_history(self, request, room_id=None):
        """Get temperature history for a specific room."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        days = int(request.query_params.get("days", 7))
        service = WarehouseService(organization)
        readings = service.get_temperature_history(room_id, days)
        serializer = TemperatureReadingListSerializer(readings, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def latest_by_room(self, request):
        """Get latest temperature reading per room."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = WarehouseService(organization)
        readings = service.get_latest_temperatures()
        return Response(readings)


# =============================================================================
# Meter Reading ViewSet
# =============================================================================


class MeterReadingViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for MeterReading model."""

    queryset = MeterReading.objects.select_related("room", "created_by")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return MeterReadingListSerializer
        if self.action in ["create", "update", "partial_update"]:
            return MeterReadingCreateSerializer
        return MeterReadingDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        room_id = self.request.query_params.get("room_id")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if room_id:
            queryset = queryset.filter(room_id=room_id)
        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)

        return queryset

    def perform_create(self, serializer):
        organization = self.get_organization()
        serializer.save(organization=organization, created_by=self.request.user)

    @action(detail=False, methods=["get"], url_path="room-history/(?P<room_id>[^/.]+)")
    def room_history(self, request, room_id=None):
        """Get meter reading history for a specific room."""
        readings = self.get_queryset().filter(room_id=room_id).order_by("-date")
        serializer = MeterReadingListSerializer(readings, many=True)
        return Response(serializer.data)


# =============================================================================
# Rack Occupancy ViewSet
# =============================================================================


class RackOccupancyViewSet(OrganizationMixin, viewsets.ReadOnlyModelViewSet):
    """ViewSet for RackOccupancy model (read-only, updated via signals)."""

    queryset = RackOccupancy.objects.select_related("room")
    permission_classes = [IsAuthenticated]
    serializer_class = RackOccupancySerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        room_id = self.request.query_params.get("room_id")
        floor_number = self.request.query_params.get("floor_number")

        if room_id:
            queryset = queryset.filter(room_id=room_id)
        if floor_number:
            queryset = queryset.filter(floor_number=floor_number)

        return queryset


# =============================================================================
# Room Map ViewSet
# =============================================================================


class RoomMapViewSet(OrganizationMixin, viewsets.ViewSet):
    """ViewSet for room map visualization."""

    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="(?P<room_id>[^/.]+)")
    def get_map(self, request, room_id=None):
        """Get complete room map data."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = WarehouseService(organization)
        try:
            map_data = service.get_room_map(room_id)
            return Response({
                "room_id": map_data.room_id,
                "room_number": map_data.room_number,
                "room_name": map_data.room_name,
                "floor_count": map_data.floor_count,
                "rack_count": map_data.rack_count,
                "racks_per_row": map_data.racks_per_row,
                "floors": map_data.floors,
                "occupancy": map_data.occupancy,
                "summary": map_data.summary,
            })
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["post"], url_path="recalculate/(?P<room_id>[^/.]+)")
    def recalculate(self, request, room_id=None):
        """Recalculate occupancy for all racks in a room."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = WarehouseService(organization)
        try:
            service.recalculate_room_occupancy(room_id)
            return Response({"message": "Room occupancy recalculated successfully"})
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
