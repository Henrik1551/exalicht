

# Preisberechnung synchronisieren mit Datenbank

## Aktueller Stand

Nach Analyse der Datenbank und dem Vergleich mit dem Beispiel aus der alten Seite:

**Beispiel alte Seite:**
- 80x80 cm, Heatstop, klar, 1-schalig, 15cm Aufsatzkranz, Dämmung 20mm, festverglast = **338,40€**

**Problem:** Die Datenbank enthält keine 80x80 Produkte!

---

## Datenbank-Analyse

### Vorhandene Lichtkuppeln

| Größe | Acryl | Heatstop | Polycarbonat |
|-------|-------|----------|--------------|
| 80x80 | - | - | - |
| 100x100 | 1-5 Schalen | 1-5 Schalen | 1-5 Schalen |
| 110x110 | - | - | - |
| 120x120 | 1-5 Schalen | - | - |
| 150x150 | 1-5 Schalen | - | - |
| 180x180 | - | - | - |

### Vorhandene Aufsatzkränze

| Größe | H15 | H30 | H50 | Dämmung |
|-------|-----|-----|-----|---------|
| 100x100 | 274,20€ | 360,90€ | 176,70€ | 20mm Standard |
| 120x120 | 320,00€ | 420,00€ | 520,00€ | 20mm |
| 150x150 | 380,00€ | 490,00€ | 620,00€ | 20mm |

---

## Lösungsplan

### Schritt 1: Größen im Konfigurator anpassen

Die UI bietet Größen an, die nicht in der Datenbank existieren. Optionen:

**Option A (empfohlen):** Nur vorhandene Größen anbieten
- Quadratisch: 100x100, 120x120, 150x150 cm
- Fehlende Kombinationen als "auf Anfrage" markieren

**Option B:** Alle Größen importieren
- Benötigt vollständige Preisliste für 80x80, 110x110, 180x180
- Benötigt Heatstop/PC Preise für alle Größen

### Schritt 2: Preisberechnung-Logik bestätigen

Basierend auf dem Beispiel (€338,40):
```
Gesamtpreis = Lichtkuppel + Aufsatzkranz + (Lüfterrahmen wenn nicht festverglast)
```

Die Dämmung (20mm) ist bereits im Aufsatzkranz-Preis enthalten.

### Schritt 3: Fehlende Daten visualisieren

Wenn eine Konfiguration nicht in der Datenbank gefunden wird:
- Klare "Preis auf Anfrage" Anzeige
- Möglichkeit zur Kontaktaufnahme
- Hinweis welche Komponente fehlt

---

## Technische Änderungen

### Dateien die angepasst werden

| Datei | Änderung |
|-------|----------|
| `src/components/configurator/BaseConfigurator.tsx` | Größen-Arrays auf DB-Werte anpassen |
| `src/components/configurator/shared/ConfiguratorSummary.tsx` | Bessere "auf Anfrage" Darstellung |

### Größen-Konstanten aktualisieren

```typescript
// ALT (nicht in DB vorhanden)
const SQUARE_SIZES = [80, 100, 110, 180];

// NEU (in DB vorhanden)
const SQUARE_SIZES = [100, 120, 150];
```

### Material-Verfügbarkeit prüfen

```typescript
// Heatstop und Polycarbonat nur für 100x100 verfügbar
// Bei anderen Größen Material-Optionen einschränken oder "auf Anfrage" anzeigen
```

---

## Alternative: Vollständiger Daten-Import

Falls Sie die Preisliste für alle Größen haben, können diese über den Admin-Import (`/admin/configurator-import`) hinzugefügt werden:

Benötigte Daten:
- Lichtkuppeln: 80x80, 110x110, 180x180 für alle Materialien/Schalen
- Aufsatzkränze: 80x80, 110x110, 180x180 für alle Höhen
- Heatstop/Polycarbonat: 120x120, 150x150

---

## Zusammenfassung

Die Preislogik im Konfigurator ist korrekt implementiert:
- Lichtkuppel + Aufsatzkranz + Lüfterrahmen (optional)

Das Problem ist, dass die Datenbank unvollständig ist. Die verfügbaren Optionen müssen entweder:
1. An die vorhandenen Datenbank-Einträge angepasst werden, ODER
2. Die fehlenden Preisdaten importiert werden

