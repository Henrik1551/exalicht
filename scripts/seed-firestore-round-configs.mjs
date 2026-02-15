#!/usr/bin/env node
/**
 * Seeds Firestore with round config pricing data from CSV.
 *
 * Prerequisites:
 *   npm install firebase-admin
 *
 * Usage:
 *   GOOGLE_APPLICATION_CREDENTIALS=path/to/serviceAccountKey.json \
 *   FIREBASE_PROJECT_ID=your-project-id \
 *   node scripts/seed-firestore-round-configs.mjs
 *
 * The service account key can be downloaded from:
 *   Firebase Console → Project Settings → Service Accounts → Generate New Private Key
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath = join(__dirname, 'output', 'round-configs.csv');

// Initialize Firebase Admin
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
if (!credentialsPath) {
  console.error('Error: Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account key path');
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(credentialsPath, 'utf-8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

/**
 * Generate deterministic document ID from config params.
 * Must match the makeConfigDocId() function in src/hooks/useRoundConfigPrice.ts
 */
function makeDocId(ulw, schale, hoehe, daemmung, material, optik, luefter) {
  return `${ulw}_${schale}_${hoehe}_${daemmung}_${encodeURIComponent(material)}_${encodeURIComponent(optik)}_${encodeURIComponent(luefter)}`;
}

async function main() {
  console.log('Reading CSV...');
  const csv = readFileSync(csvPath, 'utf-8');
  const lines = csv.trim().split('\n');
  console.log(`Parsed ${lines.length - 1} rows`);

  // Parse all rows
  const rows = [];
  const variantsByDiameter = new Map(); // ulw → Set of luefterrahmen variants

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',');
    if (cols.length < 12) continue;

    const ulw = parseInt(cols[0]);
    const material = cols[1].trim();
    const optik = cols[2].trim();
    const schale = parseInt(cols[3].trim());
    const hoehe = parseInt(cols[4].trim());
    const daemmung = parseInt(cols[5].trim());
    const luefter = cols[6].trim();
    const lkPreis = parseFloat(cols[7]) || 0;
    const akPreis = parseFloat(cols[8]) || 0;
    const lrPreis = parseFloat(cols[9]) || 0;
    const zusatz = parseFloat(cols[10]) || 0;
    const total = parseFloat(cols[11]) || 0;

    const docId = makeDocId(ulw, schale, hoehe, daemmung, material, optik, luefter);

    rows.push({
      docId,
      data: {
        ulw_cm: ulw,
        material,
        optik,
        schale,
        hoehe_cm: hoehe,
        daemmung_mm: daemmung,
        luefterrahmen_variante: luefter,
        lichtkuppel_preis: lkPreis,
        aufsatzkranz_preis: akPreis,
        luefterrahmen_preis: lrPreis,
        zusatzkosten: zusatz,
        total_preis: total,
      },
    });

    // Track variants per diameter
    if (!variantsByDiameter.has(ulw)) {
      variantsByDiameter.set(ulw, new Set());
    }
    variantsByDiameter.get(ulw).add(luefter);
  }

  console.log(`Writing ${rows.length} documents to round_config_prices...`);

  // Batch write in groups of 500 (Firestore batch limit)
  const BATCH_SIZE = 500;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = rows.slice(i, i + BATCH_SIZE);

    for (const row of chunk) {
      const ref = db.collection('round_config_prices').doc(row.docId);
      batch.set(ref, row.data);
    }

    await batch.commit();
    console.log(`  Written ${Math.min(i + BATCH_SIZE, rows.length)} / ${rows.length}`);
  }

  // Write variants lookup documents
  console.log(`Writing ${variantsByDiameter.size} variant lookup documents...`);
  const variantBatch = db.batch();
  for (const [ulw, variants] of variantsByDiameter) {
    const ref = db.collection('round_config_variants').doc(String(ulw));
    variantBatch.set(ref, {
      ulw_cm: ulw,
      luefterrahmen_varianten: Array.from(variants).sort(),
    });
  }
  await variantBatch.commit();

  console.log('Done! Firestore seeded successfully.');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
