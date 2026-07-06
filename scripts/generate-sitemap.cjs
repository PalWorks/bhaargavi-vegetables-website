#!/usr/bin/env node
// Generates dist/sitemap.xml from the derived route list so all category/product
// pages stay listed automatically. Runs in the build after prerender.
const fs = require('fs');
const path = require('path');
const { allRoutes } = require('./site-routes.cjs');

const BASE = 'https://bhaargavifreshcuts.com';
const lastmod = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

const body = allRoutes
  .map((r) => `  <url>\n    <loc>${BASE}${r}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

const out = path.resolve(__dirname, '..', 'dist', 'sitemap.xml');
fs.writeFileSync(out, xml, 'utf-8');
console.log(`sitemap: wrote ${allRoutes.length} urls -> dist/sitemap.xml`);
