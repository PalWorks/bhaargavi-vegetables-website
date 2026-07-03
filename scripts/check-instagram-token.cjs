/**
 * check-instagram-token.cjs
 *
 * Proactive health-check for the Instagram User Token.
 * Designed to run as a step in the GitHub Actions workflow BEFORE the fetch,
 * so the maintainer gets a warning email well ahead of expiry.
 *
 * Strategy:
 *  1. Call the Instagram token refresh endpoint — this is idempotent and also
 *     returns `expires_in` (seconds until expiry).
 *  2. If expires_in < 7 days → print a WARNING and exit 1 (fails the job,
 *     triggering GitHub's built-in failure notification email).
 *  3. If the token is already expired / invalid → exit 1 with clear message.
 *  4. If healthy → print summary and exit 0.
 *
 * Note: Calling the refresh endpoint extends the token's life, which is a
 * desirable side-effect — it means the 60-day clock resets on every daily run.
 */

const https = require('https');

const TOKEN = process.env.INSTAGRAM_TOKEN;
const WARN_THRESHOLD_DAYS = 7;
const WARN_THRESHOLD_SECS = WARN_THRESHOLD_DAYS * 24 * 60 * 60;

if (!TOKEN) {
    console.log('ℹ️  INSTAGRAM_TOKEN not set — skipping token health check.');
    process.exit(0);
}

/**
 * Makes an HTTPS GET request and returns parsed JSON.
 */
function httpsGetJson(url) {
    return new Promise((resolve, reject) => {
        const req = https.get(url, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => {
                try {
                    resolve({ statusCode: res.statusCode, data: JSON.parse(body) });
                } catch (e) {
                    reject(new Error(`Failed to parse response: ${body}`));
                }
            });
            res.on('error', reject);
        });
        req.on('error', reject);
        req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error('Request timed out after 15s'));
        });
    });
}

async function checkToken() {
    console.log('🔍 Checking Instagram token health...\n');

    try {
        // Call the refresh endpoint — it returns the new token + expires_in
        const refreshUrl =
            `https://graph.instagram.com/refresh_access_token` +
            `?grant_type=ig_refresh_token&access_token=${TOKEN}`;

        const { statusCode, data } = await httpsGetJson(refreshUrl);

        // --- Handle API errors ---
        if (statusCode !== 200 || data.error) {
            const errMsg = data.error?.message || `HTTP ${statusCode}`;
            const errType = data.error?.type || 'Unknown';
            const errCode = data.error?.code || 'N/A';

            console.error('❌ TOKEN ERROR');
            console.error('━'.repeat(50));
            console.error(`   Type:    ${errType}`);
            console.error(`   Code:    ${errCode}`);
            console.error(`   Message: ${errMsg}`);
            console.error('━'.repeat(50));
            console.error('');
            console.error('🔑 ACTION REQUIRED:');
            console.error('   1. Go to https://developers.facebook.com/apps/');
            console.error('   2. Select your app → Instagram Basic Display → User Token Generator');
            console.error('   3. Generate a new long-lived token');
            console.error('   4. Update the INSTAGRAM_TOKEN secret in GitHub → Settings → Secrets');
            console.error('');
            process.exit(1);
        }

        // --- Token is valid — check remaining lifetime ---
        const expiresIn = data.expires_in; // seconds
        const expiresInDays = Math.floor(expiresIn / 86400);
        const expiresInHours = Math.floor((expiresIn % 86400) / 3600);
        const expiryDate = new Date(Date.now() + expiresIn * 1000).toISOString().split('T')[0];

        // NOTE: In normal operation, the refresh call above resets expires_in
        // to ~60 days, so this threshold rarely fires. It exists as a safety
        // net for unusual scenarios (e.g., workflow was disabled for 53+ days
        // then re-enabled, or the API changes refresh behavior).
        // The script's primary value is: (1) auto-refreshing the token daily,
        // and (2) detecting already-invalid tokens via the error path above.
        if (expiresIn < WARN_THRESHOLD_SECS) {
            console.warn('⚠️  TOKEN EXPIRING SOON');
            console.warn('━'.repeat(50));
            console.warn(`   Expires in: ${expiresInDays} days, ${expiresInHours} hours`);
            console.warn(`   Expiry date: ${expiryDate}`);
            console.warn('━'.repeat(50));
            console.warn('');
            console.warn('🔑 ACTION REQUIRED:');
            console.warn('   Refresh or regenerate the token before it expires.');
            console.warn('   See: https://developers.facebook.com/apps/');
            console.warn('');
            process.exit(1); // Fail the job → triggers GitHub notification email
        }

        // --- Healthy ---
        console.log('✅ Token is healthy');
        console.log(`   Expires in: ${expiresInDays} days, ${expiresInHours} hours (${expiryDate})`);
        console.log(`   Token was auto-refreshed by this check.`);
        process.exit(0);

    } catch (error) {
        console.error(`❌ Token check failed: ${error.message}`);
        process.exit(1);
    }
}

checkToken();
