import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MapPin, Phone, Mail, Instagram, ExternalLink, ChevronDown } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { LOGO_SRC, CONTACT_PHONE, CONTACT_PHONE_DISPLAY, EMAIL, INSTAGRAM_URL, ADDRESS, GOOGLE_MAPS_URL } from '../constants';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    setIsDesktop(window.innerWidth > 640);
    const handler = () => setIsDesktop(window.innerWidth > 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-10">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={LOGO_SRC} alt="Bhaargavi Fresh Cuts" className="h-14 w-14 rounded-full object-cover border-2 border-bv-green/30" />
              <div>
                <p className="font-display font-bold text-xl leading-tight">BHAARGAVI</p>
                <p className="text-bv-green-light text-xs font-semibold tracking-widest">FRESH CUTS</p>
              </div>
            </Link>
            <p className="text-bv-green-light font-semibold mb-3 text-sm">{t.footer.tagline}</p>
            <p className="text-white/80 text-sm leading-relaxed max-w-xs">{t.footer.desc}</p>
          </div>

          {/* Quick Links */}
          <div>
            <details open={isDesktop} className="group cursor-pointer sm:cursor-auto">
              <summary className="font-bold text-sm mb-4 text-white list-none flex justify-between items-center sm:block">
                {t.footer.quick_links}
                <ChevronDown size={16} className="sm:hidden group-open:rotate-180 transition-transform text-bv-green-light" />
              </summary>
              <ul className="space-y-2.5 pb-4 sm:pb-0">
                {[
                  { label: t.nav.home, href: '/#home' },
                  { label: t.nav.products, href: '/#products' },
                  { label: t.nav.about, href: '/about' },
                  { label: t.nav.reviews, href: '/#reviews' },
                ].map(link => (
                  <li key={link.href}>
                    <Link to={link.href} className="text-sm text-white/80 hover:text-bv-green-light transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {/* Legal */}
          <div>
            <details open className="group cursor-pointer sm:cursor-auto">
              <summary className="font-bold text-sm mb-3 text-white list-none flex justify-between items-center sm:block">
                {t.footer.legal}
                <ChevronDown size={16} className="sm:hidden group-open:rotate-180 transition-transform text-bv-green-light" />
              </summary>
              <ul className="space-y-2.5 pb-4 sm:pb-0">
                {[
                  { label: t.footer.privacy, to: '/privacy' },
                  { label: t.footer.terms, to: '/terms' },
                  { label: t.footer.refund, to: '/refund' },
                  { label: t.footer.shipping, to: '/shipping' },
                ].map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-white/80 hover:text-bv-green-light transition-colors">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </details>
          </div>

          {/* Get in Touch */}
          <div>
            <details open className="group cursor-pointer sm:cursor-auto">
              <summary className="font-bold text-sm mb-4 text-white list-none flex justify-between items-center sm:block">
                Get in Touch
                <ChevronDown size={16} className="sm:hidden group-open:rotate-180 transition-transform text-bv-green-light" />
              </summary>
              <ul className="space-y-2.5 pb-4 sm:pb-0">
                <li>
                  <a href={`https://wa.me/${CONTACT_PHONE}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-sm text-white/80 hover:text-[#25D366] transition-colors">
                    <img src="/WhatsApp Icon.png" alt="WhatsApp" className="w-4 h-4 object-contain opacity-80 shrink-0" />
                    <span>{CONTACT_PHONE_DISPLAY}</span>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${EMAIL}`}
                    className="flex items-start gap-2 text-sm text-white/80 hover:text-bv-green-light transition-colors">
                    <Mail size={14} className="shrink-0 mt-0.5" />
                    <span className="break-all">{EMAIL}</span>
                  </a>
                </li>
                <li>
                  <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"
                    className="flex items-start gap-2 text-sm text-white/80 hover:text-pink-400 transition-colors">
                    <Instagram size={14} className="shrink-0 mt-0.5" />
                    <span className="break-all">@bhaargavifreshvegetables</span>
                  </a>
                </li>
                <li className="pt-2 border-t border-white/10 mt-2">
                  <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer"
                    className="flex items-start gap-2 text-sm text-white/80 hover:text-bv-green-light transition-colors">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-bv-green" />
                    <span>{ADDRESS} <ExternalLink size={11} className="inline ml-1" /></span>
                  </a>
                </li>
              </ul>
            </details>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-white/60 text-xs">
          <p>© {year} Bhaargavi Fresh Cuts. {t.footer.rights}</p>
          <p>FSSAI Reg. No. 22426075000434</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
