from decimal import Decimal
from typing import Dict, List
# Geen puntjes voor models
from models.boeking import Boeking
# Hier mag 'services' er zelfs helemaal voor of gewoon een puntje blijven,
# maar voor de veiligheid doen we absoluut pad:
from services.boekhoud_regels import BoekhoudValidator


class BoekhoudVerwerking:
    """
    Dit is de motor van het systeem. 
    Hier worden goedgekeurde boekingen verwerkt en saldi bijgewerkt.
    """

    def __init__(self):
        self._grootboek_saldi: Dict[str, Decimal] = {}
        self._alle_boekingen: List[Boeking] = []

    def verwerk_boeking(self, boeking: Boeking):
        BoekhoudValidator.valideer_boeking(boeking)

        self._alle_boekingen.append(boeking)

        for regel in boeking.regels:
            rekening_code = regel.rekening.code
            huidig_saldo = self._grootboek_saldi.get(
                rekening_code, Decimal('0.00'))
            nieuw_saldo = huidig_saldo + regel.saldo
            self._grootboek_saldi[rekening_code] = nieuw_saldo

        print(f"[LOG] Boeking {boeking.boekstuknummer} succesvol verwerkt.")

    def haal_saldo(self, rekening_code: str) -> Decimal:
        return self._grootboek_saldi.get(rekening_code, Decimal('0.00'))
