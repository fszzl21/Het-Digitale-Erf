from dataclasses import dataclass
from enum import Enum

# 1. Enums dwingen vaste keuzes af (voorkomt typefouten in team)


class RekeningType(Enum):
    BALANS = "Balans"
    WINST_VERLIES = "Winst & Verlies"


class BalansZijde(Enum):
    DEBET = "Debet"   # Bezittingen, Kosten
    CREDIT = "Credit"  # Schulden, Opbrengsten, Eigen Vermogen

# 2. De Data Class (object)


@dataclass
class GrootboekRekening:
    code: str            # String, want soms wil je '0100' behouden
    naam: str            # Bijv. 'Omzet Hoog'
    type: RekeningType
    standaard_zijde: BalansZijde

    def __str__(self):
        return f"{self.code} - {self.naam}"
