from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from .models import Event, EventRegistration
from apps.members.models import Member


class EventModelTest(TestCase):
    """Test Event model."""

    def setUp(self):
        self.member = Member.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.event = Event.objects.create(
            title='Test Event',
            description='A test event',
            start_date=timezone.now() + timedelta(days=1),
            end_date=timezone.now() + timedelta(days=1, hours=2),
            location='Test Location',
            max_capacity=50,
            status='OPEN',
            created_by=self.member
        )

    def test_event_creation(self):
        """Test event can be created."""
        self.assertEqual(self.event.title, 'Test Event')
        self.assertEqual(self.event.status, 'OPEN')
        self.assertEqual(self.event.current_registrations, 0)

    def test_event_str(self):
        """Test event string representation."""
        self.assertEqual(str(self.event), 'Test Event')


class EventRegistrationTest(TestCase):
    """Test EventRegistration model."""

    def setUp(self):
        self.member = Member.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.event = Event.objects.create(
            title='Test Event',
            start_date=timezone.now() + timedelta(days=1),
            end_date=timezone.now() + timedelta(days=1, hours=2),
            location='Test Location',
            max_capacity=50,
            created_by=self.member
        )

    def test_registration_creation(self):
        """Test registration can be created."""
        registration = EventRegistration.objects.create(
            event=self.event,
            member=self.member,
            barcode='TEST-12345',
            image_consent=True
        )
        self.assertEqual(registration.status, 'REGISTERED')
        self.assertTrue(registration.image_consent)

    def test_unique_registration(self):
        """Test member cannot register twice for same event."""
        EventRegistration.objects.create(
            event=self.event,
            member=self.member,
            barcode='TEST-12345'
        )
        with self.assertRaises(Exception):  # IntegrityError
            EventRegistration.objects.create(
                event=self.event,
                member=self.member,
                barcode='TEST-67890'
            )


class EventAPITest(APITestCase):
    """Test Event API endpoints."""

    def setUp(self):
        self.admin = Member.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        self.event = Event.objects.create(
            title='Test Event',
            start_date=timezone.now() + timedelta(days=1),
            end_date=timezone.now() + timedelta(days=1, hours=2),
            location='Test Location',
            created_by=self.admin
        )

    def test_get_events(self):
        """Test events can be listed."""
        response = self.client.get('/api/events/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_event_unauthorized(self):
        """Test unauthorized users cannot create events."""
        response = self.client.post('/api/events/', {
            'title': 'New Event',
            'start_date': timezone.now() + timedelta(days=1),
            'end_date': timezone.now() + timedelta(days=1, hours=2),
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_event_authorized(self):
        """Test authenticated users can create events."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/events/', {
            'title': 'New Event',
            'start_date': timezone.now() + timedelta(days=1),
            'end_date': timezone.now() + timedelta(days=1, hours=2),
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
