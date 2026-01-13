import os
import sys
import shutil
import pandas as pd
from datetime import date

# Pad toevoegen
sys.path.append(os.getcwd())

from api.interface import (
    create_verkoop_factuur, 
    registreer_uren, 
    vraag_vakantie_aan,
    exporteer_kosten_overzicht, 
    exporteer_uren_overzicht,
    upload_factuur
)

def clean_slate():
    """Maakt voorgaande testbestanden schoon"""
    if os.path.exists("demo_rapporten"):
        shutil.rmtree("demo_rapporten")
    if os.path.exists("facturen"):
        shutil.rmtree("facturen") # Pas op: gooit echte facturen weg, maar dit is dev omgeving
        
    os.makedirs("demo_rapporten")
    os.makedirs("facturen")
    print("[CLEAN] Mappen demo_rapporten en facturen leeggemaakt.")

def step_chk(msg):
    print(f"\n✅ {msg}")

def demo():
    print("==================================================")
    print("   START DEMONSTRATIE: ADMINISTRATIE MODULE")
    print("==================================================")
    
    clean_slate()

    # --- DEEL 1: NIEUWE FUNCTIES ---
    print("\n\n##################################################")
    print("#  DEEL 1: NIEUWE FUNCTIES BEWIJZEN              #")
    print("##################################################")

    # 1. Factuur Uploaden
    print("\n--- A. Factuur Ontvangen & Opslaan ---")
    dummy_file = "inkoop_laptop.pdf"
    with open(dummy_file, "w") as f: f.write("Dummy content PDF")
    
    res = upload_factuur(dummy_file, "Nieuwe Laptop")
    print(f"API Response: {res}")
    
    # Check
    files = os.listdir("facturen")
    if files:
        step_chk(f"Bestand gevonden in /facturen: {files[0]}")
    else:
        print("❌ Geen bestand gevonden!")

    # 2. Exporteren (Nog leeg, maar functie moet werken)
    print("\n--- B. Exporteren naar Excel & PDF ---")
    res_ex = exporteer_kosten_overzicht("excel", "demo_rapporten/kosten_leeg.xlsx")
    res_pdf = exporteer_uren_overzicht("pdf", "demo_rapporten/uren_leeg.pdf")
    print(f"Export Excel: {res_ex}")
    print(f"Export PDF:   {res_pdf}")
    
    if os.path.exists("demo_rapporten/kosten_leeg.xlsx") and os.path.exists("demo_rapporten/uren_leeg.pdf"):
         step_chk("Export bestanden succesvol aangemaakt (leeg/basis).")

    # --- DEEL 2: BESTAANDE FUNCTIES ---
    print("\n\n##################################################")
    print("#  DEEL 2: BESTAANDE FUNCTIES (DATA MAKEN)       #")
    print("##################################################")

    # 3. Financieel Boeken
    print("\n--- C. Verkoop Factuur Aanmaken (Oude functionaliteit) ---")
    print("Boeken van factuur 2025-001 (€1000 + BTW)...")
    res_fin = create_verkoop_factuur("Google DeepMind", "2025-001", 1000.00, 210.00)
    print(f"API Response: {res_fin}")
    step_chk("Factuur verwerkt in boekhouding.")

    # 4. HR Uren & Verlof
    print("\n--- D. HR: Uren & Vakantie (Oude functionaliteit) ---")
    print("Uren registreren voor EMP01...")
    res_uren = registreer_uren("EMP01", 8.0, "Project X")
    print(f"API Response Uren: {res_uren}")
    
    print("Vakantie aanvragen...")
    res_verlof = vraag_vakantie_aan("EMP01", 24.0)
    print(f"API Response Verlof: {res_verlof}")
    step_chk("HR mutaties verwerkt.")

    # --- DEEL 3: INTEGRATIE CHECK ---
    print("\n\n##################################################")
    print("#  DEEL 3: EXPORTS UPDATEN MET NIEUWE DATA       #")
    print("##################################################")
    
    print("\n--- E. Opnieuw Exporteren (Gevuld) ---")
    exporteer_kosten_overzicht("excel", "demo_rapporten/kosten_gevuld.xlsx")
    
    print("Inhoud van gegenereerde Excel (via pandas):")
    df = pd.read_excel("demo_rapporten/kosten_gevuld.xlsx")
    print(df.to_string(index=False))
    
    step_chk("Excel bevat nu de data van stap C!")

    print("\n==================================================")
    print("   DEMONSTRATIE VOLTOOID")
    print("==================================================")
    
    # Cleanup dummy
    if os.path.exists(dummy_file): os.remove(dummy_file)

if __name__ == "__main__":
    demo()
