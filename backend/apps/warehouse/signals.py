from django.db.models.signals import post_delete, post_save
from django.dispatch import receiver

from .models import Loading, Shifting, Unloading
from .services import WarehouseService


@receiver(post_save, sender=Loading)
def update_occupancy_on_loading_save(sender, instance, **kwargs):
    """Update rack occupancy when a loading record is saved."""
    service = WarehouseService(instance.organization)
    service.update_rack_occupancy(
        str(instance.room_id),
        instance.floor_number,
        instance.rack_number,
    )


@receiver(post_delete, sender=Loading)
def update_occupancy_on_loading_delete(sender, instance, **kwargs):
    """Update rack occupancy when a loading record is deleted."""
    service = WarehouseService(instance.organization)
    service.update_rack_occupancy(
        str(instance.room_id),
        instance.floor_number,
        instance.rack_number,
    )


@receiver(post_save, sender=Unloading)
def update_occupancy_on_unloading_save(sender, instance, **kwargs):
    """Update rack occupancy when an unloading record is saved."""
    service = WarehouseService(instance.organization)
    service.update_rack_occupancy(
        str(instance.room_id),
        instance.floor_number,
        instance.rack_number,
    )


@receiver(post_delete, sender=Unloading)
def update_occupancy_on_unloading_delete(sender, instance, **kwargs):
    """Update rack occupancy when an unloading record is deleted."""
    service = WarehouseService(instance.organization)
    service.update_rack_occupancy(
        str(instance.room_id),
        instance.floor_number,
        instance.rack_number,
    )


@receiver(post_save, sender=Shifting)
def update_occupancy_on_shifting_save(sender, instance, **kwargs):
    """Update rack occupancy when a shifting record is saved."""
    service = WarehouseService(instance.organization)

    # Update source rack
    service.update_rack_occupancy(
        str(instance.from_room_id),
        instance.from_floor,
        instance.from_rack,
    )

    # Update destination rack
    service.update_rack_occupancy(
        str(instance.to_room_id),
        instance.to_floor,
        instance.to_rack,
    )


@receiver(post_delete, sender=Shifting)
def update_occupancy_on_shifting_delete(sender, instance, **kwargs):
    """Update rack occupancy when a shifting record is deleted."""
    service = WarehouseService(instance.organization)

    # Update source rack
    service.update_rack_occupancy(
        str(instance.from_room_id),
        instance.from_floor,
        instance.from_rack,
    )

    # Update destination rack
    service.update_rack_occupancy(
        str(instance.to_room_id),
        instance.to_floor,
        instance.to_rack,
    )
