# Domain Knowledge - Bhaargavi Fresh Cuts

## Business Model
Bhaargavi Fresh Cuts provides premium, ready-to-cook, pre-cut vegetables and fruits to households in Chennai. The value proposition is time-saving, hygiene, and convenience for working professionals.

## Key Terminology
- **FSSAI Certified:** The government food safety certification. Crucial trust marker.
- **RO Washed:** All vegetables are washed in Reverse Osmosis (highly purified) water.
- **AC Room Processed:** Processing happens in temperature-controlled environments to prevent spoilage.
- **Poriyal Cut / Sambar Cut:** Traditional South Indian vegetable cut styles. "Poriyal" means finely chopped for stir-fry. "Sambar" means diced for stews/curries.
- **Health Packs:** Specialized mixes (e.g., sprout mixes, salad boxes).

## Operational Rules
- **Minimum Order:** ₹ 199. The system must prevent checkout below this amount.
- **Delivery Area:** Chennai exclusively.
- **Order Timing:** Next day delivery for orders placed before 8 PM.
- **Checkout Mode:** WhatsApp exclusively. No credit card or UPI gateway is hosted on the site.

## Live Setup
- **Domain:** `bhaargavifreshcuts.com` (Cloudflare Pages, project `bhaargavi-website`);
  `www` 301-redirects to the apex.
- **Catalog source of truth:** the `ProductCatalog` tab of the "Bhaargavi Vegetables - SKU Item
  Master" Google Sheet. The website is fully sheet-driven (no hardcoded product list).
- **Languages:** English, Tamil, Hindi. Product content is auto-translated at build time.
- **Analytics:** Google Analytics 4 + Microsoft Clarity.
- **Order log:** Google Apps Script webhook writes each order to the `Orders` tab and independently
  recomputes the total from the catalog (MATCH / MISMATCH integrity flag).
