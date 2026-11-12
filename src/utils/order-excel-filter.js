import { isShopgoMerchant } from './is-shopgo.js';
import { 입금대기수단있음 } from './order-menu.js';

// 주문 엑셀 내려받기 창(OrderExcelDialog)의 고르는 규칙.
// 상태 열쇠는 서버 transaction.controller 의 엑셀상태조건과 같다. 열쇠마다 관리자 메뉴 하나와 같은 조건이다.
// 상대경로로만 불러온다 — 검사 스크립트가 node 로 이 파일을 직접 불러 돌린다.

// 이 가맹점에 보이는 상태 메뉴와 같은 목록(config-navigation 의 주문관리 메뉴 규칙을 따른다)
export const 엑셀상태목록 = (dns) => {
    const 샵고 = isShopgoMerchant(dns);
    const 창고단계 = Number(dns?.id) !== 5;
    return [
        ...(샵고
            ? (입금대기수단있음(dns) ? [{ key: 'waiting', label: '결제대기(입금확인)' }] : [])
            : [{ key: '0', label: '결제대기' }]),
        { key: '5', label: '결제완료' },
        ...(창고단계 && !샵고 ? [{ key: '10', label: '입고완료' }] : []),
        ...(창고단계 ? [{ key: '15', label: '출고완료' }] : []),
        { key: '20', label: '배송중' },
        { key: '25', label: '배송완료' },
        { key: '1', label: '취소요청' },
        { key: 'cancelled', label: '취소완료' },
        { key: 'failed', label: '결제실패/미완료' },
    ];
};

// 지금 보는 메뉴(주소의 type)와 같은 상태 묶음 — 창을 열면 이것이 체크돼 있다.
//   전체: 샵고 가맹점은 결제된 주문 + 취소된 주문(서버 kind=settled), 그 밖 가맹점은 취소되지 않은 주문 전부
export const 메뉴상태 = (type, dns) => {
    const 목록 = 엑셀상태목록(dns).map((s) => s.key);
    if (type === 'failed') return ['failed'];
    if (type == '0') return [isShopgoMerchant(dns) ? 'waiting' : '0'];
    if (type && type !== 'all') return [String(type)];
    return isShopgoMerchant(dns)
        ? 목록.filter((k) => !['waiting', '0', 'failed'].includes(k))
        : 목록.filter((k) => k !== 'cancelled');
};

const 두자리 = (n) => String(n).padStart(2, '0');
export const 날글 = (d) => (d ? `${d.getFullYear()}-${두자리(d.getMonth() + 1)}-${두자리(d.getDate())}` : '');
// 표 위 날짜 버튼과 같은 범위(ManagerTable 기간고르기)
export const 기간범위 = (key) => {
    const 날 = (뒤로) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - 뒤로); return d; };
    const 달전 = (n) => { const d = 날(0); d.setMonth(d.getMonth() - n); return d; };
    return {
        today: [날(0), 날(0)],
        yesterday: [날(1), 날(1)],
        week: [날(6), 날(0)],
        month: [달전(1), 날(0)],
        quarter: [달전(3), 날(0)],
        all: [null, null],
    }[key];
};
export const 기간버튼 = [['today', '오늘'], ['yesterday', '어제'], ['week', '7일'], ['month', '1개월'], ['quarter', '3개월'], ['all', '전체 기간']];

// 서버로 보낼 조건 — 화면 목록 조건(kind·trx_status·cancel_status)은 싣지 않는다. statuses 가 그것을 대신한다.
export const 엑셀조건 = ({ s_dt, e_dt, statuses, search }) => ({
    s_dt: s_dt || '',
    e_dt: e_dt || '',
    search: search || '',
    statuses: statuses.join(','),
});

// 상태 열쇠 → 이름(엑셀 내려받기 기록 화면이 조건을 글로 보여 줄 때)
export const 상태이름표 = {
    waiting: '결제대기(입금확인)', 0: '결제대기', 5: '결제완료', 10: '입고완료', 15: '출고완료',
    20: '배송중', 25: '배송완료', 1: '취소요청', cancelled: '취소완료', failed: '결제실패/미완료',
};
