from django.contrib import admin

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


class EmployeeAllowanceInline(admin.TabularInline):
    model = EmployeeAllowance
    extra = 0


class EmployeeDeductionInline(admin.TabularInline):
    model = EmployeeDeduction
    extra = 0


@admin.register(PayPost)
class PayPostAdmin(admin.ModelAdmin):
    list_display = ["post_no", "post_name", "basic_salary", "is_active", "organization"]
    list_filter = ["organization", "is_active"]
    search_fields = ["post_no", "post_name"]


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = [
        "employee_code",
        "name",
        "designation",
        "department",
        "basic_salary",
        "status",
        "organization",
    ]
    list_filter = ["organization", "status", "department", "pf_applicable", "esi_applicable"]
    search_fields = ["employee_code", "name", "phone", "aadhaar"]
    ordering = ["organization", "name"]
    inlines = [EmployeeAllowanceInline, EmployeeDeductionInline]
    readonly_fields = ["employee_code"]


@admin.register(Allowance)
class AllowanceAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "component_type", "value", "is_active", "organization"]
    list_filter = ["organization", "component_type", "is_active"]
    search_fields = ["code", "name"]


@admin.register(Deduction)
class DeductionAdmin(admin.ModelAdmin):
    list_display = ["code", "name", "component_type", "value", "is_active", "organization"]
    list_filter = ["organization", "component_type", "is_active"]
    search_fields = ["code", "name"]


@admin.register(SalaryIncrement)
class SalaryIncrementAdmin(admin.ModelAdmin):
    list_display = ["employee", "from_date", "to_date", "basic_salary", "pf_salary", "esi_salary"]
    list_filter = ["employee__organization"]
    search_fields = ["employee__name"]


class AttendanceAllowanceInline(admin.TabularInline):
    model = AttendanceAllowance
    extra = 0


class AttendanceDeductionInline(admin.TabularInline):
    model = AttendanceDeduction
    extra = 0


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = [
        "employee_name",
        "month",
        "year",
        "present_days",
        "gross_salary",
        "net_salary",
        "status",
        "organization",
    ]
    list_filter = ["organization", "status", "year", "month"]
    search_fields = ["employee_name"]
    ordering = ["organization", "-year", "-month"]
    inlines = [AttendanceAllowanceInline, AttendanceDeductionInline]


@admin.register(StaffLoan)
class StaffLoanAdmin(admin.ModelAdmin):
    list_display = [
        "loan_no",
        "employee_name",
        "loan_date",
        "loan_amount",
        "emi",
        "repaid_amount",
        "balance",
        "status",
        "organization",
    ]
    list_filter = ["organization", "status"]
    search_fields = ["loan_no", "employee_name"]
    ordering = ["organization", "-loan_date", "-loan_no"]
    readonly_fields = ["loan_no"]


@admin.register(PayrollLedger)
class PayrollLedgerAdmin(admin.ModelAdmin):
    list_display = [
        "serial_number",
        "employee_name",
        "transaction_date",
        "transaction_type",
        "debit",
        "credit",
        "running_balance",
    ]
    list_filter = ["organization", "transaction_type"]
    search_fields = ["employee_name"]
    ordering = ["organization", "employee", "serial_number"]


@admin.register(DailyWage)
class DailyWageAdmin(admin.ModelAdmin):
    list_display = ["date", "worker_name", "work_type", "hours", "rate", "amount", "organization"]
    list_filter = ["organization", "date"]
    search_fields = ["worker_name", "work_type"]
    ordering = ["organization", "-date"]
