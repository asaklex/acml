"""
Core models for ACML Platform.
Base models and shared functionality.
"""
import uuid
from django.db import models


class TimeStampedModel(models.Model):
    """Abstract base class with timestamp fields."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True
        ordering = ['-created_at']


class SoftDeleteModel(models.Model):
    """Abstract base class for soft delete functionality."""
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        abstract = True

    def soft_delete(self):
        """Mark the object as deleted without removing from database."""
        from django.utils import timezone
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()

    def restore(self):
        """Restore a soft-deleted object."""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class Law25ComplianceModel(models.Model):
    """
    Abstract base class for Law 25 (Quebec) compliance.
    Tracks consent and data retention.
    """
    consent_timestamp = models.DateTimeField(null=True, blank=True, help_text="When consent was given")
    consent_version = models.CharField(max_length=20, null=True, blank=True, help_text="Version of consent form")
    data_retention_date = models.DateField(null=True, blank=True, help_text="Date when data can be deleted")

    class Meta:
        abstract = True

    def record_consent(self, version: str):
        """Record user consent with version tracking."""
        from django.utils import timezone
        from datetime import timedelta
        from django.conf import settings

        self.consent_timestamp = timezone.now()
        self.consent_version = version
        # Set retention date to 3 years from now (Law 25 requirement)
        retention_days = getattr(settings, 'DATA_RETENTION_DAYS', 365 * 3)
        self.data_retention_date = (timezone.now() + timedelta(days=retention_days)).date()
        self.save(update_fields=['consent_timestamp', 'consent_version', 'data_retention_date'])

    def is_retention_expired(self) -> bool:
        """Check if data retention period has expired."""
        from django.utils import timezone
        if not self.data_retention_date:
            return False
        return timezone.now().date() > self.data_retention_date


class AddressModel(models.Model):
    """Abstract base class for address information."""
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    province = models.CharField(max_length=50, default='QC')
    postal_code = models.CharField(max_length=10, blank=True)
    country = models.CharField(max_length=50, default='Canada')

    class Meta:
        abstract = True

    def full_address(self) -> str:
        """Return formatted full address."""
        parts = [self.address_line1, self.address_line2, self.city, self.province, self.postal_code]
        return ', '.join(filter(None, parts))
