import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck, Droplets, Thermometer, Wind } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { HERO_IMAGES } from '../constants';

const TrustBadge: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-bv-dark rounded-full px-3 py-1.5 shadow-sm text-xs font-semibold whitespace-nowrap">
    <span className="text-bv-green">{icon}</span>
    {label}
  </div>
);

const Hero: React.FC = () => {
  const { t } = useLanguage();
  const [current, setCurrent] = useState(0);
  const images = HERO_IMAGES;

  useEffect(() => {
    const timer = setInterval(() => setCurrent(i => (i + 1) % images.length), 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length);
  const next = () => setCurrent(i => (i + 1) % images.length);

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background images */}
      {images.map((img, idx) => (
        <div key={img.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${idx === current ? 'opacity-100' : 'opacity-0'}`}>
          <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-bv-dark/70 via-bv-dark/40 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-2xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-bv-green/20 backdrop-blur-sm border border-bv-green/30 text-white text-sm font-medium rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-bv-green-light rounded-full animate-pulse" />
            {t.hero.tag}
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6">
            {t.hero.title_start}{' '}
            <span className="text-bv-green-light">{t.hero.title_highlight}</span>
            {t.hero.title_end && <><br />{t.hero.title_end}</>}
          </h1>

          {/* Description */}
          <p className="text-white/90 text-lg leading-relaxed mb-8 max-w-lg">
            {t.hero.desc}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-10">
            <a href="#products"
              className="bg-bv-green hover:bg-bv-green-light text-white font-bold px-8 py-3.5 rounded-full transition-all hover:scale-105 shadow-lg shadow-bv-green/30">
              {t.hero.cta_shop}
            </a>
            <a href="/about"
              className="bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/40 text-white font-semibold px-8 py-3.5 rounded-full transition-all">
              {t.hero.cta_about}
            </a>
          </div>

          {/* Social proof */}
          <p className="text-white/70 text-sm font-medium">
            ★★★★★ {t.hero.proof}
          </p>
        </div>
      </div>

      {/* Trust badges strip */}
      <div className="relative z-10 pb-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-3">
            <TrustBadge icon={<ShieldCheck size={14} />} label={t.hero.badge_fssai} />
            <TrustBadge icon={<Droplets size={14} />} label={t.hero.badge_ro} />
            <TrustBadge icon={<Thermometer size={14} />} label={t.hero.badge_cold} />
            <TrustBadge icon={<Wind size={14} />} label={t.hero.badge_ac} />
          </div>
        </div>
      </div>

      {/* Arrow controls */}
      {images.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2 transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white rounded-full p-2 transition-all">
            <ChevronRight size={20} />
          </button>

          {/* Dot indicators */}
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </section>
  );
};

export default Hero;