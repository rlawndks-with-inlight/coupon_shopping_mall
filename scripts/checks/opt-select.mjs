import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// shop-util 의 옵션 선택/판정 로직 단위 검증.
// 실제 파일을 읽어 필요한 함수만 떼어내 평가한다(모듈 import 는 next/react 의존 때문에 불가).
import fs from 'fs';

const src = fs.readFileSync(FRONT_ROOT + 'src/utils/shop-util.js', 'utf8');

const grab = (name, kind) => {
  const re = new RegExp(`(?:export )?const ${name} = `);
  const i = src.search(re);
  if (i < 0) throw new Error('not found: ' + name);
  // 다음 최상위 선언 전까지
  const rest = src.slice(i);
  const m = rest.match(/\n(?:export )?const [A-Za-z]/);
  return rest.slice(0, m ? m.index : rest.length);
};

// 옵션 판정은 src/data/product-options.js 를 쓴다. 그 파일은 순수 JS(리액트 의존 없음)라
// 실제 모듈을 그대로 불러와 주입한다 — 복사본을 만들면 진짜 코드와 어긋나도 테스트가 통과한다.
const PO = await import('file:///' +
  FRONT_ROOT + 'src/data/product-options.js');
const { requiredGroups, isComboMode, findCombination, optionExtraPrice, maxOrderable, isAddon } = PO;

const toast = { error: () => {}, success: () => {} };
const _ = { findIndex: () => -1 };
// cartLineSignature 가 orderFormSignature 를 부른다 — 같이 안 떼어오면 ReferenceError 로 죽는다.
// (주문 추가 입력값이 다르면 장바구니 줄이 합쳐지면 안 되므로 시그니처에 들어간다)
const body = [grab('isSameOptionGroup'), grab('assertOptionsSelected'), grab('assertStock'),
              grab('cartLineSignature'),
              grab('orderFormSignature'),
              grab('normalizeSelectedOption'), grab('isSameSelectedOption'), grab('selectItemOptionUtil')]
  .map((chunk) => chunk.replace(/\bexport const /g, 'const '))
  .join('\n') + '\n';

// 안내 문구는 i18n 을 거친다(shop-util 의 번역()). 여기서는 사전 없이 원문을 그대로 돌려주는
// 스텁을 넣는다 — 이 검사가 보는 것은 '막느냐 통과시키냐'이지 문구 자체가 아니다.
const 번역 = (문구, 값) => String(문구).replace(/\{\{(\w+)\}\}/g, (_m, k) => (값?.[k] ?? ''));

const fn = new Function('toast', '_', 'requiredGroups', 'isComboMode', 'findCombination',
                        'optionExtraPrice', 'maxOrderable', 'isAddon', '번역', body + `
  return { isSameOptionGroup, assertOptionsSelected, assertStock, cartLineSignature, selectItemOptionUtil };
`);
const { assertOptionsSelected, assertStock, cartLineSignature, selectItemOptionUtil } =
  fn(toast, _, requiredGroups, isComboMode, findCombination, optionExtraPrice, maxOrderable, isAddon, 번역);

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

// ── 주문 추가 입력값과 장바구니 줄 합치기 ────────────────────────────────
// 값이 다르면 다른 줄이어야 한다. 안 그러면 '같은 한복을 9/1 과 9/8 에 각각' 담았을 때
// 한 줄로 합쳐지고 날짜 하나가 조용히 사라진다(수량만 2가 된다).
const 줄 = (vals) => ({ id: 7, seller_id: 0, groups: [], order_form_values: vals });
t('입력값이 다르면 다른 줄', cartLineSignature(줄({ 1: '2026-09-01' })) !== cartLineSignature(줄({ 1: '2026-09-08' })));
t('입력값이 같으면 같은 줄', cartLineSignature(줄({ 1: '2026-09-01' })) === cartLineSignature(줄({ 1: '2026-09-01' })));
t('키 순서가 달라도 같은 줄', cartLineSignature(줄({ 1: 'a', 2: 'b' })) === cartLineSignature(줄({ 2: 'b', 1: 'a' })));
t('값이 없으면 예전 줄과 그대로 맞는다', cartLineSignature(줄(undefined)) === cartLineSignature(줄({})));
t('빈 문자열은 없는 것과 같다', cartLineSignature(줄({ 1: '' })) === cartLineSignature(줄({})));
t('복수선택 순서가 달라도 같은 줄', cartLineSignature(줄({ 1: ['a', 'b'] })) === cartLineSignature(줄({ 1: ['b', 'a'] })));

// ── 특성(characters): id 가 없다 ──
const 색상 = { character_name: '색상', character_value: '블랙,화이트' };
const 사이즈 = { character_name: '사이즈', character_value: 'S,M,L' };

let sel = { count: 1, groups: [] };
sel = selectItemOptionUtil(색상, '블랙', sel);
t('특성 첫 선택 → 1개', sel.groups.length === 1);
sel = selectItemOptionUtil(색상, '화이트', sel);
t('같은 특성 재선택 → 여전히 1개(예전엔 2개로 쌓였다)', sel.groups.length === 1);
t('같은 특성 재선택 → 값이 교체된다', sel.groups[0].options[0].value === '화이트');
sel = selectItemOptionUtil(사이즈, 'M', sel);
t('다른 특성 추가 → 2개', sel.groups.length === 2);

// ── 옵션그룹(product_option_groups): id 가 있다 ──
const g1 = { id: 11, group_name: '용량', options: [{ id: 101, option_name: '250ml', option_price: 0 }, { id: 102, option_name: '500ml', option_price: 1000 }] };
const g2 = { id: 12, group_name: '포장', options: [{ id: 201, option_name: '기본', option_price: 0 }] };
const product = { id: 7, groups: [g1, g2] };

let s2 = { count: 1, groups: [] };
t('아무것도 안 고르면 차단', assertOptionsSelected(product, s2) === false);
s2 = selectItemOptionUtil(g1, g1.options[1], s2);
t('그룹 하나만 고르면 여전히 차단', assertOptionsSelected(product, s2) === false);
s2 = selectItemOptionUtil(g2, g2.options[0], s2);
t('그룹 전부 고르면 통과', assertOptionsSelected(product, s2) === true);
t('그룹 2개가 각각 1개씩', s2.groups.length === 2);
s2 = selectItemOptionUtil(g1, g1.options[0], s2);
t('같은 그룹 재선택 → 개수 그대로', s2.groups.length === 2);
t('같은 그룹 재선택 → 교체', s2.groups.find(g => g.id === 11).options[0].id === 101);

// ── 문자열 id 도 매칭돼야 한다 ──
const gStr = { id: '11', group_name: '용량', options: [{ id: '102', option_name: '500ml' }] };
t('문자열 id 그룹도 통과', assertOptionsSelected({ groups: [gStr] }, s2) === true);

// ── groups 를 안 싣는 경로(상품 카드)는 통과해야 한다 ──
t('groups 없는 상품은 통과(fail-open)', assertOptionsSelected({ id: 7 }, { groups: [] }) === true);

// ── 장바구니 시그니처: 특성끼리 구분 ──
const lineA = { id: 7, seller_id: 0, groups: [{ character_name: '색상', options: [{ value: '블랙' }] }] };
const lineB = { id: 7, seller_id: 0, groups: [{ character_name: '사이즈', options: [{ value: '블랙' }] }] };
const lineA2 = { id: 7, seller_id: 0, groups: [{ character_name: '색상', options: [{ value: '블랙' }] }] };
t('다른 특성 = 다른 줄', cartLineSignature(lineA) !== cartLineSignature(lineB));
t('같은 특성·같은 값 = 같은 줄', cartLineSignature(lineA) === cartLineSignature(lineA2));

// ── 추가상품은 필수가 아니다 ────────────────────────────────────────────────
// 이 개편의 핵심. 첫돌공방 상품 444 는 한복 +10,000 / 영상 +45,000 / 스냅 +300,000 이
// 각각 선택지 1개짜리 '옵션그룹'이라, 355,000원을 붙이지 않으면 살 수 없었다.
const 한복 = { id: 21, group_name: '한복', group_type: 1, options: [{ id: 211, option_name: '분홍', option_price: 10000 }] };
const 스냅 = { id: 22, group_name: '스냅', group_type: 1, options: [{ id: 221, option_name: '작가', option_price: 300000 }] };
const 돌상 = { id: 8, groups: [한복, 스냅] };
t('추가상품만 있는 상품은 아무것도 안 골라도 통과', assertOptionsSelected(돌상, { groups: [] }) === true);

const 크기 = { id: 23, group_name: '크기', group_type: 0, options: [{ id: 231, option_name: '기본' }] };
const 돌상2 = { id: 8, groups: [크기, 한복, 스냅] };
t('선택옵션은 여전히 필수', assertOptionsSelected(돌상2, { groups: [] }) === false);
let s3 = selectItemOptionUtil(크기, 크기.options[0], { count: 1, groups: [] });
t('선택옵션만 고르면 통과(추가상품 안 골라도)', assertOptionsSelected(돌상2, s3) === true);

// 추가상품은 여러 개 고를 수 있고 다시 누르면 빠진다
s3 = selectItemOptionUtil(한복, 한복.options[0], s3, true);
t('추가상품 담김', s3.groups.length === 2);
s3 = selectItemOptionUtil(스냅, 스냅.options[0], s3, true);
t('추가상품 두 개 담김', s3.groups.length === 3);
s3 = selectItemOptionUtil(한복, 한복.options[0], s3, true);
t('다시 누르면 빠진다(예전엔 뺄 방법이 없었다)', s3.groups.length === 2);
t('빠진 뒤에도 구매 가능', assertOptionsSelected(돌상2, s3) === true);

// ── 조합형 ─────────────────────────────────────────────────────────────────
const 색 = { id: 31, group_name: '색상', group_type: 0, options: [{ id: 311, option_name: '분홍' }, { id: 312, option_name: '파랑' }] };
const 사이즈2 = { id: 32, group_name: '사이즈', group_type: 0, options: [{ id: 321, option_name: 'S' }, { id: 322, option_name: 'M' }] };
const 조합상품 = {
  id: 9, option_mode: 1, groups: [색, 사이즈2],
  combinations: [{ combo_key: '311-321', add_price: 0 }, { combo_key: '311-322', add_price: 5000 }],
};
let c1 = selectItemOptionUtil(색, 색.options[0], { count: 1, groups: [] });
c1 = selectItemOptionUtil(사이즈2, 사이즈2.options[1], c1);
t('등록된 조합(분홍/M)은 통과', assertOptionsSelected(조합상품, c1) === true);
t('조합 추가금 5,000원이 붙는다', optionExtraPrice(조합상품, c1) === 5000);

let c2 = selectItemOptionUtil(색, 색.options[1], { count: 1, groups: [] });
c2 = selectItemOptionUtil(사이즈2, 사이즈2.options[0], c2);
t('안 파는 조합(파랑/S)은 차단 — 안 막으면 추가금 0원으로 결제된다',
  assertOptionsSelected(조합상품, c2) === false);

// 조합키는 고른 순서와 무관해야 한다(안 그러면 재고가 두 벌이 된다)
let c3 = selectItemOptionUtil(사이즈2, 사이즈2.options[1], { count: 1, groups: [] });
c3 = selectItemOptionUtil(색, 색.options[0], c3);
t('순서를 바꿔 골라도 같은 조합', optionExtraPrice(조합상품, c3) === 5000);

// 조합형에서는 선택옵션의 개별 가격을 세지 않는다(조합 추가금이 값이다)
const 조합상품2 = {
  ...조합상품,
  groups: [{ ...색, options: [{ id: 311, option_name: '분홍', option_price: 99999 }, 색.options[1]] }, 사이즈2],
};
let c4 = selectItemOptionUtil(조합상품2.groups[0], 조합상품2.groups[0].options[0], { count: 1, groups: [] });
c4 = selectItemOptionUtil(사이즈2, 사이즈2.options[1], c4);
t('조합형은 옵션 개별가를 안 센다(이중 청구 방지)', optionExtraPrice(조합상품2, c4) === 5000);

// 추가상품은 조합형에서도 개별 가격이 붙는다
const 조합plus = { ...조합상품, groups: [색, 사이즈2, 한복] };
let c5 = selectItemOptionUtil(색, 색.options[0], { count: 1, groups: [] });
c5 = selectItemOptionUtil(사이즈2, 사이즈2.options[1], c5);
c5 = selectItemOptionUtil(한복, 한복.options[0], c5, true);
t('조합 5,000 + 추가상품 10,000', optionExtraPrice(조합plus, c5) === 15000);

// ── 재고 ───────────────────────────────────────────────────────────────────
// NULL 은 무제한이다. 0 이 아니다 — 0 으로 접으면 마이그레이션 직후 전 상품이 품절이 된다.
t('재고 없는 상품(무제한)은 통과', assertStock({ id: 1 }, { count: 99, groups: [] }) === true);
t('상품 재고 0 이면 차단', assertStock({ id: 1, stock_qty: 0 }, { count: 1, groups: [] }) === false);
t('상품 재고보다 많이 담으면 차단', assertStock({ id: 1, stock_qty: 2 }, { count: 3, groups: [] }) === false);
t('재고 안이면 통과', assertStock({ id: 1, stock_qty: 3 }, { count: 3, groups: [] }) === true);

const 재고옵션 = { id: 41, group_name: '맛', group_type: 0, options: [{ id: 411, option_name: '딸기', stock_qty: 2 }] };
const 재고상품 = { id: 10, groups: [재고옵션] };
let r1 = selectItemOptionUtil(재고옵션, 재고옵션.options[0], { count: 3, groups: [] });
t('옵션 재고를 넘기면 차단', assertStock(재고상품, r1) === false);
r1 = { ...r1, count: 2 };
t('옵션 재고 안이면 통과', assertStock(재고상품, r1) === true);
t('옵션을 고르면 상품 재고가 아니라 옵션 재고를 본다', maxOrderable(재고상품, r1) === 2);

// 조합 재고
const 조합재고 = { ...조합상품, combinations: [{ combo_key: '311-322', add_price: 0, stock_qty: 1 }] };
t('조합 재고 1개 — 2개는 차단', assertStock(조합재고, { ...c1, count: 2 }) === false);
t('조합 재고 1개 — 1개는 통과', assertStock(조합재고, { ...c1, count: 1 }) === true);


// ── 손님에게 뜨는 안내가 사전을 거치는지 ─────────────────────────────────
// 이 파일(shop-util)은 컴포넌트가 아니라 useLocales() 를 못 쓴다. 그래서 예전엔
// toast 에 한국어를 그대로 박아 뒀고, 담기·구매가 막히는 순간의 안내가 5개 언어
// 전부에서 한국어로 떴다. 해외 판매가 소구점인 서비스에서 '왜 막혔는지'를 못 읽었다.
// 한 줄만 다시 원문으로 돌아가도 그 자리만 조용히 한국어가 된다 — 그래서 0건으로 못 박는다.
const FRONT = FRONT_ROOT;
const shopUtil = src;   // 위에서 이미 읽어 둔 shop-util 원문
const 날문구 = [...shopUtil.matchAll(/toast\.(?:error|success)\(\s*(['"`])([^'"`]*[가-힣][^'"`]*)/g)]
  .map((m) => m[2]);
t('shop-util 안내에 번역 안 거친 한국어 없음  ' + (날문구.length ? '→ ' + 날문구.join(' / ') : ''), 날문구.length === 0);
t('shop-util 이 i18n 을 들여온다', /import i18n from "src\/locales\/i18n"/.test(shopUtil));

// 새로 쓴 키가 5개 언어에 다 있어야 한다. 하나라도 비면 그 언어에서만 한국어가 남는다.
const 안내키 = [
  '옵션을 선택해 주세요.', '품절된 상품입니다.', '재고가 {{n}}개 남았습니다.',
  '{{name}} 항목을 입력해 주세요.', '회원만 구매할 수 있는 한정 상품입니다. 로그인 후 이용해 주세요.',
  '{{status}} 상품입니다.', '판매하지 않는', '데모 미리보기에서는 결제할 수 없습니다.',
  '성공적으로 발급 되었습니다.', '선택하신 조합은 판매하지 않습니다.',
];
for (const k of 안내키) {
  const 빈언어 = ['ko', 'en', 'ja', 'cn', 'es']
    .filter((l) => !fs.readFileSync(`${FRONT}src/locales/langs/${l}.js`, 'utf8').includes(`"${k}":`));
  t(`안내 사전 — ${k.slice(0, 18)} (5개 언어)` + (빈언어.length ? ' → 없음: ' + 빈언어.join(',') : ''), 빈언어.length === 0);
}

// ── 추가상품은 다시 누르면 빠져야 한다 ─────────────────────────────────────
//
// 붙잡아 두는 사고:
//   빼는 코드는 있었는데 `is_option_multiple` 인자로만 켜졌다. ProductAddons 는 true 를
//   넘기지만, 화면 쪽 onSelectOption(group, option) 이 세 번째 인자를 아예 안 받는
//   프레임이 7개였다 — 그 프레임에서 추가상품은 **누를 수만 있고 뺄 수 없었다**.
//   잘못 고른 추가금(성장영상 +45,000 같은 것)을 지우려면 새로고침밖에 없었고,
//   손님은 그걸 알 방법이 없으니 그대로 결제한다.
// 그래서 그룹 자체(group_type=1)를 보고 정한다. 아래는 **인자를 일부러 안 넘긴다** —
// 고쳐진 프레임 7개가 그렇게 부르기 때문이다.
{
  const 추가그룹 = { id: 20, group_name: '촬영 추가', group_type: 1 };
  const 영상 = { id: 201, option_name: '성장영상', option_price: 45000 };
  const 한복 = { id: 202, option_name: '한복', option_price: 10000 };
  const 이름들 = (s) => (s?.groups ?? []).flatMap((g) => (g.options ?? []).map((o) => o.option_name));
  const 같나 = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  let s = { count: 1, groups: [] };
  s = selectItemOptionUtil(추가그룹, 영상, s);
  t('추가상품 한 번 누르면 담긴다', 같나(이름들(s), ['성장영상']));
  s = selectItemOptionUtil(추가그룹, 영상, s);
  t('인자를 안 넘겨도 다시 누르면 빠진다', 같나(이름들(s), []));
  t('다 빼면 그룹도 사라진다', (s.groups ?? []).length === 0);

  s = selectItemOptionUtil(추가그룹, 영상, s);
  s = selectItemOptionUtil(추가그룹, 한복, s);
  t('여러 개 담긴다', 같나(이름들(s), ['성장영상', '한복']));
  s = selectItemOptionUtil(추가그룹, 영상, s);
  t('가운데 것만 빠진다', 같나(이름들(s), ['한복']));

  // 선택옵션은 예전과 같아야 한다 — 다시 눌러도 빠지지 않고 바뀐다
  const 색상g = { id: 10, group_name: '색상', group_type: 0 };
  const 블랙 = { id: 101, option_name: '블랙' }, 화이트 = { id: 102, option_name: '화이트' };
  let u = selectItemOptionUtil(색상g, 블랙, { count: 1, groups: [] });
  u = selectItemOptionUtil(색상g, 화이트, u);
  t('선택옵션은 바뀐다(쌓이지 않는다)', 같나(이름들(u), ['화이트']));
  u = selectItemOptionUtil(색상g, 화이트, u, false);
  t('선택옵션은 다시 눌러도 안 빠진다', 같나(이름들(u), ['화이트']));

  // 추가상품을 담으면 추가금이 실제로 붙어야 한다 — 빠지면 다시 0 이어야 한다
  const 상품 = { id: 7, option_mode: 0 };
  let v = selectItemOptionUtil(추가그룹, 영상, { count: 1, groups: [] });
  t('담으면 추가금이 붙는다', optionExtraPrice(상품, v) === 45000);
  v = selectItemOptionUtil(추가그룹, 영상, v);
  t('빼면 추가금도 사라진다', optionExtraPrice(상품, v) === 0);
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
