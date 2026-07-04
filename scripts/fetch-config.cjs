#!/usr/bin/env node
// scripts/fetch-config.cjs
// Fetches Sheet 2 (Config) from Google Sheets and writes src/data/config.json

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.SKUITEMMASTER_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.BHAARGAVI_SHEETS_ID || '1Ao_1pGEsPkCRgtOho02ZqaAUOsMUiuJiaTEsLbPHQW8';
const RANGE = 'Config!A2:B20';
const OUTPUT = path.join(__dirname, '..', 'src', 'data', 'config.json');

if (!API_KEY) {
  console.warn('[fetch-config] SKUITEMMASTER_GOOGLE_SHEETS_API_KEY not set — skipping');
  process.exit(0);
}

const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

https.get(url, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const rows = parsed.values || [];
      const config = {};
      rows.forEach(([key, value]) => {
        if (key && value !== undefined) config[key.trim()] = isNaN(Number(value)) ? value.trim() : Number(value);
      });
      const defaults = {
        minOrderValue: 199,
        waNumber: '916385114580',
        deliveryDays: 'Monday to Saturday',
        deliveryHours: '6 AM to 8 PM',
        deliveryNote: 'Orders above Rs 199 are eligible for delivery within our service area.',
      };
      const merged = { ...defaults, ...config };
      fs.writeFileSync(OUTPUT, JSON.stringify(merged, null, 2));
      console.log('[fetch-config] Config written:', merged);
    } catch (err) {
      console.error('[fetch-config] Parse error:', err.message);
      process.exit(1);
    }
  });
}).on('error', err => {
  console.error('[fetch-config] Fetch error:', err.message);
  process.exit(1);
});
