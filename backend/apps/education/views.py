from rest_framework import viewsets, permissions
from .models import Course, CourseLevel, Student, Attendance
from .serializers import (
    CourseSerializer, CourseLevelSerializer, 
    StudentSerializer, AttendanceSerializer
)


class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['status']


class CourseLevelViewSet(viewsets.ModelViewSet):
    queryset = CourseLevel.objects.all()
    serializer_class = CourseLevelSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.all()
    serializer_class = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(parent_member=self.request.user)


class AttendanceViewSet(viewsets.ModelViewSet):
    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        # Teachers can see attendance for their courses
        return self.queryset.filter(course__teacher=self.request.user)
