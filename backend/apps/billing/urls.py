from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import ReceiptViewSet, RentBillViewSet

app_name = "billing"

router = DefaultRouter()
router.register(r"rent-bills", RentBillViewSet, basename="rent-bill")
router.register(r"receipts", ReceiptViewSet, basename="receipt")

urlpatterns = [
    path("", include(router.urls)),
]
