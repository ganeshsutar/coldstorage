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


class SequenceConfig(models.Model):
    """Configurable number-series format per organization.

    One row per (organization, key). Stores formatting configuration
    such as prefix, separator, whether to include year, and zero-padding width.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="sequence_configs",
    )
    key = models.CharField(max_length=30)
    label = models.CharField(max_length=100)
    prefix = models.CharField(max_length=10, blank=True, default="")
    separator = models.CharField(max_length=5, default="/")
    include_year = models.BooleanField(default=True)
    padding = models.PositiveIntegerField(default=5)

    class Meta:
        db_table = "system_sequence_config"
        verbose_name = "sequence config"
        verbose_name_plural = "sequence configs"
        ordering = ["key"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "key"],
                name="unique_sequence_config_per_org",
            )
        ]

    def __str__(self):
        return f"{self.key} ({self.label})"


class SequenceCounter(models.Model):
    """Atomic counter per (organization, key, year).

    Stores the last-used number. Incremented under select_for_update()
    to guarantee uniqueness under concurrent requests.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="sequence_counters",
    )
    key = models.CharField(max_length=30)
    year = models.PositiveIntegerField()
    last_number = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "system_sequence_counter"
        verbose_name = "sequence counter"
        verbose_name_plural = "sequence counters"
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "key", "year"],
                name="unique_sequence_counter_per_org_key_year",
            )
        ]

    def __str__(self):
        return f"{self.key} / {self.year} = {self.last_number}"
