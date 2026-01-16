from dataclasses import dataclass


@dataclass
class Medewerker:
    id: str             # Bijv. 'EMP001'
    naam: str
    functie: str
    saldo_verlof_uren: float = 200.0  # Standaard saldo per jaar

    def __str__(self):
        return f"{self.naam} ({self.functie})"
