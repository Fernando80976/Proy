import esLabels from '../i18n/locales/es.json';
export type BackendErrorKey = keyof typeof esLabels.backend_errors;

export interface TranslatedText {
  [key: string]: string;
}