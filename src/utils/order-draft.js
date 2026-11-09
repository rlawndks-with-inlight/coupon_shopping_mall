// 결제에 실패·취소한 주문서를 「다시 결제하기」로 되살리는 장치.
//
// [규칙 — 2026-11-09 사장님 결정 + 같은 날 가맹점 기준]
// 주문서는 열 때마다 빈칸(회원은 회원정보)으로 시작한다. 입력값이 다시 채워지는 경우는 셋뿐이다.
//  · 결제창을 닫거나 취소함   → 결과 화면 없이 그 주문서로 바로 돌아와 채운다
//  · 결제 실패·확인 지연      → 결과 화면 「다시 결제하기」를 눌렀을 때만 채운다
//  · 주문서를 새로고침함      → 그대로 남는다(아래 '새로고침용')
// 뒤로 가기·다른 화면 이동은 사라진다 — 주문서가 먼저 확인 창을 띄운다.
//
// [왜 바꿨나]
// 8/25 에 "결제창에서 돌아오면 다시 써야 한다" 는 제보로 '화면을 벗어나도 늘 남기기' 로 만들었는데,
// 9/11·11/9 두 번 "주문을 마치고 새로 주문하는데 지난 손님 정보가 나온다" 는 지적을 받았다
// (탭이 여럿이면 결제 완료가 다른 탭의 초안을 못 지운다). 남기는 범위를 '그 주문의 재결제' 로 좁혔다.
//
// [흐름]
//  1. 주문서 「결제하기」 → saveRetryDraft(주문번호 없이 '대기' 로 저장)
//  2. shop-util 이 주문을 만든 직후, 결제창으로 넘어가기 전 → stampRetryDraft(ord_num)
//  3. 결과 화면이 실패·취소면 peekRetryDraft(ord_num) 로 확인해 「다시 결제하기」를 보인다
//  4. 주문서가 ?retry=ord_num 으로 열리면 takeRetryDraft(ord_num) 로 채운다
//  5. 그 밖의 경로로 주문서를 열거나 결제가 끝나면 clearOrderDraft()
//
// [무엇을 저장하지 않는가]
// 카드번호·카드비밀번호·유효기간·인증번호·PG키, 그리고 **비회원 주문 비밀번호**.
// 결제완료 화면으로 넘기는 lastOrder 와 같은 기준이다. 약관 동의도 되살리지 않는다.
//
// sessionStorage 를 쓴다. 그 탭에서만 보이고, 탭을 닫으면 사라진다.

const 열쇠 = 'orderRetry';
// 예전 '늘 남기기' 가 쓰던 자리 — 남아 있으면 같이 지운다.
const 옛열쇠 = 'orderDraft';

// 저장하면 안 되는 칸. lastOrder 와 같은 목록 + 계산으로 다시 나오는 값.
const 제외 = [
    'card_num', 'card_pw', 'yymm', 'auth_num', 'pay_key', 'mid', 'tid',
    'payment_modules', 'password',
    // 아래는 매번 새로 만들어야 한다. 남겨 두면 지난 주문번호로 결제가 시도된다.
    'ord_num', 'products', 'amount', 'item_name',
];

// 「결제하기」를 누르고 주문번호가 달리기까지의 틈. 이보다 오래된 '대기' 는 다른 주문의 것이다.
const 대기한도 = 2 * 60 * 1000;

const 읽기 = () => {
    try {
        const raw = sessionStorage.getItem(열쇠);
        if (!raw) return null;
        const 것 = JSON.parse(raw);
        if (!것 || typeof 것 !== 'object' || !것.payData || typeof 것.payData !== 'object') return null;
        return 것;
    } catch (e) { return null; }
};

const 거르기 = (payData) => {
    const 남길것 = { ...(payData ?? {}) };
    for (const k of 제외) delete 남길것[k];
    return 남길것;
};

// 결제창으로 넘어가기 직전에 한 번 담는다(주문번호는 아직 없다).
export const saveRetryDraft = (payData, 화면상태, buynow) => {
    try {
        sessionStorage.removeItem(옛열쇠);
        sessionStorage.setItem(열쇠, JSON.stringify({
            payData: 거르기(payData),
            화면상태: 화면상태 ?? {},
            buynow: !!buynow,
            ord_num: '',
            at: Date.now(),
        }));
    } catch (e) { /* 사생활 보호 모드 등 — 못 저장하면 「다시 결제하기」 없이 장바구니로 안내된다 */ }
};

// 주문이 만들어졌으면 그 주문번호를 단다. 방금 담은 '대기' 에만 단다.
export const stampRetryDraft = (ord_num) => {
    try {
        const 것 = 읽기();
        if (!것 || 것.ord_num || !ord_num) return;
        if (!(Date.now() - Number(것.at || 0) < 대기한도)) return;
        sessionStorage.setItem(열쇠, JSON.stringify({ ...것, ord_num: String(ord_num) }));
    } catch (e) { /* noop */ }
};

// 결과 화면용 — 이 주문의 입력값이 남아 있으면 { buynow } 를 돌려준다.
export const peekRetryDraft = (ord_num) => {
    const 것 = 읽기();
    if (!것 || !ord_num || 것.ord_num !== String(ord_num)) return null;
    return { buynow: !!것.buynow };
};

// 주문서용 — 「다시 결제하기」로 온 주문번호와 맞을 때만 돌려준다.
// 지우지 않는다: 다시 결제하기 주문서에서 새로고침해도 채워져 있어야 한다.
// (다음 결제를 누르면 saveRetryDraft 가 덮어쓰고, 결제가 끝나면 clearOrderDraft 가 지운다)
export const takeRetryDraft = (ord_num) => {
    const 것 = 읽기();
    if (!것 || !ord_num || 것.ord_num !== String(ord_num)) return null;
    return { payData: 거르기(것.payData), 화면상태: 것.화면상태 ?? {} };
};

// ── 새로고침용 ───────────────────────────────────────────────────────────
// 가맹점 기준(2026-11-09): 새로고침하면 남고, 뒤로 가기·다른 화면 이동이면 사라진다.
// 주문서는 쓰는 동안 계속 담고(주소 포함), **그 주문서 문서를 새로고침했을 때만**(또는 결제창에서 뒤로 가기로
// 그 주문서로 돌아왔을 때만) 주문서가 꺼낸다 — 판단은 OrderSheet 가 브라우저 탐색 기록으로 한다.
// 자리는 예전 '늘 남기기' 자리(orderDraft)를 그대로 쓴다.
export const saveSessionDraft = (payData, 화면상태, 주소) => {
    try {
        sessionStorage.setItem(옛열쇠, JSON.stringify({ payData: 거르기(payData), 화면상태: 화면상태 ?? {}, 주소: String(주소 ?? '') }));
    } catch (e) { /* noop */ }
};

export const takeSessionDraft = (주소) => {
    try {
        const raw = sessionStorage.getItem(옛열쇠);
        if (!raw) return null;
        const 것 = JSON.parse(raw);
        if (!것 || typeof 것 !== 'object' || !것.payData || typeof 것.payData !== 'object') return null;
        // 다른 주문서(장바구니 ↔ 바로구매)의 값이면 꺼내지 않는다
        if (!주소 || 것.주소 !== String(주소)) return null;
        return { payData: 거르기(것.payData), 화면상태: 것.화면상태 ?? {} };
    } catch (e) { return null; }
};

export const clearOrderDraft = () => {
    try { sessionStorage.removeItem(열쇠); sessionStorage.removeItem(옛열쇠); } catch (e) { /* noop */ }
};
