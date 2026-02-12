import uuid
from django.db import models
from apps.members.models import Member


class Event(models.Model):
    """Événements communautaires."""
    
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Brouillon'
        OPEN = 'OPEN', 'Ouvert'
        CLOSED = 'CLOSED', 'Fermé'
        COMPLETED = 'COMPLETED', 'Terminé'
        CANCELLED = 'CANCELLED', 'Annulé'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name="Titre")
    description = models.TextField(blank=True, verbose_name="Description")
    start_date = models.DateTimeField(verbose_name="Date de début")
    end_date = models.DateTimeField(verbose_name="Date de fin")
    location = models.CharField(max_length=255, blank=True, verbose_name="Lieu")
    max_capacity = models.PositiveIntegerField(null=True, blank=True, verbose_name="Capacité maximale")
    current_registrations = models.PositiveIntegerField(default=0, verbose_name="Inscriptions actuelles")
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.DRAFT, verbose_name="Statut")
    image_consent_required = models.BooleanField(default=False, verbose_name="Consentement image requis")
    barcode_prefix = models.CharField(max_length=20, blank=True, verbose_name="Préfixe code-barres")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'events'
        verbose_name = 'Événement'
        verbose_name_plural = 'Événements'
        ordering = ['-start_date']

    def __str__(self):
        return self.title


class EventRegistration(models.Model):
    """Inscriptions aux événements."""
    
    class Status(models.TextChoices):
        REGISTERED = 'REGISTERED', 'Inscrit'
        CHECKED_IN = 'CHECKED_IN', 'Présent'
        CANCELLED = 'CANCELLED', 'Annulé'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='registrations', verbose_name="Événement")
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='event_registrations', verbose_name="Membre")
    status = models.CharField(max_length=15, choices=Status.choices, default=Status.REGISTERED, verbose_name="Statut")
    barcode = models.CharField(max_length=50, unique=True, verbose_name="Code-barres")
    image_consent = models.BooleanField(default=False, verbose_name="Consentement image")
    registered_at = models.DateTimeField(auto_now_add=True, verbose_name="Inscrit le")
    checked_in_at = models.DateTimeField(null=True, blank=True, verbose_name="Arrivé le")
    
    class Meta:
        db_table = 'event_registrations'
        verbose_name = 'Inscription à un événement'
        verbose_name_plural = 'Inscriptions aux événements'
        unique_together = ['event', 'member']

    def __str__(self):
        return f"{self.member} - {self.event}"


class EventPhoto(models.Model):
    """Photos des événements."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='photos', verbose_name="Événement")
    image = models.ImageField(upload_to='events/%Y/%m/', verbose_name="Image")
    caption = models.CharField(max_length=255, blank=True, verbose_name="Légende")
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'event_photos'
        verbose_name = 'Photo d\'événement'
        verbose_name_plural = 'Photos d\'événements'


class EventFeedback(models.Model):
    """Retours sur les événements."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, related_name='feedback', verbose_name="Événement")
    member = models.ForeignKey(Member, on_delete=models.CASCADE, verbose_name="Membre")
    rating = models.PositiveSmallIntegerField(verbose_name="Note (1-5)")
    comment = models.TextField(blank=True, verbose_name="Commentaire")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'event_feedback'
        verbose_name = 'Retour d\'événement'
        verbose_name_plural = 'Retours d\'événements'
        unique_together = ['event', 'member']
