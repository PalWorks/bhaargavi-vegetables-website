import React from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

// Place ID will be configured when client sets up Featurable account
const FEATURABLE_ID = import.meta.env.VITE_FEATURABLE_ID || '';
const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJxxxxxxxx';

const GoogleReviews: React.FC = () => {
  const { t } = useLanguage();

  // If Featurable is configured, embed their widget
  if (FEATURABLE_ID) {
    return (
      <section className="py-16 bg-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <p className="text-bv-green font-semibold text-sm tracking-widest uppercase mb-3">Google Reviews</p>
            <h2 className="font-display text-3xl text-bv-dark">What Our Customers Say</h2>
          </div>
          {/* react-google-reviews dynamically imported when ID is available */}
          <div id="bv-google-reviews" className="max-w-4xl mx-auto" />
          <div className="text-center mt-8">
            <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 bg-bv-green text-white font-semibold px-6 py-3 rounded-full hover:bg-bv-green-light transition-colors">
              <Star size={16} />
              {t.reviews.write_review}
            </a>
          </div>
        </div>
      </section>
    );
  }

  // Placeholder when Featurable is not yet configured
  return (
    <section className="py-16 bg-bv-green-pale/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={28} className="text-bv-orange fill-bv-orange" />
          ))}
        </div>
        <h2 className="font-display text-2xl sm:text-3xl text-bv-dark mb-3">Rated 5.0 on Google</h2>
        <p className="text-bv-muted text-sm mb-8 max-w-lg mx-auto">
          Join hundreds of happy Chennai families. Read our reviews and share your experience.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-white text-bv-dark font-semibold px-6 py-3 rounded-full border border-bv-border hover:border-bv-green transition-colors shadow-sm">
            <ExternalLink size={16} />
            {t.reviews.google_cta}
          </a>
          <a href={GOOGLE_REVIEW_URL} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-bv-green text-white font-semibold px-6 py-3 rounded-full hover:bg-bv-green-light transition-colors">
            <Star size={16} />
            {t.reviews.write_review}
          </a>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
