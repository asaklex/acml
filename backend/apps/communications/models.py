import uuid
from django.db import models
from apps.members.models import Member


class Announcement(models.Model):
    """Annonces communautaires."""
    
    class Category(models.TextChoices):
        RELIGIOUS = 'RELIGIOUS', 'Religieuse'
        CULTURAL = 'CULTURAL', 'Culturelle'
        ADMINISTRATIVE = 'ADMINISTRATIVE', 'Administrative'
        GENERAL = 'GENERAL', 'Générale'
    
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Brouillon'
        PUBLISHED = 'PUBLISHED', 'Publiée'
        EXPIRED = 'EXPIRED', 'Expirée'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name="Titre")
    content = models.TextField(verbose_name="Contenu")
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.GENERAL, verbose_name="Catégorie")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, verbose_name="Statut")
    published_at = models.DateTimeField(null=True, blank=True, verbose_name="Date de publication")
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name="Date d'expiration")
    created_by = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, verbose_name="Créé par")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'announcements'
        verbose_name = 'Annonce'
        verbose_name_plural = 'Annonces'
        ordering = ['-published_at', '-created_at']

    def __str__(self):
        return self.title


class CalendarEvent(models.Model):
    """Événements du calendrier communautaire."""
    
    class Category(models.TextChoices):
        PRAYER = 'PRAYER', 'Prière / Religieux'
        COURSE = 'COURSE', 'Cours'
        MEETING = 'MEETING', 'Réunion'
        CELEBRATION = 'CELEBRATION', 'Célébration'
        OTHER = 'OTHER', 'Autre'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, verbose_name="Titre")
    description = models.TextField(blank=True, verbose_name="Description")
    start_time = models.DateTimeField(verbose_name="Heure de début")
    end_time = models.DateTimeField(verbose_name="Heure de fin")
    location = models.CharField(max_length=255, blank=True, verbose_name="Lieu")
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER, verbose_name="Catégorie")
    
    class Meta:
        db_table = 'calendar_events'
        verbose_name = 'Événement calendrier'
        verbose_name_plural = 'Événements calendrier'
        ordering = ['start_time']

    def __str__(self):
        return self.title


class Newsletter(models.Model):
    """Infolettres intégrées."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    subject = models.CharField(max_length=255, verbose_name="Sujet")
    content = models.TextField(verbose_name="Contenu (HTML/Texte)")
    template_id = models.CharField(max_length=100, blank=True, verbose_name="ID Modèle")
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name="Envoyé le")
    recipient_count = models.IntegerField(default=0, verbose_name="Nombre de destinataires")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'newsletters'
        verbose_name = 'Infolettre'
        verbose_name_plural = 'Infolettres'

    def __str__(self):
        return self.subject


class Notification(models.Model):
    """Notifications envoyées aux membres."""
    
    class Channel(models.TextChoices):
        EMAIL = 'EMAIL', 'Email'
        SMS = 'SMS', 'SMS'
        PUSH = 'PUSH', 'Push'
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        SENT = 'SENT', 'Envoyé'
        FAILED = 'FAILED', 'Échoué'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='notifications', verbose_name="Membre")
    channel = models.CharField(max_length=10, choices=Channel.choices, verbose_name="Canal")
    subject = models.CharField(max_length=255, blank=True, verbose_name="Sujet")
    content = models.TextField(verbose_name="Contenu")
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING, verbose_name="Statut")
    sent_at = models.DateTimeField(null=True, blank=True, verbose_name="Envoyé le")
    error_message = models.TextField(blank=True, verbose_name="Message d'erreur")

    class Meta:
        db_table = 'notifications'
        verbose_name = 'Notification'
        verbose_name_plural = 'Notifications'
        ordering = ['-sent_at', '-id']
