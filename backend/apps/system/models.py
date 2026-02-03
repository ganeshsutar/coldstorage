import uuid

from django.db import models

from apps.authentication.models import Organization, User


class UserActivityLog(models.Model):
    """Audit log for tracking user actions."""

    class ActionType(models.TextChoices):
        LOGIN = "LOGIN", "Login"
        LOGOUT = "LOGOUT", "Logout"
        CREATE = "CREATE", "Create"
        UPDATE = "UPDATE", "Update"
        DELETE = "DELETE", "Delete"
        VIEW = "VIEW", "View"
        PRINT = "PRINT", "Print"
        EXPORT = "EXPORT", "Export"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="activity_logs",
    )
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_logs",
    )
    action_type = models.CharField(
        max_length=20,
        choices=ActionType.choices,
    )
    module = models.CharField(max_length=50)  # e.g., "Amad", "Rent", "Voucher"
    entry_type = models.CharField(max_length=50, blank=True)  # e.g., "Goods Receipt"
    entry_id = models.CharField(max_length=100, blank=True)  # Reference ID
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "user_activity_logs"
        verbose_name = "user activity log"
        verbose_name_plural = "user activity logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["organization", "created_at"]),
            models.Index(fields=["organization", "user"]),
            models.Index(fields=["organization", "action_type"]),
            models.Index(fields=["organization", "module"]),
        ]

    def __str__(self):
        return f"{self.user} - {self.action_type} - {self.module} - {self.created_at}"
