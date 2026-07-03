/**
 * fetch-instagram.cjs
 *
 * Fetches Instagram post METADATA from the Basic Display API and writes it
 * to instagram.json. Does NOT download any media files — that responsibility
 * belongs to download-instagram-images.cjs which runs at build/dev time.
 *
 * CDN URLs are stored as _imageUrl / _videoUrl fields so the download script
 * can fetch the actual media later. The public-facing 'image' and 'videoSrc'
 * fields point to local paths (/instagram/...) for the frontend to consume.
 */

const fs = require('fs');
const path = require('path');

// --- Configuration ---
const TOKEN = process.env.INSTAGRAM_TOKEN;
const DATA_FILE = path.join(__dirname, '../src/data/instagram.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
}

if (!TOKEN) {
    console.error('Error: INSTAGRAM_TOKEN is not defined.');
    process.exit(1);
}

// --- Main ---

const fetchInstagramData = async () => {
    try {
        // 1. Fetch Media from API
        const url = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${TOKEN}&limit=14`;
        const response = await fetch(url);

        // Detect token-specific errors (expired, invalid, revoked)
        if (!response.ok) {
            const errorBody = await response.json().catch(() => ({}));
            const errType = errorBody?.error?.type || '';
            const errCode = errorBody?.error?.code || 0;
            const errMsg = errorBody?.error?.message || response.statusText;

            if (errType === 'OAuthException' || errCode === 190 || response.status === 401) {
                console.error('');
                console.error('❌ INSTAGRAM TOKEN ERROR — Token is expired or invalid.');
                console.error('━'.repeat(60));
                console.error(`   Error: ${errMsg}`);
                console.error('━'.repeat(60));
                console.error('');
                console.error('🔑 ACTION REQUIRED:');
                console.error('   1. Go to https://developers.facebook.com/apps/');
                console.error('   2. Generate a new long-lived token');
                console.error('   3. Update INSTAGRAM_TOKEN in GitHub → Settings → Secrets');
                console.error('');
            } else {
                console.error(`API Error: ${response.status} ${errMsg}`);
            }
            process.exit(1);
        }

        const data = await response.json();

        if (!data.data) throw new Error('No data found in response');

        const processedPosts = [];

        // 2. Process each post (metadata only — no downloads)
        console.log(`Found ${data.data.length} posts. Processing metadata...`);

        for (const post of data.data) {
            const isVideo = post.media_type === 'VIDEO';
            const imageUrl = isVideo ? (post.thumbnail_url || post.media_url) : post.media_url;
            const videoUrl = isVideo ? post.media_url : null;

            const imageFilename = `${post.id}.jpg`;
            const videoFilename = `${post.id}.mp4`;

            const publicImagePath = `/instagram/${imageFilename}`;
            let publicVideoPath = undefined;
            let cdnVideoUrl = undefined;

            if (isVideo && videoUrl) {
                publicVideoPath = `/instagram/${videoFilename}`;
                cdnVideoUrl = videoUrl;
            }

            processedPosts.push({
                id: post.id,
                image: publicImagePath,
                caption: post.caption || '',
                likes: 0,
                link: post.permalink,
                mediaType: isVideo ? 'video' : 'image',
                videoSrc: publicVideoPath,
                // CDN URLs for the download script (prefixed with _ to indicate internal use)
                _imageUrl: imageUrl,
                _videoUrl: cdnVideoUrl,
            });
        }

        // 3. Write Data File
        fs.writeFileSync(DATA_FILE, JSON.stringify(processedPosts, null, 2));
        console.log(`Successfully updated instagram.json with ${processedPosts.length} posts (metadata only).`);

    } catch (error) {
        console.error('Script failed:', error.message);
        process.exit(1);
    }
};

fetchInstagramData();
