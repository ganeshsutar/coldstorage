from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AmadNikasiViewSet,
    AmadViewSet,
    CommodityViewSet,
    RentViewSet,
    RoomViewSet,
    TakpattiViewSet,
    VillageViewSet,
)

app_name = "inventory"

router = DefaultRouter()
router.register(r"commodities", CommodityViewSet, basename="commodity")
router.register(r"rooms", RoomViewSet, basename="room")
router.register(r"villages", VillageViewSet, basename="village")
router.register(r"amad", AmadViewSet, basename="amad")
router.register(r"rent", RentViewSet, basename="rent")
router.register(r"takpatti", TakpattiViewSet, basename="takpatti")
router.register(r"amad-nikasi", AmadNikasiViewSet, basename="amad-nikasi")

urlpatterns = [
    path("", include(router.urls)),
]
