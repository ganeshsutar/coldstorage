import uuid
from decimal import Decimal

from django.db import models

from apps.authentication.models import Organization


class EmployeeStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    ON_LEAVE = "ON_LEAVE", "On Leave"
    INACTIVE = "INACTIVE", "Inactive"
    PROBATION = "PROBATION", "Probation"


class AttendanceStatus(models.TextChoices):
    DRAFT = "DRAFT", "Draft"
    PROCESSED = "PROCESSED", "Processed"
    CONFIRMED = "CONFIRMED", "Confirmed"
    CANCELLED = "CANCELLED", "Cancelled"


class StaffLoanStatus(models.TextChoices):
    ACTIVE = "ACTIVE", "Active"
    REPAID = "REPAID", "Repaid"
    CANCELLED = "CANCELLED", "Cancelled"


class ComponentType(models.TextChoices):
    FIXED = "FIXED", "Fixed Amount"
    PERCENTAGE = "PERCENTAGE", "Percentage of Basic"


class PayrollTransactionType(models.TextChoices):
    SAL = "SAL", "Salary"
    ADV = "ADV", "Advance"
    LOAN = "LOAN", "Loan"
    EMI = "EMI", "EMI Deduction"


class PayPost(models.Model):
    """Pay Post (position/designation master) with salary and leave entitlements."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="pay_posts",
    )
    post_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated: PP/YYYY-NNNNN",
    )
    post_name = models.CharField(max_length=255)
    basic_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    cl_entitlement = models.PositiveIntegerField(default=0, help_text="Casual Leave per year")
    el_entitlement = models.PositiveIntegerField(default=0, help_text="Earned Leave per year")
    ml_entitlement = models.PositiveIntegerField(default=0, help_text="Medical Leave per year")
    metl_entitlement = models.PositiveIntegerField(default=0, help_text="Maternity Leave per year")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payroll_pay_post"
        verbose_name = "Pay Post"
        verbose_name_plural = "Pay Posts"
        ordering = ["post_name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "post_no"],
                name="unique_org_post_no",
            )
        ]

    def __str__(self):
        return f"{self.post_name} ({self.post_no})"

    def save(self, *args, **kwargs):
        if not self.post_no:
            from django.utils import timezone
            from apps.system.services import SequenceService
            self.post_no = SequenceService.get_next_number(self.organization, "PAY_POST", timezone.now().year)
        super().save(*args, **kwargs)


class Employee(models.Model):
    """Employee master record."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="employees",
    )
    employee_code = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated: EMP/YYYY-NNNNN",
    )
    name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255, blank=True, null=True)
    department = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    aadhaar = models.CharField(max_length=20, blank=True, null=True)
    pan_number = models.CharField(max_length=20, blank=True, null=True)

    # Bank details
    bank_name = models.CharField(max_length=255, blank=True, null=True)
    bank_account_no = models.CharField(max_length=50, blank=True, null=True)
    bank_ifsc = models.CharField(max_length=20, blank=True, null=True)
    bank_branch = models.CharField(max_length=255, blank=True, null=True)

    # Statutory
    uan = models.CharField(max_length=20, blank=True, null=True, help_text="Universal Account Number for PF")
    pf_applicable = models.BooleanField(default=False)
    esi_applicable = models.BooleanField(default=False)

    # Employment
    pay_post = models.ForeignKey(
        PayPost,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="employees",
    )
    joining_date = models.DateField(null=True, blank=True)
    basic_salary = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    status = models.CharField(
        max_length=15,
        choices=EmployeeStatus.choices,
        default=EmployeeStatus.ACTIVE,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payroll_employee"
        verbose_name = "Employee"
        verbose_name_plural = "Employees"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "employee_code"],
                name="unique_org_employee_code",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "status"]),
        ]

    def __str__(self):
        return f"{self.name} ({self.employee_code})"

    def save(self, *args, **kwargs):
        if not self.employee_code:
            from django.utils import timezone
            from apps.system.services import SequenceService
            self.employee_code = SequenceService.get_next_number(self.organization, "EMPLOYEE", timezone.now().year)
        super().save(*args, **kwargs)


class Allowance(models.Model):
    """Allowance master (e.g., HRA, DA, TA)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="allowances",
    )
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=255)
    component_type = models.CharField(
        max_length=15,
        choices=ComponentType.choices,
        default=ComponentType.FIXED,
    )
    value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Fixed amount or percentage value",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payroll_allowance"
        verbose_name = "Allowance"
        verbose_name_plural = "Allowances"
        ordering = ["code"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "code"],
                name="unique_org_allowance_code",
            )
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"


class Deduction(models.Model):
    """Deduction master (e.g., TDS, Professional Tax)."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="deductions",
    )
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=255)
    component_type = models.CharField(
        max_length=15,
        choices=ComponentType.choices,
        default=ComponentType.FIXED,
    )
    value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Fixed amount or percentage value",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payroll_deduction"
        verbose_name = "Deduction"
        verbose_name_plural = "Deductions"
        ordering = ["code"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "code"],
                name="unique_org_deduction_code",
            )
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"


class EmployeeAllowance(models.Model):
    """Allowance assigned to a specific employee."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="allowances",
    )
    allowance = models.ForeignKey(
        Allowance,
        on_delete=models.CASCADE,
        related_name="employee_allowances",
    )
    value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Override value for this employee",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payroll_employee_allowance"
        verbose_name = "Employee Allowance"
        verbose_name_plural = "Employee Allowances"
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "allowance"],
                name="unique_employee_allowance",
            )
        ]

    def __str__(self):
        return f"{self.employee.name} - {self.allowance.name}: {self.value}"


class EmployeeDeduction(models.Model):
    """Deduction assigned to a specific employee."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="deductions",
    )
    deduction = models.ForeignKey(
        Deduction,
        on_delete=models.CASCADE,
        related_name="employee_deductions",
    )
    value = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Override value for this employee",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payroll_employee_deduction"
        verbose_name = "Employee Deduction"
        verbose_name_plural = "Employee Deductions"
        constraints = [
            models.UniqueConstraint(
                fields=["employee", "deduction"],
                name="unique_employee_deduction",
            )
        ]

    def __str__(self):
        return f"{self.employee.name} - {self.deduction.name}: {self.value}"


class SalaryIncrement(models.Model):
    """Salary increment record with PF/ESI rates."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="salary_increments",
    )
    from_date = models.DateField()
    to_date = models.DateField(null=True, blank=True, help_text="Null means currently active")
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    pf_salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"),
                                     help_text="Salary for PF calculation")
    esi_salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"),
                                      help_text="Salary for ESI calculation")
    pf_employee_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("12.00"))
    pf_employer_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("12.00"))
    esi_employee_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0.75"))
    esi_employer_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("3.25"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payroll_salary_increment"
        verbose_name = "Salary Increment"
        verbose_name_plural = "Salary Increments"
        ordering = ["-from_date"]

    def __str__(self):
        return f"{self.employee.name}: {self.basic_salary} from {self.from_date}"


class Attendance(models.Model):
    """Monthly attendance and salary summary per employee."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="attendance_records",
    )
    employee = models.ForeignKey(
        Employee,
        on_delete=models.PROTECT,
        related_name="attendance_records",
    )
    employee_name = models.CharField(max_length=255)
    month = models.PositiveIntegerField()
    year = models.PositiveIntegerField()
    month_days = models.PositiveIntegerField(default=30)

    # Attendance counts
    present_days = models.DecimalField(max_digits=5, decimal_places=1, default=Decimal("0"))
    lwp = models.DecimalField(max_digits=5, decimal_places=1, default=Decimal("0"), help_text="Leave Without Pay")
    cl = models.DecimalField(max_digits=5, decimal_places=1, default=Decimal("0"), help_text="Casual Leave")
    ml = models.DecimalField(max_digits=5, decimal_places=1, default=Decimal("0"), help_text="Medical Leave")
    el = models.DecimalField(max_digits=5, decimal_places=1, default=Decimal("0"), help_text="Earned Leave")
    metl = models.DecimalField(max_digits=5, decimal_places=1, default=Decimal("0"), help_text="Maternity Leave")

    # Salary components
    basic_salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_allowances = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    total_deductions = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    # Statutory
    pf_employee = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    pf_employer = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    esi_employee = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    esi_employer = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    # Loan
    loan_emi = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    # Net
    net_salary = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    # Status
    status = models.CharField(
        max_length=15,
        choices=AttendanceStatus.choices,
        default=AttendanceStatus.DRAFT,
    )

    # Audit
    confirmed_at = models.DateTimeField(null=True, blank=True)
    confirmed_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="confirmed_attendance",
    )
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cancelled_attendance",
    )
    cancel_reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payroll_attendance"
        verbose_name = "Attendance"
        verbose_name_plural = "Attendance Records"
        ordering = ["-year", "-month", "employee_name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "employee", "month", "year"],
                name="unique_org_employee_month_year",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "year", "month"]),
            models.Index(fields=["organization", "status"]),
        ]

    def __str__(self):
        return f"{self.employee_name} - {self.month}/{self.year}"

    def save(self, *args, **kwargs):
        if self.employee:
            self.employee_name = self.employee.name
        super().save(*args, **kwargs)


class AttendanceAllowance(models.Model):
    """Allowance line item on attendance/salary record."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attendance = models.ForeignKey(
        Attendance,
        on_delete=models.CASCADE,
        related_name="allowance_items",
    )
    allowance = models.ForeignKey(
        Allowance,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="attendance_items",
    )
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        db_table = "payroll_attendance_allowance"
        verbose_name = "Attendance Allowance"
        verbose_name_plural = "Attendance Allowances"

    def __str__(self):
        return f"{self.name}: {self.amount}"


class AttendanceDeduction(models.Model):
    """Deduction line item on attendance/salary record."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    attendance = models.ForeignKey(
        Attendance,
        on_delete=models.CASCADE,
        related_name="deduction_items",
    )
    deduction = models.ForeignKey(
        Deduction,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="attendance_items",
    )
    name = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))

    class Meta:
        db_table = "payroll_attendance_deduction"
        verbose_name = "Attendance Deduction"
        verbose_name_plural = "Attendance Deductions"

    def __str__(self):
        return f"{self.name}: {self.amount}"


class StaffLoan(models.Model):
    """Staff loan record."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="staff_loans",
    )
    loan_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated: SL/YYYY-NNNNN",
    )
    employee = models.ForeignKey(
        Employee,
        on_delete=models.PROTECT,
        related_name="staff_loans",
    )
    employee_name = models.CharField(max_length=255)
    loan_date = models.DateField()
    loan_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    emi = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    repaid_amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    remarks = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=15,
        choices=StaffLoanStatus.choices,
        default=StaffLoanStatus.ACTIVE,
    )

    # Audit
    confirmed_at = models.DateTimeField(null=True, blank=True)
    confirmed_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="confirmed_staff_loans",
    )
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancelled_by = models.ForeignKey(
        "authentication.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="cancelled_staff_loans",
    )
    cancel_reason = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payroll_staff_loan"
        verbose_name = "Staff Loan"
        verbose_name_plural = "Staff Loans"
        ordering = ["-loan_date", "-loan_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "loan_no"],
                name="unique_org_staff_loan_no",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "employee"]),
            models.Index(fields=["organization", "status"]),
        ]

    def __str__(self):
        return f"Loan {self.loan_no} - {self.employee_name}"

    def save(self, *args, **kwargs):
        if not self.loan_no:
            from apps.system.services import SequenceService
            self.loan_no = SequenceService.get_next_number(self.organization, "STAFF_LOAN", self.loan_date.year)
        if self.employee:
            self.employee_name = self.employee.name
        self.balance = self.loan_amount - self.repaid_amount
        super().save(*args, **kwargs)


class PayrollLedger(models.Model):
    """Transaction log for payroll operations per employee."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="payroll_ledger",
    )
    employee = models.ForeignKey(
        Employee,
        on_delete=models.PROTECT,
        related_name="payroll_ledger",
    )
    employee_name = models.CharField(max_length=255)
    serial_number = models.PositiveIntegerField()
    transaction_date = models.DateField()
    transaction_type = models.CharField(
        max_length=10,
        choices=PayrollTransactionType.choices,
    )
    debit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    credit = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    running_balance = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    reference_id = models.UUIDField(null=True, blank=True, help_text="Reference to attendance/loan")
    remarks = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "payroll_ledger"
        verbose_name = "Payroll Ledger Entry"
        verbose_name_plural = "Payroll Ledger Entries"
        ordering = ["employee", "serial_number"]
        indexes = [
            models.Index(fields=["organization", "employee"]),
            models.Index(fields=["organization", "transaction_date"]),
        ]

    def __str__(self):
        return f"{self.employee_name} #{self.serial_number}: {self.transaction_type}"

    def save(self, *args, **kwargs):
        if self.employee:
            self.employee_name = self.employee.name
        if not self.serial_number:
            self.serial_number = self._next_serial()
        super().save(*args, **kwargs)

    def _next_serial(self):
        last = PayrollLedger.objects.filter(
            organization=self.organization,
            employee=self.employee,
        ).order_by("-serial_number").first()
        return (last.serial_number + 1) if last else 1


class DailyWage(models.Model):
    """Daily wage record for casual/contract workers."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="daily_wages",
    )
    date = models.DateField()
    worker_name = models.CharField(max_length=255)
    work_type = models.CharField(max_length=255, blank=True, null=True)
    hours = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0.00"))
    rate = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal("0.00"))
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=Decimal("0.00"))
    remarks = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payroll_daily_wage"
        verbose_name = "Daily Wage"
        verbose_name_plural = "Daily Wages"
        ordering = ["-date", "worker_name"]
        indexes = [
            models.Index(fields=["organization", "date"]),
        ]

    def __str__(self):
        return f"{self.worker_name} - {self.date}: {self.amount}"

    def save(self, *args, **kwargs):
        self.amount = self.hours * self.rate
        super().save(*args, **kwargs)
