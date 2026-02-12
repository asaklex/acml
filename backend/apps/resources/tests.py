from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from .models import Resource, Reservation
from apps.members.models import Member


class ResourceModelTest(TestCase):
    """Test Resource model."""

    def test_resource_creation(self):
        """Test resource can be created."""
        resource = Resource.objects.create(
            name='Salle Principale',
            type='ROOM',
            description='Grande salle pour événements',
            capacity=100,
            is_available=True
        )
        self.assertEqual(resource.name, 'Salle Principale')
        self.assertEqual(resource.type, 'ROOM')
        self.assertTrue(resource.is_available)

    def test_resource_str(self):
        """Test resource string representation."""
        resource = Resource.objects.create(
            name='Projecteur',
            type='EQUIPMENT'
        )
        self.assertEqual(str(resource), 'Projecteur (Matériel)')


class ReservationModelTest(TestCase):
    """Test Reservation model."""

    def setUp(self):
        self.member = Member.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.resource = Resource.objects.create(
            name='Salle de réunion',
            type='ROOM',
            capacity=20
        )

    def test_reservation_creation(self):
        """Test reservation can be created."""
        start = timezone.now() + timedelta(days=1)
        end = start + timedelta(hours=2)
        reservation = Reservation.objects.create(
            resource=self.resource,
            member=self.member,
            start_time=start,
            end_time=end,
            status='PENDING',
            notes='Réunion de comité'
        )
        self.assertEqual(reservation.status, 'PENDING')
        self.assertEqual(reservation.resource, self.resource)

    def test_reservation_str(self):
        """Test reservation string representation."""
        start = timezone.now() + timedelta(days=1)
        end = start + timedelta(hours=2)
        reservation = Reservation.objects.create(
            resource=self.resource,
            member=self.member,
            start_time=start,
            end_time=end
        )
        self.assertIn('Salle de réunion', str(reservation))


class ResourceAPITest(APITestCase):
    """Test Resource API endpoints."""

    def setUp(self):
        self.member = Member.objects.create_user(
            username='member',
            email='member@example.com',
            password='testpass123'
        )
        self.admin = Member.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        self.resource = Resource.objects.create(
            name='Salle Principale',
            type='ROOM',
            capacity=100
        )

    def test_get_resources(self):
        """Test resources can be listed."""
        response = self.client.get('/resources/resources/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_reservation_unauthorized(self):
        """Test unauthorized users cannot create reservations."""
        response = self.client.post('/resources/reservations/', {
            'resource': self.resource.id,
            'start_time': timezone.now() + timedelta(days=1),
            'end_time': timezone.now() + timedelta(days=1, hours=2)
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_reservation_authorized(self):
        """Test authenticated users can create reservations."""
        self.client.force_authenticate(user=self.member)
        start = timezone.now() + timedelta(days=1)
        end = start + timedelta(hours=2)
        response = self.client.post('/resources/reservations/', {
            'resource': self.resource.id,
            'start_time': start.isoformat(),
            'end_time': end.isoformat(),
            'notes': 'Test reservation'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_member_own_reservations_only(self):
        """Test members can only see their own reservations."""
        other_member = Member.objects.create_user(
            username='other',
            email='other@example.com',
            password='testpass123'
        )
        start = timezone.now() + timedelta(days=1)
        end = start + timedelta(hours=2)

        # Create reservation for other member
        Reservation.objects.create(
            resource=self.resource,
            member=other_member,
            start_time=start,
            end_time=end
        )

        # Create reservation for this member
        Reservation.objects.create(
            resource=self.resource,
            member=self.member,
            start_time=start + timedelta(days=2),
            end_time=end + timedelta(days=2)
        )

        self.client.force_authenticate(user=self.member)
        response = self.client.get('/resources/reservations/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['member'], self.member.id)
