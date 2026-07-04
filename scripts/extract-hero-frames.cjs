#!/usr/bin/env node
/**
 * extract-hero-frames.cjs
 *
 * Regenerates the hero background assets from the master clips in media-src/hero/.
 * Produces:
 *   - public/hero-frames/frame_%03d.jpg  (scroll-scrub image sequence, primary hero)
 *   - public/hero-frames/manifest.json   (frame count + dimensions consumed at runtime)
 *   - public/hero-video.mp4              (autoplay-loop fallback for mobile/low-power)
 *
 * This is a MANUAL, on-demand step — run it only when the hero clip changes.
 * The output is committed to git, so it does NOT run during `npm run build` or in CI.
 * (The build only serves the already-committed frames.)
 *
 * Requirements: ffmpeg + ffprobe on PATH.
 * Usage: node scripts/extract-hero-frames.cjs
 *
 * Tunables (env vars):
 *   FPS=4         frames per second sampled from the source (fps * duration = frame count)
 *   FRAME_WIDTH=1280   width of each JPEG frame
 *   FRAME_Q=7     ffmpeg JPEG quality (2=best/largest .. 31=worst/smallest)
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const HERO_SRC_DIR = path.join(__dirname, '..', 'media-src', 'hero');
const INPUTS = path.join(HERO_SRC_DIR, 'inputs.txt');
const FRAMES_DIR = path.join(__dirname, '..', 'public', 'hero-frames');
const MANIFEST = path.join(FRAMES_DIR, 'manifest.json');
const LOOP_VIDEO = path.join(__dirname, '..', 'public', 'hero-video.mp4');

const FPS = Number(process.env.FPS || 4);
const FRAME_WIDTH = Number(process.env.FRAME_WIDTH || 1280);
const FRAME_Q = Number(process.env.FRAME_Q || 7);

function ff(bin, args) {
  return execFileSync(bin, args, { stdio: ['ignore', 'pipe', 'inherit'] }).toString();
}

function ensureTool(bin) {
  try { execFileSync(bin, ['-version'], { stdio: 'ignore' }); }
  catch { console.error(`[extract-hero-frames] '${bin}' not found on PATH. Install ffmpeg.`); process.exit(1); }
}

function main() {
  ensureTool('ffmpeg');
  ensureTool('ffprobe');
  if (!fs.existsSync(INPUTS)) {
    console.error(`[extract-hero-frames] missing ${INPUTS}. Expected a concat list of master clips.`);
    process.exit(1);
  }

  fs.mkdirSync(FRAMES_DIR, { recursive: true });
  fs.readdirSync(FRAMES_DIR).filter(f => f.endsWith('.jpg')).forEach(f => fs.unlinkSync(path.join(FRAMES_DIR, f)));

  // 1. Image sequence (primary scroll-scrub asset)
  console.log(`[extract-hero-frames] extracting frames @ ${FPS}fps, width ${FRAME_WIDTH}, q ${FRAME_Q} ...`);
  ff('ffmpeg', [
    '-hide_banner', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0', '-i', INPUTS,
    '-vf', `fps=${FPS},scale=${FRAME_WIDTH}:-2`,
    '-q:v', String(FRAME_Q),
    path.join(FRAMES_DIR, 'frame_%03d.jpg'),
  ]);

  const frames = fs.readdirSync(FRAMES_DIR).filter(f => /^frame_\d+\.jpg$/.test(f)).sort();
  if (frames.length === 0) { console.error('[extract-hero-frames] no frames produced.'); process.exit(1); }

  const dims = ff('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0',
    '-show_entries', 'stream=width,height', '-of', 'csv=p=0',
    path.join(FRAMES_DIR, frames[0]),
  ]).trim().split(',').map(Number);

  const manifest = { count: frames.length, width: dims[0], height: dims[1], pattern: 'frame_%03d.jpg', ext: 'jpg' };
  fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log('[extract-hero-frames] manifest:', manifest);

  // 2. Autoplay-loop fallback video (mobile / low-power / reduced canvas capability)
  console.log('[extract-hero-frames] encoding loop fallback video ...');
  ff('ffmpeg', [
    '-hide_banner', '-loglevel', 'error',
    '-f', 'concat', '-safe', '0', '-i', INPUTS,
    '-an', '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
    '-vf', 'scale=960:-2', '-crf', '30', '-preset', 'slow',
    '-movflags', '+faststart', '-y', LOOP_VIDEO,
  ]);
  console.log(`[extract-hero-frames] wrote ${path.relative(process.cwd(), LOOP_VIDEO)}`);
  console.log('[extract-hero-frames] done. Commit public/hero-frames/ and public/hero-video.mp4.');
}

main();
