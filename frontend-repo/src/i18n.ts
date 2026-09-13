import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getLocalizedText, getTranslationCoverage, languageNames, translations, validateTranslationCompleteness } from './data/translations';
import type { Language } from './types';

export const supportedLanguages: Language[] = [
  'en', 'ta', 'hi', 'te', 'ml', 'kn', 'bn', 'mr', 'gu', 'pa', 'ur', 'or', 'as', 'ne', 'si',
  'ar', 'fr', 'es', 'pt', 'de', 'it', 'ru', 'uk', 'tr', 'id', 'ms', 'th', 'vi', 'ko', 'ja',
];
export { languageNames };

const missingTranslationKeys = validateTranslationCompleteness();
if (import.meta.env.DEV && missingTranslationKeys.length > 0) {
  console.warn('Missing translation keys:', missingTranslationKeys);
}
if (import.meta.env.DEV) {
  const fallbackOnlyLocales = supportedLanguages.slice(1).map(getTranslationCoverage);
  const fallbackCount = fallbackOnlyLocales.reduce((total, entry) => total + entry.englishFallbackKeys, 0);
  if (fallbackCount > 0) {
    console.info('Translation coverage report:', fallbackOnlyLocales.map(({ locale, totalKeys, translatedKeys, englishFallbackKeys }) => ({ locale, totalKeys, translatedKeys, englishFallbackKeys })));
  }
}

const LANGUAGE_STORAGE_KEY = 'agriguard_language';

function readStoredLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored && supportedLanguages.includes(stored as Language) ? stored as Language : 'en';
}

function interpolate(template: string, values?: Record<string, string | number>): string {
  if (!values) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    values[key] === undefined ? match : String(values[key]),
  );
}

export type TranslateFunction = ((key: string, values?: Record<string, string | number> | string) => string) &
  Record<string, string>;

function createTranslator(language: Language): TranslateFunction {
  const translate = ((key: string, values?: Record<string, string | number> | string) => {
    const fallback = typeof values === 'string' ? values : undefined;
    const interpolationValues = typeof values === 'string' ? undefined : values;
    return interpolate(getLocalizedText({
      [language]: translations[language][key],
      en: translations.en[key],
    }, language) || fallback || key, interpolationValues);
  }) as TranslateFunction;

  return new Proxy(translate, {
    get(target, property, receiver) {
      if (typeof property === 'symbol') return Reflect.get(target, property, receiver);
      return target(property);
    },
  });
}

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: TranslateFunction;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readStoredLanguage);
  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    if (typeof window !== 'undefined') localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  };
  useEffect(() => {
    const isRtl = language === 'ar' || language === 'ur';
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.body.dir = isRtl ? 'rtl' : 'ltr';
  }, [language]);
  const value = useMemo(() => ({ language, setLanguage, t: createTranslator(language) }), [language]);
  return createElement(LanguageContext.Provider, { value }, children);
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used inside LanguageProvider');
  return context;
}

export function useAppTranslation() {
  const { language, setLanguage, t } = useLanguage();
  return { t, language, setLanguage, i18n: { language, changeLanguage: setLanguage } };
}

export const useTranslation = useAppTranslation;

