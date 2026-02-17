from rest_framework import serializers
from .models import Member, MemberFamily, MemberSkill, MemberContribution, MemberCard


class MemberFamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberFamily
        fields = '__all__'


class MemberSkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberSkill
        fields = '__all__'


class MemberContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberContribution
        fields = '__all__'


class MemberCardSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemberCard
        fields = '__all__'


class MemberSerializer(serializers.ModelSerializer):
    families = MemberFamilySerializer(many=True, read_only=True)
    skills = MemberSkillSerializer(many=True, read_only=True)
    contributions = MemberContributionSerializer(many=True, read_only=True)
    cards = MemberCardSerializer(many=True, read_only=True)

    class Meta:
        model = Member
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'phone', 'sex', 'status', 'postal_code', 'is_staff', 'date_joined',
            'must_change_password',
            'consent_timestamp', 'consent_version', 'data_retention_date',
            'created_at', 'updated_at',
            'families', 'skills', 'contributions', 'cards'
        ]
        read_only_fields = ['id', 'username', 'created_at', 'updated_at']
