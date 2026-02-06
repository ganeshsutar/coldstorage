from django.db import transaction

from apps.accounting.models import Account
from apps.bardana.models import BardanaType
from apps.inventory.models import Commodity
from apps.masters.models import Bank

from .seed_data import BANKS, BARDANA_TYPES, CHART_OF_ACCOUNTS, COMMODITIES


class SeedDataService:
    """Service for seeding initial reference data into an organization."""

    def __init__(self, organization):
        self.organization = organization

    def get_status(self) -> dict:
        """Check seed status for all data types."""
        coa_codes = [e["code"] for e in CHART_OF_ACCOUNTS]
        coa_existing = Account.objects.filter(
            organization=self.organization, code__in=coa_codes
        ).count()

        bank_codes = [e["code"] for e in BANKS]
        bank_existing = Bank.objects.filter(
            organization=self.organization, code__in=bank_codes
        ).count()

        bt_codes = [e["code"] for e in BARDANA_TYPES]
        bt_existing = BardanaType.objects.filter(
            organization=self.organization, code__in=bt_codes
        ).count()

        comm_codes = [e["code"] for e in COMMODITIES]
        comm_existing = Commodity.objects.filter(
            organization=self.organization, code__in=comm_codes
        ).count()

        coa_total = len(CHART_OF_ACCOUNTS)
        bank_total = len(BANKS)
        bt_total = len(BARDANA_TYPES)
        comm_total = len(COMMODITIES)

        return {
            "chart_of_accounts": {
                "seeded": coa_existing >= coa_total,
                "total": coa_total,
                "existing": coa_existing,
            },
            "banks": {
                "seeded": bank_existing >= bank_total,
                "total": bank_total,
                "existing": bank_existing,
            },
            "bardana_types": {
                "seeded": bt_existing >= bt_total,
                "total": bt_total,
                "existing": bt_existing,
            },
            "commodities": {
                "seeded": comm_existing >= comm_total,
                "total": comm_total,
                "existing": comm_existing,
            },
            "all_seeded": (
                coa_existing >= coa_total
                and bank_existing >= bank_total
                and bt_existing >= bt_total
                and comm_existing >= comm_total
            ),
        }

    @transaction.atomic
    def seed_all(self) -> dict:
        """Seed all data types. Returns per-type created/updated counts."""
        return {
            "chart_of_accounts": self._seed_chart_of_accounts(),
            "banks": self._seed_banks(),
            "bardana_types": self._seed_bardana_types(),
            "commodities": self._seed_commodities(),
        }

    def _seed_chart_of_accounts(self) -> dict:
        """Seed chart of accounts. Parents are listed before children in the data."""
        created = 0
        updated = 0
        code_to_account = {}

        for entry in CHART_OF_ACCOUNTS:
            parent = None
            if entry["parent_code"]:
                parent = code_to_account.get(entry["parent_code"])

            obj, was_created = Account.objects.update_or_create(
                organization=self.organization,
                code=entry["code"],
                defaults={
                    "name": entry["name"],
                    "account_type": entry["account_type"],
                    "balance_nature": entry["balance_nature"],
                    "parent": parent,
                },
            )
            code_to_account[entry["code"]] = obj
            if was_created:
                created += 1
            else:
                updated += 1

        return {"created": created, "updated": updated}

    def _seed_banks(self) -> dict:
        """Seed bank master data."""
        created = 0
        updated = 0

        for entry in BANKS:
            _, was_created = Bank.objects.update_or_create(
                organization=self.organization,
                code=entry["code"],
                defaults={"name": entry["name"]},
            )
            if was_created:
                created += 1
            else:
                updated += 1

        return {"created": created, "updated": updated}

    def _seed_bardana_types(self) -> dict:
        """Seed bardana type master data."""
        created = 0
        updated = 0

        for entry in BARDANA_TYPES:
            _, was_created = BardanaType.objects.update_or_create(
                organization=self.organization,
                code=entry["code"],
                defaults={
                    "name": entry["name"],
                    "rate_per_unit": entry["rate_per_unit"],
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

        return {"created": created, "updated": updated}

    def _seed_commodities(self) -> dict:
        """Seed commodity master data."""
        created = 0
        updated = 0

        for entry in COMMODITIES:
            _, was_created = Commodity.objects.update_or_create(
                organization=self.organization,
                code=entry["code"],
                defaults={
                    "name": entry["name"],
                    "default_rent_rate": entry["default_rent_rate"],
                },
            )
            if was_created:
                created += 1
            else:
                updated += 1

        return {"created": created, "updated": updated}
