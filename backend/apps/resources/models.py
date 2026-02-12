import uuid
from django.db import models
from apps.members.models import Member


class Resource(models.Model):
    """Ressources communautaires (Salles, matériel)."""
    
    class Type(models.TextChoices):
        ROOM = 'ROOM', 'Salle'
        EQUIPMENT = 'EQUIPMENT', 'Matériel'
        VEHICLE = 'VEHICLE', 'Véhicule'
        OTHER = 'OTHER', 'Autre'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Nom de la ressource")
    type = models.CharField(max_length=20, choices=Type.choices, verbose_name="Type")
    description = models.TextField(blank=True, verbose_name="Description")
    capacity = models.PositiveIntegerField(null=True, blank=True, verbose_name="Capacité")
    is_available = models.BooleanField(default=True, verbose_name="Est disponible")
    
    class Meta:
        db_table = 'resources'
        verbose_name = 'Ressource'
        verbose_name_plural = 'Ressources'

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"


class Reservation(models.Model):
    """Réservations de ressources."""
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        APPROVED = 'APPROVED', 'Approuvée'
        REJECTED = 'REJECTED', 'Rejetée'
        CANCELLED = 'CANCELLED', 'Annulée'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, related_name='reservations', verbose_name="Ressource")
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='reservations', verbose_name="Membre")
    start_time = models.DateTimeField(verbose_name="Heure de début")
    end_time = models.DateTimeField(verbose_name="Heure de fin")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, verbose_name="Statut")
    notes = models.TextField(blank=True, verbose_name="Notes")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'reservations'
        verbose_name = 'Réservation'
        verbose_name_plural = 'Réservations'
        ordering = ['-start_time']

    def __str__(self):
        return f"{self.resource.name} - {self.member} ({self.start_time})"
