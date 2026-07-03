# Architecture - Bhaargavi Fresh Cuts

## System Design
The application is a purely static Single Page Application (SPA).

1. **Frontend:** React 19, Vite 6, Tailwind CSS 4.
2. **State Management:** React Context API (`CartContext`, `LanguageContext`). Local storage is used for cart persistence.
3. **Data Source:** Google Sheets. A build-time script fetches the SKU Item Master and saves it locally as JSON.
4. **Checkout Flow:** WhatsApp Deep Linking. No payment gateway is integrated.
5. **Analytics/Logging:** Google Apps Script Webhook.

## Component Tree
- `App.tsx` (Root, ErrorBoundary, Providers, Router)
  - `Layout` (ScrollVideoBackground, Navbar, Footer, CartSidebar, StickyCart)
    - `HomePage` (Hero, Products, ReviewCarousel, GoogleReviews, InstagramFeed)
    - Policy Pages (`PrivacyPolicy`, etc.)

## Data Flow
1. User adds items to the cart. State is managed by `CartContext` and mirrored to `localStorage`.
2. On Checkout, the client parses the cart and builds a formatted string message.
3. A `fetch` request is sent to `VITE_APPS_SCRIPT_URL` to log the order (wrapped in an `AbortController` 2-second timeout).
4. The user is redirected to `wa.me` with the pre-filled order string.
