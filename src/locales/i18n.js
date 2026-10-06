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

// 페이지 언어 표시(<html lang>)를 지금 고른 언어로 맞춘다.
// 없으면 브라우저(특히 휴대폰 크롬·삼성 인터넷)가 글자를 보고 언어를 추측해 엉뚱한 자동번역을 제안하고,
// 손님이 그 번역을 켠 채 사이트 언어를 바꾸면 두 번역이 겹쳐 글자가 섞여 보인다(2026-10-06 점검).
// 사전 이름 cn 은 표준 언어 코드가 아니라 zh 로 바꿔 적는다.
const toHtmlLang = (l) => {
  const base = String(l || 'ko').split('-')[0];
  return base === 'cn' ? 'zh' : base;
};
if (typeof document !== 'undefined') {
  document.documentElement.lang = toHtmlLang(i18n.language);
  i18n.on('languageChanged', (l) => { document.documentElement.lang = toHtmlLang(l); });
}

export default i18n;
