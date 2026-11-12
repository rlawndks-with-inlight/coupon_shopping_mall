import { readFileSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { 칸펼치기 } from './_order-columns.mjs'; // 공용 칸(OrderColumns.js)을 화면 소스에 펼쳐 넣는다(2026-11-12)

// 취소 시각은 '우리가 반영한 때'가 아니라 '실제로 취소된 때'다(2026-11-05 결정).
//   승인번호 30034440: 포스페이 취소 16:12:45 → 대조가 18:05 반영 → 칸에는 UTC 09:05:14 가 저장돼 있었다.
//   cxl_dt·cxl_tm = 실제 취소 시각(한국 시각). created_at = 반영 시각으로 그대로 둔다.

const 읽기 = (root, p) => readFileSync(root + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

// ── 화면 ───────────────────────────────────────────────────────────────
const 목록 = 칸펼치기(읽기(FRONT_ROOT, 'src/pages/manager/orders/trx/[type].js'));
const 취소목록 = 칸펼치기(읽기(FRONT_ROOT, 'src/pages/manager/orders/trx-cancel/[type].js'));
// 처리시간 칸은 없앴다(가맹점 요청 2026-11-06 — 이력에서 본다). 그 전엔 「업데이트시간」·「취소시간」을 처리시간 한 칸으로 합쳤었다(11-05).
// 실제 취소 시각은 엑셀 「취소시간」 열에 그대로 남는다(아래).
for (const [이름, 화면] of [['주문 목록', 목록], ['취소 목록', 취소목록]]) {
  t(`${이름}: 처리시간·업데이트시간·취소시간 칸 없음`, !/id: 'updated_at'/.test(화면) && !/label: '처리시간'/.test(화면) && !/label: '업데이트시간'/.test(화면) && !/id: 'cancelled_at'/.test(화면));
}
// 탭을 빨리 옮기면 앞 탭(취소완료)의 늦은 응답이 취소요청 탭을 덮어썼다(2026-11-06 운영 재현) — 마지막 요청만 쓴다
for (const [이름, 화면] of [['주문 목록', 목록], ['취소 목록', 취소목록]]) {
  t(`${이름}: 늦게 온 앞 탭 응답은 버린다`, /const 이번 = \+\+조회번호\.current;/.test(화면) && /if \(data_ && 이번 === 조회번호\.current\) \{/.test(화면));
}
// 취소요청은 가맹점이 처리할 건 — 상태 칸을 빨갛게(가맹점 문의 2026-11-06)
t('주문 목록: 취소요청 상태 칸 강조', /sx=\{row\?\.trx_status == 1 \? 취소요청강조 : undefined\}/.test(목록) && /const 취소요청강조 = \{ bgcolor: '#ffebee', color: '#d32f2f'/.test(목록));
// 주문관리는 주문번호만, 주문취소관리는 승인번호만 보였다(2026-11-06) — 두 화면 모두 한 칸에 둘 다
for (const [이름, 화면] of [['주문 목록', 목록], ['취소 목록', 취소목록]]) {
  t(`${이름}: 주문번호 / 승인번호 한 칸`, /label: '주문번호 \/ 승인번호'/.test(화면) && /<div>\{row\['ord_num'\] \|\| '---'\}<\/div>/.test(화면) && /승인 \{row\['appr_num'\]\}/.test(화면) && !/id: 'appr_num',\s*label: '승인번호'/.test(화면));
}
t('엑셀: 주문번호 바로 뒤 승인번호', /label: '주문번호', width: 22[^\n]*\n\s*\{ label: '승인번호', width: 14, value: \(r\) => r\?\.appr_num \?\? '' \}/.test(목록));
t('엑셀: 취소시간은 취소여부 바로 뒤', /label: '취소여부'[^\n]*\n[^\n]*\n\s*\{ label: '취소시간', width: 20, value: \(r\) => r\?\.cancelled_at \?\? '' \}/.test(목록));

// ── 서버 ───────────────────────────────────────────────────────────────
if (!백엔드있음) {
  console.log('  (백엔드 없음 — 서버 검사 건너뜀)');
} else {
  const 취소 = 읽기(BACK_ROOT, 'utils.js/cancel.js');
  const 포스 = 읽기(BACK_ROOT, 'utils.js/payments/forspay.js');
  const 대조 = 읽기(BACK_ROOT, 'scripts/forspay-reconcile.mjs');
  const 결제 = 읽기(BACK_ROOT, 'controllers/pay.controller.js');
  const 거래 = 읽기(BACK_ROOT, 'controllers/transaction.controller.js');
  const 대시 = 읽기(BACK_ROOT, 'controllers/dashboard.controller.js');
  const 신청 = 읽기(BACK_ROOT, 'controllers/merchant_application.controller.js');
  const 정산 = 읽기(BACK_ROOT, 'controllers/seller_adjustments.controller.js');

  t('원장: 서버 시계(UTC)를 그대로 쓰지 않는다', !/이제\.getHours\(\)/.test(취소) && /Date\.now\(\) \+ 9 \* 60 \* 60 \* 1000/.test(취소));
  t('원장: 실제 시각이 형식에 맞을 때만 쓰고 아니면 지금 한국 시각', /시각꼴\.test\(cancelled_at \?\? ''\) \? cancelled_at : 한국시각\(\)/.test(취소));
  {
    const 식 = 포스.match(/const cancelledAt = ([^\n]*);/);
    const 고름 = 식 && new Function('records', `return ${식[1]};`);
    t('포스페이: 부분취소가 여러 번이면 마지막 시각, 없으면 null', !!고름
      && 고름([{ cxl_dttm: '2026-11-02 16:12:45' }, { cxl_dttm: '2026-11-03 09:00:00' }]) === '2026-11-03 09:00:00'
      && 고름([{ trx_dttm: '2026-11-02 16:12:45' }]) === '2026-11-02 16:12:45'
      && 고름([]) === null);
  }
  t('대조: 포스페이 시각을 넘긴다', /markCanceled\(t\.id, \{ cancelled_at: cancelledAt \}\)/.test(대조));
  t('웹훅: 포스페이 시각을 넘긴다', /note: '포스페이 취소 통지\(전액\)', cancelled_at: cancelledAt \}/.test(결제));
  // 어드민 취소 약 1분 뒤 포스페이 통지가 돌아온다(주문 11568778) — 같은 취소를 이력에 두 줄 쓰지 않는다
  t('이력: 이미 취소된 주문이면 또 쓰지 않는다', /\$\{column\} AS canceled FROM transactions/.test(취소) && /if \(Number\(이전\?\.canceled\) !== 1\) await logTrx\(\{ trans_id: tid/.test(취소));
  t('취소 실패 로그: PG 응답을 통째로 남기지 않는다(연락처)', !/PG 실패 trans_id=\$\{tid\}: \$\{JSON\.stringify/.test(취소));
  t('취소 목록: 기간 검색도 실제 취소 시각', /const 취소완료목록 = cancel_status == 2 && !손님화면( && !엑셀상태)?;/.test(거래) && /조회조건 = \{ \.\.\.req\.query, s_dt: undefined, e_dt: undefined \};/.test(거래));
  t('손님 화면에는 취소 시각을 붙이지 않는다', /if \(!손님화면 && data\?\.content\?\.length > 0\) \{\s*try \{\s*const 취소된원주문/.test(거래));
  t('대시보드 취소 건수: 실제 취소일', /trx_cancel_counts_sql \+= ` AND \$\{실제취소시각식\(table_name\)\} <= \? `/.test(대시));
  t('가맹점 상세 취소 건수: 실제 취소일', /is_cancel=1 AND is_delete=0\$\{cancelWhere\}/.test(신청));
  // 지금 매출·정산은 취소 건을 주문일에서 통째로 뺀다 — 취소일을 쓰도록 바꾸려면 사장님 결정이 먼저다
  t('매출·정산은 아직 주문일 기준 그대로', /trx_status >= 5 AND is_cancel = 0 AND is_cancel_trans = 0\s*\$\{s_dt \? ` AND created_at >= \?`/.test(정산));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
