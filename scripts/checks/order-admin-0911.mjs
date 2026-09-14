import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 가맹점 요청서 2026-09-11(20260911_무료쇼핑몰 추가 수정 요청 사항.pptx) 9건 — 사장님 결정(2026-09-14) 그대로 붙잡아 둔다.
//   ① 거래 삭제·수정은 마스터(본사, level 50)만 (주문목록·주문취소관리)
//   ② 비회원 주문 뒤 다음 주문서에 지난 주문자 정보가 안 뜬다(포스페이 복귀 화면도 초안을 지운다)
//   ③ 결제실패/미완료를 결제대기와 따로(샵고 가맹점 메뉴 · 정리 잡은 지우지 않고 -1 로 표시)
//   ④ 결제대기(0)로 상태를 되돌릴 수 없다(화면·서버)
//   ⑤ 상태 변경 이력 — 테이블·기록 지점·조회 API·화면
//   ⑥ 관리자는 출고 후에도 회수 확인을 거쳐 취소 가능(손님 취소요청은 그대로 출고 전까지)
//   ⑦ 출고완료·배송완료는 그대로 둔다
//   ⑧ 신청서 영업추천인 필수 · 희망 주소 즉시 중복확인

const 읽기 = (root, p) => readFileSync(root + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond, 곁들임) => {
  if (cond) { pass++; console.log('  ok  ' + name); }
  else { fail++; console.log('  FAIL ' + name + (곁들임 ? '\n        ' + 곁들임 : '')); }
};

const 목록 = 읽기(FRONT_ROOT, 'src/pages/manager/orders/trx/[type].js');
const 취소관리 = 읽기(FRONT_ROOT, 'src/pages/manager/orders/trx-cancel/[type].js');
const 수정화면 = 읽기(FRONT_ROOT, 'src/pages/manager/orders/[edit_category]/[id].js');
const 메뉴 = 읽기(FRONT_ROOT, 'src/layouts/manager/nav/config-navigation.js');
const 취소창 = 읽기(FRONT_ROOT, 'src/components/manager/PartialCancelDialog.js');
const 이력창 = 읽기(FRONT_ROOT, 'src/components/manager/TrxHistoryDialog.js');
const 결과화면 = 읽기(FRONT_ROOT, 'src/views/shop/order/PayResultView.js');
const 신청서 = 읽기(FRONT_ROOT, 'src/pages/apply.js');
const 함수 = 읽기(FRONT_ROOT, 'src/utils/function.js');
const 가이드 = 읽기(FRONT_ROOT, 'src/components/manager/guideContent.js');

// ── ① 삭제·수정은 마스터만 ──────────────────────────────────────────────
t('주문목록: 수정/삭제 열은 마스터(level 50)에만 붙는다',
  목록.includes('const 마스터 = Number(user?.level) >= 50;') && 목록.includes('...(!마스터 ? [] : themeDnsData?.id == 34'));
t('주문취소관리: 수정/삭제 열은 마스터에만 붙는다', 취소관리.includes("...(Number(user?.level) >= 50 ? [{\n      id: 'edit',") && 취소관리.includes('}] : []),'));
t('주문 수정 화면은 마스터가 아니면 돌려보낸다', 수정화면.includes("if (user && !(Number(user?.level) >= 50)) {") && 수정화면.includes("router.replace('/manager/orders/trx/all')"));

// ── ② 초안 지우기 ─────────────────────────────────────────────────────
t('포스페이 복귀 화면이 주문서 초안을 지운다(성공 시)', 결과화면.includes("import { clearOrderDraft } from 'src/utils/order-draft'") && /if \(!isSuccess \|\| clearedRef\.current\) return;[\s\S]*?clearOrderDraft\(\);/.test(결과화면));

// ── ③ 결제실패/미완료 ─────────────────────────────────────────────────
t('샵고 가맹점 메뉴는 결제대기 대신 결제실패/미완료', 메뉴.includes("{ title: '결제실패/미완료', path: PATH_MANAGER.orders.trx + '/failed' }") && 메뉴.includes("isShopgoMerchant(themeDnsData)\n                  ? ["));
t('입금 대기 수단이 있는 샵고 가맹점에만 결제대기(입금확인) 메뉴', 메뉴.includes("입금대기수단있음(themeDnsData) ? [{ title: '결제대기(입금확인)'"));
t('목록은 failed → kind=failed, 샵고 가맹점의 0 → kind=waiting', 목록.includes("const kind = type == 'failed' ? 'failed' : (type == '0' && isShopgoMerchant(themeDnsData) ? 'waiting' : '');"));
t('상태 이름에 결제실패/미완료(-1)가 있다', 함수.includes("if (num == -1) return '결제실패/미완료'"));
t('결제실패/미완료 행은 상태 드롭다운·취소 버튼 대신 글자', 목록.includes("if (Number(row?.trx_status) < 0) return <div style={{ color: '#999', whiteSpace: 'nowrap' }}>결제실패/미완료</div>;") && 목록.includes("if (Number(row?.trx_status) < 0) return <div style={{ color: '#bbb' }}>결제 안 됨</div>;"));

// ── ④ 결제대기로 되돌리기 금지 ────────────────────────────────────────────
t('상태 드롭다운에 고를 수 있는 결제대기가 없다(현재값 표시용 disabled 만)',
  !목록.includes("<MenuItem value={0}>{'결제대기'}</MenuItem>") && 목록.includes("{row?.trx_status == 0 && <MenuItem value={0} disabled>{'결제대기'}</MenuItem>}"));

// ── ⑤ 이력 ─────────────────────────────────────────────────────────
t('주문목록에 이력 열과 이력 창이 있다', 목록.includes("id: 'history'") && 목록.includes('<TrxHistoryDialog open={!!historyTrxId} trxId={historyTrxId}'));
t('이력 창은 서버 이력 API 를 읽고 일시·구분·내용·처리자·비고를 보여 준다',
  이력창.includes("apiManager(`transactions/${trxId}/logs`, 'get', {})") && ['일시', '구분', '내용', '처리자', '비고'].every((h) => 이력창.includes(`>${h}</TableCell>`)));
t('이력 창: 이력 전 주문은 비어 있다고 알려 준다', 이력창.includes('이력 기능이 들어가기 전(2026-09-14 이전)'));

// ── ⑥ 출고 후 관리자 취소(확인) ────────────────────────────────────────
t('취소 창: 출고된 주문은 회수 확인 칸을 눌러야 실행 버튼이 열린다',
  취소창.includes('const [회수확인, set회수확인] = useState(false);')
  && 취소창.includes("disabled={busy || !(state?.cancelable || (state?.cancelable_after_confirm && 회수확인)) || !state?.partial_supported || !고른줄.length}")
  && 취소창.includes('shipped_confirm: state?.shipped && 회수확인 ? 1 : 0,'));
t('취소 창: 출고 안내가 있고 창을 열 때마다 확인이 풀린다', 취소창.includes('출고된 주문입니다.') && 취소창.includes('set회수확인(false);'));

// ── ⑦ 출고완료는 그대로 ───────────────────────────────────────────────
t('출고완료(15) 단계가 남아 있다(메뉴·드롭다운)', 메뉴.includes("{ title: '출고완료', path: PATH_MANAGER.orders.trx + '/15' }") && 목록.includes("<MenuItem value={15}>{'출고완료'}</MenuItem>"));

// ── ⑧ 신청서 ─────────────────────────────────────────────────────────
t('신청서: 영업추천인 필수', 신청서.includes("if (!form.referrer_name.trim()) e.referrer_name = st('apply.vReferrer');") && 신청서.includes("<Field label={st('apply.fReferrer')} required>"));
t('신청서: 희망 주소를 입력하면 바로 중복을 확인한다(check-slug)', 신청서.includes("axios.get('/api/merchant-application/check-slug', { params: { name: slug } })") && 신청서.includes("if (slugCheck === 'taken') {"));
{
  const 문구 = 읽기(FRONT_ROOT, 'src/components/main-site/landingStrings.js');
  for (const k of ['apply.vReferrer', 'apply.slugOk', 'apply.slugChecking']) {
    const n = (문구.match(new RegExp(`['"]${k.replace('.', '\\.')}['"]:`, 'g')) || []).length;
    t(`신청서 문구 ${k} 가 5개 언어에 있다`, n === 5, `${n}개`);
  }
}
t('이용가이드가 이력·결제실패/미완료·출고 후 취소를 설명한다',
  가이드.includes("{ label: '이력', desc:") && 가이드.includes('「결제실패/미완료」로 자동 정리') && 가이드.includes('회수를 확인했다고 표시한 뒤 취소할 수 있습니다'));

// ── 백엔드 ────────────────────────────────────────────────────────────
if (백엔드있음) {
  const trx = 읽기(BACK_ROOT, 'controllers/transaction.controller.js');
  const util = 읽기(BACK_ROOT, 'controllers/util.controller.js');
  const pay = 읽기(BACK_ROOT, 'controllers/pay.controller.js');
  const cancel = 읽기(BACK_ROOT, 'utils.js/cancel.js');
  const 정리 = 읽기(BACK_ROOT, 'utils.js/schedules/cleanup-abandoned.js');
  const 로그 = 읽기(BACK_ROOT, 'utils.js/trx-log.js');
  const 라우트 = 읽기(BACK_ROOT, 'routes/transaction.route.js');
  const 신청 = 읽기(BACK_ROOT, 'controllers/merchant_application.controller.js');
  const 마이그 = 읽기(BACK_ROOT, 'migrations/2026-09-14_transaction_status_logs.sql');

  // ① 삭제·수정 50 — remove/update 두 곳 모두
  t('서버: 거래 삭제·수정은 level 50 (두 곳)', (trx.match(/if \(!decode_user \|\| decode_user\?\.level < 50\) \{/g) || []).length === 2 && !/decode_user\?\.level < 40\) \{/.test(trx.slice(trx.indexOf('update: async'), trx.indexOf('update: async') + 900)));
  // ④ 결제대기로 되돌리기 거부 + 이력
  t('서버: 상태 드롭다운이 결제대기(0)·음수로 되돌리는 요청을 거부한다', util.includes("if (!(Number(value) > 0)) {") && util.includes('결제대기로는 되돌릴 수 없습니다'));
  t('서버: 상태 변경 전 값을 읽어 이력에 남긴다', util.includes("const [[이전]] = await readPool.query(`SELECT trx_status FROM transactions WHERE id=? ${scope.sql}`") && util.includes("kind: 'status', from_status: 이전상태, to_status: Number(value)"));
  // ⑤ 이력
  t('이력 테이블 마이그레이션', 마이그.includes('CREATE TABLE IF NOT EXISTS transaction_status_logs') && 마이그.includes('INDEX idx_trx_status_logs_trans (trans_id, id)'));
  t('이력 쓰기는 절대 던지지 않고 테이블이 없어도 지나간다', 로그.includes("if (e?.code === 'ER_NO_SUCH_TABLE')") && /export const logTrx = async[\s\S]*?catch \(e\)/.test(로그));
  t('이력 기록 지점: 승인 확정 3곳·취소요청·취소 실행·전체취소·정리',
    (pay.match(/kind: 'approve'/g) || []).length === 3 && trx.includes("kind: 'cancel_request'") && (cancel.match(/kind: 'cancel'/g) || []).length === 2 && 정리.includes("kind: 'failed'"));
  t('이력 조회 API 는 브랜드 소유 검증을 거친다(GET /transactions/:id/logs)', 라우트.includes(".route('/:id/logs')") && trx.includes('logs: async (req, res, next) => {') && /logs: async[\s\S]*?loadOwnedRow\(readPool, table_name, id, decode_user\)/.test(trx));
  // ③ 결제실패
  t('서버: 정리 잡이 지우지 않고 -1 로 표시한다(재고 복구는 그대로)', 정리.includes('UPDATE transactions SET trx_status = -1 WHERE id IN (?) AND trx_status = 0') && !정리.includes('DELETE FROM transactions') && 정리.includes('await restoreStock(id)'));
  t('서버: 목록 kind=failed/waiting 필터, 손님은 -1 을 못 본다', trx.includes("if (kind === 'failed') {") && trx.includes("} else if (kind === 'waiting') {") && trx.includes('AND ${table_name}.trx_status >= 0'));
  // ⑥ 출고 후 취소
  t('서버: 출고 후 취소는 shipped_confirm 이 있을 때만(cancel.js)', cancel.includes('export const SHIPPED_STATUS = [15, 20, 25];') && cancel.includes('if (!(state.cancelable_after_confirm && allow_shipped)) {') && pay.includes('allow_shipped: Number(shipped_confirm) === 1,'));
  t('서버: 손님 취소요청은 여전히 출고 전까지', trx.includes('const CANCELABLE_STATUS = [5, 10];'));
  t('서버: 취소 창 응답에 출고 여부가 있다', pay.includes('shipped: state.shipped,') && pay.includes('cancelable_after_confirm: state.cancelable_after_confirm,'));
  // ⑧ 추천인
  t('서버: 영업추천인 없으면 신청 거부(-105)', 신청.includes('return response(req, res, -105, "영업추천인을 입력해 주세요", false);'));
  // 자리 계산을 실제로 돌린다 — 이력 helper 의 상태 이름
  {
    const src = 로그.slice(로그.indexOf('export const STATUS_TEXT'), 로그.indexOf('export const actorOf'));
    const { statusText } = new Function(src.replace(/export /g, '') + '\nreturn { statusText };')();
    t('이력 상태 이름: -1 결제실패/미완료 · 5 결제완료 · 25 배송완료 · 모름은 숫자 그대로', statusText(-1) === '결제실패/미완료' && statusText(5) === '결제완료' && statusText(25) === '배송완료' && statusText(99) === '99' && statusText(null) === '');
  }
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
if (fail) process.exit(1);
