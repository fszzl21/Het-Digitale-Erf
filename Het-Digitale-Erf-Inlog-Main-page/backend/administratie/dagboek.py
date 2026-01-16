from dataclasses import dataclass
from enum import Enum
from typing import Optional

# De type dagboeken die we gaan ondersteunen in het systeem


class DagboekType(Enum):
    VERKOOP = "Verkoop"
    INKOOP = "Inkoop"
    BANK = "Bank"
    KAS = "Kas"
    MEMORIAAL = "Memoriaal"


@dataclass
class Dagboek:
    code: str           # Korte code, bijv. 'VKB' of 'BNK'
    omschrijving: str   # Duidelijke naam voor in de UI
    type: DagboekType

    # Voor bank/kas is meestal een vaste grootboekrekening gekoppeld (bijv. 1100 Bank)
    # Deze is optioneel (Optional) omdat verkoopboeken dit niet direct nodig hebben
    grootboek_rekening_id: Optional[str] = None

    # Zodat we later makkelijk kan printen en zien welk dagboek het is
    def __str__(self):
        return f"[{self.code}] {self.omschrijving}"
