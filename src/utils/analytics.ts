/**
 * Minimal, privacy-friendly, dependency-free analytics/telemetry.
 *
 * By design this is a NO-OP unless `VITE_ANALYTICS_URL` is configured, so nothing is sent
 * (and no third-party script or cookie is loaded) until a real endpoint exists. When set,
 * events are delivered with `navigator.sendBeacon` (falls back to a keepalive fetch), which
 * never blocks the UI. Swap the endpoint for GA4/Plausible/a Worker later without touching
 * call sites.
 *
 * NOTE: if you set VITE_ANALYTICS_URL to a cross-origin host, add it to the CSP `connect-src`
 * in index.html.
 */

const ENDPOINT = (import.meta.env.VITE_ANALYTICS_URL || '').trim();

export type AnalyticsEvent =
  | 'checkout_click'
  | 'client_error';

export function track(event: AnalyticsEvent, data: Record<string, unknown> = {}): void {
  // Always give developers a console signal in dev, even without an endpoint.
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug(`[analytics] ${event}`, data);
  }
  if (!ENDPOINT) return;

  try {
    const payload = JSON.stringify({ event, ts: Date.now(), url: location.pathname, ...data });
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
    } else if (typeof fetch === 'function') {
      void fetch(ENDPOINT, { method: 'POST', body: payload, headers: { 'Content-Type': 'application/json' }, keepalive: true, mode: 'no-cors' });
    }
  } catch {
    // telemetry must never break the app
  }
}
