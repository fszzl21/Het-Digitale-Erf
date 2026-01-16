from typing import List, Dict
from decimal import Decimal
from datetime import date
from models.hr_data import UrenRegistratie, VerlofAanvraag, VerlofStatus
from models.medewerker import Medewerker


class HRManager:
    """
    Beheert alles rondom personeel: Uren en Verlof.
    """

    def __init__(self):
        self.medewerkers: Dict[str, Medewerker] = {}
        self.uren_db: List[UrenRegistratie] = []
        self.verlof_db: List[VerlofAanvraag] = []

    def voeg_medewerker_toe(self, mw: Medewerker):
        self.medewerkers[mw.id] = mw

    def registreer_uren(self, uren_regel: UrenRegistratie):
        # Regel 1: Maximaal 24 uur per dag (sanity check)
        if uren_regel.aantal_uren > 24 or uren_regel.aantal_uren <= 0:
            raise ValueError(f"Ongeldig aantal uren: {uren_regel.aantal_uren}")

        # Regel 2: Bestaat de medewerker?
        if uren_regel.medewerker_id not in self.medewerkers:
            raise ValueError(
                f"Onbekende medewerker: {uren_regel.medewerker_id}")

        self.uren_db.append(uren_regel)
        print(
            f"[HR] {uren_regel.aantal_uren}u geschreven door {uren_regel.medewerker_id}.")

    def vraag_verlof_aan(self, aanvraag: VerlofAanvraag):
        mw = self.medewerkers.get(aanvraag.medewerker_id)
        if not mw:
            raise ValueError("Medewerker niet gevonden.")

        # Regel 3: Heb je genoeg saldo?
        if mw.saldo_verlof_uren < aanvraag.totaal_uren:
            raise ValueError(
                f"Te weinig saldo! Huidig: {mw.saldo_verlof_uren}, Nodig: {aanvraag.totaal_uren}")

        self.verlof_db.append(aanvraag)
        print(f"[HR] Verlof aanvraag {aanvraag.aanvraag_id} ontvangen.")

    def keur_verlof_goed(self, aanvraag_id: str):
        # Zoek de aanvraag
        aanvraag = next(
            (v for v in self.verlof_db if v.aanvraag_id == aanvraag_id), None)
        if not aanvraag:
            raise ValueError("Aanvraag niet gevonden")

        if aanvraag.status == VerlofStatus.AANGEVRAAGD:
            mw = self.medewerkers[aanvraag.medewerker_id]

            # Saldo afboeken
            mw.saldo_verlof_uren -= aanvraag.totaal_uren
            aanvraag.status = VerlofStatus.GOEDGEKEURD
            print(
                f"[HR] Verlof {aanvraag_id} goedgekeurd. Nieuw saldo {mw.naam}: {mw.saldo_verlof_uren}")
