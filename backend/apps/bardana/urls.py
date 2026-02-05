from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BardanaIssueViewSet,
    BardanaReturnViewSet,
    BardanaStatsViewSet,
    BardanaTypeViewSet,
)

app_name = "bardana"

router = DefaultRouter()
router.register(r"types", BardanaTypeViewSet, basename="bardana-type")
router.register(r"issues", BardanaIssueViewSet, basename="bardana-issue")
router.register(r"returns", BardanaReturnViewSet, basename="bardana-return")
router.register(r"stats", BardanaStatsViewSet, basename="bardana-stats")

urlpatterns = [
    path("", include(router.urls)),
]
