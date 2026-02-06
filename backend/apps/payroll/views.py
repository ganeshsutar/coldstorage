from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.accounting.views import OrganizationMixin

from .models import (
    Allowance,
    Attendance,
    DailyWage,
    Deduction,
    Employee,
    PayPost,
    PayrollLedger,
    StaffLoan,
)
from .serializers import (
    AllowanceSerializer,
    AttendanceCreateSerializer,
    AttendanceDetailSerializer,
    AttendanceListSerializer,
    DailyWageCreateSerializer,
    DailyWageListSerializer,
    DeductionSerializer,
    EmployeeCreateSerializer,
    EmployeeDetailSerializer,
    EmployeeListSerializer,
    PayPostSerializer,
    PayrollLedgerSerializer,
    PayrollStatsSerializer,
    SalaryProcessSerializer,
    StaffLoanCreateSerializer,
    StaffLoanDetailSerializer,
    StaffLoanListSerializer,
)
from .services import PayrollService


class PayPostViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Pay Post model."""

    queryset = PayPost.objects.all()
    serializer_class = PayPostSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(organization=self.get_organization())


class AllowanceViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Allowance model."""

    queryset = Allowance.objects.all()
    serializer_class = AllowanceSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(organization=self.get_organization())


class DeductionViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Deduction model."""

    queryset = Deduction.objects.all()
    serializer_class = DeductionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(organization=self.get_organization())


class EmployeeViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Employee model."""

    queryset = Employee.objects.select_related("pay_post")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return EmployeeListSerializer
        if self.action == "create":
            return EmployeeCreateSerializer
        return EmployeeDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        employee_status = self.request.query_params.get("status")
        department = self.request.query_params.get("department")
        search = self.request.query_params.get("search")

        if employee_status:
            queryset = queryset.filter(status=employee_status)
        if department:
            queryset = queryset.filter(department=department)
        if search:
            queryset = queryset.filter(name__icontains=search)

        return queryset.prefetch_related("allowances__allowance", "deductions__deduction")

    def create(self, request, *args, **kwargs):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = EmployeeCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = PayrollService(organization)
        try:
            employee = service.create_employee(serializer.validated_data, user=request.user)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            EmployeeDetailSerializer(employee).data,
            status=status.HTTP_201_CREATED,
        )

    def update(self, request, *args, **kwargs):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = EmployeeCreateSerializer(data=request.data, partial=kwargs.get("partial", False))
        serializer.is_valid(raise_exception=True)

        service = PayrollService(organization)
        try:
            employee = service.update_employee(
                kwargs["pk"], serializer.validated_data, user=request.user
            )
        except Employee.DoesNotExist:
            return Response(
                {"error": "Employee not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(EmployeeDetailSerializer(employee).data)


class AttendanceViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Attendance model."""

    queryset = Attendance.objects.select_related("employee")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return AttendanceListSerializer
        if self.action == "create":
            return AttendanceCreateSerializer
        return AttendanceDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        month = self.request.query_params.get("month")
        year = self.request.query_params.get("year")
        attendance_status = self.request.query_params.get("status")
        employee_id = self.request.query_params.get("employee_id")

        if month:
            queryset = queryset.filter(month=month)
        if year:
            queryset = queryset.filter(year=year)
        if attendance_status:
            queryset = queryset.filter(status=attendance_status)
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)

        return queryset.prefetch_related("allowance_items", "deduction_items")

    def create(self, request, *args, **kwargs):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = AttendanceCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        try:
            employee = Employee.objects.get(
                id=data["employee_id"],
                organization=organization,
            )
            attendance = Attendance.objects.create(
                organization=organization,
                employee=employee,
                month=data["month"],
                year=data["year"],
                month_days=data["month_days"],
                present_days=data["present_days"],
                lwp=data.get("lwp", 0),
                cl=data.get("cl", 0),
                ml=data.get("ml", 0),
                el=data.get("el", 0),
                metl=data.get("metl", 0),
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            AttendanceDetailSerializer(attendance).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["post"], url_path="process-salary")
    def process_salary(self, request):
        """Process salary for all active employees."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = SalaryProcessSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = PayrollService(organization)
        try:
            results = service.process_salary(
                month=serializer.validated_data["month"],
                year=serializer.validated_data["year"],
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            AttendanceListSerializer(results, many=True).data,
        )

    @action(detail=True, methods=["post"])
    def confirm(self, request, pk=None):
        """Confirm a processed attendance record."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = PayrollService(organization)
        try:
            attendance = service.confirm_attendance(pk, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Attendance.DoesNotExist:
            return Response(
                {"error": "Attendance not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(AttendanceDetailSerializer(attendance).data)

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel an attendance record."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get("reason", "")
        if not reason:
            return Response(
                {"error": "Cancellation reason is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = PayrollService(organization)
        try:
            attendance = service.cancel_attendance(pk, reason, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Attendance.DoesNotExist:
            return Response(
                {"error": "Attendance not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(AttendanceDetailSerializer(attendance).data)

    @action(detail=False, methods=["get"], url_path="salary-sheet")
    def salary_sheet(self, request):
        """Get salary sheet for a month/year."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        month = request.query_params.get("month")
        year = request.query_params.get("year")

        if not month or not year:
            return Response(
                {"error": "month and year parameters are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        records = Attendance.objects.filter(
            organization=organization,
            month=month,
            year=year,
        ).select_related("employee").prefetch_related(
            "allowance_items", "deduction_items"
        ).order_by("employee_name")

        return Response(AttendanceDetailSerializer(records, many=True).data)


class StaffLoanViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Staff Loan model."""

    queryset = StaffLoan.objects.select_related("employee")
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return StaffLoanListSerializer
        if self.action == "create":
            return StaffLoanCreateSerializer
        return StaffLoanDetailSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        loan_status = self.request.query_params.get("status")
        employee_id = self.request.query_params.get("employee_id")

        if loan_status:
            queryset = queryset.filter(status=loan_status)
        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)

        return queryset

    def create(self, request, *args, **kwargs):
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = StaffLoanCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        service = PayrollService(organization)
        try:
            loan = service.create_staff_loan(serializer.validated_data, user=request.user)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(
            StaffLoanDetailSerializer(loan).data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=True, methods=["post"])
    def cancel(self, request, pk=None):
        """Cancel a staff loan."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reason = request.data.get("reason", "")
        if not reason:
            return Response(
                {"error": "Cancellation reason is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = PayrollService(organization)
        try:
            loan = service.cancel_staff_loan(pk, reason, user=request.user)
        except ValueError as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except StaffLoan.DoesNotExist:
            return Response(
                {"error": "Staff loan not found"},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response(StaffLoanDetailSerializer(loan).data)


class PayrollLedgerViewSet(OrganizationMixin, viewsets.ReadOnlyModelViewSet):
    """ViewSet for Payroll Ledger (read-only)."""

    queryset = PayrollLedger.objects.select_related("employee")
    serializer_class = PayrollLedgerSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = super().get_queryset()

        employee_id = self.request.query_params.get("employee_id")
        transaction_type = self.request.query_params.get("type")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if employee_id:
            queryset = queryset.filter(employee_id=employee_id)
        if transaction_type:
            queryset = queryset.filter(transaction_type=transaction_type)
        if from_date:
            queryset = queryset.filter(transaction_date__gte=from_date)
        if to_date:
            queryset = queryset.filter(transaction_date__lte=to_date)

        return queryset


class DailyWageViewSet(OrganizationMixin, viewsets.ModelViewSet):
    """ViewSet for Daily Wage model."""

    queryset = DailyWage.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ["create", "update", "partial_update"]:
            return DailyWageCreateSerializer
        return DailyWageListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        date = self.request.query_params.get("date")
        from_date = self.request.query_params.get("from_date")
        to_date = self.request.query_params.get("to_date")

        if date:
            queryset = queryset.filter(date=date)
        if from_date:
            queryset = queryset.filter(date__gte=from_date)
        if to_date:
            queryset = queryset.filter(date__lte=to_date)

        return queryset

    def perform_create(self, serializer):
        serializer.save(organization=self.get_organization())

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """Get payroll statistics."""
        organization = self.get_organization()
        if not organization:
            return Response(
                {"error": "No organization found"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        service = PayrollService(organization)
        stats = service.get_payroll_stats()

        serializer = PayrollStatsSerializer(stats)
        return Response(serializer.data)
