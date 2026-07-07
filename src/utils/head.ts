/**
 * SSR head collection. The <Seo> component records the active route's head data
 * here during render so the prerender (src/entry-server.tsx) can inject the
 * correct <title>/description/canonical/OG per route — renderToString does not
 * run the useEffect that sets these on the client.
 */
export interface HeadData {
  title: string;
  description: string;
  url: string;
}

export const ssrHead: { current: HeadData | null } = { current: null };
