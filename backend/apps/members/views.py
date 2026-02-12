from rest_framework import viewsets, permissions
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
    filterset_fields = ['status', 'gender', 'membership_type']


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
