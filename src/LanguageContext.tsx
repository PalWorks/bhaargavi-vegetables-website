import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language } from './translations';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: typeof translations.en;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'bhaargavi-lang';
// Cycle order is derived from the available translations, so adding a new
// language to translations automatically includes it in the toggle.
const LANGUAGES = Object.keys(translations) as Language[];

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // First render is always 'en' to match the build-time pre-rendered HTML (which
  // has no localStorage), so hydration doesn't mismatch. The saved language is
  // adopted right after mount.
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (saved && LANGUAGES.includes(saved) && saved !== 'en') setLanguage(saved);
    } catch { /* localStorage unavailable */ }
  }, []);

  // Reflect on <html lang> for accessibility/SEO.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => {
      const next = LANGUAGES[(LANGUAGES.indexOf(prev) + 1) % LANGUAGES.length];
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* ignore */ }
      return next;
    });
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};