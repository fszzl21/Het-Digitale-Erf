import pandas as pd
from typing import List, Dict
import os

def export_to_excel(data: List[Dict], filename: str) -> str:
    """
    Exporteert een lijst van dictionaries naar een Excel bestand.
    Geeft het absolute pad terug van het aangemaakte bestand.
    """
    if not data:
        raise ValueError("Geen data om te exporteren")

    df = pd.DataFrame(data)
    
    # Zorg ervoor dat de directory bestaat (als filename een pad bevat)
    directory = os.path.dirname(filename)
    if directory and not os.path.exists(directory):
        os.makedirs(directory)

    # Als de extensie ontbreekt, voeg toe
    if not filename.lower().endswith('.xlsx'):
        filename += '.xlsx'

    df.to_excel(filename, index=False)
    return os.path.abspath(filename)
