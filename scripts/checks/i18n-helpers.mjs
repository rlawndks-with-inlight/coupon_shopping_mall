import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 다국어 헬퍼 단위 검증 — 가격 단위 / formatLang 기본언어 / 특성 선택지 짝맞춤.
import fs from 'fs';
const ROOT = FRONT_ROOT;
const rd = (p) => fs.readFileSync(ROOT + p, 'utf8').replace(/\r\n/g, '\n');

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name); } };

// localStorage 흉내 — 헬퍼가 여기서 언어를 읽는다.
let store = {};
global.window = { localStorage: { getItem: (k) => (k in store ? store[k] : null) } };

// ── utils/function.js : currentLangCode / getPriceUnitByLang / commarNumberWithUnit ──
const fn = rd('src/utils/function.js');
const cut = (start, endMark) => {
  const i = fn.indexOf(start);
  const j = fn.indexOf(endMark, i) + endMark.length;
  return fn.slice(i, j).replace(/export const /g, 'const ');
};
const commar = cut('export const commarNumber', '\n}');
const langCode = cut('export const currentLangCode', '\n};');
const unit = cut('export const getPriceUnitByLang', '\n}');
const withUnit = cut('export const commarNumberWithUnit', ';');
const M = new Function(`${commar}\n${langCode}\n${unit}\n${withUnit}\nreturn { currentLangCode, getPriceUnitByLang, commarNumberWithUnit };`)();

store = {};
t('언어정보 없으면 ko', M.currentLangCode() === 'ko');
store = { i18nextLng: 'ja' };
t('i18nextLng 를 읽는다', M.currentLangCode() === 'ja');
store = { i18nextLng: 'ko-KR' };
t('지역코드는 떼어낸다', M.currentLangCode() === 'ko');
store = { themeDnsData: JSON.stringify({ setting_obj: { default_lang: 'cn' } }) };
t('i18nextLng 없으면 브랜드 기본언어', M.currentLangCode() === 'cn');
store = { themeDnsData: '{{깨진 JSON' };
t('깨진 JSON 이어도 ko 로 버틴다', M.currentLangCode() === 'ko');

store = { i18nextLng: 'ko' };
t('한국어는 원', M.getPriceUnitByLang() === '원');
store = { i18nextLng: 'ja' };
t('일본어는 KRW (¥ 아님)', M.getPriceUnitByLang() === 'KRW');
store = { i18nextLng: 'cn' };
t('중국어는 KRW (元 아님)', M.getPriceUnitByLang() === 'KRW');
store = { i18nextLng: 'en' };
t('영어는 KRW ($ 아님)', M.getPriceUnitByLang() === 'KRW');
t('인자를 주면 그것을 쓴다(문자열)', M.getPriceUnitByLang('ko') === '원');
t('인자를 주면 그것을 쓴다(currentLang 객체)', M.getPriceUnitByLang({ value: 'ko' }) === '원');

store = { i18nextLng: 'ja' };
t('금액+단위 결합', M.commarNumberWithUnit(50000) === '50,000KRW');
store = { i18nextLng: 'ko' };
t('한국어 금액+단위', M.commarNumberWithUnit(50000) === '50,000원');
t('0원도 정상', M.commarNumberWithUnit(0) === '0원');

// ── utils/format.js : formatLang 기본언어 / characterChoices ──
const fmtSrc = rd('src/utils/format.js');
const grab = (start, endMark) => {
  const i = fmtSrc.indexOf(start);
  const j = fmtSrc.indexOf(endMark, i) + endMark.length;
  return fmtSrc.slice(i, j).replace(/export const /g, 'const ');
};
const F = new Function(
  grab('const currentLangCode', '\n};') + '\n' +
  // formatLang 이 원문 언어 판정에 쓰는 상수. 안 넣으면 ReferenceError 로 죽는다.
  grab('const SOURCE_LANG', ';') + '\n' +
  grab('const parseLangObj', '\n}') + '\n' +
  // 기계번역본의 첫 글자를 대문자로 올리는 헬퍼. formatLang 안에서 부르므로
  // 같이 안 떼어 오면 ReferenceError 로 죽는다.
  grab('const upperFirst', '\n};') + '\n' +
  grab('export const formatLang', '\n}') + '\n' +
  grab('export const characterChoices', '\n};') + '\n' +
  'return { formatLang, characterChoices };'
)();

const cat = { category_name: '주방용품', lang_obj: JSON.stringify({ category_name: { ko: '주방용품', ja: 'キッチン用品', cn: '厨房用品' } }) };
store = { i18nextLng: 'ja' };
t('3번째 인자 없이도 현재 언어로 번역', F.formatLang(cat, 'category_name') === 'キッチン用品');
t('명시 인자가 우선', F.formatLang(cat, 'category_name', 'cn') === '厨房用品');
t('currentLang 객체도 받는다', F.formatLang(cat, 'category_name', { value: 'cn' }) === '厨房用品');
t('번역 없는 언어는 원문 폴백', F.formatLang(cat, 'category_name', 'es') === '주방용품');
t('lang_obj 없으면 원문', F.formatLang({ category_name: '식품' }, 'category_name') === '식품');
t('빈 객체도 터지지 않는다', F.formatLang({}, 'category_name') === undefined);

// characterChoices — 보이는 건 번역, 저장은 원문
const chr = {
  character_name: '색상',
  character_value: '블랙,화이트',
  lang_obj: JSON.stringify({ character_value: { ja: 'ブラック,ホワイト' } }),
};
store = { i18nextLng: 'ja' };
let ch = F.characterChoices(chr);
t('선택지 개수 유지', ch.length === 2);
t('저장값은 원문', ch[0].value === '블랙' && ch[1].value === '화이트');
t('라벨은 번역', ch[0].label === 'ブラック' && ch[1].label === 'ホワイト');

// 번역이 구분자 개수를 바꾸면 짝이 어긋난다 → 번역 포기
const broken = { character_value: '블랙,화이트', lang_obj: JSON.stringify({ character_value: { ja: 'ブラックとホワイト' } }) };
ch = F.characterChoices(broken);
t('조각수 불일치면 번역 포기(원문 사용)', ch.length === 2 && ch[0].label === '블랙' && ch[1].label === '화이트');
t('그래도 저장값은 원문 그대로', ch[0].value === '블랙');

store = { i18nextLng: 'ko' };
ch = F.characterChoices(chr);
t('한국어면 라벨=원문', ch[0].label === '블랙');

t('값이 없으면 빈 배열', F.characterChoices({}).length === 0);
t('슬래시 구분자도 처리', F.characterChoices({ character_value: 'S / M / L' }).length === 3);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
