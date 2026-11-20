// 부분취소에서 추가상품 줄 다루기(2026-11-20).
//
// 추가상품은 본상품 없이 못 산다(주문서·서버 recalcOrderAmount 규칙). 그런데 취소는 줄마다 따로라
// 본상품만 다 취소하면 소스·포장 같은 추가상품 줄만 남아 그것만 발송됐다.
// 그래서 같은 상품의 본상품 줄을 모두(남은 수량 전부) 고르면 그 상품의 추가상품 줄도 남은 수량 전부를 함께 고른다.
// 서버(cancel.js 추가상품함께)도 같은 규칙으로 한 번 더 채운다 — 이 함수는 화면이 금액을 미리 맞게 보여 주려고 쓴다.

// 추가상품 줄인가 — 관리자 창은 서버가 is_addon 을 주고, 손님 화면은 줄의 groups(주문 때 스냅샷)에 addon_line 이 있다.
export const 추가상품줄인가 = (line) => {
  if (line?.is_addon !== undefined) return !!line.is_addon;
  const g = line?.groups ?? line?.order_groups;
  return Array.isArray(g) && g.some((x) => Number(x?.addon_line) === 1);
};

// lines: 주문 줄들, 키(line) → 줄 id, 남은(line) → 남은 수량, 고른(line) → 지금 고른 수량
// 반환: { [줄 id]: 남은 수량 } — 함께 취소되는 추가상품 줄. 본상품 줄을 못 찾는 추가상품(옛 주문)은 넣지 않는다.
export const 함께취소할추가상품 = (lines, { 키, 남은, 고른 }) => {
  const 결과 = {};
  const 목록 = Array.isArray(lines) ? lines : [];
  for (const a of 목록) {
    if (!추가상품줄인가(a) || !(남은(a) > 0)) continue;
    const 본상품들 = 목록.filter((m) => !추가상품줄인가(m) && Number(m?.product_id) === Number(a?.product_id));
    if (!본상품들.length) continue;
    if (본상품들.every((m) => 고른(m) >= 남은(m))) 결과[키(a)] = 남은(a);
  }
  return 결과;
};
