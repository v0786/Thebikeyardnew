import { useEffect, type FC } from 'react';

const SITE_NAME = 'The Bike Yard';
const SITE_URL = 'https://the-bike-yard.vercel.app';
const DEFAULT_IMAGE = `${SITE_URL}/assets/images/hero_motorcycle_showroom_1793817699343.jpg`;

interface SeoProps {
  title: string;
  description: string;
  /** Canonical path, e.g. "/bike/bike-re-hunter-350" */
  path: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  /** JSON-LD structured data object(s) */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noIndex?: boolean;
}

function upsertMeta(selector: string, attrs: Record<string, string>) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    const [key, value] = Object.entries(attrs).find(([k]) => k === 'name' || k === 'property') ?? ['name', ''];
    el.setAttribute(key, value);
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) {
    if (k !== 'name' && k !== 'property') el.setAttribute(k, v);
  }
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.rel = 'canonical';
    document.head.appendChild(el);
  }
  el.href = href;
}

/**
 * Lightweight per-route SEO manager for the SPA:
 * sets title, description, canonical, Open Graph/Twitter tags and JSON-LD.
 */
export const Seo: FC<SeoProps> = ({ title, description, path, image, type = 'website', jsonLd, noIndex }) => {
  useEffect(() => {
    const canonical = `${SITE_URL}${path}`;
    const ogImage = image ?? DEFAULT_IMAGE;

    document.title = title;

    upsertMeta('meta[name="description"]', { name: 'description', content: description });
    upsertMeta('meta[name="robots"]', {
      name: 'robots',
      content: noIndex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large',
    });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: ogImage });
    upsertMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'en_IN' });
    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: ogImage });
    upsertCanonical(canonical);

    // JSON-LD structured data
    const scriptId = 'seo-jsonld';
    document.getElementById(scriptId)?.remove();
    if (jsonLd) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = scriptId;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, description, path, image, type, jsonLd, noIndex]);

  return null;
};
