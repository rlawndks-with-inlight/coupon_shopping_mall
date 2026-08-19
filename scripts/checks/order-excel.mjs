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
eq('지금 검색조건 전체를 받는다', /\{ \.\.\.searchObj, page, page_size: 한번에 \}/.test(src), true);
eq('한 페이지만 받고 끝내지 않는다', /if \(줄\.length < 한번에\) break;/.test(src), true);
eq('잘랐으면 알린다', /10,000건까지만 받았습니다/.test(src), true);
eq('누르는 동안 다시 못 누른다', /disabled=\{엑셀중\}/.test(src), true);

// 열 이름과 순서를 못 박는다 — 흔들리면 가맹점 서식이 깨진다
const 열이름 = [...src.matchAll(/\{ label: '([^']+)', width/g)].map((m) => m[1]);
eq('엑셀 열 이름·순서', 열이름, [
    '주문번호', '구매시간', '구매자명', '구매자연락처', '받는사람', '받는사람연락처',
    '주소', '주문상품', '추가 입력정보', '결제금액', '결제타입', '상태', '송장번호', '취소여부',
]);

// 개인정보가 실린다는 사실이 코드에 남아 있어야 한다
eq('평문 개인정보 경고가 적혀 있다', /평문/.test(src) && /평문/.test(readFileSync(FRONT_ROOT + 'src/utils/excel.js', 'utf8')), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
