import * as XLSX from 'xlsx';

// 시트를 만드는 순수한 부분. file-saver 를 끌어오지 않는다 —
// 그건 브라우저(DOM)가 필요해서, 여기 섞이면 검사에서 이 로직을 돌려볼 수 없다.

// 배열(객체들)을 시트로. 열 순서와 이름은 columns 로 정한다.
//   columns: [{ label, width, key | value(row) }]
export const 시트만들기 = (columns, rows) => {
    const 머리 = columns.map((c) => c.label);
    const 몸통 = (rows ?? []).map((r) => columns.map((c) => {
        const v = typeof c.value === 'function' ? c.value(r) : r?.[c.key];
        return v === null || v === undefined ? '' : v;
    }));
    const sheet = XLSX.utils.aoa_to_sheet([머리, ...몸통]);
    // 열 너비를 안 주면 전부 8칸이라 주소·옵션이 한 글자씩 보인다.
    sheet['!cols'] = columns.map((c) => ({ wch: c.width ?? 14 }));
    return sheet;
};

// 파일명에 날짜를 붙인다 — 같은 이름으로 여러 번 받으면 어느 게 어느 시점인지 알 수 없다.
export const 파일이름 = (이름, 지금 = new Date()) => {
    const p = (n) => String(n).padStart(2, '0');
    return `${이름}_${지금.getFullYear()}${p(지금.getMonth() + 1)}${p(지금.getDate())}`
        + `_${p(지금.getHours())}${p(지금.getMinutes())}.xlsx`;
};
