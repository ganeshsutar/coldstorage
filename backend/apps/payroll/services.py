from decimal import Decimal

from django.db import transaction
from django.db.models import Sum
from django.utils import timezone

from .models import (
    Attendance,
    AttendanceAllowance,
    AttendanceDeduction,
    AttendanceStatus,
    ComponentType,
    Employee,
    EmployeeAllowance,
    EmployeeDeduction,
    EmployeeStatus,
    PayPost,
    PayrollLedger,
    PayrollTransactionType,
    StaffLoan,
    StaffLoanStatus,
)


class PayrollService:
    """Service for payroll operations."""

    def __init__(self, organization):
        self.organization = organization

    @transaction.atomic
    def create_employee(self, form_input: dict, user=None) -> Employee:
        """Create an employee with optional allowance/deduction assignments."""
        pay_post = None
        if form_input.get("pay_post_id"):
            pay_post = PayPost.objects.get(
                id=form_input["pay_post_id"],
                organization=self.organization,
            )

        employee = Employee.objects.create(
            organization=self.organization,
            name=form_input["name"],
            designation=form_input.get("designation"),
            department=form_input.get("department"),
            phone=form_input.get("phone"),
            address=form_input.get("address"),
            aadhaar=form_input.get("aadhaar"),
            pan_number=form_input.get("pan_number"),
            bank_name=form_input.get("bank_name"),
            bank_account_no=form_input.get("bank_account_no"),
            bank_ifsc=form_input.get("bank_ifsc"),
            bank_branch=form_input.get("bank_branch"),
            uan=form_input.get("uan"),
            pf_applicable=form_input.get("pf_applicable", False),
            esi_applicable=form_input.get("esi_applicable", False),
            pay_post=pay_post,
            joining_date=form_input.get("joining_date"),
            basic_salary=form_input.get("basic_salary", Decimal("0.00")),
            status=form_input.get("status", EmployeeStatus.ACTIVE),
        )

        # Create allowance assignments
        for item in form_input.get("allowances", []):
            EmployeeAllowance.objects.create(
                employee=employee,
                allowance_id=item["allowance_id"],
                value=item["value"],
            )

        # Create deduction assignments
        for item in form_input.get("deductions", []):
            EmployeeDeduction.objects.create(
                employee=employee,
                deduction_id=item["deduction_id"],
                value=item["value"],
            )

        return employee

    @transaction.atomic
    def update_employee(self, employee_id: str, form_input: dict, user=None) -> Employee:
        """Update an employee and their allowance/deduction assignments."""
        employee = Employee.objects.get(
            id=employee_id,
            organization=self.organization,
        )

        # Update basic fields
        for field in [
            "name", "designation", "department", "phone", "address",
            "aadhaar", "pan_number", "bank_name", "bank_account_no",
            "bank_ifsc", "bank_branch", "uan", "pf_applicable",
            "esi_applicable", "joining_date", "basic_salary", "status",
        ]:
            if field in form_input:
                setattr(employee, field, form_input[field])

        if "pay_post_id" in form_input:
            if form_input["pay_post_id"]:
                employee.pay_post = PayPost.objects.get(
                    id=form_input["pay_post_id"],
                    organization=self.organization,
                )
            else:
                employee.pay_post = None

        employee.save()

        # Replace allowances if provided
        if "allowances" in form_input:
            employee.allowances.all().delete()
            for item in form_input["allowances"]:
                EmployeeAllowance.objects.create(
                    employee=employee,
                    allowance_id=item["allowance_id"],
                    value=item["value"],
                )

        # Replace deductions if provided
        if "deductions" in form_input:
            employee.deductions.all().delete()
            for item in form_input["deductions"]:
                EmployeeDeduction.objects.create(
                    employee=employee,
                    deduction_id=item["deduction_id"],
                    value=item["value"],
                )

        return employee

    @transaction.atomic
    def process_salary(self, month: int, year: int) -> list:
        """
        Process salary for all active employees for a given month/year.
        Creates or updates Attendance records with calculated salary components.
        """
        import calendar
        month_days = calendar.monthrange(year, month)[1]

        employees = Employee.objects.filter(
            organization=self.organization,
            status=EmployeeStatus.ACTIVE,
        ).prefetch_related(
            "allowances__allowance",
            "deductions__deduction",
            "salary_increments",
            "staff_loans",
        )

        results = []

        for employee in employees:
            # Skip if already processed/confirmed for this month
            existing = Attendance.objects.filter(
                organization=self.organization,
                employee=employee,
                month=month,
                year=year,
            ).first()

            if existing and existing.status in [AttendanceStatus.CONFIRMED]:
                continue

            # Get active salary increment
            increment = employee.salary_increments.filter(
                to_date__isnull=True,
            ).first()

            basic = increment.basic_salary if increment else employee.basic_salary
            pf_salary = increment.pf_salary if increment else basic
            pf_employee_rate = increment.pf_employee_rate if increment else Decimal("12.00")
            pf_employer_rate = increment.pf_employer_rate if increment else Decimal("12.00")
            esi_employee_rate = increment.esi_employee_rate if increment else Decimal("0.75")
            esi_employer_rate = increment.esi_employer_rate if increment else Decimal("3.25")

            # Default: all days present if no existing attendance
            present_days = existing.present_days if existing else Decimal(str(month_days))

            # Calculate effective basic (pro-rata)
            effective_basic = (basic * present_days / Decimal(str(month_days))).quantize(Decimal("0.01"))

            # Calculate allowances
            total_allowances = Decimal("0.00")
            allowance_items = []
            for ea in employee.allowances.select_related("allowance"):
                if ea.allowance.component_type == ComponentType.FIXED:
                    amt = (ea.value * present_days / Decimal(str(month_days))).quantize(Decimal("0.01"))
                else:  # PERCENTAGE
                    amt = (effective_basic * ea.value / Decimal("100")).quantize(Decimal("0.01"))
                total_allowances += amt
                allowance_items.append({
                    "allowance": ea.allowance,
                    "name": ea.allowance.name,
                    "amount": amt,
                })

            gross = effective_basic + total_allowances

            # Calculate deductions
            total_deductions = Decimal("0.00")
            deduction_items = []
            for ed in employee.deductions.select_related("deduction"):
                if ed.deduction.component_type == ComponentType.FIXED:
                    amt = (ed.value * present_days / Decimal(str(month_days))).quantize(Decimal("0.01"))
                else:  # PERCENTAGE
                    amt = (effective_basic * ed.value / Decimal("100")).quantize(Decimal("0.01"))
                total_deductions += amt
                deduction_items.append({
                    "deduction": ed.deduction,
                    "name": ed.deduction.name,
                    "amount": amt,
                })

            # PF calculation
            pf_employee = Decimal("0.00")
            pf_employer = Decimal("0.00")
            if employee.pf_applicable:
                pf_employee = (pf_salary * pf_employee_rate / Decimal("100")).quantize(Decimal("0.01"))
                pf_employer = (pf_salary * pf_employer_rate / Decimal("100")).quantize(Decimal("0.01"))

            # ESI calculation (applicable if gross <= 21000)
            esi_employee = Decimal("0.00")
            esi_employer = Decimal("0.00")
            if employee.esi_applicable and gross <= Decimal("21000"):
                esi_employee = (gross * esi_employee_rate / Decimal("100")).quantize(Decimal("0.01"))
                esi_employer = (gross * esi_employer_rate / Decimal("100")).quantize(Decimal("0.01"))

            # Loan EMI
            loan_emi = Decimal("0.00")
            active_loans = employee.staff_loans.filter(
                status=StaffLoanStatus.ACTIVE,
                balance__gt=0,
            )
            for loan in active_loans:
                deductible = min(loan.emi, loan.balance)
                loan_emi += deductible

            # Net salary
            net = gross - total_deductions - pf_employee - esi_employee - loan_emi

            # Create or update attendance
            if existing:
                attendance = existing
                attendance.month_days = month_days
                attendance.basic_salary = effective_basic
                attendance.gross_salary = gross
                attendance.total_allowances = total_allowances
                attendance.total_deductions = total_deductions
                attendance.pf_employee = pf_employee
                attendance.pf_employer = pf_employer
                attendance.esi_employee = esi_employee
                attendance.esi_employer = esi_employer
                attendance.loan_emi = loan_emi
                attendance.net_salary = net
                attendance.status = AttendanceStatus.PROCESSED
                attendance.save()
                # Clear old line items
                attendance.allowance_items.all().delete()
                attendance.deduction_items.all().delete()
            else:
                attendance = Attendance.objects.create(
                    organization=self.organization,
                    employee=employee,
                    month=month,
                    year=year,
                    month_days=month_days,
                    present_days=present_days,
                    basic_salary=effective_basic,
                    gross_salary=gross,
                    total_allowances=total_allowances,
                    total_deductions=total_deductions,
                    pf_employee=pf_employee,
                    pf_employer=pf_employer,
                    esi_employee=esi_employee,
                    esi_employer=esi_employer,
                    loan_emi=loan_emi,
                    net_salary=net,
                    status=AttendanceStatus.PROCESSED,
                )

            # Create line items
            for item in allowance_items:
                AttendanceAllowance.objects.create(
                    attendance=attendance,
                    allowance=item["allowance"],
                    name=item["name"],
                    amount=item["amount"],
                )
            for item in deduction_items:
                AttendanceDeduction.objects.create(
                    attendance=attendance,
                    deduction=item["deduction"],
                    name=item["name"],
                    amount=item["amount"],
                )

            results.append(attendance)

        return results

    @transaction.atomic
    def confirm_attendance(self, attendance_id: str, user=None) -> Attendance:
        """Confirm a processed attendance record and create ledger entries."""
        attendance = Attendance.objects.get(
            id=attendance_id,
            organization=self.organization,
        )

        if attendance.status != AttendanceStatus.PROCESSED:
            raise ValueError(f"Cannot confirm attendance in status: {attendance.status}")

        # Create salary ledger entry (credit = salary paid)
        last_entry = PayrollLedger.objects.filter(
            organization=self.organization,
            employee=attendance.employee,
        ).order_by("-serial_number").first()

        prev_balance = last_entry.running_balance if last_entry else Decimal("0.00")
        new_balance = prev_balance + attendance.net_salary

        PayrollLedger.objects.create(
            organization=self.organization,
            employee=attendance.employee,
            transaction_date=timezone.now().date(),
            transaction_type=PayrollTransactionType.SAL,
            credit=attendance.net_salary,
            running_balance=new_balance,
            reference_id=attendance.id,
            remarks=f"Salary for {attendance.month}/{attendance.year}",
        )

        # Deduct loan EMIs from staff loans
        if attendance.loan_emi > Decimal("0.00"):
            remaining_emi = attendance.loan_emi
            active_loans = attendance.employee.staff_loans.filter(
                status=StaffLoanStatus.ACTIVE,
                balance__gt=0,
            ).order_by("loan_date")

            for loan in active_loans:
                if remaining_emi <= 0:
                    break
                deductible = min(loan.emi, loan.balance, remaining_emi)
                loan.repaid_amount += deductible
                loan.save()
                remaining_emi -= deductible

                # Check if loan is fully repaid
                if loan.balance <= 0:
                    loan.status = StaffLoanStatus.REPAID
                    loan.save()

                # Create EMI ledger entry
                last_entry = PayrollLedger.objects.filter(
                    organization=self.organization,
                    employee=attendance.employee,
                ).order_by("-serial_number").first()
                new_balance = last_entry.running_balance - deductible

                PayrollLedger.objects.create(
                    organization=self.organization,
                    employee=attendance.employee,
                    transaction_date=timezone.now().date(),
                    transaction_type=PayrollTransactionType.EMI,
                    debit=deductible,
                    running_balance=new_balance,
                    reference_id=loan.id,
                    remarks=f"EMI for loan {loan.loan_no}",
                )

        attendance.status = AttendanceStatus.CONFIRMED
        attendance.confirmed_at = timezone.now()
        attendance.confirmed_by = user
        attendance.save()

        return attendance

    @transaction.atomic
    def cancel_attendance(self, attendance_id: str, reason: str, user=None) -> Attendance:
        """Cancel an attendance record and create reversal entries."""
        attendance = Attendance.objects.get(
            id=attendance_id,
            organization=self.organization,
        )

        if attendance.status == AttendanceStatus.CANCELLED:
            raise ValueError("Attendance is already cancelled")

        # If confirmed, create reversal ledger entries
        if attendance.status == AttendanceStatus.CONFIRMED:
            last_entry = PayrollLedger.objects.filter(
                organization=self.organization,
                employee=attendance.employee,
            ).order_by("-serial_number").first()
            prev_balance = last_entry.running_balance if last_entry else Decimal("0.00")

            PayrollLedger.objects.create(
                organization=self.organization,
                employee=attendance.employee,
                transaction_date=timezone.now().date(),
                transaction_type=PayrollTransactionType.SAL,
                debit=attendance.net_salary,
                running_balance=prev_balance - attendance.net_salary,
                reference_id=attendance.id,
                remarks=f"Reversal: Salary for {attendance.month}/{attendance.year} - {reason}",
            )

        attendance.status = AttendanceStatus.CANCELLED
        attendance.cancelled_at = timezone.now()
        attendance.cancelled_by = user
        attendance.cancel_reason = reason
        attendance.save()

        return attendance

    @transaction.atomic
    def create_staff_loan(self, form_input: dict, user=None) -> StaffLoan:
        """Create a staff loan and ledger entry."""
        employee = Employee.objects.get(
            id=form_input["employee_id"],
            organization=self.organization,
        )

        loan = StaffLoan.objects.create(
            organization=self.organization,
            employee=employee,
            loan_date=form_input["loan_date"],
            loan_amount=form_input["loan_amount"],
            emi=form_input["emi"],
            remarks=form_input.get("remarks"),
        )

        # Create LOAN ledger entry
        last_entry = PayrollLedger.objects.filter(
            organization=self.organization,
            employee=employee,
        ).order_by("-serial_number").first()
        prev_balance = last_entry.running_balance if last_entry else Decimal("0.00")

        PayrollLedger.objects.create(
            organization=self.organization,
            employee=employee,
            transaction_date=loan.loan_date,
            transaction_type=PayrollTransactionType.LOAN,
            debit=loan.loan_amount,
            running_balance=prev_balance - loan.loan_amount,
            reference_id=loan.id,
            remarks=f"Staff Loan {loan.loan_no}",
        )

        return loan

    @transaction.atomic
    def cancel_staff_loan(self, loan_id: str, reason: str, user=None) -> StaffLoan:
        """Cancel a staff loan and create reversal entry."""
        loan = StaffLoan.objects.get(
            id=loan_id,
            organization=self.organization,
        )

        if loan.status == StaffLoanStatus.CANCELLED:
            raise ValueError("Loan is already cancelled")

        if loan.repaid_amount > 0:
            raise ValueError("Cannot cancel loan with repayments. Clear repayments first.")

        # Reversal ledger entry
        last_entry = PayrollLedger.objects.filter(
            organization=self.organization,
            employee=loan.employee,
        ).order_by("-serial_number").first()
        prev_balance = last_entry.running_balance if last_entry else Decimal("0.00")

        PayrollLedger.objects.create(
            organization=self.organization,
            employee=loan.employee,
            transaction_date=timezone.now().date(),
            transaction_type=PayrollTransactionType.LOAN,
            credit=loan.loan_amount,
            running_balance=prev_balance + loan.loan_amount,
            reference_id=loan.id,
            remarks=f"Reversal: Staff Loan {loan.loan_no} - {reason}",
        )

        loan.status = StaffLoanStatus.CANCELLED
        loan.cancelled_at = timezone.now()
        loan.cancelled_by = user
        loan.cancel_reason = reason
        loan.save()

        return loan

    def get_payroll_stats(self) -> dict:
        """Get payroll statistics for dashboard."""
        total_employees = Employee.objects.filter(
            organization=self.organization,
        ).count()

        active_employees = Employee.objects.filter(
            organization=self.organization,
            status=EmployeeStatus.ACTIVE,
        ).count()

        # Current month salary payable (PROCESSED but not CONFIRMED)
        now = timezone.now()
        salary_payable = Attendance.objects.filter(
            organization=self.organization,
            status=AttendanceStatus.PROCESSED,
        ).aggregate(total=Sum("net_salary"))["total"] or Decimal("0.00")

        # Total outstanding staff loans
        loan_outstanding = StaffLoan.objects.filter(
            organization=self.organization,
            status=StaffLoanStatus.ACTIVE,
        ).aggregate(total=Sum("balance"))["total"] or Decimal("0.00")

        return {
            "total_employees": total_employees,
            "active_employees": active_employees,
            "salary_payable": salary_payable,
            "loan_outstanding": loan_outstanding,
        }
