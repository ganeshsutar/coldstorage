from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from .models import Organization, OrganizationMembership, User


@receiver(post_save, sender=User)
def create_default_organization(sender, instance, created, **kwargs):
    """Create a default organization when a new user signs up."""
    if created and not instance.is_superuser:
        # Create default organization
        org_name = f"{instance.full_name}'s Organization"
        organization = Organization.objects.create(
            name=org_name,
            billing_status=Organization.BillingStatus.TRIAL,
        )

        # Create membership with ADMIN role
        OrganizationMembership.objects.create(
            user=instance,
            organization=organization,
            role=OrganizationMembership.Role.ADMIN,
            is_default=True,
            status=OrganizationMembership.Status.ACTIVE,
            joined_at=timezone.now(),
        )
