

# 3D Lichtkuppel-Visualisierung für Konfigurator

## Übersicht

Implementierung einer interaktiven 3D-Vorschau der Lichtkuppel, die sich in Echtzeit an die Konfiguration anpasst. Die 3D-Ansicht wird oben auf der Seite angezeigt und reagiert auf alle Konfigurationsänderungen.

---

## Technische Umsetzung

### Neue Dependencies

```json
{
  "@react-three/fiber": "^8.18.0",
  "@react-three/drei": "^9.122.0",
  "three": "^0.170.0"
}
```

**Hinweis**: Version 8 für fiber und Version 9 für drei sind erforderlich für React 18 Kompatibilität.

---

## 3D-Modell Struktur

Die Lichtkuppel besteht aus drei Hauptkomponenten:

```text
┌─────────────────────────────────────────┐
│           LICHTKUPPEL (Dome)            │
│    ┌─────────────────────────────┐      │
│    │    Gewölbte Oberschale      │      │  ← Transparent/Opal
│    │    (1-5 Schichten)          │      │
│    └─────────────────────────────┘      │
├─────────────────────────────────────────┤
│         LÜFTERRAHMEN (optional)         │  ← Metallrahmen
├─────────────────────────────────────────┤
│           AUFSATZKRANZ                  │
│    ┌─────────────────────────────┐      │
│    │    Weißer PVC-Rahmen        │      │  ← Variable Höhe
│    │    (15/30/50 cm)            │      │
│    └─────────────────────────────┘      │
└─────────────────────────────────────────┘
```

---

## Neue Komponenten

### 1. SkylightModel3D.tsx
Hauptkomponente für das 3D-Modell mit:
- Dome (gewölbte Kuppel mit Materialtransparenz)
- Shells (1-5 sichtbare Schichten)
- Aufsatzkranz (weißer Rahmen, variable Höhe)
- Lüfterrahmen (optional, Metalloptik)

### 2. Skylight3DViewer.tsx
Canvas-Wrapper mit:
- OrbitControls für Rotation/Zoom
- Beleuchtung (Ambient + Directional)
- Responsive Größenanpassung
- Loading-State

---

## Material-Mapping für 3D

| Material | Farbe | Transparenz |
|----------|-------|-------------|
| Acryl klar | Hellblau | 90% transparent |
| Acryl opal | Weiß | 60% transparent |
| Heatstop klar | Goldton | 85% transparent |
| Heatstop opal | Gold-weiß | 55% transparent |
| Polycarbonat klar | Grau-blau | 80% transparent |
| Polycarbonat opal | Grau-weiß | 50% transparent |

---

## UI-Layout Änderung

```text
+------------------------------------------+
|  HEADER                                  |
+------------------------------------------+
|                                          |
|     ┌────────────────────────────┐       |
|     │                            │       |
|     │      3D VORSCHAU           │       |
|     │    (Interaktiv drehbar)    │       |
|     │                            │       |
|     └────────────────────────────┘       |
|                                          |
+------------------------------------------+
|  KONFIGURATOR (bestehendes Layout)       |
|  - Maße                                  |
|  - Material & Optik                      |
|  - Aufsatzkranz                          |
|  - Lüfterrahmen                          |
+------------------------------------------+
```

---

## Dateien

| Datei | Aktion |
|-------|--------|
| `src/components/configurator/SkylightModel3D.tsx` | **Neu** - 3D Modell |
| `src/components/configurator/Skylight3DViewer.tsx` | **Neu** - Canvas Wrapper |
| `src/components/configurator/ConfiguratorPage.tsx` | **Ändern** - 3D Viewer einbinden |
| `package.json` | **Ändern** - 3D Dependencies |

---

## Technische Details

### Dome-Geometrie
- Verwendung von `SphereGeometry` mit oberer Hälfte für die gewölbte Form
- Skalierung basierend auf `groesse` (80-180 cm)
- Mehrere geschachtelte Sphären für Multi-Shell-Darstellung

### Interaktivität
- OrbitControls: Drehen, Zoomen, Schwenken
- Auto-Rotation (optional, abschaltbar)
- Smooth camera transitions bei Konfigurationsänderungen

### Performance
- Suspense für Lazy Loading
- Optimierte Geometrien
- Canvas nur rendern wenn sichtbar

