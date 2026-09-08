import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 주문서의 '금액과 다음 동작이 어디에 있는가' 를 붙잡아 둔다.
//
// 가맹점 요청(2026-09-08, 20260908_무료쇼핑몰 추가 수정 요청 사항.pptx):
//   2. 주문내역이 한눈에 보여야 함 — 표 → 카드 (order-line-mobile.mjs 가 본다)
//   3. 주문내역 하단에 최종결제금액 안내
//   4. 결제수단을 고르면 그 아래에 주문 요약(결제하기)이 붙게
//
// 이 두 가지는 '값' 이 아니라 '자리' 의 문제라, 값 검사만으로는 다시 무너져도 모른다.
// 그래서 소스에서 **순서** 를 본다: 상품 목록 → 금액 요약 → 주문자 정보,
// 결제수단 map 안에 패널이 있고, 사이드바에는 결제하기가 없다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const idx = (src, needle) => { const i = src.indexOf(needle); if (i < 0) throw new Error('없음: ' + needle); return i; };

const sheet = 읽기('src/views/shop/order/OrderSheet.js');
const brief = 읽기('src/views/@dashboard/e-commerce/checkout/CheckoutTotalsBrief.js');
const index = 읽기('src/views/@dashboard/e-commerce/checkout/index.js');

// ── 3. 상품 목록 아래 금액 요약 ───────────────────────────────────────────
t('요약 부품이 index 에서 내보내진다', index.includes("export { default as CheckoutTotalsBrief }"));
t('주문서가 요약 부품을 쓴다', sheet.includes('<CheckoutTotalsBrief'));
{
  const 상품 = idx(sheet, '{/* 주문상품');
  // 결제수단 패널(JSX 앞에 정의)에도 같은 부품이 있으므로 '주문상품' 카드 뒤의 것을 본다
  const 요약 = sheet.indexOf('<CheckoutTotalsBrief', 상품);
  const 주문자 = idx(sheet, "title={translate('주문자 정보')}");
  t('요약은 상품 목록과 주문자 정보 사이에 있다(= 상품 목록 바로 아래)', 상품 < 요약 && 요약 < 주문자);
}
t('요약은 청구액(orderTotals.amount)을 그대로 받는다', /<CheckoutTotalsBrief[\s\S]*?total=\{orderTotals\.amount\}/.test(sheet));
t('요약 부품은 스스로 배송비를 계산하지 않는다(호출부 값만 비춘다)',
  !/import[^\n]*(getBrandShipping|calcOrderTotals)/.test(brief) && !/(getBrandShipping|calcOrderTotals)\(/.test(brief));
t('요약 부품에 총 결제금액 줄이 있다', brief.includes("translate('총 결제금액')"));
t('요약 부품에 포인트 입력란은 없다(입력은 사이드바 한 곳)', !brief.includes('OutlinedInput') && !brief.includes('use_point'));
t('사이드바 요약·목록 아래 요약·결제수단 패널이 같은 값(요약.subtotal / 요약.discount)을 받는다',
  (sheet.match(/subtotal=\{요약\.subtotal\}/g) || []).length === 3
  && (sheet.match(/discount=\{요약\.discount\}/g) || []).length === 3);

// ── 4. 고른 결제수단 아래 패널 ────────────────────────────────────────────
t('결제수단패널이 정의돼 있다', sheet.includes('const 결제수단패널 = ()'));
{
  const map시작 = idx(sheet, 'paymentModules.map((item, idx) =>');
  const 패널호출 = idx(sheet, '결제수단패널()');
  const map끝 = sheet.indexOf('paymentModules.length == 0', map시작);
  t('패널은 결제수단 map **안에서** 그려진다(고른 수단 바로 아래)', map시작 < 패널호출 && 패널호출 < map끝);
  t('고른 수단(selected)에만 붙는다', sheet.includes('{selected && 패널있는수단.includes(buyType) && 결제수단패널()}'));
}
{
  // 요청서 예시 그림의 순서: 고른 수단 → 주문 요약정보(총액·할인·배송비·총 결제금액) → 선택한 결제수단·결제하기
  const 패널 = sheet.slice(idx(sheet, 'const 결제수단패널 = ()'), idx(sheet, 'paymentModules.map((item, idx) =>'));
  t('패널 머리에 주문 요약정보가 있다', 패널.includes("translate('주문 요약정보')"));
  t('패널의 요약은 같은 부품(CheckoutTotalsBrief)으로, 청구액을 그대로 받는다',
    /<CheckoutTotalsBrief dense[\s\S]*?total=\{orderTotals\.amount\}/.test(패널));
  const 요약자리 = 패널.indexOf('<CheckoutTotalsBrief');
  const 버튼자리 = 패널.indexOf("translate('결제하기')");
  t('요약이 결제하기보다 위에 있다(그림과 같은 순서)', 요약자리 > 0 && 버튼자리 > 요약자리);
  t('선택한 결제수단 이름을 결제하기 위에 적는다', 패널.includes("translate('선택한 결제수단:')"));
  t('포스페이·페이레터 결제하기 버튼이 패널 안에 있다',
    /\(buyType == 'auth_forspay' \|\| buyType == 'card_payletter'\)[\s\S]*?onPaySelectedRedirect\(\)/.test(패널));
}
{
  // 사이드바(우측 요약)에는 결제하기가 없어야 한다 — 두 곳에 두면 어느 쪽을 눌러야 하는지 다시 헷갈린다
  const 우측 = sheet.slice(idx(sheet, '── 우: 결제 요약 ──'));
  t('사이드바에는 결제하기 버튼이 없다', !우측.includes("translate('결제하기')"));
  t('사이드바에는 「선택한 결제수단:」 안내가 없다(수단 밑에 붙었으니 불필요)', !우측.includes("선택한 결제수단:"));
}
// 수기결제·무통장·핀트리·헥토 입력란도 목록 끝이 아니라 패널 안이다
for (const type of ['card', 'virtual_account', 'gift_certificate', 'card_fintree', 'certification_fintree', 'card_hecto', 'phone_hecto', 'certification_wayup']) {
  const 패널 = sheet.slice(idx(sheet, 'const 결제수단패널 = ()'), idx(sheet, 'paymentModules.map((item, idx) =>'));
  t(`${type} 입력란/안내가 패널 안에 있다`, 패널.includes(`{buyType == '${type}' && (`));
}
t('결제 로직 자체는 그대로다(onPayByHand · onPaySelectedRedirect 둘 다 남아 있다)',
  sheet.includes('const onPayByHand = async') && sheet.includes('const onPaySelectedRedirect = async'));

// ── 2026-09-09 가맹점 2차 지적 ─────────────────────────────────────────────
// ② '상품'·'총액' 은 가장자리에, '주문 상품' 제목은 안쪽에 — 선이 안 맞았다. 표 바깥 칸·카드·요약을 24px 로 맞춘다.
//    '배송비는 주문당 1회…' 가 표와 요약 사이에 홀로 떠 있었다 — 배송비 값 곁으로 옮긴다.
// ③ 주문 요약정보에 총액만 있고 무엇을 샀는지가 없었다 — 상품명·옵션·수량·줄 금액을 넣는다.
const list = 읽기('src/views/@dashboard/e-commerce/checkout/cart/CheckoutCartProductList.js');
const line = 읽기('src/views/@dashboard/e-commerce/checkout/cart/CheckoutCartProduct.js');
const summary = 읽기('src/views/@dashboard/e-commerce/checkout/CheckoutSummary.js');
const items = 읽기('src/views/@dashboard/e-commerce/checkout/CheckoutSummaryItems.js');
const util = 읽기('src/utils/shop-util.js');

t('표의 바깥 칸이 카드 제목과 같은 24px 에서 시작한다',
  list.includes("'& td:first-of-type, & th:first-of-type': { pl: 3 }") && list.includes("'& td:last-of-type, & th:last-of-type': { pr: 3 }"));
t('카드 배치에서는 그 여백을 되돌린다(카드가 제 여백을 가진다)',
  /const 카드배치 = \{[\s\S]*?'& td:first-of-type': \{ pl: 0 \}[\s\S]*?'& td:last-of-type': \{ pr: 0 \}/.test(list));
t('카드도 24px 선에서 시작한다', /const 카드배치 = \{[\s\S]{0,200}px: 3,/.test(list));
t('표 아래 배송비 안내는 끌 수 있고 주문서는 끈다',
  list.includes('showShippingNote && totals.shipActive') && sheet.includes('showShippingNote={false}'));
t('주문서는 배송비 안내를 요약의 배송비 줄 곁에 둔다',
  sheet.includes('shippingNote={요약.배송비안내}') && brief.includes('note={shippingNote}'));
t('배송비 안내 문구는 표와 같은 사전 키를 쓴다',
  sheet.includes("translate('배송비는 주문당 1회 부과됩니다.')") && sheet.includes("translate('{{amount}} 이상 무료배송'"));
t('요약 부품(목록 아래)도 24px 여백이다', brief.includes('{ px: 3, pb: 3 }'));

t('옵션 글은 한 함수가 만든다(표 칸·요약이 같은 글)',
  util.includes('export const orderLineOptionTexts = (row, lang)')
  && line.includes("import { orderLineOptionTexts } from 'src/utils/shop-util'")
  && sheet.includes('options: orderLineOptionTexts(p, currentLang?.value)'));
t('표 칸은 옵션 글을 직접 만들지 않는다', !line.includes('getOptionLabel('));
t('요약 목록 부품이 있고 상품명·옵션·수량·금액을 받는다',
  items.includes('export default function CheckoutSummaryItems') && /options\s*:\s*PropTypes\.arrayOf/.test(items) && items.includes('it.count') && items.includes('it.amount'));
t('사이드바 요약과 결제수단 패널이 상품 목록(items)을 받는다',
  (sheet.match(/items=\{요약\.items\}/g) || []).length === 2 && summary.includes('<CheckoutSummaryItems items={items} />'));
t('표 바로 아래 요약에는 상품 목록을 넣지 않는다(표와 겹친다)', (() => {
  const 상품 = idx(sheet, '{/* 주문상품');
  const 요약 = sheet.indexOf('<CheckoutTotalsBrief', 상품);
  const 끝 = sheet.indexOf('/>', 요약);
  return !sheet.slice(요약, 끝).includes('items=');
})());
t('줄 금액은 표의 총액과 같은 계산(merchByIdx)이다', sheet.includes('amount: orderTotals.merchByIdx?.[i] ?? 0'));
t('할인은 있을 때만 적는다(정가 > 판매가일 때만 생긴다)',
  /Number\(discount\) > 0 && \(/.test(summary) && brief.includes('Number(discount) > 0 &&'));

// ── 2026-09-09 사장님 결정 ────────────────────────────────────────────────
// · 줄의 사진·이름을 누르면 상품 페이지로 가지 않고 그 자리에서 「상품 정보」 창을 연다(새 탭도, 링크 제거도 아님)
// · 「주문 상품」 카드 제목은 두지 않는다(표 머리줄·페이지 제목이 그 역할을 한다)
const peek = 읽기('src/components/dialog/DialogProductPeek.js');
t('상품 정보 창이 있다', peek.includes('export default function DialogProductPeek'));
t('창은 어디로도 나가지 않는다(router·href 없음)', !/router\.push|href=|window\.open/.test(peek));
t('창에 사진·이름·고른 옵션·수량·개당·상세설명이 있다',
  peek.includes('buildProductImages(상품)') && peek.includes("글('product_name')") && peek.includes('orderLineOptionTexts(row')
  && peek.includes("translate('수량')") && peek.includes("translate('개당')") && peek.includes("글('product_description')"));
t('휴대폰에서는 전체화면이다', peek.includes('fullScreen={휴대폰}'));
// 줄은 가격·상태만 동기화돼 상세설명·추가 사진이 없을 수 있다 — 창을 열 때 받아 채운다(쿠키 없는 조회라 이력이 안 남는다)
t('상세설명·사진이 없으면 창을 열 때 받아온다',
  peek.includes("import { fetchServerProduct } from 'src/utils/cart-sync'") && peek.includes('fetchServerProduct(row.id, row?.seller_id)')
  && 읽기('src/utils/cart-sync.js').includes('export const fetchServerProduct'));
t('줄의 값(고른 옵션·수량)이 상세보다 우선한다', peek.includes("row?.[k] === undefined ? detail[k] : row[k]"));
// MUI 프레임 상품 페이지는 sub_images 를 문자열 배열로 펴 두고, 줄이 그것을 그대로 복사한다 — 객체만 읽으면 사진이 1장이 된다
{
  const thumbs = 읽기('src/components/elements/shop/ProductThumbs.js');
  t('사진 목록은 문자열·객체 두 모양의 sub_images 를 다 읽고 겹침을 뺀다',
    thumbs.includes("typeof s === 'string' ? s : s?.product_sub_img") && thumbs.includes('new Set([item?.product_img, ...subs]'));
}
t('줄의 사진·이름은 창을 연다(상품 페이지로 안 간다)',
  !line.includes('router.push') && !line.includes("from 'next/router'") && (line.match(/onClick=\{상품보기\}/g) || []).length === 2);
t('목록이 창을 들고 있어 주문서·장바구니 둘 다 같은 창이다',
  list.includes('<DialogProductPeek open={!!peek} row={peek}') && list.includes('onPeek={() => setPeek(row)}'));
t('「주문 상품」 카드 제목이 없다', !sheet.includes("title={translate('주문 상품')}"));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
if (fail) process.exit(1);
