import React from 'react';
import { ShieldCheck, Droplets, Thermometer, Wind } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const TrustBadge: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm text-bv-dark rounded-full px-3 py-1.5 shadow-sm text-xs font-semibold whitespace-nowrap">
    <span className="text-bv-green">{icon}</span>
    {label}
  </div>
);

const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/hero-poster.jpg"
          className="w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-br from-bv-dark/70 via-bv-dark/40 to-transparent" />
      </div>

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
    </section>
  );
};

export default Hero;