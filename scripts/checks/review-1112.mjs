import { readFileSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';

// 2026-11-12 하루치 변경 사후 점검에서 고친 낮은 항목들(사장님 「같이 고쳐라」).
//   ① 엑셀 내려받기 기록의 IP 는 요청한 쪽이 못 바꾸는 값(XFF 오른쪽에서 두 번째)
//   ② 딱 10,000건이면 「잘렸다」고 알리지 않는다
//   ③ 「배송 안 함 지역」 표시는 가맹점이 손댈 주문(결제대기·결제완료·입고)에만
//   ④ 해외배송 나라 필수 검사는 입력 폼이 보이는 모든 경우(비회원 포함)
//   ⑤ 가이드: 목록 맨 왼쪽은 체크칸

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };
const 읽기 = (root, p) => 주석제거(readFileSync(root + p, 'utf8').replace(/\r/g, ''));

if (백엔드있음) {
    const 기록 = 읽기(BACK_ROOT, 'controllers/excel_log.controller.js');
    t('① 엑셀 기록 IP: XFF 맨 왼쪽을 쓰지 않는다', !/split\(','\)\[0\]/.test(기록) && /xff\[xff\.length - 2\]/.test(기록));
}
const 목록 = 읽기(FRONT_ROOT, 'src/pages/manager/orders/trx/[type].js');
t('② 잘림 안내는 남은 주문이 있을 때만', /잘림 = page > 20 && !\(전체 > 0 && 전체 <= 모은것\.length\)/.test(목록) && /전체 = Number\(결과\?\.total\) \|\| 전체/.test(목록));
const 칸 = 읽기(FRONT_ROOT, 'src/components/manager/OrderColumns.js');
t('③ 배송 안 함 표시는 결제대기·결제완료·입고 주문에만', /\[0, 5, 10\]\.includes\(Number\(row\?\.trx_status\)\) && !포스페이미승인\(row\)/.test(칸) && /const 막힘 = 손댈주문 && /.test(칸));
const 주문서 = 읽기(FRONT_ROOT, 'src/views/shop/order/OrderSheet.js');
t('④ 해외 나라 필수는 비회원에게도', /const 입력폼 = directMode \|\| !\(user && \(addressContent\?\.content \?\? \[\]\)\.length > 0\);/.test(주문서) && /if \(입력폼 && !isKR && !String\(payData\.country_name/.test(주문서));
const 가이드 = readFileSync(FRONT_ROOT + 'src/components/manager/guideContent.js', 'utf8');
t('⑤ 가이드: 맨 왼쪽은 체크칸', !/맨 왼쪽은 번호/.test(가이드) && /맨 왼쪽은 체크칸/.test(가이드));

t('⑥ 가이드: 엑셀 열 설명에 지금 열(추가 입력정보·취소시간·추가배송비·실패 사유)이 다 있다', ['추가 입력정보', '취소여부·취소시간', '「추가배송비 지역」·「추가배송비」 열', '「실패 사유」 열'].every((k) => 가이드.includes(k)));
t('⑦ 가이드: 「배송 안 함 지역」 표시는 아직 보내지 않은 주문에만', /아직 보내지 않은 주문\(결제대기·결제완료·입고\)/.test(가이드));
t('⑧ 가이드: 직접 고치기 80개 한도', /80개까지 넣을 수 있습니다/.test(가이드));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
