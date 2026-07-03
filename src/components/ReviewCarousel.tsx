import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { REVIEWS } from '../constants';

const ReviewCarousel: React.FC = () => {
  const { t } = useLanguage();
  const [active, setActive] = useState(0);

  const prev = () => setActive(i => (i - 1 + REVIEWS.length) % REVIEWS.length);
  const next = () => setActive(i => (i + 1) % REVIEWS.length);

  return (
    <section id="reviews" className="py-20 bg-bv-green overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-bv-green-light font-semibold text-sm tracking-widest uppercase mb-3">{t.reviews.tag}</p>
          <h2 className="font-display text-3xl sm:text-4xl text-white">
            {t.reviews.title_start}{' '}
            <span className="text-bv-green-light italic">Chennai</span>{' '}
            {t.reviews.title_end}
          </h2>
          <p className="text-white/70 mt-3 max-w-xl mx-auto text-sm">{t.reviews.desc}</p>
        </div>

        {/* Carousel */}
        <div className="relative max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20 min-h-[220px] flex flex-col justify-between">
            <div className="flex justify-center mb-4">
              {Array.from({ length: REVIEWS[active].rating }).map((_, i) => (
                <Star key={i} size={20} className="text-bv-orange fill-bv-orange" />
              ))}
            </div>
            <blockquote className="text-white text-lg leading-relaxed flex-1 mb-6 italic">
              &ldquo;{REVIEWS[active].text}&rdquo;
            </blockquote>
            <div>
              <p className="text-bv-green-light font-bold text-base">{REVIEWS[active].customerName}</p>
              <p className="text-white/50 text-xs mt-0.5">Chennai</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button onClick={prev} className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-1.5">
              {REVIEWS.map((_, i) => (
                <button key={i} onClick={() => setActive(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'w-6 bg-white' : 'w-2 bg-white/40'}`} />
              ))}
            </div>
            <button onClick={next} className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewCarousel;