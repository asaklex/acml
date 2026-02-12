from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Member, MemberFamily, MemberSkill, MemberContribution, MemberCard


class MemberFamilyInline(admin.TabularInline):
    model = MemberFamily
    fk_name = 'member'
    extra = 1


class MemberSkillInline(admin.TabularInline):
    model = MemberSkill
    extra = 1


class MemberContributionInline(admin.TabularInline):
    model = MemberContribution
    extra = 1


@admin.register(Member)
class MemberAdmin(UserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'status', 'is_staff')
    list_filter = ('status', 'gender', 'membership_type', 'is_staff', 'is_superuser')
    fieldsets = UserAdmin.fieldsets + (
        ('Informations ACML', {'fields': ('phone', 'gender', 'status', 'membership_type')}),
        ('Conformité Loi 25', {'fields': ('consent_timestamp', 'consent_version', 'data_retention_date')}),
    )
    inlines = [MemberFamilyInline, MemberSkillInline, MemberContributionInline]


@admin.register(MemberFamily)
class MemberFamilyAdmin(admin.ModelAdmin):
    list_display = ('member', 'relationship', 'first_name', 'last_name')


@admin.register(MemberSkill)
class MemberSkillAdmin(admin.ModelAdmin):
    list_display = ('member', 'skill_name', 'proficiency')


@admin.register(MemberContribution)
class MemberContributionAdmin(admin.ModelAdmin):
    list_display = ('member', 'type', 'amount', 'hours', 'contributed_at')
    list_filter = ('type', 'contributed_at')


@admin.register(MemberCard)
class MemberCardAdmin(admin.ModelAdmin):
    list_display = ('member', 'card_number', 'year', 'expires_at')
