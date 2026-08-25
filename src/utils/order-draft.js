// 주문서에 쓰다 만 내용을 잠깐 붙들어 둔다.
//
// [무엇이 문제였나]
// 주문자 정보·배송지는 OrderSheet 의 useState 에만 있다. 그래서 그 화면을 벗어났다
// 돌아오면 **무조건 백지**다. 손님은 이름·연락처·받는분·주소를 처음부터 다시 친다.
//
// 벗어나는 길이 한둘이 아니다 —
//   · 결제창(PG)으로 갔다가 취소·실패로 돌아옴
//   · 회원가입/로그인 유도를 눌렀다가 돌아옴
//   · 새로고침, 뒤로가기
//   · 모바일에서 다른 앱(은행·카드)에 다녀오는 사이 탭이 정리됨
// 가맹점 제보는 '비회원 주문 비밀번호를 안 넣었을 때'였지만, 원인이 무엇이든
// 되돌아오면 지워지는 것은 같다. 그래서 트리거를 쫓지 않고 값을 붙들어 둔다.
//
// [무엇을 저장하지 않는가]
// 카드번호·카드비밀번호·유효기간·인증번호·PG키, 그리고 **비회원 주문 비밀번호**.
// 결제완료 화면으로 넘기는 lastOrder 와 같은 기준이다. 비밀번호는 다시 치게 하는 것이
// 맞다 — 편의보다 앞선다. 손님이 다시 쓰는 것은 그 한 칸뿐이다.
//
// sessionStorage 를 쓴다. 탭을 닫으면 사라지므로 공용 PC 에 남지 않는다.

const 열쇠 = 'orderDraft';

// 저장하면 안 되는 칸. lastOrder 와 같은 목록 + 계산으로 다시 나오는 값.
const 제외 = [
    'card_num', 'card_pw', 'yymm', 'auth_num', 'pay_key', 'mid', 'tid',
    'payment_modules', 'password',
    // 아래는 매번 새로 만들어야 한다. 남겨 두면 지난 주문번호로 결제가 시도된다.
    'ord_num', 'products', 'amount', 'item_name',
];

export const saveOrderDraft = (payData, 화면상태) => {
    try {
        const 남길것 = { ...(payData ?? {}) };
        for (const k of 제외) delete 남길것[k];
        sessionStorage.setItem(열쇠, JSON.stringify({ payData: 남길것, 화면상태: 화면상태 ?? {} }));
    } catch (e) { /* 사생활 보호 모드 등 — 못 저장해도 주문은 그대로 된다 */ }
};

export const loadOrderDraft = () => {
    try {
        const raw = sessionStorage.getItem(열쇠);
        if (!raw) return null;
        const 것 = JSON.parse(raw);
        if (!것 || typeof 것 !== 'object' || !것.payData) return null;
        // 저장된 뒤 코드가 바뀌어 모양이 안 맞을 수 있다 — 이상하면 없는 셈 친다.
        const p = { ...것.payData };
        for (const k of 제외) delete p[k];
        return { payData: p, 화면상태: 것.화면상태 ?? {} };
    } catch (e) { return null; }
};

// 주문이 접수되면 지운다. 안 지우면 다음 주문서에 지난 주문의 배송지가 그대로 뜬다.
export const clearOrderDraft = () => {
    try { sessionStorage.removeItem(열쇠); } catch (e) { /* noop */ }
};
