import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 부분취소 금액 계산 검증 — 실제 함수를 불러 돌린다(복사본이면 진짜 코드와 어긋나도 통과한다).
//
// 붙잡아 두는 것:
//  · 나머지를 마지막에 몰아주지 않으면 조각 합이 원금과 어긋난다(3,333×3 ≠ 10,000)
//  · 남은 수량보다 많이 취소되면 안 된다 — 없는 돈이 환불된다
//  · 배송비: 부분취소엔 환불 안 함. 단 무료배송 조건이 깨지면 환불액에서 뺀다(네이버·쿠팡 규칙)
import { readFileSync } from 'fs';
const BACK = BACK_ROOT;

// cancel.js 는 DB 를 import 하므로 필요한 순수 함수만 떼어 평가한다.
const src = readFileSync(BACK + 'utils.js/cancel.js', 'utf8');
const grab = (name) => {
  const i = src.indexOf(`export const ${name} = `);
  if (i < 0) throw new Error('not found: ' + name);
  const rest = src.slice(i);
  const m = rest.slice(1).match(/\n(?:export )?const [A-Za-z가-힣]/);
  return rest.slice(0, m ? m.index + 1 : rest.length).replace(/^export /, '');
};
const fn = new Function(grab('calcCancelAmount') + '\n' + grab('calcDeliveryAdjust') + '\nreturn { calcCancelAmount, calcDeliveryAdjust };');
const { calcCancelAmount, calcDeliveryAdjust } = fn();

let pass = 0, fail = 0;
const eq = (n, g, w) => { if (JSON.stringify(g) === JSON.stringify(w)) { pass++; console.log('  ok  ' + n); }
  else { fail++; console.log(`FAIL ${n}\n  got : ${JSON.stringify(g)}\n  want: ${JSON.stringify(w)}`); } };

// ── 금액 계산 ──────────────────────────────────────────────────────────────
// 10,000원짜리 3개 = 30,000. 1개씩 세 번 취소.
let 줄 = { order_amount: 30000, delivery_fee: 0, order_count: 3,
           unit_price: 10000, merch_amount: 30000, remain_count: 3, remain_amount: 30000 };
eq('1개 취소 = 10,000', calcCancelAmount(줄, 1), 10000);
줄 = { ...줄, remain_count: 2, remain_amount: 20000 };
eq('두 번째도 10,000', calcCancelAmount(줄, 1), 10000);
줄 = { ...줄, remain_count: 1, remain_amount: 10000 };
eq('마지막 = 남은 전부', calcCancelAmount(줄, 1), 10000);

// 나누어떨어지지 않는 경우 — 10,000원 3개인데 총액이 10,000 (개당 3,333.33)
줄 = { order_amount: 10000, delivery_fee: 0, order_count: 3,
       unit_price: 3333, merch_amount: 10000, remain_count: 3, remain_amount: 10000 };
const a1 = calcCancelAmount(줄, 1);
eq('나머지 있는 줄: 첫 취소 3,333(버림)', a1, 3333);
줄 = { ...줄, remain_count: 2, remain_amount: 10000 - a1 };
const a2 = calcCancelAmount(줄, 1);
eq('두 번째도 3,333', a2, 3333);
줄 = { ...줄, remain_count: 1, remain_amount: 10000 - a1 - a2 };
const a3 = calcCancelAmount(줄, 1);
eq('마지막이 나머지 3,334 를 정산', a3, 3334);
eq('세 조각 합 = 원금 10,000 (1원도 안 남는다)', a1 + a2 + a3, 10000);

// 한 번에 여러 개
줄 = { order_amount: 10000, delivery_fee: 0, order_count: 3,
       unit_price: 3333, merch_amount: 10000, remain_count: 3, remain_amount: 10000 };
eq('2개 한 번에 = 6,666', calcCancelAmount(줄, 2), 6666);
eq('3개 전부 = 10,000 (나머지 포함)', calcCancelAmount(줄, 3), 10000);

// 경계
eq('남은 수량 초과는 거부', calcCancelAmount(줄, 4), null);
eq('0개는 거부', calcCancelAmount(줄, 0), null);
eq('음수는 거부', calcCancelAmount(줄, -1), null);

// 배송비가 섞인 줄 — 배송비는 개당 단가에서 빠져야 한다
줄 = { order_amount: 33000, delivery_fee: 3000, order_count: 3,
       unit_price: 10000, merch_amount: 30000, remain_count: 3, remain_amount: 30000 };
eq('배송비는 단가 계산에서 제외', calcCancelAmount(줄, 1), 10000);

// ── 배송비 조정 ────────────────────────────────────────────────────────────
const 정책 = { delivery_fee_default: 3000, free_ship_min: 30000 };
eq('전체취소면 배송비 전액 환불',
  calcDeliveryAdjust({ 전체취소: true, 취소후남은상품가: 0, 총배송비: 3000, setting: 정책 }), 3000);
eq('부분취소 + 남은 금액이 기준 이상 → 조정 없음',
  calcDeliveryAdjust({ 전체취소: false, 취소후남은상품가: 40000, 총배송비: 0, setting: 정책 }), 0);
// 무료배송으로 산 주문인데 취소 후 기준 미달 → 배송비를 환불액에서 뺀다
eq('무료배송이 깨지면 배송비 차감(-3,000)',
  calcDeliveryAdjust({ 전체취소: false, 취소후남은상품가: 20000, 총배송비: 0, setting: 정책 }), -3000);
// 원래 배송비를 낸 주문이면 부분취소로 조정할 것이 없다
eq('원래 유료배송이면 조정 없음',
  calcDeliveryAdjust({ 전체취소: false, 취소후남은상품가: 20000, 총배송비: 3000, setting: 정책 }), 0);
eq('무료배송 정책이 없으면 조정 없음',
  calcDeliveryAdjust({ 전체취소: false, 취소후남은상품가: 0, 총배송비: 0, setting: {} }), 0);

// ── 배선 ───────────────────────────────────────────────────────────────────
const pay = readFileSync(BACK + 'controllers/pay.controller.js', 'utf8');
// ⚠ 지원 안 하는 PG 에 부분취소를 걸면 전액이 취소된다
eq('부분취소 지원 PG 화이트리스트', /const PARTIAL_CANCEL_METHODS = \[41\]/.test(pay), true);
eq('미지원 PG 는 막는다', /이 결제수단은 부분취소를 지원하지 않습니다/.test(pay), true);
// 금액은 서버가 계산한다 — 화면이 보낸 금액을 믿으면 임의 환불이 된다
eq('화면에서 금액을 받지 않는다', /const \{ items, reason, idem_key \} = req\.body/.test(pay), true);
eq('브랜드 소유 확인', (pay.match(/canWriteBrand\(decode_user, state\.trx\?\.brand_id\)/g) || []).length, 2);
const c = readFileSync(BACK + 'utils.js/cancel.js', 'utf8');
// 원장을 PG 호출 **전에** 넣어야 같은 클릭의 이중 실행을 끊는다
eq('원장이 PG 호출보다 먼저',
  c.indexOf('INSERT INTO transaction_cancels') < c.indexOf('await pgCancel'), true);
eq('중복 키는 거부', /ER_DUP_ENTRY/.test(c), true);
// PG 가 실패하면 돈이 안 움직였으니 원장을 지워 재시도할 수 있어야 한다
eq('PG 실패 시 원장 삭제', /DELETE FROM transaction_cancels WHERE id=\?/.test(c), true);
// 취소 가능 상태는 전체취소와 같은 기준
eq('출고 전만 취소', /CANCELABLE_STATUS = \[0, 5, 10\]/.test(c), true);
// 재고는 그 줄이 고른 옵션만, 취소 수량만큼만
const po = readFileSync(BACK + 'utils.js/product-options.js', 'utf8');
eq('부분 재고복구에 cancel_id', /kind, cancel_id\)\s*\n\s*VALUES \(\?,\?,\?,\?,\?,'in',\?\)/.test(po), true);
// ⚠ 전체복구가 부분복구분을 또 되돌리면 팔지도 않은 재고가 생긴다
eq('전체복구는 이미 되돌린 만큼 뺀다', /const 남은 = Math\.max\(0, Number\(n\.qty\) - \(Number\(이미\?\.q\) \|\| 0\)\)/.test(po), true);

// ── 관리자 화면 ────────────────────────────────────────────────────────────
const FRONT = FRONT_ROOT;
const dlg = readFileSync(FRONT + 'src/components/manager/PartialCancelDialog.js', 'utf8');
// ⚠ 화면은 수량만 보낸다. 금액을 보내면 서버가 그걸 믿게 되는 순간 임의 환불이 된다.
eq('화면은 수량만 보낸다', /items: 고른줄\.map\(\(l\) => \(\{ order_id: l\.order_id, qty: 고른수량\(l\) \}\)\)/.test(dlg), true);
eq('금액을 보내지 않는다', /amount:\s*예상액/.test(dlg), false);
// 같은 클릭이 두 번 도착하면 이중 환불이다 — 버튼 잠금만으로는 부족하다
eq('중복 실행 키를 만든다', /idem_key: idemKey/.test(dlg), true);
eq('열 때마다 새 키', /setIdemKey\(새키\(\)\)/.test(dlg), true);
// 지원 안 하는 PG 에 걸면 전액이 취소된다 — 아예 못 누르게 한다
eq('미지원 결제수단은 버튼 비활성', /!state\?\.partial_supported/.test(dlg), true);
eq('남은 수량을 넘겨 입력 못 함', /Math\.min\(Number\(qty\[l\.order_id\]\) \|\| 0, l\.remain_count\)/.test(dlg), true);
// 미리보기도 서버와 같은 규칙(마지막 수량이면 남은 금액 전부)이어야 헷갈리지 않는다
eq('미리보기도 나머지 정산 반영', /n === l\.remain_count \? l\.remain_amount/.test(dlg), true);

// 두 관리자 화면 모두에 붙어야 한다 — 한 곳만 넣으면 그 화면에서만 취소가 된다
for (const rel of ['src/pages/manager/orders/trx/[type].js',
                   'src/pages/manager/orders/trx-cancel/[type].js']) {
  const s2 = readFileSync(FRONT + rel, 'utf8');
  const 이름 = rel.includes('trx-cancel') ? '취소요청 화면' : '주문 화면';
  eq(`${이름}: 다이얼로그 마운트`, /<PartialCancelDialog/.test(s2), true);
  eq(`${이름}: 취소 버튼 컬럼`, /id: 'cancel',/.test(s2), true);
  eq(`${이름}: 취소된 건은 버튼 없음`, /취소됨/.test(s2), true);
  eq(`${이름}: 취소 후 목록 갱신`, /onDone=\{\(\) => onChangePage\(searchObj\)\}/.test(s2), true);
}

// ── 고객 부분 취소요청 ─────────────────────────────────────────────────────
const mig2 = readFileSync(BACK + 'migrations/2026-08-14_cancel_request_lines.sql', 'utf8');
eq('취소요청 줄 테이블', /CREATE TABLE IF NOT EXISTS transaction_cancel_requests/.test(mig2), true);
// 거절도 남겨야 '요청한 적 없다' 와 구분된다 — 분쟁 때 근거가 된다
eq('요청 상태(요청/처리/거절)', /status +TINYINT +NOT NULL DEFAULT 0/.test(mig2), true);
eq('처리된 취소와 연결', /cancel_id +BIGINT UNSIGNED NOT NULL DEFAULT 0/.test(mig2), true);

const trxCtrl = readFileSync(BACK + 'controllers/transaction.controller.js', 'utf8');
eq('요청을 줄 단위로 저장', /INSERT INTO transaction_cancel_requests/.test(trxCtrl), true);
// 옛 화면은 items 를 안 보낸다 — 그때는 '남은 전부' 요청으로 봐야 한다
eq('items 없으면 전체 요청', /const 대상 = 요청\.length \? 요청 :/.test(trxCtrl), true);
// 남은 수량을 넘겨 요청할 수 없다
eq('남은 수량으로 자른다', /Math\.min\(t\.qty, 남은\)/.test(trxCtrl), true);
// ⚠ 상세를 못 남겨도 취소요청 자체는 접수돼야 한다 — 여기서 막으면 고객이 취소를 아예 못 한다
eq('상세 저장 실패해도 요청은 접수', /취소요청 상세 저장 실패\(요청은 접수됨\)/.test(trxCtrl), true);

// 관리자가 '고객이 무엇을 몇 개 원했는지' 를 봐야 손으로 옮겨 적지 않는다
eq('관리자 응답에 요청 수량', /requested_count: l\.requested_count/.test(pay), true);
eq('요청 사유도 함께', /request_reason: state\.request_reason/.test(pay), true);
// 처리한 요청을 닫지 않으면 같은 건을 또 취소하려 든다
eq('취소 실행 시 요청 마감', /UPDATE transaction_cancel_requests[\s\S]{0,80}SET status=1, cancel_id=\?, processed_at=NOW\(\)/.test(c), true);

// 고객 화면 — 버튼 3곳이 한 컴포넌트로 모여야 판정이 안 어긋난다
const btn = readFileSync(FRONT + 'src/components/elements/shop/OrderCancelButton.js', 'utf8');
eq('고객도 줄·수량을 고른다', /items: items \?\? \[\]/.test(btn), true);
eq('고객 화면도 남은 수량 초과 불가', /Math\.min\(Number\(qty\[o\.id\]\) \|\| 0, 남은수량\(o\)\)/.test(btn), true);
eq('취소 가능 상태는 백엔드와 같은 값', /CANCELABLE_STATUS = \[0, 5, 10\]/.test(btn), true);
for (const rel of ['src/components/elements/shop/common.js', 'src/components/elements/blog/common.js']) {
  const s3 = readFileSync(FRONT + rel, 'utf8');
  const 이름 = rel.includes('blog') ? '블로그 주문내역' : '쇼핑몰 주문내역';
  eq(`${이름}: 공용 버튼 사용`, /<OrderCancelButton/.test(s3), true);
  // 인라인으로 '주문 전체' 를 바로 요청하던 코드가 남아 있으면 그 화면만 옛 동작이 된다
  eq(`${이름}: 인라인 요청 제거`, /onPayCancelRequest\(row\)/.test(s3), false);
}
// 블로그 마이페이지 5개 프레임에도 줄 정보가 넘어가야 한다
for (const n of [1, 2, 3, 4, 5]) {
  const s4 = readFileSync(FRONT + `src/views/blog/auth/my-page/order/demo-${n}.js`, 'utf8');
  eq(`블로그 마이페이지 demo-${n}: 줄 전달`, /orders=\{item\.trx\?\.orders\}/.test(s4), true);
}

// ── 다이얼로그는 표 밖에 한 번만 ───────────────────────────────────────────
//
// 붙잡아 두는 사고:
//   <PartialCancelDialog> 가 컬럼 정의('수정/삭제' action) 안에 들어가 있었다. 그런데
//   그 컬럼은 trx/[type].js 에서 브랜드 34·64·84 에서만 붙는 조건부다 →
//   나머지 가맹점에서는 다이얼로그가 화면에 아예 없어서, '부분/전체 취소' 를 눌러도
//   state 만 바뀌고 **아무 일도 일어나지 않았다**. 버튼은 멀쩡히 보이므로
//   가맹점 입장에서는 기능이 고장 난 게 아니라 없는 것처럼 보인다.
//   컬럼 안에 두면 행마다 하나씩 생기는 문제도 있다(같은 open 을 보므로 N개가 함께 열린다).
//
// 판정: 다이얼로그가 소스에서 columns={defaultColumns} **뒤에** 나와야 한다.
//       컬럼 정의 안에 있으면 반드시 앞에 온다.
for (const f of ['src/pages/manager/orders/trx/[type].js',
                 'src/pages/manager/orders/trx-cancel/[type].js']) {
  const s5 = readFileSync(FRONT + f, 'utf8');
  const 다이얼로그 = s5.indexOf('<PartialCancelDialog');
  const 표 = s5.indexOf('columns={defaultColumns}');
  const 개수 = (s5.match(/<PartialCancelDialog/g) ?? []).length;
  const 이름 = f.replace('src/pages/manager/orders/', '');
  eq(`${이름}: 다이얼로그가 표 밖에 있다`, 다이얼로그 > 표 && 표 > 0, true);
  eq(`${이름}: 한 번만 그린다`, 개수, 1);
}

// ── 없는 컬럼을 고르지 않는다 ─────────────────────────────────────────────
//
// 붙잡아 두는 사고:
//   getCancelState 의 transactions 조회가 delivery_fee 를 골랐다. 그런데 그 컬럼은
//   transactions 에 없다 — 배송비는 주문 줄(transaction_orders.delivery_fee)에만 있다.
//   그 한 칼럼 때문에 조회가 통째로 ER_BAD_FIELD_ERROR 로 죽어서, 부분취소 창은 늘
//   '주문 정보를 불러오지 못했습니다' 만 띄웠다. 실행 경로도 같은 함수를 쓰므로 함께 죽었다.
//   즉 부분취소는 처음부터 한 번도 동작한 적이 없다. 화면·금액계산·PG 연동은 다 멀쩡했다.
//
// 왜 사람 눈에 안 보였나: 잘못된 것은 컬럼 하나이고, 그 이름은 옆 테이블에 실제로 있다.
// SQL 은 문자열이라 편집기도 빌드도 아무 말을 안 한다. DB 에 물어봐야만 드러난다.
//
// 운영 DB 의 transactions 컬럼(2026-08-18 확인). 조회에 쓰는 이름이 이 안에 있어야 한다.
// 늘려야 하면 실제 DB 에 그 컬럼이 있는지 먼저 확인하고 여기에 같이 넣을 것.
const TRANSACTIONS_컬럼 = new Set(`
  id transaction_id brand_id user_id trx_dt trx_tm cxl_dt cxl_tm is_cancel cancel_type
  agent_amount seller_id seller_trx_fee seller_amount ord_num password trx_id ori_trx_id
  issuer acquirer appr_num installment buyer_name buyer_phone addr detail_addr card_num
  bank_code acct_num virtual_bank_code virtual_acct_num virtual_acct_issued_seq trx_status
  pay_key mid tid trx_root trx_method amount is_delete item_name created_at updated_at
  invoice_num use_point is_cancel_trans check_picture have_brother receiver receiver_phone
  zonecode buyer_name_idx buyer_phone_idx pay_method country_code country_name city state_region
`.trim().split(/\s+/));

{
  // ⚠ 파일 전체에서 찾으면 안 된다. 앞쪽 points 조회의 SELECT 에 걸려
  //    엉뚱한 구간을 캡처하고, 그러면 검사는 늘 조용히 통과한다(실제로 그랬다).
  //    getCancelState 안으로 먼저 좁히고, 템플릿 리터럴 경계까지 정확히 잡는다.
  const 함수 = src.slice(src.indexOf('export const getCancelState'));
  const 조회 = 함수.match(/`SELECT([\s\S]*?)FROM transactions WHERE id=\?`/);
  eq('getCancelState 가 transactions 를 조회한다', !!조회, true);
  const 고른컬럼 = (조회?.[1] ?? '')
    .split(',').map((s) => s.trim()).filter(Boolean)
    .filter((s) => /^[a-z_][a-z0-9_]*$/i.test(s));   // 별칭·함수 호출은 건너뛴다
  // 이 숫자가 갑자기 줄면 위 정규식이 또 빗나간 것이다 — 검사가 비어 버리는 걸 막는다
  eq('컬럼을 10개 뽑았다(정규식이 빗나가지 않았다)', 고른컬럼.length, 10);
  eq('없는 컬럼을 고르지 않는다', 고른컬럼.filter((c) => !TRANSACTIONS_컬럼.has(c)), []);
  // 배송비는 줄에서만 더한다 — 거래에는 그 컬럼이 없다
  eq('배송비는 주문 줄에서 더한다', /state\.lines\.reduce\(\(s, l\) => s \+ \(Number\(l\.delivery_fee\)/.test(src), true);
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
