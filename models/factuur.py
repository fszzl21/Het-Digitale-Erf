from dataclasses import dataclass
from datetime import date
from decimal import Decimal

@dataclass
class Factuur:
    bestandspad: str
    datum: date
    omschrijving: str
    # Optioneel: bedrag, relatie, etc. kan later worden toegevoegd
    id: str = ""  # Wordt later gegenereerd
