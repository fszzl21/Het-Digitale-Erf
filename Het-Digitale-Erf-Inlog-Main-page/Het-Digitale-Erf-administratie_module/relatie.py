from dataclasses import dataclass
from enum import Enum
from typing import Optional

# maakt onderscheid tussen Klanten en Leveranciers,
# soms kan een partij beide zijn (daarom de optie 'BEIDE').


class RelatieType(Enum):
    KLANT = "Klant"             # Debiteur
    LEVERANCIER = "Leverancier"  # Crediteur
    BEIDE = "Beide"


@dataclass
class Relatie:
    code: str           # Unieke code, bijv. 'REL001'
    bedrijfsnaam: str
    type: RelatieType

    # Contactgegevens (optioneel), handig als we later facturen willen mailen
    email: Optional[str] = None
    btw_nummer: Optional[str] = None

    # Default betalingstermijn in dagen (standaard op 30 gezet voor nu)
    betalingstermijn_dagen: int = 30

    def is_debiteur(self) -> bool:
        # Check of ik geld van deze partij krijg
        return self.type in [RelatieType.KLANT, RelatieType.BEIDE]

    def is_crediteur(self) -> bool:
        # Check of ik geld aan deze partij moet betalen
        return self.type in [RelatieType.LEVERANCIER, RelatieType.BEIDE]
