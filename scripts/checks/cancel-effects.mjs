import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 취소 부수처리 배선 고정 — 재고·적립회수·사용환불이 **모든 PG 경로**에서 같아야 한다.
//
// 붙잡아 두는 것 (전부 실제로 비어 있던 자리):
//  · 페이베리 기본경로는 PG 에만 취소를 걸고 DB 를 안 바꿨다 → 화면에 정상 주문으로 남았다
//  · 위루트·포스페이 웹훅에는 재고 복구가 없었다
//  · 적립 회수·사용 포인트 환불이 헥토 경로에만 있었다 → 다른 PG 는 고객 포인트가 증발
//  · 결제 '실패' 때도 사용 포인트가 차감된 채 남았다(결제는 안 됐는데 포인트만 사라짐)
import { readFileSync } from 'fs';
const BACK = BACK_ROOT;
let pass = 0, fail = 0;
const eq = (n, g, w) => { if (JSON.stringify(g) === JSON.stringify(w)) { pass++; console.log('  ok  ' + n); }
  else { fail++; console.log(`FAIL ${n}\n  got : ${JSON.stringify(g)}\n  want: ${JSON.stringify(w)}`); } };

const c = readFileSync(BACK + 'utils.js/cancel.js', 'utf8');
const pay = readFileSync(BACK + 'controllers/pay.controller.js', 'utf8');

// ── 공용 처리 ─────────────────────────────────────────────────────────────
eq('취소 부수처리가 한 곳에 있다', /export const applyCancelEffects/.test(c), true);
eq('상태표시+부수처리 묶음', /export const markCanceled/.test(c), true);
// 멱등성은 별도 표시 컬럼이 아니라 **원장 역산**으로 만든다 — 콜백이 두 번 와도 두 번 안 움직인다
eq('이미 회수한 만큼 빼고 계산', /const 남은회수 = Math\.max\(0, 적립총액 - 이미회수\)/.test(c), true);
eq('이미 환불한 만큼 빼고 계산', /const 남은환불 = Math\.max\(0, 사용총액 - 이미환불\)/.test(c), true);
// 회수액을 요율로 다시 계산하면 안 된다 — 요율이 바뀌면 적립된 적 없는 금액을 회수한다
eq('적립 회수는 원장 기준', /원장합\(tid, 'type=0'\)/.test(c), true);
eq('요율 재계산 안 함', /point_rate/.test(c), false);
// 부분취소: 버림 + 마지막(전체)에서 잔액 정산 → 조각 합이 원금과 어긋나지 않는다
eq('비율분은 버림', (c.match(/Math\.floor\(/g) || []).length >= 2, true);
eq('전체취소는 남은 전부 정산', /전체 \? 남은회수 :/.test(c) && /전체 \? 남은환불 :/.test(c), true);
// 취소는 이미 PG 에서 끝난 뒤다 — 여기서 던지면 '돈은 돌려줬는데 화면은 실패' 가 된다
eq('실패해도 던지지 않는다', (c.match(/catch \(e\) \{/g) || []).length >= 3, true);

// ── 모든 취소 경로가 공용을 쓴다 ───────────────────────────────────────────
eq('PG 취소 경로 6곳이 markCanceled 사용', (pay.match(/await markCanceled\(/g) || []).length, 6);
eq('핀트리는 is_cancel 컬럼', /markCanceled\(id, \{ column: 'is_cancel' \}\)/.test(pay), true);
// 옛 인라인 포인트 처리가 남아 있으면 공용과 겹쳐 **이중 환불**이 된다
eq('인라인 포인트 처리 제거됨', /type: 5,\s*\n\s*trans_id: result\?\.insertId/.test(pay), false);
eq('취소 경로에 개별 updateQuery 안 남음',
  /await updateQuery\('transactions', \{ is_cancel_trans: 1 \}/.test(pay), false);

// ── 결제 실패도 같은 정리를 한다 ───────────────────────────────────────────
// 주문을 만들며 재고와 사용 포인트를 미리 잡는다. PG 가 거절하면 둘 다 놓아줘야 한다.
eq('실패 정리가 공용을 부른다', /const 결제실패정리[\s\S]{0,200}await applyCancelEffects\(trans_id\)/.test(pay), true);
eq('실패 응답 12경로 유지', (pay.match(/return 결제실패응답\(trans_id, req, res, -100,/g) || []).length, 12);
eq('예외 경로도 정리', /if \(trans_id\) await 결제실패정리\(trans_id\)/.test(pay), true);

// ── 버려진 결제대기 정리 ──────────────────────────────────────────────────
const cleanup = readFileSync(BACK + 'utils.js/schedules/cleanup-abandoned.js', 'utf8');
eq('정리 시 재고 복구', /await restoreStock\(id\)/.test(cleanup), true);

// ── 부분취소 마이그레이션 불변식 ──────────────────────────────────────────
const mig = readFileSync(BACK + 'migrations/2026-08-13_partial_cancel.sql', 'utf8');
eq('줄에 취소 누적 컬럼', /ADD COLUMN cancel_count INT NOT NULL DEFAULT 0/.test(mig), true);
eq('취소 원장 테이블', /CREATE TABLE IF NOT EXISTS transaction_cancels/.test(mig), true);
// 취소는 실제 환불이다. 같은 클릭이 두 번 도착하면 이중 환불이 된다 — DB 가 막아야 한다.
eq('중복 실행 방지 키 UNIQUE', /UNIQUE KEY uq_cancel_idem \(idem_key\)/.test(mig), true);
// PG 응답 원문이 없으면 분쟁 때 근거가 없다
eq('PG 응답 원문 보관', /pg_result +TEXT/.test(mig), true);
// ⚠ 재고 원장 UNIQUE 에 cancel_id 가 없으면 첫 부분취소가 'in' 자리를 차지해
//   두 번째부터 재고가 안 돌아온다.
eq('재고원장에 cancel_id', /ADD COLUMN cancel_id BIGINT UNSIGNED NOT NULL DEFAULT 0/.test(mig), true);
eq('재고원장 UNIQUE 에 cancel_id 포함',
  /uq_stock_move_v2 \(trans_id, kind, product_id, option_id, combo_id, cancel_id\)/.test(mig), true);
eq('포인트 원장에도 cancel_id', /ALTER TABLE points ADD COLUMN cancel_id/.test(mig), true);
// 기본값이 지금 동작과 같아야 SQL 만 돌려도 화면이 안 바뀐다
eq('전부 더하기(되돌리기 구간 밖에 DROP 없음)', /DROP COLUMN/.test(mig.split('되돌리기')[0]), false);
eq('재실행 안전', /information_schema\.COLUMNS/.test(mig), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
