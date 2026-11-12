// 무통장·상품권·수기처럼 사람이 확인해야 결제완료가 되는 수단이 하나라도 있는가.
// 주문관리 메뉴(「결제대기(입금확인)」을 둘지)와 엑셀 내려받기 창의 상태 목록이 같이 쓴다 — 둘이 어긋나면
// 메뉴에 없는 상태가 엑셀 창에만 보이거나 그 반대가 된다.
export const 입금대기수단있음 = (dns) => (dns?.payment_modules ?? []).some((m) =>
  ['virtual_account', 'gift_certificate', 'hand_oleuda', 'card', 'card_fintree'].includes(m?.type) || [1, 3, 5, 10, 11].includes(Number(m?.trx_type)));
