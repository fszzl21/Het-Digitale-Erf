# Geen puntjes meer!
from models.boeking import Boeking


class BoekhoudValidator:
    """
    Deze class gebruik ik om boekingen te controleren voordat ze de 'database' in gaan.
    Safety first: we willen geen corrupte administratie.
    """

    @staticmethod
    def valideer_boeking(boeking: Boeking):
        if not boeking.regels:
            raise ValueError(
                f"Fout: Boeking {boeking.boekstuknummer} is leeg (geen regels).")

        if not boeking.is_in_balans():
            diff = boeking.totaal_debet() - boeking.totaal_credit()
            raise ValueError(
                f"Boeking {boeking.boekstuknummer} is niet in balans! "
                f"Verschil: {diff} (Debet: {boeking.totaal_debet()} vs Credit: {boeking.totaal_credit()})"
            )

        verwachte_periode = int(boeking.datum.strftime("%Y%m"))
        if boeking.periode != verwachte_periode:
            raise ValueError(
                f"Periode mismatch voor {boeking.boekstuknummer}: "
                f"Datum zegt {verwachte_periode}, maar opgegeven periode is {boeking.periode}."
            )

        return True
