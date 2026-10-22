import { readFileSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음, 주석제거 } from './_roots.mjs';

// 실가맹점 오픈 전 주문·결제·취소 점검(2026-10-19)에서 고친 것들.
//   · 포스페이 확정은 거래조회(txn)만 근거로 — 웹훅 본문 result_cd·주소 파라미터로 결제완료가 되지 않게
//   · 확정은 결제대기·미완료(0·-1)만, 주문번호·금액 대조 — 출고·취소요청 주문이 결제완료로 되돌아가지 않게
//   · 로그인한 몰과 다른 몰 쿠키로 주문 API 를 부르면 거부(본사 50 이상 제외)
//   · 부분취소: PG 에는 포인트 몫을 뺀 현금만, 포인트 비율은 누적 − 이미 움직인 것, 같은 주문 취소는 잠금
//   · 전체취소(포스페이) 금액은 서버가 정한다
//   · 결과페이지 0001(확인 중) — '실패'로 보여 이중결제를 부르지 않게

const 읽기 = (root, p) => readFileSync(root + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

const 결과 = 읽기(FRONT_ROOT, 'src/views/shop/order/PayResultView.js');
t('결과페이지: 0001 은 확인 중 → confirm 을 몇 번 다시 묻는다', /const isPending = q\.result_cd === '0001';/.test(결과) && /for \(let i = 0; i < 6 && !멈춤; i\+\+\)[\s\S]{0,200}apiManager\('pays\/forspay\/confirm', 'create', \{ ord_num: ord \}\)/.test(결과));
t('결과페이지: 확인 중·불명일 때는 「장바구니로」가 아니라 주문내역으로', /\(isSuccess \|\| 확인불명\)\s*\? \(user\?\.id \? '\/shop\/auth\/history' : '\/shop\/auth\/order-check'\)/.test(결과) && /disabled=\{확인중\}/.test(결과));

if (!백엔드있음) {
  console.log('  (백엔드 없음 — 서버 검사 건너뜀)');
} else {
  const pay = 읽기(BACK_ROOT, 'controllers/pay.controller.js');
  const cancel = 읽기(BACK_ROOT, 'utils.js/cancel.js');
  const index = 읽기(BACK_ROOT, 'index.js');
  const util = 읽기(BACK_ROOT, 'controllers/util.controller.js');
  const opt = 읽기(BACK_ROOT, 'utils.js/product-options.js');
  const rec = 읽기(BACK_ROOT, 'scripts/forspay-reconcile.mjs');
  const trx = 읽기(BACK_ROOT, 'controllers/transaction.controller.js');

  t('웹훅: result_cd 지름길 없음 — 거래조회 approved 일 때만 확정', !/body\.result_cd\s*===\s*'0000'/.test(주석제거(pay)) && /txn\?\.status === 'approved'[\s\S]{0,80}settleForspayTransaction\(trx\.id, txn, \{ card_num: body\.card_num \}\)/.test(pay));
  t('웹훅: sign_key 가 있으면 서명이 없어도 거부', /const ok = !!body\.signature && forspayVerifySig\(/.test(pay));
  t('복귀: trans 와 ord 가 같은 주문이어야', /String\(transId\) !== String\(trx\.id\)/.test(pay));
  // 미결제(손님 취소) 세션은 포스페이가 409 not_found — '확인 중'이 아니라 결제 안 됨(9999)으로(2026-10-22)
  t('복귀: 409/404(거래 없음)는 결제 안 됨 — 확인 중(0001)으로 보내지 않는다', /없음 = st === 409 \|\| st === 404; 조회실패 = !없음;/.test(pay) && /if \(조회실패 \|\| \(!없음 && !txn\?\.status\)/.test(pay));
  t('확정: 0·-1 에서만, 주문번호·금액 대조', /WHERE id=\? AND trx_status IN \(0, -1\) AND IFNULL\(is_cancel_trans,0\)=0/.test(pay)
    && /String\(txn\?\.ord_num \?\? ''\) !== String\(trx\.ord_num \?\? ''\)/.test(pay) && /Number\(txn\?\.amount\) !== Number\(trx\.amount\)/.test(pay));
  t('ready: 몰에 등록된 결제모듈만', /SELECT id FROM payment_modules WHERE brand_id=\? AND trx_type=\? LIMIT 1`, \[brand_id, trx_method\]/.test(pay));
  t('ready: 핀트리 인증 실패 시 결제완료(5)를 -1 로', /UPDATE transactions SET trx_status=-1 WHERE id=\? AND trx_status=5`, \[trans_id\]/.test(pay));
  t('전체취소(포스페이): 금액은 transactions.amount, 화면 값 안 씀', /const 현금 = Math\.max\(0, Number\(trx\.amount\) \|\| 0\);/.test(pay) && /amount: 현금 \}\)/.test(pay) && !/ord_num: trx\.ord_num, amount \}\);\s*await markCanceled/.test(pay));
  t('전체취소(포스페이): 이미 취소·부분취소 이력이면 거부, 잠금 안에서 다시 확인', /withCancelLock\(trx\.id, async \(\) => \{/.test(pay) && /FROM transaction_cancels WHERE trans_id=\?`, \[trx\.id\]/.test(pay));

  t('몰 불일치 미들웨어: 토큰 brand_id ≠ dns 몰 → 거부, 50 이상 통과', /Number\(사용자\.level\) >= 50\) return next\(\);/.test(index) && /Number\(사용자\.brand_id\) !== Number\(몰\.id\)/.test(index));

  t('부분취소: PG 금액 = 환불액 − 사용 포인트 몫(상한 남은 현금)', /const PG금액 = Math\.max\(0, Math\.min\(남은현금, 환불액 - 포인트몫\)\);/.test(cancel) && /pgCancel\(\{ trx: state\.trx, amount: PG금액 \}\)/.test(cancel));
  t('포인트 비율은 누적 − 이미 움직인 것', /Math\.floor\(적립총액 \* ratio\) - 이미회수/.test(cancel) && /Math\.floor\(사용총액 \* ratio\) - 이미환불/.test(cancel));
  t('부분취소는 주문별 잠금(GET_LOCK) 안에서', /GET_LOCK\(\?, 0\)/.test(cancel) && /withCancelLock\(trans_id, \(\) => cancelLinesLocked\(trans_id, opts\)\)/.test(cancel));
  t('PG 환불 뒤 DB 반영 실패는 던지지 않고 기록', /PG 환불 후 줄 반영 실패\(수동 확인\)/.test(cancel));

  t('상태 변경: 포스페이 결제대기(0)는 가맹점이 못 바꾼다(50 이상 제외)', /이전상태 === 0 && Number\(이전\.trx_method\) === 41 && Number\(decode_user\?\.level\) < 50/.test(util));
  t('한정수량: 결제실패·미완료(-1)와 부분취소 수량은 안 센다', /t\.is_delete = 0 AND t\.trx_status >= 0/.test(opt) && /o\.order_count - IFNULL\(o\.cancel_count, 0\)/.test(opt));
  t('대사: 승인됐는데 결제대기·미완료인 주문을 같은 확정 함수로 살린다', /WHERE trx_method=41 AND trx_status IN \(0, -1\)/.test(rec) && /settleForspayTransaction\(t\.id, txn\)/.test(rec) && /export \{ settleForspayTransaction \};/.test(pay));
  t('비회원 주문 목록: -1 숨김', /\$\{HIDE_ABANDONED_PENDING\} AND trx_status >= 0 ORDER BY id DESC LIMIT 50/.test(trx));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
