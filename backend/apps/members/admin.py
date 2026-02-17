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
    list_display = ('username', 'email', 'phone', 'first_name', 'last_name', 'status', 'is_staff')
    list_filter = ('status', 'sex', 'is_staff', 'is_superuser')
    ordering = ('username',)
    readonly_fields = ('username',)
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Informations personnelles', {'fields': ('first_name', 'last_name', 'email', 'phone', 'sex', 'postal_code', 'status', 'must_change_password')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Conformité Loi 25', {'fields': ('consent_timestamp', 'consent_version', 'data_retention_date')}),
        ('Dates importantes', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'phone', 'sex', 'postal_code', 'password'),
        }),
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
