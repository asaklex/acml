import uuid
from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.validators import RegexValidator
from django.core.exceptions import ValidationError


def generate_guid():
    return uuid.uuid4().hex


class MemberManager(BaseUserManager):
    def create_user(self, email=None, phone=None, password=None, username=None, **extra_fields):
        if not email and not phone:
            raise ValueError('Either email or phone must be set')
        
        if not username:
            username = generate_guid()
            
        email = self.normalize_email(email) if email else None
        user = self.model(username=username, email=email, phone=phone, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email=email, password=password, **extra_fields)


class Member(AbstractUser):
    """Extended user model for community members."""
    
    class Sex(models.TextChoices):
        MALE = 'M', 'Homme'
        FEMALE = 'F', 'Femme'
    
    class Status(models.TextChoices):
        ACTIVE = 'ACTIVE', 'Actif'
        INACTIVE = 'INACTIVE', 'Inactif'
        PENDING = 'PENDING', 'En attente'
    
    username = models.CharField(max_length=150, unique=True, default=generate_guid)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, null=True, blank=True)
    phone = models.CharField(
        max_length=20, 
        unique=True, 
        blank=True, 
        null=True,
        validators=[RegexValidator(regex=r'^\d{10}$', message='Le numéro de téléphone doit comporter exactement 10 chiffres.')]
    )
    sex = models.CharField(max_length=1, choices=Sex.choices, blank=True, null=True)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
    postal_code = models.CharField(max_length=10)
    must_change_password = models.BooleanField(default=True)
    
    # Law 25 Compliance (Quebec)
    consent_timestamp = models.DateTimeField(null=True, blank=True)
    consent_version = models.CharField(max_length=20, null=True, blank=True)
    data_retention_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    objects = MemberManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        db_table = 'members'
        verbose_name = 'Membre'
        verbose_name_plural = 'Membres'
        indexes = [
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['email']),
            models.Index(fields=['phone']),
        ]

    def clean(self):
        super().clean()
        if not self.email and not self.phone:
            raise ValidationError('Un courriel ou un numéro de téléphone est requis.')
        if self.phone:
            # Normalize for validation
            self.phone = ''.join(filter(str.isdigit, self.phone))

    def save(self, *args, **kwargs):
        if self.phone:
            self.phone = ''.join(filter(str.isdigit, self.phone))
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email or self.phone or self.username})"


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
