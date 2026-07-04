/**
 * Bhaargavi Fresh Cuts — order webhook + server-side price recompute.
 *
 * WHAT IT DOES
 *   Receives each order POSTed by the website (best-effort), independently RECOMPUTES the
 *   order total from the ProductCatalog tab (the true source of prices), and appends a row to
 *   the Orders tab recording BOTH the client-reported total and the server total plus a
 *   MATCH / MISMATCH flag. A mismatch means the client-side price didn't agree with the sheet
 *   (tampering, or a stale catalog on the site) — worth a glance before fulfilling.
 *
 * WHERE TO PUT IT
 *   Open the "Bhaargavi Vegetables - SKU Item Master" spreadsheet → Extensions → Apps Script.
 *   Paste this file. Deploy → New deployment → type "Web app":
 *       Execute as: Me
 *       Who has access: Anyone
 *   Copy the /exec URL and set it as the site's VITE_APPS_SCRIPT_URL (GitHub secret / .env).
 *
 * NOTES
 *   - Binding it to the SKU Item Master spreadsheet lets it read ProductCatalog directly.
 *   - Orders are written to an "Orders" tab in the same spreadsheet by default. To use a
 *     separate spreadsheet, set ORDERS_SPREADSHEET_ID below.
 *   - The site posts with mode:'no-cors', so it can't read the response; the record in the
 *     Orders tab is the source of truth.
 */

var CATALOG_SHEET = 'ProductCatalog';
var ORDERS_SHEET = 'Orders';
var ORDERS_SPREADSHEET_ID = ''; // '' = same spreadsheet this script is bound to
var SIZE_LABELS = ['100g', '200g', '250g', '300g', '500g', '1kg', '2kg', '3kg', '5kg', '10kg'];

function doPost(e) {
  try {
    var order = JSON.parse(e.postData.contents);
    var priceMap = buildPriceMap_();
    var server = recomputeTotal_(order.lines || [], priceMap);
    var clientTotal = Number(order.clientTotal != null ? order.clientTotal : order.total) || 0;
    var match = clientTotal === server.total ? 'Y' : 'MISMATCH';
    appendOrder_(order, clientTotal, server, match);
    return json_({ ok: true, serverTotal: server.total, clientTotal: clientTotal, match: match });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// Optional: lets you sanity-check the deployment in a browser.
function doGet() {
  return json_({ ok: true, service: 'bhaargavi-order-webhook' });
}

function normalizeName_(n) { return String(n == null ? '' : n).toLowerCase().replace(/[^a-z0-9]/g, ''); }
function normalizeWeight_(w) { return String(w == null ? '' : w).toLowerCase().replace(/\s+/g, ''); } // "250 g" -> "250g"

/** Builds { normalizedName|sizeLabel : price } from the ProductCatalog tab. */
function buildPriceMap_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(CATALOG_SHEET);
  var map = {};
  if (!sheet) return map;
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return map;

  var headers = values[0].map(function (h) { return String(h == null ? '' : h).toLowerCase().trim(); });
  var nameCol = headers.indexOf('name');
  if (nameCol === -1) return map;

  var sizeCols = SIZE_LABELS
    .map(function (label) { return { label: label, col: headers.indexOf(label) }; })
    .filter(function (s) { return s.col !== -1; });

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var name = normalizeName_(row[nameCol]);
    if (!name) continue;
    sizeCols.forEach(function (s) {
      var price = Number(row[s.col]);
      if (!isNaN(price) && price > 0) map[name + '|' + s.label] = price;
    });
  }
  return map;
}

/** Recomputes the total from the catalog. Unknown SKUs fall back to the client's unit price. */
function recomputeTotal_(lines, priceMap) {
  var total = 0;
  var detail = [];
  var unmatched = [];
  lines.forEach(function (l) {
    var qty = Number(l.quantity) || 0;
    var key = normalizeName_(l.name) + '|' + normalizeWeight_(l.weight);
    var unit = priceMap[key];
    if (unit === undefined) {
      unit = Number(l.unitPrice) || 0;
      unmatched.push(l.name + ' (' + l.weight + ')');
    }
    total += unit * qty;
    detail.push(qty + ' x ' + l.name + ' (' + l.weight + ') @ ' + unit);
  });
  return { total: total, detail: detail.join('; '), unmatched: unmatched.join(', ') };
}

function ordersSpreadsheet_() {
  return ORDERS_SPREADSHEET_ID
    ? SpreadsheetApp.openById(ORDERS_SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
}

function appendOrder_(order, clientTotal, server, match) {
  var ss = ordersSpreadsheet_();
  var sheet = ss.getSheetByName(ORDERS_SHEET);
  if (!sheet) {
    sheet = ss.insertSheet(ORDERS_SHEET);
    sheet.appendRow(['Timestamp', 'Order ID', 'Items', 'Client Total', 'Server Total', 'Match',
      'Unmatched SKUs', 'Custom Note', 'Address', 'Status', 'WA Number']);
  }
  sheet.appendRow([
    order.timestamp || new Date(),
    order.orderId || '',
    order.items || server.detail,
    clientTotal,
    server.total,
    match,
    server.unmatched || '',
    order.customNote || '',
    order.address || '',
    order.status || 'New',
    order.waNumber || '',
  ]);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
