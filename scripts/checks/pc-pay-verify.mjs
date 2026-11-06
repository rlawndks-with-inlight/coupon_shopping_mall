import { readFileSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';

// PC 팝업 결제도 모바일과 같은 판정으로 결과를 보여 준다(2026-11-06).
//   예전 PC: 팝업 메시지(FORSPAY_RESULT)만 보고 성공·실패를 띄웠다 — 우리 서버를 거치지 않았다.
//     · 승인됐는데 팝업이 실패라고 하면 「실패」+「장바구니로」 → 다시 결제(이중결제)
//     · 승인 안 됐는데 팝업이 성공이라고 하면 「성공」
//     · 메시지 없이 팝업이 닫히면 안내만 띄우고 주문서에 남겨 둠
//   이제: 결과 화면이 VERIFY 로 열려 서버(pays/forspay/verify)에 묻고, 서버는 모바일 복귀와 같은 함수(포스페이결과판정)로 정한다.

const 읽기 = (root, p) => readFileSync(root + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

const util = 읽기(FRONT_ROOT, 'src/utils/shop-util.js');
const 결과 = 읽기(FRONT_ROOT, 'src/views/shop/order/PayResultView.js');
const 창 = util.slice(util.indexOf('const startForspayWindow ='), util.indexOf('export const onPayProductsByForspay'));

t('팝업: 메시지 코드로 결과 화면을 정하지 않고 VERIFY 로 연다', 창.includes('/shop/auth/pay-result?result_cd=VERIFY&win_cd=${encodeURIComponent(result_cd || \'\')}&ord_num=${encodeURIComponent(ord_num)}') && !/pay-result\?result_cd=\$\{encodeURIComponent\(result_cd\)\}/.test(창));
t('팝업: 메시지 없이 닫혀도 서버에 묻는다(안내만 띄우고 남겨 두지 않음)', /if \(popup\.closed\) goResult\(''\);/.test(창) && !창.includes("결제하셨다면 주문내역에서 확인해 주세요"));
t('팝업: 실패 문구는 주소에 싣지 않는다', /sessionStorage\.setItem\('forspayFail'/.test(창) && !/win_msg|result_msg=/.test(창));

t('결과 화면: VERIFY 면 서버 판정을 받아 주소를 바꿔 단다', /const isVerify = q\.result_cd === 'VERIFY';/.test(결과)
  && 결과.includes("apiManager('pays/forspay/verify', 'create', { ord_num: ord, code: String(q.win_cd || ''), message })")
  && 결과.includes('router.replace({ pathname: router.pathname, query: 판정 })'));
t('결과 화면: 판정 요청이 실패하면 확인 중(0001)', 결과.includes("let 판정 = { result_cd: '0001', ord_num: ord };"));
t('결과 화면: 판정 전에는 확인 중 화면(버튼 잠금)', /const 확인중 = isVerify \|\| \(isPending && /.test(결과) && /disabled=\{확인중\}/.test(결과));
t('결과 화면: 판정 전에는 실패 사유를 보내지 않는다', /if \(!router\.isReady \|\| isSuccess \|\| isPending \|\| isVerify\) return;/.test(결과));
t('결과 화면: 성공 표시는 0000 또는 확인 중 뒤 확정일 때만', /const isSuccess = q\.result_cd === '0000' \|\| \(isPending && 확인상태 === 'confirmed'\);/.test(결과));

if (!백엔드있음) {
  console.log('  (백엔드 없음 — 서버 검사 건너뜀)');
} else {
  const pay = 읽기(BACK_ROOT, 'controllers/pay.controller.js');
  const route = 읽기(BACK_ROOT, 'routes/pay.route.js');
  const 판정 = pay.slice(pay.indexOf('const 포스페이결과판정 ='), pay.indexOf('const 결제실패정리 ='));
  const 확인 = pay.slice(pay.indexOf('forspayVerify: async'), pay.indexOf('forspayFailReason: async'));
  const 모바일 = pay.slice(pay.indexOf('forspayReturn: async'), pay.indexOf('forspayCallback: async'));

  t('라우트: /forspay/verify(POST)', /\.route\('\/forspay\/verify'\)\s*\.post\(payCtrl\.forspayVerify\);/.test(route));
  t('판정 하나를 모바일·PC 가 같이 쓴다', /await 포스페이결과판정\(trx, \{ 복귀코드원본: data\.result_cd/.test(모바일) && /await 포스페이결과판정\(trx, \{ 복귀코드원본: req\.body\?\.code/.test(확인));
  t('모바일 복귀에 판정 사본이 남아 있지 않다', !모바일.includes('forspayGetTransaction') && !모바일.includes('const 복귀코드'));
  t('판정: 성공은 거래조회 approved + 확정, 또는 이미 결제완료일 때만', /const 확정 = txn\?\.status === 'approved' \? await settleForspayTransaction\(trx\.id, txn\) : false;\s*if \(확정 \|\| Number\(trx\.trx_status\) >= 5\) return \{ result_cd: '0000', txn \};/.test(판정));
  t('판정: 결제창 코드는 승인 판단 뒤에만', 판정.indexOf('const 확정 =') > 0 && 판정.indexOf('const 확정 =') < 판정.indexOf('const 복귀코드 ='));
  t('판정: 거래 없음은 1.5초 뒤 한 번 더', /if \(없음\) \{ await new Promise\(\(r\) => setTimeout\(r, 1500\)\); await 조회\(\); \}/.test(판정));
  t('확인 API: 포스페이 주문만, 취소 원장 행 제외', /WHERE ord_num=\? AND IFNULL\(is_cancel,0\)=0 ORDER BY id DESC LIMIT 1/.test(확인) && /Number\(trx\.trx_method\) !== 41\) return 결과\('9999'\)/.test(확인));
  t('확인 API: 이미 결제완료 이후(출고·배송·취소요청)는 성공', /if \(Number\(trx\.trx_status\) >= 5 \|\| Number\(trx\.trx_status\) === 1\) return 결과\('0000'\);/.test(확인));
  t('확인 API: 취소된 주문은 성공으로 보이지 않는다', /if \(Number\(trx\.is_cancel_trans\) === 1\) return 결과\('9999'\);/.test(확인));
  t('확인 API: 판정이 터지면 모름(0001), 실패로 단정하지 않는다', /return response\(req, res, 100, 'success', \{ result_cd: '0001' \}\);/.test(확인));
  t('확인 API: 손님 이름·연락처를 돌려주지 않는다', !/buyer_name|buyer_phone|card_num/.test(확인));

  // 웹훅: 조회가 실패하면 '받았다(200)'고 하지 않는다 — 포스페이가 다시 보내게(2026-11-06). 예전엔 대조(3시간)까지 밀렸다.
  const 웹훅 = pay.slice(pay.indexOf('forspayCallback: async'), pay.indexOf('forspayConfirm: async'));
  t('웹훅: 승인 조회 실패는 503(재전송), 거래 없음(409/404)은 200', /if \(st === 409 \|\| st === 404\) return res\.status\(200\)\.send\(\{ ok: true \}\);\s*logger\.error\(`\[forspay webhook\] 승인 조회 실패 — 재전송 요청\(503\)[^\n]*\n\s*return res\.status\(503\)\.send\(\{ ok: false \}\);/.test(웹훅));
  t('웹훅: 승인 조회는 응답 기한 안(8초)', /forspayGetTransaction\(\{ app_key: creds\?\.app_key, ord_num: ord, cxl_seq: 0, timeout: 8000 \}\)/.test(웹훅));
  t('웹훅: 취소 기록 조회 실패도 503', /취소 레코드 조회 실패 — 재전송 요청\(503\)[^\n]*\n\s*return res\.status\(503\)\.send\(\{ ok: false \}\);/.test(웹훅));
  t('웹훅: 서명 불일치·남의 주문은 재전송 받지 않는다(200)', /return res\.status\(200\)\.send\(\{ ok: false \}\); \}/.test(웹훅) && /Number\(trx\.trx_method\) !== 41\) return res\.status\(200\)\.send\(\{ ok: true \}\);/.test(웹훅));
  t('웹훅: 예기치 못한 오류도 503', /logger\.error\(errText\(err\)\);\s*return res\.status\(503\)\.send\(\{ ok: false \}\);\s*\}\s*\},\s*forspayConfirm/.test(pay));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
