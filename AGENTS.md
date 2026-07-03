# Agent Context - Bhaargavi Fresh Cuts

## Overview
This repository contains the frontend code for Bhaargavi Fresh Cuts, an online premium vegetable delivery service based in Chennai, India. The site is a React SPA built with Vite and Tailwind CSS.

## Agent Guidelines & Strict Rules

### 1. Zero Backend / WhatsApp-First Architecture
This site has NO traditional backend or database.
- **Orders:** All checkout flows MUST route to WhatsApp via a deep link (`wa.me`). Do not try to implement Stripe, Razorpay, or custom checkout API endpoints.
- **Order Tracking:** Orders are logged on a "best-effort" basis to a Google Apps Script endpoint before opening WhatsApp. This is for record-keeping only.
- **Catalog:** The source of truth for products is a Google Sheet (SKU Item Master). It is fetched via build scripts. Do not hardcode new products into the React components.

### 2. Styling & Aesthetics (CRITICAL)
- The target audience is premium/health-conscious users.
- Use `bv-green`, `bv-cream`, and `bv-dark` from `tailwind.config.js` or `index.css`.
- Always ensure responsive, mobile-first design as 90% of customers order via phone.
- Use `lucide-react` for icons. Do not introduce new icon libraries without asking.

### 3. CI/CD & Deployments
- Do NOT alter `.github/workflows/` unless explicitly instructed.
- The site is static. Never introduce Node.js server dependencies or SSR.

### 4. Code Modification Restrictions
- Do not remove or alter existing Google Apps Script endpoints without user approval.
- Ensure SEO headers (`index.html`), `sitemap.xml`, and `robots.txt` are preserved during builds.
