

# Konfigurator an alte Seite anpassen

## Übersicht

Die aktuelle Implementierung muss an das Design der alten Seite angepasst werden. Die Hauptunterschiede betreffen die Dimensionsauswahl, Aufsatzkranz-Optionen und Lüfterrahmen-Varianten.

---

## Unterschiede zum aktuellen Stand

| Bereich | Alt (Screenshot) | Aktuell | Änderung |
|---------|-----------------|---------|----------|
| Maße | Separate Länge + Breite | Nur quadratische Größe | Länge/Breite getrennt |
| Größen | 80, 100, 110, 180 | 80, 100, 110, 180 | Passt bereits |
| Dämmung | 20mm (angezeigt) | Nicht angezeigt | Anzeigen (fest 20mm) |
| Lüfterrahmen | 4 Varianten inkl. Spindel | 3 Varianten | Spindel hinzufügen |
| Preis-Anzeige | Einzelne Preisfelder | Zusammenfassung-Card | Layout anpassen |

---

## Technische Änderungen

### 1. BaseConfigurator.tsx - Maße-Sektion

Separate Länge und Breite-Felder statt kombinierter Größe:

```typescript
// NEU: Separate Dimensionen für rechteckig/quadratisch
interface SquareConfigSelection extends BaseConfigSelection {
  laenge: 80 | 100 | 110 | 180;
  breite: 80 | 100 | 110 | 180;
}

const DIMENSIONS = [80, 100, 110, 180];
```

Die Breite-Optionen werden dynamisch basierend auf der Länge angezeigt (≤ Länge für echte Rechtecke).

### 2. Lüfterrahmen - Spindel-Option

```typescript
// NEU: 4 Varianten statt 3
luefterrahmen: 'festverglast' | 'spindel' | '230v' | '24v';
```

UI-Labels:
- festverglast (nicht zu öffnen)
- manuell offenbar (Spindel)
- elektrisch offenbar (230V Antrieb)
- elektrisch offenbar (24V RWA-Antrieb)

### 3. Aufsatzkranz - Dämmung anzeigen

Zeige "Dämmung: 20 mm" als festes Info-Feld in der Aufsatzkranz-Sektion.

### 4. Preis-Layout anpassen

Die alte Seite zeigt Preise direkt unter den Optionen in Input-Feldern (readonly):
- Lichtkuppel Preis (€): 104,1
- Aufsatzkranz Preis (€): 219,3
- Lüfterrahmen Preis (€): 0
- Zusatzkosten (€): 0

---

## Dateien

| Datei | Änderung |
|-------|----------|
| `src/components/configurator/BaseConfigurator.tsx` | Separate Länge/Breite, Spindel-Option, Dämmung-Anzeige |
| `src/components/configurator/shared/ConfiguratorSummary.tsx` | Preis-Layout wie alte Seite |

---

## UI-Layout nach Änderung

```text
┌────────────────────────────────────────────────────┐
│ Länge *                                            │
│ ● 80  ○ 100  ○ 110  ○ 180                          │
├────────────────────────────────────────────────────┤
│ Breite *                                           │
│ ● 80  (dynamisch basierend auf Länge)              │
├────────────────────────────────────────────────────┤
│ OBERSCHALE (Material & Optik)                      │
│                                                    │
│ Material *                                         │
│ ● Acryl (Standard)                                 │
│ ○ Heatstop (wärmereflektierend)                    │
│ ○ Polycarbonat (schlagfest)                        │
│                                                    │
│ Optik *                                            │
│ ● klar (transparent)  ○ opal (Milchglas)           │
│                                                    │
│ Schale *                                           │
│ ● 1-schalig  ○ 2  ○ 3  ○ 4  ○ 5                    │
├────────────────────────────────────────────────────┤
│ AUFSATZKRANZ                                       │
│ (Rahmen zwischen Dach und Kuppel)                  │
│                                                    │
│ Höhe *                                             │
│ ● 15 cm  ○ 30 cm  ○ 50 cm                          │
│                                                    │
│ Dämmung *                                          │
│ ● 20 mm                                            │
├────────────────────────────────────────────────────┤
│ Lüfterrahmen (optional)                            │
│                                                    │
│ Varianten *                                        │
│ ● festverglast (nicht zu öffnen)                   │
│ ○ manuell offenbar (Spindel)                       │
│ ○ elektrisch offenbar (230V Antrieb)               │
│ ○ elektrisch offenbar (24V RWA-Antrieb)            │
├────────────────────────────────────────────────────┤
│ Lichtkuppel Preis (€)    │ 104,10                  │
│ Aufsatzkranz Preis (€)   │ 219,30                  │
│ Lüfterrahmen Preis (€)   │ 0,00                    │
│ Zusatzkosten (€)         │ 0,00                    │
└────────────────────────────────────────────────────┘
```

---

## Datenbank-Hinweis

Die Größen 80x80, 110x110, 180x180 sind noch nicht in der Datenbank vorhanden. Diese Konfigurationen werden weiterhin "auf Anfrage" anzeigen bis die entsprechenden Preisdaten importiert werden.

Vorhandene Daten:
- 100x100, 120x120, 150x150 (alle Materialien, alle Schalen)
- Aufsatzkranz: 100x100, 120x120, 150x150 mit H15/H30/H50

