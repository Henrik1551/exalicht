
# Konfigurator Umbau: Neue Struktur nach Vorgabe

## Übersicht der Änderungen

Der Konfigurator wird gemäß der vorgegebenen Struktur umgebaut:

| Aktuell | Neu |
|---------|-----|
| Kombinierte Größenauswahl (80x80, 100x100...) | Separate Länge + Breite Auswahl |
| Material: AC, HS, PC | Material: Acryl, Heatstop, Polycarbonat + Optik (klar/opal) |
| 4 Lüfterrahmen-Optionen | 3 Optionen (festverglast, 230V, 24V) |
| Kranz als Option ein/aus | Kranz immer dabei mit Höhenauswahl |

---

## Neue Konfigurator-Struktur

### 1. Maße [ULW] - Innenlichtweite

**Länge** (Zeilen-Buttons):
- 80 cm
- 100 cm
- 110 cm
- 180 cm

**Breite** (Zeilen-Buttons):
- 180 cm

Logik: Breite >= Länge (oder alle Kombinationen erlaubt)

### 2. OBERSCHALE (Material & Optik)

**Material** (Radio-Buttons):
- Acryl (Standard)
- Heatstop (wärmereflektierend)
- Polycarbonat (schlagfest)

**Optik** (Radio-Buttons):
- klar (transparent)
- opal (Milchglas)

**Schale** (1-5):
- 1-schalig
- 2-schalig
- 3-schalig
- 4-schalig
- 5-schalig

### 3. AUFSATZKRANZ

**Höhe** (Radio-Buttons):
- 15 cm
- 30 cm
- 50 cm

### 4. Lüfterrahmen (optional)

**Varianten** (Radio-Buttons):
- festverglast (nicht zu öffnen)
- elektrisch öffenbar (230V Antrieb)
- elektrisch öffenbar (24V RWA-Antrieb)

---

## Technische Änderungen

### ConfigSelection Interface (aktualisiert)

```typescript
interface ConfigSelection {
  // Maße - separat statt kombiniert
  laenge: number;      // 80, 100, 110, 180
  breite: number;      // 80, 100, 110, 180
  
  // Oberschale
  material: 'acryl' | 'heatstop' | 'polycarbonat';
  optik: 'klar' | 'opal';
  shells: 1 | 2 | 3 | 4 | 5;
  
  // Aufsatzkranz
  kranzHeight: 15 | 30 | 50;
  
  // Lüfterrahmen
  luefterrahmen: 'festverglast' | '230v' | '24v';
  
  // Menge
  quantity: number;
}
```

### Neue Konstanten

```typescript
const AVAILABLE_LAENGEN = [80, 100, 110, 180];
const AVAILABLE_BREITEN = [180]; // Aktuell nur 180 verfügbar
const SHELL_OPTIONS = [1, 2, 3, 4, 5];
const KRANZ_HEIGHTS = [15, 30, 50];
```

### UI-Layout

```text
+------------------------------------------+
|  MASSE [ULW]                             |
|  Länge:  [80] [100] [110] [180]          |
|  Breite: [180]                           |
+------------------------------------------+
|  OBERSCHALE (Material & Optik)           |
|  Material: [Acryl] [Heatstop] [PC]       |
|  Optik:    [klar] [opal]                 |
|  Schale:   [1] [2] [3] [4] [5]           |
+------------------------------------------+
|  AUFSATZKRANZ                            |
|  Höhe:     [15cm] [30cm] [50cm]          |
+------------------------------------------+
|  LÜFTERRAHMEN (optional)                 |
|  [festverglast] [230V] [24V RWA]         |
+------------------------------------------+
```

---

## Dateien die geändert werden

| Datei | Änderung |
|-------|----------|
| `src/components/configurator/ConfiguratorPage.tsx` | Kompletter Umbau der UI und Logik |

---

## Entfernte Features (vereinfacht)

- Form-Auswahl (rund/rechteckig) - nur rechteckig
- Kranz ein/aus Toggle - immer dabei
- Wandstärke-Auswahl - vereinfacht
- Durchsturzsicherung - entfernt (kann später hinzugefügt werden)
- Vormontage-Option - entfernt

## Datenbank-Mapping

Die vorhandenen Daten in der Datenbank verwenden:
- `width_cm` und `length_cm` für Maße
- `material` mit Werten 'AC', 'HS', 'PC' (wird gemappt zu acryl/heatstop/polycarbonat)
- `shells` für Schalenanzahl

Die Preisabfrage wird entsprechend angepasst, um die neuen separaten Länge/Breite-Felder zu verwenden.
