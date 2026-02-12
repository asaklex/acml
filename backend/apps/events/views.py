from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Event, EventRegistration, EventPhoto, EventFeedback
from .serializers import (
    EventSerializer, EventRegistrationSerializer, 
    EventPhotoSerializer, EventFeedbackSerializer
)
import uuid


class EventViewSet(viewsets.ModelViewSet):
    queryset = Event.objects.all()
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['status']

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register(self, request, pk=None):
        event = self.get_object()
        if event.status != Event.Status.OPEN:
            return Response({'error': 'L\'événement n\'est pas ouvert aux inscriptions.'}, status=status.HTTP_400_BAD_REQUEST)
        
        if event.max_capacity and event.current_registrations >= event.max_capacity:
            return Response({'error': 'L\'événement est complet.'}, status=status.HTTP_400_BAD_REQUEST)
        
        registration, created = EventRegistration.objects.get_or_create(
            event=event,
            member=request.user,
            defaults={'barcode': f"{event.barcode_prefix}-{uuid.uuid4().hex[:8].upper()}"}
        )
        
        if not created:
            return Response({'error': 'Vous êtes déjà inscrit à cet événement.'}, status=status.HTTP_400_BAD_REQUEST)
        
        event.current_registrations += 1
        event.save()
        
        serializer = EventRegistrationSerializer(registration)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class EventRegistrationViewSet(viewsets.ModelViewSet):
    queryset = EventRegistration.objects.all()
    serializer_class = EventRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(member=self.request.user)


class EventPhotoViewSet(viewsets.ModelViewSet):
    queryset = EventPhoto.objects.all()
    serializer_class = EventPhotoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]


class EventFeedbackViewSet(viewsets.ModelViewSet):
    queryset = EventFeedback.objects.all()
    serializer_class = EventFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(member=self.request.user)
