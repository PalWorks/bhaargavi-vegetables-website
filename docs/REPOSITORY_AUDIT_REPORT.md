# Repository Audit Report — Bhaargavi Fresh Cuts

**Auditor:** Claude Code (acting as incoming Staff Engineer)
**Date:** 2026-07-04
**Scope:** `website/` (the live React SPA) plus surrounding planning/asset files
**Method:** Read-only static analysis. No runtime/build was executed. Findings are marked **[Confirmed]** (verified from code) or **[Unverified]** (needs a live check).
**Status:** Historical snapshot as of 2026-07-04, archived 2026-07-12. Findings were turned into IMPLEMENTATION_ROADMAP.md and have since largely been remediated.

> **ARCHIVAL NOTE (added 2026-07-12 IST): HISTORICAL SNAPSHOT, SUPERSEDED.**
> This report describes the repository state on 2026-07-04. Its findings became
> IMPLEMENTATION_ROADMAP.md and have since largely been remediated in the live code
> (tests added, docs rewritten, a11y fixes, hero/video and SSR work). Numbers and file
> references reflect that date and are intentionally left unchanged, including the
> then-current contact number 916385114580 (the primary number is now +91 91502 19379).
> File paths are relative to the project root (the folder containing website/).

> Note: One change was made **before** this audit at the user's explicit request — [DOMAIN.md](website/DOMAIN.md) min order corrected from ₹190 to ₹199. Everything below is analysis only; no other files were modified.

---

## Phase 1 — Repository Discovery

### 1.1 What the application does
A single-page marketing + ordering website for **Bhaargavi Fresh Cuts**, a Chennai business selling pre-cut, RO-washed, FSSAI-certified vegetables/fruits and health packs. Customers browse a catalog, build a cart, enter a delivery address, and check out **via a WhatsApp deep link**. There is no payment gateway and no application server.

### 1.2 Likely users
- **Primary:** Chennai households (working professionals/families) ordering on mobile. ~90% mobile per [AGENTS.md](website/AGENTS.md).
- **Secondary (operators):** The shop owner, who receives orders on WhatsApp and sees a best-effort log row in a Google Sheet.
- **Maintainers:** A solo developer syncing catalog data from Google Sheets.

### 1.3 Core workflows
1. **Browse & filter** products by category ([Products.tsx](website/src/components/Products.tsx)).
2. **Add to cart** (id+weight keyed line items), persisted to `localStorage` ([CartContext.tsx](website/src/context/CartContext.tsx)).
3. **Checkout** → enter address → best-effort POST to Apps Script → open `wa.me` with a formatted message ([CartSidebar.tsx:35](website/src/components/CartSidebar.tsx#L35), [CartContext.tsx:108-166](website/src/context/CartContext.tsx#L108-L166)).
4. **Weekly data sync** (GitHub Action) pulls catalog/config/images from Google Sheets + Instagram, commits, builds, deploys to Cloudflare Pages.

### 1.4 Main modules/components
| Layer | Files |
|---|---|
| Routing/shell | [App.tsx](website/src/App.tsx) (`BrowserRouter`, `Layout`, `HomePage`) |
| State | `CartContext`, `LanguageContext` |
| Data/config | `src/data/*.json` (fetched), `src/constants.ts` (fallbacks + brand constants) |
| UI | `Hero`, `Products`, `CartSidebar`, `StickyCart`, `ReviewCarousel`, `GoogleReviews`, `InstagramFeed`, `AboutPage`, `Navbar`, `Footer`, `PolicyPages`, `ScrollVideoBackground`, `ErrorBoundary` |
| Build scripts | `scripts/fetch-*.cjs`, `download-instagram-images.cjs` |
| CI | `.github/workflows/weekly-sync-and-deploy.yml` |

### 1.5 Data flow
`Google Sheet (Products / Config tabs)` → build-time `fetch-menu.cjs` / `fetch-config.cjs` → `src/data/menu.json` + `config.json` → imported in [constants.ts](website/src/constants.ts) → components. If a JSON file is empty (`[]`), a **hardcoded fallback** in `constants.ts` is used. Orders flow client → Apps Script (log) + WhatsApp (fulfillment).

### 1.6 Architectural pattern
**Static JAMstack SPA** with build-time data baking and a "serverless-by-outsourcing" model (Google Sheets = CMS/DB, Apps Script = webhook, WhatsApp = checkout/notification). Client-side rendering, Context for state, no SSR.

---

## Phase 2 — Code Quality Audit

### 2.1 Architecture assessment

**Strengths**
- Clear separation: data fetch (build) vs presentation (runtime). Components are small and single-purpose.
- Sensible fallback strategy so the site renders even when Sheets/env are unavailable.
- Cart keyed by `id + weight` is correct for multi-size SKUs ([CartContext.tsx:56](website/src/context/CartContext.tsx#L56)).
- `ErrorBoundary` at root; `localStorage` schema validation guards against tampering crashes.

**Weaknesses / tech debt**
- **Two sources of truth** for the WhatsApp number and no wiring of `SiteConfig.waNumber` (see 2.2 #1).
- **Hardcoded fallback catalog** (27 products, prices) in [constants.ts:22-268](website/src/constants.ts#L22-L268) can silently diverge from the real Google Sheet. If a sync fails quietly (scripts `exit 0` on missing key), the site shows a **stale/placeholder catalog with possibly wrong prices** and no visible signal.
- **Scaffold residue from TomeCafe** never purged (README, `public/` assets, tsconfig flags). Confirmed below.
- **Incomplete integrations** shipped as placeholders (Google Reviews widget, Instagram creds).

**Scaling risks**
- Google Sheets API + a single build pipeline is fine for a local shop, but there is no cache-busting/versioning on the baked JSON and no observability if a sync silently no-ops.

### 2.2 Code-quality findings

Each finding: Issue / Why it matters / Location / Current / Recommended / Priority.

**#1 — `SiteConfig.waNumber` is fetched but never used**
- Why it matters: The owner can change the WhatsApp number in the Sheet (the intended control surface), but checkout and the log ignore it and use a hardcoded constant. A number change would silently not take effect.
- Location: [constants.ts:9](website/src/constants.ts#L9) (`CONTACT_PHONE`), used in [CartSidebar.tsx:56](website/src/components/CartSidebar.tsx#L56) and [CartContext.tsx:158](website/src/context/CartContext.tsx#L158); `waNumber` defined in [types.ts:34](website/src/types.ts#L34) + [config.json:3](website/src/data/config.json#L3) but unreferenced.
- Current: Hardcoded `CONTACT_PHONE = '916385114580'`.
- Recommended: Use `SITE_CONFIG.waNumber` as the single source, fall back to the constant only if empty. Delete the dead field or wire it.
- Priority: **Medium**.

**#2 — Dead/commented-out "custom note" feature + now-unused symbols**
- Why it matters: Readability and false surface area. `updateCustomNote`, `editingNote`, `showNoteInput`, `customNote`, and `custom_note_label` locale keys exist but the UI is commented out.
- Location: [Products.tsx:24-25,102-112](website/src/components/Products.tsx#L102-L112), [CartSidebar.tsx:15,132-145](website/src/components/CartSidebar.tsx#L132-L145), `updateCustomNote` in [CartContext.tsx:83](website/src/context/CartContext.tsx#L83).
- Current: Commented JSX blocks + retained state/handlers.
- Recommended: Either finish the feature or remove the commented JSX and unused state; keep the context method only if reused.
- Priority: **Low**.

**#3 — `react-google-reviews` dependency is installed but never imported**
- Why it matters: Dead dependency + a half-built feature. [GoogleReviews.tsx](website/src/components/GoogleReviews.tsx) only renders a placeholder `<div id="bv-google-reviews">` and a comment; the package is never imported (confirmed via grep). `GOOGLE_REVIEW_URL` still contains the literal placeholder `placeid=ChIJxxxxxxxx`.
- Location: [GoogleReviews.tsx:7,21](website/src/components/GoogleReviews.tsx#L7), [package.json](website/package.json) dep `react-google-reviews`.
- Current: Placeholder-only; broken "Write a Review" link (placeholder place ID).
- Recommended: Either implement the widget (import + mount when `VITE_FEATURABLE_ID` present) or drop the dependency and keep only the CTA button; and replace the placeholder review URL before launch.
- Priority: **Medium** (broken link is user-facing).

**#4 — Silent no-op sync hides catalog staleness**
- Why it matters: `fetch-menu.cjs` / `fetch-config.cjs` `process.exit(0)` when the API key is missing, and the CI steps `exit 0` too. A misconfigured secret produces a green build serving the hardcoded fallback catalog — no alarm.
- Location: [fetch-menu.cjs:18-20](website/scripts/fetch-menu.cjs#L18-L20), workflow steps in [weekly-sync-and-deploy.yml](website/.github/workflows/weekly-sync-and-deploy.yml).
- Recommended: Distinguish "intentionally skipped" from "failed". At minimum log a loud warning and consider failing the scheduled build if `menu.json` ends up empty in production.
- Priority: **Medium**.

**#5 — `no-cors` + `Content-Type: application/json` is misleading**
- Why it matters: In `no-cors` mode the browser forces the request `Content-Type` to a "simple" value; the JSON content-type header is effectively ignored. The Apps Script must read `e.postData.contents` and parse manually. The header reads as if it guarantees JSON, which it does not.
- Location: [CartContext.tsx:145-149](website/src/context/CartContext.tsx#L145-L149).
- Current: Works in practice, but the header is a no-op and the response is opaque (success can't be verified).
- Recommended: Drop the header or add a comment; keep best-effort semantics.
- Priority: **Low**.

**#6 — tsconfig template leftovers**
- Why it matters: `experimentalDecorators: true` and `useDefineForClassFields: false` are unused (no decorators in the codebase) — carried from the scaffold; minor confusion.
- Location: [tsconfig.json](website/tsconfig.json).
- Recommended: Remove unless a decorator use is planned.
- Priority: **Low**.

**#7 — Naming / conventions**
- Generally consistent and readable (`bv-*` tokens, `t.*` i18n, clear component names). No major complexity hotspots; largest component is `CartSidebar` (~259 lines) and is still manageable. No action required beyond the specific items above.

---

## Phase 3 — Security Review

Trust model note: this is a static site with **no auth, no server, no secrets in the client bundle** (the only build secrets — Sheets API key, Instagram token, Cloudflare token — live in GitHub Actions). That eliminates whole classes of risk. Findings are correspondingly modest.

### Critical
- None confirmed.

### High
- **[Confirmed] CSP will block real product images.** `fetch-menu.cjs` rewrites Google Drive image links to `https://drive.google.com/uc?export=view&id=...` ([fetch-menu.cjs:55-63](website/scripts/fetch-menu.cjs#L55-L63)), but the CSP `img-src` only allows `'self' data: images.unsplash.com picsum.photos` ([index.html:26](website/index.html#L26)). Once the client populates the Sheet with Drive images, product/hero images will be **CSP-blocked** and fall back to the logo. (This is a functional/security-config bug, not an exploit.) Also note `drive.google.com/uc?export=view` is an unreliable hotlink endpoint. Recommend hosting images on the same origin (the existing `public/menu/` fetch flow) rather than Drive, and update `img-src` accordingly.

### Medium
- **[Confirmed] Client-trusted prices.** Cart line prices come from `localStorage` and are used directly for `cartTotal`, the min-order gate, and the WhatsApp message ([CartContext.tsx:92-95](website/src/context/CartContext.tsx#L92-L95)). A user can edit `localStorage` to change totals or bypass the ₹199 minimum. Impact is low because the merchant confirms every order manually over WhatsApp, but the displayed/sent total is not authoritative. Recommend re-deriving prices from `MENU_ITEMS` at checkout (defense in depth), and treating WhatsApp totals as indicative.
- **[Confirmed] CSP allows `'unsafe-inline'` and `'unsafe-eval'` in `script-src`.** Weakens XSS protection. `unsafe-eval` is generally not needed in a production Vite build. Recommend tightening for the production bundle.

### Low
- **Address/notes are user input** but are only placed into a `wa.me` URL and a `no-cors` POST body — not rendered as HTML — so no DOM XSS. React escaping covers rendered strings. No injection path confirmed.
- **No CSRF surface** (no authenticated state-changing server endpoints).
- **Dependency vulnerabilities:** not scanned in this pass. Recommend running `npm audit` in CI (see Phase 8).

---

## Phase 4 — Performance Review

- **[Confirmed] Large stale media shipped in `public/`.** `public/` contains ~40–50 MB of **TomeCafe leftovers** that get copied verbatim into `dist/`: `TomeCafe-OG-Image.png` (6.6 MB), `HowToWriteTomeCafeInJapanese.mp4` (11 MB), `TomeCafeFavicon.png` (5.3 MB), multiple `*Sando*` images, translation icons, etc. These bloat the deploy and can be publicly fetched. **Biggest, easiest win.** Delete unused assets.
- **[Confirmed] Background video is heavy.** `public/hero-video-smooth.mp4` is **11 MB** (plus a 3.8 MB `hero-video.mp4`), loaded with `preload="auto"` and scrubbed by setting `videoRef.current.currentTime` on **every `requestAnimationFrame`** ([ScrollVideoBackground.tsx:44-58,82](website/src/components/ScrollVideoBackground.tsx#L44-L58)). Video seeking per frame is expensive on mobile — this is exactly the class of issue the recent commits chased. There is already a save-data/2G guard (good). Recommend: compress further / shorter clip, consider `preload="metadata"`, and cap seek frequency; or evaluate whether the scroll-scrub effect is worth its cost on low-end phones.
- **Bundle:** dependencies are lean (React, react-router, lucide-react, and the unused react-google-reviews). Removing the unused dep and any dead code trims the JS bundle slightly. No code-splitting today; acceptable for a single-page site, but policy pages could be lazy-loaded.
- **Images:** `loading="lazy"` is used broadly (good). Unsplash/picsum placeholders are external; fine for now.
- No premature-optimization recommendations beyond the above.

---

## Phase 5 — UX & Product Review

- **[Confirmed / High] SPA deep-link 404 risk.** App uses `BrowserRouter` with real paths (`/about`, `/privacy`, …) but there is **no `_redirects` (`/* /index.html 200`) or `404.html`** in `public/` (verified). On Cloudflare Pages, directly visiting or refreshing a non-root route can 404 unless the project is separately configured for SPA fallback. **[Unverified]** whether the Pages project has this setting. The `sitemap.xml` advertises these exact routes to crawlers, amplifying the impact. Recommend adding `public/_redirects` with `/* /index.html 200`.
- **Empty states:** cart empty state is handled ([CartSidebar.tsx:86](website/src/components/CartSidebar.tsx#L86)); products "no products" handled. Good.
- **Failure states:** order logging failure is silent-by-design (WhatsApp still opens) — acceptable. But if `window.open` is blocked (popup blocker on some mobile browsers), the user gets no feedback. Consider a fallback link.
- **Loading states:** none needed for baked data; video has an opacity fade-in. Fine.
- **Accessibility gaps [Confirmed]:**
  - Icon-only buttons lack `aria-label` (language toggle, WhatsApp, cart) — they use `title` only ([Navbar.tsx](website/src/components/Navbar.tsx)). Screen readers announce them poorly.
  - Cart sidebar has no **Escape-to-close**, no **focus trap**, and the dimming overlay is not keyboard-dismissible ([CartSidebar.tsx:22-33,64](website/src/components/CartSidebar.tsx#L22-L33)).
  - Color-contrast of `text-white/60`/`/80` on some backgrounds should be spot-checked against WCAG AA.
- **Copy consistency:** `config.json` `deliveryNote` promises "**free** delivery" while the client brief says only "eligible for delivery." Confirm the actual policy before launch to avoid an unintended pricing promise.
- **Responsiveness:** mobile-first throughout; grids and drawers look sound.

---

## Phase 6 — Developer Experience Review

- **[Confirmed / High] README is the wrong project.** [README.md](website/README.md) is entirely **TomeCafe** (logo, "Indo-Japanese Sandos," 9 Tome/Sando mentions). A new dev is actively misled. Rewrite for Bhaargavi. The good news: [AGENTS.md](website/AGENTS.md), [ARCHITECTURE.md](website/ARCHITECTURE.md), and [DOMAIN.md](website/DOMAIN.md) are accurate and useful.
- **[Confirmed] `.env.example` is thorough** (all required build vars documented) — good.
- **Local dev:** `predev` runs `download-instagram-images.cjs` before `vite`; with no `instagram.json` this is a harmless no-op. Setup is `npm i && npm run dev`. Reasonable.
- **Debugging/observability:** the only runtime logging is `console.error` in `ErrorBoundary`. No analytics, no error reporting. For a production site, even lightweight web analytics + a client error reporter would help (see Phase 9).
- **Housekeeping:** parent folder carries `Superceded/` (an older frontend/backend with its own `node_modules`) and stray brand decks — fine as archive but should not be confused with the live app.

---

## Phase 7 — Testing Strategy Review

- **[Confirmed] Zero tests.** Vitest + Testing Library + jsdom + `src/test/setup.ts` are all configured, but there are **no `*.test.*` files** at all. The infrastructure is paid for but unused.
- **Highest-value untested logic (pure, easy to test first):**
  1. `buildWhatsAppMessage` — formatting, totals, address newline encoding ([CartContext.tsx:108](website/src/context/CartContext.tsx#L108)).
  2. Cart reducer behavior — add/increment same id+weight, remove, min-order/`amountNeeded` math ([CartContext.tsx:58-95](website/src/context/CartContext.tsx#L58-L95)).
  3. `localStorage` schema validation (accept valid, reject tampered) ([CartContext.tsx:28-49](website/src/context/CartContext.tsx#L28-L49)).
  4. `buildPackSizes` / sheet-row mapping in `constants.ts` and `fetch-menu.cjs` (blank cells, non-numeric, Drive URL conversion).
- **Recommended roadmap:** start with 4–6 unit tests on the above (fast, no DOM). Then a couple of component tests (`Products` add-to-cart, `CartSidebar` min-order gate). Add a single smoke test that the app renders without crashing. Wire `npm test` into CI before deploy.

---

## Phase 8 — Dependency & Technology Review

- **Stack is appropriate** (React 19 / Vite 6 / Tailwind 4 / TS). No technology swap recommended.
- **Unused dependency:** `react-google-reviews` (never imported). Remove or use.
- **`npm audit` not run here** — add to CI to catch transitive advisories.
- **Version currency:** dependencies are recent. No deprecated libraries observed. `lucide-react` is imported in a few components (`Menu`, `MessageCircle`) that don't use all imports — minor tree-shaking noise, not a real problem.
- **Node 20** pinned in CI — reasonable and current.

---

## Phase 9 — Improvement Roadmap

### Immediate Fixes (1–2 days)
| Priority | Issue | Impact | Effort | Files | Approach |
|---|---|---|---|---|---|
| P0 | Purge stale TomeCafe assets from `public/` | Cuts ~40–50 MB from deploy; removes wrong-brand files from public URLs | S | `website/public/*` | Delete Sando images, TomeCafe logos/OG/video, JP translation icons; keep Bhaargavi + shared icons |
| P0 | Add SPA fallback for Cloudflare Pages | Prevents `/about` etc. 404 on refresh/deep-link | XS | `website/public/_redirects` | Add `/* /index.html 200`; verify Pages setting |
| P0 | Fix CSP `img-src` for real product images | Product/hero images won't render once Sheet is populated | XS | [index.html:26](website/index.html#L26) | Add the image host (prefer same-origin `public/menu`); avoid Drive hotlinks |
| P1 | Rewrite `README.md` for Bhaargavi | Stops misleading every future dev | S | [README.md](website/README.md) | Replace TomeCafe content; document setup + data flow |
| P1 | Replace placeholder Google review URL / fix widget | Broken user-facing "Write a Review" link | S | [GoogleReviews.tsx](website/src/components/GoogleReviews.tsx) | Real place ID or remove CTA + drop unused dep |
| P2 | Wire `SITE_CONFIG.waNumber` (or delete it) | Owner's Sheet control actually works | XS | [CartSidebar.tsx](website/src/components/CartSidebar.tsx), [CartContext.tsx](website/src/context/CartContext.tsx) | Use config value with constant fallback |

### Short-Term Improvements (1–2 weeks)
| Priority | Improvement | Business/Product impact | Engineering impact | Complexity |
|---|---|---|---|---|
| P1 | Seed unit tests for cart + WhatsApp message + validation | Protects the one revenue path (checkout) | Regression safety net | M |
| P1 | Loud failure on empty catalog in prod build | Avoids silently serving stale fallback prices | Reliability | S |
| P2 | Accessibility pass (aria-labels, Esc-to-close, focus trap, contrast) | Wider reach, fewer complaints | Modest | M |
| P2 | Lightweight analytics + client error reporting | Know if orders/deep-links work in the field | Observability | S |
| P3 | Remove dead custom-note code + tsconfig leftovers | Cleaner codebase | Maintainability | S |

### Long-Term Improvements (1–3 months)
| Area | Current limitation | Recommended future state | Migration approach |
|---|---|---|---|
| Image pipeline | Product images may rely on unreliable Drive hotlinks blocked by CSP | Images normalized + self-hosted under `public/menu`, referenced by stable paths | Extend `fetch-images.cjs` to download Drive images at build like Instagram already does |
| Order integrity | Client-trusted prices/totals | Re-derive prices from catalog at checkout; Apps Script recomputes from a SKU map | Add server-side (Apps Script) price lookup by id+weight |
| Catalog ops | Silent Sheets sync, no versioning/monitoring | Sync writes a manifest (count, timestamp, hash); build fails or alerts on anomalies | Add a small validation step in the workflow |
| Video hero | 11 MB scroll-scrubbed video, mobile cost | Lighter asset or CSS/image-sequence alternative with strict low-end fallback | A/B the effect vs. a static poster on mobile |

---

## Phase 10 — Phased Implementation Plan

### Phase A — Deploy hygiene (P0)
- **Objective:** Correct, lean, non-404 deploys.
- **Tasks:** delete stale `public/` assets; add `public/_redirects`; fix CSP `img-src`.
- **Files:** `website/public/*`, `website/public/_redirects`, `website/index.html`.
- **Risk:** Deleting an asset still referenced somewhere. Mitigate by grepping references before deletion.
- **Testing:** `npm run build`; load `/`, hard-refresh `/about`; confirm product/hero images load; check no 404s in network tab.
- **Rollback:** Revert the commit (assets are in git history / restorable from the `Superceded`/deck sources).

### Phase B — Truthful docs & config (P1)
- **Objective:** Docs and the owner's control surface reflect reality.
- **Tasks:** rewrite README; wire/remove `waNumber`; replace Google review placeholder or remove `react-google-reviews`.
- **Files:** `README.md`, `CartSidebar.tsx`, `CartContext.tsx`, `GoogleReviews.tsx`, `package.json`.
- **Risk:** Changing the checkout number path. Mitigate with a fallback to the constant and a manual WhatsApp test.
- **Testing:** Place a test order end-to-end; verify number and message; verify review link.
- **Rollback:** Revert commit; constant fallback keeps checkout working regardless.

### Phase C — Safety net (P1)
- **Objective:** Guard the revenue path and catch bad syncs.
- **Tasks:** add unit tests (cart, message builder, validation, pack-size mapping); add "empty catalog in prod ⇒ fail/alert" check; add `npm test` + `npm audit` to CI.
- **Files:** `src/**/*.test.ts(x)`, `scripts/fetch-menu.cjs` (or a new guard), `weekly-sync-and-deploy.yml`.
- **Risk:** Flaky/slow CI. Mitigate by keeping tests pure/fast.
- **Testing:** CI green on PR; intentionally break a case to confirm the guard trips.
- **Rollback:** Tests/CI changes are non-runtime; revert freely.

### Phase D — UX & polish (P2/P3)
- **Objective:** Accessibility, observability, dead-code removal, video cost.
- **Tasks:** aria-labels + Esc-to-close + focus trap; add analytics/error reporting; remove commented custom-note code and tsconfig leftovers; revisit video weight/mobile fallback.
- **Files:** `Navbar.tsx`, `CartSidebar.tsx`, `Products.tsx`, `ScrollVideoBackground.tsx`, `tsconfig.json`, `index.html`.
- **Risk:** Behavioral regressions in the cart drawer. Mitigate with the Phase C component tests.
- **Testing:** Keyboard-only walkthrough; Lighthouse a11y/perf; mobile device check.
- **Rollback:** Independent, revertable commits per item.

---

## Assumptions & Unverified Items
- **[Unverified]** Cloudflare Pages SPA-fallback setting — the code lacks `_redirects`; whether the Pages project compensates was not checked against the live deployment.
- **[Unverified]** `npm audit` / dependency CVE status — not run in this pass.
- **[Unverified]** Runtime rendering of Google-Sheet-sourced Drive images — inferred from the URL rewrite + CSP; not observed live because `menu.json` is currently `[]` (fallback catalog in use).
- **[Assumption]** The manual-WhatsApp-confirmation model is why client-side price trust is acceptable; confirm this matches the owner's process.
- The `Google Sheet (Sheet2/Config)` is the true source for `minOrderValue`; the codebase and fetch defaults already read ₹199. Updating the Sheet itself is outside this repo and must be done in Google Sheets (no write tool available here).
