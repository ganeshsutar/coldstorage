import uuid
from decimal import Decimal

from django.db import connection, models

from apps.authentication.models import Organization


class AccountType(models.TextChoices):
    """Type of account in the chart of accounts."""

    GROUP = "GROUP", "Group"
    ACCOUNT = "ACCOUNT", "Account"


class BalanceNature(models.TextChoices):
    """Nature of balance for the account."""

    DEBIT = "DEBIT", "Debit"
    CREDIT = "CREDIT", "Credit"


class VoucherType(models.TextChoices):
    """Type of voucher for ledger entries."""

    CR = "CR", "Cash Receipt"
    DR = "DR", "Cash Payment"
    JV = "JV", "Journal Voucher"
    CV = "CV", "Contra Voucher"
    BH = "BH", "Bank"


class AccountManager(models.Manager):
    """Custom manager for Account model with recursive CTE methods."""

    def get_ancestors(self, account_id):
        """Get all ancestors of an account using recursive CTE."""
        with connection.cursor() as cursor:
            cursor.execute(
                """
                WITH RECURSIVE ancestors AS (
                    SELECT id, parent_id, code, name, level, 1 as depth
                    FROM accounting_account
                    WHERE id = %s
                    UNION ALL
                    SELECT a.id, a.parent_id, a.code, a.name, a.level, ancestors.depth + 1
                    FROM accounting_account a
                    INNER JOIN ancestors ON a.id = ancestors.parent_id
                )
                SELECT id FROM ancestors WHERE id != %s ORDER BY depth DESC
                """,
                [str(account_id), str(account_id)],
            )
            ancestor_ids = [row[0] for row in cursor.fetchall()]
        return self.filter(id__in=ancestor_ids)

    def get_descendants(self, account_id):
        """Get all descendants of an account using recursive CTE."""
        with connection.cursor() as cursor:
            cursor.execute(
                """
                WITH RECURSIVE descendants AS (
                    SELECT id, parent_id, code, name, level, 1 as depth
                    FROM accounting_account
                    WHERE id = %s
                    UNION ALL
                    SELECT a.id, a.parent_id, a.code, a.name, a.level, descendants.depth + 1
                    FROM accounting_account a
                    INNER JOIN descendants ON a.parent_id = descendants.id
                )
                SELECT id FROM descendants WHERE id != %s ORDER BY depth
                """,
                [str(account_id), str(account_id)],
            )
            descendant_ids = [row[0] for row in cursor.fetchall()]
        return self.filter(id__in=descendant_ids)

    def get_tree(self, organization_id, root_id=None):
        """
        Get hierarchical tree structure of accounts.
        If root_id is provided, returns tree starting from that account.
        """
        if root_id:
            accounts = list(self.filter(organization_id=organization_id, id=root_id)) + list(
                self.get_descendants(root_id)
            )
        else:
            accounts = list(self.filter(organization_id=organization_id).order_by("level", "code"))

        account_dict = {str(a.id): a for a in accounts}
        for account in accounts:
            account.children_list = []

        roots = []
        for account in accounts:
            if account.parent_id and str(account.parent_id) in account_dict:
                parent = account_dict[str(account.parent_id)]
                parent.children_list.append(account)
            elif not account.parent_id or (root_id and str(account.id) == str(root_id)):
                roots.append(account)

        return roots


class Account(models.Model):
    """Chart of Accounts / Party Master model."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="accounts",
    )
    code = models.CharField(max_length=20, db_index=True)
    name = models.CharField(max_length=255)
    name_hindi = models.CharField(max_length=255, blank=True, null=True)
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    level = models.PositiveSmallIntegerField(default=0)
    account_type = models.CharField(
        max_length=10,
        choices=AccountType.choices,
        default=AccountType.ACCOUNT,
    )
    balance_nature = models.CharField(
        max_length=10,
        choices=BalanceNature.choices,
        default=BalanceNature.DEBIT,
    )

    # Balance fields
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    debit_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    credit_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    closing_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))

    # Component balances for detailed tracking
    principal_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    interest_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    other_charges_balance = models.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal("0.00")
    )

    # Identity documents for party accounts
    pan_number = models.CharField(max_length=20, blank=True, null=True)
    aadhar_number = models.CharField(max_length=20, blank=True, null=True)
    gst_number = models.CharField(max_length=20, blank=True, null=True)

    # Contact info
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    pincode = models.CharField(max_length=10, blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)

    # Interest rate for party accounts
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("0.00"))

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = AccountManager()

    class Meta:
        db_table = "accounting_account"
        verbose_name = "account"
        verbose_name_plural = "accounts"
        ordering = ["code"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "code"],
                name="unique_organization_account_code",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "account_type"]),
            models.Index(fields=["organization", "parent"]),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"

    def save(self, *args, **kwargs):
        if self.parent:
            self.level = self.parent.level + 1
        else:
            self.level = 0
        super().save(*args, **kwargs)

    def recalculate_balance(self):
        """Recalculate closing balance from ledger entries."""
        from django.db.models import Sum

        totals = self.ledger_entries.aggregate(
            total_principal_dr=Sum("principal_amount", filter=models.Q(voucher_type__in=["DR", "JV"])),
            total_principal_cr=Sum(
                "principal_amount", filter=models.Q(voucher_type__in=["CR", "CV", "BH"])
            ),
            total_interest_dr=Sum("interest_amount", filter=models.Q(voucher_type__in=["DR", "JV"])),
            total_interest_cr=Sum(
                "interest_amount", filter=models.Q(voucher_type__in=["CR", "CV", "BH"])
            ),
            total_other_dr=Sum("other_charges", filter=models.Q(voucher_type__in=["DR", "JV"])),
            total_other_cr=Sum("other_charges", filter=models.Q(voucher_type__in=["CR", "CV", "BH"])),
        )

        self.principal_balance = (totals["total_principal_dr"] or Decimal("0")) - (
            totals["total_principal_cr"] or Decimal("0")
        )
        self.interest_balance = (totals["total_interest_dr"] or Decimal("0")) - (
            totals["total_interest_cr"] or Decimal("0")
        )
        self.other_charges_balance = (totals["total_other_dr"] or Decimal("0")) - (
            totals["total_other_cr"] or Decimal("0")
        )

        self.debit_balance = (
            (totals["total_principal_dr"] or Decimal("0"))
            + (totals["total_interest_dr"] or Decimal("0"))
            + (totals["total_other_dr"] or Decimal("0"))
        )
        self.credit_balance = (
            (totals["total_principal_cr"] or Decimal("0"))
            + (totals["total_interest_cr"] or Decimal("0"))
            + (totals["total_other_cr"] or Decimal("0"))
        )

        self.closing_balance = self.opening_balance + self.debit_balance - self.credit_balance
        self.save()


class PartyLedger(models.Model):
    """Transaction ledger for party accounts."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="party_ledger_entries",
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="ledger_entries",
    )
    serial_number = models.PositiveIntegerField(db_index=True)
    voucher_type = models.CharField(
        max_length=5,
        choices=VoucherType.choices,
    )
    voucher_number = models.CharField(max_length=50, blank=True, null=True)
    date = models.DateField(db_index=True)
    narration = models.TextField(blank=True, null=True)

    # Amount fields
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    principal_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    interest_amount = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    other_charges = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))

    # Running balance after this entry
    running_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))

    # External references
    external_ref = models.CharField(max_length=100, blank=True, null=True)
    external_ref_type = models.CharField(max_length=50, blank=True, null=True)

    # Link to daybook transaction if applicable
    daybook_transaction = models.ForeignKey(
        "DaybookTransaction",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="ledger_entries",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "accounting_party_ledger"
        verbose_name = "party ledger entry"
        verbose_name_plural = "party ledger entries"
        ordering = ["-date", "-serial_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "account", "serial_number"],
                name="unique_account_serial_number",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "date"]),
            models.Index(fields=["account", "date"]),
        ]

    def __str__(self):
        return f"{self.account.code} - {self.voucher_type} - {self.date}"

    def save(self, *args, **kwargs):
        if not self.serial_number:
            last_entry = PartyLedger.objects.filter(
                organization=self.organization, account=self.account
            ).order_by("-serial_number").first()
            self.serial_number = (last_entry.serial_number + 1) if last_entry else 1

        # Ensure amount equals sum of components
        if self.amount == Decimal("0.00"):
            self.amount = self.principal_amount + self.interest_amount + self.other_charges

        super().save(*args, **kwargs)


class PartyLedgerOpening(models.Model):
    """Opening balance for party accounts at start of financial year."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="party_ledger_openings",
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="opening_balances",
    )
    financial_year = models.CharField(max_length=10)  # e.g., "2024-25"
    opening_balance = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    principal_opening = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    interest_opening = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    other_charges_opening = models.DecimalField(
        max_digits=15, decimal_places=2, default=Decimal("0.00")
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "accounting_party_ledger_opening"
        verbose_name = "party ledger opening"
        verbose_name_plural = "party ledger openings"
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "account", "financial_year"],
                name="unique_account_financial_year_opening",
            )
        ]

    def __str__(self):
        return f"{self.account.code} - {self.financial_year}"


class Daybook(models.Model):
    """Daily cash and bank summary."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="daybooks",
    )
    date = models.DateField(db_index=True)

    # Cash balances
    cash_opening_dr = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    cash_opening_cr = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    cash_receipts = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    cash_payments = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    cash_closing_dr = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    cash_closing_cr = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))

    # Bank balances
    bank_opening_dr = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    bank_opening_cr = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    bank_receipts = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    bank_payments = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    bank_closing_dr = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))
    bank_closing_cr = models.DecimalField(max_digits=15, decimal_places=2, default=Decimal("0.00"))

    notes = models.TextField(blank=True, null=True)
    is_closed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "accounting_daybook"
        verbose_name = "daybook"
        verbose_name_plural = "daybooks"
        ordering = ["-date"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "date"],
                name="unique_organization_daybook_date",
            )
        ]

    def __str__(self):
        return f"Daybook - {self.date}"

    def recalculate_totals(self):
        """Recalculate totals from transactions."""
        from django.db.models import Sum

        totals = self.transactions.aggregate(
            total_cr=Sum("amount", filter=models.Q(voucher_type="CR")),
            total_dr=Sum("amount", filter=models.Q(voucher_type="DR")),
            total_bank_cr=Sum("amount", filter=models.Q(voucher_type="BH", is_bank_receipt=True)),
            total_bank_dr=Sum("amount", filter=models.Q(voucher_type="BH", is_bank_receipt=False)),
        )

        self.cash_receipts = totals["total_cr"] or Decimal("0")
        self.cash_payments = totals["total_dr"] or Decimal("0")
        self.bank_receipts = totals["total_bank_cr"] or Decimal("0")
        self.bank_payments = totals["total_bank_dr"] or Decimal("0")

        self.cash_closing_dr = self.cash_opening_dr + self.cash_receipts - self.cash_payments
        self.bank_closing_dr = self.bank_opening_dr + self.bank_receipts - self.bank_payments

        self.save()


class DaybookTransaction(models.Model):
    """Individual transaction entries in the daybook."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="daybook_transactions",
    )
    daybook = models.ForeignKey(
        Daybook,
        on_delete=models.CASCADE,
        related_name="transactions",
        null=True,
        blank=True,
    )
    date = models.DateField(db_index=True)
    voucher_type = models.CharField(
        max_length=5,
        choices=VoucherType.choices,
    )
    voucher_number = models.CharField(max_length=50, db_index=True)
    debit_account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="debit_transactions",
    )
    credit_account = models.ForeignKey(
        Account,
        on_delete=models.PROTECT,
        related_name="credit_transactions",
    )
    amount = models.DecimalField(max_digits=15, decimal_places=2)
    narration = models.TextField(blank=True, null=True)

    # For bank transactions
    is_bank_receipt = models.BooleanField(default=False)
    cheque_number = models.CharField(max_length=50, blank=True, null=True)
    cheque_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "accounting_daybook_transaction"
        verbose_name = "daybook transaction"
        verbose_name_plural = "daybook transactions"
        ordering = ["-date", "-voucher_number"]
        indexes = [
            models.Index(fields=["organization", "date"]),
            models.Index(fields=["organization", "voucher_type", "date"]),
        ]

    def __str__(self):
        return f"{self.voucher_type}-{self.voucher_number} - {self.date}"

    def save(self, *args, **kwargs):
        if not self.voucher_number:
            last_txn = DaybookTransaction.objects.filter(
                organization=self.organization,
                voucher_type=self.voucher_type,
                date__year=self.date.year,
            ).order_by("-voucher_number").first()

            if last_txn and last_txn.voucher_number:
                try:
                    last_num = int(last_txn.voucher_number.split("-")[-1])
                    self.voucher_number = f"{self.voucher_type}-{last_num + 1:05d}"
                except (ValueError, IndexError):
                    self.voucher_number = f"{self.voucher_type}-00001"
            else:
                self.voucher_number = f"{self.voucher_type}-00001"

        super().save(*args, **kwargs)


class InterestCalculation(models.Model):
    """Interest tracking for party accounts."""

    class BalanceType(models.TextChoices):
        DEBIT = "DEBIT", "Debit"
        CREDIT = "CREDIT", "Credit"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="interest_calculations",
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="interest_calculations",
    )
    date = models.DateField(db_index=True)
    balance = models.DecimalField(max_digits=15, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    balance_type = models.CharField(
        max_length=10,
        choices=BalanceType.choices,
    )
    is_posted = models.BooleanField(default=False)
    posted_at = models.DateTimeField(null=True, blank=True)
    posted_ledger_entry = models.ForeignKey(
        PartyLedger,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="interest_calculation",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "accounting_interest_calculation"
        verbose_name = "interest calculation"
        verbose_name_plural = "interest calculations"
        ordering = ["-date"]
        indexes = [
            models.Index(fields=["organization", "date"]),
            models.Index(fields=["account", "is_posted"]),
        ]

    def __str__(self):
        return f"{self.account.code} - {self.date} - {self.balance}"


class InterestCalculationTemp(models.Model):
    """Working table for interest calculations."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="interest_calculation_temps",
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="interest_calculation_temps",
    )
    calculation = models.ForeignKey(
        InterestCalculation,
        on_delete=models.CASCADE,
        related_name="temp_entries",
        null=True,
        blank=True,
    )
    from_date = models.DateField()
    to_date = models.DateField()
    days = models.PositiveIntegerField()
    principal = models.DecimalField(max_digits=15, decimal_places=2)
    interest_rate = models.DecimalField(max_digits=5, decimal_places=2)
    calculated_interest = models.DecimalField(max_digits=15, decimal_places=2)
    balance_type = models.CharField(
        max_length=10,
        choices=InterestCalculation.BalanceType.choices,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "accounting_interest_calculation_temp"
        verbose_name = "interest calculation temp"
        verbose_name_plural = "interest calculation temps"
        ordering = ["from_date"]

    def __str__(self):
        return f"{self.account.code} - {self.from_date} to {self.to_date}"


class PartyBankDetails(models.Model):
    """Bank account details for party accounts."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="party_bank_details",
    )
    account = models.ForeignKey(
        Account,
        on_delete=models.CASCADE,
        related_name="bank_details",
    )
    bank_name = models.CharField(max_length=255)
    branch_name = models.CharField(max_length=255, blank=True, null=True)
    account_number = models.CharField(max_length=50)
    ifsc_code = models.CharField(max_length=20)
    account_holder_name = models.CharField(max_length=255, blank=True, null=True)
    is_primary = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "accounting_party_bank_details"
        verbose_name = "party bank detail"
        verbose_name_plural = "party bank details"
        constraints = [
            models.UniqueConstraint(
                fields=["account", "account_number"],
                name="unique_account_bank_account_number",
            )
        ]

    def __str__(self):
        return f"{self.account.code} - {self.bank_name} - {self.account_number}"
