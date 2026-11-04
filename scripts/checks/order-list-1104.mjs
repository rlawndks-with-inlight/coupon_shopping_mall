import { readFileSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';

// 포스페이 결제 시험 요청(2026-11-04) ②~⑤ — 주문 목록에 무엇이 보이고 무엇을 할 수 있는가.
//   ② 손님 주문내역에 취소 건이 남는다   ③ 실패 건은 안 보인다(관리자 계정으로 쇼핑몰을 열어도)
//   ④ 샵고 가맹점 「전체」는 성공·취소 건만(메뉴 이름은 그대로), 승인 전 주문은 상태 변경·취소 잠금(본사 50 이상은 그대로)
//   ⑤ 취소 건은 「전체」에 남되 결제완료·배송중 탭에는 안 섞인다
// 판매 중단 프레임은 type 을 보내지 않아 예전 조건 그대로다.

const 읽기 = (root, p) => readFileSync(root + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

// ── 손님 화면 ──────────────────────────────────────────────────────────
for (const rel of ['src/views/shop/demo-1/auth/history.js', 'src/views/shop/demo-2/auth/history.js']) {
  t(`${rel}: 내 주문 조건(type=user)을 보낸다`, /type: 'user'/.test(읽기(FRONT_ROOT, rel)));
}
for (const n of [1, 2, 4]) {
  t(`블로그 demo-${n}: 내 주문 조건(type=user)을 보낸다`, /apiManager\('transactions', 'list', \{ page: 1, page_size: 20, type: 'user' \}\)/.test(읽기(FRONT_ROOT, `src/views/blog/auth/my-page/order/demo-${n}.js`)));
}
// demo-1 은 줄 단위로 펼친 item 에 취소 칸이 없어서, item 으로 부르면 취소 건이 '결제완료'로 보인다
t('블로그 demo-1: 상태는 주문 원본으로 판단한다', /getOrderStatusText\(item\.trx\)/.test(읽기(FRONT_ROOT, 'src/views/blog/auth/my-page/order/demo-1.js')));

// ── 관리자 화면 ────────────────────────────────────────────────────────
const 목록 = 읽기(FRONT_ROOT, 'src/pages/manager/orders/trx/[type].js');
const 메뉴 = 읽기(FRONT_ROOT, 'src/layouts/manager/nav/config-navigation.js');
const 함수 = 읽기(FRONT_ROOT, 'src/utils/function.js');
t('메뉴: 이름은 「전체」 그대로 — 바뀌는 것은 조회 조건뿐', 메뉴.includes("{ title: '전체', path: PATH_MANAGER.orders.trx + '/all' }") && !메뉴.includes("'성공/취소'"));
t('목록: all 은 샵고 가맹점일 때만 settled', /\(\(type == 'all' \|\| !type\) && 샵고\) \? 'settled' : ''/.test(목록));
t('미승인 판정: 포스페이 0 만 — 무통장 대기는 잠그지 않는다', /Number\(row\?\.trx_method\) === 41 && Number\(row\?\.trx_status\) === 0/.test(함수));
t('목록: 취소 건은 드롭다운 대신 취소완료', 목록.includes("return <div style={{ color: '#d32f2f', whiteSpace: 'nowrap' }}>취소완료</div>;"));
t('목록: 미승인은 가맹점에게 드롭다운·취소 버튼 없음(본사 제외)',
  목록.includes("if (!마스터 && 포스페이미승인(row)) return <div style={{ color: '#999', whiteSpace: 'nowrap' }}>결제 미완료</div>;")
  && 목록.includes("if (!마스터 && 포스페이미승인(row)) return <div style={{ color: '#bbb', whiteSpace: 'nowrap' }}>결제 안 됨</div>;"));
// 송장 칸은 행마다 useState 를 부른다 — 잠금 분기가 훅보다 앞에 오면 화면이 백지가 된다
{
  const 칸 = 목록.slice(목록.indexOf("id: 'invoice_num'"));
  const 훅 = 칸.indexOf('const [invoice, setInvoice] = useState');
  const 잠금 = 칸.indexOf('포스페이미승인(row))) {');
  t('목록: 송장 칸 잠금은 useState 뒤에 있다', 훅 > 0 && 잠금 > 훅);
}

// ── 실패 사유(④) ──────────────────────────────────────────────────────
const 유틸 = 읽기(FRONT_ROOT, 'src/utils/shop-util.js');
const 결과 = 읽기(FRONT_ROOT, 'src/views/shop/order/PayResultView.js');
t('결제창 message 를 결과 화면으로 넘긴다', /goResult\(d\.code \|\| '9999', d\.message\)/.test(유틸));
t('사유는 주소에 싣지 않는다(sessionStorage, 주문번호 대조)', /sessionStorage\.setItem\('forspayFail'/.test(유틸) && !/result_msg/.test(유틸.slice(유틸.indexOf('const goResult'), 유틸.indexOf('const onMessage'))) && /저장값\?\.ord_num === ord/.test(결과));
{
  const 식 = 결과.match(/const 손님용사유 = \(code, message\) => \{([\s\S]*?)\n\};/);
  const 고름 = 식 && new Function('code', 'message', 식[1]);
  t('손님 화면: 카드 사유는 보이고, PV 코드·SQL·긴 문구는 안 보인다', !!고름
    && 고름('699', '잔액이 부족합니다') === '잔액이 부족합니다'
    && 고름('PV500', '통신 오류') === ''
    && 고름('699', "SQLSTATE[HY000] Access denied for user") === ''
    && 고름('699', 'x'.repeat(101)) === ''
    && 고름('699', '') === '');
}
t('실패 사유 칸은 「결제실패/미완료」 목록에만', /\.\.\.\(실패목록 \? \[\{\s*id: 'fail_reason'/.test(목록) && /const 실패목록 = useRouter\(\)\.query\?\.type == 'failed';/.test(목록));

// ── 서버 ───────────────────────────────────────────────────────────────
if (!백엔드있음) {
  console.log('  (백엔드 없음 — 서버 검사 건너뜀)');
} else {
  const trx = 읽기(BACK_ROOT, 'controllers/transaction.controller.js');
  const util = 읽기(BACK_ROOT, 'controllers/util.controller.js');
  const pay = 읽기(BACK_ROOT, 'controllers/pay.controller.js');
  t('서버: type=user 면 등급과 무관하게 본인 주문·실패 건 숨김', /const 손님화면 = type == 'user' \|\| isCustomer;/.test(trx) && /if \(손님화면\) \{\s*sql \+= HIDE_ABANDONED_PENDING;/.test(trx));
  t('서버: settled = 결제된 주문 + 취소된 주문', /kind === 'settled'\) \{\s*sql \+= ` AND \(\$\{table_name\}\.trx_status >= 1 OR \$\{table_name\}\.is_cancel_trans = 1\) `/.test(trx));
  t('서버: settled·type=user 는 원장 행만 빼고 취소 건을 남긴다', /if \(kind === 'settled' \|\| type == 'user'\) \{[\s\S]{0,300}sql \+= ` AND is_cancel=0 `;\s*\} else if \(cancel_status\)/.test(trx));
  t('서버: 상태별 탭·판매 중단 프레임의 기본 조건은 그대로', /\} else \{\s*sql \+= ` AND is_cancel=0 AND is_cancel_trans=0 `;\s*\}\s*if \(cancel_type\)/.test(trx));
  t('서버: 취소 완료 주문은 상태 변경 거부(본사 제외)', /is_cancel_trans\) === 1\) && Number\(decode_user\?\.level\) < 50\) \{\s*return response\(req, res, -100, "취소 완료된 주문은 상태를 바꿀 수 없습니다\."/.test(util));
  t('서버: 승인 전 주문은 전체·부분취소 거부(본사 제외)', (pay.match(/결제확인전\((trx|state\.trx)\) && Number\(decode_user\?\.level\) < 50/g) ?? []).length === 2);
  // 실패 사유는 표시용 — 공개 API 라 받는 범위를 좁히고, 주문 상태를 절대 바꾸지 않는다
  const 사유함수 = pay.slice(pay.indexOf('forspayFailReason: async'), pay.indexOf('// 브랜드별 페이레터 인증정보'));
  t('서버: 사유는 포스페이 미결제·주문 직후·몇 줄까지만', /trx_method=41 AND trx_status IN \(0, -1\)/.test(사유함수) && /INTERVAL \? HOUR/.test(사유함수) && /이전\.length >= 결제창사유최대/.test(사유함수));
  t('서버: 사유 저장은 이력 한 줄뿐 — 주문을 고치거나 확정하지 않는다', /logTrx\(/.test(사유함수) && !/UPDATE|settleForspay|markCanceled|writePool/.test(사유함수));
  {
    const 식 = pay.match(/const 결제창사유정리 = \(v\) => \{([\s\S]*?)\n\};/);
    const 정리 = 식 && new Function('v', 식[1]);
    t('서버: 시스템 오류 문구·태그는 저장하지 않는다', !!정리
      && 정리('잔액이 부족합니다') === '잔액이 부족합니다'
      && 정리('<b>한도</b> 초과') === '한도 초과'
      && 정리('SQLSTATE[HY000] (SQL: select * from x)') === ''
      && 정리({ a: 1 }) === '');
  }
  t('서버: 사유는 관리자 실패 목록에만 붙는다', /kind === 'failed' && !손님화면/.test(trx));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
