/**
 * Returns the WebP variant path for a local PNG/JPG image (generated at build by
 * scripts/optimize-images.cjs). Returns null for remote or already-webp sources.
 */
export function webpVariant(src: string): string | null {
  if (!src || /^https?:\/\//.test(src)) return null;
  if (/\.webp$/i.test(src)) return null;
  if (/\.(png|jpe?g)$/i.test(src)) return src.replace(/\.(png|jpe?g)$/i, '.webp');
  return null;
}
