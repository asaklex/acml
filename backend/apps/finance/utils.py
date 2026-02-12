from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO

def generate_receipt_pdf(donation):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    
    elements = []
    
    # Organization Header
    title_style = styles['Title']
    elements.append(Paragraph("ACML - Reçu Officiel de Don", title_style))
    elements.append(Spacer(1, 12))
    
    elements.append(Paragraph("Association Communautaire des Musulmans de Laval", styles['Normal']))
    elements.append(Paragraph("123 Rue Principale, Laval, QC H7X 1Y1", styles['Normal']))
    elements.append(Paragraph("NE: 123456789 RR 0001", styles['Normal']))
    elements.append(Spacer(1, 24))

    # Receipt Info
    receipt_data = [
        ["Numéro de reçu", f"R-{str(donation.id)[:8].upper()}"],
        ["Date du don", donation.donated_at.strftime('%Y-%m-%d')],
        ["Date d'émission", donation.donated_at.strftime('%Y-%m-%d')],
        ["Lieu d'émission", "Laval, QC"],
    ]
    
    receipt_table = Table(receipt_data, colWidths=[150, 300])
    receipt_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    elements.append(receipt_table)
    elements.append(Spacer(1, 24))

    # Donor Info
    elements.append(Paragraph("Donateur:", styles['Heading3']))
    donor_info = []
    if donation.member:
        donor_info.append(f"{donation.member.first_name} {donation.member.last_name}")
        donor_info.append(donation.member.email)
    else:
        donor_info.append("Donateur anonyme")
        
    for line in donor_info:
        elements.append(Paragraph(line, styles['Normal']))
        
    elements.append(Spacer(1, 24))
    
    # Amount Details
    amount_data = [
        ["Montant admissible du don aux fins de l'impôt", f"{donation.amount} {donation.currency}"]
    ]
    
    amount_table = Table(amount_data, colWidths=[300, 150])
    amount_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 12),
        ('BOX', (0, 0), (-1, -1), 1, colors.black),
        ('PADDING', (0, 0), (-1, -1), 12),
        ('ALIGN', (1, 0), (1, 0), 'RIGHT'),
    ]))
    elements.append(amount_table)
    elements.append(Spacer(1, 36))
    
    # Signature
    elements.append(Paragraph("Signature autorisée:", styles['Normal']))
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("_" * 40, styles['Normal']))
    elements.append(Paragraph("Trésorier", styles['Normal']))
    
    elements.append(Spacer(1, 24))
    elements.append(Paragraph("Reçu officiel aux fins de l'impôt sur le revenu. SVP conserver pour vos dossiers.", styles['Italic']))

    doc.build(elements)
    buffer.seek(0)
    return buffer
