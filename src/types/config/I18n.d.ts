import 'i18next';
import esLabels from '../i18n/locales/es.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: {
      translation: typeof esLabels;
    };
  }
}