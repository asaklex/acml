from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'events', views.EventViewSet)
router.register(r'registrations', views.EventRegistrationViewSet)
router.register(r'photos', views.EventPhotoViewSet)
router.register(r'feedback', views.EventFeedbackViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
