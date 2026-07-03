import React from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, MapPin, Phone, Mail, Instagram, ExternalLink } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { LOGO_SRC, CONTACT_PHONE, CONTACT_PHONE_DISPLAY, EMAIL, INSTAGRAM_URL, ADDRESS, GOOGLE_MAPS_URL } from '../constants';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="bg-bv-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

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
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">{t.footer.desc}</p>
            <div className="flex items-start gap-2 mt-4 text-white/60 text-sm">
              <MapPin size={15} className="mt-0.5 text-bv-green shrink-0" />
              <a href={GOOGLE_MAPS_URL} target="_blank" rel="noreferrer"
                className="hover:text-bv-green-light transition-colors flex items-center gap-1">
                {ADDRESS} <ExternalLink size={11} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-white">{t.footer.quick_links}</h4>
            <ul className="space-y-2.5">
              {[
                { label: t.nav.home, href: '/#home' },
                { label: t.nav.products, href: '/#products' },
                { label: t.nav.about, href: '/about' },
                { label: t.nav.reviews, href: '/#reviews' },
              ].map(link => (
                <li key={link.href}>
                  <Link to={link.href} className="text-sm text-white/60 hover:text-bv-green-light transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Legal */}
          <div>
            <h4 className="font-bold text-sm mb-4 text-white">{t.footer.contact}</h4>
            <ul className="space-y-2.5 mb-6">
              <li>
                <a href={`https://wa.me/${CONTACT_PHONE}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-[#25D366] transition-colors">
                  <MessageCircle size={14} />
                  {CONTACT_PHONE_DISPLAY}
                </a>
              </li>
              <li>
                <a href={`mailto:${EMAIL}`}
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-bv-green-light transition-colors">
                  <Mail size={14} />
                  {EMAIL}
                </a>
              </li>
              <li>
                <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-white/60 hover:text-pink-400 transition-colors">
                  <Instagram size={14} />
                  @bhaargavifreshvegetables
                </a>
              </li>
            </ul>
            <h4 className="font-bold text-sm mb-3 text-white">{t.footer.legal}</h4>
            <ul className="space-y-2.5">
              {[
                { label: t.footer.privacy, to: '/privacy' },
                { label: t.footer.terms, to: '/terms' },
                { label: t.footer.refund, to: '/refund' },
                { label: t.footer.shipping, to: '/shipping' },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-white/60 hover:text-bv-green-light transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-white/40 text-xs">
          <p>© {year} Bhaargavi Fresh Cuts. {t.footer.rights}</p>
          <p>FSSAI Reg. No. 22426075000434</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
