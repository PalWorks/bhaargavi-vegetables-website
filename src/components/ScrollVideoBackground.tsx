import React, { useEffect, useRef, useState } from 'react';

/**
 * Hero background.
 *
 * Progressive enhancement, decided once per session by device capability:
 *   - 'canvas' : scroll-scrubbed image sequence (primary, capable large screens). No <video>
 *                seeking, so it is smooth and reliable — frames are pre-decoded images drawn
 *                to a canvas. Gated to wide/non-low-memory devices: the ~5.2MB sequence wrecks
 *                mobile LCP if loaded on phones.
 *   - 'video'  : autoplay muted loop with cheap GPU parallax (phones / low power).
 *   - 'poster' : static image (reduced-motion, save-data, or slow connections).
 *
 * A static poster is always painted underneath as the instant first frame; canvas/video
 * fade in on top once ready.
 */

type Mode = 'canvas' | 'video' | 'poster';

const POSTER = '/hero-poster.jpg';
const LOOP_VIDEO = '/hero-video.mp4';
const MANIFEST_URL = '/hero-frames/manifest.json';

interface Manifest {
  count: number;
  width: number;
  height: number;
}

// Runs once, client-side. Never throws — worst case returns 'poster'.
function chooseMode(): Mode {
  if (typeof window === 'undefined' || !window.matchMedia) return 'poster';
  const mq = (q: string) => window.matchMedia(q).matches;

  if (mq('(prefers-reduced-motion: reduce)')) return 'poster';

  const conn = (navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (conn?.saveData === true) return 'poster';
  if (conn?.effectiveType && ['slow-2g', '2g', '3g'].includes(conn.effectiveType)) return 'poster';

  const deviceMemory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
  const lowMemory = typeof deviceMemory === 'number' && deviceMemory <= 4;
  const wideScreen = mq('(min-width: 1024px)');

  // Frame-scrub only on capable large screens. Phones get the lightweight autoplay loop:
  // the 96-frame / ~5.2MB sequence eagerly loaded on mobile starves the critical render
  // path and the full-viewport canvas fades in late as the LCP element (measured mobile
  // LCP jumped ~3s -> ~8s). Keep the scrub where bandwidth/CPU can afford it.
  if (wideScreen && !lowMemory) return 'canvas';
  return 'video';
}

const frameUrl = (i: number) => `/hero-frames/frame_${String(i).padStart(3, '0')}.jpg`;

const ScrollVideoBackground: React.FC = () => {
  const [mode, setMode] = useState<Mode>('poster');
  const [overlayReady, setOverlayReady] = useState(false); // canvas or video faded in
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Decide mode after mount (needs window / navigator). The prerender renders the
  // initial 'poster' state (renderToString runs no effects), which matches this
  // component's first client render — so hydration is clean and the client then
  // enhances to canvas/video here.
  useEffect(() => {
    setMode(chooseMode());
  }, []);

  // ---- CANVAS MODE: scroll-scrubbed image sequence ----
  useEffect(() => {
    if (mode !== 'canvas') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) { setMode('video'); return; }

    let cancelled = false;
    let rafId = 0;
    let images: HTMLImageElement[] = [];
    const loaded: boolean[] = [];
    let count = 0;
    let firstDrawn = false;
    let targetProgress = 0;
    let currentProgress = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const sizeCanvas = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
    };

    const nearestLoaded = (idx: number): number => {
      if (loaded[idx]) return idx;
      for (let d = 1; d < count; d++) {
        if (idx - d >= 0 && loaded[idx - d]) return idx - d;
        if (idx + d < count && loaded[idx + d]) return idx + d;
      }
      return -1;
    };

    const drawCover = (img: HTMLImageElement) => {
      const cw = canvas.width, ch = canvas.height;
      const ir = img.width / img.height, cr = cw / ch;
      let dw: number, dh: number;
      if (cr > ir) { dw = cw; dh = cw / ir; } else { dh = ch; dw = ch * ir; }
      ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    };

    let lastIdx = -1;
    const drawIndex = (idx: number) => {
      const use = nearestLoaded(idx);
      if (use === -1) return;
      drawCover(images[use]);
      if (!firstDrawn) { firstDrawn = true; setOverlayReady(true); }
    };

    const readScroll = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      targetProgress = maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;
    };

    const loop = () => {
      if (cancelled) return;
      if (!document.hidden && count > 0) {
        currentProgress += (targetProgress - currentProgress) * 0.12; // ease toward target
        const idx = Math.round(currentProgress * (count - 1));
        if (idx !== lastIdx) { lastIdx = idx; drawIndex(idx); }
      }
      rafId = requestAnimationFrame(loop);
    };

    const onResize = () => { sizeCanvas(); lastIdx = -1; drawIndex(Math.round(currentProgress * (count - 1))); };

    fetch(MANIFEST_URL)
      .then(r => r.json())
      .then((m: Manifest) => {
        if (cancelled) return;
        count = m.count;
        loaded.length = count;
        images = new Array(count);
        sizeCanvas();
        for (let i = 0; i < count; i++) {
          const img = new Image();
          const frameNo = i + 1;
          img.onload = () => {
            loaded[i] = true;
            if (!firstDrawn && i === 0) drawIndex(0);
          };
          img.onerror = () => { loaded[i] = false; };
          img.src = frameUrl(frameNo);
          images[i] = img;
        }
        readScroll();
        window.addEventListener('scroll', readScroll, { passive: true });
        window.addEventListener('resize', onResize);
        rafId = requestAnimationFrame(loop);
        // Safety: if nothing painted within 6s, fall back to the loop video.
        window.setTimeout(() => { if (!cancelled && !firstDrawn) setMode('video'); }, 6000);
      })
      .catch(() => { if (!cancelled) setMode('video'); });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('scroll', readScroll);
      window.removeEventListener('resize', onResize);
      images.forEach(img => { img.onload = null; img.onerror = null; });
      images = [];
    };
  }, [mode]);

  // ---- VIDEO MODE: autoplay loop + cheap parallax ----
  useEffect(() => {
    if (mode !== 'video') return;
    const video = videoRef.current;
    if (!video) return;

    let rafId = 0;
    let scrollY = window.scrollY;
    let ticking = false;

    const apply = () => {
      // GPU-composited transform only (never triggers layout). scale(1.12) gives ~6vh of
      // overscan on each edge; clamp the parallax shift to 5vh so an edge is never revealed.
      const maxShift = window.innerHeight * 0.05;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const p = maxScroll > 0 ? Math.min(1, Math.max(0, scrollY / maxScroll)) : 0;
      const offset = (p - 0.5) * 2 * maxShift; // -maxShift .. +maxShift
      video.style.transform = `translate3d(0, ${offset}px, 0) scale(1.12)`;
      ticking = false;
    };
    const onScroll = () => {
      scrollY = window.scrollY;
      if (!ticking) { ticking = true; rafId = requestAnimationFrame(apply); }
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
    };
  }, [mode]);

  return (
    <div
      className="fixed inset-0 w-full h-full -z-50 overflow-hidden bg-cover bg-center"
      style={{ backgroundImage: `url('${POSTER}')` }}
      aria-hidden="true"
    >
      {mode === 'canvas' && (
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${overlayReady ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {mode === 'video' && (
        <video
          ref={videoRef}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          poster={POSTER}
          disablePictureInPicture
          onPlaying={() => setOverlayReady(true)}
          onError={() => setMode('poster')}
          className={`absolute inset-0 w-full h-full object-cover pointer-events-none will-change-transform transition-opacity duration-700 ${overlayReady ? 'opacity-100' : 'opacity-0'}`}
        >
          <source src={LOOP_VIDEO} type="video/mp4" />
        </video>
      )}
      {/* mode === 'poster' renders just the background image above */}
    </div>
  );
};

export default ScrollVideoBackground;
