# isort: skip_file
# fmt: off
import sys
import os
from decimal import Decimal
from datetime import date
from typing import List

# --- PAD FIX (MOET BOVENAAN BLIJVEN) ---
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)
# ---------------------------------------

# DE INTERNE IMPORTS 
from services.rapportage import RapportageEngine
from services.verwerking import BoekhoudVerwerking
from services.hr_manager import HRManager
from models.boeking import Boeking, BoekingsRegel
from models.grootboek import GrootboekRekening, RekeningType, BalansZijde
from models.medewerker import Medewerker
from models.hr_data import UrenRegistratie, VerlofAanvraag, VerlofType

# --- SETUP ---
rekening_schema = [
    GrootboekRekening("1300", "Debiteuren", RekeningType.BALANS, BalansZijde.DEBET),
    GrootboekRekening("1100", "Bank", RekeningType.BALANS, BalansZijde.DEBET),
    GrootboekRekening("1500", "BTW Af te dragen", RekeningType.BALANS, BalansZijde.CREDIT),
    GrootboekRekening("8000", "Omzet", RekeningType.WINST_VERLIES, BalansZijde.CREDIT),
    GrootboekRekening("4000", "Kostprijs Omzet", RekeningType.WINST_VERLIES, BalansZijde.DEBET)
]

verwerking = BoekhoudVerwerking()
rapportage = RapportageEngine(rekening_schema)
hr_systeem = HRManager()

# Test medewerker toevoegen
hr_systeem.voeg_medewerker_toe(Medewerker("EMP01", "Dyami", "Developer"))

# --- API FINANCIEEL ---

def create_verkoop_factuur(klant_naam: str, factuur_nr: str, bedrag_excl: float, btw_bedrag: float):
    d_excl = Decimal(str(bedrag_excl))
    d_btw = Decimal(str(btw_bedrag))
    d_totaal = d_excl + d_btw

    regels = [
        BoekingsRegel(next(r for r in rekening_schema if r.code == "1300"), f"Factuur {factuur_nr}", bedrag_debet=d_totaal),
        BoekingsRegel(next(r for r in rekening_schema if r.code == "8000"), f"Omzet {factuur_nr}", bedrag_credit=d_excl),
        BoekingsRegel(next(r for r in rekening_schema if r.code == "1500"), "BTW 21%", bedrag_credit=d_btw)
    ]

    nieuwe_boeking = Boeking(
        boekstuknummer=factuur_nr,
        datum=date.today(),
        periode=int(date.today().strftime("%Y%m")),
        dagboek_code="VKB",
        regels=regels
    )

    try:
        verwerking.verwerk_boeking(nieuwe_boeking)
        return {"status": "success", "msg": f"Factuur {factuur_nr} verwerkt."}
    except ValueError as e:
        return {"status": "error", "msg": str(e)}

def get_financieel_overzicht():
    saldi = verwerking._grootboek_saldi
    return {
        "balans": rapportage.genereer_balans(saldi),
        "wv": rapportage.genereer_winst_verlies(saldi)
    }

# --- API HR ---

def registreer_uren(medewerker_id: str, uren: float, project: str):
    try:
        regel = UrenRegistratie(
            medewerker_id=medewerker_id,
            datum=date.today(),
            aantal_uren=Decimal(str(uren)),
            omschrijving=f"Werk aan {project}",
            project_code=project
        )
        hr_systeem.registreer_uren(regel)
        return {"status": "success", "msg": "Uren opgeslagen"}
    except ValueError as e:
        return {"status": "error", "msg": str(e)}

def vraag_vakantie_aan(medewerker_id: str, uren_nodig: float):
    try:
        req_id = f"REQ-{len(hr_systeem.verlof_db) + 1}"
        aanvraag = VerlofAanvraag(
            aanvraag_id=req_id,
            medewerker_id=medewerker_id,
            start_datum=date.today(),
            eind_datum=date.today(),
            totaal_uren=uren_nodig,
            type=VerlofType.VAKANTIE
        )
        hr_systeem.vraag_verlof_aan(aanvraag)
        hr_systeem.keur_verlof_goed(req_id)
        return {"status": "success", "msg": f"Vakantie {req_id} aangevraagd en goedgekeurd."}
    except ValueError as e:
        return {"status": "error", "msg": str(e)}

# --- TEST ---
if __name__ == "__main__":
    print("--- START TEST FINANCIEEL ---")
    create_verkoop_factuur("Klant A", "2025-001", 1000.00, 210.00)

    print("\n--- START TEST HR ---")
    print(registreer_uren("EMP01", 8.5, "Administratie Module"))
    print(vraag_vakantie_aan("EMP01", 16.0))