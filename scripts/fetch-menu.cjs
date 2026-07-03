#!/usr/bin/env node
// scripts/fetch-menu.cjs
// Fetches Sheet 1 (Products) from Google Sheets and writes src/data/menu.json
// Column mapping:
// A=SortOrder B=Name C=Description D=Category E=Badge F=Image G=Ingredients
// H=100g I=200g J=250g K=300g L=500g M=1kg N=2kg O=3kg P=5kg Q=10kg

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.SKUITEMMASTER_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.BHAARGAVI_SHEETS_ID || '1Ao_1pGEsPkCRgtOho02ZqaAUOsMUiuJiaTEsLbPHQW8';
const RANGE = 'Products!A2:Q200';
const OUTPUT = path.join(__dirname, '..', 'src', 'data', 'menu.json');

if (!API_KEY) {
  console.warn('[fetch-menu] SKUITEMMASTER_GOOGLE_SHEETS_API_KEY not set — skipping');
  process.exit(0);
}

const SIZE_COLS = [
  { col: 7, key: '100g', label: '100 g' },
  { col: 8, key: '200g', label: '200 g' },
  { col: 9, key: '250g', label: '250 g' },
  { col: 10, key: '300g', label: '300 g' },
  { col: 11, key: '500g', label: '500 g' },
  { col: 12, key: '1kg', label: '1 kg' },
  { col: 13, key: '2kg', label: '2 kg' },
  { col: 14, key: '3kg', label: '3 kg' },
  { col: 15, key: '5kg', label: '5 kg' },
  { col: 16, key: '10kg', label: '10 kg' },
];

const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}?key=${API_KEY}`;

https.get(url, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      const rows = (parsed.values || []).filter(r => r[1]); // skip empty name rows

      const items = rows.map((row, idx) => {
        const packSizes = SIZE_COLS
          .filter(s => row[s.col] && !isNaN(Number(row[s.col])) && Number(row[s.col]) > 0)
          .map(s => ({ weight: s.label, price: Number(row[s.col]) }));

        const badge = (row[4] || '').trim().toLowerCase();
        return {
          id: String(idx + 1),
          name: (row[1] || '').trim(),
          description: (row[2] || '').trim(),
          category: (row[3] || 'cut').trim().toLowerCase(),
          badge: (row[4] || '').trim() || undefined,
          image: (row[5] || '').trim(),
          ingredients: row[6] ? row[6].split(',').map(s => s.trim()) : [],
          packSizes,
          isNew: badge === 'new',
          isBestseller: badge === 'bestseller',
          isPreOrder: badge === 'pre-order',
          isSoldOut: badge === 'sold out',
        };
      }).filter(item => item.packSizes.length > 0);

      fs.writeFileSync(OUTPUT, JSON.stringify(items, null, 2));
      console.log(`[fetch-menu] Wrote ${items.length} products to ${OUTPUT}`);
    } catch (err) {
      console.error('[fetch-menu] Parse error:', err.message);
      process.exit(1);
    }
  });
}).on('error', err => {
  console.error('[fetch-menu] Fetch error:', err.message);
  process.exit(1);
});
