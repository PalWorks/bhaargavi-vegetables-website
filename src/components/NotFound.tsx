import React from 'react';
import { Link } from 'react-router-dom';
import { MENU_ITEMS } from '../constants';
import { categorySlug } from '../utils/slug';
import Seo from './Seo';

/** Client-side 404 for unknown routes. The static public/404.html handles
 *  direct hits at the edge; this covers in-app navigation. */
const NotFound: React.FC = () => {
  const seen = new Map<string, string>();
  MENU_ITEMS.forEach((i) =>
    i.categories.forEach((c) => {
      const key = c.trim().toLowerCase();
      if (key && !seen.has(key)) seen.set(key, c.trim());
    })
  );

  return (
    <div className="pt-28 pb-20 min-h-screen bg-bv-cream text-center px-4">
      <Seo
        title="Page Not Found | Bhaargavi Fresh Cuts"
        description="The page you are looking for could not be found. Browse our fresh cut vegetables and fruits."
        path="/404/"
      />
      <h1 className="font-display text-4xl text-bv-dark mb-3">Page not found</h1>
      <p className="text-bv-muted mb-8 max-w-md mx-auto">
        The page you were looking for isn&rsquo;t here. Let&rsquo;s get you back to fresh vegetables.
      </p>
      <Link
        to="/"
        className="inline-block bg-bv-green text-white font-semibold px-6 py-3 rounded-xl hover:bg-bv-green-light transition-colors"
      >
        Back to Home
      </Link>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {Array.from(seen.values()).map((raw) => (
          <Link
            key={raw}
            to={`/category/${categorySlug(raw)}/`}
            className="text-sm text-bv-green font-semibold hover:underline"
          >
            {raw}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NotFound;
