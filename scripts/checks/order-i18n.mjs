import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 주문·결제 화면 번역 검증.
//  ① 코드에서 translate('…') 로 부르는 모든 키가 5개 국어 사전에 있는가
//  ② 보간 자리({{min}} 등)가 모든 언어에 그대로 남아 있는가 — 하나라도 빠지면 숫자가 사라진다
//  ③ 실제 i18next 로 돌려 한국어가 아닌 결과가 나오는가(키 폴백이 아닌지)
import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const FRONT = FRONT_ROOT;
const i18next = require(FRONT + 'node_modules/i18next');

const FILES = [
  'src/views/shop/order/OrderSheet.js',
  'src/views/shop/order/PayResultView.js',
  'src/views/@dashboard/e-commerce/checkout/cart/CheckoutCartProduct.js',
  // 상품상세 옵션 영역. 프레임 11개가 전부 이 세 컴포넌트를 쓰므로 여기 빠진 문구는
  // 모든 몰의 외국어 화면에서 한국어로 뜬다.
  //
  // ⚠ ko.js 는 사전 뒤에 큰 주석 블록(/* ... */)이 더 있다. '파일의 마지막 중괄호' 앞에
  //   키를 넣으면 **주석 안**으로 들어가 조용히 사라진다. 한국어는 키=원문이라
  //   화면이 멀쩡해 보여서 눈으로는 못 잡는다 — 이 검사가 그 자리를 지킨다.
  'src/components/elements/shop/ProductOptions.js',
  'src/components/elements/shop/ProductAddons.js',
  'src/components/elements/shop/ProductInfoRows.js',
  'src/components/elements/shop/OrderFormFields.js',
];
const LANGS = ['ko', 'en', 'ja', 'cn', 'es'];

// 사전 파일은 `const ko = {...}; export default ko;` 형태의 순수 데이터 모듈이라
// data: URL 로 감싸 그대로 import 한다. 정규식으로 본문을 잘라내면 주석 블록에 걸린다.
const loadDict = async (lang) => {
  const src = readFileSync(FRONT + `src/locales/langs/${lang}.js`, 'utf8');
  const mod = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
  return mod.default;
};
const dicts = Object.fromEntries(
  await Promise.all(LANGS.map(async (l) => [l, await loadDict(l)])),
);

// 코드에서 쓰는 키 수집
const keys = new Set();
for (const f of FILES) {
  const src = readFileSync(FRONT + f, 'utf8');
  for (const m of src.matchAll(/translate\(\s*'((?:[^'\\]|\\.)*)'/g)) keys.add(m[1].replace(/\\'/g, "'"));
  for (const m of src.matchAll(/translate\(\s*"((?:[^"\\]|\\.)*)"/g)) keys.add(m[1].replace(/\\"/g, '"'));
}

let pass = 0, fail = 0;
const bad = (msg) => { fail++; console.log('FAIL ' + msg); };
const ok = () => { pass++; };

console.log(`코드에서 쓰는 번역 키 ${keys.size}개\n`);

// ① 사전 존재
for (const k of keys) {
  for (const l of LANGS) {
    if (Object.prototype.hasOwnProperty.call(dicts[l], k)) ok();
    else bad(`${l} 사전에 없음: ${k}`);
  }
}

// ② 보간 자리 보존
const placeholders = (s) => (String(s).match(/\{\{\s*\w+\s*\}\}/g) || []).map((x) => x.replace(/\s/g, '')).sort();
for (const k of keys) {
  const want = placeholders(k);
  if (!want.length) continue;
  for (const l of LANGS) {
    const v = dicts[l][k];
    if (v === undefined) continue;
    const got = placeholders(v);
    if (JSON.stringify(got) === JSON.stringify(want)) ok();
    else bad(`${l} 보간 자리 불일치 [${k}] 기대 ${want} / 실제 ${got}`);
  }
}

// ③ 실제 i18next 결과 — 한국어 외 언어에서 키 그대로 나오면 번역 실패다
await i18next.init({
  resources: Object.fromEntries(LANGS.map((l) => [l, { translations: dicts[l] }])),
  lng: 'ko', fallbackLng: 'ko', ns: ['translations'], defaultNS: 'translations',
  interpolation: { escapeValue: false },
});
const HANGUL = /[가-힣]/;
for (const l of LANGS.filter((x) => x !== 'ko')) {
  await i18next.changeLanguage(l);
  for (const k of keys) {
    const out = i18next.t(k, { min: 6, max: 16, n: 3 });
    if (out === k) { bad(`${l} 에서 번역이 안 됨(키 그대로): ${k}`); continue; }
    // 일본어·중국어에는 한자가 있지만 한글 음절이 남아 있으면 번역 누락이다
    if (HANGUL.test(out)) { bad(`${l} 결과에 한글이 남음: ${k} → ${out}`); continue; }
    ok();
  }
}

// 보간이 실제로 치환되는지 (숫자가 사라지면 안내가 무의미해진다)
await i18next.changeLanguage('en');
const interp = i18next.t('{{min}}~{{max}}자로 입력해 주세요. 주문조회 시 필요하니 꼭 기억해 두세요.', { min: 6, max: 16 });
if (interp.includes('6') && interp.includes('16') && !interp.includes('{{')) ok();
else bad('보간 치환 실패: ' + interp);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
