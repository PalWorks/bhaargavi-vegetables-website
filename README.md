<p align="center">
  <img src="public/BhaargaviLogo.jpg" alt="Bhaargavi Fresh Cuts" width="120" />
</p>

<h1 align="center">Bhaargavi Fresh Cuts</h1>

<p align="center">
  <strong>FSSAI-certified, RO-washed, ready-to-cook cut vegetables &amp; fruits — delivered across Chennai.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Tailwind-4-38BDF8?style=flat-square&logo=tailwindcss" alt="Tailwind 4" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript" alt="TypeScript" />
</p>

---

## What this is

A static, mobile-first single-page marketing + ordering site for **Bhaargavi Fresh Cuts**, a
Chennai business selling pre-cut, RO-washed, ready-to-cook vegetables, fruits, and health packs.

There is **no application server and no payment gateway**. Customers build a cart and check out
over **WhatsApp**; orders are also logged best-effort to a Google Apps Script webhook. The product
catalog is managed in a **Google Sheet** and baked into the site at build time.

See [`ARCHITECTURE.md`](ARCHITECTURE.md), [`DOMAIN.md`](DOMAIN.md), and [`AGENTS.md`](AGENTS.md)
for the system design, business rules, and contributor guardrails.

## Tech stack

| Area | Choice |
|---|---|
| UI | React 19, React Router 7 |
| Build | Vite 6, TypeScript 5 |
| Styling | Tailwind CSS 4, `bv-*` design tokens in `src/index.css` |
| Icons | `lucide-react` |
| State | React Context (`CartContext`, `LanguageContext`) + `localStorage` |
| Data | Google Sheets → build scripts → `src/data/*.json` |
| Checkout | WhatsApp deep link (`wa.me`) |
| Order log | Google Apps Script Web App (`doPost`) |
| Hosting | Cloudflare Pages (static) |
| i18n | English / Tamil / Hindi (`src/locales/`) |

## Quick start

```bash
npm install
cp .env.example .env   # fill in what you have; everything is optional for local dev
npm run dev            # http://localhost:3000
```

The catalog is fully sheet-driven: products come from `src/data/menu.json` (synced from the Google
Sheet `ProductCatalog` tab). If that file is empty, the product grid simply shows its empty state —
there is no hardcoded product fallback.

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the Vitest unit suite |
| `npm run lint` | ESLint |
| `npm run fetch:all` | Pull catalog, config, images & Instagram from the Sheet/API (needs keys) |
| `npm run extract:hero` | Regenerate the hero frames + loop video from `media-src/hero/` (needs ffmpeg) |

## How data flows

```
Google Sheet ──fetch-config.cjs──▶ src/data/config.json ──▶ SITE_CONFIG
(Config tab)                                                 (min order, waNumber, delivery info)

Google Sheet ──fetch-menu.cjs────▶ src/data/menu.json  ──▶ MENU_ITEMS
(ProductCatalog tab)   └─translate-menu.cjs─▶ i18n (ta/hi) + categories-i18n.json
```

- **Source of truth for products & config is the Google Sheet**, not the React code. Don't hardcode
  new products; add rows to the `ProductCatalog` tab. `fetch-menu.cjs` then auto-translates
  name/description/ingredients and category labels into Tamil/Hindi (cached in `i18n-cache.json`).
- The **weekly GitHub Action** (`.github/workflows/weekly-sync-and-deploy.yml`) re-fetches the Sheet,
  commits changes, builds, and deploys. All fetch steps are skipped gracefully if secrets are absent.

## Checkout & order logging

1. Cart lives in `CartContext` (mirrored to `localStorage`).
2. On checkout the client builds a formatted message and best-effort `POST`s the order to
   `VITE_APPS_SCRIPT_URL` (2s timeout, `no-cors`, non-blocking).
3. The user is then sent to `https://wa.me/<number>?text=<message>`.

The WhatsApp number is `SITE_CONFIG.waNumber` (from the Sheet), exposed as `WA_NUMBER` in
`constants.ts`, with the hardcoded `CONTACT_PHONE` as a fallback.

## The hero background

Progressive enhancement in `src/components/ScrollVideoBackground.tsx`:

- **Canvas image-sequence (primary, wide screens):** a 96-frame JPEG sequence in
  `public/hero-frames/` is drawn to a `<canvas>` by scroll position. No video seeking → smooth and
  reliable. Frame count/size live in `public/hero-frames/manifest.json`.
- **Autoplay loop (fallback, phones/low-power):** `public/hero-video.mp4` (muted, looping, faststart)
  with a clamped GPU parallax.
- **Poster (reduced-motion / save-data / slow links):** static `public/hero-poster.jpg`.

To change the hero clip: drop new masters in `media-src/hero/`, update `inputs.txt`, then run
`npm run extract:hero` and commit the regenerated `public/hero-frames/` + `public/hero-video.mp4`.

## Environment variables

See [`.env.example`](.env.example). All are optional for local dev; production values are set as
GitHub Actions secrets. Key ones:

| Var | Purpose |
|---|---|
| `VITE_APPS_SCRIPT_URL` | Apps Script Web App URL for order logging |
| `VITE_GOOGLE_PLACE_ID` | Enables Google review buttons (graceful WhatsApp CTA while blank) |
| `SKUITEMMASTER_GOOGLE_SHEETS_API_KEY` / `BHAARGAVI_SHEETS_ID` | Catalog/config fetch |
| `INSTAGRAM_TOKEN` | Instagram feed fetch |
| `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` | Deploy |

## Deployment

Static build to `dist/`, hosted on Cloudflare Pages. `public/_redirects` (`/* /index.html 200`)
provides SPA fallback so deep links (`/about`, `/privacy`, …) resolve on refresh.

## Placeholders to replace before launch

These are intentionally set to easy-to-find placeholders until the real accounts exist:

| Placeholder | Where | Replace with |
|---|---|---|
| Instagram `@bhaargavifreshvegetables` | `src/constants.ts` (`INSTAGRAM_URL`, `INSTAGRAM_HANDLE`) | the live handle |
| Google reviews | `VITE_GOOGLE_PLACE_ID` (unset) | the Business Profile Place ID |
| `public/favicon.ico` | root favicon | a Bhaargavi-branded icon |
