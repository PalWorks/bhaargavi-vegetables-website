# Architecture — Bhaargavi Fresh Cuts

## System design

A purely static Single Page Application. No server, no database.

1. **Frontend:** React 19, Vite 6, Tailwind CSS 4, TypeScript.
2. **State:** React Context (`CartContext`, `LanguageContext`). Cart is mirrored to
   `localStorage` (validated + price-reconciled on hydration).
3. **Data source:** a Google Sheet ("Bhaargavi Vegetables - SKU Item Master").
   Build-time scripts fetch it into `src/data/*.json`, imported by `src/constants.ts`.
4. **Checkout:** WhatsApp deep link (`wa.me`). No payment gateway.
5. **Order logging:** a Google Apps Script web app (`apps-script/Code.gs`) that also
   recomputes the order total from the catalog server-side (tamper/stale-price check).
6. **i18n:** English / Tamil / Hindi. UI strings in `src/locales/`; product content is
   machine-translated at build time (`scripts/translate-menu.cjs`).
7. **Analytics:** Google Analytics 4 (`G-0G41ZVRP04`) + Microsoft Clarity (`xhu2xeyyc0`),
   loaded in `index.html` (allowed via the CSP `meta`).
8. **Hosting:** Cloudflare Pages (project `bhaargavi-website`), domain
   `bhaargavifreshcuts.com` (apex serves the site; `www` 301-redirects to apex via a
   Cloudflare Redirect Rule).

## Component tree

- `App.tsx` (Root, ErrorBoundary, Providers, Router)
  - `Layout` (ScrollVideoBackground, Navbar, Footer, CartSidebar, StickyCart)
    - `HomePage` (Hero, Products, ReviewCarousel, GoogleReviews, InstagramFeed)
    - Policy pages (`PrivacyPolicy`, `Terms`, `Refund`, `Shipping`)

## Data flow: Sheet to storefront

```
Google Sheet (SKU Item Master)
  ├─ Config tab        ──fetch-config.cjs──▶ src/data/config.json      ──▶ SITE_CONFIG
  └─ ProductCatalog tab ──fetch-menu.cjs───▶ src/data/menu.json        ──▶ MENU_ITEMS
                              │                (English catalog: name, desc,
                              │                 category, badge, image, sizes)
                              └─translate-menu.cjs
                                   ├─▶ menu.json .i18n  (ta/hi name/desc/ingredients)
                                   ├─▶ src/data/categories-i18n.json   (ta/hi tab labels)
                                   └─▶ src/data/i18n-cache.json        (translation cache)
```

- `fetch-menu.cjs` locates columns by header name (order-independent), drops rows with
  no priced size, sorts by `SortOrder`, and self-heals Unsplash placeholder image URLs
  to the local `/menu/<slug>.png` when one exists.
- `translate-menu.cjs` translates only new/changed strings (cache-first), so it is cheap
  and deterministic; failure falls back to English and never breaks the build.
- Category tabs are derived at render from the `Category` column (free-form, comma-
  separated for multiple). Labels come from `categories-i18n.json`, English fallback.

## Data flow: order

1. User adds items; `CartContext` holds state and mirrors it to `localStorage`.
   Product cards display localized text, but the cart stores the **English** name and
   the **catalog** price (integrity).
2. On checkout, `reconcileCartPrices` re-derives prices from `MENU_ITEMS`, the message
   is built with real newlines, and the `wa.me` URL is `encodeURIComponent`-ed.
3. Best-effort `fetch` (POST, `no-cors`, 2s `AbortController` timeout) to
   `VITE_APPS_SCRIPT_URL` logs the order; it never blocks the WhatsApp handoff.
4. WhatsApp opens with the prefilled order.
5. `Code.gs` recomputes the total from `ProductCatalog`, writes a row to the `Orders`
   tab with client vs server total and a MATCH/MISMATCH flag, sanitizing cells against
   spreadsheet formula injection.

## Deploy pipeline

- `.github/workflows/publish.yml` — on-demand (`workflow_dispatch` / `repository_dispatch`,
  and the spreadsheet's "Publish catalog to website" button). Fetches config + menu,
  auto-translates, builds, deploys.
- `.github/workflows/weekly-sync-and-deploy.yml` — Monday cron; also syncs Instagram +
  carousel images, lints, tests, builds, deploys.
- Both share a `concurrency` group and commit-then-rebase so they cannot race.
- Build injects `VITE_APPS_SCRIPT_URL` and `VITE_GOOGLE_PLACE_ID` from GitHub secrets.
