/**
 * URL slug helpers. The build script (scripts/site-routes.cjs) mirrors this exact
 * logic so app <Link> hrefs, route matching, prerender routes, and the sitemap all
 * agree. Keep the two slugify implementations identical.
 *
 * Inputs are the English product/category names from the catalog (ASCII), so a
 * simple alphanumeric-to-hyphen reduction is sufficient.
 */
export function slugify(input: string): string {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric -> hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

/** Slug for a product, derived from its English name. */
export function productSlug(name: string): string {
  return slugify(name);
}

/** Slug for a category, derived from its raw sheet label. */
export function categorySlug(raw: string): string {
  return slugify(raw);
}
