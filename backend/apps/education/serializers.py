from rest_framework import serializers
from .models import Course, CourseLevel, Student, Attendance


class CourseLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourseLevel
        fields = '__all__'


class CourseSerializer(serializers.ModelSerializer):
    levels = CourseLevelSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = '__all__'


class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = '__all__'


class AttendanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attendance
        fields = '__all__'
