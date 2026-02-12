from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'campaigns', views.CampaignViewSet)
router.register(r'receipts', views.TaxReceiptViewSet)
router.register(r'donations', views.DonationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
