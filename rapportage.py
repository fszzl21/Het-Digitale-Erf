from decimal import Decimal
from typing import List, Dict
# Absolute import (zodat het altijd werkt)
from models.grootboek import GrootboekRekening, RekeningType, BalansZijde


class RapportageEngine:
    """
    Deze class genereert de financiële overzichten.
    Hij pakt de rauwe data en maakt er leesbare management info van.
    """

    def __init__(self, rekeningschema: List[GrootboekRekening]):
        self.rekeningschema = {r.code: r for r in rekeningschema}

    def genereer_balans(self, saldi: Dict[str, Decimal]):
        """Geeft de balans terug (Bezittingen vs Schulden)"""
        activa = Decimal('0.00')
        passiva = Decimal('0.00')
        details = []

        print("--- BALANS RAPPORT ---")
        for code, saldo in saldi.items():
            rekening = self.rekeningschema.get(code)

            if rekening and rekening.type == RekeningType.BALANS:
                # Als Credit rekening is (Passiva), is  saldo in de database negatief.
                # Voor weergave een positief getal met abs().
                weergave_saldo = abs(saldo)

                if rekening.standaard_zijde == BalansZijde.DEBET:
                    activa += saldo  # Debet is al positief
                else:
                    passiva += weergave_saldo  # Credit tellen we nu positief op

                details.append(f"{rekening.naam}: € {weergave_saldo:.2f}")

        return {
            "totaal_activa": activa,
            "totaal_passiva": passiva,
            "details": details,
            # Ze zijn in evenwicht als ze gelijk zijn (nu we passiva positief hebben gemaakt)
            "in_evenwicht": activa == passiva
        }

    def genereer_winst_verlies(self, saldi: Dict[str, Decimal]):
        """Geeft de W&V terug (Omzet vs Kosten)"""
        omzet = Decimal('0.00')
        kosten = Decimal('0.00')

        print("--- WINST & VERLIES RAPPORT ---")
        for code, saldo in saldi.items():
            rekening = self.rekeningschema.get(code)

            if rekening and rekening.type == RekeningType.WINST_VERLIES:
                # Credit op W&V is Omzet. In DB is dit negatief.
                # We draaien het om (* -1) of gebruiken abs() voor weergave.
                if rekening.standaard_zijde == BalansZijde.CREDIT:
                    omzet += abs(saldo)
                else:
                    kosten += saldo

        resultaat = omzet - kosten
        return {
            "omzet": omzet,
            "kosten": kosten,
            "resultaat": resultaat  # Nu is dit een positief getal!
        }
