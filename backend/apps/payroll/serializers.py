from rest_framework import serializers

from .models import (
    Allowance,
    Attendance,
    AttendanceAllowance,
    AttendanceDeduction,
    DailyWage,
    Deduction,
    Employee,
    EmployeeAllowance,
    EmployeeDeduction,
    PayPost,
    PayrollLedger,
    SalaryIncrement,
    StaffLoan,
)


# =============================================================================
# Pay Post Serializers
# =============================================================================


class PayPostSerializer(serializers.ModelSerializer):
    class Meta:
        model = PayPost
        fields = [
            "id",
            "post_no",
            "post_name",
            "basic_salary",
            "cl_entitlement",
            "el_entitlement",
            "ml_entitlement",
            "metl_entitlement",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "post_no", "created_at", "updated_at"]


# =============================================================================
# Allowance / Deduction Serializers
# =============================================================================


class AllowanceSerializer(serializers.ModelSerializer):
    component_type_display = serializers.CharField(source="get_component_type_display", read_only=True)

    class Meta:
        model = Allowance
        fields = [
            "id",
            "code",
            "name",
            "component_type",
            "component_type_display",
            "value",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class DeductionSerializer(serializers.ModelSerializer):
    component_type_display = serializers.CharField(source="get_component_type_display", read_only=True)

    class Meta:
        model = Deduction
        fields = [
            "id",
            "code",
            "name",
            "component_type",
            "component_type_display",
            "value",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


# =============================================================================
# Employee Serializers
# =============================================================================


class EmployeeAllowanceSerializer(serializers.ModelSerializer):
    allowance_code = serializers.CharField(source="allowance.code", read_only=True)
    allowance_name = serializers.CharField(source="allowance.name", read_only=True)
    component_type = serializers.CharField(source="allowance.component_type", read_only=True)

    class Meta:
        model = EmployeeAllowance
        fields = ["id", "allowance", "allowance_code", "allowance_name", "component_type", "value"]


class EmployeeDeductionSerializer(serializers.ModelSerializer):
    deduction_code = serializers.CharField(source="deduction.code", read_only=True)
    deduction_name = serializers.CharField(source="deduction.name", read_only=True)
    component_type = serializers.CharField(source="deduction.component_type", read_only=True)

    class Meta:
        model = EmployeeDeduction
        fields = ["id", "deduction", "deduction_code", "deduction_name", "component_type", "value"]


class EmployeeListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    pay_post_name = serializers.CharField(source="pay_post.post_name", read_only=True, default=None)

    class Meta:
        model = Employee
        fields = [
            "id",
            "employee_code",
            "name",
            "designation",
            "department",
            "basic_salary",
            "status",
            "status_display",
            "pay_post",
            "pay_post_name",
            "phone",
            "pf_applicable",
            "esi_applicable",
        ]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    pay_post_name = serializers.CharField(source="pay_post.post_name", read_only=True, default=None)
    allowances = EmployeeAllowanceSerializer(many=True, read_only=True)
    deductions = EmployeeDeductionSerializer(many=True, read_only=True)

    class Meta:
        model = Employee
        fields = [
            "id",
            "employee_code",
            "name",
            "designation",
            "department",
            "phone",
            "address",
            "aadhaar",
            "pan_number",
            "bank_name",
            "bank_account_no",
            "bank_ifsc",
            "bank_branch",
            "uan",
            "pf_applicable",
            "esi_applicable",
            "pay_post",
            "pay_post_name",
            "joining_date",
            "basic_salary",
            "status",
            "status_display",
            "allowances",
            "deductions",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "employee_code", "created_at", "updated_at"]


class EmployeeAllowanceInputSerializer(serializers.Serializer):
    allowance_id = serializers.UUIDField()
    value = serializers.DecimalField(max_digits=12, decimal_places=2)


class EmployeeDeductionInputSerializer(serializers.Serializer):
    deduction_id = serializers.UUIDField()
    value = serializers.DecimalField(max_digits=12, decimal_places=2)


class EmployeeCreateSerializer(serializers.Serializer):
    name = serializers.CharField(max_length=255)
    designation = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    department = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    aadhaar = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    pan_number = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    bank_name = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    bank_account_no = serializers.CharField(max_length=50, required=False, allow_blank=True, allow_null=True)
    bank_ifsc = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    bank_branch = serializers.CharField(max_length=255, required=False, allow_blank=True, allow_null=True)
    uan = serializers.CharField(max_length=20, required=False, allow_blank=True, allow_null=True)
    pf_applicable = serializers.BooleanField(default=False)
    esi_applicable = serializers.BooleanField(default=False)
    pay_post_id = serializers.UUIDField(required=False, allow_null=True)
    joining_date = serializers.DateField(required=False, allow_null=True)
    basic_salary = serializers.DecimalField(max_digits=12, decimal_places=2, default=0)
    status = serializers.CharField(max_length=15, required=False, default="ACTIVE")
    allowances = EmployeeAllowanceInputSerializer(many=True, required=False)
    deductions = EmployeeDeductionInputSerializer(many=True, required=False)


# =============================================================================
# Salary Increment Serializers
# =============================================================================


class SalaryIncrementSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source="employee.name", read_only=True)

    class Meta:
        model = SalaryIncrement
        fields = [
            "id",
            "employee",
            "employee_name",
            "from_date",
            "to_date",
            "basic_salary",
            "pf_salary",
            "esi_salary",
            "pf_employee_rate",
            "pf_employer_rate",
            "esi_employee_rate",
            "esi_employer_rate",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


# =============================================================================
# Attendance Serializers
# =============================================================================


class AttendanceAllowanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceAllowance
        fields = ["id", "allowance", "name", "amount"]


class AttendanceDeductionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AttendanceDeduction
        fields = ["id", "deduction", "name", "amount"]


class AttendanceListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = Attendance
        fields = [
            "id",
            "employee",
            "employee_name",
            "month",
            "year",
            "month_days",
            "present_days",
            "lwp",
            "gross_salary",
            "net_salary",
            "status",
            "status_display",
        ]


class AttendanceDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)
    allowance_items = AttendanceAllowanceSerializer(many=True, read_only=True)
    deduction_items = AttendanceDeductionSerializer(many=True, read_only=True)

    class Meta:
        model = Attendance
        fields = [
            "id",
            "organization",
            "employee",
            "employee_name",
            "month",
            "year",
            "month_days",
            "present_days",
            "lwp",
            "cl",
            "ml",
            "el",
            "metl",
            "basic_salary",
            "gross_salary",
            "total_allowances",
            "total_deductions",
            "pf_employee",
            "pf_employer",
            "esi_employee",
            "esi_employer",
            "loan_emi",
            "net_salary",
            "status",
            "status_display",
            "confirmed_at",
            "cancelled_at",
            "cancel_reason",
            "allowance_items",
            "deduction_items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "employee_name",
            "basic_salary",
            "gross_salary",
            "total_allowances",
            "total_deductions",
            "pf_employee",
            "pf_employer",
            "esi_employee",
            "esi_employer",
            "loan_emi",
            "net_salary",
            "confirmed_at",
            "cancelled_at",
            "created_at",
            "updated_at",
        ]


class AttendanceCreateSerializer(serializers.Serializer):
    employee_id = serializers.UUIDField()
    month = serializers.IntegerField(min_value=1, max_value=12)
    year = serializers.IntegerField(min_value=2000)
    month_days = serializers.IntegerField(min_value=1, max_value=31)
    present_days = serializers.DecimalField(max_digits=5, decimal_places=1)
    lwp = serializers.DecimalField(max_digits=5, decimal_places=1, default=0)
    cl = serializers.DecimalField(max_digits=5, decimal_places=1, default=0)
    ml = serializers.DecimalField(max_digits=5, decimal_places=1, default=0)
    el = serializers.DecimalField(max_digits=5, decimal_places=1, default=0)
    metl = serializers.DecimalField(max_digits=5, decimal_places=1, default=0)


class SalaryProcessSerializer(serializers.Serializer):
    month = serializers.IntegerField(min_value=1, max_value=12)
    year = serializers.IntegerField(min_value=2000)


# =============================================================================
# Staff Loan Serializers
# =============================================================================


class StaffLoanListSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = StaffLoan
        fields = [
            "id",
            "loan_no",
            "employee",
            "employee_name",
            "loan_date",
            "loan_amount",
            "emi",
            "repaid_amount",
            "balance",
            "status",
            "status_display",
        ]


class StaffLoanDetailSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source="get_status_display", read_only=True)

    class Meta:
        model = StaffLoan
        fields = [
            "id",
            "organization",
            "loan_no",
            "employee",
            "employee_name",
            "loan_date",
            "loan_amount",
            "emi",
            "repaid_amount",
            "balance",
            "remarks",
            "status",
            "status_display",
            "confirmed_at",
            "cancelled_at",
            "cancel_reason",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "organization",
            "loan_no",
            "employee_name",
            "repaid_amount",
            "balance",
            "confirmed_at",
            "cancelled_at",
            "created_at",
            "updated_at",
        ]


class StaffLoanCreateSerializer(serializers.Serializer):
    employee_id = serializers.UUIDField()
    loan_date = serializers.DateField()
    loan_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    emi = serializers.DecimalField(max_digits=12, decimal_places=2)
    remarks = serializers.CharField(required=False, allow_blank=True, allow_null=True)


# =============================================================================
# Payroll Ledger Serializers
# =============================================================================


class PayrollLedgerSerializer(serializers.ModelSerializer):
    transaction_type_display = serializers.CharField(source="get_transaction_type_display", read_only=True)

    class Meta:
        model = PayrollLedger
        fields = [
            "id",
            "employee",
            "employee_name",
            "serial_number",
            "transaction_date",
            "transaction_type",
            "transaction_type_display",
            "debit",
            "credit",
            "running_balance",
            "reference_id",
            "remarks",
            "created_at",
        ]


# =============================================================================
# Daily Wage Serializers
# =============================================================================


class DailyWageListSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyWage
        fields = [
            "id",
            "date",
            "worker_name",
            "work_type",
            "hours",
            "rate",
            "amount",
            "remarks",
        ]


class DailyWageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DailyWage
        fields = [
            "date",
            "worker_name",
            "work_type",
            "hours",
            "rate",
            "remarks",
        ]


# =============================================================================
# Stats Serializers
# =============================================================================


class PayrollStatsSerializer(serializers.Serializer):
    total_employees = serializers.IntegerField()
    active_employees = serializers.IntegerField()
    salary_payable = serializers.DecimalField(max_digits=15, decimal_places=2)
    loan_outstanding = serializers.DecimalField(max_digits=15, decimal_places=2)
