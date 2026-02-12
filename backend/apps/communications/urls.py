from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'announcements', views.AnnouncementViewSet)
router.register(r'calendar', views.CalendarEventViewSet)
router.register(r'newsletters', views.NewsletterViewSet)
router.register(r'notifications', views.NotificationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
