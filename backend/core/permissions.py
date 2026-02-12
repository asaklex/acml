"""
Role-Based Access Control (RBAC) permissions for ACML Platform.
"""
from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Only authenticated admin users can access."""
    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class IsSuperuser(BasePermission):
    """Only superusers can access."""
    def has_permission(self, request, view):
        return request.user and request.user.is_superuser


class IsTreasurer(BasePermission):
    """Only users in Treasurer group can access."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.groups.filter(name='Treasurer').exists()
        )


class IsTeacher(BasePermission):
    """Only users in Teacher group can access."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.groups.filter(name='Teacher').exists()
        )


class IsEventManager(BasePermission):
    """Only users in Event Manager group can access."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.groups.filter(name='EventManager').exists()
        )


class IsOwnerOrAdmin(BasePermission):
    """Object owner or admin can access."""
    def has_object_permission(self, request, view, obj):
        # Admin users have full access
        if request.user.is_staff:
            return True

        # Check if object has a member/user field
        if hasattr(obj, 'member'):
            return obj.member == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'created_by'):
            return obj.created_by == request.user

        # Direct object comparison
        return obj == request.user


class IsOwnerOrAdminOrTreasurer(BasePermission):
    """Owner, admin, or treasurer can access (for financial data)."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admin users have full access
        if request.user.is_staff:
            return True

        # Treasurers have access
        if request.user.groups.filter(name='Treasurer').exists():
            return True

        # Check ownership
        if hasattr(obj, 'member'):
            return obj.member == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user

        return obj == request.user


class IsReadOnly(BasePermission):
    """Allow read-only access to any authenticated user."""
    def has_permission(self, request, view):
        return request.method in ['GET', 'HEAD', 'OPTIONS'] and request.user.is_authenticated


class IsActiveMember(BasePermission):
    """Only active members can access."""
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            hasattr(request.user, 'status') and
            request.user.status == 'ACTIVE'
        )
