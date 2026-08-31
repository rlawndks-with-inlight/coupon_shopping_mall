import { FRONT_ROOT, 주석제거 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 쓰다 만 주문서를 붙들어 두는 장치 + 비회원 회원가입 유도.
//
// [가맹점 제보 두 건 — 2026-08-25]
//  ① "비회원 주문 비밀번호를 안 넣으면 주문자 정보·배송지가 원복돼 다시 써야 한다."
//  ② "회원가입 유도가 바로구매에서 한 번만 뜨고, 장바구니→주문하기 에서는 아예 안 뜬다.
//     그냥 계속 유도해 달라."
//
// ①은 트리거를 재현하지 못했다(guardBeforePay 가 막는 것만으로는 값이 안 지워진다 —
// 로컬에서 직접 확인했다). 다만 구조는 분명하다: 주문자 정보·배송지는 OrderSheet 의
// useState 에만 있어서 **화면을 벗어났다 돌아오면 무조건 백지**다. 결제창 취소, 회원가입
// 유도, 새로고침, 뒤로가기 — 길이 여럿이라 트리거를 쫓는 대신 값을 붙들어 둔다.
//
// ⚠ 붙들어 두되 **카드정보와 비회원 주문 비밀번호는 저장하지 않는다**.
//   편의보다 앞선다. 이 검사가 지키는 것도 그것이다.

let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
    if (cond) { pass++; console.log('  ok  ' + name); }
    else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};
const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');

// ── 초안 저장 도구를 실제로 돌린다 ───────────────────────────────────────
const draft소스 = 읽기('src/utils/order-draft.js');
// sessionStorage 를 가짜로 끼워 넣고 실제 함수를 돌린다.
const 만들기 = () => {
    const 창고 = new Map();
    const mod = new Function('sessionStorage',
        draft소스.replace(/export const /g, 'const ')
        + '\nreturn { saveOrderDraft, loadOrderDraft, clearOrderDraft };'
    )({
        getItem: (k) => (창고.has(k) ? 창고.get(k) : null),
        setItem: (k, v) => 창고.set(k, String(v)),
        removeItem: (k) => 창고.delete(k),
    });
    return { ...mod, 창고 };
};

const 원본 = {
    brand_id: 130, buyer_name: '홍길동', buyer_phone: '010-1234-5678',
    receiver: '홍길동', addr_phone: '010-1234-5678',
    addr: '경기 부천시 원미구 길주로 64', detail_addr: '101동 202호', zonecode: '14547',
    delivery_memo: '문 앞에 놔주세요', country_code: 'KR', use_point: 0,
    // 아래는 절대 저장되면 안 되는 것들
    password: 'guest1234', card_num: '4111111111111111', card_pw: '12',
    yymm: '12/28', auth_num: '900101', pay_key: 'k', mid: 'm', tid: 't',
    payment_modules: { id: 1 },
    // 매번 새로 만들어야 하는 것들
    ord_num: 'FS20260825ABC', amount: 30000, item_name: '떡갈비', products: [{ id: 1 }],
};

{
    const { saveOrderDraft, loadOrderDraft } = 만들기();
    saveOrderDraft(원본, { addrMode: 'KR', directMode: true, sameAsBuyer: false });
    const 다시 = loadOrderDraft();

    t('되살린 것이 있다', !!다시 && !!다시.payData);
    // 손님이 다시 치지 않아도 되는 것들
    for (const k of ['buyer_name', 'buyer_phone', 'receiver', 'addr_phone', 'addr', 'detail_addr', 'zonecode', 'delivery_memo']) {
        t(`${k} 가 되살아난다`, 다시.payData[k] === 원본[k]);
    }
    // 절대 저장하면 안 되는 것들
    for (const k of ['password', 'card_num', 'card_pw', 'yymm', 'auth_num', 'pay_key', 'mid', 'tid', 'payment_modules']) {
        t(`${k} 는 저장되지 않는다`, 다시.payData[k] === undefined,
            k === 'password' ? '비회원 주문 비밀번호다 — 편의보다 앞선다' : '결제 민감정보다');
    }
    // 매번 새로 만들어야 하는 것들
    for (const k of ['ord_num', 'amount', 'item_name', 'products']) {
        t(`${k} 는 되살리지 않는다`, 다시.payData[k] === undefined,
            k === 'ord_num' ? '지난 주문번호로 결제가 시도된다' : '금액·상품은 서버 값으로 다시 계산한다');
    }
    t('화면 상태(배송지 모드)도 함께 되살린다',
        다시.화면상태.addrMode === 'KR' && 다시.화면상태.directMode === true && 다시.화면상태.sameAsBuyer === false);
}
// 저장된 문자열 자체에도 남으면 안 된다(객체만 걸러내고 저장은 통째로 하는 실수 방지)
{
    const { saveOrderDraft, 창고 } = 만들기();
    saveOrderDraft(원본, {});
    const 날것 = 창고.get('orderDraft') ?? '';
    t('저장된 문자열에 비밀번호가 없다', !날것.includes('guest1234'));
    t('저장된 문자열에 카드번호가 없다', !날것.includes('4111111111111111'));
}
// 지우기
{
    const { saveOrderDraft, loadOrderDraft, clearOrderDraft } = 만들기();
    saveOrderDraft(원본, {});
    clearOrderDraft();
    t('지우면 되살릴 것이 없다', loadOrderDraft() === null,
        '안 지우면 다음 주문서에 지난 배송지가 그대로 뜬다');
}
// 망가진 값
{
    const { loadOrderDraft, 창고 } = 만들기();
    창고.set('orderDraft', '{망가진');
    t('깨진 값이면 없는 셈 친다', loadOrderDraft() === null);
    창고.set('orderDraft', '{"화면상태":{}}');
    t('payData 가 없으면 없는 셈 친다', loadOrderDraft() === null);
}
{
    const { saveOrderDraft, loadOrderDraft } = 만들기();
    saveOrderDraft(undefined, undefined);
    t('빈 값을 넣어도 죽지 않는다', loadOrderDraft() !== undefined);
}

// ── OrderSheet 가 실제로 쓰는가 ──────────────────────────────────────────
const sheet = 읽기('src/views/shop/order/OrderSheet.js');
t('주문서가 초안을 되살린다', /const 초안 = loadOrderDraft\(\)/.test(sheet));
t('주문서가 초안을 저장한다', /saveOrderDraft\(payData, \{ addrMode, directMode, sameAsBuyer \}\)/.test(sheet));
t('복원이 끝나기 전에는 저장하지 않는다', /if \(!초안복원끝\) return;/.test(sheet),
    '빈 초기값으로 초안을 덮어쓰면 되살릴 것이 없어진다');
// ⚠ 이 표시는 ref 가 아니라 state 여야 한다.
//   ref 는 그 자리에서 바로 true 가 되므로, 같은 커밋에서 이어 도는 저장 useEffect 가
//   아직 반영되지 않은 **빈 초기값**을 초안에 덮어쓴다. StrictMode 는 마운트를 두 번
//   하는데, 두 번째 마운트가 그 빈 초안을 읽어 아무것도 못 되살린다.
//   실제로 ref 로 만들었다가 로컬 확인에서 값이 전부 날아가는 걸 보고 고쳤다.
t('복원 표시를 state 로 둔다', /const \[초안복원끝, set초안복원끝\] = useState\(false\)/.test(sheet),
    'useRef 로 두면 같은 커밋에서 빈 값이 초안을 덮어쓴다');
t('저장 useEffect 가 복원 표시를 의존성으로 가진다', /\[초안복원끝, payData, addrMode, directMode, sameAsBuyer\]/.test(sheet),
    '빼면 복원 직후의 값이 저장되지 않는다');
t('초안이 없어도 저장은 시작된다', /set초안복원끝\(true\);\s*\}, \[\]\);/.test(sheet),
    '표시를 if 안에 두면 초안이 없는 첫 방문에는 아무것도 저장되지 않는다');
// 접수/결제 완료 두 자리 모두에서 지워야 한다.
t('주문 접수·결제 완료 시 초안을 지운다', (sheet.match(/clearOrderDraft\(\);/g) ?? []).length >= 2,
    '무통장·상품권(finishPendingOrder)과 수기카드 두 곳 다 필요하다');
t('약관 동의는 되살리지 않는다', !/setAgree1\(.*초안|초안.*agree/.test(sheet),
    '동의는 그때마다 사람이 직접 눌러야 한다');

// ── 회원가입 유도 ────────────────────────────────────────────────────────
const prompt = 읽기('src/components/elements/shop/GuestSignupPrompt.js');
const util = 읽기('src/utils/guest-prompt.js');
const shop = 읽기('src/utils/shop-util.js');

// 주문서에서는 권하지 않는다. 넣었다가 걷어냈다(2026-08-25) —
// 이름·연락처·배송지를 다 쓰고 비회원 주문 비밀번호까지 정한 뒤에 물으면 방해로만 읽힌다.
// 유도는 그 앞 단계(담기·바로구매)에서 이미 한다. 그 둘을 거치지 않고 주문서에 닿는 길은 없다.
t('주문서에서는 유도하지 않는다', !/askGuestSignup\(/.test(주석제거(sheet)),
    '주문서까지 온 손님을 붙잡으면 유도가 아니라 이탈이 된다');
t('장바구니 담기에서 유도한다', /if \(!\(await askGuestSignup\(\)\)\) return false;/.test(shop));
t('담기·바로구매 두 길목 모두에 있다', (shop.match(/await askGuestSignup\(\)/g) ?? []).length === 2);

// '한 번만 묻기'가 되살아나지 않게 못 박는다.
t('그만묻기 상태가 남아 있지 않다', !/그만묻/.test(prompt) && !/그만묻기설정|그만묻나/.test(util),
    '가맹점 요청은 매번 묻는 것이다 — 되살리면 요청이 되돌아간다');
// 주석은 빼고 본다 — '예전엔 sessionStorage 를 썼다'는 이력이 주석에 남아 있고,
// 그 이력은 남아 있어야 한다(다시 만들지 말라는 경고다).
// 주석제거는 _roots.mjs 의 공용 도구다 — 직접 짜면 CRLF 파일에서 조용히 샌다.
t('sessionStorage 로 유도를 끄지 않는다',
    !/sessionStorage/.test(주석제거(prompt)) && !/sessionStorage/.test(주석제거(util)));
t('유도 창은 로그인 상태를 확인한 뒤에만 뜬다', /if \(!준비됨 \|\| 지금유저\) \{ resolve\(true\); return; \}/.test(prompt),
    '세션 복원 전에는 로그인한 손님에게도 창이 뜬다');

// 「비회원으로 계속」은 절대 빠지면 안 된다 — 없으면 비회원 구매가 막힌다.
t('「비회원으로 계속」 버튼이 있다', /비회원으로 계속/.test(prompt));
t('어떻게 닫혀도 반드시 응답한다', /onClose=\{바깥닫기\}/.test(prompt),
    '응답을 안 하면 담기가 영영 안 끝난다');
// 바깥 닫기는 '계속' 이 아니다 — 제보(2026-08-31, 모바일): 창 밖을 눌렀더니 주문서로 넘어갔다.
// 예전엔 onClose 가 비회원으로() 였다. 자세한 사연은 guest-prompt.mjs 에 있다.
t('바깥을 눌러 닫으면 진행하지 않는다', /const 바깥닫기 = \(\) => \{ 닫기\(false\); \};/.test(prompt),
    'onClose 를 비회원으로() 에 다시 묶으면 창만 닫으려던 손님이 주문서로 넘어간다');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
