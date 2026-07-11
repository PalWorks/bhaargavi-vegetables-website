# Bhaargavi Fresh Cuts — Website Implementation Plan

> **ARCHIVAL NOTE (added 2026-07-12 IST): COMPLETED, PARTIALLY SUPERSEDED.**
> This plan was fully executed. The site was built and is live in production at
> https://bhaargavifreshcuts.com. The build-sequence checkboxes below were never
> ticked off, but all 21 items shipped. Parts have since been superseded by later
> work not described here: SSR pre-render plus hydrateRoot for SEO/LCP, and
> catalog-driven categories replacing the fixed fresh/cut/health/offers set. The
> primary contact number is now +91 91502 19379 (already reflected above). Kept for
> historical reference only; this is not an active TODO list.

**Status:** Completed and archived 2026-07-12 (original: "Approved for execution")
**Date:** 2026-06-23
**Stack:** React 19, Vite 6, Tailwind CSS 4, TypeScript
**WhatsApp:** +91 91502 19379
**FSSAI Reg No.:** 22426075000434 (valid till May 2031)
**Address:** Plot No. 28, ORR Diamond Avenue, Saibaba Nagar, Pazhanthandalam, Chennai 600044

---

## Decision Log

| # | Decision | Chosen |
|---|---|---|
| 1 | Order recording backend | Google Apps Script Web App (doPost) — free, no infra, native Sheets access |
| 2 | Google Reviews widget | `react-google-reviews` npm package (open-source, free via Featurable) + "Write a Review" link |
| 3 | Logo | Extracted from brand deck — basket with vegetables, "BHAARGAVI FRESH VEGETABLES" |
| 4 | Product images | AI-generated placeholders; replaced when client fills catalog spreadsheet |
| 5 | Hosting | Cloudflare Pages (same as TomeCafe) — decision final |
| 6 | Fresh fish | Excluded. Website covers fruits and vegetables only. |

### Decision 1 Detail — Order Recording

**Why Google Apps Script over Cloudflare Worker:**
- Zero infrastructure. No Service Account JSON to manage.
- A single Apps Script file deployed as a Web App gives us a `doPost` HTTPS endpoint.
- The script runs under Palani's Google account and has editor access to the Orders Sheet natively.
- No API keys exposed in frontend. The endpoint URL is stored as a Vite env variable.
- Free forever within Google's quotas (20,000 script runs/day, well above any vegetable shop traffic).

**How it works:**
1. Customer clicks "Order on WhatsApp" in the cart.
2. Frontend sends a `fetch POST` to the Apps Script URL with order JSON.
3. Apps Script appends one row to the Orders Sheet.
4. Frontend opens the `wa.me` deep link regardless of whether the fetch succeeded (best-effort).

**Orders Sheet columns:** Timestamp | Order ID | Items (text) | Total (Rs) | Custom Note | Status

### Decision 2 Detail — Google Reviews

**`react-google-reviews`** (https://github.com/Featurable/react-google-reviews):
- Open-source npm package.
- Uses Featurable's free caching proxy so the Google API key is never exposed client-side.
- Free tier: unlimited reviews display, requires free Featurable account and Google Place ID.
- Displays up to 5 most-recent Google reviews with star ratings.
- "Write a Review" button links to the Google Business review URL.

**What's needed from client:** Google Business Profile Place ID (a short string like `ChIJ...`).
Placeholder: a styled "View our Google Reviews" button until Place ID is provided.

### Decision 5 Detail — Hosting Deep Dive

| | Cloudflare Pages | GCP Free Tier |
|---|---|---|
| Static hosting | Unlimited bandwidth, global CDN | Cloud Run or Firebase Hosting |
| Build minutes | 500/month free | 120 build-minutes/day (Cloud Build) |
| Order recording | Apps Script (not tied to hosting) | Apps Script (same) |
| Deploy complexity | Same workflow as TomeCafe — already proven | New setup required |
| Domain setup | Simple CNAME | More involved |
| **Verdict** | Proceed | Evaluate later if scale demands it |

---

## Brand Identity

### Color Tokens (`src/index.css`)

```css
@theme {
  --color-bv-green:       #2E7D32;
  --color-bv-green-light: #66BB6A;
  --color-bv-cream:       #FAFAF5;
  --color-bv-dark:        #1B2720;
  --color-bv-orange:      #F57C00;
  --color-bv-muted:       #6B7280;
  --color-bv-card:        #F0F7EE;
}
```

### Typography (Google Fonts)

| Role | Font |
|---|---|
| Headings | Playfair Display 700 |
| Body | DM Sans 400, 500 |
| UI labels | DM Sans 600 |
| Tamil | Noto Sans Tamil 400, 600 |
| Hindi | Noto Sans Devanagari 400, 600 |

### Logo

File: `public/BhaargaviLogo.jpg` (extracted from brand deck).
Round badge: wicker basket overflowing with fresh vegetables, sun rays behind, "BHAARGAVI" banner, "FRESH VEGETABLES" subtitle. Green and gold palette.

### Design Principles

1. Photography-first — large hero with vibrant fresh produce.
2. Trust strip immediately below hero: FSSAI, RO Water, Cold Chain, AC Room badges.
3. Clean whitespace with `bv-card` (#F0F7EE) card backgrounds.
4. Micro-animations on card hover (subtle lift + shadow).
5. Mobile-first — every section works at 375 px.
6. No serif body text — keep it clean and readable.

---

## Architecture

```
src/
  components/
    Navbar.tsx
    Hero.tsx
    Products.tsx          (renamed from Menu.tsx)
    CartSidebar.tsx
    StickyCart.tsx
    ReviewCarousel.tsx
    GoogleReviews.tsx     (NEW)
    InstagramFeed.tsx
    AboutPage.tsx         (NEW — separate route)
    Footer.tsx
    PolicyPages.tsx
  context/
    CartContext.tsx
  locales/
    en.ts
    ta.ts                 (NEW — Tamil)
    hi.ts                 (NEW — Hindi)
  data/
    menu.json             (auto-fetched from Sheet 1)
    hero-banner.json      (auto-fetched)
    testimonials.json     (auto-fetched)
    instagram.json        (auto-fetched)
    config.json           (NEW — auto-fetched from Sheet 2)
  types.ts
  constants.ts
  index.css
  App.tsx

scripts/
  fetch-menu.cjs
  fetch-config.cjs        (NEW)
  fetch-images.cjs
  fetch-instagram.cjs
  check-instagram-token.cjs
  download-instagram-images.cjs

public/
  BhaargaviLogo.jpg
  menu/
  hero-banner/
  testimonials/
  instagram/              (gitignored)
```

---

## Google Sheets Schema

### Sheet 1 — Products

| Column | Value |
|---|---|
| Sorting Order | Integer for display order |
| Name | Product name |
| Description | Short description |
| Category | `fresh` / `cut` / `health` / `offers` |
| Badge | `Bestseller` / `New` / `Pre-Order` / blank |
| Image | Public image URL |
| Ingredients | Comma-separated string |
| 100g | Price in Rs (blank = not available) |
| 200g | Price in Rs |
| 250g | Price in Rs |
| 500g | Price in Rs |
| 1kg | Price in Rs |
| 2kg | Price in Rs |
| 3kg | Price in Rs |
| 5kg | Price in Rs |
| 10kg | Price in Rs |

Blank cell = that size is not available for that product. The fetch script builds `packSizes[]` from non-blank columns only.

### Sheet 2 — Config/Settings

| Key | Example Value |
|---|---|
| minOrderValue | 199 |
| waNumber | 919150219379 |
| deliveryDays | Monday to Saturday |
| deliveryHours | 6 AM to 8 PM |
| deliveryNote | Orders above Rs 199 eligible for delivery |

### Orders Sheet (separate spreadsheet)

Columns: Timestamp | Order ID | Items | Total (Rs) | Custom Note | Status

Written by Apps Script `doPost` on each order placement.

---

## Data Types (`src/types.ts`)

```typescript
export interface PackSize {
  weight: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  packSizes: PackSize[];
  image: string;
  category: 'fresh' | 'cut' | 'health' | 'offers';
  isNew?: boolean;
  isBestseller?: boolean;
  isSoldOut?: boolean;
  isPreOrder?: boolean;
  badge?: string;
  ingredients?: string[];
}

export interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  weight: string;
  quantity: number;
  customNote?: string;
}

export interface SiteConfig {
  minOrderValue: number;
  waNumber: string;
  deliveryDays: string;
  deliveryHours: string;
  deliveryNote: string;
}

export interface Review {
  id: string;
  customerName: string;
  text: string;
  rating: number;
}

export interface HeroImage {
  id: string;
  src: string;
  alt: string;
}

export interface InstagramPost {
  id: string;
  image: string;
  caption: string;
  likes: number;
  link: string;
  mediaType: 'image' | 'video';
  videoSrc?: string;
}
```

---

## WhatsApp Message Format

```
[2026-06-23 14:32:10]

Hello Bhaargavi Fresh Cuts! I would like to order:

2 x Carrot Cut (250 g) - Rs 80
1 x Sambar Mix (200 g) - Rs 35
1 x Green Moong Sprouts (200 g) - Rs 40

Custom packing note: Please pack Carrot Cut in 2 separate bags.

*Total: Rs 155*

Please confirm my order and share the delivery details.

Thank you for choosing Bhaargavi Fresh Cuts.
```

---

## Localisation

Languages: English (EN) | Tamil (தமிழ்) | Hindi (हिंदी)

Switcher cycles: EN → தமிழ் → हिंदी → EN

New keys beyond TomeCafe structure:
- `products.*` — category tab labels, size selector, pre-order/sold-out badges
- `cart.min_order`, `cart.add_more`, `cart.custom_note_label`
- `story.*` — 5-step Bhaargavi origin story
- `trust.*` — FSSAI, RO water, cold chain, hygienic badges
- `about.*` — quality standards, machinery, packaging sections

Tamil and Hindi: machine-translated first pass, client-reviewed before launch.

---

## Fake Reviews (Tamil names, Chennai)

| Name | Review (English) | Used for |
|---|---|---|
| Kavitha Rajan | "No more morning prep stress! The cut vegetables are always fresh and perfectly sized." | ReviewCarousel |
| Senthil Kumar | "The sambar mix pack saves me 30 minutes every evening. Highly recommend." | ReviewCarousel |
| Priya Sundaram | "My kids eat more vegetables now because they look so fresh. Brilliant quality!" | ReviewCarousel |
| Meenakshi Anand | "The sprouts are incredibly fresh — no smell, no sliminess. I order every week." | ReviewCarousel |
| Arun Venkatesh | "FSSAI certified and RO washed. Finally a brand I can trust for my family." | ReviewCarousel |

---

## The Bhaargavi Story (About Page, 5 steps)

**Step 1 — The Inspiration**
Chennai loves its sambar, kuzhambu, and kootu. But prepping vegetables every morning takes time that busy families can barely spare.

**Step 2 — The Facility**
We built a FSSAI-certified facility in Pazhanthandalam — equipped with a Kookmate bubble washer and V Tech cutting machine, running in a fully air-conditioned environment.

**Step 3 — The Process**
Every vegetable is washed with RO-purified water, cut in an AC room to prevent contamination, and stored in a cold room to lock in freshness.

**Step 4 — The Promise**
No preservatives. No shortcuts. Just clean, fresh, ready-to-cook produce — packed with care for Chennai's kitchens.

**Step 5 — Today**
From Pazhanthandalam to your doorstep, every pack we deliver carries our commitment to quality. Healthy. Fresh. Ready to Cook.

---

## Build Sequence

- [ ] 1. Scaffold: copy TomeCafe repo to `bhaargavi-website/`, clear git history, init fresh
- [ ] 2. Design system: `index.css` tokens, Google Fonts, `DESIGN_SYSTEM.md`
- [ ] 3. Types: update `types.ts`
- [ ] 4. Data pipeline: update `fetch-menu.cjs`, write `fetch-config.cjs`
- [ ] 5. Constants: all brand constants in `constants.ts`
- [ ] 6. Cart context: size-aware items, min-order guard, Apps Script order recording
- [ ] 7. Apps Script: write and deploy `doPost` Web App, paste URL in `.env`
- [ ] 8. Hero: fresh produce imagery, trust badge strip
- [ ] 9. Products component: pack size selector, pre-order badges, custom note
- [ ] 10. Cart sidebar: updated message, min-order progress bar
- [ ] 11. About page + 5-step story section
- [ ] 12. Review carousel: fake Tamil reviews
- [ ] 13. Google Reviews component: Featurable placeholder until Place ID confirmed
- [ ] 14. Instagram feed: placeholder captions until creds arrive
- [ ] 15. Footer + Navbar: language switcher EN/Tamil/Hindi, updated links
- [ ] 16. Policy pages: rewritten for fresh produce / food delivery
- [ ] 17. Tamil and Hindi locale files
- [ ] 18. CI/CD workflow: updated for Bhaargavi (remove JP/KN locale steps)
- [ ] 19. `DESIGN_SYSTEM.md` committed
- [ ] 20. Smoke test on local dev server
- [ ] 21. Deploy to Cloudflare Pages staging

---

## Pending from Client

| Item | Needed For |
|---|---|
| Google Business Place ID | Google Reviews widget |
| Instagram App credentials | Instagram feed |
| Product images | Menu cards (AI placeholders in meantime) |
| Testimonial / review screenshots | ReviewCarousel (fake reviews in meantime) |
| Domain name | Cloudflare Pages project + CNAME |
| Order confirmation — client to set delivery area pins | Delivery policy page |
