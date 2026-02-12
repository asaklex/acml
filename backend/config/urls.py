from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from apps.members.auth_views import CustomAuthToken

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/token-auth/', CustomAuthToken.as_view()),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    
    # Apps
    path('api/members/', include('apps.members.urls')),
    path('api/communications/', include('apps.communications.urls')),
    path('api/events/', include('apps.events.urls')),
    path('api/finance/', include('apps.finance.urls')),
    path('api/education/', include('apps.education.urls')),
    path('api/resources/', include('apps.resources.urls')),
]
