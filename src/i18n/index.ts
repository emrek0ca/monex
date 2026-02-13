import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './locales/en';
import { tr } from './locales/tr';

// Get saved language or detect from browser
const getSavedLanguage = (): string => {
    const saved = localStorage.getItem('monex-language');
    if (saved) return saved;

    // Detect browser language
    const browserLang = navigator.language.split('-')[0];
    return browserLang === 'tr' ? 'tr' : 'en';
};

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            tr: { translation: tr },
        },
        lng: getSavedLanguage(),
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false, // React already escapes
        },
    });

// Save language preference when changed
i18n.on('languageChanged', (lng) => {
    localStorage.setItem('monex-language', lng);
    document.documentElement.lang = lng;
});

export default i18n;
