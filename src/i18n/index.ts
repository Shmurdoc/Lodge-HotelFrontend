import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import af from './locales/af.json';
import zu from './locales/zu.json';

export const defaultNS = 'translation';

export const resources = {
  en: { translation: en },
  af: { translation: af },
  zu: { translation: zu },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    defaultNS,
    interpolation: {
      escapeValue: false,
    },
  });

export const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'zu', name: 'Zulu', flag: '🇿🇦' },
];

export const currencies = [
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
];

export const changeLanguage = (lng: string) => {
  localStorage.setItem('language', lng);
  i18n.changeLanguage(lng);
};

export const formatCurrency = (amount: number, currency = 'ZAR') => {
  const curr = currencies.find(c => c.code === currency) || currencies[0];
  return new Intl.NumberFormat(i18n.language === 'en' ? 'en-ZA' : i18n.language === 'af' ? 'af-ZA' : 'zu-ZA', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatDate = (date: Date | string, format = 'medium') => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const locale = i18n.language === 'en' ? 'en-ZA' : i18n.language === 'af' ? 'af-ZA' : 'zu-ZA';
  
  if (format === 'short') {
    return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  }
  if (format === 'long') {
    return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
};

export default i18n;