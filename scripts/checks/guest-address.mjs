import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 배송지 목록을 '로그인한 사람에게만' 묻는지 본다.
//
// [무슨 일이 있었나 — 2026-09-03·04 시연 로그]
//   주문서(OrderSheet)의 getCart 가 로그인 여부와 상관없이 배송지 목록을 불렀다.
//   배송지는 개인정보라 서버가 비로그인은 막는다(-150 '권한이 없습니다' → HTTP 403).
//   그래서 비회원이 주문서를 열 때마다 403 이 한 번씩 났다. 이틀 26건.
//   화면에는 안 뜬다(get 은 실패를 삼킨다) — 그래서 아무도 몰랐고, 오류 지표만 더러워졌다.
//   반대편 문제도 같은 자리에 있었다: 로그인 정보는 JwtContext 가 비동기로 채우는데
//   getCart 는 그보다 먼저 도는 일이 있어, 회원인데도 첫 조회가 빈손으로 끝났다.
//
// [고친 방식]
//   부르는 자리를 [user?.id] 효과로 옮겼다. 로그인 정보가 도착한 뒤에 한 번 부른다.
//   같은 실수가 다른 주문 화면에도 있었는지 함께 본다(장바구니·바로구매 팝업은 이미 막혀 있었다).

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');

// ── 주문서 ────────────────────────────────────────────────────────────────
const order = 읽기('src/views/shop/order/OrderSheet.js');

// getCart 안에서는 부르지 않는다(장바구니를 읽는 일과 배송지는 상관이 없다).
const getCart = order.slice(order.indexOf('const getCart'), order.indexOf('const getCart') + 1400);
t('주문서 getCart 는 배송지를 부르지 않는다', !/onChangeAddressPage\(/.test(getCart),
    '로그인 전에도 돌아가는 자리다 — 여기서 부르면 비회원마다 403 이 난다');

// 대신 로그인 정보가 도착했을 때 부른다.
const 효과 = order.slice(order.indexOf('if (!user?.id) return;'), order.indexOf('if (!user?.id) return;') + 900);
t('로그인 정보가 오면 그때 부른다', /onChangeAddressPage\(/.test(효과),
    '이 자리까지 빠지면 회원이 저장해 둔 배송지를 못 본다');

// ── 다른 주문 화면들 ──────────────────────────────────────────────────────
// 같은 API 를 부르는 자리는 전부 로그인 확인이 앞에 있어야 한다.
const 자리 = [
    ['바로구매 팝업', 'src/components/dialog/DialogBuyNow.js'],
    ['배송지 관리 패널', 'src/components/elements/shop/AddressBookPanel.js'],
    ['블로그형 장바구니', 'src/views/blog/auth/cart/demo-2.js'],
];
for (const [이름, 경로] of 자리) {
    const src = 읽기(경로);
    // 목록 조회를 처음 거는 자리(useEffect) 근처에 로그인 확인이 있는지 본다.
    const 확인 = /if \(!user\?\.id\) return;|if \(user\?\.id\)|if \(user\)/.test(src);
    t(`${이름} 은 로그인 확인 뒤에 배송지를 부른다`, 확인,
        "비로그인 상태로 부르면 '권한이 없습니다'(403) 만 돌아온다");
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
