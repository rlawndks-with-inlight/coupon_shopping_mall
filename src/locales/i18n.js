import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
// utils
import localStorageAvailable from '../utils/localStorageAvailable';
//
import { defaultLang } from './config-lang';
import { 서버본문으로시작 } from '../utils/seo-head';
//
import enLocales from './langs/en';
import cnLocales from './langs/cn';
import koLocales from './langs/ko';
import jaLocales from './langs/ja';
import esLocales from './langs/es';

// ----------------------------------------------------------------------

let lng = defaultLang.value;

const storageAvailable = localStorageAvailable();

// 서버에서 본문을 그린 페이지(샵고 소개 페이지, src/utils/seo-head.js 서버본문)는 첫 화면을 서버와 같은 언어(기본 ko)로 시작한다.
//   여기서 바로 저장된 언어(예: en)로 시작하면 서버 HTML(한국어)과 첫 화면이 어긋나 React 가 오류를 내고 통째로 다시 그린다.
//   저장된 언어로의 전환은 _app 의 첫 useEffect(i18n.changeLanguage)가 화면을 맞춘 직후에 한다.
//   ⚠ 언어 감지기(LanguageDetector)는 시작하면서 지금 언어(ko)를 localStorage 에 써 버린다 — 손님이 고른 언어가 지워진다.
//     그래서 고른 언어를 미리 받아 두고(미룬언어), 시작이 끝나면 되돌려 쓰고, _app 이 그 값으로 전환한다.
let 미룬언어 = '';
if (storageAvailable) {
  const 저장언어 = localStorage.getItem('i18nextLng') || JSON.parse(localStorage.getItem('themeDnsData'))?.setting_obj?.default_lang;
  if (서버본문으로시작()) 미룬언어 = 저장언어 || '';
  else lng = 저장언어;
}
export const 미룬언어가져오기 = () => 미룬언어;
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
  }, () => {
    if (미룬언어) { try { localStorage.setItem('i18nextLng', 미룬언어); } catch (e) { /* 저장소를 못 쓰면 그대로 */ } }
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
