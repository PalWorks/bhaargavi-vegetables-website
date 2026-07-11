# Implementation Roadmap — Bhaargavi Fresh Cuts

**Author:** Claude Code (incoming Staff Engineer)
**Date:** 2026-07-04
**Basis:** [REPOSITORY_AUDIT_REPORT.md](REPOSITORY_AUDIT_REPORT.md)
**Status:** Largely implemented and archived 2026-07-12 (original: "Plan only, no code changed by this document").

> **ARCHIVAL NOTE (added 2026-07-12 IST): LARGELY IMPLEMENTED, now historical.**
> This audit-remediation roadmap has since been carried out in the live codebase:
> the testing safety net (Phase 4) now exists (52 passing Vitest tests), docs and
> config were rewritten (Phase 3), accessibility fixes landed (Phase 6, e.g.
> aria-labels and Escape-to-close, both covered by tests), and the background-video
> work (Phase 2) was implemented and then tuned for mobile LCP (canvas scrub was
> reverted on phones back to a video fallback; SSR pre-render was also added). Treat
> this as a record of the remediation plan, not an active TODO. One caveat: Phase 3's
> "waNumber from the Sheet" premise is inaccurate. The Config tab has no waNumber row,
> so the number comes from DEFAULTS.waNumber in fetch-config.cjs (see website/README.md).
> File paths below are relative to the project root (the folder containing website/).

This roadmap turns the audit into an executable, phase-by-phase plan. Phase 2 (Background Video Overhaul) is expanded in depth because it is the site's centerpiece and the top reported pain point.

---

## Guiding principles
1. **Mobile-first reliability over gimmicks.** ~90% of users are on phones; every effect must degrade gracefully.
2. **Ship in vertical slices.** Each phase is independently deployable and revertable.
3. **Measure before/after.** Capture a Lighthouse + real-device baseline before Phase 1; re-measure after Phase 1 and Phase 2.
4. **One branch per phase**, small atomic commits, deploy to a Cloudflare Pages preview before promoting.

## Sequencing at a glance
| Phase | Theme | Priority | Effort | Depends on |
|---|---|---|---|---|
| 0 | Pre-work & baseline | — | 0.5d | — |
| 1 | Deploy hygiene (assets, `_redirects`, CSP) | P0 | 0.5–1d | 0 |
| 2 | **Background video overhaul** | P0 (centerpiece) | 2–3d | 1 |
| 3 | Truthful docs & config | P1 | 1d | — |
| 4 | Testing safety net | P1 | 2–3d | — |
| 5 | Image pipeline hardening | P2 | 2d | 1 |
| 6 | UX, a11y & observability | P2/P3 | 2–3d | 4 |
| 7 | Order integrity | P3 | 2–3d | 4 |

Phases 3 and 4 can run in parallel with 1–2 since they touch different files.

---

## Phase 0 — Pre-work & baseline (0.5 day)

**Objective:** Establish a measurable starting point and unblock external dependencies.

**Tasks**
1. Create working branch `chore/audit-remediation` off `main`.
2. Capture baseline metrics on the live site: Lighthouse (mobile + desktop), and record real-device behavior of the current video (first-frame time, jank) on at least one mid-range Android + one iPhone.
3. **Set `minOrderValue = 199` in the Google Sheet Config tab** (spreadsheet `1Ao_1pGEsPkCRgtOho02ZqaAUOsMUiuJiaTEsLbPHQW8`). The repo already reads 199, but the Sheet is the source of truth and the weekly sync can overwrite `config.json`. *(Owner action — cannot be done from the repo.)*
4. **Verify the Cloudflare Pages project** for SPA-fallback behavior (feeds Phase 1).

**Files:** none (ops).
**Risk:** none.
**Testing:** n/a.
**Rollback:** delete branch.

---

## Phase 1 — Deploy hygiene (0.5–1 day) — P0

**Objective:** Correct, lean, non-404 deploys.

**Tasks**
1. **Purge stale TomeCafe assets** from `website/public/` (~40–50 MB): `TomeCafe-OG-Image.png`, `HowToWriteTomeCafeInJapanese.mp4`, `TomeCafe*.png/.jpeg`, `*Sando*`, `Japanese*`/`JaptoEng*` icons, `japanese_sando_menu.md`, `inspect_current_state.html`, `NonVeg*`, `VegSando*`, `WeekdaySandwichesCover.jpeg`, `WhatsAppLogo.png` (duplicate of `WhatsApp Icon.png`). **Grep every filename across `src/` + `index.html` before deleting.**
2. **Add `website/public/_redirects`** containing `/* /index.html 200` so `/about`, `/privacy`, etc. resolve on direct load/refresh. (`sitemap.xml` already advertises these routes.)
3. **Fix CSP `img-src`** in [index.html:26](website/index.html#L26) to match wherever product images will actually be served (target: same-origin `/menu/…` after Phase 5; interim: add the confirmed image host). Also plan to drop `'unsafe-eval'` from `script-src` for production.
4. Confirm `favicon.ico` / logo references are Bhaargavi, not Tome.

**Files:** `website/public/*`, `website/public/_redirects`, `website/index.html`.
**Risk:** deleting a still-referenced asset. **Mitigation:** grep-before-delete; deploy to preview first.
**Testing:** `npm run build`; hard-refresh `/about` on preview (expect 200); confirm no 404s in the network tab; confirm dist size dropped.
**Rollback:** revert commit (assets remain in git history).

---

## Phase 2 — Background video overhaul (2–3 days) — P0, centerpiece

**Chosen design (per owner):** **Canvas image-sequence scrubbing as the primary experience, with an autoplay muted-loop video (+ CSS parallax) as the fallback, and a static poster as the final fallback.** Progressive enhancement, decided at runtime by device capability.

### Root causes being fixed (evidence from ffprobe)
- `hero-video-smooth.mp4` (11 MB) has its **`moov` atom after `mdat` (no faststart)** → browser must download all 11 MB before it can seek or read duration → "broken on first load," and the reason for the incognito/force-load hacks in the current component.
- It is **all-intra** (every frame a keyframe) → smooth to seek but 3× the size.
- The render loop sets `currentTime` **every rAF (~60/s)** on a 24 fps clip → decoder oversaturation → stutter.
- **Mobile browsers throttle programmatic `currentTime` scrubbing** → unreliable on phones regardless of encoding.

The canvas approach eliminates all four: no `<video>` seeking at all — just drawing pre-decoded images.

### Step 2.1 — Frame extraction build step (0.5d)
- Add `scripts/extract-hero-frames.cjs` (or a documented one-off ffmpeg command) that reads the master clips in `public/Video Backgrounds/` (concatenated per `inputs.txt`) and emits an image sequence:
  - Target **~90–120 frames** (24 s clip → sample to a fixed count, e.g. `fps=5` gives 120 frames).
  - Format **WebP**, quality ~72, **two widths** for responsiveness: `1280w` (desktop) and `768w` (small screens that still qualify for scrub).
  - Output to `public/hero-frames/1280/frame_%03d.webp` and `.../768/…`.
  - Emit a tiny `public/hero-frames/manifest.json` with `{ count, widths }` so the component doesn't hardcode counts.
- Target total payload: **~1.5–3 MB per width set** (compare to today's 11 MB). Verify actual sizes and tune quality/count.
- Do **not** run this in the weekly CI sync (frames change rarely); run manually when the hero clip changes, and commit the output. Document in README.

### Step 2.2 — `CanvasHeroSequence` component (1d)
Rewrite [ScrollVideoBackground.tsx](website/src/components/ScrollVideoBackground.tsx) (or add a sibling and switch in `Layout`):
- Pick the width set from `matchMedia`/`devicePixelRatio`.
- **Preload** all frames into `Image` objects; track loaded count; keep the `hero-poster.jpg` visible until a threshold (e.g. first frame + ~25% preloaded), then fade in the canvas.
- Scroll handler (passive) updates a target progress; a rAF loop computes `frameIndex = round(progress * (count-1))` and **draws only when the index changes** (not every frame) via `ctx.drawImage` with cover-fit math and `devicePixelRatio` scaling.
- `ResizeObserver` to re-fit the canvas; `IntersectionObserver` so the loop only runs while the hero is in view.
- Clean up all listeners/rAF on unmount.

### Step 2.3 — Fallback: autoplay loop + parallax (0.5d)
Capability gate → if **any** of: `max-width ≤ 768px`, `prefers-reduced-motion: reduce`, `navigator.connection.saveData`/`effectiveType ∈ {slow-2g,2g,3g}`, low `deviceMemory`, or frame preload fails/times out → render the fallback instead of the canvas:
- `<video autoplay muted loop playsinline preload="metadata">` using a **re-encoded loop** (see 2.4). No seeking — native smooth playback.
- Add **cheap, GPU-composited scroll parallax** (CSS `transform: translate3d/scale` driven by a throttled scroll value) so it still feels reactive.
- If even video can't play (save-data / decode error) → static `hero-poster.jpg` with the same parallax transform.

### Step 2.4 — Encoding & asset cleanup (0.5d)
- Produce the loop fallback from the master with: `-movflags +faststart`, normal GOP (~2 s keyint), H.264 High, `yuv420p`, ~1.2–1.8 Mbps, 720p, and an optional VP9/AV1 `.webm` for smaller size. The existing `hero-video.mp4` (3.8 MB, faststart present, normal GOP) is already a decent starting point — re-encode a touch smaller and reuse.
- **Delete `hero-video-smooth.mp4` (11 MB)** from `public/` once the canvas path replaces it — large deploy win, ties into Phase 1.
- Keep `hero-poster.jpg` (already 20 KB) as the instant first paint / `background-image`.

### Success criteria (verify on real devices)
- Mobile: **no jank** — the fallback loop or poster plays/paints immediately; no white flash; no dependence on scrubbing.
- Desktop: canvas scrub is smooth (no decode stalls), first meaningful frame < ~1 s on broadband.
- Hero payload down from ~11 MB to ~2–3 MB (canvas) / ~1.5 MB (loop).
- Lighthouse LCP and TBT improve vs. Phase 0 baseline.
- `prefers-reduced-motion` respected.

**Files:** `website/scripts/extract-hero-frames.cjs`, `website/public/hero-frames/**`, `website/public/hero-video.mp4` (+ optional `.webm`), `website/src/components/ScrollVideoBackground.tsx` (rewrite), `website/src/App.tsx` (if renamed), `website/index.html` (CSP `img-src`/`media-src` must allow the frame + video sources — all same-origin here).
**Risk:** canvas sizing / DPR bugs; preload memory on very low-end devices (mitigated by the 768w set + fallback gate); larger initial JS for the loop. **Mitigation:** capability gate is conservative — when in doubt, fall back to the loop/poster.
**Testing:** real mid-range Android + iPhone Safari + desktop Chrome/Firefox; throttled 3G + save-data; reduced-motion on; verify cleanup (no leaked rAF) via repeated route navigation.
**Rollback:** feature-flag the new component or keep the old file one commit back; revert restores prior behavior instantly.

---

## Phase 3 — Truthful docs & config (1 day) — P1

**Objective:** Docs and the owner's control surfaces reflect reality.

**Tasks**
1. **Rewrite `README.md`** for Bhaargavi (it is currently entirely TomeCafe). Cover: what it is, stack, `npm i && npm run dev`, the Sheets→JSON data flow, env vars, deploy. Reuse the accurate `AGENTS.md`/`ARCHITECTURE.md`/`DOMAIN.md`.
2. **Wire `SITE_CONFIG.waNumber`** (fallback to `CONTACT_PHONE`) in [CartSidebar.tsx:56](website/src/components/CartSidebar.tsx#L56) and [CartContext.tsx:158](website/src/context/CartContext.tsx#L158) so changing the number in the Sheet actually takes effect — or delete the dead field if the constant is intended to be canonical.
3. **Google Reviews:** replace the placeholder `placeid=ChIJxxxxxxxx` review URL, and either implement the `react-google-reviews` widget (import + mount when `VITE_FEATURABLE_ID` is set) **or remove the unused dependency** and keep only the CTA.
4. Reconcile the `deliveryNote` copy ("**free** delivery" vs the brief's "eligible for delivery").

**Files:** `README.md`, `CartSidebar.tsx`, `CartContext.tsx`, `GoogleReviews.tsx`, `constants.ts`, `package.json`, `src/data/config.json` (copy only).
**Risk:** touching the checkout number. **Mitigation:** constant fallback + a live test order.
**Testing:** end-to-end test order (number + message correct); review link opens a real GBP page.
**Rollback:** revert; fallback keeps checkout working.

---

## Phase 4 — Testing safety net (2–3 days) — P1

**Objective:** Protect the one revenue path and catch bad data syncs. (Vitest is configured but there are zero tests.)

**Tasks**
1. Unit tests (pure, fast — start here):
   - `buildWhatsAppMessage` — items, totals, address newline encoding.
   - Cart logic — add/increment same `id+weight`, remove, `isBelowMinimum`/`amountNeeded` math.
   - `localStorage` schema validation — accept valid, reject tampered.
   - `buildPackSizes` + sheet-row mapping (`fetch-menu.cjs`) — blank cells, non-numeric, Drive-URL conversion.
2. A couple of component tests: `Products` add-to-cart; `CartSidebar` min-order gate disables checkout.
3. One smoke test: app renders without crashing.
4. **Empty-catalog guard:** make the build fail loudly (or alert) if `menu.json` is `[]` in a production build, so a silently-skipped sync can't ship the hardcoded fallback prices unnoticed.
5. **CI:** add `npm test` and `npm audit --audit-level=high` to the workflow before build/deploy.

**Files:** `src/**/*.test.ts(x)`, `scripts/fetch-menu.cjs` (or a new guard), `.github/workflows/weekly-sync-and-deploy.yml`.
**Risk:** flaky/slow CI. **Mitigation:** keep tests pure; mock network in script tests.
**Testing:** CI green on PR; intentionally break a case to confirm it trips.
**Rollback:** non-runtime; revert freely.

---

## Phase 5 — Image pipeline hardening (2 days) — P2

**Objective:** Make product/hero images reliable and CSP-safe once the client populates the Sheet.

**Context:** `fetch-menu.cjs` rewrites Sheet images to `drive.google.com/uc?export=view` URLs, which are unreliable hotlinks **and** blocked by the current CSP `img-src`. Instagram images are already downloaded locally at build — do the same for product images.

**Tasks**
1. Extend `fetch-images.cjs` to download each product's Drive/remote image into `public/menu/…` at build and rewrite the JSON `image` field to the local path.
2. Align CSP `img-src` to same-origin (`'self'`) for product images.
3. Keep the `onError → logo` fallback already present in `Products`/`CartSidebar`.

**Files:** `scripts/fetch-images.cjs`, `constants.ts`/data mapping, `index.html` (CSP), workflow (ensure `public/menu` is committed by the sync step — it already stages `public/menu`).
**Risk:** build-time download failures. **Mitigation:** warn-but-don't-fail (as Instagram does); keep last-good images.
**Testing:** run `fetch:all` with a populated test Sheet; confirm images render with no CSP violations.
**Rollback:** revert script; Drive URLs (with CSP allowance) remain as interim.

---

## Phase 6 — UX, accessibility & observability (2–3 days) — P2/P3

**Objective:** Broaden reach, learn from real usage, and cut dead code.

**Tasks**
1. **A11y:** add `aria-label` to icon-only buttons (language, WhatsApp, cart in `Navbar`); add **Escape-to-close** + a **focus trap** to `CartSidebar`; make the dimming overlay keyboard-dismissible; spot-check `text-white/60`–`/80` contrast against WCAG AA.
2. **Popup-block fallback:** if `window.open` to `wa.me` is blocked, surface a visible "Open WhatsApp" link.
3. **Observability:** add lightweight privacy-friendly web analytics + a client error reporter (beyond `ErrorBoundary`'s `console.error`) so you can see whether orders/deep-links actually work in the field.
4. **Dead-code cleanup:** remove the commented custom-note blocks and now-unused state/handlers/locale keys ([Products.tsx](website/src/components/Products.tsx), [CartSidebar.tsx](website/src/components/CartSidebar.tsx), `updateCustomNote`); drop `experimentalDecorators`/`useDefineForClassFields` from `tsconfig.json`.

**Files:** `Navbar.tsx`, `CartSidebar.tsx`, `Products.tsx`, `CartContext.tsx`, `tsconfig.json`, `index.html` (analytics/CSP `connect-src`).
**Risk:** cart-drawer regressions. **Mitigation:** the Phase 4 component tests.
**Testing:** keyboard-only walkthrough; Lighthouse a11y; confirm analytics/error events arrive.
**Rollback:** independent per-item commits.

---

## Phase 7 — Order integrity (2–3 days) — P3

**Objective:** Stop trusting client-side prices for the recorded total.

**Context:** Cart prices come from `localStorage` and drive the total, the min-order gate, and the WhatsApp/Apps Script payload. A tampered `localStorage` changes the sent total. Low impact today (manual WhatsApp confirmation), but the recorded value isn't authoritative.

**Tasks**
1. At checkout, **re-derive each line price from `MENU_ITEMS`** by `id+weight` (defense in depth); ignore the stored price.
2. In Apps Script, recompute the total from a SKU→price map before logging, and flag mismatches.
3. Add a catalog **manifest** (count, timestamp, hash) written by the sync for monitoring.

**Files:** `CartContext.tsx`, Apps Script (external), `scripts/fetch-menu.cjs`.
**Risk:** price map drift between client and Apps Script. **Mitigation:** single generated source; the Phase 4 empty-catalog guard.
**Testing:** tamper `localStorage` and confirm the recomputed total is correct.
**Rollback:** revert; WhatsApp flow is unaffected.

---

## Effort summary
| Phase | Effort | Priority |
|---|---|---|
| 0 Pre-work | 0.5d | — |
| 1 Deploy hygiene | 0.5–1d | P0 |
| 2 Video overhaul | 2–3d | P0 |
| 3 Docs & config | 1d | P1 |
| 4 Testing | 2–3d | P1 |
| 5 Image pipeline | 2d | P2 |
| 6 UX/a11y/obs | 2–3d | P2/P3 |
| 7 Order integrity | 2–3d | P3 |
| **Total** | **~12–17 dev-days** | |

## Recommended execution order
**Week 1:** Phase 0 → 1 → 2 (visible reliability + performance wins; the video is the headline fix).
**Week 2:** Phase 3 + 4 in parallel (correctness + safety net).
**Week 3:** Phase 5 → 6 → 7 (hardening and polish).

## Owner actions (cannot be done from the repo)
- Set `minOrderValue = 199` in the Sheet **Config** tab.
- Confirm the Cloudflare Pages SPA-fallback / build settings.
- Provide the real Google Business **Place ID** (Phase 3) and, if wanted, a **Featurable** ID.
- Confirm the delivery-fee copy ("free" vs "eligible").
