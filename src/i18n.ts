import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './locales/en/translation.json';
import translationMM from './locales/mm/translation.json';

const resources = {
  en: { translation: translationEN },
  mm: { translation: translationMM },
};

const STORAGE_KEY = 'yumli_lang';

function loadLanguage(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in resources) return stored;
  } catch { /* storage blocked */ }
  return 'en';
}

/**
 * The app calls Burmese `mm`, but the standard language tag is `my`. The
 * <html lang> attribute needs the standard one: screen readers pick their
 * voice from it and the CSS uses it to give Burmese text more line height.
 */
const htmlLang = (lng: string) => (lng === 'mm' ? 'my' : lng);

i18n.use(initReactI18next).init({
  lng: loadLanguage(),
  fallbackLng: 'en',
  debug: false,
  resources,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

document.documentElement.lang = htmlLang(i18n.language);

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = htmlLang(lng);
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch { /* storage blocked: the choice lasts for this visit only */ }
});

export default i18n;
