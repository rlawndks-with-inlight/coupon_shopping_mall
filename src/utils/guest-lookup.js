// 비회원 주문조회 입구를 하나로(2026-11-12 가맹점 지적).
//
// 로그인 화면(프레임 1~9)에도 비회원 조회 칸이 따로 있었는데, 그 자리에서 결과를 그려
// 여러 건이어도 최근 한 건만 보였고 취소요청·후기가 없었다 — 「로그인에 있는 비회원 주문조회로는 취소 불가」.
// 이제 어느 입구든 「비회원 주문조회」(/shop/auth/order-check) 한 화면으로 보낸다.
//
// 비밀번호는 주소에 싣지 않는다(방문기록·서버 로그에 남는다) — 이 탭의 sessionStorage 에 잠깐 두고,
// 받는 화면이 꺼내는 즉시 지운다. 5분이 지난 것은 쓰지 않는다.
// 주문번호(ord)는 비밀이 아니라 주소에 싣는다 — 결제 직후 그 주문 상세를 바로 열 때 쓴다.

const 열쇠 = 'guestLookup';
const 유효시간 = 5 * 60 * 1000;

export const 비회원조회주소 = (ord_num) => (
    ord_num ? `/shop/auth/order-check?ord=${encodeURIComponent(String(ord_num))}` : '/shop/auth/order-check'
);

// 입력한 전화번호·비밀번호를 들고 비회원 주문조회 화면으로 간다. 둘 다 있을 때만 그 화면이 바로 조회한다.
export const 비회원조회로 = (router, { buyer_phone = '', password = '' } = {}, ord_num) => {
    try {
        if (buyer_phone || password) {
            sessionStorage.setItem(열쇠, JSON.stringify({ buyer_phone: String(buyer_phone), password: String(password), at: Date.now() }));
        }
    } catch (e) { /* 저장이 막힌 브라우저 — 빈 칸으로 열리고 손님이 다시 넣는다 */ }
    router.push(비회원조회주소(ord_num));
};

// 비회원 주문조회 화면이 처음 열릴 때 한 번 부른다. 꺼내면서 지운다.
export const 비회원조회꺼내기 = () => {
    try {
        const raw = sessionStorage.getItem(열쇠);
        sessionStorage.removeItem(열쇠);
        if (!raw) return null;
        const 값 = JSON.parse(raw);
        if (!값 || Date.now() - Number(값.at || 0) > 유효시간) return null;
        return { buyer_phone: String(값.buyer_phone ?? ''), password: String(값.password ?? '') };
    } catch (e) {
        return null;
    }
};
