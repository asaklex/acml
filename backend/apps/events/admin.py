from django.contrib import admin
from .models import Event, EventRegistration, EventPhoto, EventFeedback


class EventPhotoInline(admin.TabularInline):
    model = EventPhoto
    extra = 1


class EventRegistrationInline(admin.TabularInline):
    model = EventRegistration
    extra = 0
    readonly_fields = ('registered_at',)


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'start_date', 'status', 'current_registrations', 'max_capacity')
    list_filter = ('status', 'start_date')
    search_fields = ('title', 'location')
    inlines = [EventPhotoInline, EventRegistrationInline]


@admin.register(EventRegistration)
class EventRegistrationAdmin(admin.ModelAdmin):
    list_display = ('member', 'event', 'status', 'registered_at', 'checked_in_at')
    list_filter = ('status', 'registered_at', 'event')
    search_fields = ('member__email', 'barcode')


@admin.register(EventPhoto)
class EventPhotoAdmin(admin.ModelAdmin):
    list_display = ('event', 'caption', 'uploaded_at')


@admin.register(EventFeedback)
class EventFeedbackAdmin(admin.ModelAdmin):
    list_display = ('event', 'member', 'rating', 'created_at')
    list_filter = ('rating', 'event')
