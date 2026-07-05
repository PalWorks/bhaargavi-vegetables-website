import { describe, it, expect } from 'vitest';
import { translations } from '../translations';

// Guardrail: every locale must expose the exact same set of keys as English.
// If someone adds a new UI string to en.ts but forgets ta.ts / hi.ts (or vice
// versa), this fails in CI instead of silently shipping untranslated text.

type Any = Record<string, unknown>;

// Collect dotted key paths for every leaf in an object.
function keyPaths(obj: Any, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === 'object' && !Array.isArray(v)
      ? keyPaths(v as Any, path)
      : [path];
  });
}

describe('locale parity', () => {
  const en = keyPaths(translations.en as Any).sort();

  (['ta', 'hi'] as const).forEach(lang => {
    it(`${lang} has exactly the same keys as en`, () => {
      const other = keyPaths(translations[lang] as Any).sort();
      const missing = en.filter(k => !other.includes(k));
      const extra = other.filter(k => !en.includes(k));
      expect({ lang, missing, extra }).toEqual({ lang, missing: [], extra: [] });
    });
  });
});
