"""
Utility functions for ACML Platform.
"""
import barcode
import barcode.writer
from io import BytesIO
from django.core.files import File
from PIL import Image
import qrcode
from datetime import date
from decimal import Decimal


def generate_barcode(code: str, prefix: str = 'ACML') -> str:
    """
    Generate a unique barcode for events/registrations.
    Format: PREFIX-TIMESTAMP-RANDOM
    """
    import time
    import random
    import string

    timestamp = int(time.time())
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"{prefix}-{timestamp}-{random_str}"


def generate_barcode_image(code: str, output_path: str) -> None:
    """
    Generate a Code128 barcode image.
    """
    code128_class = barcode.get_barcode_class('code128')
    code128 = code128_class(code, writer=barcode.writer.ImageWriter())
    code128.save(output_path)


def generate_qr_code(data: str, output_path: str) -> None:
    """
    Generate a QR code image.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")
    img.save(output_path)


def calculate_tax_receipt_amount(donations: list) -> tuple[Decimal, bool]:
    """
    Calculate total eligible amount for tax receipts.
    Returns (total_amount, is_eligible).
    """
    total = sum(d.amount for d in donations if d.status == 'COMPLETED')
    # In Canada, donations must be > $20 to get official receipt
    # But can accumulate over the year
    return total, total > Decimal('20.00')


def generate_receipt_number(member_id: str, year: int) -> str:
    """
    Generate a unique tax receipt number.
    Format: RECEIPT-YEAR-MEMBER_ID
    """
    return f"REC-{year}-{str(member_id)[:8].upper()}"


def validate_quebec_postal_code(postal_code: str) -> bool:
    """
    Validate Quebec postal code format.
    """
    import re
    # Canadian postal code format: A1A 1A1
    pattern = r'^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$'
    return bool(re.match(pattern, postal_code))


def get_financial_year_start() -> date:
    """
    Get the start of the current financial year.
    For Canadian tax purposes, usually Jan 1.
    """
    return date(date.today().year, 1, 1)


def get_financial_year_end() -> date:
    """
    Get the end of the current financial year.
    For Canadian tax purposes, usually Dec 31.
    """
    return date(date.today().year, 12, 31)


def send_notification_email(member_email: str, subject: str, message: str) -> bool:
    """
    Send notification email to a member.
    """
    from django.core.mail import send_mail
    from django.conf import settings

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[member_email],
            fail_silently=False,
        )
        return True
    except Exception:
        return False


def send_notification_sms(phone_number: str, message: str) -> bool:
    """
    Send SMS notification via Twilio.
    """
    try:
        from django.conf import settings
        from twilio.rest import Client

        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(
            body=message,
            from_=settings.TWILIO_PHONE_NUMBER,
            to=phone_number
        )
        return True
    except Exception:
        return False


def check_law25_retention(member) -> bool:
    """
    Check if member's data should be retained per Law 25.
    Returns True if data should be retained, False if it can be deleted.
    """
    if not member.data_retention_date:
        return True

    from django.utils import timezone
    return timezone.now().date() <= member.data_retention_date


def anonymize_member_data(member) -> None:
    """
    Anonymize member data for privacy compliance.
    """
    import uuid
    from django.utils import timezone

    member.email = f"deleted_{uuid.uuid4().hex[:8]}@anonymous.local"
    member.first_name = "Deleted"
    member.last_name = "Member"
    member.phone = ""
    member.is_deleted = True
    member.deleted_at = timezone.now()
    member.save()
