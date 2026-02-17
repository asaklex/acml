from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Member, MemberFamily, MemberSkill, MemberContribution, MemberCard
from .serializers import (
    MemberSerializer, MemberFamilySerializer, MemberSkillSerializer,
    MemberContributionSerializer, MemberCardSerializer
)


class MemberViewSet(viewsets.ModelViewSet):
    queryset = Member.objects.all().prefetch_related('families', 'skills', 'contributions', 'cards')
    serializer_class = MemberSerializer
    permission_classes = [permissions.IsAuthenticated]
    search_fields = ['first_name', 'last_name', 'email', 'phone']
    filterset_fields = ['status', 'sex', 'postal_code']

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        # Filter secure fields
        data = request.data.copy()
        data.pop('is_staff', None)
        data.pop('is_superuser', None)
        data.pop('status', None)
        data.pop('must_change_password', None)
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        
        # Self-registered users set their own password, no need for mandatory change
        user = serializer.save(must_change_password=False)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def change_password(self, request):
        user = request.user
        new_password = request.data.get('password')
        if not new_password:
            return Response({'detail': 'Le mot de passe est requis.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user.set_password(new_password)
        user.must_change_password = False
        user.save()
        return Response({'detail': 'Mot de passe mis à jour avec succès.'})

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def approve(self, request, pk=None):
        member = self.get_object()
        member.status = Member.Status.ACTIVE
        member.save()
        return Response({'detail': f'Membre {member.first_name} {member.last_name} approuvé avec succès.'})


class MemberFamilyViewSet(viewsets.ModelViewSet):
    queryset = MemberFamily.objects.all()
    serializer_class = MemberFamilySerializer
    permission_classes = [permissions.IsAuthenticated]


class MemberSkillViewSet(viewsets.ModelViewSet):
    queryset = MemberSkill.objects.all()
    serializer_class = MemberSkillSerializer
    permission_classes = [permissions.IsAuthenticated]


class MemberContributionViewSet(viewsets.ModelViewSet):
    queryset = MemberContribution.objects.all()
    serializer_class = MemberContributionSerializer
    permission_classes = [permissions.IsAuthenticated]


class MemberCardViewSet(viewsets.ModelViewSet):
    queryset = MemberCard.objects.all()
    serializer_class = MemberCardSerializer
    permission_classes = [permissions.IsAuthenticated]
