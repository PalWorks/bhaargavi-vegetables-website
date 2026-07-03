/**
 * fetch-images.cjs
 *
 * Fetches carousel image data from Google Sheets (HeroBanner & Testimonials tabs)
 * and writes to src/data/hero-banner.json and src/data/testimonials.json.
 * For rows with Google Drive image URLs, downloads the images to
 * public/hero-banner/ and public/testimonials/ respectively.
 *
 * Environment variables:
 *   SKUITEMMASTER_GOOGLE_SHEETS_API_KEY - Google Sheets API key (required)
 *
 * Usage:
 *   node scripts/fetch-images.cjs
 *   SKUITEMMASTER_GOOGLE_SHEETS_API_KEY=xxx node scripts/fetch-images.cjs
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ─── Configuration ───────────────────────────────────────────────────────────
const API_KEY = process.env.SKUITEMMASTER_GOOGLE_SHEETS_API_KEY;
const SHEET_ID = '18Yadl4c243IPOgAOCXCJ-o61t2EITww7Uxg7roHxMpY';

// Sheet ranges: columns A through C for HeroBanner, A through D for Testimonials
const HERO_BANNER_RANGE = 'HeroBanner!A:C';      // Sorting Order, Image, Alt Text
const TESTIMONIALS_RANGE = 'Testimonials!A:D';    // Sorting Order, Image, Alt Text, Border Color

// Output paths
const HERO_BANNER_DATA_FILE = path.join(__dirname, '../src/data/hero-banner.json');
const TESTIMONIALS_DATA_FILE = path.join(__dirname, '../src/data/testimonials.json');
const HERO_BANNER_IMAGE_DIR = path.join(__dirname, '../public/hero-banner');
const TESTIMONIALS_IMAGE_DIR = path.join(__dirname, '../public/testimonials');

// Default color palette for testimonial card borders (cycles when no color specified)
const DEFAULT_COLORS = ['#0ea5e9', '#fbbf24', '#f43f5e', '#8b5cf6', '#14b8a6'];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Makes an HTTPS/HTTP GET request and returns the response body as a Buffer.
 * Follows up to 5 redirects.
 */
function httpsGet(url, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (res) => {
            // Follow redirects
            if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
                return httpsGet(res.headers.location, maxRedirects - 1).then(resolve, reject);
            }

            if (res.statusCode !== 200) {
                res.resume();
                return reject(new Error(`HTTP ${res.statusCode}`));
            }

            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(Buffer.concat(chunks)));
            res.on('error', reject);
        }).on('error', reject);
    });
}

/**
 * Downloads a file from a URL and saves it to the given filepath.
 * Follows redirects (important for Google Drive).
 */
function downloadFile(url, filepath, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        protocol.get(url, (res) => {
            // Follow redirects
            if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
                if (maxRedirects <= 0) return reject(new Error('Too many redirects'));
                return downloadFile(res.headers.location, filepath, maxRedirects - 1).then(resolve, reject);
            }

            if (res.statusCode !== 200) {
                res.resume();
                return reject(new Error(`HTTP ${res.statusCode}`));
            }

            const stream = fs.createWriteStream(filepath);
            res.pipe(stream);
            stream.on('finish', () => { stream.close(); resolve(); });
            stream.on('error', reject);
        }).on('error', reject);
    });
}

/**
 * Extracts the Google Drive file ID from a sharing URL.
 * Supports formats:
 *   https://drive.google.com/file/d/{ID}/view?usp=sharing
 *   https://drive.google.com/open?id={ID}
 */
function extractDriveFileId(url) {
    const match = url.match(/\/d\/([\w-]+)/) || url.match(/[?&]id=([\w-]+)/);
    return match ? match[1] : null;
}

/**
 * Checks if a URL is a Google Drive link.
 */
function isDriveUrl(url) {
    return url && url.includes('drive.google.com');
}

/**
 * Validates that a file at the given path is an actual image (JPEG or PNG).
 * Returns true if valid, false otherwise.
 */
function isValidImage(filepath) {
    const fileBuffer = fs.readFileSync(filepath);
    const isJpeg = fileBuffer.length > 2 && fileBuffer[0] === 0xFF && fileBuffer[1] === 0xD8;
    const isPng = fileBuffer.length > 4 && fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50;
    return isJpeg || isPng;
}

// ─── Sheet Fetching ──────────────────────────────────────────────────────────

/**
 * Fetches data from a specific range in the Google Sheet.
 * Returns an array of arrays (rows), or null if the sheet/tab is empty.
 */
async function fetchSheetRange(range) {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${encodeURIComponent(range)}?key=${API_KEY}`;
    console.log(`  Fetching range: ${range}...`);

    try {
        const buffer = await httpsGet(url);
        const json = JSON.parse(buffer.toString());

        if (!json.values || json.values.length < 2) {
            console.log(`  ⚠ No data rows found in "${range}". Skipping.`);
            return null;
        }

        return json.values;
    } catch (err) {
        console.error(`  ✗ Failed to fetch "${range}": ${err.message}`);
        return null;
    }
}

// ─── Hero Banner Processing ─────────────────────────────────────────────────

/**
 * Parses HeroBanner sheet rows into image objects.
 *
 * Expected columns (0-indexed):
 *   0: Sorting Order
 *   1: Image (Google Drive URL or local path)
 *   2: Alt Text
 */
function parseHeroBannerRows(rows) {
    const dataRows = rows.slice(1); // Skip header row
    console.log(`  Found ${dataRows.length} hero banner entries.`);

    return dataRows
        .filter(row => row[0] && row[0].trim()) // Skip rows without a sorting order
        .map(row => {
            const sortingOrder = parseInt(row[0] || '0', 10);
            const image = (row[1] || '').trim();
            const altText = (row[2] || 'Tome Cafe hero image').trim();

            return {
                id: String(sortingOrder),
                src: image,
                alt: altText,
            };
        })
        .sort((a, b) => parseInt(a.id) - parseInt(b.id));
}

/**
 * Downloads Google Drive images for hero banner items.
 * Saves to public/hero-banner/ directory.
 */
async function processHeroBannerImages(items) {
    for (const item of items) {
        if (!isDriveUrl(item.src)) {
            console.log(`    [Hero ${item.id}] Local/existing path → ${item.src}`);
            continue;
        }

        const fileId = extractDriveFileId(item.src);
        if (!fileId) {
            console.warn(`    [Hero ${item.id}] Could not extract Drive file ID from: ${item.src}`);
            continue;
        }

        const filename = `hero-${item.id}.jpg`;
        const localPath = path.join(HERO_BANNER_IMAGE_DIR, filename);
        const publicPath = `/hero-banner/${filename}`;
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

        try {
            console.log(`    [Hero ${item.id}] Downloading from Drive...`);
            await downloadFile(downloadUrl, localPath);

            // Validate downloaded file is an actual image
            if (!isValidImage(localPath)) {
                fs.unlinkSync(localPath);
                throw new Error('Downloaded file is not a valid image (likely HTML error/confirmation page)');
            }

            console.log(`    [Hero ${item.id}] ✓ Saved to ${publicPath}`);
            item.src = publicPath;
        } catch (err) {
            console.error(`    [Hero ${item.id}] ✗ Download FAILED - ${err.message}`);
            console.error(`       Keeping original value: ${item.src}`);
        }
    }
}

// ─── Testimonials Processing ─────────────────────────────────────────────────

/**
 * Parses Testimonials sheet rows into review image objects.
 *
 * Expected columns (0-indexed):
 *   0: Sorting Order
 *   1: Image (Google Drive URL or local path)
 *   2: Alt Text
 *   3: Border Color (hex code, optional — uses default palette if empty)
 */
function parseTestimonialsRows(rows) {
    const dataRows = rows.slice(1); // Skip header row
    console.log(`  Found ${dataRows.length} testimonial entries.`);

    return dataRows
        .filter(row => row[0] && row[0].trim()) // Skip rows without a sorting order
        .map((row, index) => {
            const sortingOrder = parseInt(row[0] || '0', 10);
            const image = (row[1] || '').trim();
            const altText = (row[2] || 'Customer feedback').trim();
            const color = (row[3] || '').trim() || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

            return {
                id: String(sortingOrder),
                src: image,
                alt: altText,
                type: 'chat',
                color: color,
            };
        })
        .sort((a, b) => parseInt(a.id) - parseInt(b.id));
}

/**
 * Downloads Google Drive images for testimonial items.
 * Saves to public/testimonials/ directory.
 */
async function processTestimonialsImages(items) {
    for (const item of items) {
        if (!isDriveUrl(item.src)) {
            console.log(`    [Testimonial ${item.id}] Local/existing path → ${item.src}`);
            continue;
        }

        const fileId = extractDriveFileId(item.src);
        if (!fileId) {
            console.warn(`    [Testimonial ${item.id}] Could not extract Drive file ID from: ${item.src}`);
            continue;
        }

        const filename = `testimonial-${item.id}.jpg`;
        const localPath = path.join(TESTIMONIALS_IMAGE_DIR, filename);
        const publicPath = `/testimonials/${filename}`;
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

        try {
            console.log(`    [Testimonial ${item.id}] Downloading from Drive...`);
            await downloadFile(downloadUrl, localPath);

            // Validate downloaded file is an actual image
            if (!isValidImage(localPath)) {
                fs.unlinkSync(localPath);
                throw new Error('Downloaded file is not a valid image (likely HTML error/confirmation page)');
            }

            console.log(`    [Testimonial ${item.id}] ✓ Saved to ${publicPath}`);
            item.src = publicPath;
        } catch (err) {
            console.error(`    [Testimonial ${item.id}] ✗ Download FAILED - ${err.message}`);
            console.error(`       Keeping original value: ${item.src}`);
        }
    }
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
    if (!API_KEY) {
        console.error('Error: SKUITEMMASTER_GOOGLE_SHEETS_API_KEY is not defined.');
        console.error('Set it as an environment variable or GitHub Secret.');
        process.exit(1);
    }

    // Ensure output directories exist
    if (!fs.existsSync(HERO_BANNER_IMAGE_DIR)) fs.mkdirSync(HERO_BANNER_IMAGE_DIR, { recursive: true });
    if (!fs.existsSync(TESTIMONIALS_IMAGE_DIR)) fs.mkdirSync(TESTIMONIALS_IMAGE_DIR, { recursive: true });
    if (!fs.existsSync(path.dirname(HERO_BANNER_DATA_FILE))) fs.mkdirSync(path.dirname(HERO_BANNER_DATA_FILE), { recursive: true });

    console.log('═══════════════════════════════════════════════');
    console.log('  Carousel Image Sync from Google Sheets');
    console.log('═══════════════════════════════════════════════\n');


    // ── 1. Hero Banner ───────────────────────────────────────────────────────
    console.log('┌─ Hero Banner ─────────────────────────────────');
    const heroBannerRows = await fetchSheetRange(HERO_BANNER_RANGE);

    if (heroBannerRows) {
        const heroBannerItems = parseHeroBannerRows(heroBannerRows);

        if (heroBannerItems.length > 0) {
            console.log('\n  Processing hero banner images...');
            await processHeroBannerImages(heroBannerItems);

            // Write JSON (only the fields needed by the frontend)
            const heroOutput = heroBannerItems.map(({ id, src, alt }) => ({ id, src, alt }));
            fs.writeFileSync(HERO_BANNER_DATA_FILE, JSON.stringify(heroOutput, null, 2));
            console.log(`\n  ✅ Wrote ${heroBannerItems.length} items to ${path.relative(process.cwd(), HERO_BANNER_DATA_FILE)}`);
        } else {
            console.log('  ⚠ No valid hero banner items found. Keeping existing JSON.');
        }
    } else {
        console.log('  ⚠ HeroBanner tab not found or empty. Keeping existing JSON.');
    }

    // ── 2. Testimonials ──────────────────────────────────────────────────────
    console.log('\n┌─ Testimonials ─────────────────────────────────');
    const testimonialsRows = await fetchSheetRange(TESTIMONIALS_RANGE);

    if (testimonialsRows) {
        const testimonialsItems = parseTestimonialsRows(testimonialsRows);

        if (testimonialsItems.length > 0) {
            console.log('\n  Processing testimonial images...');
            await processTestimonialsImages(testimonialsItems);

            // Write JSON
            fs.writeFileSync(TESTIMONIALS_DATA_FILE, JSON.stringify(testimonialsItems, null, 2));
            console.log(`\n  ✅ Wrote ${testimonialsItems.length} items to ${path.relative(process.cwd(), TESTIMONIALS_DATA_FILE)}`);
        } else {
            console.log('  ⚠ No valid testimonial items found. Keeping existing JSON.');
        }
    } else {
        console.log('  ⚠ Testimonials tab not found or empty. Keeping existing JSON.');
    }

    console.log('\n═══════════════════════════════════════════════');
    console.log('  Done!');
    console.log('═══════════════════════════════════════════════');


}

main();
