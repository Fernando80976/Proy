import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importamos los archivos JSON
import esLabels from './locales/es.json';
import enLabels from './locales/en.json';

const resources = {
  es: { translation: esLabels },
  en: { translation: enLabels }
} as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    
    // 1. Esto soluciona el error de Overload y el problema de es-ES
    fallbackLng: 'es',
    supportedLngs: ['es', 'en'],
    load: 'languageOnly', // Fundamental: convierte es-ES en es automáticamente
    
    // 2. Quitamos las propiedades que dan error y usamos la estándar
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      // Esto le dice que si encuentra 'es-ES', solo use la primera parte 'es'
      convertDetectedLanguage: (lng: string) => lng.split('-')[0],
    },

    interpolation: {
      escapeValue: false
    },

    react: {
      useSuspense: false
    }
  });

export default i18n;