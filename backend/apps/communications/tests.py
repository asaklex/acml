from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from django.utils import timezone
from datetime import timedelta
from .models import Announcement, CalendarEvent, Newsletter
from apps.members.models import Member


class AnnouncementModelTest(TestCase):
    """Test Announcement model."""

    def setUp(self):
        self.admin = Member.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )

    def test_announcement_creation(self):
        """Test announcement can be created."""
        announcement = Announcement.objects.create(
            title='Important Announcement',
            content='This is an important announcement',
            category='ADMINISTRATIVE',
            status='PUBLISHED',
            published_at=timezone.now(),
            expires_at=timezone.now() + timedelta(days=7),
            created_by=self.admin
        )
        self.assertEqual(announcement.title, 'Important Announcement')
        self.assertEqual(announcement.category, 'ADMINISTRATIVE')


class CalendarEventModelTest(TestCase):
    """Test CalendarEvent model."""

    def test_calendar_event_creation(self):
        """Test calendar event can be created."""
        event = CalendarEvent.objects.create(
            title='Community Gathering',
            description='Monthly community gathering',
            start_time=timezone.now() + timedelta(days=1),
            end_time=timezone.now() + timedelta(days=1, hours=3),
            location='Community Center',
            category='RELIGIOUS'
        )
        self.assertEqual(event.title, 'Community Gathering')
        self.assertEqual(event.category, 'RELIGIOUS')


class NewsletterModelTest(TestCase):
    """Test Newsletter model."""

    def test_newsletter_creation(self):
        """Test newsletter can be created."""
        newsletter = Newsletter.objects.create(
            subject='Monthly Newsletter - January 2024',
            content='<h1>Newsletter Content</h1>',
            template_id='template_001',
            sent_at=timezone.now(),
            recipient_count=150
        )
        self.assertEqual(newsletter.subject, 'Monthly Newsletter - January 2024')
        self.assertEqual(newsletter.recipient_count, 150)


class CommunicationsAPITest(APITestCase):
    """Test Communications API endpoints."""

    def setUp(self):
        self.admin = Member.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )

    def test_get_announcements(self):
        """Test announcements can be listed."""
        response = self.client.get('/communications/announcements/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_calendar_events(self):
        """Test calendar events can be listed."""
        response = self.client.get('/communications/calendar/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_announcement_unauthorized(self):
        """Test unauthorized users cannot create announcements."""
        response = self.client.post('/communications/announcements/', {
            'title': 'Test Announcement',
            'content': 'Test content',
            'category': 'ADMINISTRATIVE'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_announcement_authorized(self):
        """Test authenticated admin users can create announcements."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/communications/announcements/', {
            'title': 'Test Announcement',
            'content': 'Test content',
            'category': 'ADMINISTRATIVE',
            'status': 'PUBLISHED'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
