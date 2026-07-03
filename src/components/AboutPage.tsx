import React from 'react';
import { ShieldCheck, Droplets, Thermometer, Wind, Leaf, Package, Phone, MapPin, ExternalLink, CheckCircle } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { LOGO_SRC, FSSAI_REG, ADDRESS, CONTACT_PHONE_DISPLAY, EMAIL, GOOGLE_MAPS_URL, STORY_STEPS } from '../constants';

const QualityBadge: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="bg-white rounded-2xl p-5 border border-bv-border shadow-sm flex flex-col items-center text-center hover:shadow-md transition-shadow">
    <div className="w-12 h-12 bg-bv-green-pale rounded-xl flex items-center justify-center text-bv-green mb-3">
      {icon}
    </div>
    <h4 className="font-bold text-bv-dark text-sm mb-1">{title}</h4>
    <p className="text-bv-muted text-xs leading-relaxed">{desc}</p>
  </div>
);

const ProcessStep: React.FC<{ num: number; label: string }> = ({ num, label }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="w-12 h-12 bg-bv-green text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md shadow-bv-green/30">
      {num}
    </div>
    <p className="text-xs font-semibold text-bv-dark text-center">{label}</p>
  </div>
);

const AboutPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="pt-20 bg-bv-cream/30">

      {/* Hero */}
      <section className="relative py-20 bg-bv-dark/60 overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&q=60')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <img src={LOGO_SRC} alt="Bhaargavi Fresh Cuts" className="w-28 h-28 rounded-full mx-auto mb-6 border-4 border-white/20 object-cover shadow-xl" />
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-white mb-4">{t.about.hero_title}</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto leading-relaxed">{t.about.hero_desc}</p>
        </div>
      </section>

      {/* Quality Standards */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl text-bv-dark text-center mb-10">{t.about.quality_title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QualityBadge icon={<ShieldCheck size={24} />} title={t.about.fssai_title} desc={t.about.fssai_desc} />
            <QualityBadge icon={<Droplets size={24} />} title={t.about.ro_title} desc={t.about.ro_desc} />
            <QualityBadge icon={<Thermometer size={24} />} title={t.about.cold_title} desc={t.about.cold_desc} />
            <QualityBadge icon={<Wind size={24} />} title={t.about.hygiene_title} desc={t.about.hygiene_desc} />
          </div>
          <p className="text-center text-xs text-bv-muted mt-6">FSSAI Registration No. {FSSAI_REG} — Valid until May 2031</p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-bv-green-pale/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-bv-green font-semibold text-sm tracking-widest uppercase mb-2">{t.story.tag}</p>
            <h2 className="font-display text-2xl sm:text-3xl text-bv-dark">{t.story.title}</h2>
          </div>
          <div className="space-y-10">
            {STORY_STEPS.map((step, idx) => (
              <div key={step.id} className={`flex flex-col sm:flex-row gap-6 items-center ${idx % 2 === 1 ? 'sm:flex-row-reverse' : ''}`}>
                <div className="w-full sm:w-80 flex-shrink-0 rounded-2xl overflow-hidden shadow-md aspect-video sm:aspect-square">
                  <img src={step.image} alt={(t.story as Record<string, string>)[step.titleKey]} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-10 h-10 bg-bv-green text-white rounded-xl flex items-center justify-center font-bold text-base shadow-md shadow-bv-green/25">
                      {idx + 1}
                    </span>
                    <h3 className="font-bold text-bv-dark text-xl">{(t.story as Record<string, string>)[step.titleKey]}</h3>
                  </div>
                  <p className="text-bv-muted leading-relaxed">{(t.story as Record<string, string>)[step.captionKey]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Machinery */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl text-bv-dark text-center mb-10">{t.about.machinery_title}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Bubble Washer */}
            <div className="bg-white rounded-2xl p-6 border border-bv-border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-bv-green-pale rounded-xl flex items-center justify-center text-bv-green"><Droplets size={24} /></div>
                <div>
                  <h3 className="font-bold text-bv-dark">{t.about.washer_name}</h3>
                  <p className="text-xs text-bv-green font-semibold">{t.about.washer_maker}</p>
                </div>
              </div>
              <div className="bg-bv-card rounded-xl p-3 mb-3 text-sm font-semibold text-bv-dark">{t.about.washer_capacity}</div>
              <p className="text-bv-muted text-sm">{t.about.washer_desc}</p>
            </div>
            {/* Cutting Machine */}
            <div className="bg-white rounded-2xl p-6 border border-bv-border shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-bv-green-pale rounded-xl flex items-center justify-center text-bv-green"><Leaf size={24} /></div>
                <div>
                  <h3 className="font-bold text-bv-dark">{t.about.cutter_name}</h3>
                  <p className="text-xs text-bv-green font-semibold">{t.about.cutter_maker}</p>
                </div>
              </div>
              <div className="bg-bv-card rounded-xl p-3 mb-3 text-sm font-semibold text-bv-dark">{t.about.cutter_capacity}</div>
              <p className="text-bv-muted text-sm">{t.about.cutter_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process steps */}
      <section className="py-16 bg-bv-dark/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-white mb-3">{t.about.process_title}</h2>
          <p className="text-white/70 text-sm max-w-xl mx-auto mb-12">{t.about.process_sub}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[t.about.process_1, t.about.process_2, t.about.process_3, t.about.process_4].map((label, i) => (
              <ProcessStep key={i} num={i + 1} label={label} />
            ))}
          </div>
        </div>
      </section>

      {/* Packaging */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl text-bv-dark text-center mb-10">{t.about.packaging_title}</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-5 border border-bv-border shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 bg-bv-green-pale rounded-xl flex items-center justify-center text-bv-green mx-auto mb-3"><Package size={22} /></div>
              <h4 className="font-bold text-bv-dark mb-1">{t.about.pack_clamshell}</h4>
              <p className="text-bv-muted text-xs">{t.about.pack_clamshell_desc}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-bv-border shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 bg-bv-green-pale rounded-xl flex items-center justify-center text-bv-green mx-auto mb-3"><Package size={22} /></div>
              <h4 className="font-bold text-bv-dark mb-1">{t.about.pack_poly}</h4>
              <p className="text-bv-muted text-xs">{t.about.pack_poly_desc}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-bv-border shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-12 h-12 bg-bv-green-pale rounded-xl flex items-center justify-center text-bv-green mx-auto mb-3"><Package size={22} /></div>
              <h4 className="font-bold text-bv-dark mb-1">{t.about.pack_mesh}</h4>
              <p className="text-bv-muted text-xs">{t.about.pack_mesh_desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-bv-card/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl sm:text-3xl text-bv-dark text-center mb-8">{t.about.services_title}</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {t.data.services.map((service, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-3.5 border border-bv-border">
                <CheckCircle size={18} className="text-bv-green shrink-0" />
                <span className="text-sm text-bv-dark font-medium">{service}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="py-16 bg-bv-green/60 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-2xl sm:text-3xl mb-4">{t.about.vision_title}</h2>
          <p className="text-white/90 text-lg leading-relaxed">{t.about.vision_text}</p>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-bv-dark mb-8">{t.about.contact_title}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3 text-bv-muted">
              <MapPin size={18} className="text-bv-green shrink-0" />
              <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer"
                className="text-sm hover:text-bv-green transition-colors flex items-center gap-1">
                {ADDRESS}
                <ExternalLink size={12} />
              </a>
            </div>
            <div className="flex items-center justify-center gap-3 text-bv-muted">
              <Phone size={18} className="text-bv-green shrink-0" />
              <a href={`tel:+${CONTACT_PHONE_DISPLAY.replace(/\s/g, '')}`}
                className="text-sm hover:text-bv-green transition-colors">{CONTACT_PHONE_DISPLAY}</a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;
