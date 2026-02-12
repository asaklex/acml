from django.contrib import admin
from .models import Resource, Reservation


@admin.register(Resource)
class ResourceAdmin(admin.ModelAdmin):
    list_display = ('name', 'type', 'capacity', 'is_available')
    list_filter = ('type', 'is_available')
    search_fields = ('name', 'description')


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ('resource', 'member', 'start_time', 'end_time', 'status')
    list_filter = ('status', 'start_time', 'resource')
    search_fields = ('member__email', 'notes')
