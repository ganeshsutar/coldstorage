from typing import Any

from apps.authentication.models import Organization, User

from .models import UserActivityLog


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
