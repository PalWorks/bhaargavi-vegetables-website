import { describe, it, expect } from 'vitest';
import { slugify, productSlug, categorySlug } from './slug';
import menu from '../data/menu.json';

describe('slugify', () => {
  it('lowercases and hyphenates', () => {
    expect(slugify('Sambar Onion Peeled')).toBe('sambar-onion-peeled');
    expect(categorySlug('Cut Vegetables')).toBe('cut-vegetables');
    expect(categorySlug('Combo offers')).toBe('combo-offers');
  });

  it('collapses non-alphanumerics and trims hyphens', () => {
    expect(slugify('  Carrot & Beans (Poriyal) Cut!  ')).toBe('carrot-beans-poriyal-cut');
  });

  it('produces unique slugs across the whole catalog', () => {
    const slugs = (menu as { name: string }[]).map((p) => productSlug(p.name));
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
