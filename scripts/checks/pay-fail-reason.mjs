import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';

// 결제 실패 사유는 결제수단과 관계없이 같은 이유면 같은 문구(사장님 요청 2026-11-11).
//   포스페이는 같은 잔액 부족을 카드 「은행잔액부족 카드사거절코드LF」 · 네이버페이 「잔액부족」 · 카카오페이 「[-780] 계좌 잔액 부족」 으로 보낸다.
//   카카오페이 문구는 앞의 대괄호 때문에 화면이 숨겨서 사유가 아예 안 나왔다.
//   이제 서버(back utils.js/payments/fail-reason.js)가 뜻으로 묶은 문구를 돌려주고, 화면은 그것만 보여 준다. 이력에는 원문.
// 근거가 있는 것만 묶는다(「지레짐작하지 말 것」): 아래 운영원문은 2026-11-11 까지 운영에 실제로 들어온 실패 사유 전부,
// PV 코드는 포스페이 문서(결제창 API·External API) 오류 코드 표에 뜻이 적힌 것 전부다.

const 읽기 = (root, p) => readFileSync(root + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

const 결과 = 읽기(FRONT_ROOT, 'src/views/shop/order/PayResultView.js');
t('결과 화면: 결제창 원문을 바로 보여 주지 않고 서버 문구만', !결과.includes('set실패사유(손님용사유(code, message))')
  && 결과.includes(".then((r) => { if (!isCanceled) set실패사유(손님용사유(code, r?.message)); })"));
t('결과 화면: 사유 문구를 번역해 보여 준다', 결과.includes("{translate('실패 사유')}: {translate(실패사유)}"));

if (!백엔드있음) {
  console.log('  (백엔드 없음 — 서버 검사 건너뜀)');
} else {
  const { 실패사유분류, 실패문구, 수단거절안내 } = await import(pathToFileURL(BACK_ROOT + 'utils.js/payments/fail-reason.js').href);
  const 화면 = (code, msg) => { const r = 실패사유분류(code, msg); return r.취소 ? '취소' : r.문구; };
  const 틀린것 = (표) => 표.filter(([c, m, 기대]) => 화면(c, m) !== 기대).map(([c, m]) => `${c} ${String(m).slice(0, 20)}`);

  const 운영원문 = [
    ['699', '은행잔액부족 카드사거절코드LF', 실패문구.잔액부족],
    ['699', '잔액부족', 실패문구.잔액부족],
    ['699', '잔액 부족', 실패문구.잔액부족],
    ['699', '[-780] 계좌 잔액 부족', 실패문구.잔액부족],
    ['699', '체크카드계좌잔액 부족 카드사거절코드L9', 실패문구.잔액부족],
    ['699', '회원요청 거래정 지카드', 실패문구.거래정지],
    ['699', '[-780] 거래 정지 카드 - 정지 해제 후 이용 가능', 실패문구.거래정지],
    ['699', '1회 한도 초과', 실패문구.한도초과],
    ['9998', 'Please confirm if your payment was successful on the WeChat App or to the merchant. If the payment was successful, do not make another payment to avoid duplicate payments(카드사 문의요망)', 실패문구.결제확인],
    ['PV500', 'PG사와 통신과정에서 문제가 발생했습니다. 키 값이 정상적인지 확인하신 후 1차 PG사에 문의바랍니다.', 실패문구.통신오류],
    ['30553', '[301][-410] invalid parameter format', '[301][-410] invalid parameter format'], // 묶을 근거 없음 → 원문 그대로
    ['30563', '결제 취소 또는 결제시간 초과', '취소'],
    ['PV999', '결제를 취소하셨습니다.', '취소'],
    ['CANCEL', '손님이 결제창을 닫음', '취소'],
  ];
  const 틀림1 = 틀린것(운영원문);
  t(`운영에 들어온 원문 ${운영원문.length}가지가 모두 정해진 문구로${틀림1.length ? ' — 틀림: ' + 틀림1.join(' / ') : ''}`, 틀림1.length === 0);

  // 포스페이 문서의 PV 코드 — 원문이 무엇이든(연동 담당자용 문구) 코드의 뜻으로만 안내한다
  const 문서코드 = [
    ['PV401', 'pay key가 존재하지 않습니다.', 실패문구.판매자문의],
    ['PV405', '', 실패문구.판매자문의], ['PV406', '', 실패문구.판매자문의], ['PV412', '', 실패문구.판매자문의],
    ['PV407', '', 실패문구.수단잠시불가], ['PV408', '', 실패문구.한도초과], ['PV409', '', 실패문구.결제시간외],
    ['PV411', '', 실패문구.같은카드횟수], ['PV413', '', 실패문구.수단불가], ['PV414', '', 실패문구.카드정보필요],
    ['PV420', '', 실패문구.카드사불가], ['PV423', '', 실패문구.카드불가], ['PV429', '', 실패문구.할부불가],
    ['PV433', '', 실패문구.수단불가], ['PV500', '', 실패문구.통신오류], ['PV9999', '', 실패문구.수단불가],
    ['PV999', '', '취소'], ['PV403', '', 실패문구.거절], ['PV417', '', 실패문구.거절], ['PV777', '알 수 없는 연동 오류', 실패문구.거절],
  ];
  const 틀림2 = 틀린것(문서코드);
  t(`문서의 PV 코드는 코드 뜻으로만 안내(원문 미노출)${틀림2.length ? ' — 틀림: ' + 틀림2.join(' / ') : ''}`, 틀림2.length === 0);

  t('주문서 거절 안내(결제창 열기 전)도 같은 문구 — 예전 문구 그대로', 수단거절안내('PV408') === '결제 가능한 금액을 넘었습니다. 금액을 줄이거나 다른 결제수단을 선택해 주세요.'
    && 수단거절안내('PV407') === '지금 이 결제수단으로 결제할 수 없습니다. 잠시 후 다시 시도하거나 다른 결제수단을 선택해 주세요.'
    && ['PV413', 'PV433', 'PV9999'].every((c) => 수단거절안내(c) === '선택하신 결제수단은 지금 사용할 수 없습니다. 다른 결제수단을 선택해 주세요.')
    && 수단거절안내('PV401') === null && 수단거절안내('PV500') === null);

  // 근거 없는 문구는 묶지 않고 원문 그대로(코드도 떼지 않는다 — 사장님 2026-11-11). 손님에게 보이면 안 되는 것만 일반 문구로
  t('운영에 없던 문구는 짐작해 묶지 않고 원문 그대로', 화면('699', '[-123] 비밀번호 오류 (카드사 문의요망)') === '[-123] 비밀번호 오류 (카드사 문의요망)'
    && 화면('699', '유효기간 오류 카드사거절코드Q1') === '유효기간 오류 카드사거절코드Q1' && 화면('699', 'card declined') === 'card declined');
  t('문구가 없거나 보이면 안 되는 것(SQL·연락처·너무 긴 글)은 일반 거절 문구', 화면('699', '') === 실패문구.거절 && 화면('699', undefined) === 실패문구.거절
    && 화면('699', 'SQLSTATE[HY000] Access denied') === 실패문구.거절 && 화면('699', '010-1234-5678 로 연락') === 실패문구.거절
    && 화면('699', '가'.repeat(151)) === 실패문구.거절);
  t('위챗페이 「결제됐는지 앱에서 확인」은 실패가 아니라 확인 필요', 실패사유분류('9998', 'Please confirm if your payment was successful on the WeChat App').확인필요 === true
    && !실패사유분류('699', '잔액부족').확인필요);

  // 문구는 사전 키 — 5개 언어 모두에 있어야 손님이 다른 언어로 볼 때 한국어로 남지 않는다
  const 사전없음 = [];
  for (const l of ['ko', 'en', 'ja', 'cn', 'es']) {
    const 사전 = 읽기(FRONT_ROOT, `src/locales/langs/${l}.js`);
    for (const 문구 of Object.values(실패문구)) if (!사전.includes(`"${문구}":`)) 사전없음.push(`${l}:${문구.slice(0, 10)}`);
  }
  t(`문구 ${Object.keys(실패문구).length}개가 5개 언어 사전에 모두 있다${사전없음.length ? ' — 없음: ' + 사전없음.join(', ') : ''}`, 사전없음.length === 0);

  const pay = 읽기(BACK_ROOT, 'controllers/pay.controller.js');
  t('서버: 손님에게 돌려주는 사유는 분류 문구(이력에는 원문)', pay.includes("return 실패사유분류(code, 저장문구 ?? '').문구;")
    && pay.includes("const note = 머리 + (문구 || 결제창코드뜻[code] || '사유 없음');"));
  t('서버: 손님이 멈춘 실패 코드(30563 등)는 취소 화면, 결제 확인 필요(9998)는 확인 중(0001)으로', pay.includes("return { result_cd: 사유분류.취소 ? 'CANCEL' : 사유분류.확인필요 ? '0001' : 복귀코드, txn };"));
  t('서버: 취소로 바뀐 뒤 결과 화면이 CANCEL 로 다시 보내도 이력을 또 쓰지 않는다', pay.includes("(code !== 'CANCEL' || 이전.length === 0)"));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
