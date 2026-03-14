import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import translations from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    // Try to load from localStorage first
    return localStorage.getItem('eduai_language') || 'en';
  });

  const setLanguage = useCallback((lang) => {
    setLanguageState(lang);
    localStorage.setItem('eduai_language', lang);
    // Update HTML lang attribute
    document.documentElement.lang = lang === 'ta' ? 'ta' : lang === 'hi' ? 'hi' : 'en';
  }, []);

  // Set initial HTML lang
  useEffect(() => {
    document.documentElement.lang = language === 'ta' ? 'ta' : language === 'hi' ? 'hi' : 'en';
  }, [language]);

  // t('dashboard.welcomeBack') => returns the translated string
  const t = useCallback((key) => {
    const parts = key.split('.');
    if (parts.length !== 2) return key;
    const [section, field] = parts;
    
    const sectionData = translations[section];
    if (!sectionData) return key;
    
    const langData = sectionData[language] || sectionData['en'];
    if (!langData) return key;
    
    return langData[field] !== undefined ? langData[field] : key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
