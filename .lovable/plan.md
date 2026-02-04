

# 4 Separate Konfiguratoren - Auswahlseite + Spezifische Konfiguratoren

## Übersicht

Die `/configurator`-Seite wird zur Auswahlseite, auf der Benutzer zwischen 4 Produktkategorien wählen können. Jede Kategorie führt zu einem spezifischen Konfigurator mit angepasstem 3D-Modell.

---

## Die 4 Konfiguratoren

| Nr | Name | Form | Beschreibung |
|----|------|------|--------------|
| 1 | Lichtkuppeln mit Aufsatzkranz (Rund) | Kreisform | Komplettset: Runde Kuppel + Aufsatzkranz |
| 2 | Lichtkuppeln mit Aufsatzkranz (Quadratisch) | Quadrat | Komplettset: Quadratische Kuppel + Aufsatzkranz |
| 3 | Lichtkuppeln/Oberschalen (Rund) | Kreisform | Nur die runde Kuppel, ohne Aufsatzkranz |
| 4 | Lichtkuppeln/Oberschalen (Quadratisch) | Quadrat | Nur die quadratische Kuppel, ohne Aufsatzkranz |

---

## Architektur

```text
/configurator (Auswahlseite)
    │
    ├── Karte 1: "Rund + Aufsatzkranz"      → /configurator/rund-komplett
    ├── Karte 2: "Quadratisch + Aufsatzkranz" → /configurator/quadrat-komplett  
    ├── Karte 3: "Rund (nur Kuppel)"        → /configurator/rund-kuppel
    └── Karte 4: "Quadratisch (nur Kuppel)" → /configurator/quadrat-kuppel
```

---

## Neue Komponenten

### 1. ConfiguratorSelection.tsx
Auswahlseite mit 4 Karten:
- Visuelles Icon für jede Variante (Kreis/Quadrat)
- Kurze Beschreibung
- CTA-Button zum jeweiligen Konfigurator

### 2. RoundDomeConfigurator.tsx
Konfigurator für runde Lichtkuppeln mit Aufsatzkranz:
- Größe: Durchmesser-Auswahl (z.B. 60, 80, 100, 120, 150 cm)
- Alle bisherigen Optionen (Material, Schalen, etc.)
- Aufsatzkranz inklusive

### 3. SquareDomeConfigurator.tsx
Bestehender Konfigurator für quadratische Komplettsets:
- Größen: 80x80, 100x100, 110x110, 180x180
- Mit Aufsatzkranz

### 4. RoundShellOnlyConfigurator.tsx
Nur runde Kuppel ohne Aufsatzkranz:
- Kein Aufsatzkranz-Preisaufschlag
- 3D-Modell zeigt nur Kuppel

### 5. SquareShellOnlyConfigurator.tsx
Nur quadratische Kuppel ohne Aufsatzkranz:
- Kein Aufsatzkranz-Preisaufschlag
- 3D-Modell zeigt nur Kuppel

---

## 3D-Modell Anpassungen

### Runde Kuppel (neue Geometrie)
- Kreisförmiger Aufsatzkranz statt quadratisch
- Runde Dome-Base
- Gleiche Shell-Logik (1-5 Schalen)

### Quadratische Kuppel
- Bestehende Geometrie wird wiederverwendet

### Ohne Aufsatzkranz
- 3D-Modell zeigt nur die Kuppel
- Kein Rahmen/Kranz darunter

```text
MIT AUFSATZKRANZ:              OHNE AUFSATZKRANZ:
┌──────────────┐               ┌──────────────┐
│    Kuppel    │               │    Kuppel    │
├──────────────┤               └──────────────┘
│  Aufsatzkranz│                   (nur Dome)
└──────────────┘
```

---

## Routing-Änderungen

```typescript
// App.tsx - Neue Routes
<Route path="/configurator" element={<Configurator />} />
<Route path="/configurator/rund-komplett" element={<ConfiguratorRoundComplete />} />
<Route path="/configurator/quadrat-komplett" element={<ConfiguratorSquareComplete />} />
<Route path="/configurator/rund-kuppel" element={<ConfiguratorRoundShell />} />
<Route path="/configurator/quadrat-kuppel" element={<ConfiguratorSquareShell />} />
```

---

## Dateien

| Datei | Aktion |
|-------|--------|
| `src/components/configurator/ConfiguratorSelection.tsx` | **Neu** - Auswahlseite |
| `src/components/configurator/SquareDomeConfigurator.tsx` | **Neu** - Refactored aus bestehendem Code |
| `src/components/configurator/RoundDomeConfigurator.tsx` | **Neu** - Runde Variante |
| `src/components/configurator/SquareShellOnlyConfigurator.tsx` | **Neu** - Nur Kuppel |
| `src/components/configurator/RoundShellOnlyConfigurator.tsx` | **Neu** - Nur Kuppel |
| `src/components/configurator/SkylightModel3D.tsx` | **Ändern** - Runde Geometrie hinzufügen |
| `src/components/configurator/Skylight3DViewer.tsx` | **Ändern** - Form-Prop hinzufügen |
| `src/components/configurator/shared/ConfiguratorSummary.tsx` | **Neu** - Wiederverwendbare Zusammenfassung |
| `src/components/configurator/shared/OptionButton.tsx` | **Neu** - Wiederverwendbarer Button |
| `src/pages/Configurator.tsx` | **Ändern** - Auswahlseite einbinden |
| `src/pages/configurator/RoundComplete.tsx` | **Neu** - Page wrapper |
| `src/pages/configurator/SquareComplete.tsx` | **Neu** - Page wrapper |
| `src/pages/configurator/RoundShell.tsx` | **Neu** - Page wrapper |
| `src/pages/configurator/SquareShell.tsx` | **Neu** - Page wrapper |
| `src/App.tsx` | **Ändern** - Neue Routes |

---

## Auswahlseite Design

```text
┌─────────────────────────────────────────────────────────────────┐
│                    LICHTKUPPEL KONFIGURATOR                     │
│         Wählen Sie Ihre Produktkategorie                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌─────────────────┐         ┌─────────────────┐               │
│   │       ○         │         │       □         │               │
│   │                 │         │                 │               │
│   │  RUND           │         │  QUADRATISCH    │               │
│   │  mit Aufsatzkranz│         │  mit Aufsatzkranz│               │
│   │                 │         │                 │               │
│   │  [Konfigurieren]│         │  [Konfigurieren]│               │
│   └─────────────────┘         └─────────────────┘               │
│                                                                 │
│   ┌─────────────────┐         ┌─────────────────┐               │
│   │       ○         │         │       □         │               │
│   │                 │         │                 │               │
│   │  RUND           │         │  QUADRATISCH    │               │
│   │  nur Oberschale │         │  nur Oberschale │               │
│   │                 │         │                 │               │
│   │  [Konfigurieren]│         │  [Konfigurieren]│               │
│   └─────────────────┘         └─────────────────┘               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Datenbank-Hinweis

Aktuell sind in der Datenbank keine runden Lichtkuppeln oder Aufsatzkränze vorhanden. Die Konfiguratoren für runde Produkte werden "auf Anfrage" anzeigen, bis entsprechende Daten importiert werden.

**Vorhandene Daten:**
- Quadratische Lichtkuppeln: 100x100, 120x120, 150x150
- Quadratische Aufsatzkränze: 100x100, 120x120, 150x150
- Runde Lüfterrahmen: 60, 80, 100, 120, 150 cm (bereits vorhanden!)

