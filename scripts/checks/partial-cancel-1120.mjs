import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 부분취소 빈틈 4가지(2026-11-20) — 실제 함수를 떼어 돌리고, 연결 자리는 소스로 확인한다.
//  ① 목록·엑셀이 원래 수량만 보여 취소한 상품까지 포장했다 → 보낼 수량·부분취소 환불액
//  ② 본상품만 다 취소하면 추가상품만 남아 발송됐다 → 추가상품 함께 취소(서버·관리자 창·손님 창)
//  ③ 상품별 배송비 몰에서 한 상품을 통째로 취소해도 그 배송비를 안 돌려줬다
//  ④ 포스페이 콘솔에서 먼저 부분취소한 주문을 여기서 또 취소하면 두 번 환불됐다 → 포스페이 취소 합계 대조
import { readFileSync } from 'fs';
import { pathToFileURL } from 'url';

const 백 = (p) => readFileSync(BACK_ROOT + p, 'utf8');
const 앞 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
const cancel = 백('utils.js/cancel.js');
const pay = 백('controllers/pay.controller.js');
const trxCtrl = 백('controllers/transaction.controller.js');

// cancel.js 는 DB 를 import 하므로 순수 함수만 떼어 평가한다(partial-cancel.mjs 와 같은 방식).
const grab = (name) => {
  const i = cancel.indexOf(`export const ${name} = `);
  if (i < 0) throw new Error('not found: ' + name);
  const rest = cancel.slice(i);
  const m = rest.slice(1).match(/\n(?:export )?const [A-Za-z가-힣]/);
  return rest.slice(0, m ? m.index + 1 : rest.length).replace(/^export /, '');
};
const { calcDeliveryAdjust, 추가상품줄인가, 추가상품함께 } = new Function(
  grab('calcDeliveryAdjust') + '\n' + grab('추가상품줄인가') + '\n' + grab('추가상품함께')
  + '\nreturn { calcDeliveryAdjust, 추가상품줄인가, 추가상품함께 };')();
const { 함께취소할추가상품 } = await import(pathToFileURL(FRONT_ROOT + 'src/utils/cancel-addon.js').href);

let pass = 0, fail = 0;
const eq = (n, g, w) => { if (JSON.stringify(g) === JSON.stringify(w)) { pass++; console.log('  ok  ' + n); }
  else { fail++; console.log(`FAIL ${n}\n  got : ${JSON.stringify(g)}\n  want: ${JSON.stringify(w)}`); } };
const t = (n, c) => eq(n, !!c, true);

// ── ③ 배송비 ─────────────────────────────────────────────────────────────
const 정책끔 = {};
const 정책 = { delivery_fee_default: '3000', free_ship_min: '30000' };
eq('③ 상품별 배송비 몰: 한 상품을 통째로 취소하면 그 줄 배송비를 돌려준다',
  calcDeliveryAdjust({ 전체취소: false, 취소후남은상품가: 10000, 총배송비: 6000, setting: 정책끔, 다취소된줄배송비: 3000 }), 3000);
eq('③ 상품별 배송비 몰: 수량 일부만 취소하면 배송비는 그대로',
  calcDeliveryAdjust({ 전체취소: false, 취소후남은상품가: 10000, 총배송비: 6000, setting: 정책끔, 다취소된줄배송비: 0 }), 0);
eq('③ 앞서 돌려준 줄 배송비는 전체취소 때 또 돌려주지 않는다',
  calcDeliveryAdjust({ 전체취소: true, 취소후남은상품가: 0, 총배송비: 6000, setting: 정책끔, 이미돌려준배송비: 3000 }), 3000);
eq('③ 정책 켠 몰은 줄 배송비를 보지 않는다(주문당 한 번, 예전 규칙)',
  calcDeliveryAdjust({ 전체취소: false, 취소후남은상품가: 40000, 총배송비: 0, setting: 정책, 다취소된줄배송비: 3000 }), 0);
eq('③ 정책 켠 몰: 무료 기준이 깨지면 배송비를 뺀다(예전 그대로)',
  calcDeliveryAdjust({ 전체취소: false, 취소후남은상품가: 20000, 총배송비: 0, setting: 정책 }), -3000);
eq('③ 전체취소: 뺐던 배송비까지 돌려준다(예전 그대로)',
  calcDeliveryAdjust({ 전체취소: true, 취소후남은상품가: 0, 총배송비: 0, setting: 정책, 이미상계: 3000 }), 3000);
t('③ 다 취소된 줄 배송비에서 섬추가비 줄의 추가비를 뺀다(다른 상품이 계속 그 지역으로 나간다)',
  /const 섬줄id = 섬추가비줄id\(state\.lines\);/.test(cancel)
  && /Number\(c\.line\.id\) === 섬줄id \? \(Number\(state\.trx\?\.island_fee\) \|\| 0\) : 0/.test(cancel)
  && /\.filter\(\(c\) => c\.line\.remain_count - c\.qty === 0\)/.test(cancel));
t('③ 앞서 돌려준 배송비는 transaction_cancels.delivery_fee 양수 합',
  /SUM\(CASE WHEN delivery_fee > 0 THEN delivery_fee ELSE 0 END\)/.test(cancel) && /이미돌려준배송비: Number\(돌려준\?\.s\) \|\| 0/.test(cancel));

// ── ② 추가상품 함께 취소 ────────────────────────────────────────────────
const 본 = { id: 1, product_id: 7, remain_count: 2, order_groups: JSON.stringify([{ options: [{ id: 1 }] }]) };
const 소스 = { id: 2, product_id: 7, remain_count: 3, order_groups: JSON.stringify([{ addon_line: 1, options: [{ id: 9 }] }]) };
const 딴상품 = { id: 3, product_id: 8, remain_count: 1, order_groups: '[]' };
eq('② 서버: 추가상품 줄 판별(order_groups 의 addon_line)', [추가상품줄인가(본), 추가상품줄인가(소스)], [false, true]);
eq('② 서버: 본상품을 다 취소하면 추가상품 남은 수량 전부가 따라온다',
  추가상품함께([본, 소스, 딴상품], [{ order_id: 1, qty: 2 }]), [{ order_id: 1, qty: 2 }, { order_id: 2, qty: 3 }]);
eq('② 서버: 본상품 일부만 취소하면 추가상품은 그대로',
  추가상품함께([본, 소스, 딴상품], [{ order_id: 1, qty: 1 }]), [{ order_id: 1, qty: 1 }]);
eq('② 서버: 추가상품 일부를 골랐어도 본상품을 다 취소하면 남은 전부로 맞춘다',
  추가상품함께([본, 소스], [{ order_id: 1, qty: 2 }, { order_id: 2, qty: 1 }]), [{ order_id: 1, qty: 2 }, { order_id: 2, qty: 3 }]);
eq('② 서버: 본상품 줄이 없는 옛 주문의 추가상품은 건드리지 않는다',
  추가상품함께([소스, 딴상품], [{ order_id: 3, qty: 1 }]), [{ order_id: 3, qty: 1 }]);
t('② 서버: 금액 계산 전에 추가상품을 채운다(실행·미리보기 둘 다)', (cancel.match(/추가상품함께\(state\.lines, 요청\);\s*const (?:결과|r) = await 취소계산\(state, 요청/g) || []).length === 2);
const 화면줄 = [{ id: 1, product_id: 7, groups: [{ options: [] }] }, { id: 2, product_id: 7, groups: [{ addon_line: 1 }] }];
const 남은 = { 1: 2, 2: 3 };
eq('② 화면: 본상품 전부 고르면 추가상품 칸이 남은 수량으로 채워진다',
  함께취소할추가상품(화면줄, { 키: (l) => l.id, 남은: (l) => 남은[l.id], 고른: (l) => (l.id === 1 ? 2 : 0) }), { 2: 3 });
eq('② 화면: 본상품 일부면 채우지 않는다',
  함께취소할추가상품(화면줄, { 키: (l) => l.id, 남은: (l) => 남은[l.id], 고른: (l) => (l.id === 1 ? 1 : 0) }), {});
eq('② 화면: 관리자 창은 서버가 준 is_addon 을 쓴다',
  함께취소할추가상품([{ order_id: 1, product_id: 7, is_addon: false }, { order_id: 2, product_id: 7, is_addon: true }],
    { 키: (l) => l.order_id, 남은: () => 1, 고른: (l) => (l.order_id === 1 ? 1 : 0) }), { 2: 1 });
t('② 서버: 부분취소 창 조회에 is_addon 을 싣는다', /is_addon: 추가상품줄인가\(l\)/.test(pay));
const 관리자창 = 앞('src/components/manager/PartialCancelDialog.js');
const 손님창 = 앞('src/components/elements/shop/OrderCancelButton.js');
t('② 관리자 창: 고른수량이 함께 취소분을 포함하고 그 칸은 잠근다',
  /const 고른수량 = \(l\) => 함께\[l\.order_id\] \?\? 직접수량\(l\);/.test(관리자창) && /함께\[l\.order_id\] !== undefined\}/.test(관리자창));
t('② 손님 창: 같은 규칙', /const 고른수량 = \(o\) => 함께\[o\.id\] \?\? 직접수량\(o\);/.test(손님창)
  && /translate\('본상품을 모두 취소하므로 이 추가상품도 함께 취소됩니다\.'\)/.test(손님창));

// ── ④ 포스페이 콘솔 취소 대조 ───────────────────────────────────────────
t('④ 대조 함수: 포스페이 취소 합계 > 우리 현금 환불이면 멈춘다', /const 포스페이취소대조 = async \(trx, 이미현금\) =>/.test(pay)
  && /if \(포스페이 > \(Number\(이미현금\) \|\| 0\)\)/.test(pay) && /forspayGetCancelRecords\(\{ app_key: creds\.app_key, ord_num: trx\.ord_num \}\)/.test(pay));
t('④ 대조 조회가 실패하면 취소하지 않는다', /포스페이 취소 내역을 확인하지 못했습니다/.test(pay));
t('④ 부분취소 실행에 대조를 건다', /pgPrecheck: async \(\{ trx, 이미현금 \}\) => 포스페이취소대조\(trx, 이미현금\)/.test(pay));
t('④ 전체취소(포스페이)에도 건다 — 콘솔에서 일부 취소된 주문에 전액을 걸지 않게', /const 대조 = await 포스페이취소대조\(trx, 0\);/.test(pay)
  && pay.indexOf('const 대조 = await 포스페이취소대조(trx, 0);') < pay.indexOf('if (현금 > 0) await forspayCancelTransaction'));
t('④ cancel.js: 대조는 원장 기록·PG 호출보다 먼저', cancel.indexOf('await pgPrecheck(') > 0
  && cancel.indexOf('await pgPrecheck(') < cancel.indexOf('INSERT INTO transaction_cancels'));

// ── ① 목록·엑셀 ─────────────────────────────────────────────────────────
const 칸 = 앞('src/components/manager/OrderColumns.js');
const 목록 = 앞('src/pages/manager/orders/trx/[type].js');
t('① 서버: 목록·비회원 조회에 부분취소 환불액(현금)·취소요청 수량을 싣는다', /await 부분취소정보붙이기\(data\.content\);/.test(trxCtrl)
  && /await 부분취소정보붙이기\(list\);/.test(trxCtrl) && /await 부분취소정보붙이기\(\[data\]\);/.test(trxCtrl)
  && /t\.partial_refund = h\.cash;/.test(cancel) && /o\.requested_count = /.test(cancel));
t('① 수량 칸은 보낼 수량의 합', /const 합 = 줄들\.reduce\(\(s, o\) => s \+ 보낼수량\(row, o\), 0\);/.test(칸));
t('① 전체취소·취소 원장 줄은 원래 수량', /export const 보낼수량 = \(row, o\) => \(살아있는주문\(row\) \? 줄남은수량\(o\) : \(Number\(o\?\.order_count\) \|\| 0\)\);/.test(칸));
t('① 상품 줄마다 상태 표시(「취소」/「n개 취소」)와 「m개 중 n개 발송」·「발송 안 함」', /\? <span style=\{표\('#fde9e9', '#c23b3b'\)\}>취소<\/span>/.test(칸)
  && /개 취소<\/span>/.test(칸) && /`\$\{commarNumber\(order\?\.order_count\)\}개 중 \$\{commarNumber\(남음\)\}개 발송`/.test(칸) && /다취소 \? '발송 안 함'/.test(칸));
t('① 취소·취소요청이 있는 주문은 처음부터 펼친다', /const \[펼침, set펼침\] = useState\(부분취소있음\(row\) \|\| /.test(칸));
t('① 추가상품 줄은 본상품 이름을 되풀이하지 않고 본상품 아래에 붙는다', /const 줄순서 = \(orders\) =>/.test(칸) && /const 줄들 = 줄순서\(row\?\.orders\);/.test(칸)
  && /\{추가\s*\n\s*\/\/ 추가상품 줄은 본상품 이름을 되풀이하지 않고/.test(칸));
t('① 수량 칸 「주문 n개 중 m개 취소」', /주문 \{commarNumber\(원래\)\}개 중<br \/>\{commarNumber\(취소합\)\}개 취소/.test(칸));
t('① 금액 칸 「환불 n원」·「남은 금액 n원」', /환불 \{commarNumber\(row\.partial_refund\)\}원/.test(칸) && /남은 금액 \{commarNumber\(/.test(칸));
t('① 상태 칸 「부분취소」 표시', /\{부분취소있음\(row\) &&\s*\n\s*<span[^>]*>부분취소<\/span>\}/.test(목록));
t('① 엑셀: 수량 열·주문상품 글이 보낼 수량', /value: \(r\) => \(r\?\.orders \?\? \[\]\)\.reduce\(\(s, o\) => s \+ 보낼수량\(r, o\), 0\)/.test(목록)
  && /× \$\{보낼수량\(row, o\)\}/.test(목록));
t('① 엑셀: 취소여부에 「부분취소」, 부분취소 환불액 열', /부분취소있음\(r\) \? '부분취소'/.test(목록) && /label: '부분취소 환불액'/.test(목록));

// ── 11/20 2차: 취소 사유·배송비 선택·주문 당시 배송비 규칙 — 취소계산을 실제로 돌린다(DB 는 가짜) ─────────
{
  const grab2 = (name) => {
    const i = cancel.indexOf(`const ${name} = `);
    if (i < 0) throw new Error('not found: ' + name);
    const rest = cancel.slice(i);
    const m = rest.slice(1).match(/\n(?:export )?const [A-Za-z가-힣]/);
    return rest.slice(0, m ? m.index + 1 : rest.length);
  };
  const 몰설정 = { delivery_fee_default: 4000, free_ship_min: 50000 };   // 지금 몰 설정(주문 뒤 바뀐 값)
  const 가짜DB = { query: async (sql) => (/setting_obj/.test(sql) ? [[{ setting_obj: JSON.stringify(몰설정) }]] : [[{ s: 0 }]]) };
  const 만들기 = new Function('readPool', '원장합', '사용포인트몫',
    grab('calcCancelAmount') + '\n' + grab('calcDeliveryAdjust') + '\n' + grab('추가상품줄인가') + '\n'
    + grab2('섬추가비줄id') + '\n' + grab2('배송비규칙') + '\n' + grab2('취소계산') + '\nreturn 취소계산;');
  const 취소계산 = 만들기(가짜DB, async () => 0, async () => 0);
  const 줄 = (id, 가격) => ({ id, order_name: `상품${id}`, product_id: id, order_count: 1, remain_count: 1, merch_amount: 가격, unit_price: 가격,
    remain_amount: 가격, cancel_amount: 0, delivery_fee: 0, order_groups: '[]' });
  // 주문 당시: 3만원 이상 무료, 배송비 3,000원 → 28,000 + 2,500 = 30,500 무료배송
  const 상태 = (규칙 = '{"base":3000,"free_min":30000}') => ({ trx: { id: 1, brand_id: 9, amount: 30500, use_point: 0, island_fee: 0, ship_policy: 규칙 },
    lines: [줄(11, 28000), 줄(12, 2500)] });
  const B만 = [{ order_id: 12, qty: 1 }];
  const r1 = await 취소계산(상태(), B만, { fault: 'buyer' });
  eq('⑤ 배송비가 상품값보다 크면 막지 않고 고르게 한다(need_ship_choice)', [r1.ok, r1.need_ship_choice, r1.상품가, r1.배송비], [false, true, 2500, 3000]);
  const r2 = await 취소계산(상태(), B만, { fault: 'buyer', ship_choice: 'waive' });
  eq('⑤ 배송비 받지 않음 → 상품값 전부 환불', [r2.ok, r2.환불액, r2.배송비조정, r2.배송비처리], [true, 2500, 0, 'waive']);
  const r3 = await 취소계산(상태(), B만, { fault: 'buyer', ship_choice: 'no_refund' });
  eq('⑤ 환불 없이 빼기 → 0원, 상품값만큼 배송비를 받은 것으로 기록', [r3.ok, r3.환불액, r3.배송비조정, r3.PG금액], [true, 0, -2500, 0]);
  const r4 = await 취소계산(상태(), B만, { fault: 'seller' });
  eq('⑥ 판매자 사정 → 배송비를 빼지 않는다(차감예정은 화면 안내용으로 남김)', [r4.ok, r4.환불액, r4.배송비조정, r4.차감예정, r4.fault], [true, 2500, 0, 3000, 'seller']);
  const r5 = await 취소계산(상태(), [{ order_id: 11, qty: 1 }], { fault: 'buyer' });
  eq('⑥ 손님 사정·상품값이 더 크면 예전처럼 배송비를 뺀다', [r5.ok, r5.환불액, r5.배송비조정], [true, 25000, -3000]);
  const r6 = await 취소계산(상태(null), [{ order_id: 11, qty: 1 }], { fault: 'buyer' });
  eq('⑦ 주문 당시 규칙이 없는 옛 주문은 지금 몰 설정(배송비 4,000원)', [r6.ok, r6.배송비조정], [true, -4000]);
  const r7 = await 취소계산({ ...상태(), lines: [줄(11, 35000), 줄(12, 5000)], trx: { ...상태().trx, amount: 40000 } }, B만.map((x) => ({ ...x })), { fault: 'buyer' });
  eq('⑦ 주문 당시 3만원 기준이면 남은 35,000원은 여전히 무료(지금 5만원 기준이어도 안 뺀다)', [r7.ok, r7.배송비조정, r7.환불액], [true, 0, 5000]);
}

// ── 11/20 2차: 연결 자리 ───────────────────────────────────────────────
{
  const util = 백('controllers/util.controller.js');
  const dash = 백('controllers/dashboard.controller.js');
  const merch = 백('controllers/merchant_application.controller.js');
  const payRoute = 백('routes/pay.route.js');
  const trxRoute = 백('routes/transaction.route.js');
  const 마이그 = 백('migrations/2026-11-20_ship_policy.sql');
  t('⑦ 주문 당시 배송비 규칙을 주문에 남긴다(칸이 있을 때만)', /ship_policy: JSON\.stringify\(shipPolicy\)/.test(pay) && /shipPolicy: \{ base: shipBase, free_min: shipFreeMin \}/.test(pay)
    && /hasColumn\('transactions', 'ship_policy'\)/.test(cancel) && /ALGORITHM=INSTANT/.test(마이그));
  t('⑤⑥ 실행·미리보기가 사유·배송비 선택을 받는다', /fault: fault === 'seller' \? 'seller' : 'buyer',\s*\n\s*ship_choice: \['waive', 'no_refund'\]\.includes\(ship_choice\)/.test(pay)
    && /\.route\('\/cancel-partial\/:id\/preview'\)\s*\n\s*\.post\(payCtrl\.cancelPreview\)/.test(payRoute));
  t('⑤ 환불 없이 빼면 포인트도 움직이지 않는다', /if \(환불액 > 0 \|\| 전체취소\) await applyCancelEffects/.test(cancel));
  t('⑧ 일부 취소요청은 주문 상태를 바꾸지 않는다', /const 일부요청 = 기록됨 && 요청합 > 0 && 요청합 < 남은합;/.test(trxCtrl) && /if \(!일부요청\) \{\s*\n\s*await updateQuery/.test(trxCtrl));
  t('⑧ 처리 안 한 요청이 있으면 다시 받지 않는다', /이미 취소요청한 상품이 있습니다/.test(trxCtrl));
  t('⑧ 취소요청 탭·엑셀·손님 반품조회가 요청 기록으로도 잡는다', (trxCtrl.match(/요청대기식\(/g) || []).length >= 3);
  t('⑧ 요청 거절(관리자 40+) — 요청 닫고 취소요청 상태면 결제완료로', /rejectCancelRequest: async/.test(trxCtrl) && /\.route\('\/:id\/cancel-request\/reject'\)/.test(trxRoute)
    && /Number\(decode_user\?\.level\) < 40/.test(trxCtrl));
  t('⑧ 상태를 직접 바꾸면 요청을 닫고, 일괄 변경은 요청 걸린 주문을 건너뛴다', /const 닫음 = await 취소요청닫기\(id\);/.test(util) && /취소요청이 걸린 주문은 한 건씩/.test(util));
  t('⑧ 전체취소되면 대기 요청을 처리됨으로 닫는다', /UPDATE transaction_cancel_requests SET status=1, processed_at=NOW\(\) WHERE trans_id=\? AND status=0/.test(cancel));
  t('⑨ 대시보드·가맹점 요약 매출에서 부분취소 현금을 뺀다', /await 부분환불합\(부분주문\.map/.test(dash) && /await 부분환불합\(부분주문\.map/.test(merch));
  t('⑨ 부분취소 현금 = 원장 환불액 − 포인트 환불', /cash: Math\.max\(0, 전체 - p\)/.test(cancel));
  t('⑩ 비회원 조회가 주문 줄 옵션(order_groups)을 읽는다', /JSON\.parse\(od\[i\]\?\.order_groups \?\? od\[i\]\?\.groups \?\? "\[\]"\)/.test(trxCtrl));
  const 관리자창2 = 앞('src/components/manager/PartialCancelDialog.js');
  t('⑥ 관리자 창: 누구 사정인지 골라야 다음으로', /누구 사정으로 취소하나요\?/.test(관리자창2) && /!고른줄\.length \|\| !사정\}/.test(관리자창2));
  t('⑤ 관리자 창: 확인 단계 금액은 서버 미리보기, 배송비 처리 고르기', /pays\/cancel-partial\/\$\{trxId\}\/preview/.test(관리자창2) && /value="waive"/.test(관리자창2) && /value="no_refund"/.test(관리자창2));
  t('⑧ 관리자 창: 요청 거절 버튼', /transactions\/\$\{trxId\}\/cancel-request\/reject/.test(관리자창2));
  const 손님창2 = 앞('src/components/elements/shop/OrderCancelButton.js');
  t('⑧ 손님: 요청 중이면 버튼이 「취소요청 중」으로 잠긴다', /Number\(trx\?\.cancel_request_count\) > 0/.test(손님창2) && /translate\('취소요청 중'\)/.test(손님창2));
  const 손님화면 = ['src/views/blog/auth/my-page/order/demo-1.js', 'src/views/blog/auth/my-page/order/demo-2.js', 'src/views/blog/auth/my-page/order/demo-3.js',
    'src/views/blog/auth/my-page/order/demo-4.js', 'src/views/blog/auth/my-page/order/demo-5.js', 'src/components/elements/shop/common.js',
    'src/components/elements/blog/common.js', 'src/pages/shop/auth/order-check.js'];
  t('⑪ 손님 주문내역 8곳에 「n개 취소됨·취소요청」 표시', 손님화면.every((f) => /<CancelLineNote line=\{/.test(앞(f)) && /import CancelLineNote\b/.test(앞(f))));
  t('⑧ 목록: 줄 「취소요청 n개」·상태 「일부 취소요청」', /취소요청 \{commarNumber\(요청\)\}개/.test(칸) && /일부 취소요청<\/span>/.test(목록));
}

// ── 11/20 3차: 취소완료 탭에 부분취소·손님 화면 상태/환불 ───────────────────
{
  const 취소화면 = 앞('src/pages/manager/orders/trx-cancel/[type].js');
  t('⑫ 취소완료 탭에 부분취소 주문도(전체/전체취소/부분취소 거르기)', /취소구분 === 'full' \? ` AND is_cancel=1 `/.test(trxCtrl) && /AND \(is_cancel=1 OR \$\{부분취소줄\}\)/.test(trxCtrl)
    && /\[\['', '전체'\], \['full', '전체취소'\], \['partial', '부분취소'\]\]/.test(취소화면) && /cancel_kind: '', page: 1/.test(취소화면));
  t('⑫ 손님 반품/환불 조회에 일부 취소된 주문도', /OR EXISTS \(SELECT 1 FROM transaction_cancels tc WHERE tc\.trans_id=\$\{table_name\}\.id\)\) AND is_cancel=0 `/.test(trxCtrl));
  const fn = 앞('src/utils/function.js');
  t('⑬ 손님 상태 「결제완료 · 일부 취소 / 취소요청 중」', /export const 주문상태꼬리 = /.test(fn) && /꼬리\.push\('일부 취소'\)/.test(fn) && /꼬리\.push\('취소요청 중'\)/.test(fn));
  const 상태자리 = ['src/components/elements/blog/common.js', 'src/components/elements/shop/common.js', 'src/pages/shop/auth/order-check.js',
    'src/views/blog/auth/my-page/order/demo-1.js', 'src/views/blog/auth/my-page/order/demo-2.js', 'src/views/blog/auth/my-page/order/demo-3.js',
    'src/views/blog/auth/my-page/order/demo-4.js', 'src/views/blog/auth/my-page/order/demo-5.js'];
  t('⑬ 손님 화면 상태 글은 모두 손님주문상태', 상태자리.every((f) => /손님주문상태\(/.test(앞(f)) && !/translate\(getOrderStatusText\(/.test(앞(f))));
  t('⑬ 결제금액 아래 「환불 · 남은 결제금액」(비회원 조회·주문내역 표)', /<PartialRefundNote row=\{order\}/.test(앞('src/pages/shop/auth/order-check.js'))
    && (앞('src/components/elements/shop/common.js').match(/<PartialRefundNote row=\{row\} \/>/g) || []).length === 2
    && (앞('src/components/elements/blog/common.js').match(/<PartialRefundNote row=\{row\} \/>/g) || []).length === 2);
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
