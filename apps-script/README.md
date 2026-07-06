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
- `Y` — client and catalog agree AND every line matched the catalog. Normal.
- `MISMATCH` — investigate before fulfilling. Means the totals disagree, or at least one line's SKU
  wasn't found in the catalog (see the **Unmatched SKUs** column) so its price couldn't be verified.

**Hardening:** the script only returns `Y` when all SKUs matched, and every written cell is
sanitized so a value beginning with `=`, `+`, `-`, or `@` is stored as literal text (prevents
spreadsheet formula injection from a malicious order). After editing `Code.gs`, redeploy via
**Deploy → Manage deployments → edit → Version: New version** to keep the same `/exec` URL.

---

# Publish catalog to the website (Publish.gs)

`Publish.gs` adds a **Bhaargavi** menu with a single action, **Publish catalog to website**, so the
owner can push catalog changes live without touching code. The website reads the **ProductCatalog**
tab (`scripts/fetch-menu.cjs` → `src/data/menu.json`); "Publish" re-runs that sync, rebuilds, and deploys.

## One-time setup

1. **Add the file.** Extensions → Apps Script → File → **+** → name it `Publish.gs` → paste the
   contents of [`Publish.gs`](./Publish.gs) → Save. Reload the spreadsheet; a **Bhaargavi** menu appears.
2. **Create a GitHub token** so the Publish button can trigger a deploy:
   - GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens →
     Generate new token**.
   - **Resource owner:** `PalWorks`. **Repository access:** Only select repositories →
     `bhaargavi-vegetables-website`.
   - **Repository permissions:** **Actions → Read and write**, **Contents → Read-only**.
   - Generate and copy the token (starts with `github_pat_`).
3. **Store the token.** Apps Script → Project Settings (gear) → **Script Properties** → Add property:
   - Name: `PUSH_TO_GITHUB_TOKEN`  Value: *(the token)*

(A one-time `backfillMissingProducts` migration used to live here; it has been completed and removed.)

## Daily use

Edit prices/products in **ProductCatalog**, then: Bhaargavi → **Publish catalog to website**.
The `publish.yml` GitHub Action re-reads the sheet, rebuilds, and deploys — live in ~2-3 minutes.

## Column requirements (ProductCatalog)

`fetch-menu.cjs` locates columns **by header name** (order-independent). Headers used:
`SortOrder, Name, Description, Category, Badge, Ingredients, Image`, plus size columns
`100g, 200g, 250g, 300g, 500g, 1kg, 2kg, 3kg, 5kg, 10kg` (blank = size not offered; a row with no
priced size is skipped). Notes:
- **Category** drives the storefront tabs. Any keyword becomes its own tab, and an item may list
  **several categories comma-separated** (e.g. `cut, offers`) to appear under each. Matching is
  case-insensitive; the labels `cut`, `fresh`, `health`, `offers` render as their translated tab
  names ("Cut Vegetables", etc.), any other keyword shows exactly as typed. "All" always lists
  everything.
- **Badge** values `new`, `bestseller`, `pre-order` are special (they set the product's ribbon /
  pre-order button). Any other text is shown as a plain badge.
- There is **no list/strike-through price column** — discount "was" prices aren't synced.
