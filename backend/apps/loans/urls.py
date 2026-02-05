from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import AdvanceViewSet, LoanViewSet

app_name = "loans"

router = DefaultRouter()
router.register(r"advances", AdvanceViewSet, basename="advance")
router.register(r"loans", LoanViewSet, basename="loan")

urlpatterns = [
    path("", include(router.urls)),
]
