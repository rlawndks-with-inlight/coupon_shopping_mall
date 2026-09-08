import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 추가상품은 제 줄, 제 수량 (2026-09-09 사장님 결정 — 네이버·카페24 방식).
//
// [왜]
// 추가상품이 필수 조합 줄 안에 붙어 줄 수량에 묶여 있었다. 갈비 1개에 소스 3개가 불가능했고,
// 가맹점 제보(8/24) "추가옵션 제품 1개만 구매가능, 추가로 살 수 없음" 이 정확히 그것이었다.
// 이제 추가상품은 selected.addons 에 제 줄로 쌓이고, 담기면 addon_line=1 인 장바구니 줄이 된다.
//
// 붙잡아 두는 것:
//  · 상태 함수(toggle·count·remove·purchaseUnits)를 실제로 돌린다
//  · 추가상품 줄 금액 = 추가상품 가격 × 수량뿐(상품가·배송비·할인 없음) — 화면·백엔드 같은 규칙
//  · 본상품 없이는 못 산다 — 주문서가 걷어내고 서버가 거부한다
//  · 재고·구매제한·부분취소가 추가상품 줄을 본상품 개수로 세지 않는다
//  · 옛 '마지막 줄에 붙이기' 갈래는 없다(그 갈래가 살아 있으면 수량이 다시 묶인다)

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 읽기 = (root, p) => readFileSync(root + p, 'utf8');

// ── 상태 함수 실제 실행 ───────────────────────────────────────────────────
const 소스 = 읽기(FRONT_ROOT, 'src/data/product-options.js');
const mod = await import('data:text/javascript;base64,' + Buffer.from(소스).toString('base64'));
const { toggleAddonLine, hasAddonLine, addonLines, setOptionLineCount, removeOptionLine, purchaseUnits, closeOptionLine } = mod;

const 필수 = { id: 10, group_name: '갯수', group_type: 0, options: [{ id: 101, option_name: '1개', option_price: 0 }] };
const 소스그룹 = { id: 20, group_name: '소스', group_type: 1, options: [{ id: 201, option_name: '매운소스', option_price: 500 }, { id: 202, option_name: '순한소스', option_price: 500 }] };
const 매운 = 소스그룹.options[0];
const 순한 = 소스그룹.options[1];

let s = { count: 1, groups: [{ ...필수, options: [필수.options[0]] }] };
s = closeOptionLine(s);                      // 필수 조합이 줄로
s = toggleAddonLine(s, 소스그룹, 매운);
t('추가상품을 누르면 제 줄이 생긴다', addonLines(s).length === 1 && hasAddonLine(s, 소스그룹, 매운));
t('추가상품 줄의 그룹에 addon_line=1 표시가 심긴다(부분취소가 이걸 본다)', addonLines(s)[0].groups[0].addon_line === 1);
t('그룹 자체의 선택지 목록은 복사하지 않는다(고른 옵션 하나만)', addonLines(s)[0].groups[0].options.length === 1);
s = setOptionLineCount(s, addonLines(s)[0].key, 3);
t('추가상품 줄 수량을 따로 정한다(본상품 1 · 소스 3)', addonLines(s)[0].count === 3 && s.lines[0].count === 1);
let u = purchaseUnits(s);
t('구매 단위 = 본상품 줄 + 추가상품 줄(addon 표시, 쌓인줄)', u.length === 2 && !u[0].addon && u[1].addon === true && u[1].쌓인줄 === true && u[1].count === 3);
t('본상품 단위가 앞에 온다(배송비는 첫 줄에 붙는다)', !u[0].addon);
s = toggleAddonLine(s, 소스그룹, 순한);
t('다른 추가상품은 또 하나의 줄', addonLines(s).length === 2);
s = toggleAddonLine(s, 소스그룹, 매운);
t('다시 누르면 그 줄만 빠진다', addonLines(s).length === 1 && !hasAddonLine(s, 소스그룹, 매운) && hasAddonLine(s, 소스그룹, 순한));
s = setOptionLineCount(s, addonLines(s)[0].key, 0);
t('수량을 0 으로 내리면 줄이 빠진다', addonLines(s).length === 0);
s = toggleAddonLine(s, 소스그룹, 매운);
s = removeOptionLine(s, addonLines(s)[0].key);
t('✕ 로도 빠진다(줄 조작이 같은 통로)', addonLines(s).length === 0);
// 필수 옵션이 없는 상품(추가상품만) — 본상품은 아래 수량칸, 추가상품은 제 줄
let s2 = toggleAddonLine({ count: 2, groups: [] }, 소스그룹, 매운);
u = purchaseUnits(s2);
t('필수 없는 상품: 본상품 단위(수량 2) + 추가상품 줄(수량 1)', u.length === 2 && u[0].groups.length === 0 && u[0].count === 2 && u[1].addon && u[1].count === 1);

// ── shop-util: 담기·금액·표시 ─────────────────────────────────────────────
const util = 읽기(FRONT_ROOT, 'src/utils/shop-util.js');
t('추가상품 그룹을 누르면 제 줄로 간다(지금 선택에 안 들어간다)', util.includes('if (isAddon(group)) return toggleAddonLine(selectProductGroups, group, option);'));
t('옛 「마지막 줄에 붙이기」 갈래는 없다', !util.includes('추가상품을줄에붙이기(selectProductGroups'));
t('추가상품 줄 금액 = 추가상품 가격 × 수량(상품가 0·정가 0·배송비 0)',
    /const 추가상품 = isAddonLine\(item\);[\s\S]{0,200}const 판매가 = 추가상품 \? 0 :[\s\S]{0,120}const 정가 = 추가상품 \? 0 :[\s\S]{0,80}const delivery_fee = 줄배송비\(item\)/.test(util));
t('줄 배송비는 추가상품 줄에 안 붙는다(합계·결제 데이터 모두)', (util.match(/줄배송비\(products\[i\]\)/g) || []).length >= 3);
t('담기가 추가상품 줄을 addon_line=1 로 담는다', util.includes('const addon_line = 단위.addon ? 1 : 0;') && /cart_data\.push\(\{[\s\S]{0,400}addon_line,/.test(util));
t('바로구매도 같다', /purchaseUnits\(selectProductGroups\)\.map\(\(u\) => \(\{[\s\S]{0,400}addon_line: u\.addon \? 1 : 0/.test(util));
t('장바구니 줄 식별자에 추가상품 표시가 들어간다(본상품 줄과 합쳐지지 않는다)', util.includes("${isAddonLine(line) ? '/addon' : ''}"));
t('서버로 addon_line 을 실어 보낸다', /addon_line: isAddonLine\(products\[i\]\) \? 1 : 0/.test(util));
t('주문 이름에 (추가상품) 표시를 남긴다', util.includes('`${products[i]?.product_name} (추가상품)`'));

const sync = 읽기(FRONT_ROOT, 'src/utils/cart-sync.js');
t('장바구니 동기화가 추가상품 줄 배송비를 서버값으로 되돌리지 않는다', sync.includes("if (k === 'delivery_fee' && toInt(line?.addon_line) === 1) { next[k] = 0; continue; }"));

const addons = 읽기(FRONT_ROOT, 'src/components/elements/shop/ProductAddons.js');
t('추가상품 버튼의 눌린 표시는 제 줄(addons)에서 본다', addons.includes('const 골랐나 = (group, option) => hasAddonLine(selected, group, option);'));
const lines = 읽기(FRONT_ROOT, 'src/components/elements/shop/SelectedOptionLines.js');
t('선택한 옵션 상자가 추가상품 줄을 「추가 상품 · 이름」 으로 그린다', lines.includes("라벨: `${translate('추가 상품')} · ${옵션이름(줄)}`"));
t('추가상품 줄 금액에 상품가를 더하지 않는다', lines.includes('((줄.addon ? 0 : 기본가) + optionExtraPrice(product, { groups: 줄.groups }))'));
t('필수 없는 상품은 본상품을 읽기 전용 한 줄로 보여 총 주문금액이 맞다', lines.includes('const 암묵본상품 =') && lines.includes('조작: false'));

const row = 읽기(FRONT_ROOT, 'src/views/@dashboard/e-commerce/checkout/cart/CheckoutCartProduct.js');
t('주문서 줄에 「추가 상품」 표가 붙고 가격 칸은 추가상품 가격만', row.includes("<Label color=\"info\">{translate('추가 상품')}</Label>") && row.includes('{추가상품줄 ? ('));
const sheet = 읽기(FRONT_ROOT, 'src/views/shop/order/OrderSheet.js');
t('주문서가 본상품 없는 추가상품 줄을 걷어낸다(불러올 때·지울 때)', sheet.includes('const 고아추가상품걷기 = (list)') && sheet.includes('items = 고아추가상품걷기(items);') && sheet.includes('list = 고아추가상품걷기(list);'));
t('결제 관문에서도 한 번 더 본다', sheet.includes("toast.error(translate('추가상품은 본상품과 함께 주문할 수 있습니다.'));"));
for (const lang of ['ko', 'en', 'cn', 'ja', 'es', 'fr', 'vi', 'ar']) {
    const d = 읽기(FRONT_ROOT, `src/locales/langs/${lang}.js`);
    t(`${lang} 사전에 새 문구가 있다`, d.includes('"본상품이 빠져 추가상품도 함께 뺐습니다.":') && d.includes('"추가상품은 본상품과 함께 주문할 수 있습니다.":') && d.includes('"추가 상품":'));
}

// ── 백엔드 ───────────────────────────────────────────────────────────────
if (백엔드있음) {
    const pay = 읽기(BACK_ROOT, 'controllers/pay.controller.js');
    const recalc = pay.slice(pay.indexOf('const recalcOrderAmount = async'), pay.indexOf('const payCtrl = {'));
    t('서버 재계산: 추가상품 줄은 상품가 없이 추가상품 가격 × 수량', recalc.includes('const 추가상품줄 = Number(lines[i]?.addon_line) === 1;') && recalc.includes('((추가상품줄 ? 0 : (Number(p.product_sale_price) || 0)) + optionPrice) * count'));
    t('서버 재계산: 추가상품 줄에 필수옵션이 실리면 거부', recalc.includes('if (추가상품줄 && 종류 !== 1) return null;'));
    t('서버 재계산: 빈 추가상품 줄 거부', recalc.includes('if (추가상품줄 && counted.size === 0) return null;'));
    t('서버 재계산: 본상품 줄이 없는 추가상품 줄 거부', /const 본상품있음 = lines\.some\(\(m\) => Number\(m\?\.addon_line\) !== 1 && parseInt\(m\?\.id\) === parseInt\(l\?\.id\)\);\s*if \(!본상품있음\) return null;/.test(recalc));
    t('서버 재계산: 상품별 배송비는 추가상품 줄에 안 붙는다', recalc.includes("(Number(lines[i]?.addon_line) === 1 ? 0 : (Number(p.delivery_fee) || 0))"));
    const po = 읽기(BACK_ROOT, 'utils.js/product-options.js');
    t('재고: 추가상품 줄은 옵션 재고만 쓴다(상품 재고·조합 재고를 안 먹는다)', po.includes('export const isAddonLine = (line) =>') && /if \(isAddonLine\(line\)\) \{\s*if \(!ids\.length\) return \[\];/.test(po));
    t('필수옵션 검사는 추가상품 줄을 건너뛴다', po.includes('if (isAddonLine(line)) continue;'));
    t('1인 구매제한은 추가상품 줄을 본상품 개수로 세지 않는다', po.includes('.filter((l) => Number(l?.id) === pid && !isAddonLine(l))'));
    t('1인 구매제한: 지난 주문의 추가상품 줄도 빼고 센다', po.includes(`AND (o.order_groups IS NULL OR o.order_groups NOT LIKE '%"addon_line":1%')`));
    t('부분취소 재고 복구: 추가상품 줄은 옵션 행만', po.includes('only_options = false') && po.includes("(Number(r.option_id) === 0 ? !only_options : 고른것.has(Number(r.option_id)))"));
    const cancel = 읽기(BACK_ROOT, 'utils.js/cancel.js');
    t('부분취소가 order_groups 의 addon_line 을 보고 옵션 재고만 되돌린다', cancel.includes("추가상품줄 = (Array.isArray(groups) ? groups : []).some((g) => Number(g?.addon_line) === 1);") && cancel.includes('only_options: 추가상품줄'));
} else {
    console.log('  (백엔드 없음 — 서버 쪽은 건너뜀)');
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
if (fail) process.exit(1);
