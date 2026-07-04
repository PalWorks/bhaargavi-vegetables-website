import { CartItem, MenuItem } from '../types';

/**
 * Re-derives cart line prices from the catalog (the source of truth), ignoring whatever
 * price is stored in the cart/localStorage. This is defense-in-depth: a user could edit the
 * persisted cart to change prices, the total, or slip under the minimum-order gate. Since the
 * merchant confirms every order over WhatsApp this is low-severity, but the total we display,
 * gate on, and send should still be authoritative.
 *
 * A line whose (id + weight) is not found in the catalog (e.g. a discontinued SKU) keeps its
 * stored price — we can't verify it, and dropping it silently would be worse.
 */
export function reconcileCartPrices(
  items: CartItem[],
  menu: MenuItem[],
): { items: CartItem[]; adjusted: boolean } {
  const priceMap = new Map<string, number>();
  for (const m of menu) {
    for (const p of m.packSizes) priceMap.set(`${m.id}__${p.weight}`, p.price);
  }

  let adjusted = false;
  const reconciled = items.map(item => {
    const authoritative = priceMap.get(`${item.id}__${item.weight}`);
    if (authoritative !== undefined && authoritative !== item.price) {
      adjusted = true;
      return { ...item, price: authoritative };
    }
    return item;
  });

  return { items: reconciled, adjusted };
}
