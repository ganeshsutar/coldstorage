"""Data migration to initialize sequence configs and counters from existing data."""

import re

from django.db import migrations


SEQUENCE_DEFAULTS = {
    "AMAD": {"label": "Amad No", "prefix": "", "separator": "/", "include_year": True, "padding": 5},
    "NIKASI": {"label": "Nikasi No", "prefix": "", "separator": "/", "include_year": True, "padding": 5},
    "TAKPATTI": {"label": "Takpatti No", "prefix": "", "separator": "/", "include_year": True, "padding": 5},
    "SAUDA": {"label": "Deal No", "prefix": "S", "separator": "/", "include_year": True, "padding": 5},
    "GATE_PASS": {"label": "Gate Pass No", "prefix": "GP", "separator": "/", "include_year": True, "padding": 5},
    "KATAI": {"label": "Katai No", "prefix": "KT", "separator": "/", "include_year": True, "padding": 5},
    "RENT_BILL": {"label": "Rent Bill No", "prefix": "KB", "separator": "/", "include_year": True, "padding": 5},
    "RECEIPT": {"label": "Receipt No", "prefix": "RV", "separator": "/", "include_year": True, "padding": 5},
    "ADVANCE": {"label": "Advance No", "prefix": "ADV", "separator": "/", "include_year": True, "padding": 5},
    "LOAN": {"label": "Loan No", "prefix": "LN", "separator": "/", "include_year": True, "padding": 5},
    "BARDANA_ISSUE": {"label": "Bardana Issue No", "prefix": "BI", "separator": "/", "include_year": True, "padding": 5},
    "BARDANA_RETURN": {"label": "Bardana Return No", "prefix": "BR", "separator": "/", "include_year": True, "padding": 5},
    "SHIFT": {"label": "Shift No", "prefix": "", "separator": "/", "include_year": True, "padding": 5},
    "PAY_POST": {"label": "Pay Post No", "prefix": "PP", "separator": "/", "include_year": True, "padding": 5},
    "EMPLOYEE": {"label": "Employee Code", "prefix": "EMP", "separator": "/", "include_year": True, "padding": 5},
    "STAFF_LOAN": {"label": "Staff Loan No", "prefix": "SL", "separator": "/", "include_year": True, "padding": 5},
    "VOUCHER_CR": {"label": "Cash Receipt Voucher", "prefix": "CR", "separator": "-", "include_year": False, "padding": 5},
    "VOUCHER_DR": {"label": "Cash Payment Voucher", "prefix": "DR", "separator": "-", "include_year": False, "padding": 5},
    "VOUCHER_JV": {"label": "Journal Voucher", "prefix": "JV", "separator": "-", "include_year": False, "padding": 5},
    "VOUCHER_CV": {"label": "Contra Voucher", "prefix": "CV", "separator": "-", "include_year": False, "padding": 5},
    "VOUCHER_BH": {"label": "Bank Voucher", "prefix": "BH", "separator": "-", "include_year": False, "padding": 5},
}

# Map: (app_label, model_name, number_field, date_field, seq_key, has_year_in_format)
# For vouchers: (app_label, model_name, number_field, date_field, voucher_type_field)
MODEL_MAPPINGS = [
    ("inventory", "amad", "amad_no", "date", "AMAD"),
    ("inventory", "rent", "serial_no", "date", "NIKASI"),
    ("inventory", "takpatti", "takpatti_no", "date", "TAKPATTI"),
    ("trading", "sauda", "deal_no", "deal_date", "SAUDA"),
    ("trading", "gatepass", "gp_no", "gp_date", "GATE_PASS"),
    ("trading", "katai", "katai_no", "katai_date", "KATAI"),
    ("billing", "rentbillheader", "bill_no", "bill_date", "RENT_BILL"),
    ("billing", "receipt", "receipt_no", "receipt_date", "RECEIPT"),
    ("loans", "advance", "advance_no", "date", "ADVANCE"),
    ("loans", "loanagainstgoods", "loan_no", "date", "LOAN"),
    ("bardana", "bardanaissueheader", "voucher_no", "date", "BARDANA_ISSUE"),
    ("bardana", "bardanareturnheader", "voucher_no", "date", "BARDANA_RETURN"),
    ("warehouse", "shiftheader", "shift_no", "date", "SHIFT"),
    ("payroll", "paypost", "post_no", None, "PAY_POST"),
    ("payroll", "employee", "employee_code", None, "EMPLOYEE"),
    ("payroll", "staffloan", "loan_no", "loan_date", "STAFF_LOAN"),
]


def parse_number_with_year(value):
    """Parse 'PREFIX/YYYY-NNNNN' or 'YYYY-NNNNN' → (year, number)."""
    if not value:
        return None
    # Match the last occurrence of YYYY-NNNNN
    match = re.search(r"(\d{4})-(\d+)$", value)
    if match:
        return int(match.group(1)), int(match.group(2))
    return None


def parse_number_without_year(value):
    """Parse 'PREFIX-NNNNN' → number."""
    if not value:
        return None
    match = re.search(r"-(\d+)$", value)
    if match:
        return int(match.group(1))
    return None


def initialize_sequences(apps, schema_editor):
    Organization = apps.get_model("authentication", "Organization")
    SequenceConfig = apps.get_model("system", "SequenceConfig")
    SequenceCounter = apps.get_model("system", "SequenceCounter")

    for org in Organization.objects.all():
        # 1. Create default SequenceConfig entries
        for key, defaults in SEQUENCE_DEFAULTS.items():
            SequenceConfig.objects.get_or_create(
                organization=org,
                key=key,
                defaults={
                    "label": defaults["label"],
                    "prefix": defaults["prefix"],
                    "separator": defaults["separator"],
                    "include_year": defaults["include_year"],
                    "padding": defaults["padding"],
                },
            )

        # 2. Scan existing models for highest numbers
        for app_label, model_name, number_field, date_field, seq_key in MODEL_MAPPINGS:
            try:
                Model = apps.get_model(app_label, model_name)
            except LookupError:
                continue

            records = Model.objects.filter(organization=org).exclude(
                **{number_field: ""}
            ).exclude(**{number_field: None})

            # Track max number per year
            year_max = {}
            for record in records:
                value = getattr(record, number_field, None)
                if not value:
                    continue

                cfg = SEQUENCE_DEFAULTS[seq_key]
                if cfg["include_year"]:
                    result = parse_number_with_year(value)
                    if result:
                        year, num = result
                        year_max[year] = max(year_max.get(year, 0), num)
                else:
                    num = parse_number_without_year(value)
                    if num:
                        # For non-year sequences, use year from date field or 0
                        if date_field:
                            record_date = getattr(record, date_field, None)
                            year = record_date.year if record_date else 0
                        else:
                            year = 0
                        year_max[year] = max(year_max.get(year, 0), num)

            # Create counters
            for year, max_num in year_max.items():
                SequenceCounter.objects.update_or_create(
                    organization=org,
                    key=seq_key,
                    year=year,
                    defaults={"last_number": max_num},
                )

        # 3. Scan DaybookTransaction for voucher numbers
        try:
            DaybookTransaction = apps.get_model("accounting", "daybooktransaction")
        except LookupError:
            continue

        for voucher_type in ["CR", "DR", "JV", "CV", "BH"]:
            seq_key = f"VOUCHER_{voucher_type}"
            txns = DaybookTransaction.objects.filter(
                organization=org,
                voucher_type=voucher_type,
            ).exclude(voucher_number="").exclude(voucher_number=None)

            year_max = {}
            for txn in txns:
                num = parse_number_without_year(txn.voucher_number)
                if num:
                    year = txn.date.year if txn.date else 0
                    year_max[year] = max(year_max.get(year, 0), num)

            for year, max_num in year_max.items():
                SequenceCounter.objects.update_or_create(
                    organization=org,
                    key=seq_key,
                    year=year,
                    defaults={"last_number": max_num},
                )


def reverse_sequences(apps, schema_editor):
    """Remove all sequence data (reversible)."""
    SequenceConfig = apps.get_model("system", "SequenceConfig")
    SequenceCounter = apps.get_model("system", "SequenceCounter")
    SequenceConfig.objects.all().delete()
    SequenceCounter.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("system", "0002_sequenceconfig_sequencecounter"),
        ("authentication", "0002_organizationmembership_backdate_entry_limit_and_more"),
        ("inventory", "0001_initial"),
        ("trading", "0001_initial"),
        ("billing", "0001_initial"),
        ("loans", "0001_initial"),
        ("bardana", "0001_initial"),
        ("warehouse", "0001_initial"),
        ("payroll", "0001_initial"),
        ("accounting", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(initialize_sequences, reverse_sequences),
    ]
