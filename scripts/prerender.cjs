#!/usr/bin/env node
/**
 * Build-time pre-render. Serves the freshly built dist/ over a local static
 * server, drives each route through a real headless browser (Puppeteer), and
 * writes the fully rendered HTML back to dist/<route>/index.html.
 *
 * This gives crawlers real HTML for a client-side React SPA without an SSR
 * server, and works with the browser-only APIs used across the app.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const DIST = path.resolve(__dirname, '..', 'dist');
const HOST = '127.0.0.1';

// Routes to pre-render. Keep in sync with src/App.tsx <Routes> and public/sitemap.xml.
const ROUTES = ['/', '/about', '/privacy', '/terms', '/refund', '/shipping'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

function createServer() {
  return http.createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let filePath = path.join(DIST, urlPath);

    // Directory or unknown route -> serve dist/index.html (SPA fallback).
    if (!path.extname(filePath)) {
      filePath = path.join(DIST, 'index.html');
    }

    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Fall back to the SPA shell so client routing can take over.
        fs.readFile(path.join(DIST, 'index.html'), (err2, shell) => {
          if (err2) {
            res.writeHead(404);
            res.end('Not found');
          } else {
            res.writeHead(200, { 'Content-Type': MIME['.html'] });
            res.end(shell);
          }
        });
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(data);
    });
  });
}

async function main() {
  if (!fs.existsSync(path.join(DIST, 'index.html'))) {
    throw new Error('dist/index.html not found — run "vite build" before prerender.');
  }

  const server = createServer();
  await new Promise((resolve) => server.listen(0, HOST, resolve));
  const port = server.address().port;
  const base = `http://${HOST}:${port}`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      const url = `${base}${route}`;
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 45000 });
      // Ensure React has mounted content into #root.
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root');
          return root && root.children.length > 0;
        },
        { timeout: 45000 }
      );

      const html = '<!doctype html>\n' + (await page.evaluate(() => document.documentElement.outerHTML));
      await page.close();

      const outPath =
        route === '/'
          ? path.join(DIST, 'index.html')
          : path.join(DIST, route, 'index.html');
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, html, 'utf-8');
      console.log(`prerendered ${route} -> ${path.relative(DIST, outPath)}`);
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error('[prerender] failed:', err);
  process.exit(1);
});
