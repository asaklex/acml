from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Course, CourseLevel, Student, Attendance
from apps.members.models import Member


class CourseModelTest(TestCase):
    """Test Course model."""

    def setUp(self):
        self.teacher = Member.objects.create_user(
            username='teacher',
            email='teacher@example.com',
            password='testpass123'
        )
        self.course = Course.objects.create(
            teacher=self.teacher,
            name='Arabic 101',
            description='Introduction to Arabic',
            schedule='Saturdays 10:00-12:00',
            current_session='Fall 2024',
            status='ACTIVE'
        )

    def test_course_creation(self):
        """Test course can be created."""
        self.assertEqual(self.course.name, 'Arabic 101')
        self.assertEqual(self.course.teacher, self.teacher)
        self.assertEqual(self.course.status, 'ACTIVE')

    def test_course_str(self):
        """Test course string representation."""
        self.assertEqual(str(self.course), 'Arabic 101')


class CourseLevelTest(TestCase):
    """Test CourseLevel model."""

    def setUp(self):
        self.teacher = Member.objects.create_user(
            username='teacher',
            email='teacher@example.com',
            password='testpass123'
        )
        self.course = Course.objects.create(
            teacher=self.teacher,
            name='Arabic 101'
        )

    def test_level_creation(self):
        """Test course level can be created."""
        level = CourseLevel.objects.create(
            course=self.course,
            name='Beginner',
            order_num=1,
            description='For complete beginners'
        )
        self.assertEqual(level.name, 'Beginner')
        self.assertEqual(level.order_num, 1)


class StudentModelTest(TestCase):
    """Test Student model."""

    def setUp(self):
        from datetime import date
        self.parent = Member.objects.create_user(
            username='parent',
            email='parent@example.com',
            password='testpass123'
        )
        self.teacher = Member.objects.create_user(
            username='teacher',
            email='teacher@example.com',
            password='testpass123'
        )
        self.course = Course.objects.create(
            teacher=self.teacher,
            name='Arabic 101'
        )

    def test_student_creation(self):
        """Test student can be created."""
        from datetime import date
        student = Student.objects.create(
            parent_member=self.parent,
            course=self.course,
            first_name='Ahmed',
            last_name='Ali',
            birth_date=date(2010, 5, 15),
            payment_status='PAID'
        )
        self.assertEqual(student.first_name, 'Ahmed')
        self.assertEqual(student.parent_member, self.parent)


class EducationAPITest(APITestCase):
    """Test Education API endpoints."""

    def setUp(self):
        self.admin = Member.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        self.teacher = Member.objects.create_user(
            username='teacher',
            email='teacher@example.com',
            password='testpass123'
        )
        self.course = Course.objects.create(
            teacher=self.teacher,
            name='Arabic 101'
        )

    def test_get_courses(self):
        """Test courses can be listed."""
        response = self.client.get('/api/courses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_course_unauthorized(self):
        """Test unauthorized users cannot create courses."""
        response = self.client.post('/api/courses/', {
            'name': 'New Course',
            'teacher': self.teacher.id
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
