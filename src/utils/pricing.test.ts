import { describe, it, expect } from 'vitest';
import { reconcileCartPrices } from './pricing';
import { CartItem, MenuItem } from '../types';

const menu: MenuItem[] = [
  { id: '1', name: 'Carrot Cut', description: '', image: '', categories: ['cut'],
    packSizes: [{ weight: '250 g', price: 40 }, { weight: '500 g', price: 75 }] },
  { id: '27', name: 'Weekly Veggie Combo', description: '', image: '', categories: ['offers'],
    packSizes: [{ weight: '1 kg', price: 299 }] },
];

const line = (over: Partial<CartItem>): CartItem => ({
  id: '1', name: 'Carrot Cut', image: '', price: 40, weight: '250 g', quantity: 1, ...over,
});

describe('reconcileCartPrices', () => {
  it('leaves catalog-matching prices untouched', () => {
    const { items, adjusted } = reconcileCartPrices([line({})], menu);
    expect(adjusted).toBe(false);
    expect(items[0].price).toBe(40);
  });

  it('corrects a tampered price back to the catalog price', () => {
    const { items, adjusted } = reconcileCartPrices([line({ price: 1 })], menu);
    expect(adjusted).toBe(true);
    expect(items[0].price).toBe(40);
  });

  it('reconciles per (id + weight), not just id', () => {
    const { items } = reconcileCartPrices([line({ weight: '500 g', price: 5 })], menu);
    expect(items[0].price).toBe(75);
  });

  it('keeps the stored price for an unknown SKU', () => {
    const { items, adjusted } = reconcileCartPrices(
      [line({ id: '999', weight: '1 kg', price: 3 })], menu,
    );
    expect(adjusted).toBe(false);
    expect(items[0].price).toBe(3);
  });

  it('handles a mixed cart and reports adjusted when any line changes', () => {
    const { items, adjusted } = reconcileCartPrices(
      [line({ price: 40 }), { id: '27', name: 'Combo', image: '', price: 10, weight: '1 kg', quantity: 2 }],
      menu,
    );
    expect(adjusted).toBe(true);
    expect(items[0].price).toBe(40);
    expect(items[1].price).toBe(299);
  });

  it('does not mutate the input array', () => {
    const input = [line({ price: 1 })];
    reconcileCartPrices(input, menu);
    expect(input[0].price).toBe(1);
  });
});
