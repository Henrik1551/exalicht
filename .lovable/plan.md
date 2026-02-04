
# Behebung: Preise im Konfigurator werden nicht angezeigt

## Ursache des Problems

Die Preise werden nicht angezeigt, weil **React Query die leeren Ergebnisse zwischengespeichert** hat. Die API-Anfragen wurden um **17:23:16Z** gestellt, aber die Daten wurden erst um **17:26:02Z** importiert. React Query zeigt nun die gecachten leeren Arrays an.

**Sofortige Lösung:** Die Seite `/configurator` neu laden (Strg+F5 oder Cmd+Shift+R) um frische Daten abzurufen.

---

## Geplante Verbesserungen

### 1. Stale-Time und Cache-Einstellungen optimieren

In `src/hooks/useConfiguratorItems.ts` werden kürzere Cache-Zeiten konfiguriert:

```typescript
return useQuery({
  queryKey: ['configurator-items', category],
  queryFn: async () => { ... },
  staleTime: 1000 * 60 * 5, // 5 Minuten
  refetchOnWindowFocus: true,
});
```

### 2. Hinweis bei fehlenden Preisdaten

Im ConfiguratorPage wird ein Hinweis angezeigt, wenn keine Produkte gefunden werden:

```typescript
// Prüfung ob Produkte vorhanden sind
const hasProducts = lichtkuppelItems && lichtkuppelItems.length > 0;

// Warnung anzeigen wenn keine Produkte
{!hasProducts && !isLoading && (
  <Alert variant="warning">
    Keine Preisdaten gefunden. Bitte laden Sie die Seite neu.
    <Button onClick={() => window.location.reload()}>Neu laden</Button>
  </Alert>
)}
```

### 3. Bessere Preisanzeige bei nicht gefundenen Produkten

Anstatt €0,00 wird "Preis auf Anfrage" angezeigt, wenn kein passendes Produkt existiert:

```typescript
const formatPriceOrNA = (price: number, found: boolean) => {
  if (!found) return "auf Anfrage";
  return formatPrice(price);
};
```

---

## Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| `src/hooks/useConfiguratorItems.ts` | Cache-Einstellungen, staleTime, refetchOnWindowFocus |
| `src/components/configurator/ConfiguratorPage.tsx` | Warnung bei leeren Daten, Preisanzeige-Logik |

---

## Technische Details

### Aktuelle Datenlage in der Datenbank

| Kategorie | Anzahl Artikel |
|-----------|----------------|
| lichtkuppel | 25 |
| aufsatzkranz | 13 |
| luefterrahmen | 8 |
| durchsturzsicherung | 7 |
| zubehoer | 9 |

Die Daten sind korrekt in der Datenbank vorhanden. Nach Implementierung der Fixes und einem Neuladen der Seite werden alle Preise korrekt angezeigt.
