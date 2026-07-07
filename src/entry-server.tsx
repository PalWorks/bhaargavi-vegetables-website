import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { AppShell, AppRoutes } from './App';
import { ssrHead, HeadData } from './utils/head';

/**
 * Build-time render used by scripts/prerender.cjs. renderToString emits proper
 * React hydration markers and only runs the initial render (no effects), so the
 * output is the exact state the browser hydrates against (language 'en', empty
 * cart, hero in 'poster' mode) — clean hydration, no #418.
 *
 * Returns the route's head data too (collected from <Seo> during render), since
 * the useEffect that sets title/meta on the client does not run here.
 */
export function render(url: string): { html: string; head: HeadData | null } {
  ssrHead.current = null;
  const html = renderToString(
    <StrictMode>
      <AppShell>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </AppShell>
    </StrictMode>
  );
  return { html, head: ssrHead.current };
}
