import os
import shutil
from datetime import date
from typing import List
from models.factuur import Factuur
from services.exports.excel_export import export_to_excel
from services.exports.pdf_export import export_to_pdf

class FactuurManager:
    """
    Beheert het ontvangen en opslaan van facturen.
    """
    def __init__(self, storage_dir: str = "facturen"):
        # Zorg dat we het absolute pad gebruiken relative aan de module root indien nodig,
        # maar hier gaan we uit van cwd of absoluut. 
        # Voor veiligheid maken we het absoluut t.o.v. huidige werkmap.
        self.storage_dir = os.path.abspath(storage_dir)
        if not os.path.exists(self.storage_dir):
            os.makedirs(self.storage_dir)
            
        self.facturen_db: List[Factuur] = []

    def ontvang_factuur(self, bron_pad: str, omschrijving: str) -> Factuur:
        """
        Kopieert een factuur naar de opslag map en registreert deze.
        """
        if not os.path.exists(bron_pad):
            raise FileNotFoundError(f"Bron bestand niet gevonden: {bron_pad}")

        # Genereer bestandsnaam: datum_oorspronkelijkenaam
        bestandsnaam = os.path.basename(bron_pad)
        vandaag_str = date.today().strftime("%Y%m%d")
        nieuwe_naam = f"{vandaag_str}_{bestandsnaam}"
        doel_pad = os.path.join(self.storage_dir, nieuwe_naam)

        # Kopiëren
        shutil.copy2(bron_pad, doel_pad)

        # Database record aanmaken
        nieuwe_factuur = Factuur(
            id=f"FAC-{len(self.facturen_db) + 1}",
            bestandspad=doel_pad,
            datum=date.today(),
            omschrijving=omschrijving
        )
        self.facturen_db.append(nieuwe_factuur)
        print(f"[FactuurManager] Factuur opgeslagen: {doel_pad}")
        return nieuwe_factuur

    def exporteer_overzicht(self, type: str, doel_pad: str):
        """
        Exporteert lijst van ontvangen facturen.
        """
        data = [
            {
                "ID": f.id,
                "Datum": f.datum,
                "Omschrijving": f.omschrijving,
                "Bestand": os.path.basename(f.bestandspad)
            }
            for f in self.facturen_db
        ]

        if type.lower() == 'excel':
            return export_to_excel(data, doel_pad)
        elif type.lower() == 'pdf':
            return export_to_pdf("Facturen Overzicht", data, doel_pad)
        else:
            raise ValueError("Type moet 'excel' of 'pdf' zijn.")
