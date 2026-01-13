import os
import sys
# Zorg dat imports werken
sys.path.append(os.getcwd())

from api.interface import (
    create_verkoop_factuur, 
    registreer_uren, 
    exporteer_kosten_overzicht, 
    exporteer_uren_overzicht,
    upload_factuur
)

def test_exports():
    print("--- 1. Data genereren ---")
    create_verkoop_factuur("Test Klant", "2025-999", 500.00, 105.00)
    registreer_uren("EMP01", 4.0, "Test Project")
    
    print("--- 2. Exports testen ---")
    # Excel Exports
    res1 = exporteer_kosten_overzicht("excel", "test_rapporten/kosten.xlsx")
    print(f"Kosten Excel: {res1}")
    
    res2 = exporteer_uren_overzicht("excel", "test_rapporten/uren.xlsx")
    print(f"Uren Excel: {res2}")
    
    # PDF Exports
    res3 = exporteer_kosten_overzicht("pdf", "test_rapporten/kosten.pdf")
    print(f"Kosten PDF: {res3}")
    
    res4 = exporteer_uren_overzicht("pdf", "test_rapporten/uren.pdf")
    print(f"Uren PDF: {res4}")

def test_factuur_upload():
    print("\n--- 3. Factuur upload testen ---")
    # Maak dummy bestand
    dummy_path = "dummy_factuur.txt"
    with open(dummy_path, "w") as f:
        f.write("Dit is een test factuur content.")
        
    res = upload_factuur(dummy_path, "Inhuur ZZP")
    print(f"Upload resultaat: {res}")
    
    # Check of bestand bestaat in facturen map
    if "success" in res["status"]:
        print("Factuur succesvol verwerkt via API.")
    
    # Cleanup dummy
    if os.path.exists(dummy_path):
        os.remove(dummy_path)

if __name__ == "__main__":
    if not os.path.exists("test_rapporten"):
        os.makedirs("test_rapporten")
        
    test_exports()
    test_factuur_upload()
    print("\nAlle tests klaar.")
