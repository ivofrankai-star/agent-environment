---
name: email-with-attachments
description: Send emails with file attachments using Python smtplib. Use this when you need to send files (PDFs, images, etc.) as email attachments.
version: 1.0.0
author: hermes
license: MIT
---

# Email with Attachments

## Problem
Himalaya CLI does NOT support sending attachments - it can only send plain text emails. Using himalaya for attachments will result in multiple incomplete emails being sent.

## Solution: Python smtplib

### Prerequisites
- Gmail account with App Password (not regular password)
- Python 3 with smtplib (built-in)

### Steps

1. **Prepare files first** (e.g., convert to PDF with pandoc)
2. **Create Python script**
3. **Send ONE email with ALL attachments**

### Example Script

```python
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders

# Email setup
sender = "your_email@gmail.com"
password = "your_app_password_here"  # 16-char App Password
receiver = "recipient@example.com"

# Create message
msg = MIMEMultipart()
msg['From'] = sender
msg['To'] = receiver
msg['Subject'] = "Subject here"

body = "Email body text"
msg.attach(MIMEText(body, 'plain'))

# Attach files
files = [
    ('/path/to/file1.pdf', 'file1.pdf'),
    ('/path/to/file2.pdf', 'file2.pdf'),
]

for filepath, filename in files:
    with open(filepath, 'rb') as f:
        part = MIMEBase('application', 'pdf')
        part.set_payload(f.read())
        encoders.encode_base64(part)
        part.add_header('Content-Disposition', f'attachment; filename="{filename}"')
        msg.attach(part)

# Send
server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
server.login(sender, password)
server.send_message(msg)
server.quit()
```

### PDF Conversion with Pandoc

```bash
# Install pandoc and LaTeX
sudo apt-get install -y pandoc texlive-latex-base texlive-fonts-recommended texlive-latex-extra

# Convert text to PDF
pandoc input.txt -o output.pdf --pdf-engine=pdflatex -V geometry:margin=2.5cm

# Note: Unicode characters (like ₂) may cause errors
# Fix: sed -i 's/₂/2/g' file.txt
```

## Workflow Checklist

1. [ ] Generate all files (PDFs, images, etc.)
2. [ ] Verify all files exist
3. [ ] Create Python script with all attachments
4. [ ] Send ONE email
5. [ ] Verify in inbox

## Common Issues

- **Unicode errors**: Replace special chars with ASCII equivalents
- **Missing LaTeX packages**: Install texlive-latex-extra
- **Multiple emails sent**: Don't use himalaya for attachments
