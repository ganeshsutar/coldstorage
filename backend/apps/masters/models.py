import uuid
from decimal import Decimal

from django.db import models

from apps.authentication.models import Organization


class GstRate(models.Model):
    """GST Rate master for billing calculations."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="gst_rates",
    )
    code = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Unique code (e.g., GST18, GST5)",
    )
    description = models.CharField(
        max_length=255,
        help_text="Description (e.g., Standard 18%, Essential 5%)",
    )
    cgst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Central GST rate percentage",
    )
    sgst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="State GST rate percentage",
    )
    igst_rate = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Integrated GST rate percentage (for inter-state)",
    )
    hsn_code = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="HSN/SAC code (e.g., 996721 for storage services)",
    )
    is_default = models.BooleanField(
        default=False,
        help_text="Is this the default GST rate for the organization?",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "masters_gst_rate"
        verbose_name = "GST Rate"
        verbose_name_plural = "GST Rates"
        ordering = ["code"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "code"],
                name="unique_organization_gst_rate_code",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "is_active"]),
            models.Index(fields=["organization", "is_default"]),
        ]

    def __str__(self):
        return f"{self.code} - {self.description}"

    @property
    def total_rate(self):
        """Return total GST rate (CGST + SGST or IGST)."""
        return self.cgst_rate + self.sgst_rate

    def save(self, *args, **kwargs):
        # If this is being set as default, unset other defaults
        if self.is_default:
            GstRate.objects.filter(
                organization=self.organization,
                is_default=True,
            ).exclude(pk=self.pk).update(is_default=False)
        super().save(*args, **kwargs)


class Bank(models.Model):
    """Bank master for receipt tracking."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="banks",
    )
    code = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Bank short code (e.g., SBI, HDFC)",
    )
    name = models.CharField(
        max_length=255,
        help_text="Full bank name",
    )
    ifsc_pattern = models.CharField(
        max_length=20,
        blank=True,
        null=True,
        help_text="IFSC code pattern (e.g., SBIN for SBI)",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "masters_bank"
        verbose_name = "Bank"
        verbose_name_plural = "Banks"
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "code"],
                name="unique_organization_bank_code",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "is_active"]),
        ]

    def __str__(self):
        return f"{self.code} - {self.name}"


class RateType(models.TextChoices):
    """Types of labor rates."""

    LOADING = "LOADING", "Loading"
    UNLOADING = "UNLOADING", "Unloading"
    KATAI = "KATAI", "Katai (Cutting)"
    RELOAD = "RELOAD", "Reload"
    DUMP = "DUMP", "Dump"
    DALA = "DALA", "Dala"


class PacketType(models.TextChoices):
    """Packet types for rate differentiation."""

    PKT1 = "PKT1", "Packet Type 1"
    PKT2 = "PKT2", "Packet Type 2"
    PKT3 = "PKT3", "Packet Type 3"


class LaborRate(models.Model):
    """Labor rate master for different operations."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="labor_rates",
    )
    rate_type = models.CharField(
        max_length=20,
        choices=RateType.choices,
        help_text="Type of labor rate",
    )
    packet_type = models.CharField(
        max_length=10,
        choices=PacketType.choices,
        blank=True,
        null=True,
        help_text="Packet type (null for flat rates)",
    )
    rate = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
        help_text="Rate per unit",
    )
    effective_from = models.DateField(
        help_text="Date from which this rate is effective",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "masters_labor_rate"
        verbose_name = "Labor Rate"
        verbose_name_plural = "Labor Rates"
        ordering = ["-effective_from", "rate_type"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "rate_type", "packet_type", "effective_from"],
                name="unique_organization_labor_rate",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "rate_type"]),
            models.Index(fields=["organization", "is_active"]),
            models.Index(fields=["organization", "effective_from"]),
        ]

    def __str__(self):
        if self.packet_type:
            return f"{self.get_rate_type_display()} - {self.get_packet_type_display()} @ {self.rate}"
        return f"{self.get_rate_type_display()} @ {self.rate}"

    @classmethod
    def get_current_rate(cls, organization, rate_type, packet_type=None, as_of_date=None):
        """
        Get the current effective rate for a given type.

        Args:
            organization: The organization
            rate_type: Type of rate (from RateType)
            packet_type: Optional packet type (from PacketType)
            as_of_date: Date to check (defaults to today)

        Returns:
            Decimal rate or None if not found
        """
        from django.utils import timezone

        if as_of_date is None:
            as_of_date = timezone.now().date()

        queryset = cls.objects.filter(
            organization=organization,
            rate_type=rate_type,
            is_active=True,
            effective_from__lte=as_of_date,
        )

        if packet_type:
            queryset = queryset.filter(packet_type=packet_type)
        else:
            queryset = queryset.filter(packet_type__isnull=True)

        rate_obj = queryset.order_by("-effective_from").first()
        return rate_obj.rate if rate_obj else None
