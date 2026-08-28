import { FRONT_ROOT, BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 가맹점이 잘못 넣은 값 / 화면을 거치지 않은 요청이 결제금액까지 흔들던 자리들 (2026-08-27).
//
// [제보] 관리자 목록에 한 상품의 가격이 73,000 과 93,000 두 개로 보인다. 할인은 켠 적이 없다.
//
// [원인] 관리자에는 '할인 표시' 를 저장하는 칸이 없다. 열 때마다 `정가 > 판매가` 로 되짚어
//   체크 상태를 만든다. 그래서 **할인 중이던 상품은 열자마자 체크가 켜져 있고**,
//   그 상태에서 판매가만 고치면 정가가 옛 값에 남는다 — 사람이 체크를 누른 적이 없어도 그렇다.
//     · 새 판매가 > 옛 정가 → 주문서에 음수 할인('할인 20,000원' 인데 총액이 더 큼)
//     · 새 판매가 < 옛 정가 → 가맹점이 설정한 적 없는 할인율이 고객 화면에 뜬다
//   실측 295건.
//
// [함께 드러난 것] 옵션 변동가·조합 추가금에 **음수를 넣을 수 있었다.**
//   결제 재계산(recalcOrderAmount)은 금액 위조를 막으려고 DB 의 옵션 가격을 그대로 믿는다.
//   그래서 음수 옵션 하나면 그 방어가 통째로 우회된다. pay.controller 주석도 그 점을 적어 뒀었다.
//
// 화면 검증은 안내일 뿐이다 — 요청은 화면을 거치지 않고도 보낼 수 있으므로 **서버가 최종 방어선**이다.
// 두 곳을 함께 못 박는다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 프론트 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');

// ── 화면: 미숙한 입력을 저장 전에 알아차리게 한다 ────────────────────────
const 폼 = 주석제거(프론트('src/pages/manager/products/[edit_category]/[id].js'));
t('판매가를 올리면 정가가 따라간다', /const 할인성립 = useDiscount && 정가 > value/.test(폼),
    "'체크가 꺼져 있을 때만' 이 기준이면, 자동으로 켜진 상태에서 정가가 옛 값에 남는다");
t('할인이 깨지면 체크도 내린다', /if \(useDiscount\) setUseDiscount\(false\)/.test(폼),
    '값과 화면이 어긋난 채로 남지 않게 한다');
t('저장 시 정가 ≤ 판매가를 막는다', /할인 전 가격\(정가\)은 판매가보다 높아야 합니다/.test(폼));
t('판매가 칸이 음수를 안 받는다', /Math\.max\(0, parseInt\(e\.target\.value\.replace/.test(폼));

const 옵션폼 = 주석제거(프론트('src/components/manager/ProductOptionEditor.js'));
t('옵션 편집기에 음수막기가 있다', /const 음수막기 = /.test(옵션폼));
for (const 칸 of ['option_price', 'stock_qty', 'add_price', 'purchase_limit']) {
    t(`'${칸}' 입력이 음수막기를 거친다`,
        new RegExp(`${칸}: 음수막기\\(`).test(옵션폼),
        'type="number" 는 키보드로 치는 - 를 막지 않는다');
}
t('빈 칸은 그대로 둔다', /String\(v \?\? ''\)\.trim\(\) === '' \? ''/.test(옵션폼),
    "재고에서 '비움 = 무제한' 이라는 뜻이 사라지면 안 된다");

// ── 서버: 최종 방어선 ────────────────────────────────────────────────────
if (!백엔드있음) {
    console.log('  건너뜀 — 백엔드 저장소가 없다(서버에는 프론트만 배포된다)');
} else {
    const 백 = (p) => readFileSync(BACK_ROOT + p, 'utf8');
    const 상품 = 주석제거(백('controllers/product.controller.js'));
    t('서버가 가격을 정리한다', /const 가격정리 = /.test(상품));
    t('가격정리를 create·update 양쪽에서 부른다',
        (상품.match(/가격정리\(obj\);/g) ?? []).length === 2,
        '한쪽만 부르면 만들 때는 되는데 고치면 안 되는 버그가 된다');
    t('서버가 정가 < 판매가를 바로잡는다',
        /if \(obj\.product_price < obj\.product_sale_price\) obj\.product_price = obj\.product_sale_price;/.test(상품));
    t('서버가 음수 가격을 막는다', /const 음수없이 = \(v\) => Math\.max\(0,/.test(상품));

    const 옵션 = 주석제거(백('utils.js/product-options.js'));
    t('서버가 옵션 변동가의 음수를 막는다', /option_price: 음수없는정수\(/.test(옵션),
        '음수 옵션 하나면 결제금액 재계산 방어가 통째로 우회된다');
    t('서버가 조합 추가금의 음수를 막는다', /음수없는정수\(c\?\.add_price/.test(옵션));
    t('서버가 음수 재고를 0 으로 접는다', /return isNaN\(n\) \? null : Math\.max\(0, n\);/.test(옵션));
    t('재고 비움은 여전히 무제한이다', /if \(v === '' \|\| v === null \|\| v === undefined\) return null;/.test(옵션),
        '0 으로 접으면 저장하는 순간 전 상품이 품절이 된다');

    // 이미 단단한 것들 — 함께 잠가 둔다(되돌아가면 금액 위조가 열린다).
    const 결제 = 주석제거(백('controllers/pay.controller.js'));
    t('결제금액을 서버가 다시 계산한다', /const recalcOrderAmount = async/.test(결제));
    t('주문 수량이 1 이상인지 본다', /!Number\.isInteger\(count\) \|\| count <= 0/.test(결제));
    t('포인트 잔액을 확인한다', /보유 포인트가 부족합니다/.test(결제));
    t('포인트 사용 상한을 확인한다', /포인트사용상한\(/.test(결제));
    t('재고·필수옵션·구매제한을 서버에서 본다',
        /checkStock|findMissingRequiredOption/.test(결제) && /checkPurchaseLimit/.test(결제));
}

// ── 적립률·수수료 (2026-08-27 2차) ──────────────────────────────────────
//
// 「포인트 적립비율」 칸은 % 인데 값이 그냥 숫자다. '1000원 적립' 으로 오해해 1000 을 치면
// 1,000% 로 읽혀 **결제금액의 열 배가 적립된다.** 위쪽 한도가 아예 없었다.
// 게다가 적립을 세는 곳이 pay.controller 세 자리에 흩어져 정책 함수를 안 거치고 있었다.
const 프론트정책 = 주석제거(프론트('src/data/point-policy.js'));
t('화면 정책에 적립률 상한이 있다', /적립률: Math\.min\(적립상한퍼센트,/.test(프론트정책));
const 설정화면 = 주석제거(프론트('src/pages/manager/settings/default/[brand_id].js'));
t('적립률 칸이 0~100 으로 잘린다',
    /Math\.min\(100, Math\.max\(0, parseInt\(e\.target\.value\)/.test(설정화면));

// ⚠ 총판(users/distributors)은 넣지 않는다. 그 화면의 수수료 칸은 **주석 처리된 죽은 코드**다
//   (206줄부터 <Stack> 통째로 막혀 있다). 처음엔 모르고 거기까지 고쳤다가 되돌렸다 —
//   주석제거를 거친 검사가 '안 고쳤다' 고 알려 줘서 알았다.
//   살아 있는 자리만 센다. 죽은 코드를 고치면 diff 만 늘고 아무것도 달라지지 않는다.
for (const f of ['users/agents', 'users/sellers']) {
    const 화면 = 주석제거(프론트(`src/pages/manager/${f}/[edit_category]/[id].js`));
    t(`${f} 수수료 칸이 음수를 막는다`, /trx_fee'\]: 음수막기\(/.test(화면));
}

if (백엔드있음) {
    const 백2 = (p) => readFileSync(BACK_ROOT + p, 'utf8');
    const 정책 = 주석제거(백2('utils.js/point-policy.js'));
    t('서버 정책에 적립률 상한이 있다', /적립률: Math\.min\(적립상한퍼센트,/.test(정책));
    t('적립 계산이 한 곳에만 있다', (정책.match(/export const 적립예정/g) ?? []).length === 1);

    const 결제2 = 주석제거(백2('controllers/pay.controller.js'));
    t('결제가 적립을 직접 곱하지 않는다', !/point_rate \?\? 0\) \/ 100/.test(결제2),
        '정책 함수를 안 거치면 적립률 상한이 안 걸린다');
    t('적립을 정책 함수로 센다', (결제2.match(/적립예정\(/g) ?? []).length >= 3);

    const 유저 = 주석제거(백2('controllers/user.controller.js'));
    t('서버가 음수 수수료를 막는다',
        (유저.match(/수수료율은 0보다 작을 수 없습니다/g) ?? []).length === 2,
        'create·update 두 자리 모두여야 한다');
    t('서버가 음수 적립률을 막는다',
        (유저.match(/포인트 적립률은 0보다 작을 수 없습니다/g) ?? []).length === 2);

    // 재고·구매제한의 음수 (2026-08-27).
    //
    // 운영 API 로 실제 상품수정을 통과시켜 보다가 나왔다 — 재고에 -10 을 보내면 그대로 저장됐다.
    // 구매는 `stock_qty >= 주문수량` 을 보므로 음수면 그 상품은 영영 안 팔리는데,
    // 화면에는 '품절' 로만 보여서 가맹점이 원인을 알 방법이 없다.
    // 옵션 재고는 막고 있었고(product-options 의 재고()) 상품 자체 재고만 빠져 있었다.
    const 상품2 = 주석제거(백2('controllers/product.controller.js'));
    t('상품 재고·구매제한을 한 함수로 정리한다', /const 수량 = \(v\) =>/.test(상품2),
        '같은 식을 네 자리에 흩어 두면 한쪽만 고쳐진다');
    t('수량() 이 음수를 0 으로 접는다(마지막 방어)', /Math\.max\(0, n\)/.test(상품2));

    // ⚠ 0 으로 접는 것만으로는 부족하다 (2026-08-28 사장님 지적으로 드러남).
    //
    // -10 을 0 으로 바꾸면 DB 에 음수가 남지는 않는다. 그런데 **0 은 '품절'** 이다 —
    // 구매가 `stock_qty >= 주문수량` 을 보기 때문이다. 그래서 가맹점이 -10 을 잘못 넣으면
    // '저장되었습니다' 만 뜨고 그 상품은 조용히 안 팔린다. 고치려던 증상('왜 계속 품절이지?')이
    // 원인만 바꿔 그대로 남아 있었다. 음수는 실수이지 뜻이 아니므로 짐작하지 말고 알려 준다.
    t('말도 안 되는 값을 저장하지 않고 되돌려 보낸다', /const 상품값검사 = /.test(상품2),
        '0 으로 접거나 잘라 넣으면 「저장은 됐는데 왜 이러지」 가 된다');
    t('create·update 두 자리 모두에서 막는다',
        (상품2.match(/상품값검사\(req\.body\)/g) ?? []).length === 2);
    t('막는 자리가 저장보다 앞이다',
        상품2.indexOf('상품값검사(req.body)') < 상품2.indexOf('await insertQuery('),
        '저장한 뒤에 막으면 이미 들어간 뒤다 (import 줄이 아니라 실제 호출과 비교한다)');

    // 무엇을 보는지 하나씩 잠근다. 운영 API 전수 확인(2026-08-28)에서 전부 통과하던 것들이다.
    t('숫자가 아닌 금액을 0 으로 접지 않는다', /const 숫자인가 = /.test(상품2),
        "가격 칸에 문자를 넣으면 0 원으로 저장됐다 — 10,000원 상품이 0원이 된다");
    t('소수점을 조용히 자르지 않는다', /const 정수인가 = /.test(상품2));
    t('상품명 빈 값·공백만을 막는다', /if \(!이름\) return '상품명을 입력해 주세요\.';/.test(상품2));
    t('컬럼 한계를 코드에 적어 둔다', /INT: 2147483647/.test(상품2) && /TINYINT: 127/.test(상품2),
        'DB 가 막아 주더라도 「상품 저장중 에러」로만 보이면 무엇을 고칠지 알 수 없다');
    t('double 컬럼은 우리가 선을 긋는다', /배송비상한/.test(상품2) && /적립상한/.test(상품2),
        '배송비·위탁수수료는 double 이라 DB 가 범위를 안 막는다');
    t('퍼센트 수수료는 100 을 넘지 못한다', /0~100 사이여야 합니다/.test(상품2));
    t('고르는 값(상태·노출·옵션방식)도 본다',
        /option_mode/.test(상품2) && /선택할 수 없는 값이 들어왔습니다/.test(상품2));
    t('빈 칸을 DB 까지 흘려보내지 않는다',
        /'point_save', 'consignment_fee', 'consignment_fee_type'/.test(상품2),
        "적립금 칸을 비우면 Incorrect integer value '' 로 저장 전체가 실패했다");

    const 문구들 = [
        '재고와 1인 구매 수량은 0 이상으로 입력해 주세요.',
        '금액은 숫자로만 입력해 주세요.',
        '금액은 1원 단위로 입력해 주세요.',
        '상품명을 입력해 주세요.',
        '선택할 수 없는 값이 들어왔습니다. 화면을 새로고침한 뒤 다시 해 주세요.',
    ];
    for (const 문구 of 문구들) {
        t(`「${문구.slice(0, 14)}…」 를 조립하지 않는다`, 상품2.includes(`'${문구}'`),
            '서버 메시지는 사전에서 글자 그대로 찾는다 — 템플릿으로 만들면 번역이 안 된다');
    }
    for (const lang of ['ko', 'en', 'ja', 'cn', 'es']) {
        const dict = readFileSync(`src/locales/langs/${lang}.js`, 'utf8');
        t(`${lang} 사전에 저장 실패 문구가 다 있다`,
            문구들.every((문구) => dict.includes(`"${문구}"`)));
    }

    // ── 브랜드 배송비 정책 ────────────────────────────────────────────
    // setting_obj 는 JSON 컬럼이라 DB 가 아무것도 안 막는다. 운영 API 로 확인했더니
    // 배송비 -5,000원과 99,999,999,999원이 그대로 저장됐다. 이 값은 화면 표시뿐 아니라
    // **서버 결제 재계산**(recalcOrderAmount)이 함께 읽어 손님 청구액에 바로 들어간다.
    const 브랜드 = 주석제거(백2('controllers/brand.controller.js'));
    t('배송비 정책 값을 저장 전에 본다',
        /delivery_fee_default', 'free_ship_min'/.test(브랜드),
        'JSON 컬럼이라 DB 가 안 막는다 — 우리가 봐야 한다');
    t('숫자가 아니면 막는다', /배송비 설정은 숫자로만 입력해 주세요\./.test(브랜드));
    t('음수를 막는다', /배송비 설정은 0 이상으로 입력해 주세요\./.test(브랜드));
    t('상한이 있다', /배송비상한/.test(브랜드),
        'double 도 아니고 JSON 이라 값에 끝이 없다');
    t('막는 자리가 저장보다 앞이다',
        브랜드.indexOf("delivery_fee_default', 'free_ship_min'") < 브랜드.indexOf('await updateQuery('),
        '저장한 뒤에 막으면 이미 들어간 뒤다 (import 줄이 아니라 실제 호출과 비교한다)');
    for (const lang of ['ko', 'en', 'ja', 'cn', 'es']) {
        t(`${lang} 사전에 배송비 설정 문구가 있다`,
            readFileSync(`src/locales/langs/${lang}.js`, 'utf8')
                .includes('"배송비 설정은 0 이상으로 입력해 주세요."'));
    }

    // 화면도 막아야 저장 버튼을 누르기 전에 알아차린다.
    // 옵션 재고·구매제한 칸은 막고 있었는데 **상품 자체 재고 칸만** 빠져 있었다.
    const 편집기 = readFileSync('src/components/manager/ProductOptionEditor.js', 'utf8');
    t('재고 칸이 네 곳 모두 음수를 막는다',
        (편집기.match(/stock_qty: 음수막기\(/g) ?? []).length === 4,
        '상품 자체 재고 칸만 빠져 있었다 — 옵션 칸들만 막혀 있었다');
    t('재고 칸에 min=0 이 걸려 있다',
        (편집기.match(/InputProps=\{음수막기속성\}/g) ?? []).length >= 5,
        '숫자 칸의 아래 화살표로도 음수로 못 내려가야 한다');
    t('빈 값은 null 로 둔다', /return null;/.test(상품2),
        '0 으로 접으면 저장하자마자 품절이 된다 — null 이 무제한이다');
    t('create·update 네 자리 모두 수량() 을 쓴다',
        (상품2.match(/수량\(stock_qty\)/g) ?? []).length === 2 &&
        (상품2.match(/수량\(purchase_limit\)/g) ?? []).length === 2);
    t('옛 방식이 남아 있지 않다', !/isNaN\(parseInt\(stock_qty\)\)\) \? null : parseInt\(stock_qty\)/.test(상품2),
        '한 자리라도 남으면 그 경로로 음수가 다시 들어온다');

}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
