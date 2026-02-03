from decimal import Decimal
from django.db import migrations


def create_seed_data(apps, schema_editor):
    """Create default GST rates, banks, and labor rates for all organizations."""
    Organization = apps.get_model("authentication", "Organization")
    GstRate = apps.get_model("masters", "GstRate")
    Bank = apps.get_model("masters", "Bank")
    LaborRate = apps.get_model("masters", "LaborRate")

    # Default GST rates
    gst_rates = [
        {
            "code": "GST18",
            "description": "Standard 18%",
            "cgst_rate": Decimal("9.00"),
            "sgst_rate": Decimal("9.00"),
            "igst_rate": Decimal("18.00"),
            "hsn_code": "996721",
            "is_default": True,
        },
        {
            "code": "GST12",
            "description": "Reduced 12%",
            "cgst_rate": Decimal("6.00"),
            "sgst_rate": Decimal("6.00"),
            "igst_rate": Decimal("12.00"),
            "hsn_code": "996721",
            "is_default": False,
        },
        {
            "code": "GST5",
            "description": "Essential 5%",
            "cgst_rate": Decimal("2.50"),
            "sgst_rate": Decimal("2.50"),
            "igst_rate": Decimal("5.00"),
            "hsn_code": "996721",
            "is_default": False,
        },
        {
            "code": "GST0",
            "description": "Exempt/Nil 0%",
            "cgst_rate": Decimal("0.00"),
            "sgst_rate": Decimal("0.00"),
            "igst_rate": Decimal("0.00"),
            "hsn_code": "",
            "is_default": False,
        },
    ]

    # Major Indian banks
    banks = [
        {"code": "SBI", "name": "State Bank of India", "ifsc_pattern": "SBIN"},
        {"code": "HDFC", "name": "HDFC Bank", "ifsc_pattern": "HDFC"},
        {"code": "ICICI", "name": "ICICI Bank", "ifsc_pattern": "ICIC"},
        {"code": "AXIS", "name": "Axis Bank", "ifsc_pattern": "UTIB"},
        {"code": "KOTAK", "name": "Kotak Mahindra Bank", "ifsc_pattern": "KKBK"},
        {"code": "PNB", "name": "Punjab National Bank", "ifsc_pattern": "PUNB"},
        {"code": "BOB", "name": "Bank of Baroda", "ifsc_pattern": "BARB"},
        {"code": "BOI", "name": "Bank of India", "ifsc_pattern": "BKID"},
        {"code": "CANARA", "name": "Canara Bank", "ifsc_pattern": "CNRB"},
        {"code": "UNION", "name": "Union Bank of India", "ifsc_pattern": "UBIN"},
        {"code": "IDBI", "name": "IDBI Bank", "ifsc_pattern": "IBKL"},
        {"code": "CBI", "name": "Central Bank of India", "ifsc_pattern": "CBIN"},
        {"code": "IOB", "name": "Indian Overseas Bank", "ifsc_pattern": "IOBA"},
        {"code": "UCO", "name": "UCO Bank", "ifsc_pattern": "UCBA"},
        {"code": "PSB", "name": "Punjab & Sind Bank", "ifsc_pattern": "PSIB"},
        {"code": "INDIAN", "name": "Indian Bank", "ifsc_pattern": "IDIB"},
        {"code": "YES", "name": "Yes Bank", "ifsc_pattern": "YESB"},
        {"code": "INDUSIND", "name": "IndusInd Bank", "ifsc_pattern": "INDB"},
        {"code": "BANDHAN", "name": "Bandhan Bank", "ifsc_pattern": "BDBL"},
        {"code": "FEDERAL", "name": "Federal Bank", "ifsc_pattern": "FDRL"},
        {"code": "SOUTH", "name": "South Indian Bank", "ifsc_pattern": "SIBL"},
        {"code": "KARNATAKA", "name": "Karnataka Bank", "ifsc_pattern": "KARB"},
        {"code": "KVB", "name": "Karur Vysya Bank", "ifsc_pattern": "KVBL"},
        {"code": "CSB", "name": "CSB Bank", "ifsc_pattern": "CSBK"},
        {"code": "RBL", "name": "RBL Bank", "ifsc_pattern": "RATN"},
        {"code": "CITY", "name": "City Union Bank", "ifsc_pattern": "CIUB"},
        {"code": "TMB", "name": "Tamilnad Mercantile Bank", "ifsc_pattern": "TMBL"},
        {"code": "DCB", "name": "DCB Bank", "ifsc_pattern": "DCBL"},
        {"code": "JKB", "name": "Jammu & Kashmir Bank", "ifsc_pattern": "JAKA"},
        {"code": "NAINITAL", "name": "Nainital Bank", "ifsc_pattern": "NTBL"},
        {"code": "SARASWAT", "name": "Saraswat Bank", "ifsc_pattern": "SRCB"},
        {"code": "COSMOS", "name": "Cosmos Bank", "ifsc_pattern": "COSB"},
        {"code": "SVC", "name": "SVC Co-operative Bank", "ifsc_pattern": "SVCB"},
        {"code": "IDFC", "name": "IDFC First Bank", "ifsc_pattern": "IDFB"},
        {"code": "AU", "name": "AU Small Finance Bank", "ifsc_pattern": "AUBL"},
        {"code": "EQUITAS", "name": "Equitas Small Finance Bank", "ifsc_pattern": "ESFB"},
        {"code": "UJJIVAN", "name": "Ujjivan Small Finance Bank", "ifsc_pattern": "UJVN"},
        {"code": "PAYTM", "name": "Paytm Payments Bank", "ifsc_pattern": "PYTM"},
    ]

    # Default labor rates (effective from 2024-04-01)
    from datetime import date
    effective_date = date(2024, 4, 1)

    labor_rates = [
        # Loading rates
        {"rate_type": "LOADING", "packet_type": None, "rate": Decimal("5.00")},
        {"rate_type": "LOADING", "packet_type": "PKT1", "rate": Decimal("6.00")},
        {"rate_type": "LOADING", "packet_type": "PKT2", "rate": Decimal("5.00")},
        {"rate_type": "LOADING", "packet_type": "PKT3", "rate": Decimal("4.00")},

        # Unloading rates
        {"rate_type": "UNLOADING", "packet_type": None, "rate": Decimal("5.00")},
        {"rate_type": "UNLOADING", "packet_type": "PKT1", "rate": Decimal("6.00")},
        {"rate_type": "UNLOADING", "packet_type": "PKT2", "rate": Decimal("5.00")},
        {"rate_type": "UNLOADING", "packet_type": "PKT3", "rate": Decimal("4.00")},

        # Katai (cutting) rates
        {"rate_type": "KATAI", "packet_type": None, "rate": Decimal("3.00")},

        # Reload rates
        {"rate_type": "RELOAD", "packet_type": None, "rate": Decimal("4.00")},

        # Dump rates
        {"rate_type": "DUMP", "packet_type": None, "rate": Decimal("2.00")},

        # Dala rates
        {"rate_type": "DALA", "packet_type": None, "rate": Decimal("10.00")},
    ]

    # Create seed data for each organization
    for org in Organization.objects.all():
        # Create GST rates
        for gst_data in gst_rates:
            GstRate.objects.get_or_create(
                organization=org,
                code=gst_data["code"],
                defaults={
                    "description": gst_data["description"],
                    "cgst_rate": gst_data["cgst_rate"],
                    "sgst_rate": gst_data["sgst_rate"],
                    "igst_rate": gst_data["igst_rate"],
                    "hsn_code": gst_data["hsn_code"],
                    "is_default": gst_data["is_default"],
                    "is_active": True,
                }
            )

        # Create banks
        for bank_data in banks:
            Bank.objects.get_or_create(
                organization=org,
                code=bank_data["code"],
                defaults={
                    "name": bank_data["name"],
                    "ifsc_pattern": bank_data["ifsc_pattern"],
                    "is_active": True,
                }
            )

        # Create labor rates
        for rate_data in labor_rates:
            LaborRate.objects.get_or_create(
                organization=org,
                rate_type=rate_data["rate_type"],
                packet_type=rate_data["packet_type"],
                effective_from=effective_date,
                defaults={
                    "rate": rate_data["rate"],
                    "is_active": True,
                }
            )


def reverse_seed_data(apps, schema_editor):
    """Remove seed data (for migration reversal)."""
    GstRate = apps.get_model("masters", "GstRate")
    Bank = apps.get_model("masters", "Bank")
    LaborRate = apps.get_model("masters", "LaborRate")

    # Delete all seeded data
    # Note: This will delete all records, not just seeded ones
    # In production, you might want a more targeted approach
    GstRate.objects.all().delete()
    Bank.objects.all().delete()
    LaborRate.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("masters", "0001_initial"),
        ("authentication", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(create_seed_data, reverse_seed_data),
    ]
