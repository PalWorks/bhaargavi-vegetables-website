import React from 'react';
import { Star, ExternalLink, MessageCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { WA_NUMBER } from '../constants';

// Google Business Profile Place ID — set VITE_GOOGLE_PLACE_ID once the profile is live.
// While unset, the section stays fully functional (WhatsApp CTA) with no broken Google links.
const PLACE_ID = (import.meta.env.VITE_GOOGLE_PLACE_ID || '').trim();
const hasGoogle = PLACE_ID.length > 0;
const writeReviewUrl = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;
const readReviewsUrl = `https://search.google.com/local/reviews?placeid=${PLACE_ID}`;

const GoogleReviews: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-bv-green-pale/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} size={28} className="text-bv-orange fill-bv-orange" />
          ))}
        </div>
        <h2 className="font-display text-2xl sm:text-3xl text-bv-dark mb-3">Rated 5.0 by Chennai Families</h2>
        <p className="text-bv-muted text-sm mb-8 max-w-lg mx-auto">
          Join hundreds of happy households who trust Bhaargavi for fresh, hygienic, ready-to-cook produce.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-2 bg-bv-green text-white font-semibold px-6 py-3 rounded-full hover:bg-bv-green-light transition-colors">
            <MessageCircle size={16} />
            {t.nav.order}
          </a>

          {hasGoogle && (
            <>
              <a href={readReviewsUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white text-bv-dark font-semibold px-6 py-3 rounded-full border border-bv-border hover:border-bv-green transition-colors shadow-sm">
                <ExternalLink size={16} />
                {t.reviews.google_cta}
              </a>
              <a href={writeReviewUrl} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white text-bv-dark font-semibold px-6 py-3 rounded-full border border-bv-border hover:border-bv-green transition-colors shadow-sm">
                <Star size={16} className="text-bv-orange" />
                {t.reviews.write_review}
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
