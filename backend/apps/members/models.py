import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser


class Member(AbstractUser):
    """Extended user model for community members."""
    
    class Gender(models.TextChoices):
        MALE = 'M', 'Homme'
        FEMALE = 'F', 'Femme'
    
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Actif'
        INACTIVE = 'INACTIVE', 'Inactif'
        PENDING = 'PENDING', 'En attente'
    
    class MembershipType(models.TextChoices):
        MONTHLY = 'MONTHLY', 'Mensuel'
        ANNUAL = 'ANNUAL', 'Annuel'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    phone = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=1, choices=Gender.choices, blank=True, null=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    membership_type = models.CharField(max_length=10, choices=MembershipType.choices, null=True, blank=True)
    
    # Law 25 Compliance (Quebec)
    consent_timestamp = models.DateTimeField(null=True, blank=True)
    consent_version = models.CharField(max_length=20, null=True, blank=True)
    data_retention_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'members'
        verbose_name = 'Membre'
        verbose_name_plural = 'Membres'
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['email']),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"


class MemberFamily(models.Model):
    """Family relationships for members."""
    
    class Relationship(models.TextChoices):
        SPOUSE = 'SPOUSE', 'Conjoint(e)'
        CHILD = 'CHILD', 'Enfant'
        PARENT = 'PARENT', 'Parent'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='families')
    related_member = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True)
    relationship = models.CharField(max_length=10, choices=Relationship.choices)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'member_families'
        verbose_name = 'Relation familiale'
        verbose_name_plural = 'Relations familiales'


class MemberSkill(models.Model):
    """Skills that members can offer."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='skills')
    skill_name = models.CharField(max_length=100)
    proficiency = models.CharField(max_length=50, blank=True)
    
    class Meta:
        db_table = 'member_skills'
        verbose_name = 'Compétence'
        verbose_name_plural = 'Compétences'
        unique_together = ['member', 'skill_name']


class MemberContribution(models.Model):
    """Track member contributions (volunteer hours, etc)."""
    
    class ContributionType(models.TextChoices):
        COTISATION = 'COTISATION', 'Cotisation'
        DON = 'DON', 'Don'
        BENEVOLE = 'BENEVOLE', 'Bénévolat'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='contributions')
    type = models.CharField(max_length=15, choices=ContributionType.choices)
    amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    hours = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)
    contributed_at = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'member_contributions'
        verbose_name = 'Contribution'
        verbose_name_plural = 'Contributions'
        indexes = [
            models.Index(fields=['member', 'contributed_at']),
        ]


class MemberCard(models.Model):
    """Digital member cards."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='cards')
    card_number = models.CharField(max_length=50, unique=True)
    year = models.PositiveIntegerField()
    issued_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateField(null=True, blank=True)
    
    class Meta:
        db_table = 'member_cards'
        verbose_name = 'Carte de membre'
        verbose_name_plural = 'Cartes de membre'
        unique_together = ['member', 'year']
