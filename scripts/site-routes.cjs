// Single source of truth for the site's route list, derived from the catalog.
// Consumed by scripts/prerender.cjs (what to prerender) and
// scripts/generate-sitemap.cjs (what to list). Mirrors src/utils/slug.ts.
const menu = require('../src/data/menu.json');

// Keep identical to slugify() in src/utils/slug.ts.
function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Static routes prerendered as their own HTML files (trailing slash = Cloudflare's
// canonical form). '/faq/' is added in Phase C once FaqPage exists.
const STATIC_ROUTES = ['/', '/about/', '/privacy/', '/terms/', '/refund/', '/shipping/'];

// Categories: split the comma-separated Category column, dedupe by slug.
const categoryMap = new Map(); // slug -> raw label
for (const p of menu) {
  String(p.category || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((c) => {
      const s = slugify(c);
      if (s && !categoryMap.has(s)) categoryMap.set(s, c);
    });
}
const categoryRoutes = [...categoryMap.keys()].map((s) => `/category/${s}/`);

// Products: one route per catalog item; slugs must be unique.
const productSlugs = new Set();
const productRoutes = [];
for (const p of menu) {
  const s = slugify(p.name);
  if (!s) continue;
  if (productSlugs.has(s)) {
    throw new Error(`[site-routes] Duplicate product slug "${s}" from name "${p.name}". Product slugs must be unique.`);
  }
  productSlugs.add(s);
  productRoutes.push(`/products/${s}/`);
}

const allRoutes = [...STATIC_ROUTES, ...categoryRoutes, ...productRoutes];

module.exports = {
  slugify,
  STATIC_ROUTES,
  categoryRoutes,
  productRoutes,
  allRoutes,
  categoryMap,
};
