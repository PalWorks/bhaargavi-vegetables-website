import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('track()', () => {
  beforeEach(() => { vi.resetModules(); vi.unstubAllEnvs(); vi.restoreAllMocks(); });
  afterEach(() => { vi.unstubAllEnvs(); });

  it('is a no-op (no beacon) when VITE_ANALYTICS_URL is unset', async () => {
    vi.stubEnv('VITE_ANALYTICS_URL', '');
    const beacon = vi.fn();
    vi.stubGlobal('navigator', { ...navigator, sendBeacon: beacon });
    const { track } = await import('./analytics');

    track('checkout_click', { total: 199 });
    expect(beacon).not.toHaveBeenCalled();
  });

  it('sends a beacon with the event payload when an endpoint is configured', async () => {
    vi.stubEnv('VITE_ANALYTICS_URL', 'https://telemetry.example/collect');
    const beacon = vi.fn();
    vi.stubGlobal('navigator', { ...navigator, sendBeacon: beacon });
    const { track } = await import('./analytics');

    track('checkout_click', { total: 250, itemCount: 3 });

    expect(beacon).toHaveBeenCalledTimes(1);
    const [url, blob] = beacon.mock.calls[0];
    expect(url).toBe('https://telemetry.example/collect');
    const text = await new Promise<string>((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(String(fr.result));
      fr.readAsText(blob as Blob);
    });
    const parsed = JSON.parse(text);
    expect(parsed).toMatchObject({ event: 'checkout_click', total: 250, itemCount: 3 });
    expect(typeof parsed.ts).toBe('number');
  });

  it('never throws even if the transport fails', async () => {
    vi.stubEnv('VITE_ANALYTICS_URL', 'https://telemetry.example/collect');
    vi.stubGlobal('navigator', { ...navigator, sendBeacon: () => { throw new Error('boom'); } });
    const { track } = await import('./analytics');
    expect(() => track('client_error', { message: 'x' })).not.toThrow();
  });
});
