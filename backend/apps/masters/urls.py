from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BankViewSet, GstRateViewSet, LaborRateViewSet

app_name = "masters"

router = DefaultRouter()
router.register(r"gst-rates", GstRateViewSet, basename="gst-rate")
router.register(r"banks", BankViewSet, basename="bank")
router.register(r"labor-rates", LaborRateViewSet, basename="labor-rate")

urlpatterns = [
    path("", include(router.urls)),
]
