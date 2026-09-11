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
// 그래서 소스에서 **순서** 를 본다: 상품 목록 → 금액 요약 → 주문자 정보, 결제수단 map 안에 패널.
// 2026-09-11 부터 PC 와 휴대폰이 다르다 — PC 는 장바구니처럼 오른쪽 상자에서 결제하고,
// 휴대폰은 상품 아래 요약 + 고른 결제수단 아래 결제하기(아래 '2026-09-11' 묶음 참고).

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
const summary = 읽기('src/views/@dashboard/e-commerce/checkout/CheckoutSummary.js');

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
t('사이드바 요약·목록 아래 요약·결제수단 패널이 같은 값(요약.goods / options / count / discount)을 받는다',
  ['goods', 'options', 'count', 'discount'].every((k) => sheet.split(`${k}={요약.${k}}`).length - 1 === 3));

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
  const 버튼자리 = 패널.indexOf('결제하기버튼()');
  t('요약이 결제하기보다 위에 있다(그림과 같은 순서)', 요약자리 > 0 && 버튼자리 > 요약자리);
  const 버튼 = sheet.slice(idx(sheet, 'const 결제하기버튼 = () => ('), idx(sheet, 'const 결제수단패널 = ()'));
  t('선택한 결제수단 이름을 결제하기 위에 적는다', 버튼.indexOf("translate('선택한 결제수단:')") >= 0 && 버튼.indexOf("translate('선택한 결제수단:')") < 버튼.indexOf("translate('결제하기')"));
  t('포스페이·페이레터(리다이렉트형) 결제하기가 패널 안에 있다', 패널.includes('{리다이렉트형 && <Box sx={{ mt: 2 }}>{결제하기버튼()}</Box>}')
    && sheet.includes("const 리다이렉트형 = buyType == 'auth_forspay' || buyType == 'card_payletter';"));
  t('결제창을 여는 버튼은 한 곳에서 만든다(패널·오른쪽 상자가 같이 쓴다)',
    sheet.split('onPaySelectedRedirect();').length - 1 === 1 && 버튼.includes('onPaySelectedRedirect();') && sheet.split('결제하기버튼()').length - 1 === 2);
}
// ── 2026-09-11 사장님 결정: PC 는 장바구니처럼, 휴대폰은 요청서대로 ────────────
// PC(md 이상): 왼쪽 표 + 오른쪽 상자(금액·포인트·선택한 결제수단·결제하기) — 장바구니의 「주문하기」 자리와 같다.
//   상품 아래 요약·패널의 요약/결제하기는 PC 에서 숨는다(같은 숫자가 나란히 두 번 보이던 원인).
// 휴대폰: 상품 아래 요약 + 고른 결제수단 아래 요약·결제하기(요청 ③④). 오른쪽 상자는 숨고 포인트는 결제수단 위.
{
  const 우측 = sheet.slice(idx(sheet, '── 우: 결제 요약 ──'));
  t('오른쪽 칸은 PC 전용(휴대폰에서 숨는다)', sheet.includes("<Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>"));
  t('PC 는 오른쪽 상자에서 결제한다(리다이렉트형은 결제하기, 아니면 안내)',
    우측.includes('{리다이렉트형 ? (') && 우측.includes('{결제하기버튼()}') && 우측.includes("translate('결제수단을 선택한 뒤 결제 방법(결제하기 버튼 또는 입력란)에 따라 진행하세요.')"));
  const 상품 = idx(sheet, '{/* 주문상품');
  const 목록아래 = sheet.slice(상품, idx(sheet, "title={translate('주문자 정보')}"));
  t('상품 아래 요약은 휴대폰 전용', /<Box sx=\{\{ display: \{ xs: 'block', md: 'none' \} \}\}>\s*<CheckoutTotalsBrief/.test(목록아래));
  const 패널 = sheet.slice(idx(sheet, 'const 결제수단패널 = ()'), idx(sheet, 'paymentModules.map((item, idx) =>'));
  t('패널의 요약·결제하기는 휴대폰 전용(PC 는 입력란만 남는다)', /\{\/\* 휴대폰 전용 — 주문 요약정보 \+ 결제하기 \*\/\}\s*<Box sx=\{\{ display: \{ xs: 'block', md: 'none' \} \}\}>/.test(패널));
  t('포스페이·페이레터는 PC 에서 빈 패널을 안 그린다', 패널.includes("display: { xs: 'block', md: 리다이렉트형 ? 'none' : 'block' }"));
  t('PC 오른쪽 상자 배송비 줄에 안내 문구가 붙는다(상품 아래 요약을 숨겨도 안 사라진다)',
    sheet.split('shippingNote={요약.배송비안내}').length - 1 === 2 && summary.includes('{shippingNote && <Typography'));
  const 포인트칸 = sheet.slice(idx(sheet, '{/* 사용할 포인트 — 휴대폰 전용 자리'), idx(sheet, '{/* 결제수단 (약관 동의 후 선택) */}'));
  t('휴대폰 포인트 칸은 결제수단 바로 위, 회원·포인트 몰에서만',
    포인트칸.includes('{isMember && 포인트쓰는몰(themeDnsData) && (') && 포인트칸.includes("display: { xs: 'block', md: 'none' }") && 포인트칸.includes('<CheckoutPointField withLabel={false}'));
  t('PC 포인트 칸은 오른쪽 상자 안(같은 부품)', summary.includes('<CheckoutPointField themeDnsData={themeDnsData} payData={payData} setPayData={setPayData} total={displayTotal} />'));
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
// ③ 주문 요약정보에 총액만 있고 옵션이 안 보였다.
//    처음엔 상품명·옵션 목록을 요약에 넣었는데(9/9) 상품 카드와 같은 줄이 세 번 나와 어색하다는 의견이 나왔다.
//    다른 사이트(아마존·가맹점이 준 타 쇼핑몰 예시)는 목록을 한 곳에만 두고 요약은 금액만 적는다.
//    2026-09-11 사장님 결정(안 A): 요약에서 목록을 빼고 「상품금액 · N개 / 옵션·추가상품」 금액 줄로 나눈다.
const list = 읽기('src/views/@dashboard/e-commerce/checkout/cart/CheckoutCartProductList.js');
const line = 읽기('src/views/@dashboard/e-commerce/checkout/cart/CheckoutCartProduct.js');
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

t('옵션 글은 한 함수가 만든다(표 칸·상품 정보 창이 같은 글)',
  util.includes('export const orderLineOptionTexts = (row, lang)')
  && line.includes("import { orderLineOptionTexts } from 'src/utils/shop-util'")
  && 읽기('src/components/dialog/DialogProductPeek.js').includes('orderLineOptionTexts(row, currentLang?.value)'));
t('표 칸은 옵션 글을 직접 만들지 않는다', !line.includes('getOptionLabel('));
// 요약 세 곳 어디에도 상품 목록이 없다 — 목록은 상품 카드 한 곳(2026-09-11 사장님 결정)
t('요약 목록 부품은 없다(상품명이 한 페이지에 세 번 나오던 원인)',
  !index.includes('CheckoutSummaryItems') && !summary.includes('CheckoutSummaryItems') && !brief.includes('CheckoutSummaryItems')
  && !sheet.includes('요약.items') && !sheet.includes('items={'));
t('요약은 「상품금액 · N개」 줄로 시작한다(사이드바·목록 아래·패널 모두)',
  brief.includes("translate('상품금액 · {{n}}개', { n: Number(count) || 0 })") && summary.includes("translate('상품금액 · {{n}}개', { n: Number(count) || 0 })"));
t('옵션은 「옵션·추가상품」 금액 한 줄 — 0 이면 안 나오고 부호가 붙는다',
  brief.includes("{Number(options) !== 0 && <줄 label={translate('옵션·추가상품')} value={부호돈(options)} />}")
  && summary.includes("{Number(options) !== 0 && (") && summary.includes("{Number(options) < 0 ? '-' : '+'}"));
t('카트 화면처럼 금액 나누기를 안 넘기면 예전 「총액」 한 줄', summary.includes('Number.isFinite(goods) ?') && summary.includes("translate('총액')"));
t('주문서가 금액 나누기를 한 번 계산해 세 곳에 나눠 준다', sheet.includes('const 금액나눔 = orderAmountBreakdown(products);'));
t('할인은 있을 때만 적는다(정가 > 판매가일 때만 생긴다)',
  /Number\(discount\) > 0 && \(/.test(summary) && brief.includes('Number(discount) > 0 &&'));

// ── 금액 나누기를 실제로 돌린다 ──────────────────────────────────────────
// 상품금액 + 옵션·추가상품 − 할인 = 청구 계산(merchTotal) 이어야 한다. 한 원이라도 어긋나면 요약이 거짓말을 한다.
{
  const src = util;
  const grab = (name) => {
    const i = src.indexOf(`export const ${name} = `) >= 0 ? src.indexOf(`export const ${name} = `) : src.indexOf(`const ${name} = `);
    if (i < 0) throw new Error('없음: ' + name);
    const rest = src.slice(i);
    const m = rest.slice(1).match(/\n(?:export )?const [A-Za-z가-힣_]|\n\/\/ /);
    return rest.slice(0, m ? m.index + 1 : rest.length).replace(/^export /, '');
  };
  const PO = await import('file:///' + FRONT_ROOT + 'src/data/product-options.js');
  const body = [grab('isAddonLine'), grab('줄배송비'), grab('calculatorPrice'), grab('orderAmountBreakdown')].join('\n');
  const { calculatorPrice, orderAmountBreakdown } = new Function('optionExtraPrice', body + '\nreturn { calculatorPrice, orderAmountBreakdown };')(PO.optionExtraPrice);
  const merch = (ps) => ps.reduce((a, p) => a + (calculatorPrice(p).total - (Number(p.addon_line) === 1 ? 0 : (Number(p.delivery_fee) || 0))), 0);
  const 옵션 = (id, price, addon) => ({ id: 10 + id, group_name: 'g', group_type: addon ? 1 : 0, ...(addon ? { addon_line: 1 } : {}), options: [{ id, option_name: 'o' + id, option_price: price }] });
  // 갈비 2개(정가 60,000 / 판매가 50,000, 옵션 +0) + 소스 추가상품 줄 3개(+500)
  const 갈비 = { id: 1, product_price: 60000, product_sale_price: 50000, order_count: 2, delivery_fee: 0, groups: [옵션(101, 0)] };
  const 소스 = { id: 1, addon_line: 1, product_price: 60000, product_sale_price: 50000, order_count: 3, delivery_fee: 3000, groups: [옵션(201, 500, true)] };
  let r = orderAmountBreakdown([갈비, 소스]);
  t('상품금액은 본상품 정가 × 수량(추가상품 줄은 안 들어간다)', r.goods === 120000 && r.count === 2, JSON.stringify(r));
  t('옵션·추가상품 = 추가상품 줄 전체(500 × 3)', r.options === 1500, JSON.stringify(r));
  t('할인 = (정가 − 판매가) × 수량', r.discount === 20000, JSON.stringify(r));
  t('상품금액 + 옵션 − 할인 = 청구 계산', r.goods + r.options - r.discount === merch([갈비, 소스]), `${r.goods + r.options - r.discount} vs ${merch([갈비, 소스])}`);
  // 사과 대과(판매가 30,000, 옵션 +7,000), 정가를 비워 둔 옛 상품 — 할인이 음수가 되면 안 된다
  const 사과 = { id: 2, product_price: 0, product_sale_price: 30000, order_count: 1, groups: [옵션(301, 7000)] };
  r = orderAmountBreakdown([사과]);
  t('정가가 비어 있으면 할인 0, 상품금액은 판매가로', r.discount === 0 && r.goods === 30000 && r.options === 7000, JSON.stringify(r));
  t('그래도 합은 청구 계산과 같다', r.goods + r.options - r.discount === merch([사과]));
  // 음수 변동가 옵션
  const 할인옵션 = { id: 3, product_price: 20000, product_sale_price: 20000, order_count: 2, groups: [옵션(401, -2000)] };
  r = orderAmountBreakdown([할인옵션]);
  t('음수 변동가는 옵션 줄이 음수(−4,000)', r.options === -4000 && r.goods + r.options - r.discount === merch([할인옵션]), JSON.stringify(r));
  t('옵션이 없으면 옵션 줄은 0(요약에 안 나온다)', orderAmountBreakdown([{ id: 4, product_price: 5000, product_sale_price: 5000, order_count: 1, groups: [] }]).options === 0);
}

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

// ── PC 오른쪽 상자는 헤더 밑에 붙는다(2026-09-11 지적: 스크롤하면 윗부분이 잘린 채 따라왔다) ─────────
// 예전엔 top: 24 고정 — 스토어프론트 헤더(대부분 position:fixed, mbc01 프레임 162px) 밑에 상자 윗부분이 가려졌다.
{
  const sticky = 읽기('src/components/elements/shop/StickyBelowHeader.js');
  const 우측 = sheet.slice(idx(sheet, '── 우: 결제 요약 ──'));
  t('오른쪽 상자는 헤더 밑에 붙는 부품으로 감싼다',
    우측.includes('<StickyBelowHeader>') && 우측.indexOf('<StickyBelowHeader>') < 우측.indexOf('<CheckoutSummary') && 우측.includes('</StickyBelowHeader>'));
  t('주문서에 top 을 숫자로 박은 sticky 가 없다', !/position: \{ md: 'sticky' \}, top: \d+/.test(sheet));
  t('손님 화면의 <header> 를 재고, 떠 있을 때(fixed·sticky)만 비킨다',
    sticky.includes("document.querySelector('.storefront header')") && sticky.includes("position !== 'fixed' && position !== 'sticky'") && sticky.includes('getBoundingClientRect().bottom'));
  t('스크롤·창 크기·상자 높이가 바뀔 때마다 다시 잰다(줄어드는 헤더, 결제하기가 생기는 순간)',
    sticky.includes("addEventListener('scroll', schedule, { passive: true })") && sticky.includes("addEventListener('resize', schedule)") && sticky.includes('new ResizeObserver(schedule)'));
  t('떠날 때 듣던 것을 모두 푼다',
    sticky.includes("removeEventListener('scroll', schedule)") && sticky.includes("removeEventListener('resize', schedule)") && sticky.includes('observer?.disconnect()'));
  // 자리 계산을 실제로 돌린다
  const rest = sticky.slice(idx(sticky, 'export const 붙을자리 = '));
  const 붙을자리 = new Function('GAP', rest.slice(0, rest.indexOf('\n};') + 3).replace(/^export /, '') + '\nreturn 붙을자리;')(16);
  const 넉넉 = { 헤더끝: 162, 화면높이: 900, 상자높이: 377 };
  t('처음엔 헤더 바로 밑(162 + 16)', 붙을자리({ 이전: null, 스크롤변화: 0, ...넉넉 }) === 178);
  t('들어가는 화면에서는 얼마나 굴려도 헤더 밑',
    붙을자리({ 이전: 178, 스크롤변화: 700, ...넉넉 }) === 178 && 붙을자리({ 이전: 178, 스크롤변화: -700, ...넉넉 }) === 178);
  t('헤더가 줄면 따라 올라간다(shop demo-6)', 붙을자리({ 이전: 178, 스크롤변화: 10, 헤더끝: 60, 화면높이: 900, 상자높이: 377 }) === 76);
  t('떠 있는 헤더가 없으면 화면 위에서 16', 붙을자리({ 이전: null, 스크롤변화: 0, 헤더끝: 0, 화면높이: 900, 상자높이: 377 }) === 16);
  const 좁음 = { 헤더끝: 162, 화면높이: 593, 상자높이: 490 }; // 1920×1080 150% 배율 노트북 · 회원(포인트 칸)
  const 바닥 = 593 - 490 - 16;
  t('안 들어가면 내려갈수록 아래 끝(결제하기)이 화면 바닥 위로',
    붙을자리({ 이전: 178, 스크롤변화: 50, ...좁음 }) === 128 && 붙을자리({ 이전: 178, 스크롤변화: 900, ...좁음 }) === 바닥);
  t('올라가면 위 끝(주문 요약정보)이 다시 헤더 밑으로',
    붙을자리({ 이전: 바닥, 스크롤변화: -30, ...좁음 }) === 바닥 + 30 && 붙을자리({ 이전: 바닥, 스크롤변화: -900, ...좁음 }) === 178);
  t('상자가 화면보다 커도 아래 끝은 바닥 16 위',
    붙을자리({ 이전: 178, 스크롤변화: 5000, 헤더끝: 162, 화면높이: 480, 상자높이: 600 }) + 600 === 480 - 16);
}
t('선택한 결제수단 이름 앞에 한 칸 띄운다', sheet.includes("{translate('선택한 결제수단:')}{' '}<b>"));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
if (fail) process.exit(1);
