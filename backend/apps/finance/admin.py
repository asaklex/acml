from django.contrib import admin
from .models import Campaign, TaxReceipt, Donation


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('name', 'goal_amount', 'current_amount', 'end_date', 'is_active')
    list_filter = ('is_active', 'end_date')
    search_fields = ('name', 'description')


@admin.register(TaxReceipt)
class TaxReceiptAdmin(admin.ModelAdmin):
    list_display = ('receipt_number', 'member', 'year', 'total_amount', 'issued_at')
    list_filter = ('year', 'issued_at')
    search_fields = ('receipt_number', 'member__email', 'member__first_name', 'member__last_name')


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = ('member', 'amount', 'type', 'payment_method', 'status', 'donated_at')
    list_filter = ('type', 'payment_method', 'status', 'donated_at')
    search_fields = ('member__email', 'payment_id')
