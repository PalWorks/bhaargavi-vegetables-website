#!/usr/bin/env node
/**
 * Build-time pre-render via React SSR.
 *
 * Renders each route with react-dom/server (src/entry-server.tsx, built to
 * dist-server/) and injects the marker-rich HTML into the client template's
 * <div id="root">. renderToString runs only the initial render (no effects), so
 * the output is exactly what the browser hydrates against — clean hydration,
 * real crawlable HTML, and no headless browser needed.
 */
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { allRoutes } = require('./site-routes.cjs');

const DIST = path.resolve(__dirname, '..', 'dist');
const SSR_ENTRY = path.resolve(__dirname, '..', 'dist-server', 'entry-server.js');
const ROOT_DIV = '<div id="root"></div>';

const escAttr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Inject the route's head (from <Seo>) into the template, replacing the home defaults.
function applyHead(html, head) {
  if (!head) return html;
  const t = escText(head.title);
  const dA = escAttr(head.description);
  const u = escAttr(head.url);
  return html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${dA}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${u}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escAttr(head.title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${dA}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${u}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escAttr(head.title)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${dA}$2`)
    .replace(/(<meta name="twitter:url" content=")[^"]*(")/, `$1${u}$2`);
}

async function main() {
  const templatePath = path.join(DIST, 'index.html');
  if (!fs.existsSync(templatePath)) throw new Error('dist/index.html not found — run "vite build" first.');
  if (!fs.existsSync(SSR_ENTRY)) throw new Error('dist-server/entry-server.js not found — run the SSR build first.');

  const template = fs.readFileSync(templatePath, 'utf-8');
  if (!template.includes(ROOT_DIV)) throw new Error(`Template missing "${ROOT_DIV}" — cannot inject prerendered HTML.`);

  // The SSR bundle is ESM (package.json "type": "module"); import it from CJS.
  const { render } = await import(pathToFileURL(SSR_ENTRY).href);

  for (const route of allRoutes) {
    let result;
    try {
      result = render(route);
    } catch (err) {
      throw new Error(`SSR render failed for ${route}: ${err && err.stack ? err.stack : err}`);
    }
    const withHead = applyHead(template, result.head);
    const html = withHead.replace(ROOT_DIV, `<div id="root">${result.html}</div>`);
    const outPath = route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route, 'index.html');
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, 'utf-8');
    console.log(`prerendered ${route} -> ${path.relative(DIST, outPath)}`);
  }
}

main().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
