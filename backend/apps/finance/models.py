import uuid
from django.db import models
from apps.members.models import Member


class Campaign(models.Model):
    """Campagnes de financement."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Nom de la campagne")
    description = models.TextField(blank=True, verbose_name="Description")
    goal_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name="Objectif financier")
    current_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name="Montant actuel")
    start_date = models.DateField(null=True, blank=True, verbose_name="Date de début")
    end_date = models.DateField(null=True, blank=True, verbose_name="Date de fin")
    is_active = models.BooleanField(default=True, verbose_name="Est active")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'campaigns'
        verbose_name = 'Campagne de financement'
        verbose_name_plural = 'Campagnes de financement'

    def __str__(self):
        return self.name


class TaxReceipt(models.Model):
    """Reçus officiels aux fins de l'impôt."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='tax_receipts', verbose_name="Membre")
    receipt_number = models.CharField(max_length=50, unique=True, verbose_name="Numéro de reçu")
    year = models.PositiveIntegerField(verbose_name="Année d'imposition")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Montant total")
    organization_number = models.CharField(max_length=50, verbose_name="Numéro d'organisme")
    pdf_path = models.FileField(upload_to='receipts/%Y/', verbose_name="Fichier PDF")
    issued_at = models.DateTimeField(auto_now_add=True, verbose_name="Émis le")
    
    class Meta:
        db_table = 'tax_receipts'
        verbose_name = 'Reçu fiscal'
        verbose_name_plural = 'Reçus fiscaux'

    def __str__(self):
        return self.receipt_number


class Donation(models.Model):
    """Dons et cotisations."""
    
    class DonationType(models.TextChoices):
        COTISATION = 'COTISATION', 'Cotisation'
        ONE_TIME = 'ONE_TIME', 'Don ponctuel'
        RECURRING = 'RECURRING', 'Don récurrent'
    
    class PaymentMethod(models.TextChoices):
        STRIPE = 'STRIPE', 'Carte de crédit (Stripe)'
        INTERAC = 'INTERAC', 'Interac'
        PAYPAL = 'PAYPAL', 'PayPal'
        CASH = 'CASH', 'Espèces'
        OTHER = 'OTHER', 'Autre'
    
    class Status(models.TextChoices):
        PENDING = 'PENDING', 'En attente'
        COMPLETED = 'COMPLETED', 'Complété'
        FAILED = 'FAILED', 'Échoué'
        REFUNDED = 'REFUNDED', 'Remboursé'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True, related_name='donations', verbose_name="Membre")
    campaign = models.ForeignKey(Campaign, on_delete=models.SET_NULL, null=True, blank=True, related_name='donations', verbose_name="Campagne")
    receipt = models.ForeignKey(TaxReceipt, on_delete=models.SET_NULL, null=True, blank=True, related_name='donations', verbose_name="Reçu fiscal")
    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Montant")
    currency = models.CharField(max_length=3, default='CAD', verbose_name="Devise")
    type = models.CharField(max_length=20, choices=DonationType.choices, verbose_name="Type")
    payment_method = models.CharField(max_length=20, choices=PaymentMethod.choices, verbose_name="Méthode de paiement")
    payment_id = models.CharField(max_length=255, blank=True, verbose_name="ID de transaction")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, verbose_name="Statut")
    receipt_issued = models.BooleanField(default=False, verbose_name="Reçu émis")
    donated_at = models.DateTimeField(auto_now_add=True, verbose_name="Date du don")
    
    class Meta:
        db_table = 'donations'
        verbose_name = 'Don / Cotisation'
        verbose_name_plural = 'Dons / Cotisations'
        ordering = ['-donated_at']

    def __str__(self):
        return f"{self.amount} {self.currency} - {self.member}"
