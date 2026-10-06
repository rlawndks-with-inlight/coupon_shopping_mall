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
    // 사전에 없는 문구는 한국어(=사전 키, 원문)로 대체한다.
    // 예전엔 fallbackLng: lng(처음 접속 언어)라, 일본어로 들어왔다가 한국어로 바꾸면 한국어 사전에 없는
    // 결제수단 이름·설명만 일본어로 남았다(포항과메기 주문서, 2026-10-06 제보 — 「안드로이드에서만」으로 보였던 것).
    fallbackLng: 'ko',
    debug: false,
    ns: ['translations'],
    defaultNS: 'translations',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
