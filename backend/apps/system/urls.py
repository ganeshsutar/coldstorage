from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    BankSettingsView,
    CompanySettingsView,
    ConfigurationView,
    DashboardSettingsView,
    FinancialYearView,
    OrganizationUserViewSet,
    SeedDataView,
    SequenceConfigViewSet,
    TaxSettingsView,
    UserActivityLogViewSet,
)

app_name = "system"

router = DefaultRouter()
router.register(r"users", OrganizationUserViewSet, basename="users")
router.register(r"audit-log", UserActivityLogViewSet, basename="audit-log")
router.register(r"sequences", SequenceConfigViewSet, basename="sequences")

urlpatterns = [
    # Settings endpoints
    path("settings/company/", CompanySettingsView.as_view(), name="company-settings"),
    path("settings/tax/", TaxSettingsView.as_view(), name="tax-settings"),
    path("settings/bank/", BankSettingsView.as_view(), name="bank-settings"),
    path("settings/financial-year/", FinancialYearView.as_view(), name="financial-year"),
    # Configuration endpoints (ControlBox)
    path("config/<str:config_type>/", ConfigurationView.as_view(), name="configuration"),
    # Dashboard settings
    path("dashboard/", DashboardSettingsView.as_view(), name="dashboard-settings"),
    # Seed data
    path("seed-data/", SeedDataView.as_view(), name="seed-data"),
    # Router URLs (users, audit-log)
    path("", include(router.urls)),
]
