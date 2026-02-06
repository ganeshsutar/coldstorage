from typing import Any

from django.db import transaction

from apps.authentication.models import Organization, User

from .models import SequenceConfig, SequenceCounter, UserActivityLog


class ActivityLogger:
    """Service for logging user activities."""

    @staticmethod
    def log(
        organization: Organization,
        user: User | None,
        action_type: str,
        module: str,
        entry_type: str = "",
        entry_id: str = "",
        details: dict[str, Any] | None = None,
        request=None,
    ) -> UserActivityLog:
        """Create an activity log entry.

        Args:
            organization: The organization context
            user: The user performing the action (can be None for system actions)
            action_type: Type of action (LOGIN, CREATE, UPDATE, DELETE, etc.)
            module: Module name (Amad, Rent, Voucher, etc.)
            entry_type: Specific entry type description
            entry_id: Reference ID of the affected entry
            details: Additional details as JSON
            request: HTTP request object (for IP and user agent)

        Returns:
            Created UserActivityLog instance
        """
        ip_address = None
        user_agent = ""

        if request:
            # Get IP address (handle proxy headers)
            x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(",")[0].strip()
            else:
                ip_address = request.META.get("REMOTE_ADDR")

            user_agent = request.META.get("HTTP_USER_AGENT", "")

        return UserActivityLog.objects.create(
            organization=organization,
            user=user,
            action_type=action_type,
            module=module,
            entry_type=entry_type,
            entry_id=entry_id,
            details=details or {},
            ip_address=ip_address,
            user_agent=user_agent,
        )

    @staticmethod
    def log_login(organization: Organization, user: User, request=None) -> UserActivityLog:
        """Log a user login event."""
        return ActivityLogger.log(
            organization=organization,
            user=user,
            action_type=UserActivityLog.ActionType.LOGIN,
            module="System",
            entry_type="Authentication",
            details={"action": "User logged in"},
            request=request,
        )

    @staticmethod
    def log_logout(organization: Organization, user: User, request=None) -> UserActivityLog:
        """Log a user logout event."""
        return ActivityLogger.log(
            organization=organization,
            user=user,
            action_type=UserActivityLog.ActionType.LOGOUT,
            module="System",
            entry_type="Authentication",
            details={"action": "User logged out"},
            request=request,
        )

    @staticmethod
    def log_create(
        organization: Organization,
        user: User,
        module: str,
        entry_type: str,
        entry_id: str,
        details: dict[str, Any] | None = None,
        request=None,
    ) -> UserActivityLog:
        """Log a record creation event."""
        return ActivityLogger.log(
            organization=organization,
            user=user,
            action_type=UserActivityLog.ActionType.CREATE,
            module=module,
            entry_type=entry_type,
            entry_id=entry_id,
            details=details,
            request=request,
        )

    @staticmethod
    def log_update(
        organization: Organization,
        user: User,
        module: str,
        entry_type: str,
        entry_id: str,
        details: dict[str, Any] | None = None,
        request=None,
    ) -> UserActivityLog:
        """Log a record update event."""
        return ActivityLogger.log(
            organization=organization,
            user=user,
            action_type=UserActivityLog.ActionType.UPDATE,
            module=module,
            entry_type=entry_type,
            entry_id=entry_id,
            details=details,
            request=request,
        )

    @staticmethod
    def log_delete(
        organization: Organization,
        user: User,
        module: str,
        entry_type: str,
        entry_id: str,
        details: dict[str, Any] | None = None,
        request=None,
    ) -> UserActivityLog:
        """Log a record deletion event."""
        return ActivityLogger.log(
            organization=organization,
            user=user,
            action_type=UserActivityLog.ActionType.DELETE,
            module=module,
            entry_type=entry_type,
            entry_id=entry_id,
            details=details,
            request=request,
        )

    @staticmethod
    def log_config_change(
        organization: Organization,
        user: User,
        config_type: str,
        old_value: Any,
        new_value: Any,
        request=None,
    ) -> UserActivityLog:
        """Log a configuration change event."""
        return ActivityLogger.log(
            organization=organization,
            user=user,
            action_type=UserActivityLog.ActionType.UPDATE,
            module="Settings",
            entry_type=config_type,
            entry_id="",
            details={"old_value": old_value, "new_value": new_value},
            request=request,
        )


class SequenceService:
    """Centralized auto-number generation with atomic counters."""

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

    @staticmethod
    def format_number(prefix: str, separator: str, year: int, number: int, padding: int, include_year: bool) -> str:
        """Format a sequence number string.

        Examples:
            format_number("S", "/", 2025, 1, 5, True)  → "S/2025-00001"
            format_number("", "/", 2025, 1, 5, True)   → "2025-00001"
            format_number("CR", "-", 2025, 1, 5, False) → "CR-00001"
        """
        num_str = str(number).zfill(padding)

        if include_year:
            core = f"{year}-{num_str}"
        else:
            core = num_str

        if prefix:
            return f"{prefix}{separator}{core}"
        return core

    @staticmethod
    def _get_config_values(organization, key: str) -> dict:
        """Get formatting config for a key, falling back to SEQUENCE_DEFAULTS."""
        try:
            cfg = SequenceConfig.objects.get(organization=organization, key=key)
            return {
                "prefix": cfg.prefix,
                "separator": cfg.separator,
                "include_year": cfg.include_year,
                "padding": cfg.padding,
            }
        except SequenceConfig.DoesNotExist:
            defaults = SequenceService.SEQUENCE_DEFAULTS.get(key)
            if defaults:
                return {
                    "prefix": defaults["prefix"],
                    "separator": defaults["separator"],
                    "include_year": defaults["include_year"],
                    "padding": defaults["padding"],
                }
            return {"prefix": "", "separator": "/", "include_year": True, "padding": 5}

    @staticmethod
    @transaction.atomic
    def get_next_number(organization, key: str, year: int) -> str:
        """Atomically increment and return the next formatted number.

        Uses select_for_update() to prevent race conditions.
        """
        counter, _ = SequenceCounter.objects.select_for_update().get_or_create(
            organization=organization,
            key=key,
            year=year,
            defaults={"last_number": 0},
        )
        counter.last_number += 1
        counter.save(update_fields=["last_number"])

        cfg = SequenceService._get_config_values(organization, key)
        return SequenceService.format_number(
            prefix=cfg["prefix"],
            separator=cfg["separator"],
            year=year,
            number=counter.last_number,
            padding=cfg["padding"],
            include_year=cfg["include_year"],
        )

    @staticmethod
    def preview_next_number(organization, key: str, year: int) -> str:
        """Read-only preview of the next number (no lock, no increment)."""
        try:
            counter = SequenceCounter.objects.get(
                organization=organization, key=key, year=year,
            )
            next_num = counter.last_number + 1
        except SequenceCounter.DoesNotExist:
            next_num = 1

        cfg = SequenceService._get_config_values(organization, key)
        return SequenceService.format_number(
            prefix=cfg["prefix"],
            separator=cfg["separator"],
            year=year,
            number=next_num,
            padding=cfg["padding"],
            include_year=cfg["include_year"],
        )

    @staticmethod
    def initialize_defaults(organization) -> int:
        """Create default SequenceConfig rows for an organization (idempotent).

        Returns the number of configs created.
        """
        created = 0
        for key, defaults in SequenceService.SEQUENCE_DEFAULTS.items():
            _, was_created = SequenceConfig.objects.get_or_create(
                organization=organization,
                key=key,
                defaults={
                    "label": defaults["label"],
                    "prefix": defaults["prefix"],
                    "separator": defaults["separator"],
                    "include_year": defaults["include_year"],
                    "padding": defaults["padding"],
                },
            )
            if was_created:
                created += 1
        return created
