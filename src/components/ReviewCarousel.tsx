import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { REVIEWS } from '../constants';

const ReviewCarousel: React.FC = () => {
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="reviews" className="py-20 bg-bv-dark/60 relative overflow-hidden">
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
        <div className="relative">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`.hide-scroll::-webkit-scrollbar { display: none; }`}</style>
            <div className="hide-scroll flex gap-4 w-full">
              {REVIEWS.map((review, i) => (
                <div key={i} className="snap-center shrink-0 w-[85vw] sm:w-[400px] bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border border-white/20 min-h-[220px] flex flex-col justify-between">
                  <div className="flex justify-center mb-4">
                    {Array.from({ length: review.rating }).map((_, starIdx) => (
                      <Star key={starIdx} size={20} className="text-bv-orange fill-bv-orange" />
                    ))}
                  </div>
                  <blockquote className="text-white text-lg leading-relaxed flex-1 mb-6 italic whitespace-normal">
                    &ldquo;{review.text}&rdquo;
                  </blockquote>
                  <div>
                    <p className="text-bv-green-light font-bold text-base">{review.customerName}</p>
                    <p className="text-white/50 text-xs mt-0.5">Chennai</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button aria-label="Previous review" onClick={() => scroll('left')} className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              <ChevronLeft size={18} />
            </button>
            <button aria-label="Next review" onClick={() => scroll('right')} className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewCarousel;