import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
// utils
import localStorageAvailable from '../utils/localStorageAvailable';
//
import { defaultLang } from './config-lang';
//
import enLocales from './langs/en';
import cnLocales from './langs/cn';
import koLocales from './langs/ko';
import jaLocales from './langs/ja';
import esLocales from './langs/es';

// ----------------------------------------------------------------------

let lng = defaultLang.value;

const storageAvailable = localStorageAvailable();

if (storageAvailable) {
  lng = localStorage.getItem('i18nextLng') || JSON.parse(localStorage.getItem('themeDnsData'))?.setting_obj?.default_lang;
}
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ko: { translations: koLocales },
      en: { translations: enLocales },
      ja: { translations: jaLocales },
      cn: { translations: cnLocales },
      es: { translations: esLocales },
    },
    lng,
    fallbackLng: lng,
    debug: false,
    ns: ['translations'],
    defaultNS: 'translations',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
