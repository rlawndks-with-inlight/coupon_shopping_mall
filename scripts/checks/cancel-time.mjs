import { readFileSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';

// 취소 시각은 '우리가 반영한 때'가 아니라 '실제로 취소된 때'다(2026-11-05 결정).
//   승인번호 30034440: 포스페이 취소 16:12:45 → 대조가 18:05 반영 → 칸에는 UTC 09:05:14 가 저장돼 있었다.
//   cxl_dt·cxl_tm = 실제 취소 시각(한국 시각). created_at = 반영 시각으로 그대로 둔다.

const 읽기 = (root, p) => readFileSync(root + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

// ── 화면 ───────────────────────────────────────────────────────────────
const 목록 = 읽기(FRONT_ROOT, 'src/pages/manager/orders/trx/[type].js');
const 취소목록 = 읽기(FRONT_ROOT, 'src/pages/manager/orders/trx-cancel/[type].js');
// 「업데이트시간」과 「취소시간」을 따로 두지 않는다(2026-11-05 사장님 지적) — 처리시간 한 칸에 취소 건은 실제 취소 시각
for (const [이름, 화면] of [['주문 목록', 목록], ['취소 목록', 취소목록]]) {
  t(`${이름}: 시간 칸은 처리시간 하나`, /id: 'updated_at',\s*label: '처리시간'/.test(화면) && !/label: '업데이트시간'/.test(화면) && !/id: 'cancelled_at'/.test(화면));
  t(`${이름}: 취소 건은 실제 취소 시각, 나머지는 마지막 변경 시각`, /if \(row\['cancelled_at'\]\) return <div style=\{\{ color: '#d32f2f', whiteSpace: 'nowrap' \}\}>취소 \{row\['cancelled_at'\]\}<\/div>;\s*return row\['updated_at'\] \?\? "---"/.test(화면));
}
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
  t('취소 목록: 기간 검색도 실제 취소 시각', /const 취소완료목록 = cancel_status == 2 && !손님화면;/.test(거래) && /조회조건 = \{ \.\.\.req\.query, s_dt: undefined, e_dt: undefined \};/.test(거래));
  t('손님 화면에는 취소 시각을 붙이지 않는다', /if \(!손님화면 && data\?\.content\?\.length > 0\) \{\s*try \{\s*const 취소된원주문/.test(거래));
  t('대시보드 취소 건수: 실제 취소일', /trx_cancel_counts_sql \+= ` AND \$\{실제취소시각식\(table_name\)\} <= \? `/.test(대시));
  t('가맹점 상세 취소 건수: 실제 취소일', /is_cancel=1 AND is_delete=0\$\{cancelWhere\}/.test(신청));
  // 지금 매출·정산은 취소 건을 주문일에서 통째로 뺀다 — 취소일을 쓰도록 바꾸려면 사장님 결정이 먼저다
  t('매출·정산은 아직 주문일 기준 그대로', /trx_status >= 5 AND is_cancel = 0 AND is_cancel_trans = 0\s*\$\{s_dt \? ` AND created_at >= \?`/.test(정산));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
