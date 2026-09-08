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
  const 상품 = idx(sheet, "title={translate('주문 상품')}");
  const 요약 = idx(sheet, '<CheckoutTotalsBrief');
  const 주문자 = idx(sheet, "title={translate('주문자 정보')}");
  t('요약은 상품 목록과 주문자 정보 사이에 있다(= 상품 목록 바로 아래)', 상품 < 요약 && 요약 < 주문자);
}
t('요약은 청구액(orderTotals.amount)을 그대로 받는다', /<CheckoutTotalsBrief[\s\S]*?total=\{orderTotals\.amount\}/.test(sheet));
t('요약 부품은 스스로 배송비를 계산하지 않는다(호출부 값만 비춘다)',
  !/import[^\n]*(getBrandShipping|calcOrderTotals)/.test(brief) && !/(getBrandShipping|calcOrderTotals)\(/.test(brief));
t('요약 부품에 총 결제금액 줄이 있다', brief.includes("translate('총 결제금액')"));
t('요약 부품에 포인트 입력란은 없다(입력은 사이드바 한 곳)', !brief.includes('OutlinedInput') && !brief.includes('use_point'));
t('사이드바 요약과 아래 요약이 같은 값(요약.subtotal / 요약.discount)을 받는다',
  (sheet.match(/subtotal=\{요약\.subtotal\}/g) || []).length === 2
  && (sheet.match(/discount=\{요약\.discount\}/g) || []).length === 2);

// ── 4. 고른 결제수단 아래 패널 ────────────────────────────────────────────
t('결제수단패널이 정의돼 있다', sheet.includes('const 결제수단패널 = ()'));
{
  const map시작 = idx(sheet, 'paymentModules.map((item, idx) =>');
  const 패널호출 = idx(sheet, '결제수단패널()');
  const map끝 = sheet.indexOf('paymentModules.length == 0', map시작);
  t('패널은 결제수단 map **안에서** 그려진다(고른 수단 바로 아래)', map시작 < 패널호출 && 패널호출 < map끝);
  t('고른 수단(selected)에만 붙는다', sheet.includes('{selected && 패널있는수단.includes(buyType) && 결제수단패널()}'));
}
t('패널 머리에 총 결제금액이 있다',
  /const 결제수단패널 = \(\) => \([\s\S]*?translate\('총 결제금액'\)[\s\S]*?commarNumberWithUnit\(orderTotals\.amount/.test(sheet));
t('포스페이·페이레터 결제하기 버튼이 패널 안에 있다',
  /const 결제수단패널 = \(\) => \([\s\S]*?\(buyType == 'auth_forspay' \|\| buyType == 'card_payletter'\)[\s\S]*?onPaySelectedRedirect\(\)/.test(sheet));
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

console.log(`\n통과 ${pass} / 실패 ${fail}`);
if (fail) process.exit(1);
