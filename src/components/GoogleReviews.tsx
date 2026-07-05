import React from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { WA_NUMBER } from '../constants';

// WhatsApp brand glyph (lucide dropped brand icons). Uses currentColor so it
// inherits the button's white text.
const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

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
            <WhatsAppIcon size={18} />
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
