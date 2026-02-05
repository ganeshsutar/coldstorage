"""
URL configuration for cold-storage project.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.authentication.urls")),
    path("api/accounting/", include("apps.accounting.urls")),
    path("api/inventory/", include("apps.inventory.urls")),
    path("api/warehouse/", include("apps.warehouse.urls")),
    path("api/masters/", include("apps.masters.urls")),
    path("api/billing/", include("apps.billing.urls")),
    path("api/bardana/", include("apps.bardana.urls")),
    path("api/trading/", include("apps.trading.urls")),
    path("api/loans/", include("apps.loans.urls")),
    path("api/system/", include("apps.system.urls")),
]
