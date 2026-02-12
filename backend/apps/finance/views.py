from rest_framework import viewsets, permissions
from .models import Campaign, TaxReceipt, Donation
from .models import Campaign, TaxReceipt, Donation
from .serializers import CampaignSerializer, TaxReceiptSerializer, DonationSerializer
from .utils import generate_receipt_pdf
from django.http import HttpResponse
from rest_framework.decorators import action
from rest_framework.response import Response


class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['is_active']


class TaxReceiptViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TaxReceipt.objects.all()
    serializer_class = TaxReceiptSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(member=self.request.user)


class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.all()
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(member=self.request.user)
    
    
    def perform_create(self, serializer):
        serializer.save(member=self.request.user)

    @action(detail=True, methods=['get'])
    def download_receipt(self, request, pk=None):
        donation = self.get_object()
        
        # Only allow receipt download for completed donations
        if donation.status != 'COMPLETED':
             return Response({"detail": "Le reçu n'est disponible que pour les dons complétés."}, status=400)
             
        pdf_buffer = generate_receipt_pdf(donation)
        response = HttpResponse(pdf_buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="recu_don_{donation.id}.pdf"'
        return response
