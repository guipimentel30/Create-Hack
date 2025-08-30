import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import ptTranslations from './locales/pt.json';
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import arTranslations from './locales/ar.json';
import faTranslations from './locales/fa.json';

const resources = {
  pt: {
    translation: ptTranslations
  },
  en: {
    translation: enTranslations
  },
  es: {
    translation: esTranslations
  },
  ar: {
    translation: arTranslations
  },
  fa: {
    translation: faTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'pt', // Default language
    fallbackLng: 'pt',
    
    interpolation: {
      escapeValue: false // React already does escaping
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
