from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone
from .models import Notification, Newsletter
from apps.members.models import Member


@shared_task
def send_notification_email(notification_id):
    """Send an email notification."""
    try:
        notification = Notification.objects.get(id=notification_id)
        send_mail(
            subject=notification.subject,
            message=notification.content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[notification.member.email],
            fail_silently=False,
        )
        notification.status = Notification.Status.SENT
        notification.sent_at = timezone.now()
        notification.save()
    except Exception as e:
        notification.status = Notification.Status.FAILED
        notification.error_message = str(e)
        notification.save()


@shared_task
def send_bulk_newsletter(newsletter_id):
    """Send a newsletter to all active members."""
    from apps.members.models import Member
    
    newsletter = Newsletter.objects.get(id=newsletter_id)
    active_members = Member.objects.filter(status='ACTIVE')
    
    count = 0
    for member in active_members:
        # In a real app, use a proper email service with batching
        send_mail(
            subject=newsletter.subject,
            message=newsletter.content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[member.email],
            fail_silently=True,
        )
        count += 1
    
    newsletter.sent_at = timezone.now()
    newsletter.recipient_count = count
    newsletter.save()
