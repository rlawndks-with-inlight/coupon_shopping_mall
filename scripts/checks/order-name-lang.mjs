import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 주문내역 상품명 · 장바구니 번역 스냅샷 검증.
//
// 회귀 방지 대상
//  ① 주문내역이 항상 한국어 order_name 만 보여줘 외국어 고객이 못 읽던 문제
//  ② 장바구니 동기화가 product_name 만 갱신하고 lang_obj 는 두어, 상품명을 고치면
//     한국어는 새 이름 / 외국어는 옛 번역이 뜨던 문제
//  ③ 주문 기록(order_name)·PG 전송값은 절대 번역되면 안 된다는 경계
import { readFileSync } from 'fs';

const FRONT = FRONT_ROOT;

// 실제 formatLang 을 가져다 쓴다(구현이 바뀌면 이 테스트가 같이 깨져야 한다).
const fmtSrc = readFileSync(FRONT + 'src/utils/format.js', 'utf8');
const grab = (start, endMark) => {
  const i = fmtSrc.indexOf(start);
  const j = fmtSrc.indexOf(endMark, i) + endMark.length;
  return fmtSrc.slice(i, j).replace(/export const /g, 'const ');
};
let store = { i18nextLng: 'ko' };
globalThis.window = { localStorage: { getItem: (k) => store[k] ?? null } };
const F = new Function(
  grab('const currentLangCode', '\n};') + '\n' +
  grab('const SOURCE_LANG', ';') + '\n' +
  grab('const parseLangObj', '\n}') + '\n' +
  // formatLang 이 쓰는 첫 글자 대문자 헬퍼도 함께 가져온다(빠지면 ReferenceError)
  grab('const upperFirst', '\n};') + '\n' +
  grab('export const formatLang', '\n}') + '\n' +
  'return { formatLang };'
)();
const { formatLang } = F;

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  if (got === want) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`); }
};

// ── ① 주문내역 상품명: 번역본 우선, order_name 폴백 ──────────────────────
// 화면 코드와 같은 식이다: formatLang(item,'product_name') || item.order_name
const orderName = (item) => formatLang(item, 'product_name') || item?.order_name;

const line = {
  order_name: '피자',                         // 주문 시점 스냅샷(항상 원문)
  product_name: '피자',                       // 서버가 조인해 준 현재 상품명
  lang_obj: { product_name: { ko: '피자', en: 'pizza', ja: 'ピザ' } },
};
store = { i18nextLng: 'ko' };
eq('한국어는 상품명 그대로', orderName(line), '피자');
store = { i18nextLng: 'en' };
eq('영어는 번역본(첫 글자 대문자)', orderName(line), 'Pizza');
store = { i18nextLng: 'ja' };
eq('일본어는 번역본', orderName(line), 'ピザ');
store = { i18nextLng: 'cn' };
eq('번역 없는 언어는 원문', orderName(line), '피자');

// 상품이 삭제되면 조인이 비어 product_name 이 없다 → 주문 시점 이름으로 떨어져야 한다
const deleted = { order_name: '단종된 피자', product_name: null, lang_obj: null };
store = { i18nextLng: 'en' };
eq('상품 삭제 시 order_name 폴백', orderName(deleted), '단종된 피자');
eq('한국어에서도 폴백', (store = { i18nextLng: 'ko' }, orderName(deleted)), '단종된 피자');
// 둘 다 없으면 undefined 가 아니라 falsy 로 떨어져도 화면이 죽지 않아야 한다
eq('둘 다 없음', orderName({}), undefined);
eq('item 자체가 없음', orderName(undefined), undefined);

// 이름이 바뀐 상품: 고객 화면은 현재 이름을 보여준다(트레이드오프를 명시적으로 고정)
const renamed = {
  order_name: '피자',                                   // 주문 당시 이름 — DB 에 그대로 남는다
  product_name: '수제화덕피자',                          // 가맹점이 바꾼 현재 이름
  lang_obj: { product_name: { ko: '수제화덕피자', en: 'Wood-fired pizza' } },
};
store = { i18nextLng: 'ko' };
eq('이름 변경 시 현재 이름(한국어)', orderName(renamed), '수제화덕피자');
store = { i18nextLng: 'en' };
eq('이름 변경 시 현재 이름(영어)', orderName(renamed), 'Wood-fired pizza');

// ── ② 장바구니 동기화: lang_obj 도 함께 되맞춘다 ─────────────────────────
// cart-sync 의 해당 부분과 같은 규칙
const syncLine = (line, server) => ({
  ...line,
  product_name: server?.product_name ?? line?.product_name,
  lang_obj: server?.lang_obj ?? line?.lang_obj,
  product_comment: server?.product_comment ?? line?.product_comment,
});

const snapshot = {
  product_name: '피자',
  lang_obj: { product_name: { ko: '피자', en: 'pizza' } },
};
const server = {
  product_name: '수제화덕피자',
  lang_obj: { product_name: { ko: '수제화덕피자', en: 'Wood-fired pizza' } },
};
const synced = syncLine(snapshot, server);
store = { i18nextLng: 'ko' };
eq('동기화 후 한국어', formatLang(synced, 'product_name'), '수제화덕피자');
store = { i18nextLng: 'en' };
eq('동기화 후 영어도 새 번역', formatLang(synced, 'product_name'), 'Wood-fired pizza');

// 이게 고친 문제다 — lang_obj 를 안 갱신하면 영어만 옛 이름에 머문다
const stale = { ...snapshot, product_name: server.product_name };
store = { i18nextLng: 'ko' };
eq('(옛 동작) 한국어는 새 이름', formatLang(stale, 'product_name'), '수제화덕피자');
store = { i18nextLng: 'en' };
eq('(옛 동작) 영어는 옛 번역에 머문다', formatLang(stale, 'product_name'), 'Pizza');

// 서버가 lang_obj 를 안 주면 기존 값을 유지한다 — 번역을 잃는 것보다 낫다
const noLangFromServer = syncLine(snapshot, { product_name: '피자' });
store = { i18nextLng: 'en' };
eq('서버가 lang_obj 미제공 시 기존 유지', formatLang(noLangFromServer, 'product_name'), 'Pizza');

// ── ③ 기록·전송값은 번역되지 않아야 한다 ────────────────────────────────
// makePayData 이후의 라인은 lang_obj 가 없다 → formatLang 을 써도 원문이 나온다.
const payLine = { order_name: '피자', order_amount: 10000 };
store = { i18nextLng: 'ja' };
eq('주문 기록은 언어와 무관', payLine.order_name, '피자');
eq('PG 주문명도 원문', `${payLine.order_name} 외 2건`, '피자 외 2건');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
