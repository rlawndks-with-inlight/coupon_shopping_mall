// 송장 엑셀 등록 — 올린 엑셀에서 「주문번호」·「송장번호」(·「택배사」) 칸을 찾아 줄로 만든다.
// 판정(택배사 붙이기·형식·주문 상태)은 서버 utils.js/invoice-bulk.js 가 한다. 여기서는 읽기만 한다.
// 검사(scripts/checks/invoice-bulk.mjs)가 node 로 직접 불러 돌린다 — 다른 파일을 import 하지 않는다.

const 칸글 = (v) => {
    if (v === null || v === undefined) return '';
    // 엑셀 숫자 칸 — 정수면 그대로 글로. 너무 큰 수는 이미 뒷자리가 사라졌으므로 지수 모양 그대로 넘겨 서버가 거절하게 한다.
    if (typeof v === 'number') return Number.isSafeInteger(v) ? String(v) : String(v);
    return String(v).trim();
};
const 머리찾기 = (줄, 이름) => 줄.findIndex((c) => 칸글(c).replace(/\s/g, '') === 이름);

// aoa = sheet_to_json(..., { header: 1 }) 결과(줄 배열)
// → { 줄들: [{ row, ord_num, invoice, courier }], 빈칸 } 또는 { 오류 }
export const 송장엑셀읽기 = (aoa) => {
    const 표 = Array.isArray(aoa) ? aoa : [];
    // 머리줄은 위쪽 다섯 줄 안에서 찾는다(위에 제목 줄을 붙인 파일도 받는다)
    let 머리 = -1;
    for (let i = 0; i < Math.min(5, 표.length); i++) {
        const 줄 = 표[i] ?? [];
        if (머리찾기(줄, '주문번호') >= 0 && 머리찾기(줄, '송장번호') >= 0) { 머리 = i; break; }
    }
    if (머리 < 0) return { 오류: '「주문번호」와 「송장번호」 칸을 찾지 못했습니다. 「엑셀 내려받기」로 받은 파일에 적어 올려 주세요.' };
    const 머리줄 = 표[머리];
    const 주문칸 = 머리찾기(머리줄, '주문번호');
    const 송장칸 = 머리찾기(머리줄, '송장번호');
    const 택배사칸 = 머리찾기(머리줄, '택배사');
    const 줄들 = [];
    let 빈칸 = 0;
    for (let i = 머리 + 1; i < 표.length; i++) {
        const 줄 = 표[i] ?? [];
        const ord_num = 칸글(줄[주문칸]);
        const invoice = 칸글(줄[송장칸]);
        const courier = 택배사칸 >= 0 ? 칸글(줄[택배사칸]) : '';
        if (!ord_num && !invoice) continue;        // 완전히 빈 줄
        if (!invoice) { 빈칸++; continue; }         // 송장을 안 적은 주문(내려받은 파일 대부분)
        줄들.push({ row: i + 1, ord_num, invoice, courier });
    }
    return { 줄들, 빈칸 };
};
