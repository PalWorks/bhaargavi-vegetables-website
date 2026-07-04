import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, MessageCircle, Languages } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../LanguageContext';
import { LOGO_SRC, WA_NUMBER } from '../constants';

const Navbar: React.FC = () => {
  const { cartCount, toggleCart } = useCart();
  const { t, language, toggleLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setIsMobileOpen(false), [location]);

  const navLinks = [
    { label: t.nav.home, href: '/#home' },
    { label: t.nav.products, href: '/#products' },
    { label: t.nav.about, href: '/about' },
    { label: t.nav.reviews, href: '/#reviews' },
    { label: t.nav.instagram, href: '/#instagram' },
  ];

  const langLabels: Record<string, string> = { en: 'EN', ta: 'தமிழ்', hi: 'हिंदी' };

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? 'bg-white/95 backdrop-blur-md shadow-md' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={LOGO_SRC} alt="Bhaargavi Fresh Cuts" className="h-12 w-12 rounded-full object-cover border-2 border-bv-green/20" />
            <div>
              <p className="font-display font-bold text-bv-dark text-base leading-tight">BHAARGAVI</p>
              <p className="text-[10px] sm:text-xs text-bv-green font-semibold tracking-wide">FRESH CUTS</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.href} to={link.href}
                className="text-sm font-medium text-bv-dark hover:text-bv-green transition-colors relative group">
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-bv-green group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Language Switcher */}
            <button onClick={toggleLanguage}
              className="flex items-center text-bv-dark hover:text-bv-green transition-all"
              title="Change Language">
              <img src="/Tamil-English Translation Icon.png" alt="Translate" className="w-6 h-6 object-contain" />
            </button>

            {/* WhatsApp CTA */}
            <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer"
              className="flex items-center justify-center text-bv-dark hover:text-[#25D366] transition-colors"
              title={t.nav.order}>
              <img src="/WhatsApp Icon.png" alt="WhatsApp" className="w-6 h-6 object-contain" />
            </a>

            {/* Cart */}
            <button onClick={toggleCart}
              className="relative text-bv-dark hover:text-bv-green transition-colors">
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-bv-orange text-white text-[10px] font-bold rounded-full w-4.5 h-4.5 flex items-center justify-center min-w-[18px] min-h-[18px] px-1">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile menu */}
            <button onClick={() => setIsMobileOpen(v => !v)}
              className="lg:hidden text-bv-dark hover:text-bv-green transition-colors">
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden bg-white border-t border-bv-border shadow-lg">
          <nav className="flex flex-col p-4 gap-4">
            {navLinks.map(link => (
              <Link key={link.href} to={link.href}
                className="text-bv-dark font-medium text-base hover:text-bv-green transition-colors py-1">
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-2 border-t border-bv-border">
              <button onClick={toggleLanguage}
                className="flex items-center justify-center gap-2 text-sm font-semibold text-bv-green border border-bv-green rounded-full px-4 py-2 hover:bg-bv-green hover:text-white transition-all">
                <img src="/Tamil-English Translation Icon.png" alt="Translate" className="w-5 h-5 object-contain" />
                {langLabels[language]}
              </button>
              <a href={`https://wa.me/${WA_NUMBER}`} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 text-sm font-bold text-bv-dark border border-[#25D366] rounded-full px-4 py-1.5 hover:bg-[#25D366] hover:text-white transition-all">
                <img src="/WhatsApp Icon.png" alt="WhatsApp" className="w-6 h-6 object-contain" />
                {t.nav.order}
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;