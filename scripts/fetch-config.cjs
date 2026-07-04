#!/usr/bin/env node
// scripts/fetch-config.cjs
// Fetches the "Config" tab from Google Sheets and writes src/data/config.json.
//
// The Config tab is edited by non-developers, so the parser is deliberately forgiving:
//   - it scans a wide range (A1:B50) rather than assuming a fixed start row,
//   - it accepts the key in EITHER column (label|value or value|label),
//   - it matches keys by a normalized alias table (so "Min Order Value", "minOrderValue",
//     "Minimum Order" all map to minOrderValue),
//   - it ignores any row that doesn't match a known key (e.g. the image-guideline notes).
// Anything not found in the sheet falls back to DEFAULTS.

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.SKUITEMMASTER_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.BHAARGAVI_SHEETS_ID || '1Ao_1pGEsPkCRgtOho02ZqaAUOsMUiuJiaTEsLbPHQW8';
const RANGE = 'Config!A1:B50';
const OUTPUT = path.join(__dirname, '..', 'src', 'data', 'config.json');

const DEFAULTS = {
  minOrderValue: 199,
  waNumber: '916385114580',
  deliveryDays: 'Monday to Saturday',
  deliveryHours: '6 AM to 8 PM',
  deliveryNote: 'Orders above Rs 199 are eligible for delivery within our service area.',
};

// Normalized label -> canonical config key.
const KEY_ALIASES = {
  minordervalue: 'minOrderValue', minorder: 'minOrderValue', minimumorder: 'minOrderValue', minimumordervalue: 'minOrderValue',
  wanumber: 'waNumber', whatsappnumber: 'waNumber', whatsapp: 'waNumber', whatsappno: 'waNumber',
  deliverydays: 'deliveryDays', days: 'deliveryDays',
  deliveryhours: 'deliveryHours', hours: 'deliveryHours',
  deliverynote: 'deliveryNote', deliverynotes: 'deliveryNote', note: 'deliveryNote',
};
const NUMERIC_KEYS = new Set(['minOrderValue']);

const normalize = (s) => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, '');

/**
 * Turns raw sheet rows ([[a,b],...]) into a config object. Pure + exported for testing.
 */
function parseConfigRows(rows) {
  const config = {};
  for (const row of Array.isArray(rows) ? rows : []) {
    if (!Array.isArray(row)) continue;
    const [a, b] = row;
    let key, value;
    if (KEY_ALIASES[normalize(a)]) { key = KEY_ALIASES[normalize(a)]; value = b; }
    else if (KEY_ALIASES[normalize(b)]) { key = KEY_ALIASES[normalize(b)]; value = a; }
    else continue;

    if (value == null || String(value).trim() === '') continue;
    const trimmed = String(value).trim();
    if (NUMERIC_KEYS.has(key)) {
      const num = Number(trimmed);
      if (!Number.isNaN(num)) config[key] = num;
    } else {
      config[key] = trimmed;
    }
  }
  return config;
}

function main() {
  if (!API_KEY) {
    console.warn('[fetch-config] SKUITEMMASTER_GOOGLE_SHEETS_API_KEY not set — skipping');
    process.exit(0);
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(RANGE)}?key=${API_KEY}`;
  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        const config = parseConfigRows(parsed.values || []);
        const merged = { ...DEFAULTS, ...config };
        const found = Object.keys(config);
        fs.writeFileSync(OUTPUT, JSON.stringify(merged, null, 2) + '\n');
        console.log(`[fetch-config] Read ${found.length} key(s) from sheet [${found.join(', ') || 'none'}]; wrote`, merged);
      } catch (err) {
        console.error('[fetch-config] Parse error:', err.message);
        process.exit(1);
      }
    });
  }).on('error', (err) => {
    console.error('[fetch-config] Fetch error:', err.message);
    process.exit(1);
  });
}

module.exports = { parseConfigRows, DEFAULTS, KEY_ALIASES, normalize };

if (require.main === module) main();
