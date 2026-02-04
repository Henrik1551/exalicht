
# Fehlende Preisdaten für 80x80 und 110x110 Lichtkuppeln

## Aktuelle Datenlage

| Größe | Lichtkuppeln | Aufsatzkränze | Status |
|-------|--------------|---------------|--------|
| 80x80 | 0 | 0 | **Fehlt komplett** |
| 100x100 | 15 | 7 | ✅ Vorhanden |
| 110x110 | 0 | 0 | **Fehlt komplett** |
| 120x120 | 5 | 3 | Vorhanden (nicht im Konfigurator) |
| 150x150 | 5 | 3 | Vorhanden (nicht im Konfigurator) |

---

## Lösungsoptionen

### Option A: Manuelle Dateneingabe via SQL

Da keine Markdown-Exportdateien mit 80x80 und 110x110 Daten vorliegen, können wir die Preisdaten direkt in die Datenbank einfügen. Dafür benötigen wir die Preisliste.

**Benötigte Informationen:**
- Preise für 80x80 cm Lichtkuppeln (AC/HS/PC, 1-5 schalig)
- Preise für 110x110 cm Lichtkuppeln (AC/HS/PC, 1-5 schalig)
- Preise für entsprechende Aufsatzkränze (15/30/50 cm Höhe)

### Option B: Preise aus vorhandenen Daten interpolieren

Basierend auf den vorhandenen Preisen für 100x100, 120x120 und 150x150 können wir die fehlenden Größen schätzen:

**Beispielrechnung (100x100 AC 1-schalig = 141,90€):**
- 80x80 wäre kleiner → geschätzt ~90-100€
- 110x110 wäre größer → geschätzt ~160-180€

### Option C: Markdown-Dateien mit fehlenden Größen importieren

Falls Preislisten-Dateien für 80x80 und 110x110 existieren, können diese über die Admin-Seite `/admin/configurator-import` hochgeladen werden.

---

## Empfohlene Vorgehensweise

1. **Prüfen Sie, ob Preislisten-Dateien für 80x80 und 110x110 verfügbar sind**
2. Falls ja: Import über `/admin/configurator-import`
3. Falls nein: Teilen Sie die Preise mit mir, und ich füge sie direkt in die Datenbank ein

---

## Nächste Schritte

Bitte teilen Sie mir mit:
- Haben Sie Markdown-Dateien mit den Preisen für 80x80 und 110x110?
- Oder sollen die Preise manuell eingegeben werden? Falls ja, bitte die Preisliste bereitstellen.
- Sollen wir die Preise basierend auf den vorhandenen Daten interpolieren?
