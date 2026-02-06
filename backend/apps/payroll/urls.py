from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AllowanceViewSet,
    AttendanceViewSet,
    DailyWageViewSet,
    DeductionViewSet,
    EmployeeViewSet,
    PayPostViewSet,
    PayrollLedgerViewSet,
    StaffLoanViewSet,
)

app_name = "payroll"

router = DefaultRouter()
router.register(r"employees", EmployeeViewSet, basename="employee")
router.register(r"pay-posts", PayPostViewSet, basename="pay-post")
router.register(r"allowances", AllowanceViewSet, basename="allowance")
router.register(r"deductions", DeductionViewSet, basename="deduction")
router.register(r"attendance", AttendanceViewSet, basename="attendance")
router.register(r"staff-loans", StaffLoanViewSet, basename="staff-loan")
router.register(r"ledger", PayrollLedgerViewSet, basename="payroll-ledger")
router.register(r"daily-wages", DailyWageViewSet, basename="daily-wage")

urlpatterns = [
    path("", include(router.urls)),
]
