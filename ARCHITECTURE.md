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
    - `CategoryPage` (`/category/:slug`) — product grid + `CollectionPage`/`ItemList` schema
    - `ProductPage` (`/products/:slug`) — detail, add-to-cart, WhatsApp CTA, `Product` schema
    - `FaqPage` (`/faq`) — `FAQPage` schema
    - `NotFound` (`*`) — client-side 404 (edge 404 is `public/404.html`)

Every route also renders `Seo` (per-route `<head>`) and `JsonLd` (structured data).
Category/product routes and their slugs are derived from the catalog via `src/utils/slug.ts`.

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

## Build-time pre-render & SEO

The SPA is server-rendered to crawlable static HTML at build (no headless browser):

```
vite build            ──▶ dist/ (client bundle + index.html template)
vite build --ssr      ──▶ dist-server/entry-server.js  (renderToString + StaticRouter)
scripts/prerender.cjs ──▶ dist/<route>/index.html   (SSR HTML injected into #root + per-route <head>)
                     └─ routes from scripts/site-routes.cjs (mirrors src/utils/slug.ts)
                                            │  static + /category/<slug>/ + /products/<slug>/
scripts/generate-sitemap.cjs ──▶ dist/sitemap.xml   (same route source)
prebuild: scripts/optimize-images.cjs  ──▶ public/menu/*.webp  (<picture> + PNG fallback)
```

- The client mounts with **`hydrateRoot`** (`src/index.tsx`) and adopts the SSR HTML — content is in
  the HTML (fast LCP), not gated on JS. SSR runs only the initial render, so hydration is clean.
- Per-route `<head>` via `Seo.tsx` (recorded through `src/utils/head.ts` and injected by the
  prerender); JSON-LD via `JsonLd.tsx`. No SPA catch-all redirect;
  unmatched paths serve `public/404.html` (real 404). Cloudflare 308-normalizes to trailing slash.
- After deploy, `publish.yml` pings **IndexNow** with the sitemap URLs (public key file in `public/`).
- **Core Web Vitals** are logged weekly to a `CoreWebVitals` Sheet tab by `apps-script/CoreWebVitals.gs`
  (PageSpeed Insights API; needs a `PSI_API_KEY` script property).

## Deploy pipeline

- `.github/workflows/publish.yml` — on-demand (`workflow_dispatch` / `repository_dispatch`,
  and the spreadsheet's "Publish catalog to website" button). Fetches config + menu,
  auto-translates, builds, deploys, then pings IndexNow.
- `.github/workflows/weekly-sync-and-deploy.yml` — Monday cron; also syncs Instagram +
  carousel images, lints, tests, builds, deploys.
- Both share a `concurrency` group and commit-then-rebase so they cannot race.
- Build injects `VITE_APPS_SCRIPT_URL` and `VITE_GOOGLE_PLACE_ID` from GitHub secrets.
- **Deploys are intentionally manual/scheduled — there is no `push:` trigger.** Pushing to
  `main` does *not* deploy; production only updates on the Monday cron, a manual
  `gh workflow run publish.yml`, or the spreadsheet's Publish button. Deploy runs via
  GitHub Actions (`cloudflare/pages-action@v1`), not Cloudflare's native git integration
  (the Pages project shows "Git Provider: No").
