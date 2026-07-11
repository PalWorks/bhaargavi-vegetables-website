import { describe, it, expect } from 'vitest';
// @ts-expect-error - importing a CommonJS build script for its pure exports
import cfg from './fetch-config.cjs';

const { parseConfigRows, DEFAULTS } = cfg as {
  parseConfigRows: (rows: unknown[][]) => Record<string, unknown>;
  DEFAULTS: Record<string, unknown>;
};

describe('parseConfigRows', () => {
  it('reads the real Config tab layout (value in A, label in B, image notes below)', () => {
    // Mirrors the actual sheet: A1=199 / B1="Min Order Value", then image guideline rows.
    const rows = [
      ['199', 'Min Order Value'],
      [],
      ['', 'Product Catalog Image Guidelines'],
      ['1', 'Dimensions / Aspect Ratio: 1:1 Square'],
      ['2', 'Format: .webp preferred'],
      ['3', 'File Size: under 100 KB'],
    ];
    const config = parseConfigRows(rows);
    expect(config).toEqual({ minOrderValue: 199 });
    expect({ ...DEFAULTS, ...config }.minOrderValue).toBe(199);
  });

  it('reads the canonical key|value orientation too', () => {
    const config = parseConfigRows([
      ['minOrderValue', '249'],
      ['waNumber', '918888888888'],
      ['deliveryDays', 'Mon-Sat'],
    ]);
    expect(config).toEqual({ minOrderValue: 249, waNumber: '918888888888', deliveryDays: 'Mon-Sat' });
  });

  it('coerces the min order to a number and ignores non-numeric junk', () => {
    expect(parseConfigRows([['Min Order Value', 'abc']])).toEqual({});
    expect(parseConfigRows([['Min Order Value', '199']])).toEqual({ minOrderValue: 199 });
  });

  it('ignores unknown rows and blanks', () => {
    expect(parseConfigRows([[], ['Random', 'stuff'], ['', ''], ['1', 'note text']])).toEqual({});
  });

  it('lets a populated sheet override defaults while defaults fill the rest', () => {
    const merged = { ...DEFAULTS, ...parseConfigRows([['Min Order Value', '199']]) };
    expect(merged.minOrderValue).toBe(199);
    expect(merged.waNumber).toBe('919150219379'); // from defaults
  });
});
