from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import GatePassViewSet, KataiViewSet, SaudaViewSet

app_name = "trading"

router = DefaultRouter()
router.register(r"saudas", SaudaViewSet, basename="sauda")
router.register(r"gate-passes", GatePassViewSet, basename="gate-pass")
router.register(r"katais", KataiViewSet, basename="katai")

urlpatterns = [
    path("", include(router.urls)),
]
