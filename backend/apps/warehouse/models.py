import uuid
from decimal import Decimal

from django.db import models

from apps.authentication.models import Organization, User
from apps.inventory.models import Amad, Rent, Room


class BillType(models.TextChoices):
    """Billing type for unloading."""

    RENT = "RENT", "Rent Bill"
    TRANSFER = "TRANSFER", "Stock Transfer"
    DAMAGE = "DAMAGE", "Damage/Loss"
    OTHER = "OTHER", "Other"


class TemperatureStatus(models.TextChoices):
    """Temperature reading status."""

    NORMAL = "NORMAL", "Normal"
    WARNING = "WARNING", "Warning"
    CRITICAL = "CRITICAL", "Critical"


# =============================================================================
# Room Floor Configuration
# =============================================================================


class RoomFloor(models.Model):
    """Floor configuration per room - defines rack ranges for each floor."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="room_floors",
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="floor_configs",
    )
    floor_number = models.PositiveIntegerField(
        help_text="Floor number (1-N)",
    )
    from_rack = models.PositiveIntegerField(
        help_text="Starting rack number on this floor",
    )
    to_rack = models.PositiveIntegerField(
        help_text="Ending rack number on this floor",
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "warehouse_room_floor"
        verbose_name = "room floor"
        verbose_name_plural = "room floors"
        ordering = ["room", "floor_number"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "room", "floor_number"],
                name="unique_org_room_floor",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "room"]),
        ]

    def __str__(self):
        return f"{self.room} - Floor {self.floor_number} (Racks {self.from_rack}-{self.to_rack})"

    @property
    def rack_count(self):
        """Number of racks on this floor."""
        return self.to_rack - self.from_rack + 1


# =============================================================================
# Loading/Unloading Operations
# =============================================================================


class Loading(models.Model):
    """Track goods placement into racks."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="loadings",
    )
    amad = models.ForeignKey(
        Amad,
        on_delete=models.PROTECT,
        related_name="loading_records",
    )
    amad_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Denormalized amad number for quick lookup",
    )
    date = models.DateField(db_index=True)
    room = models.ForeignKey(
        Room,
        on_delete=models.PROTECT,
        related_name="loading_records",
    )
    floor_number = models.PositiveIntegerField()
    rack_number = models.PositiveIntegerField()
    aisle = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Aisle/gali number (optional)",
    )
    quantity = models.PositiveIntegerField(
        help_text="Number of bags loaded",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_loadings",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "warehouse_loading"
        verbose_name = "loading"
        verbose_name_plural = "loadings"
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["organization", "date"]),
            models.Index(fields=["organization", "room", "floor_number", "rack_number"]),
            models.Index(fields=["amad"]),
            models.Index(fields=["amad_no"]),
        ]

    def __str__(self):
        return f"Load {self.amad_no} -> Room {self.room.number} F{self.floor_number} R{self.rack_number} ({self.quantity} bags)"

    def save(self, *args, **kwargs):
        # Denormalize amad_no for quick lookups
        if self.amad and not self.amad_no:
            self.amad_no = self.amad.amad_no
        super().save(*args, **kwargs)


class Unloading(models.Model):
    """Track goods removal from racks."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="unloadings",
    )
    amad = models.ForeignKey(
        Amad,
        on_delete=models.PROTECT,
        related_name="unloading_records",
    )
    rent = models.ForeignKey(
        Rent,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="unloading_records",
        help_text="Dispatch/rent reference (optional)",
    )
    date = models.DateField(db_index=True)
    room = models.ForeignKey(
        Room,
        on_delete=models.PROTECT,
        related_name="unloading_records",
    )
    floor_number = models.PositiveIntegerField()
    rack_number = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField(
        help_text="Number of bags unloaded",
    )
    bill_type = models.CharField(
        max_length=20,
        choices=BillType.choices,
        default=BillType.RENT,
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_unloadings",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "warehouse_unloading"
        verbose_name = "unloading"
        verbose_name_plural = "unloadings"
        ordering = ["-date", "-created_at"]
        indexes = [
            models.Index(fields=["organization", "date"]),
            models.Index(fields=["organization", "room", "floor_number", "rack_number"]),
            models.Index(fields=["amad"]),
            models.Index(fields=["rent"]),
        ]

    def __str__(self):
        return f"Unload {self.amad.amad_no} <- Room {self.room.number} F{self.floor_number} R{self.rack_number} ({self.quantity} bags)"


# =============================================================================
# Shifting Operations
# =============================================================================


class ShiftHeader(models.Model):
    """Bulk shift operation header."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="shift_headers",
    )
    shift_no = models.CharField(
        max_length=20,
        db_index=True,
        help_text="Auto-generated: YYYY-NNNNN",
    )
    date = models.DateField(db_index=True)
    from_room = models.ForeignKey(
        Room,
        on_delete=models.PROTECT,
        related_name="shifts_from",
        help_text="Source room",
    )
    to_room = models.ForeignKey(
        Room,
        on_delete=models.PROTECT,
        related_name="shifts_to",
        help_text="Destination room",
    )
    remarks = models.TextField(
        blank=True,
        null=True,
        help_text="Reason for shift",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_shift_headers",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "warehouse_shift_header"
        verbose_name = "shift header"
        verbose_name_plural = "shift headers"
        ordering = ["-date", "-shift_no"]
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "shift_no"],
                name="unique_org_shift_no",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "date"]),
        ]

    def __str__(self):
        return f"Shift {self.shift_no}: Room {self.from_room.number} -> Room {self.to_room.number}"

    def save(self, *args, **kwargs):
        if not self.shift_no:
            self.shift_no = self._generate_shift_no()
        super().save(*args, **kwargs)

    def _generate_shift_no(self):
        """Generate shift number in format YYYY-NNNNN."""
        year = self.date.year
        last_shift = ShiftHeader.objects.filter(
            organization=self.organization,
            shift_no__startswith=f"{year}-",
        ).order_by("-shift_no").first()

        if last_shift:
            try:
                last_num = int(last_shift.shift_no.split("-")[1])
                return f"{year}-{last_num + 1:05d}"
            except (ValueError, IndexError):
                pass
        return f"{year}-00001"


class Shifting(models.Model):
    """Shift operation detail - individual item movements."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="shiftings",
    )
    shift_header = models.ForeignKey(
        ShiftHeader,
        on_delete=models.CASCADE,
        related_name="items",
    )
    amad = models.ForeignKey(
        Amad,
        on_delete=models.PROTECT,
        related_name="shift_records",
    )
    from_room = models.ForeignKey(
        Room,
        on_delete=models.PROTECT,
        related_name="shift_items_from",
    )
    from_floor = models.PositiveIntegerField()
    from_rack = models.PositiveIntegerField()
    to_room = models.ForeignKey(
        Room,
        on_delete=models.PROTECT,
        related_name="shift_items_to",
    )
    to_floor = models.PositiveIntegerField()
    to_rack = models.PositiveIntegerField()
    quantity = models.PositiveIntegerField(
        help_text="Number of bags shifted",
    )
    narration = models.TextField(
        blank=True,
        null=True,
        help_text="Notes about this shift",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "warehouse_shifting"
        verbose_name = "shifting"
        verbose_name_plural = "shiftings"
        ordering = ["shift_header", "id"]
        indexes = [
            models.Index(fields=["organization"]),
            models.Index(fields=["shift_header"]),
            models.Index(fields=["amad"]),
        ]

    def __str__(self):
        return (
            f"Shift {self.amad.amad_no}: "
            f"Room {self.from_room.number} F{self.from_floor} R{self.from_rack} -> "
            f"Room {self.to_room.number} F{self.to_floor} R{self.to_rack} ({self.quantity} bags)"
        )


# =============================================================================
# Temperature Monitoring
# =============================================================================


class TemperatureThreshold(models.Model):
    """Configurable temperature thresholds per room."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="temperature_thresholds",
    )
    room = models.OneToOneField(
        Room,
        on_delete=models.CASCADE,
        related_name="temperature_threshold",
    )
    target_low = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("2.00"),
        help_text="Target minimum temperature (e.g., 2°C)",
    )
    target_high = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("4.00"),
        help_text="Target maximum temperature (e.g., 4°C)",
    )
    warning_deviation = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("2.00"),
        help_text="Temperature deviation that triggers warning (default: 2°C)",
    )
    critical_deviation = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=Decimal("5.00"),
        help_text="Temperature deviation that triggers critical alert (default: 5°C)",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "warehouse_temperature_threshold"
        verbose_name = "temperature threshold"
        verbose_name_plural = "temperature thresholds"

    def __str__(self):
        return f"Threshold for {self.room}: {self.target_low}°C - {self.target_high}°C"


class TemperatureReading(models.Model):
    """Temperature monitoring readings."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="temperature_readings",
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="temperature_readings",
    )
    floor_number = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Optional floor number (null for room-level reading)",
    )
    reading_datetime = models.DateTimeField(db_index=True)
    low_temp = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Minimum temperature recorded",
    )
    high_temp = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        help_text="Maximum temperature recorded",
    )
    status = models.CharField(
        max_length=20,
        choices=TemperatureStatus.choices,
        default=TemperatureStatus.NORMAL,
        help_text="Computed status based on thresholds",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_temperature_readings",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "warehouse_temperature_reading"
        verbose_name = "temperature reading"
        verbose_name_plural = "temperature readings"
        ordering = ["-reading_datetime"]
        indexes = [
            models.Index(fields=["organization", "room", "reading_datetime"]),
            models.Index(fields=["organization", "status"]),
        ]

    def __str__(self):
        return f"Temp {self.room} @ {self.reading_datetime}: {self.low_temp}°C - {self.high_temp}°C ({self.status})"

    def save(self, *args, **kwargs):
        # Compute status based on thresholds
        self.status = self._compute_status()
        super().save(*args, **kwargs)

    def _compute_status(self):
        """Compute temperature status based on room thresholds."""
        try:
            threshold = self.room.temperature_threshold
        except TemperatureThreshold.DoesNotExist:
            return TemperatureStatus.NORMAL

        # Check if temperature is within critical range
        critical_low = threshold.target_low - threshold.critical_deviation
        critical_high = threshold.target_high + threshold.critical_deviation

        if self.low_temp < critical_low or self.high_temp > critical_high:
            return TemperatureStatus.CRITICAL

        # Check if temperature is within warning range
        warning_low = threshold.target_low - threshold.warning_deviation
        warning_high = threshold.target_high + threshold.warning_deviation

        if self.low_temp < warning_low or self.high_temp > warning_high:
            return TemperatureStatus.WARNING

        return TemperatureStatus.NORMAL


# =============================================================================
# Meter Reading
# =============================================================================


class MeterReading(models.Model):
    """Electricity meter readings."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="meter_readings",
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="meter_readings",
        help_text="Room/machine reference",
    )
    date = models.DateField(db_index=True)
    reading_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        help_text="Meter reading value",
    )
    photo_url = models.CharField(
        max_length=500,
        blank=True,
        null=True,
        help_text="URL to photo of the reading",
    )
    notes = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="created_meter_readings",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "warehouse_meter_reading"
        verbose_name = "meter reading"
        verbose_name_plural = "meter readings"
        ordering = ["-date"]
        indexes = [
            models.Index(fields=["organization", "room", "date"]),
        ]

    def __str__(self):
        return f"Meter {self.room} @ {self.date}: {self.reading_value}"


# =============================================================================
# Rack Occupancy (Cached for Performance)
# =============================================================================


class RackOccupancy(models.Model):
    """Cached rack occupancy for quick lookup - updated via signals."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="rack_occupancies",
    )
    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="rack_occupancies",
    )
    floor_number = models.PositiveIntegerField()
    rack_number = models.PositiveIntegerField()
    current_quantity = models.PositiveIntegerField(
        default=0,
        help_text="Current number of bags in this rack",
    )
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "warehouse_rack_occupancy"
        verbose_name = "rack occupancy"
        verbose_name_plural = "rack occupancies"
        constraints = [
            models.UniqueConstraint(
                fields=["organization", "room", "floor_number", "rack_number"],
                name="unique_org_room_floor_rack",
            )
        ]
        indexes = [
            models.Index(fields=["organization", "room"]),
            models.Index(fields=["organization", "room", "floor_number"]),
        ]

    def __str__(self):
        return f"Rack {self.room.number} F{self.floor_number} R{self.rack_number}: {self.current_quantity} bags"
