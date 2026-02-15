/**
 * Scrape all product configurations and prices for
 * "Lichtkuppel mit Aufsatzkranz rund" from lichtkuppel-direkt.de
 *
 * Uses Playwright to load the page once, then directly calls
 * Formidable Forms AJAX lookup endpoints to resolve dynamic options
 * and prices for every combination. Requests are batched in parallel
 * for faster execution.
 *
 * Output: scripts/output/round-configs.csv
 */

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TARGET_URL = 'https://lichtkuppel-direkt.de/produkt/lichtkuppel-mit-aufsatzkranz-rund/';
const OUTPUT_DIR = join(__dirname, 'output');
const OUTPUT_FILE = join(OUTPUT_DIR, 'round-configs.csv');
const BATCH_SIZE = 10; // Number of parallel AJAX requests per batch

// ---------- Static option values ----------
const ULW_VALUES = ['60', '70', '80', '90', '100', '110', '120', '130', '140', '150', '160', '170', '180', '200', '210', '220'];
const MATERIAL_VALUES = ['Acryl (Standard)', 'Heatstop (wärmereflektierend)', 'Polycarbonat (schlagfest)'];
const OPTIK_VALUES = ['klar (transparent)', 'opal (Milchglas)'];
const SCHALE_VALUES = ['1-schalig', '2-schalig', '3-schalig', '4-schalig', '5-schalig'];
const HOEHE_VALUES = ['15 cm', '30 cm', '50 cm'];

// ---------- Formidable Forms field IDs ----------
const FIELD = {
  ULW: '99',
  MATERIAL: '101',
  SCHALE: '102',
  OPTIK: '103',
  ULW_AK: '105',    // auto-synced from ULW
  HOEHE: '106',
  DAEMMUNG: '107',   // dynamic, depends on Höhe
  ULW_LR: '109',    // auto-synced from ULW
  VARIANTEN: '110',  // dynamic, depends on ULW LR
  LICHTKUPPEL_PREIS: '111',   // lookup(ULW, Material, Schale)
  AUFSATZKRANZ_PREIS: '112',  // lookup(ULW_AK, Höhe, Dämmung)
  LUEFTERRAHMEN_PREIS: '113', // lookup(ULW_LR, Varianten)
  ZUSATZKOSTEN: '114',        // lookup(ULW_LR, Varianten)
};

// ---------- Helpers ----------

/** Parse radio button values from Formidable AJAX HTML response */
function parseRadioValues(html) {
  const values = [];
  const regex = /value="([^"]*)"/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const val = match[1];
    if (val && !val.includes('cannot be blank') && !val.includes('ist ungültig')) {
      values.push(val);
    }
  }
  return [...new Set(values)];
}

/** Parse a single numeric price from Formidable AJAX HTML response */
function parsePriceValue(html) {
  const match = html.match(/value="([^"]*)"/);
  if (match && match[1]) {
    const num = parseFloat(match[1]);
    return isNaN(num) ? '' : num.toString();
  }
  return '';
}

/** Escape a CSV field value */
function csvEscape(val) {
  if (val == null) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

/** Build URL-encoded body for Formidable AJAX lookup */
function buildLookupBody(fieldId, parentFields, parentVals, nonce) {
  const params = new URLSearchParams();
  params.append('action', 'frm_replace_cb_radio_lookup_options');
  parentFields.forEach(f => params.append('parent_fields[]', f));
  parentVals.forEach(v => params.append('parent_vals[]', v));
  params.append('field_id', fieldId);
  params.append('container_field_id', '');
  params.append('row_index', '');
  params.append('current_value', 'false');
  params.append('nonce', nonce);
  return params.toString();
}

// ---------- Main ----------
(async () => {
  const proxyUrl = process.env.HTTPS_PROXY || process.env.https_proxy;
  let proxyConfig;
  if (proxyUrl) {
    const url = new globalThis.URL(proxyUrl);
    proxyConfig = {
      server: `${url.protocol}//${url.hostname}:${url.port}`,
      username: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
    };
  }

  const browser = await chromium.launch({
    headless: true,
    proxy: proxyConfig,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    locale: 'de-DE',
    ignoreHTTPSErrors: true,
  });

  const page = await context.newPage();

  console.log('[1/5] Loading product page...');
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Trigger lazy-loading of Formidable Forms JS by clicking a radio button
  await page.click('input[name="item_meta[99]"][value="60"]').catch(() => {});
  await page.waitForTimeout(5000);

  // Get the Formidable Forms AJAX nonce
  let nonce = await page.evaluate(() => {
    if (typeof window.frm_js !== 'undefined') return window.frm_js.nonce;
    return null;
  });

  // Fallback: extract nonce from inline script
  if (!nonce) {
    nonce = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script:not([src])');
      for (const s of scripts) {
        const m = s.textContent.match(/"nonce"\s*:\s*"([a-f0-9]+)"/);
        if (m) return m[1];
      }
      return null;
    });
  }

  if (!nonce) {
    console.error('Could not find Formidable Forms nonce. Aborting.');
    await browser.close();
    process.exit(1);
  }
  console.log(`   Nonce acquired: ${nonce}`);

  /**
   * Run a batch of AJAX lookups in parallel inside the browser context.
   * @param {Array<{fieldId, parentFields, parentVals}>} requests
   * @returns {Promise<string[]>} HTML responses
   */
  async function batchLookup(requests) {
    const bodies = requests.map(r =>
      buildLookupBody(r.fieldId, r.parentFields, r.parentVals, nonce)
    );

    const results = await page.evaluate(async (reqBodies) => {
      const responses = await Promise.all(
        reqBodies.map(body =>
          fetch('/wp-admin/admin-ajax.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
          })
            .then(resp => resp.text())
            .catch(() => '')
        )
      );
      return responses;
    }, bodies);

    return results;
  }

  /**
   * Run all lookups in batches of BATCH_SIZE, with progress logging.
   * @param {Array<{key, fieldId, parentFields, parentVals}>} items
   * @param {string} label
   * @returns {Map<string, string>} key → HTML response
   */
  async function fetchAllBatched(items, label) {
    const results = new Map();
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      const batch = items.slice(i, i + BATCH_SIZE);
      const htmls = await batchLookup(batch);
      batch.forEach((item, idx) => {
        results.set(item.key, htmls[idx]);
      });
      const done = Math.min(i + BATCH_SIZE, items.length);
      if (done % 50 === 0 || done === items.length) {
        console.log(`   ${label}: ${done}/${items.length}`);
      }
    }
    return results;
  }

  // ===== Phase 1: Discover dynamic options =====
  console.log('[2/5] Discovering dynamic options (Dämmung per Höhe, Varianten per ULW)...');

  // Discover Dämmung options for each Höhe
  const daemmungByHoehe = {};
  const daemmungRequests = HOEHE_VALUES.map(h => ({
    key: h, fieldId: FIELD.DAEMMUNG, parentFields: [FIELD.HOEHE], parentVals: [h]
  }));
  const daemmungResults = await fetchAllBatched(daemmungRequests, 'Dämmung');
  for (const hoehe of HOEHE_VALUES) {
    daemmungByHoehe[hoehe] = parseRadioValues(daemmungResults.get(hoehe) || '');
    console.log(`   Höhe "${hoehe}" → Dämmung: [${daemmungByHoehe[hoehe].join(', ')}]`);
  }

  // Discover Varianten options for each ULW
  const variantenByULW = {};
  const variantenRequests = ULW_VALUES.map(u => ({
    key: u, fieldId: FIELD.VARIANTEN, parentFields: [FIELD.ULW_LR], parentVals: [u]
  }));
  const variantenResults = await fetchAllBatched(variantenRequests, 'Varianten');
  for (const ulw of ULW_VALUES) {
    const opts = parseRadioValues(variantenResults.get(ulw) || '');
    variantenByULW[ulw] = ['keine', ...opts];
    console.log(`   ULW ${ulw} → Varianten: [${variantenByULW[ulw].join(', ')}]`);
  }

  // ===== Phase 2: Build all combinations and look up prices =====
  console.log('[3/5] Building all configuration combinations...');

  let totalCombos = 0;
  for (const ulw of ULW_VALUES) {
    for (const hoehe of HOEHE_VALUES) {
      totalCombos += MATERIAL_VALUES.length * OPTIK_VALUES.length * SCHALE_VALUES.length
                   * daemmungByHoehe[hoehe].length * variantenByULW[ulw].length;
    }
  }
  console.log(`   Total combinations: ${totalCombos}`);

  console.log('[4/5] Fetching prices via AJAX lookups (batched)...');

  // --- Lichtkuppel Preis: ULW × Material × Schale ---
  const lkItems = [];
  for (const ulw of ULW_VALUES) {
    for (const material of MATERIAL_VALUES) {
      for (const schale of SCHALE_VALUES) {
        lkItems.push({
          key: `LK|${ulw}|${material}|${schale}`,
          fieldId: FIELD.LICHTKUPPEL_PREIS,
          parentFields: [FIELD.ULW, FIELD.MATERIAL, FIELD.SCHALE],
          parentVals: [ulw, material, schale],
        });
      }
    }
  }
  const lkResults = await fetchAllBatched(lkItems, 'Lichtkuppel');

  // --- Aufsatzkranz Preis: ULW × Höhe × Dämmung ---
  const akItems = [];
  for (const ulw of ULW_VALUES) {
    for (const hoehe of HOEHE_VALUES) {
      for (const daemmung of daemmungByHoehe[hoehe]) {
        akItems.push({
          key: `AK|${ulw}|${hoehe}|${daemmung}`,
          fieldId: FIELD.AUFSATZKRANZ_PREIS,
          parentFields: [FIELD.ULW_AK, FIELD.HOEHE, FIELD.DAEMMUNG],
          parentVals: [ulw, hoehe, daemmung],
        });
      }
    }
  }
  const akResults = await fetchAllBatched(akItems, 'Aufsatzkranz');

  // --- Lüfterrahmen Preis: ULW × Variante ---
  const lrItems = [];
  for (const ulw of ULW_VALUES) {
    for (const variante of variantenByULW[ulw]) {
      if (variante === 'keine') continue;
      lrItems.push({
        key: `LR|${ulw}|${variante}`,
        fieldId: FIELD.LUEFTERRAHMEN_PREIS,
        parentFields: [FIELD.ULW_LR, FIELD.VARIANTEN],
        parentVals: [ulw, variante],
      });
    }
  }
  const lrResults = await fetchAllBatched(lrItems, 'Lüfterrahmen');

  // --- Zusatzkosten: ULW × Variante ---
  const zkItems = [];
  for (const ulw of ULW_VALUES) {
    for (const variante of variantenByULW[ulw]) {
      if (variante === 'keine') continue;
      zkItems.push({
        key: `ZK|${ulw}|${variante}`,
        fieldId: FIELD.ZUSATZKOSTEN,
        parentFields: [FIELD.ULW_LR, FIELD.VARIANTEN],
        parentVals: [ulw, variante],
      });
    }
  }
  const zkResults = await fetchAllBatched(zkItems, 'Zusatzkosten');

  // Build price cache from all results
  const priceCache = new Map();
  for (const [key, html] of lkResults) priceCache.set(key, parsePriceValue(html));
  for (const [key, html] of akResults) priceCache.set(key, parsePriceValue(html));
  for (const [key, html] of lrResults) priceCache.set(key, parsePriceValue(html));
  for (const [key, html] of zkResults) priceCache.set(key, parsePriceValue(html));

  // ===== Phase 3: Assemble all rows and write CSV =====
  console.log('[5/5] Writing CSV...');

  const csvHeader = [
    'ULW', 'Material', 'Optik', 'Schale',
    'Hoehe', 'Daemmung', 'Luefterrahmen_Variante',
    'Lichtkuppel_Preis_EUR', 'Aufsatzkranz_Preis_EUR',
    'Luefterrahmen_Preis_EUR', 'Zusatzkosten_EUR', 'Total_EUR',
  ];

  const rows = [];

  for (const ulw of ULW_VALUES) {
    for (const material of MATERIAL_VALUES) {
      for (const optik of OPTIK_VALUES) {
        for (const schale of SCHALE_VALUES) {
          for (const hoehe of HOEHE_VALUES) {
            for (const daemmung of daemmungByHoehe[hoehe]) {
              for (const variante of variantenByULW[ulw]) {
                const lkKey = `LK|${ulw}|${material}|${schale}`;
                const akKey = `AK|${ulw}|${hoehe}|${daemmung}`;
                const lichtkuppelPreis = priceCache.get(lkKey) || '';
                const aufsatzkranzPreis = priceCache.get(akKey) || '';
                let luefterrahmenPreis = '';
                let zusatzkosten = '';

                if (variante !== 'keine') {
                  luefterrahmenPreis = priceCache.get(`LR|${ulw}|${variante}`) || '';
                  zusatzkosten = priceCache.get(`ZK|${ulw}|${variante}`) || '';
                }

                const parts = [lichtkuppelPreis, aufsatzkranzPreis, luefterrahmenPreis, zusatzkosten]
                  .map(p => p ? parseFloat(p) : 0);
                const total = parts.reduce((a, b) => a + b, 0);
                const totalStr = total > 0 ? total.toFixed(2) : '';

                rows.push([
                  ulw, material, optik, schale,
                  hoehe, daemmung, variante,
                  lichtkuppelPreis, aufsatzkranzPreis,
                  luefterrahmenPreis, zusatzkosten, totalStr,
                ]);
              }
            }
          }
        }
      }
    }
  }

  // Write CSV
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const csvContent = [
    csvHeader.map(csvEscape).join(','),
    ...rows.map(row => row.map(csvEscape).join(',')),
  ].join('\n');

  writeFileSync(OUTPUT_FILE, csvContent, 'utf-8');

  // Summary statistics
  const withLK = rows.filter(r => r[7]).length;
  const withAK = rows.filter(r => r[8]).length;
  const withLR = rows.filter(r => r[9]).length;
  const withZK = rows.filter(r => r[10]).length;
  const withTotal = rows.filter(r => r[11]).length;
  console.log(`\n=== Summary ===`);
  console.log(`Total configuration rows: ${rows.length}`);
  console.log(`Rows with Lichtkuppel price: ${withLK}`);
  console.log(`Rows with Aufsatzkranz price: ${withAK}`);
  console.log(`Rows with Lüfterrahmen price: ${withLR}`);
  console.log(`Rows with Zusatzkosten: ${withZK}`);
  console.log(`Rows with a total > 0: ${withTotal}`);
  console.log(`Unique price lookups: LK=${lkItems.length} AK=${akItems.length} LR=${lrItems.length} ZK=${zkItems.length}`);
  console.log(`Output: ${OUTPUT_FILE}`);

  await browser.close();
})();
