from django.contrib import admin
from .models import Course, CourseLevel, Student, Attendance


class CourseLevelInline(admin.TabularInline):
    model = CourseLevel
    extra = 1


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'teacher', 'schedule', 'status')
    list_filter = ('status', 'teacher')
    search_fields = ('name', 'description')
    inlines = [CourseLevelInline]


@admin.register(CourseLevel)
class CourseLevelAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'order_num')
    list_filter = ('course',)


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'course', 'level', 'payment_status')
    list_filter = ('course', 'payment_status')
    search_fields = ('first_name', 'last_name', 'parent_member__email')


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'date', 'status')
    list_filter = ('course', 'date', 'status')
