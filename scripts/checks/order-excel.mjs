import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';
import * as XLSX from 'xlsx';

// 주문내역 엑셀 내려받기.
//
// 붙잡아 두는 것:
//  · 화면의 한 페이지(10건)만 받아 놓고 '다 받았다' 로 보이면 안 된다 — 조용한 누락이다
//  · 건수가 많아 잘랐으면 반드시 알려야 한다(말없이 자르면 장부가 틀어진다)
//  · 열 이름과 순서가 흔들리면 가맹점이 만들어 둔 서식·수식이 깨진다
//  · 이 파일에는 이름·전화·주소가 평문으로 들어간다 — 그 사실이 코드에 적혀 있어야 한다

let pass = 0, fail = 0;
const eq = (n, g, w) => {
    if (JSON.stringify(g) === JSON.stringify(w)) { pass++; console.log('  ok  ' + n); }
    else { fail++; console.log(`FAIL ${n}\n  got : ${JSON.stringify(g)}\n  want: ${JSON.stringify(w)}`); }
};

// ── 시트 만들기는 진짜 함수를 불러 돌린다 ────────────────────────────────
const { 시트만들기, 파일이름 } = await import('file:///' + FRONT_ROOT + 'src/utils/excel-sheet.js');

const 열 = [
    { label: '주문번호', value: (r) => r.ord_num },
    { label: '금액', width: 12, value: (r) => Number(r.amount) || 0 },
    { label: '비고', key: 'note' },
];
const 시트 = 시트만들기(열, [
    { ord_num: 'A-1', amount: '15000', note: null },
    { ord_num: 'A-2', amount: 0 },
]);
const 표 = XLSX.utils.sheet_to_json(시트, { header: 1 });
eq('머리글이 열 순서 그대로', 표[0], ['주문번호', '금액', '비고']);
eq('값이 그대로 들어간다', 표[1], ['A-1', 15000, '']);          // 빈 칸은 '' — undefined 로 두면 열이 밀린다
eq('0 은 빈 칸이 아니다', 표[2], ['A-2', 0, '']);
eq('열 너비를 준다(안 주면 주소가 한 글자씩 보인다)', 시트['!cols'].map((c) => c.wch), [14, 12, 14]);
eq('파일이름에 날짜가 붙는다', 파일이름('주문내역', new Date(2026, 7, 18, 9, 5)), '주문내역_20260818_0905.xlsx');

// ── 화면 배선 ────────────────────────────────────────────────────────────
const src = readFileSync(FRONT_ROOT + 'src/pages/manager/orders/trx/[type].js', 'utf8');
eq('내려받기 버튼이 있다', /엑셀 내려받기/.test(src), true);
eq('창에서 고른 조건 전체를 받는다(2026-11-12 창으로 바뀜)', /\{ \.\.\.조건, page, page_size: 한번에 \}/.test(src), true);
eq('중간에 못 받은 쪽이 있으면 받다 만 파일을 내주지 않는다', /if \(!결과\) \{ toast\.error\(/.test(src), true);
eq('한 페이지만 받고 끝내지 않는다', /if \(줄\.length < 한번에\) break;/.test(src), true);
eq('잘랐으면 알린다', /10,000건까지만 받았습니다/.test(src), true);
eq('누르는 동안 다시 못 누른다', /disabled=\{엑셀중\}/.test(src), true);

// 열 이름과 순서를 못 박는다 — 흔들리면 가맹점 서식이 깨진다.
// 순서는 주문관리 표(OrderColumns.js)와 같다(2026-11-12 사장님 요청, 표 순서 변경 d519c62f 에 맞춤).
const 열이름 = [...src.matchAll(/\{ label: '([^']+)', width/g)].map((m) => m[1]);
eq('엑셀 열 이름·순서(표와 같은 순서)', 열이름, [
    '구매자명', '구매자연락처', '주문상품', '수량', '결제금액', '주문번호', '승인번호', '구매시간',
    '받는사람', '받는사람연락처', '주소',
    // 배송요청사항 — 표에서 주소 바로 아래 노란 칸(2026-08-21 추가)
    '배송요청사항',
    '추가 입력정보', '결제타입', '송장번호', '상태', '취소여부',
    // 실제 취소 시각 — 대조 지연과 무관한 포스페이 기록(2026-11-05 추가)
    '취소시간',
    // 제주·도서산간 추가배송비(2026-11-12 추가)
    '추가배송비 지역', '추가배송비',
    // 「결제실패/미완료」에서 받을 때만 붙는 열 — 맨 뒤(2026-11-04 추가)
    '실패 사유',
]);

// 표 칸 순서와 엑셀 열 순서가 어긋나면 잡는다 — 표가 바뀌었는데 엑셀이 그대로였던 일(2026-11-12)
{
    const 표src = src.slice(src.indexOf('const defaultColumns = ['), src.indexOf('const 엑셀열'));
    const 자리 = (이름) => 표src.indexOf(이름);
    const 표순서 = ['구매자칸', '상품명칸', '수량칸', '금액칸', '주문번호칸', '구매시간칸', '받는사람칸', '주소칸', "label: '결제타입'", "label: '택배사/송장번호'", "label: '상태'"].map(자리);
    const 엑셀순서 = ['구매자명', '주문상품', '수량', '결제금액', '주문번호', '구매시간', '받는사람', '주소', '결제타입', '송장번호', '상태'].map((n) => 열이름.indexOf(n));
    const 오름 = (a) => a.every((v, i) => v >= 0 && (i === 0 || v > a[i - 1]));
    eq('표 칸 순서대로다(구매자→상품→수량→금액→주문번호→구매시간→받는사람→주소→결제타입→송장→상태)', [오름(표순서), 오름(엑셀순서)], [true, true]);
}

// 구매시간은 표와 같은 값 — 승인 시각, 없으면 접수 시각(2026-11-12)
eq('엑셀 구매시간 = 표 구매시간(승인 시각 → 없으면 접수 시각)',
    /label: '구매시간', width: 20, value: \(r\) => `\$\{r\?\.trx_dt \?\? ''\} \$\{r\?\.trx_tm \?\? ''\}`\.trim\(\) \|\| \(r\?\.created_at \?\? ''\)/.test(src), true);

// 개인정보가 실린다는 사실이 코드에 남아 있어야 한다
eq('평문 개인정보 경고가 적혀 있다', /평문/.test(src) && /평문/.test(readFileSync(FRONT_ROOT + 'src/utils/excel.js', 'utf8')), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
