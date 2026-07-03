/**
 * download-instagram-images.cjs
 *
 * Downloads Instagram media files (images + videos) referenced in instagram.json.
 * Runs as a pre-build/pre-dev step so media is available locally but never committed to git.
 *
 * Features:
 *   - Idempotent: skips files that already exist with non-zero size
 *   - Prints a summary report: ✅ downloaded / ⚠️ skipped / ❌ failed
 *   - Exits 0 even on partial failures (warn-but-don't-fail)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// --- Configuration ---
const DATA_FILE = path.join(__dirname, '../src/data/instagram.json');
const IMAGE_DIR = path.join(__dirname, '../public/instagram');

// --- Helpers ---

/**
 * Downloads a file from a URL to a local path. Follows redirects (up to 5).
 */
const DOWNLOAD_TIMEOUT_MS = 30000; // 30 seconds
const CONCURRENCY = 5;

const downloadFile = (url, filepath, redirectCount = 0) => {
    return new Promise((resolve, reject) => {
        if (redirectCount > 5) {
            return reject(new Error('Too many redirects'));
        }

        const protocol = url.startsWith('https') ? https : http;
        const req = protocol.get(url, (res) => {
            // Handle redirects
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume();
                return downloadFile(res.headers.location, filepath, redirectCount + 1)
                    .then(resolve)
                    .catch(reject);
            }

            if (res.statusCode === 200) {
                const cleanup = (err) => {
                    try { fs.unlinkSync(filepath); } catch (_) { }
                    reject(err);
                };
                const stream = fs.createWriteStream(filepath);
                res.on('error', cleanup);
                stream.on('error', cleanup);
                res.pipe(stream).on('close', resolve);
            } else {
                res.resume();
                reject(new Error(`HTTP ${res.statusCode}`));
            }
        });
        req.setTimeout(DOWNLOAD_TIMEOUT_MS, () => {
            req.destroy();
            reject(new Error('Request timeout (30s)'));
        });
        req.on('error', reject);
    });
};

/**
 * Checks if a file exists and has non-zero size.
 */
const fileExistsAndValid = (filepath) => {
    try {
        const stat = fs.statSync(filepath);
        return stat.size > 0;
    } catch {
        return false;
    }
};

// --- Main ---

const downloadAllMedia = async () => {
    // Ensure output directory exists
    if (!fs.existsSync(IMAGE_DIR)) {
        fs.mkdirSync(IMAGE_DIR, { recursive: true });
    }

    // Read instagram.json
    if (!fs.existsSync(DATA_FILE)) {
        console.log('ℹ️  No instagram.json found. Skipping media download.');
        return;
    }

    let posts;
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        posts = JSON.parse(raw);
    } catch (err) {
        console.error('❌ Failed to parse instagram.json:', err.message);
        return;
    }

    if (!Array.isArray(posts) || posts.length === 0) {
        console.log('ℹ️  instagram.json is empty. Nothing to download.');
        return;
    }

    // Build a list of files to download
    const downloadTasks = [];
    for (const post of posts) {
        if (post.image) {
            const filename = path.basename(post.image);
            downloadTasks.push({
                url: post._imageUrl,   // Original CDN URL (set by fetch-instagram.cjs)
                localPath: path.join(IMAGE_DIR, filename),
                label: filename,
                postId: post.id,
                type: 'image',
            });
        }
        if (post.videoSrc) {
            const filename = path.basename(post.videoSrc);
            downloadTasks.push({
                url: post._videoUrl,   // Original CDN URL (set by fetch-instagram.cjs)
                localPath: path.join(IMAGE_DIR, filename),
                label: filename,
                postId: post.id,
                type: 'video',
            });
        }
    }

    // Counters for summary report
    let downloaded = 0;
    let skipped = 0;
    let failed = 0;
    const failures = [];

    console.log(`\n📸 Instagram Media Downloader`);
    console.log(`   Found ${downloadTasks.length} media file(s) to process.\n`);

    const processTask = async (task) => {
        // Skip if file already exists with valid size
        if (fileExistsAndValid(task.localPath)) {
            skipped++;
            return;
        }

        // If no CDN URL is available, report with helpful guidance
        if (!task.url) {
            failed++;
            failures.push({ label: task.label, reason: 'No CDN URL in instagram.json. Run "npm run fetch:instagram" to refresh metadata.' });
            return;
        }

        try {
            await downloadFile(task.url, task.localPath);
            downloaded++;
            console.log(`   ✅ ${task.label}`);
        } catch (err) {
            failed++;
            failures.push({ label: task.label, reason: err.message });
            console.log(`   ❌ ${task.label} — ${err.message}`);
        }
    };

    // Process downloads in batches for concurrency
    for (let i = 0; i < downloadTasks.length; i += CONCURRENCY) {
        const batch = downloadTasks.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(processTask));
    }

    // --- Summary Report ---
    console.log('\n' + '─'.repeat(45));
    console.log('📊 Download Summary');
    console.log('─'.repeat(45));
    if (downloaded > 0) console.log(`   ✅ Downloaded:  ${downloaded}`);
    if (skipped > 0) console.log(`   ⚠️  Skipped:     ${skipped} (already exist)`);
    if (failed > 0) console.log(`   ❌ Failed:      ${failed}`);
    console.log(`   📁 Total:       ${downloadTasks.length}`);
    console.log('─'.repeat(45));

    if (failures.length > 0) {
        console.log('\n⚠️  Failed downloads:');
        for (const f of failures) {
            console.log(`   • ${f.label}: ${f.reason}`);
        }
        console.log('');
    }

    if (downloaded + skipped === downloadTasks.length) {
        console.log('✨ All media files are ready.\n');
    } else {
        console.log('⚠️  Some media files could not be downloaded. The site will still build but some images may be missing.\n');
    }
};

downloadAllMedia();
