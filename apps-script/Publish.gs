/**
 * Bhaargavi Fresh Cuts — spreadsheet-side helpers.
 *
 * Adds a "Bhaargavi" menu to the spreadsheet with two actions:
 *   1. "Publish catalog to website"      → triggers the GitHub `publish.yml` workflow,
 *                                           which re-reads ProductCatalog, rebuilds, and
 *                                           deploys the site (live in ~2-3 min).
 *   2. "Backfill missing products (once)" → appends products that exist on the website
 *                                           but not yet in ProductCatalog. Idempotent:
 *                                           skips any product whose Name already exists.
 *
 * SETUP (one time)
 *   Extensions → Apps Script → add this file (File → +, name it "Publish.gs"), Save.
 *   Then set a GitHub token so the Publish button can trigger a deploy:
 *     Apps Script → Project Settings (gear) → Script Properties → Add property
 *       Name:  PUSH_TO_GITHUB_TOKEN
 *       Value: <a GitHub token — see apps-script/README.md for how to create it>
 *   Reload the spreadsheet; the "Bhaargavi" menu appears.
 */

var GITHUB_OWNER = 'PalWorks';
var GITHUB_REPO = 'bhaargavi-vegetables-website';
var PUBLISH_WORKFLOW = 'publish.yml';
var CATALOG_SHEET = 'ProductCatalog';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Bhaargavi')
    .addItem('Publish catalog to website', 'publishToWebsite')
    .addSeparator()
    .addItem('Backfill missing products (once)', 'backfillMissingProducts')
    .addToUi();
}

/** Triggers the publish.yml workflow on GitHub (workflow_dispatch). */
function publishToWebsite() {
  var ui = SpreadsheetApp.getUi();
  var token = PropertiesService.getScriptProperties().getProperty('PUSH_TO_GITHUB_TOKEN');
  if (!token) {
    ui.alert('No PUSH_TO_GITHUB_TOKEN set.\n\nAdd it in Project Settings → Script Properties. See apps-script/README.md.');
    return;
  }
  var url = 'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO +
    '/actions/workflows/' + PUBLISH_WORKFLOW + '/dispatches';
  var resp = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    payload: JSON.stringify({ ref: 'main' }),
    muteHttpExceptions: true,
  });
  var code = resp.getResponseCode();
  if (code === 204) {
    ui.alert('✅ Publish started.\n\nThe website will update in about 2-3 minutes.\nTrack it under the repo\'s Actions tab.');
  } else {
    ui.alert('Publish failed (HTTP ' + code + ').\n\n' + resp.getContentText());
  }
}

// Products present on the website but not (yet) in ProductCatalog. Prices/copy mirror
// the site's built-in defaults so the storefront looks identical after the switch.
var MISSING_PRODUCTS = [
  { name: 'Muskmelon Cut', description: 'Sweet muskmelon deseeded and cut, a refreshing summer snack.', category: 'cut', badge: '', ingredients: 'Muskmelon', image: '/menu/muskmelon_cut.png', sizes: { '200g': 40, '500g': 90 } },
  { name: 'Ripe Peeled Jackfruit', description: 'Ripe jackfruit segments peeled and cleaned, sweet, fragrant, effort-free.', category: 'cut', badge: '', ingredients: 'Jackfruit', image: '/menu/peeled_jackfruit.png', sizes: { '250g': 60, '500g': 110 } },
  { name: 'Brown Channa Sprouts', description: 'Freshly sprouted brown chickpeas, high protein, no cooking needed.', category: 'health', badge: 'new', ingredients: 'Brown chickpeas', image: '/menu/brown_channa_sprouts.png', sizes: { '200g': 50, '500g': 115 } },
  { name: 'Mixed Sprouts', description: 'A nutritious blend of sprouted lentils, chickpeas, and moong.', category: 'health', badge: 'bestseller', ingredients: 'Chickpeas, Moong, Lentils', image: '/menu/mixed_sprouts.png', sizes: { '200g': 50, '500g': 115 } },
  { name: 'Green Moong Sprouts', description: 'Crisp green moong sprouts, great for salads, sundal, or a quick snack.', category: 'health', badge: '', ingredients: 'Green moong', image: '/menu/green_moong_sprouts.png', sizes: { '200g': 45, '500g': 100 } },
  { name: 'Salad Mix', description: 'A fresh blend of salad vegetables: cucumber, carrot, tomato, lettuce.', category: 'health', badge: '', ingredients: 'Cucumber, Carrot, Tomato, Lettuce', image: '/menu/salad_mix.png', sizes: { '200g': 55, '500g': 120 } },
  { name: 'Weekly Veggie Combo', description: 'Our handpicked combo of the freshest vegetables for the week: sambar mix, poriyal cut, sprouts and salad mix.', category: 'offers', badge: 'pre-order', ingredients: 'Sambar mix, Poriyal mix, Mixed sprouts, Salad mix', image: '/menu/weekly_veggie_combo.png', sizes: { '1kg': 299 } },
];

/** Appends MISSING_PRODUCTS to ProductCatalog. Safe to run more than once. */
function backfillMissingProducts() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CATALOG_SHEET);
  if (!sheet) { ui.alert('No "' + CATALOG_SHEET + '" tab found.'); return; }

  var values = sheet.getDataRange().getValues();
  var headers = values[0].map(function (h) { return String(h == null ? '' : h).toLowerCase().trim(); });
  var idx = function (name) { return headers.indexOf(name.toLowerCase()); };

  var cName = idx('name');
  var cSort = idx('sortorder');
  var cDesc = idx('description');
  var cCat = idx('category');
  var cBadge = idx('badge');
  var cIng = idx('ingredients');
  var cImg = idx('image');
  if (cName === -1) { ui.alert('ProductCatalog has no "Name" column header.'); return; }

  // Existing names (lowercased) so we never duplicate, and the current max SortOrder.
  var existing = {};
  var maxSort = 0;
  for (var r = 1; r < values.length; r++) {
    var nm = String(values[r][cName] || '').trim();
    if (nm) existing[nm.toLowerCase()] = true;
    var so = Number(values[r][cSort]);
    if (!isNaN(so) && so > maxSort) maxSort = so;
  }

  var width = headers.length;
  var added = 0;
  var skipped = [];
  MISSING_PRODUCTS.forEach(function (p) {
    if (existing[p.name.toLowerCase()]) { skipped.push(p.name); return; }
    var row = new Array(width).fill('');
    if (cSort !== -1) row[cSort] = ++maxSort;
    row[cName] = p.name;
    if (cDesc !== -1) row[cDesc] = p.description;
    if (cCat !== -1) row[cCat] = p.category;
    if (cBadge !== -1) row[cBadge] = p.badge;
    if (cIng !== -1) row[cIng] = p.ingredients;
    if (cImg !== -1) row[cImg] = p.image;
    Object.keys(p.sizes).forEach(function (label) {
      var c = idx(label);
      if (c !== -1) row[c] = p.sizes[label];
    });
    sheet.appendRow(row);
    added++;
  });

  ui.alert('Backfill complete.\n\nAdded: ' + added +
    (skipped.length ? '\nSkipped (already present): ' + skipped.join(', ') : '') +
    '\n\nNext: use Bhaargavi → Publish catalog to website.');
}
