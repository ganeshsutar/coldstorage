from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AccountViewSet,
    DaybookTransactionViewSet,
    DaybookViewSet,
    InterestCalculationTempViewSet,
    InterestCalculationViewSet,
    PartyBankDetailsViewSet,
    PartyLedgerOpeningViewSet,
    PartyLedgerViewSet,
)

app_name = "accounting"

router = DefaultRouter()
router.register(r"accounts", AccountViewSet, basename="account")
router.register(r"party-ledger", PartyLedgerViewSet, basename="party-ledger")
router.register(r"party-ledger-openings", PartyLedgerOpeningViewSet, basename="party-ledger-opening")
router.register(r"daybook", DaybookViewSet, basename="daybook")
router.register(r"daybook-transactions", DaybookTransactionViewSet, basename="daybook-transaction")
router.register(r"interest", InterestCalculationViewSet, basename="interest")
router.register(r"interest-temp", InterestCalculationTempViewSet, basename="interest-temp")
router.register(r"party-bank-details", PartyBankDetailsViewSet, basename="party-bank-details")

urlpatterns = [
    path("", include(router.urls)),
]
