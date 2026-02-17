from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Member, MemberFamily, MemberSkill

Member = get_user_model()


class MemberModelTest(TestCase):
    """Test Member model."""

    def setUp(self):
        self.member = Member.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='Test',
            last_name='User',
            postal_code='J6E 2A1'
        )

    def test_member_creation(self):
        """Test member can be created."""
        self.assertEqual(self.member.email, 'test@example.com')
        self.assertEqual(self.member.first_name, 'Test')
        self.assertTrue(self.member.check_password('testpass123'))
        self.assertTrue(len(self.member.username) > 0) # GUID generated

    def test_member_str(self):
        """Test member string representation."""
        expected = f"Test User (test@example.com)"
        self.assertEqual(str(self.member), expected)


class MemberFamilyTest(TestCase):
    """Test MemberFamily model."""

    def setUp(self):
        self.member = Member.objects.create_user(
            email='test@example.com',
            password='testpass123',
            postal_code='J6E 2A1'
        )

    def test_family_member_creation(self):
        """Test family member can be created."""
        family = MemberFamily.objects.create(
            member=self.member,
            relationship='SPOUSE',
            first_name='Jane',
            last_name='Doe'
        )
        self.assertEqual(family.relationship, 'SPOUSE')
        self.assertEqual(family.first_name, 'Jane')


class MemberSkillTest(TestCase):
    """Test MemberSkill model."""

    def setUp(self):
        self.member = Member.objects.create_user(
            email='test@example.com',
            password='testpass123',
            postal_code='J6E 2A1'
        )

    def test_skill_creation(self):
        """Test skill can be added to member."""
        skill = MemberSkill.objects.create(
            member=self.member,
            skill_name='Programming',
            proficiency='Expert'
        )
        self.assertEqual(skill.skill_name, 'Programming')


class MemberAPITest(APITestCase):
    """Test Member API endpoints."""

    def setUp(self):
        self.admin = Member.objects.create_superuser(
            email='admin@example.com',
            password='admin123',
            first_name='Admin',
            last_name='User',
            postal_code='J6E 2A1'
        )
        self.member = Member.objects.create_user(
            email='test@example.com',
            phone='4501234567',
            password='testpass123',
            first_name='Test',
            last_name='User',
            postal_code='J6E 2A1'
        )

    def test_login_email(self):
        """Test user can login with email."""
        response = self.client.post('/api/token-auth/', {
            'username': 'test@example.com',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_login_phone(self):
        """Test user can login with phone."""
        response = self.client.post('/api/token-auth/', {
            'username': '4501234567',
            'password': 'testpass123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('token', response.data)

    def test_phone_validation_success(self):
        """Test valid 10-digit phone."""
        member = Member.objects.create_user(
            email='phone@test.com',
            phone='514 619-4333', # Will be normalized
            password='pass',
            postal_code='J6E 2A1'
        )
        self.assertEqual(member.phone, '5146194333')

    def test_phone_validation_failure_short(self):
        """Test invalid phone length."""
        with self.assertRaises(ValidationError):
            member = Member(
                username='short_phone',
                phone='514619433', # 9 digits
                postal_code='J6E 2A1'
            )
            member.full_clean()

    def test_phone_validation_failure_long(self):
        """Test invalid phone length."""
        with self.assertRaises(ValidationError):
            member = Member(
                username='long_phone',
                phone='51461943333', # 11 digits
                postal_code='J6E 2A1'
            )
            member.full_clean()

    def test_get_members_unauthorized(self):
        """Test unauthorized users cannot access members list."""
        response = self.client.get('/api/members/members/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_members_authorized(self):
        """Test authenticated users can access members list."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.get('/api/members/members/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
