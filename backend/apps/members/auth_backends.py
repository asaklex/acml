from django.contrib.auth.backends import ModelBackend
from django.db.models import Q
from .models import Member


class EmailOrPhoneBackend(ModelBackend):
    """
    Authenticate against Member model using email or phone number.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None:
            username = kwargs.get(Member.USERNAME_FIELD)
        
        try:
            # Check for email or phone
            user = Member.objects.get(Q(email=username) | Q(phone=username))
            if user.check_password(password) and self.user_can_authenticate(user):
                return user
        except Member.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return Member.objects.get(pk=user_id)
        except Member.DoesNotExist:
            return None
