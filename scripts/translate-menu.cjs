#!/usr/bin/env node
// scripts/translate-menu.cjs
// Auto-translates product name/description/ingredients in src/data/menu.json into
// Tamil (ta) and Hindi (hi), and stores them under each item's `i18n` field so the
// site can render localized product content (English is always the fallback).
//
// WHY BUILD-TIME: translating during the publish/sync step (not in the browser)
// means zero runtime cost, no API key in client code, and new products are picked
// up automatically on the next publish.
//
// CACHING: translations are cached in src/data/i18n-cache.json keyed by source text,
// so re-runs only translate NEW or CHANGED strings. The cache is committed, so
// existing translations stay stable even if the translation endpoint is unavailable.
//
// PROVIDER: uses Google's public translate endpoint (no key). If it ever becomes
// unreliable, set GOOGLE_TRANSLATE_API_KEY to switch to the official Cloud
// Translation API. Any failure falls back to English and never breaks the build.

const fs = require('fs');
const path = require('path');
const https = require('https');

const MENU = path.join(__dirname, '..', 'src', 'data', 'menu.json');
const CACHE = path.join(__dirname, '..', 'src', 'data', 'i18n-cache.json');
const TARGET_LANGS = ['ta', 'hi'];
const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY || '';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function httpsGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}

function httpsPostJson(url, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const u = new URL(url);
    const req = https.request(u, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, res => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Returns the translated string, or null on failure (caller keeps English).
async function translateOnce(text, lang) {
  try {
    if (API_KEY) {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
      const { status, body } = await httpsPostJson(url, { q: text, source: 'en', target: lang, format: 'text' });
      if (status !== 200) return null;
      const out = JSON.parse(body);
      return out?.data?.translations?.[0]?.translatedText ?? null;
    }
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${lang}&dt=t&q=${encodeURIComponent(text)}`;
    const { status, body } = await httpsGet(url);
    if (status !== 200) return null;
    const out = JSON.parse(body);
    if (!Array.isArray(out?.[0])) return null;
    return out[0].map(seg => (seg && seg[0]) || '').join('');
  } catch {
    return null;
  }
}

async function main() {
  let items;
  try { items = JSON.parse(fs.readFileSync(MENU, 'utf8')); }
  catch { console.warn('[translate-menu] menu.json missing/invalid — skipping'); return; }
  if (!Array.isArray(items) || items.length === 0) {
    console.warn('[translate-menu] no items — skipping'); return;
  }

  let cache = {};
  try { cache = JSON.parse(fs.readFileSync(CACHE, 'utf8')); } catch { /* fresh cache */ }
  TARGET_LANGS.forEach(l => { if (!cache[l]) cache[l] = {}; });

  let translated = 0, failed = 0, cached = 0;

  // Cache-first translate: only hit the network for strings we haven't seen.
  const tr = async (text, lang) => {
    const key = String(text || '').trim();
    if (!key) return '';
    if (cache[lang][key] !== undefined) { cached++; return cache[lang][key]; }
    const result = await translateOnce(key, lang);
    await sleep(120); // be gentle with the public endpoint
    if (result == null || result === '') { failed++; return key; } // fall back to English
    cache[lang][key] = result;
    translated++;
    return result;
  };

  for (const item of items) {
    const i18n = {};
    for (const lang of TARGET_LANGS) {
      const name = await tr(item.name, lang);
      const description = await tr(item.description, lang);
      const ingredients = [];
      const src = Array.isArray(item.ingredients)
        ? item.ingredients
        : String(item.ingredients || '').split(',').map(s => s.trim()).filter(Boolean);
      for (const ing of src) ingredients.push(await tr(ing, lang));
      i18n[lang] = { name, description, ingredients };
    }
    item.i18n = i18n;
  }

  fs.writeFileSync(CACHE, JSON.stringify(cache, null, 2));
  fs.writeFileSync(MENU, JSON.stringify(items, null, 2));
  console.log(`[translate-menu] items: ${items.length} | new: ${translated} | cached: ${cached} | fallback(en): ${failed}`);
}

main();
