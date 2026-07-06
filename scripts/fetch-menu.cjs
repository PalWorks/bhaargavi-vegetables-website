#!/usr/bin/env node
// scripts/fetch-menu.cjs
// Fetches the ProductCatalog tab from Google Sheets and writes src/data/menu.json.
//
// Columns are located BY HEADER NAME (order-independent). Expected headers:
//   SortOrder, Name, Description, Category, Badge, Ingredients, Image,
//   and size columns: 100g, 200g, 250g, 300g, 500g, 1kg, 2kg, 3kg, 5kg, 10kg
//
// Output shape matches what src/constants.ts consumes: each item carries raw
// numeric size keys (item['250g'], item['1kg'], ...) which buildPackSizes() reads.

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = process.env.SKUITEMMASTER_GOOGLE_SHEETS_API_KEY;
const SPREADSHEET_ID = process.env.BHAARGAVI_SHEETS_ID || '1Ao_1pGEsPkCRgtOho02ZqaAUOsMUiuJiaTEsLbPHQW8';
const RANGE = 'ProductCatalog!A1:Z1000';
const OUTPUT = path.join(__dirname, '..', 'src', 'data', 'menu.json');

const SIZE_LABELS = ['100g', '200g', '250g', '300g', '500g', '1kg', '2kg', '3kg', '5kg', '10kg'];

function convertDriveUrl(url) {
  if (!url || !url.includes('drive.google.com')) return url;
  let id = null;
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) id = fileMatch[1];
  if (!id) {
    const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) id = idMatch[1];
  }
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : url;
}

/**
 * Transform raw sheet rows (rows[0] = header) into menu items.
 * Exported so the shape can be validated offline against a downloaded snapshot.
 */
function rowsToItems(rows) {
  if (!rows || rows.length < 2) return [];

  const headers = rows[0].map(h => (h ? String(h).toLowerCase().trim() : ''));
  const colIdx = (name) => headers.indexOf(name.toLowerCase());

  const sortCol = colIdx('sortorder');
  const nameCol = colIdx('name');
  const descCol = colIdx('description');
  const catCol = colIdx('category');
  const badgeCol = colIdx('badge');
  const imageCol = colIdx('image');
  const ingredientsCol = colIdx('ingredients');
  if (nameCol === -1) return [];

  const sizeCols = SIZE_LABELS
    .map(label => ({ col: colIdx(label), label }))
    .filter(s => s.col !== -1);

  return rows.slice(1)
    .filter(r => r[nameCol])
    .map((row, idx) => {
      const item = {
        id: String(idx + 1),
        sortOrder: Number(row[sortCol]) || (idx + 1),
        name: String(row[nameCol] || '').trim(),
        description: String(row[descCol] || '').trim(),
        // Kept as typed (may be comma-separated for multiple categories); the site
        // splits, lowercases for matching, and shows known keys with translated labels.
        category: String(row[catCol] || 'cut').trim(),
        badge: String(row[badgeCol] || '').trim(),
        image: convertDriveUrl(String(row[imageCol] || '').trim()),
        ingredients: String(row[ingredientsCol] || '').trim(),
      };
      // Raw numeric size keys, only for offered sizes — matches constants.ts buildPackSizes.
      sizeCols.forEach(s => {
        const price = Number(row[s.col]);
        if (!isNaN(price) && price > 0) item[s.label] = price;
      });
      return item;
    })
    // Drop rows with no priced size (blank/spacer rows) — they'd render as unaddable.
    .filter(item => SIZE_LABELS.some(l => item[l] > 0))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function writeItems(items) {
  // Guard: never clobber a good catalog with an empty result (transient API blip,
  // wrong range, or a temporarily broken sheet). Keep the last-known-good file instead.
  if (items.length === 0) {
    let existingCount = 0;
    try { existingCount = JSON.parse(fs.readFileSync(OUTPUT, 'utf8')).length; } catch { /* no/invalid existing file */ }
    if (existingCount > 0) {
      console.warn(`[fetch-menu] ⚠️  Parsed 0 products but ${existingCount} already exist — keeping existing menu.json (not overwriting with empty).`);
      return;
    }
    console.warn('[fetch-menu] ⚠️  Parsed 0 products and no existing catalog. The storefront will show an empty product grid until this is fixed.');
  }
  fs.writeFileSync(OUTPUT, JSON.stringify(items, null, 2));
  console.log(`[fetch-menu] Wrote ${items.length} products to ${OUTPUT}`);
}

function main() {
  if (!API_KEY) {
    console.warn('[fetch-menu] SKUITEMMASTER_GOOGLE_SHEETS_API_KEY not set — skipping');
    process.exit(0);
  }
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(RANGE)}?key=${API_KEY}`;
  https.get(url, res => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      try {
        const parsed = JSON.parse(data);
        if (parsed.error) {
          console.error('[fetch-menu] Sheets API error:', parsed.error.message);
          process.exit(1);
        }
        writeItems(rowsToItems(parsed.values || []));
      } catch (err) {
        console.error('[fetch-menu] Parse error:', err.message);
        process.exit(1);
      }
    });
  }).on('error', err => {
    console.error('[fetch-menu] Fetch error:', err.message);
    process.exit(1);
  });
}

module.exports = { rowsToItems, convertDriveUrl, SIZE_LABELS };

if (require.main === module) main();
