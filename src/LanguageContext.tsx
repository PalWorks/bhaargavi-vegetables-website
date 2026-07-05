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

const initialLanguage = (): Language => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved && LANGUAGES.includes(saved)) return saved;
  } catch { /* localStorage unavailable */ }
  return 'en';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(initialLanguage);

  // Persist the choice and reflect it on <html lang> for accessibility/SEO.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, language); } catch { /* ignore */ }
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => LANGUAGES[(LANGUAGES.indexOf(prev) + 1) % LANGUAGES.length]);
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