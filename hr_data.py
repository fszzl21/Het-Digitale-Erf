from dataclasses import dataclass
from datetime import date
from enum import Enum
from decimal import Decimal


class VerlofStatus(Enum):
    AANGEVRAAGD = "Aangevraagd"
    GOEDGEKEURD = "Goedgekeurd"
    AFGEWEZEN = "Afgewezen"


class VerlofType(Enum):
    VAKANTIE = "Vakantie"
    ZIEKTE = "Ziekte"
    OVERIG = "Overig"


@dataclass
class UrenRegistratie:
    medewerker_id: str
    datum: date
    aantal_uren: Decimal
    omschrijving: str
    project_code: str = "ALGEMEEN"


@dataclass
class VerlofAanvraag:
    aanvraag_id: str
    medewerker_id: str
    start_datum: date
    eind_datum: date
    totaal_uren: float
    type: VerlofType
    status: VerlofStatus = VerlofStatus.AANGEVRAAGD
