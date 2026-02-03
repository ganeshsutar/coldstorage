from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    LoadingViewSet,
    MeterReadingViewSet,
    RackOccupancyViewSet,
    RoomFloorViewSet,
    RoomMapViewSet,
    ShiftHeaderViewSet,
    ShiftingViewSet,
    TemperatureReadingViewSet,
    TemperatureThresholdViewSet,
    UnloadingViewSet,
)

app_name = "warehouse"

router = DefaultRouter()
router.register(r"room-floors", RoomFloorViewSet, basename="room-floor")
router.register(r"loading", LoadingViewSet, basename="loading")
router.register(r"unloading", UnloadingViewSet, basename="unloading")
router.register(r"shift-headers", ShiftHeaderViewSet, basename="shift-header")
router.register(r"shifting", ShiftingViewSet, basename="shifting")
router.register(r"temperature-thresholds", TemperatureThresholdViewSet, basename="temperature-threshold")
router.register(r"temperature", TemperatureReadingViewSet, basename="temperature")
router.register(r"meter-readings", MeterReadingViewSet, basename="meter-reading")
router.register(r"rack-occupancy", RackOccupancyViewSet, basename="rack-occupancy")
router.register(r"room-map", RoomMapViewSet, basename="room-map")

urlpatterns = [
    path("", include(router.urls)),
]
