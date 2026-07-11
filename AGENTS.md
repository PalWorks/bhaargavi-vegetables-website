# Agent Context — Bhaargavi Fresh Cuts

Frontend for **Bhaargavi Fresh Cuts**, a premium fresh-cut vegetable and fruit
delivery service in Chennai, India. Static React SPA (Vite + Tailwind), deployed
to Cloudflare Pages at **https://bhaargavifreshcuts.com** (with `www` 301-redirecting
to the apex).

This file orients any agent working on the project. Read it before making changes.

## Architecture in one paragraph

Zero traditional backend. Products and site config live in a Google Sheet
("Bhaargavi Vegetables - SKU Item Master"); build-time scripts pull them into
`src/data/*.json`, which the React app imports. Checkout hands off to WhatsApp via
a `wa.me` deep link, and each order is also logged best-effort to a Google Apps
Script webhook that independently recomputes the total from the catalog. The site
is trilingual (English / Tamil / Hindi); product content is machine-translated at
build time. See `ARCHITECTURE.md` for the data-flow diagram.

## Ground rules (do not break these)

1. **Zero backend / WhatsApp-first.** No Stripe/Razorpay/UPI gateway, no server, no
   SSR, no database. Checkout must route to `wa.me`. The only "backend" is the
   Apps Script order log (best-effort, `no-cors`, never blocks checkout).
2. **The Google Sheet is the source of truth for products and config**, not the
   React code. Do NOT hardcode products in components. To change the catalog, edit
   the `ProductCatalog` tab and re-publish. There is no hardcoded fallback list
   anymore, so an empty `menu.json` yields an empty grid.
3. **Order integrity.** The cart and order payload must always use the **English**
   product `name` and the catalog price. Localized (Tamil/Hindi) names are for
   display only; leaking them into the order breaks the Apps Script price match.
   Prices shown and checked are re-derived from the catalog (`reconcileCartPrices`)
   so a tampered `localStorage` cart cannot drive the total.
4. **i18n completeness.** All user-facing UI strings live in `src/locales/{en,ta,hi}.ts`
   and are read via `useLanguage().t`. Never hardcode display strings in components.
   `src/locales/locales.test.ts` fails CI if the three locales drift out of sync.
5. **Styling.** Mobile-first (most customers are on phones). Use the `bv-*` brand
   tokens (e.g. `bv-green`, `bv-cream`, `bv-dark`) and `lucide-react` icons. Do not
   add new icon or UI libraries without asking.
6. **Secrets.** Never commit API keys/tokens. Build-time secrets (Sheets API key,
   Cloudflare token, Apps Script URL) live in GitHub Actions secrets. The Apps
   Script `/exec` URL is baked into the client bundle by design; it is not a secret.
7. **SEO/analytics.** Preserve `index.html` meta/OG/JSON-LD, `sitemap.xml`,
   `robots.txt`, the CSP, and the GA4 + Microsoft Clarity snippets. If you add an
   external origin (script/fetch/image), update the CSP `meta` in `index.html` or it
   will be blocked.

## How to change common things

- **Add/edit a product:** edit the `ProductCatalog` tab, then publish (the Bhaargavi
  menu in the sheet, or `gh workflow run publish.yml`, or `npm run fetch:menu`
  locally then redeploy). Category tabs, translations, and images are all derived
  automatically.
- **Category tabs:** driven by the `Category` column (free-form; comma-separate for
  multiple). Any keyword becomes a tab; labels auto-translate. "All" always shows all.
- **Product images:** put `public/menu/<slug>.png` and reference `/menu/<slug>.png`
  in the sheet's Image column. `fetch-menu.cjs` self-heals leftover Unsplash
  placeholder URLs to the local photo when one exists.
- **Copy/labels:** edit `src/locales/en.ts` and mirror the key in `ta.ts` + `hi.ts`
  (the parity test enforces this).
- **Site config** (min order, delivery info): `Config` tab → `src/data/config.json` → `SITE_CONFIG`.
  The **WhatsApp number** has no `Config` row today, so it defaults from `DEFAULTS.waNumber` in
  `fetch-config.cjs` (see README "Checkout & order logging" for the full list of files to edit).

## Build, test, deploy

- `npm run dev` / `npm run build` (tsc + vite) / `npm test` (Vitest) / `npm run lint`.
- `npm run fetch:menu` fetches the catalog AND auto-translates it (chained).
- **Deploy** is via Cloudflare Pages (project `bhaargavi-website`). Two workflows:
  `.github/workflows/publish.yml` (on-demand: the sheet's Publish button or
  `workflow_dispatch`) and `weekly-sync-and-deploy.yml` (Monday cron). Both share a
  `concurrency` group and commit-then-rebase, so they are safe to run concurrently.
  Altering workflows is fine when the task calls for it, but keep the build + deploy
  steps and the graceful "skip if secret missing" behavior intact.

## Key files

- `src/constants.ts` — builds `MENU_ITEMS`/`SITE_CONFIG` from the JSON data.
- `src/context/CartContext.tsx` — cart, WhatsApp message, order log.
- `src/utils/pricing.ts` — catalog price reconciliation (anti-tamper).
- `src/components/Products.tsx` — product grid, dynamic category tabs, localized cards.
- `src/LanguageContext.tsx` — language state (persisted), `<html lang>`.
- `scripts/fetch-menu.cjs` + `scripts/translate-menu.cjs` — catalog sync + auto-translate.
- `apps-script/Code.gs` — order webhook (server-side recompute, formula-injection-safe).
- `apps-script/Publish.gs` — spreadsheet "Bhaargavi" menu: publish button + backfill.
