// src/types/i18next-types.ts
import 'i18next';
import esLabels from '../i18n/locales/es.json';

// 1. Declaramos la configuración de i18next
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof esLabels;
    };
  }
}