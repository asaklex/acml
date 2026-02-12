from rest_framework import serializers
from .models import Campaign, TaxReceipt, Donation


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = '__all__'


class TaxReceiptSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaxReceipt
        fields = '__all__'


class DonationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Donation
        fields = '__all__'
        read_only_fields = ('status', 'receipt_issued')
