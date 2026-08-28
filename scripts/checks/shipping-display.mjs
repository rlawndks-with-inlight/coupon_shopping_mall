import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 화면에 보이는 배송비가 실제로 부과되는 배송비와 같은지 본다.
//
// 무슨 일이 있었나:
//   배송비 정책(설정관리 › 배송비설정)을 쓰는 몰에서 상품상세가 '배송비 0원'으로 떴다.
//   상세·장바구니 줄은 상품 테이블의 delivery_fee 를 그대로 찍는데, 정책을 쓰는 몰은
//   그 값이 0 이기 때문이다. 정작 합계(calcOrderTotals)는 정책대로 3,000원을 붙였다.
//   → 손님은 무료배송인 줄 알고 담았다가 결제 직전에 배송비를 만나고,
//     가맹점은 '설정한 배송비가 화면에 안 나온다'고 본다. (2026-08-21 가맹점 피드백)
//
// 이 검사는 '표시하는 자리가 정책을 거치는가'만 본다. 금액 계산 자체는
// getBrandShipping / calcOrderTotals 가 하고 그쪽은 point-policy 처럼 별도로 잠겨 있다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
const 모듈 = async (p) => import('data:text/javascript;base64,' + Buffer.from(읽기(p)).toString('base64'));

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

// ── 순수 함수 부분을 떼어 실제로 돌려 본다 ────────────────────────────────
// shop-util 은 axios·i18n 을 끌고 와서 통째로 import 할 수 없다. 정책 판정 부분만
// 떼어 같은 규칙으로 평가한다(원문과 어긋나면 아래 '원문 대조'가 잡는다).
const util = 읽기('src/utils/shop-util.js');
const 떼기 = (이름) => {
    const i = util.indexOf(`export const ${이름} = `);
    if (i < 0) return '';
    const j = util.indexOf('\n};', i);
    const k = util.indexOf('\n}', i);
    const 끝 = j > 0 && (k < 0 || j <= k) ? j + 3 : k + 2;
    return util.slice(i, 끝).replace('export const', 'const');
};
const 소스 = [떼기('배송정책'), 떼기('getBrandShipping'), 떼기('배송비표시')].join('\n');
t('배송비표시가 shop-util 에 있다', 소스.includes('const 배송비표시'));

const 만들기 = (setting) => {
    const 앞 = `const getLocalStorage = () => JSON.stringify({ setting_obj: ${JSON.stringify(setting)} });\n`;
    return new Function(앞 + 소스 + '\nreturn 배송비표시;')();
};

// 정책: 기본 3,000원 · 50,000원 이상 무료 (가맹점 mbc01 이 신고한 그 설정)
const 정책몰 = 만들기({ delivery_fee_default: 3000, free_ship_min: 50000 });
const 상품 = (가격, 상품배송비 = 0) => ({ product_sale_price: 가격, delivery_fee: 상품배송비 });

t('1만원 상품 → 3,000원 (0원이 아니다)', 정책몰(상품(10000)).fee === 3000, '실제: ' + JSON.stringify(정책몰(상품(10000))));
t('1만원 상품은 무료가 아니다', 정책몰(상품(10000)).free === false);
t('5만원 상품 → 무료', 정책몰(상품(50000)).fee === 0 && 정책몰(상품(50000)).free === true);
t('상품에 붙은 값이 있어도 정책이 이긴다', 정책몰(상품(10000, 7000)).fee === 3000);
t('무료 기준을 같이 알려준다', 정책몰(상품(10000)).freeMin === 50000);

// 정책 미설정 몰은 예전 그대로 상품별 배송비를 쓴다(하위호환).
const 옛몰 = 만들기({});
t('정책 미설정: 상품별 배송비 그대로', 옛몰(상품(10000, 2500)).fee === 2500 && 옛몰(상품(10000, 2500)).active === false);
t('정책 미설정 + 상품배송비 0 → 무료배송 표기', 옛몰(상품(10000, 0)).free === true);

// 기본배송비 없이 '무료 기준'만 넣은 몰(=사실상 전부 무료)도 죽지 않아야 한다.
const 기준만 = 만들기({ free_ship_min: 30000 });
t('기준만 있는 몰도 계산된다', 기준만(상품(10000)).fee === 0);

// ── 표시하는 자리가 전부 정책을 거치는가 ──────────────────────────────────
// 한 곳이라도 item.delivery_fee 를 직접 찍으면 그 프레임만 0원으로 보인다.
// 프레임이 11개라 '한 군데 고치고 끝'이 성립하지 않는 자리다.
const 표시자리 = [
    'src/views/@dashboard/e-commerce/details/ProductDetailsSummary.js',   // 프레임1
    'src/views/shop/demo-2/item/[id].js',
    'src/views/shop/demo-4/item/[id].js',
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `src/views/blog/product/id/demo-${n}.js`),
    ...[1, 2, 3, 4, 5].map((n) => `src/views/blog/seller/id/demo-${n}.js`),
];
for (const f of 표시자리) {
    const src = 읽기(f);
    const 주석뺀 = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    // 2026-08-28 부터 프레임은 <DetailNotices>(배송비·배송안내·혜택을 한 표로) 를 쓴다.
    // 표 형태 프레임만 <ShippingLine> 을 직접 쓴다.
    // 예전 주석: 대부분의 프레임은 공용 <ShippingLine> 을 쓴다. 그 안에서 배송비표시() 를
    // 부르므로 정책을 거치는 것은 같다. 둘 중 하나면 통과 — 직접 부르는 자리도 아직 남아 있다
    // (구매 서랍의 금액 계산표는 합계를 내야 해서 값이 필요하다).
    t(`${f.split('/').slice(-2).join('/')} 는 정책을 거친다`,
        주석뺀.includes('배송비표시(') || 주석뺀.includes('<ShippingLine') || 주석뺀.includes('<DetailNotices'),
        '상품 테이블의 delivery_fee 를 그대로 쓰면 정책을 쓰는 몰이 0원으로 보인다');
    // 화면에 찍는 자리에서 delivery_fee 를 직접 읽으면 안 된다(장바구니에 담을 때 넘기는 건 무관).
    const 직접 = [...주석뺀.matchAll(/commarNumber\w*\((?:[^()]*)delivery_fee/g)].map((m) => m[0]);
    t(`${f.split('/').slice(-2).join('/')} 는 상품값을 직접 찍지 않는다`, 직접.length === 0, 직접.join(' / '));
}

// ── 장바구니 줄 ───────────────────────────────────────────────────────────
// 정책은 '주문당 1회'다. 줄마다 같은 금액을 찍으면 합계와 맞지 않고,
// 줄마다 0 을 찍으면 가맹점이 본 그 화면(전부 0원)이 된다.
const 줄 = 읽기('src/views/@dashboard/e-commerce/checkout/cart/CheckoutCartProduct.js');
t('장바구니 줄이 주문 단위 배송비를 받는다', 줄.includes('ship_active') && 줄.includes('line_delivery'));
t('정책이 꺼진 몰은 예전 표기를 유지한다', 줄.includes("setProductPriceByLang(row, 'delivery_fee'"));

const 목록 = 읽기('src/views/@dashboard/e-commerce/checkout/cart/CheckoutCartProductList.js');
t('줄별 배송비를 합계와 같은 함수로 계산한다', 목록.includes('calcOrderTotals(products)'));
t('첫 줄에만 부과한다', 목록.includes('is_first_line={idx === 0}'));
t('표 아래에 주문당 1회임을 밝힌다', 목록.includes('배송비는 주문당 1회 부과됩니다.'));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
