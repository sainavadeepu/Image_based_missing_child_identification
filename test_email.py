import smtplib
from email.mime.text import MIMEText
import sys

try:
    msg = MIMEText('Test email from backend')
    msg['Subject'] = 'Test'
    msg['From'] = 'potnuruvenkatdileep@gmail.com'
    msg['To'] = 'potnuruvenkatdileep@gmail.com'

    server = smtplib.SMTP_SSL('smtp.gmail.com', 465)
    server.login('potnuruvenkatdileep@gmail.com', 'mxtivgqkjmmatchx')
    server.send_message(msg)
    print("SUCCESS_SEND_EMAIL")
except Exception as e:
    print(f"SMTP_ERROR: {type(e).__name__} - {str(e)}")
    sys.exit(1)
