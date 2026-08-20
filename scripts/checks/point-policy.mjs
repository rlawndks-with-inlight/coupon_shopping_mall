import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
import { existsSync, readFileSync } from 'fs';

// 포인트 규칙을 잠근다.
//
// 무슨 일이 있었나:
//   같은 규칙이 세 군데에 서로 다른 완성도로 흩어져 있었다.
//     · 주문 요약 위젯 — 보유·최대설정·주문금액만 봤다
//     · 주문서 제출 검사 — 적립형 최소 보유까지 봤다
//     · 백엔드 결제 — 잔액만 봤다
//   그래서 가맹점이 설정한 '최소 주문금액'·'최소 보유 포인트'가 화면에도 서버에도
//   제대로 반영되지 않았고, 화면이 허용한 값을 제출이 막는 어긋남이 났다.
//   또 화면은 설정값(최대사용가능 포인트)을 그대로 보여줘서, 보유 500P 인 사람에게
//   '10,000P 사용가능'이라고 알려 주고 있었다.
//
// 규칙을 공용 모듈로 모으고, 프론트·백엔드 두 벌이 어긋나지 않는지 여기서 대조한다.

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

const 소스 = readFileSync(FRONT_ROOT + 'src/data/point-policy.js', 'utf8');
const { 포인트정책, 포인트쓰는몰, 포인트사용상한, 적립예정 } =
    new Function(소스.replace(/\bexport const /g, 'const ') +
        'return { 포인트정책, 포인트쓰는몰, 포인트사용상한, 적립예정 };')();

const 몰 = (obj) => ({ setting_obj: obj });

// ── 안 쓰는 가맹점에는 아무것도 안 보인다 ────────────────────────────────
// 기본값이 0 이라 설정을 안 한 가맹점은 저절로 여기 걸려야 한다.
t('설정이 비면 포인트를 안 쓰는 몰', 포인트쓰는몰(몰({})) === false);
t('브랜드 정보가 없어도 안 죽는다', 포인트쓰는몰(undefined) === false);
t('적립률만 있어도 쓰는 몰', 포인트쓰는몰(몰({ point_rate: 1 })) === true);
t('최대사용만 있어도 쓰는 몰', 포인트쓰는몰(몰({ max_use_point: 1000 })) === true);

// ── 상한은 '설정값'이 아니라 '실제로 쓸 수 있는 값' ──────────────────────
const 기본 = { max_use_point: 10000, point_rate: 1 };
t('보유가 적으면 보유가 상한',
    포인트사용상한({ dns: 몰(기본), 보유: 500, 주문금액: 50000 }).상한 === 500);
t('주문금액보다 많이 못 쓴다',
    포인트사용상한({ dns: 몰(기본), 보유: 99999, 주문금액: 3000 }).상한 === 3000);
t('설정 상한을 넘지 않는다',
    포인트사용상한({ dns: 몰(기본), 보유: 99999, 주문금액: 99999 }).상한 === 10000);
t('포인트를 안 쓰는 몰은 0', 포인트사용상한({ dns: 몰({}), 보유: 5000, 주문금액: 5000 }).상한 === 0);

// ── 가맹점이 설정한 조건이 실제로 걸린다 ────────────────────────────────
const 최소보유 = { ...기본, point_use_min: 1000 };
t('덜 모이면 못 쓴다', 포인트사용상한({ dns: 몰(최소보유), 보유: 900, 주문금액: 50000 }).상한 === 0);
t('못 쓰는 이유를 알려준다',
    포인트사용상한({ dns: 몰(최소보유), 보유: 900, 주문금액: 50000 }).이유.includes('모자'));
t('기준을 넘으면 쓴다', 포인트사용상한({ dns: 몰(최소보유), 보유: 1000, 주문금액: 50000 }).상한 === 1000);

const 최소금액 = { ...기본, use_point_min_price: 30000 };
t('주문금액이 모자라면 못 쓴다', 포인트사용상한({ dns: 몰(최소금액), 보유: 5000, 주문금액: 20000 }).상한 === 0);
t('금액을 넘으면 쓴다', 포인트사용상한({ dns: 몰(최소금액), 보유: 5000, 주문금액: 30000 }).상한 === 5000);

// ── 두 조건은 택일이 아니라 둘 다 걸린다 ────────────────────────────────
// 예전에는 point_policy_type 으로 하나만 골랐고, 안 고른 쪽 설정은 값을 채워도
// 아무 효과가 없는 죽은 칸이었다. 이제 둘 다 본다.
const 둘다 = { ...기본, point_use_min: 1000, use_point_min_price: 30000 };
t('둘 다 만족해야 쓴다', 포인트사용상한({ dns: 몰(둘다), 보유: 5000, 주문금액: 50000 }).상한 === 5000);
t('보유만 만족하면 못 쓴다', 포인트사용상한({ dns: 몰(둘다), 보유: 5000, 주문금액: 20000 }).상한 === 0);
t('금액만 만족하면 못 쓴다', 포인트사용상한({ dns: 몰(둘다), 보유: 900, 주문금액: 50000 }).상한 === 0);
// 옛 설정값이 남아 있어도 판정에 끼어들면 안 된다.
t('옛 방식 값은 무시한다',
    포인트사용상한({ dns: 몰({ ...둘다, point_policy_type: 'instant' }), 보유: 900, 주문금액: 50000 }).상한 === 0);

// ── 적립 ────────────────────────────────────────────────────────────────
t('적립은 결제금액 × 비율', 적립예정({ dns: 몰({ point_rate: 5 }), 결제금액: 10000 }) === 500);
// 소수가 원장에 들어가면 합계가 지저분해진다.
t('적립은 소수점을 버린다', 적립예정({ dns: 몰({ point_rate: 3 }), 결제금액: 1010 }) === 30);
t('비율이 0 이면 적립 없음', 적립예정({ dns: 몰({ point_rate: 0 }), 결제금액: 99999 }) === 0);

// ── 화면 배선 ───────────────────────────────────────────────────────────
const 요약 = readFileSync(FRONT_ROOT + 'src/views/@dashboard/e-commerce/checkout/CheckoutSummary.js', 'utf8');
t('주문 요약이 공용 규칙을 쓴다', /from 'src\/data\/point-policy'/.test(요약));
t("'잔여 포인트' 라는 잘못된 이름을 안 쓴다", !/translate\('잔여 포인트'\)/.test(요약));
t('보유 포인트로 부른다', /translate\('보유 포인트'\)/.test(요약));
t('설정값이 아니라 실제 사용가능액을 보여준다', /translate\('이번 주문에 사용 가능'\)[\s\S]{0,80}commarNumber\(pointCap\)/.test(요약));
t('적립 예정도 알려준다', /적립예정포인트 > 0/.test(요약));
t('못 쓸 때는 이유를 보여준다', /사용불가이유 &&/.test(요약));

// point_rate 는 브랜드 컬럼이 아니라 setting_obj 안에 있다. 겉에서 읽으면 늘 undefined 라
// '포인트를 쓰는데 메뉴가 안 뜨는' 조용한 고장이 된다(블로그형 5개 프레임이 그랬다).
const 잘못읽는곳 = [];
for (const p of [
    'src/views/blog/auth/my-page/demo-1.js', 'src/views/blog/auth/my-page/demo-2.js',
    'src/views/blog/auth/my-page/demo-3.js', 'src/views/blog/auth/my-page/demo-4.js',
    'src/views/blog/auth/my-page/demo-5.js', 'src/views/shop/demo-9/auth/my-page.js',
]) {
    // 주석 안은 세지 않는다 — 왜 고쳤는지 남긴 설명에도 같은 낱말이 나온다.
    const 산것 = readFileSync(FRONT_ROOT + p, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    if (/themeDnsData\?\.point_rate/.test(산것)) 잘못읽는곳.push(p);
}
if (잘못읽는곳.length) for (const x of 잘못읽는곳) console.log('        ' + x);
t('겉에서 point_rate 를 읽는 곳이 없다', 잘못읽는곳.length === 0);

// 설정 화면에서 '방식 고르기'가 되살아나면 죽은 칸이 다시 생긴다.
const 설정화면 = readFileSync(FRONT_ROOT + 'src/pages/manager/settings/default/[brand_id].js', 'utf8');
t('설정에 포인트 사용 방식 선택이 없다', !/포인트 사용 방식/.test(설정화면));
t('두 조건을 함께 안내한다', /아래 두 조건을 모두 만족해야/.test(설정화면));

// 장바구니·주문서가 각자 판정하지 않고 공용 규칙을 부른다.
const 흩어진곳 = [];
for (const f of ['src/views/shop/order/OrderSheet.js',
    ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map((d) => 'src/views/shop/demo-' + d + '/auth/cart.js'),
    'src/views/blog/auth/cart/demo-2.js']) {
    const src = readFileSync(FRONT_ROOT + f, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    if (/point_policy_type\s*===/.test(src)) 흩어진곳.push(f);
    if (!/포인트사용상한\(\{/.test(src)) 흩어진곳.push(f + ' (공용 규칙 안 씀)');
}
if (흩어진곳.length) for (const x of 흩어진곳) console.log('        ' + x);
t('장바구니·주문서가 공용 규칙을 쓴다', 흩어진곳.length === 0);

const 패널 = readFileSync(FRONT_ROOT + 'src/components/elements/shop/PointPanel.js', 'utf8');
t('포인트 패널이 안 쓰는 몰에서는 아무것도 안 그린다', /if \(!포인트쓰는몰\(themeDnsData\) \|\| !user\?\.id\) return null;/.test(패널));

// ── 서버도 같은 규칙을 쓰는가 ───────────────────────────────────────────
if (!existsSync(BACK_ROOT + 'utils.js/point-policy.js')) {
    console.log('  (백엔드 저장소가 없어 서버 쪽 검사는 건너뜀)');
} else {
    const 서버소스 = readFileSync(BACK_ROOT + 'utils.js/point-policy.js', 'utf8');
    const 서버 = new Function(서버소스.replace(/\bexport const /g, 'const ').replace(/export default[\s\S]*$/, '') +
        'return { 포인트쓰는몰, 포인트사용상한, 적립예정 };')();

    // 두 벌이 어긋나면 '화면에서는 되는데 결제가 막히는' 사고가 난다. 같은 입력에 같은 답을 내야 한다.
    const 경우들 = [
        { dns: 몰(기본), 보유: 500, 주문금액: 50000 },
        { dns: 몰(최소보유), 보유: 900, 주문금액: 50000 },
        { dns: 몰(최소금액), 보유: 5000, 주문금액: 20000 },
        { dns: 몰(둘다), 보유: 5000, 주문금액: 20000 },
        { dns: 몰({}), 보유: 5000, 주문금액: 5000 },
        { dns: 몰(기본), 보유: 99999, 주문금액: 3000 },
    ];
    const 같다 = 경우들.every((c) => 포인트사용상한(c).상한 === 서버.포인트사용상한(c).상한);
    t('서버와 화면의 상한이 같다', 같다);
    t('서버와 화면의 적립액이 같다',
        적립예정({ dns: 몰({ point_rate: 3 }), 결제금액: 1010 }) === 서버.적립예정({ dns: 몰({ point_rate: 3 }), 결제금액: 1010 }));
    // setting_obj 가 문자열로 나오는 경로가 있다(DB 직접 조회). 서버 쪽은 그것도 받아야 한다.
    t('서버는 setting_obj 가 문자열이어도 읽는다',
        서버.포인트쓰는몰({ setting_obj: JSON.stringify({ point_rate: 1 }) }) === true);

    // ── 포인트는 그 가맹점 안에서만 돈다 ────────────────────────────────
    // 잔액 쿼리가 전부 WHERE user_id=? 뿐이라 브랜드를 넘나들었다. 보통 회원은 가맹점마다
    // user 행이 따로라 티가 안 났지만, level 50(마스터)은 user 행 하나로 모든 몰에 로그인한다
    // — 한 몰에서 받은 포인트가 다른 몰에서 그대로 쓰였다(브랜드 60 소속 마스터 계정이
    // 브랜드 84 원장에 1,000억P 를 갖고 있었다). 다시 빠지면 조용히 새는 종류라 못 박는다.
    const 잔액쿼리없는곳 = [];
    for (const f of ['controllers/auth.controller.js', 'controllers/pay.controller.js',
        'controllers/shop.controller.js', 'controllers/user.controller.js']) {
        const src = readFileSync(BACK_ROOT + f, 'utf8')
            .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
        for (const m of src.matchAll(/SUM\(point\)[\s\S]{0,120}?FROM points WHERE[^`]*/g)) {
            if (!/brand_id/.test(m[0])) 잔액쿼리없는곳.push(f + '  →  ' + m[0].replace(/\s+/g, ' ').slice(0, 90));
        }
    }
    if (잔액쿼리없는곳.length) for (const x of 잔액쿼리없는곳) console.log('        ' + x);
    t('포인트 잔액은 브랜드 안에서만 센다', 잔액쿼리없는곳.length === 0);

    const 결제 = readFileSync(BACK_ROOT + 'controllers/pay.controller.js', 'utf8');
    t('결제가 공용 규칙으로 검증한다', /포인트사용상한\(\{/.test(결제));
    // 포인트를 뺀 뒤 금액으로 조건을 보면 스스로 조건을 무너뜨린다.
    t('조건은 포인트 빼기 전 금액으로 본다', /expected\.amount \|\| 0\) \+ Number\(expected\.usedPoint/.test(결제));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
