
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { Language } from '@/types';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { i18n } = useI18nTranslation();
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Initialize from localStorage or browser preference
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'hi', 'bn', 'es', 'pt'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
      i18n.changeLanguage(savedLanguage);
    }
  }, [i18n]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
