from dataclasses import dataclass, field
from decimal import Decimal
from datetime import date
from typing import List
from .grootboek import GrootboekRekening


@dataclass
class BoekingsRegel:
    rekening: GrootboekRekening
    omschrijving: str
    # Gebruik van Decimal ipv float omdat we met geld werken.
    # Floats geven afrondingsfouten (0.1 + 0.2 != 0.3), Decimals zijn exact.
    bedrag_debet: Decimal = Decimal('0.00')
    bedrag_credit: Decimal = Decimal('0.00')

    @property
    def saldo(self) -> Decimal:
        # Positief is debet, negatief is credit.
        # Handig om te checken of totaal 0 is.
        return self.bedrag_debet - self.bedrag_credit


@dataclass
class Boeking:
    boekstuknummer: str      # Uniek ID, bijv. '2025-001'
    datum: date
    periode: int             # Formaat YYYYMM, bijv. 202501
    dagboek_code: str        # Koppeling naar welk dagboek dit hoort (VKB/INK)

    # Een boeking bestaat uit een lijst met regels
    regels: List[BoekingsRegel] = field(default_factory=list)

    def totaal_debet(self) -> Decimal:
        return sum(r.bedrag_debet for r in self.regels)

    def totaal_credit(self) -> Decimal:
        return sum(r.bedrag_credit for r in self.regels)

    def is_in_balans(self) -> bool:
        # Debet moet gelijk zijn aan Credit
        return self.totaal_debet() == self.totaal_credit()
