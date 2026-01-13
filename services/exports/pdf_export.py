from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from typing import List, Dict
import os

def export_to_pdf(title: str, data: List[Dict], filename: str) -> str:
    """
    Exporteert een lijst van dictionaries naar een simpele PDF tabel.
    Geeft het absolute pad terug.
    """
    if not data:
        raise ValueError("Geen data om te exporteren")

    # Zorg ervoor dat de directory bestaat
    directory = os.path.dirname(filename)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)

    # Extensie check
    if not filename.lower().endswith('.pdf'):
        filename += '.pdf'

    doc = SimpleDocTemplate(filename, pagesize=letter)
    elements = []
    
    styles = getSampleStyleSheet()
    
    # Titel
    elements.append(Paragraph(title, styles['Title']))
    elements.append(Spacer(1, 12))

    # Data converteren voor tabel
    # Headers
    headers = list(data[0].keys())
    table_data = [headers]
    
    # Rijen
    for row in data:
        table_data.append([str(row.get(h, '')) for h in headers])

    # Tabel maken
    t = Table(table_data)
    
    # Styling
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    elements.append(t)
    
    doc.build(elements)
    
    return os.path.abspath(filename)
