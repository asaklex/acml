from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status
from decimal import Decimal
from .models import Campaign, Donation, TaxReceipt
from apps.members.models import Member


class CampaignModelTest(TestCase):
    """Test Campaign model."""

    def test_campaign_creation(self):
        """Test campaign can be created."""
        campaign = Campaign.objects.create(
            name='Test Campaign',
            description='A test campaign',
            goal_amount=Decimal('10000.00'),
            is_active=True
        )
        self.assertEqual(campaign.name, 'Test Campaign')
        self.assertEqual(campaign.current_amount, Decimal('0.00'))

    def test_campaign_str(self):
        """Test campaign string representation."""
        campaign = Campaign.objects.create(
            name='Test Campaign',
            goal_amount=Decimal('5000.00')
        )
        self.assertEqual(str(campaign), 'Test Campaign')


class DonationModelTest(TestCase):
    """Test Donation model."""

    def setUp(self):
        self.member = Member.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.campaign = Campaign.objects.create(
            name='Test Campaign',
            goal_amount=Decimal('5000.00')
        )

    def test_donation_creation(self):
        """Test donation can be created."""
        donation = Donation.objects.create(
            member=self.member,
            campaign=self.campaign,
            amount=Decimal('100.00'),
            type='DON_PONCTUEL',
            payment_method='STRIPE',
            status='COMPLETED'
        )
        self.assertEqual(donation.amount, Decimal('100.00'))
        self.assertEqual(donation.status, 'COMPLETED')


class TaxReceiptModelTest(TestCase):
    """Test TaxReceipt model."""

    def setUp(self):
        self.member = Member.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_tax_receipt_creation(self):
        """Test tax receipt can be created."""
        receipt = TaxReceipt.objects.create(
            member=self.member,
            receipt_number='REC-2024-001',
            year=2024,
            total_amount=Decimal('500.00'),
            organization_number='123456789RR0001',
            pdf_path='/receipts/rec-2024-001.pdf'
        )
        self.assertEqual(receipt.year, 2024)
        self.assertEqual(receipt.total_amount, Decimal('500.00'))


class FinanceAPITest(APITestCase):
    """Test Finance API endpoints."""

    def setUp(self):
        self.admin = Member.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='admin123'
        )
        self.campaign = Campaign.objects.create(
            name='Test Campaign',
            goal_amount=Decimal('5000.00')
        )

    def test_get_campaigns(self):
        """Test campaigns can be listed."""
        response = self.client.get('/api/campaigns/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_donation_unauthorized(self):
        """Test unauthorized users cannot create donations."""
        response = self.client.post('/api/donations/', {
            'amount': '100.00',
            'type': 'DON_PONCTUEL',
            'payment_method': 'CASH'
        })
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
