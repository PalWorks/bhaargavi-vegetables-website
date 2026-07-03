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
const RANGE = 'Products!A1:Z200';
const OUTPUT = path.join(__dirname, '..', 'src', 'data', 'menu.json');

if (!API_KEY) {
  console.warn('[fetch-menu] SKUITEMMASTER_GOOGLE_SHEETS_API_KEY not set — skipping');
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
      if (rows.length < 2) {
        console.log('[fetch-menu] No data found.');
        return;
      }
      
      const headers = rows[0].map(h => h ? h.toLowerCase().trim() : '');
      const dataRows = rows.slice(1);
      
      const colIdx = (name) => headers.indexOf(name.toLowerCase());
      
      const nameCol = colIdx('name');
      const descCol = colIdx('description');
      const catCol = colIdx('category');
      const badgeCol = colIdx('badge');
      const imageCol = colIdx('image');
      const ingredientsCol = colIdx('ingredients');
      
      const SIZE_LABELS = ['100g', '200g', '250g', '300g', '500g', '1kg', '2kg', '3kg', '5kg', '10kg'];
      const sizeCols = SIZE_LABELS.map(label => ({
        col: colIdx(label),
        label: label.replace('g', ' g').replace('kg', ' kg')
      })).filter(s => s.col !== -1);

      const convertDriveUrl = (url) => {
        if (!url || !url.includes('drive.google.com')) return url;
        let id = null;
        const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileMatch) id = fileMatch[1];
        if (!id) {
          const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
          if (idMatch) id = idMatch[1];
        }
        return id ? `https://drive.google.com/uc?export=view&id=${id}` : url;
      };

      const items = dataRows.filter(r => r[nameCol]).map((row, idx) => {
        const packSizes = sizeCols
          .filter(s => row[s.col] && !isNaN(Number(row[s.col])) && Number(row[s.col]) > 0)
          .map(s => ({ weight: s.label, price: Number(row[s.col]) }));

        const badge = (row[badgeCol] || '').trim().toLowerCase();
        const rawImage = (row[imageCol] || '').trim();
        return {
          id: String(idx + 1),
          name: (row[nameCol] || '').trim(),
          description: (row[descCol] || '').trim(),
          category: (row[catCol] || 'cut').trim().toLowerCase(),
          badge: (row[badgeCol] || '').trim() || undefined,
          image: convertDriveUrl(rawImage),
          ingredients: row[ingredientsCol] ? row[ingredientsCol].split(',').map(s => s.trim()) : [],
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
