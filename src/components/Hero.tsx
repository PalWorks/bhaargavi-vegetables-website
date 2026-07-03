import React from 'react';
import { ShieldCheck, Droplets, Thermometer, Wind } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

const Hero: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background Overlay Removed to maintain video brightness */}

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24">
        <div className="max-w-2xl lg:max-w-4xl">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 bg-bv-green/20 backdrop-blur-sm border border-bv-green/30 text-bv-dark text-sm lg:text-base font-bold rounded-full px-4 py-1.5 lg:px-5 lg:py-2 mb-6 lg:mb-8">
            <span className="w-2 h-2 lg:w-2.5 lg:h-2.5 bg-bv-green rounded-full animate-pulse" />
            {t.hero.tag}
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-[80px] text-bv-dark font-black leading-tight lg:leading-[1.1] mb-6 lg:mb-8">
            {t.hero.title_start}{' '}
            <span className="text-bv-green">{t.hero.title_highlight}</span>
            {t.hero.title_end && <><br />{t.hero.title_end}</>}
          </h1>

          {/* Description */}
          <p className="text-bv-dark font-semibold text-lg lg:text-2xl leading-relaxed mb-10 lg:mb-14 max-w-lg lg:max-w-2xl">
            {t.hero.desc}
          </p>

          {/* Social proof */}
          <p className="text-bv-dark text-sm lg:text-base font-bold">
            ★★★★★ {t.hero.proof}
          </p>
        </div>
      </div>

      {/* Trust badges strip */}
      <div className="relative z-10 pb-8 lg:pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:justify-center lg:gap-6">
            <div className="flex flex-col items-center justify-center p-3 lg:p-5 lg:px-8 bg-white/80 backdrop-blur-sm border border-bv-green/20 rounded-xl text-center shadow-sm">
              <ShieldCheck className="text-bv-green mb-1 lg:mb-2 w-6 h-6 lg:w-8 lg:h-8" />
              <span className="text-bv-dark font-bold text-xs sm:text-sm lg:text-base">{t.hero.badge_fssai}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 lg:p-5 lg:px-8 bg-white/80 backdrop-blur-sm border border-bv-green/20 rounded-xl text-center shadow-sm">
              <Droplets className="text-bv-green mb-1 lg:mb-2 w-6 h-6 lg:w-8 lg:h-8" />
              <span className="text-bv-dark font-bold text-xs sm:text-sm lg:text-base">{t.hero.badge_ro}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 lg:p-5 lg:px-8 bg-white/80 backdrop-blur-sm border border-bv-green/20 rounded-xl text-center shadow-sm">
              <Thermometer className="text-bv-green mb-1 lg:mb-2 w-6 h-6 lg:w-8 lg:h-8" />
              <span className="text-bv-dark font-bold text-xs sm:text-sm lg:text-base">{t.hero.badge_cold}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 lg:p-5 lg:px-8 bg-white/80 backdrop-blur-sm border border-bv-green/20 rounded-xl text-center shadow-sm">
              <Wind className="text-bv-green mb-1 lg:mb-2 w-6 h-6 lg:w-8 lg:h-8" />
              <span className="text-bv-dark font-bold text-xs sm:text-sm lg:text-base">{t.hero.badge_ac}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;