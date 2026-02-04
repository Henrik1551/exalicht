# Konfigurator - Implementiert ✓

## Abgeschlossene Änderungen

### 1. BaseConfigurator.tsx
- ✅ Separate **Länge** und **Breite** Felder statt kombinierter Größe
- ✅ Breite-Optionen dynamisch basierend auf Länge (≤ Länge)
- ✅ **Spindel-Option** bei Lüfterrahmen hinzugefügt (4 Varianten)
- ✅ **Dämmung 20mm** in Aufsatzkranz-Sektion angezeigt

### 2. ConfiguratorSummary.tsx
- ✅ Preis-Layout wie alte Seite mit Input-Feldern:
  - Lichtkuppel Preis (€)
  - Aufsatzkranz Preis (€)
  - Lüfterrahmen Preis (€)
  - Zusatzkosten (€)

### 3. 3D-Viewer
- ✅ Spindel-Option in Skylight3DViewer.tsx und SkylightModel3D.tsx

---

## Datenbank-Hinweis

Die Größen 80x80, 110x110, 180x180 sind noch nicht in der Datenbank vorhanden. Diese Konfigurationen werden weiterhin "auf Anfrage" anzeigen bis die entsprechenden Preisdaten importiert werden.

Vorhandene Daten:
- 100x100, 120x120, 150x150 (alle Materialien, alle Schalen)
- Aufsatzkranz: 100x100, 120x120, 150x150 mit H15/H30/H50
