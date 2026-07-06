import { useEffect } from 'react';

const SITE_URL = 'https://bhaargavifreshcuts.com';

interface SeoProps {
  /** Page <title>. */
  title: string;
  /** Meta description. */
  description: string;
  /** Route path beginning with "/" — used for canonical and og:url. */
  path: string;
}

/**
 * Manages per-route document head (title, description, canonical, og/twitter)
 * via direct DOM updates. Runs in a real browser at runtime, so the build-time
 * Puppeteer pre-render captures the correct head for every route. Kept
 * dependency-free deliberately (react-helmet-async does not support React 19).
 */
function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

const Seo: React.FC<SeoProps> = ({ title, description, path }) => {
  useEffect(() => {
    const url = `${SITE_URL}${path}`;

    document.title = title;
    setMeta('meta[name="description"]', 'name', 'description', description);

    // Canonical
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // Open Graph + Twitter (keep social previews correct on sub-routes)
    setMeta('meta[property="og:title"]', 'property', 'og:title', title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', url);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    setMeta('meta[name="twitter:url"]', 'name', 'twitter:url', url);
  }, [title, description, path]);

  return null;
};

export default Seo;
