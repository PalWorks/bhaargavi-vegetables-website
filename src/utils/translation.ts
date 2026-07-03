/**
 * translation.ts
 *
 * Type-safe helpers for accessing translated content by dynamic keys.
 *
 * Problem: Translation data objects (menuItems, heroImages, etc.) have literal
 * keys ('1', '2', ...) inferred from the locale files, but components look them
 * up with `string` IDs from runtime data. This causes TS errors because
 * `string` can't index an object with literal keys.
 *
 * Solution: A single generic helper that performs the cast once, returning
 * `T | undefined` so callers still get type safety on the value side.
 */

/**
 * Safely retrieves a translated value from a translation collection using a
 * dynamic key. Returns `undefined` if the key does not exist.
 *
 * @example
 * // Before (required @ts-ignore):
 * // @ts-ignore
 * const translation = t.data.menuItems[item.id];
 *
 * // After (type-safe):
 * const translation = getTranslation(t.data.menuItems, item.id);
 */
export function getTranslation<T extends Record<string, unknown>>(
    collection: T,
    key: string
): T[keyof T] | undefined {
    if (!collection) return undefined;
    return (collection as Record<string, T[keyof T]>)[key];
}
