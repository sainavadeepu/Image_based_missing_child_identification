import smtplib
import logging
from email.mime.text import MIMEText
from twilio.rest import Client
from config import settings

logger = logging.getLogger(__name__)

def send_email_alert(to_email: str, child_name: str, finder_name: str, finder_phone: str, finder_email: str):
    """Send an email alert using SMTP."""
    if not settings.EMAIL_USER or not settings.EMAIL_PASS:
        logger.warning("Email credentials not configured. Skipping email alert.")
        return

    subject = f"🚨 Possible Match Found for {child_name}!"
    body = f"""A potential match was found for your registered case: {child_name}.

The person who searched for this photo has provided their contact details so you can reach out to them immediately:

📌 Finder's Contact Information:
- Name: {finder_name}
- Phone: {finder_phone}
- Email: {finder_email}

Please contact them as soon as possible, and notify your local authorities if this leads to a successful recovery.
"""
    
    msg = MIMEText(body)
    msg['Subject'] = subject
    msg['From'] = settings.EMAIL_USER
    msg['To'] = to_email

    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(settings.EMAIL_USER, settings.EMAIL_PASS)
            server.send_message(msg)
        logger.info(f"Email alert sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email alert: {e}")

def send_sms_alert(to_number: str):
    """Send an SMS alert using Twilio."""
    if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
        logger.warning("Twilio credentials not configured. Skipping SMS alert.")
        return

    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        message = client.messages.create(
            body="🚨 Match found for your child. Please check your email.",
            from_=settings.TWILIO_PHONE,
            to=to_number
        )
        logger.info(f"SMS alert sent to {to_number}, SID: {message.sid}")
    except Exception as e:
        logger.error(f"Failed to send SMS alert: {e}")
