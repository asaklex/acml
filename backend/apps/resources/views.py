from rest_framework import viewsets, permissions
from .models import Resource, Reservation
from .serializers import ResourceSerializer, ReservationSerializer


class ResourceViewSet(viewsets.ModelViewSet):
    queryset = Resource.objects.all()
    serializer_class = ResourceSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filterset_fields = ['type', 'is_available']


class ReservationViewSet(viewsets.ModelViewSet):
    queryset = Reservation.objects.all()
    serializer_class = ReservationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return self.queryset
        return self.queryset.filter(member=self.request.user)

    def perform_create(self, serializer):
        serializer.save(member=self.request.user)
