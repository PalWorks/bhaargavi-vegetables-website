import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { MENU_ITEMS } from '../constants';
import { categorySlug, productSlug } from '../utils/slug';
import { ProductCard } from './Products';
import Seo from './Seo';
import JsonLd from './JsonLd';
import NotFound from './NotFound';

const SITE_URL = 'https://bhaargavifreshcuts.com';

// Unique intro copy per category (avoids thin/duplicate content). Keyed by slug.
const CATEGORY_INTRO: Record<string, string> = {
  'cut-vegetables':
    'Freshly cut vegetables, washed in RO water and processed in an AC room on the day of delivery. From sambar and poriyal cuts to peeled onions and garlic, every pack saves you prep time with zero preservatives.',
  'health-packs':
    'Nutrition-focused packs like sprouts and salad mixes, cleaned and ready to eat. A convenient way to add protein and greens to your day, delivered fresh across Chennai.',
  fresh:
    'Farm-fresh produce, hand-picked and hygienically packed. Delivered next-day to your Chennai doorstep with our cold-chain freshness guarantee.',
  'combo-offers':
    'Value combo packs that bundle our most-loved fresh cuts together. Pre-order to secure yours and save on your weekly vegetable prep.',
};

const CategoryPage: React.FC = () => {
  const { slug = '' } = useParams();

  // Resolve the raw category label from the slug.
  const rawLabel = (() => {
    for (const item of MENU_ITEMS) {
      for (const c of item.categories) {
        if (categorySlug(c) === slug) return c.trim();
      }
    }
    return null;
  })();

  if (!rawLabel) return <NotFound />;

  const items = MENU_ITEMS.filter((i) => i.categories.some((c) => categorySlug(c) === slug));
  const intro =
    CATEGORY_INTRO[slug] ||
    `Fresh ${rawLabel.toLowerCase()} from Bhaargavi Fresh Cuts, delivered across Chennai. RO water washed, AC room processed, no preservatives.`;

  const title = `${rawLabel} - Fresh Cut & Delivered in Chennai | Bhaargavi Fresh Cuts`;
  // Use the intro's first sentence (word-safe) so the meta description never cuts mid-word.
  const firstSentence = intro.split('. ')[0].replace(/\.$/, '');
  const description = `Order ${rawLabel.toLowerCase()} online in Chennai. ${firstSentence}.`;
  const path = `/category/${slug}/`;

  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
      { '@type': 'ListItem', position: 2, name: rawLabel, item: `${SITE_URL}${path}` },
    ],
  };

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: title,
    description,
    url: `${SITE_URL}${path}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.map((it, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        name: it.name,
        item: `${SITE_URL}/products/${productSlug(it.name)}/`,
      })),
    },
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-bv-cream/30">
      <Seo title={title} description={description} path={path} />
      <JsonLd data={breadcrumb} />
      <JsonLd data={itemList} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-sm text-bv-muted mb-4" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-bv-green">
            Home
          </Link>
          <span className="mx-2">/</span>
          <span className="text-bv-dark">{rawLabel}</span>
        </nav>
        <h1 className="font-display text-3xl sm:text-4xl text-bv-dark mb-3">{rawLabel}</h1>
        <p className="text-bv-muted max-w-2xl mb-10 leading-relaxed">{intro}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
