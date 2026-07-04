# Order webhook + server-side price recompute (Google Apps Script)

`Code.gs` is the backend for order logging. It receives each order the website posts, **recomputes
the total from the `ProductCatalog` tab server-side**, and appends a row to an `Orders` tab with the
client total, the server total, and a `MATCH` / `MISMATCH` flag. This is the server half of the
order-integrity work — the site already re-derives prices client-side, and this verifies them
against the sheet independently.

## One-time deployment (≈5 min)

1. Open the **Bhaargavi Vegetables - SKU Item Master** spreadsheet.
2. **Extensions → Apps Script**. Delete any placeholder code and paste the contents of
   [`Code.gs`](./Code.gs). Save.
3. **Deploy → New deployment**. Click the gear → **Web app**. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. **Deploy**, authorize when prompted, and copy the **Web app URL** (ends in `/exec`).
5. Put that URL in the site config as `VITE_APPS_SCRIPT_URL`:
   - GitHub → repo **Settings → Secrets and variables → Actions** → update/add
     `VITE_APPS_SCRIPT_URL` (used at build time by the deploy workflow).
   - For local testing, add it to `.env`.
6. (Optional) Open the `/exec` URL in a browser — it should return `{"ok":true,...}`.

The `Orders` tab is created automatically on the first order (in the same spreadsheet). To log to a
**separate** spreadsheet, set `ORDERS_SPREADSHEET_ID` at the top of `Code.gs`.

## What the site sends

`recordOrder()` POSTs JSON (best-effort, `no-cors`, 2s timeout — never blocks WhatsApp):

```json
{
  "orderId": "BV-1720000000000",
  "timestamp": "2026-07-04 10:45:00",
  "items": "2 x Carrot Cut (250 g) - ₹ 80",
  "lines": [{ "name": "Carrot Cut", "weight": "250 g", "quantity": 2, "unitPrice": 40 }],
  "total": 80, "clientTotal": 80,
  "customNote": "", "address": "12 Main St, Chennai",
  "status": "New", "waNumber": "916385114580"
}
```

The script matches each line to the catalog by **product name + pack size** (e.g. `Carrot Cut` +
`250 g` → the `250g` column), so it does not depend on row order or IDs.

## Requirements on the ProductCatalog tab

For recompute to work, the `ProductCatalog` tab needs a header row containing a **`Name`** column
and one column per pack size named exactly: `100g`, `200g`, `250g`, `300g`, `500g`, `1kg`, `2kg`,
`3kg`, `5kg`, `10kg` (blank cell = size not offered). This is the same schema the build-time
`fetch-menu.cjs` reads, so no extra work if the catalog is already set up.

## Reading the results

Each order row shows **Client Total** vs **Server Total** and a **Match** column:
- `Y` — client and catalog agree. Normal.
- `MISMATCH` — investigate before fulfilling. Usually means the live site had a stale price, or a
  line's SKU wasn't found in the catalog (see the **Unmatched SKUs** column).
