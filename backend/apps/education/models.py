import uuid
from django.db import models
from apps.members.models import Member


class Course(models.Model):
    """Cours communautaires (Arabe, etc.)."""
    
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Brouillon'
        ACTIVE = 'ACTIVE', 'Actif'
        COMPLETED = 'COMPLETED', 'Terminé'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, verbose_name="Nom du cours")
    description = models.TextField(blank=True, verbose_name="Description")
    teacher = models.ForeignKey(Member, on_delete=models.SET_NULL, null=True, blank=True, related_name='teaching_courses', verbose_name="Enseignant")
    schedule = models.CharField(max_length=255, blank=True, verbose_name="Horaire")
    current_session = models.CharField(max_length=100, blank=True, verbose_name="Session actuelle")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT, verbose_name="Statut")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'courses'
        verbose_name = 'Cours'
        verbose_name_plural = 'Cours'

    def __str__(self):
        return self.name


class CourseLevel(models.Model):
    """Niveaux ou groupes pour un cours."""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='levels', verbose_name="Cours")
    name = models.CharField(max_length=100, verbose_name="Nom du niveau")
    order_num = models.PositiveIntegerField(default=0, verbose_name="Ordre")
    description = models.TextField(blank=True, verbose_name="Description")
    
    class Meta:
        db_table = 'course_levels'
        verbose_name = 'Niveau de cours'
        verbose_name_plural = 'Niveaux de cours'
        ordering = ['order_num']

    def __str__(self):
        return f"{self.course.name} - {self.name}"


class Student(models.Model):
    """Élévès inscrits aux cours."""
    
    class PaymentStatus(models.TextChoices):
        PAID = 'PAID', 'Payé'
        PARTIAL = 'PARTIAL', 'Partiel'
        UNPAID = 'UNPAID', 'Non payé'
        EXEMPT = 'EXEMPT', 'Exempté'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    parent_member = models.ForeignKey(Member, on_delete=models.CASCADE, related_name='students', verbose_name="Parent / Membre responsable")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='students', verbose_name="Cours")
    level = models.ForeignKey(CourseLevel, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Niveau")
    first_name = models.CharField(max_length=100, verbose_name="Prénom")
    last_name = models.CharField(max_length=100, verbose_name="Nom")
    birth_date = models.DateField(null=True, blank=True, verbose_name="Date de naissance")
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID, verbose_name="Statut de paiement")
    enrolled_at = models.DateTimeField(auto_now_add=True, verbose_name="Inscrit le")
    
    class Meta:
        db_table = 'students'
        verbose_name = 'Élève'
        verbose_name_plural = 'Élèves'

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Attendance(models.Model):
    """Suivi de présence."""
    
    class Status(models.TextChoices):
        PRESENT = 'PRESENT', 'Présent'
        ABSENT = 'ABSENT', 'Absent'
        EXCUSED = 'EXCUSED', 'Excusé'
        LATE = 'LATE', 'En retard'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendance_records', verbose_name="Élève")
    course = models.ForeignKey(Course, on_delete=models.CASCADE, verbose_name="Cours")
    date = models.DateField(verbose_name="Date")
    status = models.CharField(max_length=20, choices=Status.choices, verbose_name="Statut")
    notes = models.TextField(blank=True, verbose_name="Notes")
    
    class Meta:
        db_table = 'attendance'
        verbose_name = 'Présence'
        verbose_name_plural = 'Présences'
        unique_together = ['student', 'course', 'date']
