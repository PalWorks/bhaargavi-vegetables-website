import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Products from './components/Products';
import CartSidebar from './components/CartSidebar';
import StickyCart from './components/StickyCart';
import ReviewCarousel from './components/ReviewCarousel';
import GoogleReviews from './components/GoogleReviews';
import InstagramFeed from './components/InstagramFeed';
import AboutPage from './components/AboutPage';
import Footer from './components/Footer';
import ScrollVideoBackground from './components/ScrollVideoBackground';
import { PrivacyPolicy, TermsOfService, RefundPolicy, ShippingPolicy } from './components/PolicyPages';
import { CartProvider } from './context/CartContext';
import { LanguageProvider, useLanguage } from './LanguageContext';
import ErrorBoundary from './components/ErrorBoundary';

const Layout: React.FC = () => {
  const { language } = useLanguage();
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      setTimeout(() => {
        const el = document.getElementById(hash.substring(1));
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  const fontClass = language === 'ta' ? 'font-ta' : language === 'hi' ? 'font-hi' : '';

  return (
    <div className={`min-h-screen flex flex-col ${fontClass}`}>
      <ScrollVideoBackground />
      <CartSidebar />
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <StickyCart />
    </div>
  );
};

const HomePage: React.FC = () => (
  <>
    <Hero />
    <Products />
    <ReviewCarousel />
    <GoogleReviews />
    <InstagramFeed />
  </>
);

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/refund" element={<RefundPolicy />} />
                <Route path="/shipping" element={<ShippingPolicy />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;