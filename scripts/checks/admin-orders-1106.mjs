import { readFileSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';

// 관리자 주문 화면 가맹점 피드백(2026-11-06)
//   ① 처리시간 칸 없앰(이력에서 본다)        — cancel-time.mjs 가 지킨다
//   ② 이력을 주문취소관리(취소요청·취소완료)에도
//   ④ 구매시간은 주문번호/승인번호 바로 오른쪽
//   ⑤ 송장 변경도 이력에
//   ⑥ 기간 바로 고르기(오늘·어제·7일·1개월·3개월·전체)

const 읽기 = (root, p) => readFileSync(root + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

const 목록 = 읽기(FRONT_ROOT, 'src/pages/manager/orders/trx/[type].js');
const 취소목록 = 읽기(FRONT_ROOT, 'src/pages/manager/orders/trx-cancel/[type].js');
const 표 = 읽기(FRONT_ROOT, 'src/views/manager/mui/table/ManagerTable.js');
const 이력창 = 읽기(FRONT_ROOT, 'src/components/manager/TrxHistoryDialog.js');

// 열 순서: 정의 안에서 id 가 처음 나오는 자리로 본다(주석 처리된 열은 뺀다)
const 열순서 = (src) => {
  const 본문 = src.slice(src.indexOf('const defaultColumns = ['), src.indexOf('const router = useRouter();', src.indexOf('const defaultColumns = [')))
    .replace(/\/\*[\s\S]*?\*\//g, '');
  return [...본문.matchAll(/id: '([a-z_]+)'/g)].map((m) => m[1]);
};
for (const [이름, 화면] of [['주문 목록', 목록], ['취소 목록', 취소목록]]) {
  const 순서 = 열순서(화면);
  t(`${이름}: 구매시간이 주문번호 바로 다음`, 순서.indexOf('created_at') === 순서.indexOf('ord_num') + 1);
  t(`${이름}: 이력 열`, 순서.includes('history') && /onClick=\{\(\) => setHistoryTrxId\(이력주문\(row\)\)\}>이력<\/Button>/.test(화면));
  // 취소완료 탭의 줄은 취소 원장(is_cancel=1) — 이력은 원래 주문(transaction_id)에 있다(미리보기에서 빈 이력으로 발견)
  {
    const 식 = 화면.match(/const 이력주문 = (\(row\) => [^\n]*);/);
    const 고름 = 식 && new Function(`return ${식[1]}`)();
    t(`${이름}: 취소 원장 줄이면 원래 주문의 이력`, !!고름 && 고름({ id: 9, is_cancel: 1, transaction_id: 5 }) === 5 && 고름({ id: 9, is_cancel: 0, transaction_id: null }) === 9 && 고름({ id: 9, is_cancel: 1, transaction_id: null }) === 9);
  }
  t(`${이름}: 이력 창이 한 번만`, (화면.match(/<TrxHistoryDialog open=\{!!historyTrxId\} trxId=\{historyTrxId\} onClose=\{\(\) => setHistoryTrxId\(0\)\} \/>/g) ?? []).length === 1);
  t(`${이름}: 기간 바로 고르기 켬`, /onChangePage=\{onChangePage\}\s*date_presets/.test(화면));
  t(`${이름}: 구매시간은 승인 전이면 접수 시각`, /const 승인 = `\$\{row\['trx_dt'\] \?\? ''\} \$\{row\['trx_tm'\] \?\? ''\}`\.trim\(\);\s*return 승인 \|\| \(row\['created_at'\] \?\? '---'\);/.test(화면));
}
t('주문 목록: thegrazia(74)는 구매시간 대신 통관부호 그대로', /\.\.\.\(themeDnsData\?\.id == 74 \? \[\] : \[\s*\{\s*id: 'created_at'/.test(목록) && /id: 'unipass'/.test(목록));
t('취소 목록: 이력 상태값 선언', /const \[historyTrxId, setHistoryTrxId\] = useState\(0\);/.test(취소목록) && /import TrxHistoryDialog from "src\/components\/manager\/TrxHistoryDialog";/.test(취소목록));

// ⑥ 공용 표 — 다른 화면 22곳은 그대로(켠 곳만)
t('표: date_presets 기본은 꺼짐', /minimal = false, type, date_presets = false, sticky_lead = \[\] \} = props;/.test(표));
t('표: 오늘·어제·7일·1개월·3개월·전체', 표.includes("[['today', '오늘'], ['yesterday', '어제'], ['week', '7일'], ['month', '1개월'], ['quarter', '3개월'], ['all', '전체 기간']]"));
t('표: 고르면 1쪽부터 다시', /onChangePage\(\{ \.\.\.searchObj, s_dt: 글\(시작\), e_dt: 글\(끝\), page: 1 \}\);/.test(표));
t('표: 날짜를 직접 고르면 버튼 강조가 풀린다', (표.match(/set기간\(''\);/g) ?? []).length === 2);
{
  // 범위 계산을 실제로 돌려 본다(오늘 기준)
  const 식 = 표.match(/const 날 = \(뒤로\) => \{([\s\S]*?)\};\s*const 달전 = \(n\) => \{([\s\S]*?)\};/);
  const 날 = 식 && new Function('뒤로', 식[1]);
  const 오늘 = new Date(); 오늘.setHours(0, 0, 0, 0);
  t('표: 어제는 하루 전 0시, 7일은 오늘 포함 7일', !!날 && 날(0).getTime() === 오늘.getTime()
    && Math.round((오늘 - 날(1)) / 864e5) === 1 && Math.round((오늘 - 날(6)) / 864e5) === 6);
}

// ⑤ 이력 창 — 송장 구분
t('이력 창: 송장 구분 이름', /invoice: '송장',/.test(이력창) && /invoice: 'info'/.test(이력창));
// 이력 메모(가맹점 요청 "이력에서 수정·추가" → 메모만, 사장님 결정 2026-11-06)
t('이력 창: 메모 추가는 관리자(40 이상)만 보인다', /const 메모가능 = Number\(user\?\.level\) >= 40;/.test(이력창) && /!loading && !failed && 메모가능 &&/.test(이력창));
t('이력 창: 수정·삭제 버튼은 서버가 허락한 줄(can_edit)만', /\{r\.can_edit && 고치는중\.id !== r\.id &&/.test(이력창) && !/r\.kind === 'memo' && \(/.test(이력창));
t('이력 창: 메모 API 경로', 이력창.includes("apiManager(`transactions/${trxId}/logs`, 'create', { note })")
  && 이력창.includes("apiManager(`transactions/${trxId}/logs`, 'update', { id: 고치는중.id, note })")
  && 이력창.includes("apiManager(`transactions/${trxId}/logs`, 'delete', { id: row.id })"));
t('이력 창: 지우기 전에 묻는다', /window\.confirm\('이 메모를 지울까요\?/.test(이력창));
t('이력 창: 고친 메모는 「수정됨」', /if \(r\?\.kind === 'memo'\) return r\?\.edited_at \? `수정됨 \$\{일시글\(r\.edited_at\)\}` : '';/.test(이력창));

if (!백엔드있음) {
  console.log('  (백엔드 없음 — 서버 검사 건너뜀)');
} else {
  const 거래 = 읽기(BACK_ROOT, 'controllers/transaction.controller.js');
  const 송장 = 거래.slice(거래.indexOf('changeInvoice: async'), 거래.indexOf('cancelRequest: async'));
  t('송장: 권한·소유 확인 뒤에 이전 값을 읽는다', 송장.indexOf('loadOwnedRow(') > 0 && 송장.indexOf('loadOwnedRow(') < 송장.indexOf('SELECT invoice_num'));
  t('송장: 값이 바뀐 때만 이력', /if \(전 !== 후\) \{\s*await logTrx\(\{ trans_id: id, brand_id: target\.brand_id, kind: 'invoice'/.test(송장));
  t('송장: 입력·변경·삭제를 구분해 적는다', 송장.includes('`송장 입력: ${후}`') && 송장.includes('`송장 삭제 (이전: ${전})`') && 송장.includes('`송장 변경: ${전} → ${후}`'));
  t('송장: 처리자는 로그인한 관리자', /actor: actorOf\(decode_user, 'admin'\)/.test(송장));

  // 이력 메모 — 자동 기록은 못 고친다. 메모만, 쓴 사람(또는 본사)만.
  const 라우트 = 읽기(BACK_ROOT, 'routes/transaction.route.js');
  const 기록 = 읽기(BACK_ROOT, 'utils.js/trx-log.js');
  const 고칠 = 거래.slice(거래.indexOf('const 고칠메모 ='), 거래.indexOf('const transactionCtrl ='));
  const 추가 = 거래.slice(거래.indexOf('addLogMemo: async'), 거래.indexOf('updateLogMemo: async'));
  const 수정삭제 = 거래.slice(거래.indexOf('updateLogMemo: async'), 거래.indexOf('changeInvoice: async'));
  t('메모: 라우트(추가 POST, 수정 PUT, 삭제 DELETE)', /\.route\('\/:id\/logs'\)\s*\.get\(transactionCtrl\.logs\)\s*\.post\(transactionCtrl\.addLogMemo\)/.test(라우트) && /\.route\('\/:id\/logs\/:log_id'\)\s*\.put\(transactionCtrl\.updateLogMemo\)\s*\.delete\(transactionCtrl\.deleteLogMemo\)/.test(라우트));
  t('메모 추가: 40 이상·자기 몰 주문·빈 글 거부', /decode_user\?\.level < 40\) return lowLevelException/.test(추가) && /loadOwnedRow\(readPool, table_name, id, decode_user\)/.test(추가) && /if \(!note\) return response/.test(추가) && /kind: 'memo'/.test(추가));
  t('메모 고치기: 그 주문의 memo 줄만, 본인 또는 본사', /WHERE id=\? AND trans_id=\? AND kind='memo'/.test(고칠) && /Number\(메모\.actor_id\) !== Number\(decode_user\.id\) && Number\(decode_user\.level\) < 50/.test(고칠) && /loadOwnedRow\(/.test(고칠));
  t('메모 고치기: 쓰기 쿼리도 kind=memo 로 한 번 더 묶는다', (수정삭제.match(/WHERE id=\? AND kind='memo'`/g) ?? []).length === 3);
  t('메모 고치기: edited_at 칸이 없어도(마이그레이션 전) 내용은 고친다', /if \(e\?\.code !== 'ER_BAD_FIELD_ERROR'\) throw e;/.test(수정삭제));
  t('이력 조회: can_edit 은 memo 이고 본인·본사일 때만', /can_edit: r\.kind === 'memo' && \(Number\(r\.actor_id\) === Number\(decode_user\.id\) \|\| Number\(decode_user\.level\) >= 50\)/.test(거래));
  t('이력 조회: SELECT * — edited_at 없는 DB 에서도 동작', /SELECT \* FROM transaction_status_logs WHERE trans_id=\? ORDER BY id ASC/.test(기록));
  {
    const 식 = 거래.match(/const 메모정리 = (\(v\) => [^\n]*);/);
    const 정리 = 식 && new Function(`return ${식[1]}`)();
    t('메모 내용 정리: 공백·제어문자 제거, 줄바꿈 유지, 500자', !!정리 && 정리('  통화함\n회수 ') === '통화함\n회수' && 정리('a\u0000b') === 'ab' && 정리(3) === '' && 정리('x'.repeat(600)).length === 500);
  }

  // 취소 사유 고치기(가맹점 요청 2026-11-06) — 사유 부분만, 고친 일은 따로 남긴다
  const 사유 = 거래.slice(거래.indexOf('updateCancelReason: async'), 거래.indexOf('changeInvoice: async'));
  t('사유: 라우트 PUT /:id/logs/:log_id/reason', /\.route\('\/:id\/logs\/:log_id\/reason'\)\s*\.put\(transactionCtrl\.updateCancelReason\)/.test(라우트));
  t('사유: 40 이상·자기 몰 주문·그 주문의 cancel 줄만', /decode_user\?\.level < 40\) return lowLevelException/.test(사유) && /loadOwnedRow\(readPool, table_name, id, decode_user\)/.test(사유) && /WHERE id=\? AND trans_id=\? AND kind='cancel'`/.test(사유));
  t('사유: 쓰기도 kind=cancel 로 묶는다', (사유.match(/WHERE id=\? AND kind='cancel'`/g) ?? []).length === 2);
  t('사유: 고친 일을 reason_edit 줄로 남긴다(입력·수정·삭제)', /kind: 'reason_edit'/.test(사유) && 사유.includes('`취소 사유 입력: ${새}`') && 사유.includes('`취소 사유 삭제 (이전: ${옛})`') && 사유.includes('`취소 사유 수정: ${옛} → ${새}`'));
  t('사유: 원장(transaction_cancels) 사유도 맞춘다(옛 사유가 있을 때만)', /if \(옛\) \{\s*try \{\s*await writePool\.query\(`UPDATE transaction_cancels SET reason=\? WHERE trans_id=\? AND LEFT\(IFNULL\(reason,''\),120\)=\? ORDER BY id DESC LIMIT 1`/.test(사유));
  t('이력 조회: 취소 줄에 사유·고칠 수 있는지', /\.\.\.\(r\.kind === 'cancel' \? \{ cancel_reason: 취소사유나누기\(r\.note\)\.사유, can_edit_reason: Number\(decode_user\.level\) >= 40 \} : \{\}\)/.test(거래));
  {
    // 사유만 바뀌고 금액·수량·출고 후 표시는 그대로인지 실제로 돌려 본다
    const 몸 = 기록.slice(기록.indexOf('const 사유머리 ='));
    const { 나누기, 바꾸기 } = new Function(`${몸.replace(/export const /g, 'const ')}; return { 나누기: 취소사유나누기, 바꾸기: 취소사유바꾸기 };`)();
    const a = '부분 취소 7000원(PG 7000원 · 포인트 0P) — 케이블 1개 / 사유: 고객 요청 / 출고 후 취소(회수 확인)';
    const c = '전체 취소 (5000원) · 실제 취소 2026-11-02 16:12:45';
    t('사유 나누기·바꾸기: 금액·수량·출고 후 표시는 그대로', 나누기(a).사유 === '고객 요청'
      && 바꾸기(a, '단순 변심') === '부분 취소 7000원(PG 7000원 · 포인트 0P) — 케이블 1개 / 사유: 단순 변심 / 출고 후 취소(회수 확인)'
      && 바꾸기(a, '') === '부분 취소 7000원(PG 7000원 · 포인트 0P) — 케이블 1개 / 출고 후 취소(회수 확인)'
      && 나누기(c).사유 === '' && 바꾸기(c, '콘솔 취소') === `${c} / 사유: 콘솔 취소`);
  }
  t('이력 창: 취소 줄에 사유 수정·입력 버튼(서버 허락 줄만)', /\{r\.can_edit_reason && 사유고치는중\.id !== r\.id &&/.test(이력창) && 이력창.includes("{r.cancel_reason ? '사유 수정' : '사유 입력'}"));
  t('이력 창: 사유 저장 경로', 이력창.includes("apiManager(`transactions/${trxId}/logs`, 'update', { id: `${사유고치는중.id}/reason`, reason: 사유고치는중.reason.trim() })"));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
