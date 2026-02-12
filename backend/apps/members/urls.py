from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'members', views.MemberViewSet)
router.register(r'families', views.MemberFamilyViewSet)
router.register(r'skills', views.MemberSkillViewSet)
router.register(r'contributions', views.MemberContributionViewSet)
router.register(r'cards', views.MemberCardViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
