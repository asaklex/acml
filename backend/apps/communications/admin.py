from django.contrib import admin
from .models import Announcement, CalendarEvent, Newsletter, Notification


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'status', 'published_at')
    list_filter = ('category', 'status', 'published_at')
    search_fields = ('title', 'content')


@admin.register(CalendarEvent)
class CalendarEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'category', 'start_time', 'end_time', 'location')
    list_filter = ('category', 'start_time')
    search_fields = ('title', 'description')


@admin.register(Newsletter)
class NewsletterAdmin(admin.ModelAdmin):
    list_display = ('subject', 'sent_at', 'recipient_count')
    search_fields = ('subject', 'content')


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('member', 'channel', 'subject', 'status', 'sent_at')
    list_filter = ('channel', 'status', 'sent_at')
    readonly_fields = ('sent_at',)
