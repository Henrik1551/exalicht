#!/usr/bin/env node
/**
 * Generates SQL INSERT statements from round-configs.csv
 * Output: scripts/output/round-config-inserts.sql
 *
 * Usage: node scripts/generate-round-config-sql.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const csvPath = join(__dirname, 'output', 'round-configs.csv');
const sqlPath = join(__dirname, 'output', 'round-config-inserts.sql');

const csv = readFileSync(csvPath, 'utf-8');
const lines = csv.trim().split('\n');
const header = lines[0].split(',');

console.log(`Parsing ${lines.length - 1} rows...`);

// Parse CSV rows
const rows = [];
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(',');
  if (cols.length < 12) continue;

  const ulw = parseInt(cols[0]);
  const material = cols[1].trim();
  const optik = cols[2].trim();
  const schale = parseInt(cols[3].trim()); // "2-schalig" → 2
  const hoehe = parseInt(cols[4].trim());   // "30 cm" → 30
  const daemmung = parseInt(cols[5].trim()); // "20 mm" → 20
  const luefterVariante = cols[6].trim();
  const lkPreis = parseFloat(cols[7]) || 0;
  const akPreis = parseFloat(cols[8]) || 0;
  const lrPreis = parseFloat(cols[9]) || 0;
  const zusatz = parseFloat(cols[10]) || 0;
  const total = parseFloat(cols[11]) || 0;

  rows.push({ ulw, material, optik, schale, hoehe, daemmung, luefterVariante, lkPreis, akPreis, lrPreis, zusatz, total });
}

console.log(`Parsed ${rows.length} valid rows`);

// Escape single quotes for SQL
const esc = (s) => s.replace(/'/g, "''");

// Generate SQL in batches of 500
const BATCH_SIZE = 500;
let sql = `-- Generated from round-configs.csv on ${new Date().toISOString()}\n`;
sql += `-- ${rows.length} rows\n\n`;
sql += `-- Clear existing data\nTRUNCATE public.round_config_prices;\n\n`;

for (let i = 0; i < rows.length; i += BATCH_SIZE) {
  const batch = rows.slice(i, i + BATCH_SIZE);
  sql += `INSERT INTO public.round_config_prices (ulw_cm, material, optik, schale, hoehe_cm, daemmung_mm, luefterrahmen_variante, lichtkuppel_preis, aufsatzkranz_preis, luefterrahmen_preis, zusatzkosten, total_preis) VALUES\n`;

  const values = batch.map(r =>
    `(${r.ulw}, '${esc(r.material)}', '${esc(r.optik)}', ${r.schale}, ${r.hoehe}, ${r.daemmung}, '${esc(r.luefterVariante)}', ${r.lkPreis}, ${r.akPreis}, ${r.lrPreis}, ${r.zusatz}, ${r.total})`
  );

  sql += values.join(',\n') + ';\n\n';
}

writeFileSync(sqlPath, sql);
console.log(`Generated SQL file: ${sqlPath}`);
console.log(`File size: ${(Buffer.byteLength(sql) / 1024 / 1024).toFixed(2)} MB`);
