import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 여러 곳으로 보내기(2026-11-20) — 결제 한 번(포스페이 주문번호 G), 배송지마다 주문(G, G-2 … G-10, pay_group=G).
// 사장님 결정: 최대 10곳 · 무료배송은 배송지별 · 비회원도 · 「선물하기」라고 부르지 않는다.
// 붙잡아 두는 것:
//  ① 묶음 계산(주문번호·현금 환불 합) — 실제 함수를 가짜 DB 로 돌린다
//  ② 결제 확정은 묶음 합계·묶음 번호로만, 묶음 주문 전부를 한꺼번에
//  ③ 포스페이 취소·통지·대조는 묶음 번호와 묶음 전체 환불로 비교(다른 배송지 취소를 이 주문 몫으로 보지 않게)
//  ④ 주문 만들기: 포스페이·포인트 없음·국내·몰 설정 켠 곳·10곳까지, 배송지마다 금액 재계산, 합쳐서 재고 검사
//  ⑤ 주문서: 켠 몰·포스페이 있을 때만 단추, 수량 다 나눠야 결제, 배송지별 금액 합
import { readFileSync } from 'fs';
const 백 = (p) => readFileSync(BACK_ROOT + p, 'utf8');
const 앞 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
const pg = 백('utils.js/pay-group.js');
const pay = 백('controllers/pay.controller.js');
const 대조 = 백('scripts/forspay-reconcile.mjs');
const 마이그 = 백('migrations/2026-11-20_pay_group.sql');

let pass = 0, fail = 0;
const eq = (n, g, w) => { if (JSON.stringify(g) === JSON.stringify(w)) { pass++; console.log('  ok  ' + n); }
  else { fail++; console.log(`FAIL ${n}\n  got : ${JSON.stringify(g)}\n  want: ${JSON.stringify(w)}`); } };
const t = (n, c) => eq(n, !!c, true);

// ── ① 묶음 계산 ───────────────────────────────────────────────────────────
{
  const 몸 = pg.replace(/^import .*$/gm, '').replace(/^export /gm, '');
  let 가짜 = [];
  const readPool = { query: async () => [가짜] };
  const f = new Function('readPool', 몸 + '\nreturn { 묶음주문번호, 결제주문번호, 묶음현금환불, 묶음금액, 묶음최대 };')(readPool);
  eq('① 묶음 주문번호: 1번은 G, 나머지는 G-k', [f.묶음주문번호('FS1', 1), f.묶음주문번호('FS1', 3), f.묶음주문번호('FS1', 10)], ['FS1', 'FS1-3', 'FS1-10']);
  eq('① 최대 10곳', f.묶음최대, 10);
  eq('① PG 주문번호: 묶음이면 묶음 번호, 아니면 자기 번호', [f.결제주문번호({ ord_num: 'FS1-2', pay_group: 'FS1' }), f.결제주문번호({ ord_num: 'X9' })], ['FS1', 'X9']);
  eq('① 묶음 금액 = 주문 금액 합', f.묶음금액([{ amount: 30000 }, { amount: 18000 }, { amount: 5000 }]), 53000);
  // A: 「전체 취소」로 통째 취소(원장 없음) 30,000 / B: 부분취소 원장 5,000 / C: 취소 없음
  가짜 = [{ trans_id: 2, s: 5000, n: 1 }];
  eq('① 묶음 현금 환불 = 통째 취소 주문 금액 + 원장 환불 합',
    await f.묶음현금환불([{ id: 1, amount: 30000, is_cancel_trans: 1 }, { id: 2, amount: 18000, is_cancel_trans: 0 }, { id: 3, amount: 5000, is_cancel_trans: 0 }]), 35000);
  가짜 = [{ trans_id: 1, s: 30000, n: 2 }];
  eq('① 부분취소를 거듭해 전부 취소된 주문은 원장 합(금액을 또 더하지 않는다)', await f.묶음현금환불([{ id: 1, amount: 30000, is_cancel_trans: 1 }]), 30000);
  t('① 묶음은 주문번호 목록으로 찾는다(445만 행에 새 인덱스 없이)', /WHERE ord_num IN \(\$\{번호\.map/.test(pg) && /AND pay_group=\? AND IFNULL\(is_cancel,0\)=0/.test(pg));
  t('① 마이그레이션: 칸만 INSTANT 로, 인덱스 없음', /ADD COLUMN pay_group VARCHAR\(64\) NULL/.test(마이그) && /ALGORITHM=INSTANT/.test(마이그) && !/ADD INDEX|CREATE INDEX/i.test(마이그));
}

// ── ② 결제 확정 ───────────────────────────────────────────────────────────
t('② 묶음이면 묶음정산으로(승인 하나로 묶음 주문 전부)', /if \(trx\.pay_group\) return await 묶음정산\(trx, txn, data\);/.test(pay));
t('② 묶음정산: 승인 주문번호 = 묶음 번호, 승인 금액 = 묶음 합계', /String\(txn\?\.ord_num \?\? ''\) !== String\(trx\.pay_group\)/.test(pay)
  && /const 합계 = 묶음금액\(rows\);\s*\n\s*if \(Number\(txn\?\.amount\) !== 합계\)/.test(pay));
t('② 묶음정산: 0·-1 인 주문만 원자적으로 5, 바꾼 주문만 적립·늦은승인정리', /WHERE id=\? AND trx_status IN \(0, -1\) AND IFNULL\(is_cancel_trans,0\)=0`,\s*\n\s*\[data\.trx_id \?\? r\.trx_id/.test(pay)
  && /if \(!바꿈\?\.affectedRows\) continue;/.test(pay));

// ── ③ 취소·통지·대조 ───────────────────────────────────────────────────────
t('③ 포스페이 취소는 묶음 번호로(전체 취소·부분취소 둘 다)', (pay.match(/forspayCancelTransaction\(\{ app_key: creds\.app_key, ord_num: 결제주문번호\(trx\), amount/g) || []).length === 2
  && !/forspayCancelTransaction\(\{ app_key: creds\.app_key, ord_num: trx\.ord_num/.test(pay));
t('③ 두 번 환불 대조: 묶음이면 묶음 전체 환불로 비교', /if \(trx\.pay_group\) 이미현금 = await 묶음현금환불\(await 묶음주문들\(trx\)\);/.test(pay));
t('③ 웹훅: 묶음 전액이면 남은 주문 모두 취소, 우리 기록보다 많으면 확인 필요, 같으면 손대지 않음',
  /if \(합계 > 0 && cancelledTotal >= 합계\) \{\s*\n\s*for \(const r of 묶음\)/.test(pay) && /else if \(cancelledTotal > 우리\)/.test(pay));
t('③ 대조 스크립트: 묶음마다 한 번, 묶음 번호로 묻고 묶음 기준으로 판단', /const candidates = 한번만\(후보\);/.test(대조) && /const pendings = 한번만\(대기\);/.test(대조)
  && (대조.match(/ord_num: 결제번호\(t\)/g) || []).length === 2 && /if \(t\.pay_group\) \{/.test(대조));

// ── ④ 주문 만들기 ─────────────────────────────────────────────────────────
t('④ ready: destinations_json 이 있으면 여러곳주문(주체·결제수단·상품 상태 검사 뒤)', pay.indexOf('if (req.body?.destinations_json) {') > pay.indexOf('결제모듈로만 주문을 받는다')
  && pay.indexOf('if (req.body?.destinations_json) {') < pay.indexOf('── 결제금액 검증(서버 재계산)'));
t('④ 막는 것: 2~10곳·포스페이만·셀러몰·포인트·칸 없음·몰 설정 꺼짐',
  /목록\.length < 2 \|\| 목록\.length > 묶음최대/.test(pay) && /Number\(trx_method\) !== 41/.test(pay) && /Number\(seller_id\) > 0/.test(pay)
  && /\(parseInt\(use_point\) \|\| 0\) > 0/.test(pay) && /hasColumn\('transactions', 'pay_group'\)/.test(pay) && /Number\(s\?\.multi_ship\) === 1/.test(pay));
t('④ 배송지마다 금액 재계산(국내 주소로 — 무료배송·제주 추가비가 배송지별)', /recalcOrderAmount\(brand_id, 줄, 0, 0, \{ zonecode: 우편, addr: 주소, country_code: 'KR'/.test(pay));
t('④ 화면 합계 = 서버 합계여야 결제', /client_amount !== 합계/.test(pay));
t('④ 상품 상태·옵션·한정·재고·입력항목은 모든 배송지 줄을 합쳐서', /SELECT id, status FROM products WHERE id IN/.test(pay.slice(pay.indexOf('async function 여러곳주문')))
  && /await checkStock\(모든줄\)/.test(pay) && /await checkPurchaseLimit\(user_id, 모든줄\)/.test(pay));
t('④ 주문번호 G 는 60자로 자르고 G·G-2… 가 이미 있으면 거절', /\.replace\(\/\[\^a-zA-Z0-9\]\/g, ''\)\.slice\(0, 60\)/.test(pay) && /주문번호가 중복되었습니다/.test(pay.slice(pay.indexOf('async function 여러곳주문'))));
t('④ 저장·재고·결제창 실패면 만든 주문을 모두 정리', (pay.slice(pay.indexOf('async function 여러곳주문'), pay.indexOf('const payCtrl = {')).match(/await 정리\(\);/g) || []).length >= 5);
t('④ 결제창은 묶음 합계·묶음 번호로 한 번', /amount: 합계, item_name: item_name \|\| '상품', buyer_name, ord_num: G,/.test(pay));

// ── ⑤ 주문서 ───────────────────────────────────────────────────────────────
const 주문서 = 앞('src/views/shop/order/OrderSheet.js');
const 편집 = 앞('src/views/shop/order/MultiShipEditor.js');
const util = 앞('src/utils/shop-util.js');
const 설정 = 앞('src/pages/manager/settings/default/[brand_id].js');
t('⑤ 켠 몰·포스페이 있을 때만 「여러 곳으로 보내기」, 켜면 포스페이만 보인다',
  /const 여러곳가능 = Number\(themeDnsData\?\.setting_obj\?\.multi_ship\) === 1 && 모든결제수단\.some\(\(m\) => m\?\.type == 'auth_forspay'\);/.test(주문서)
  && /const paymentModules = 여러곳 \? 모든결제수단\.filter\(\(m\) => m\?\.type == 'auth_forspay'\) : 모든결제수단;/.test(주문서));
t('⑤ 결제 전 검사(수량 다 나누기·받는 분·연락처·주소·추가상품·배송 안 함·포인트)', /const 문제 = 여러곳검사\(곳들, products, isValidPhoneNumber, 보내는방식\);/.test(주문서) && /여러 곳으로 보내기에서는 포인트를 사용할 수 없습니다/.test(주문서));
t('⑤ 금액은 배송지별 calcOrderTotals 의 합', /const 곳금액 = 여러곳 \? 곳별금액\(곳들, products, 보내는방식\) : null;/.test(주문서) && /calcOrderTotals\(곳의줄\(곳, products, 방식\), 0, \{ \.\.\.곳, country_code: 'KR' \}\)/.test(편집));
t('⑤ 결제: 배송지마다 makePayData, 목록은 JSON 한 칸', /const d = await makePayData\(줄, \{ \.\.\.배송지, use_point: 0 \}\);/.test(util) && /destinations_json: JSON\.stringify\(destinations\)/.test(util));
// 주석의 「선물하기라고 부르지 않는다」는 빼고, 화면 글자·코드에만 없는지 본다
const 주석뺌 = (x) => x.split('\n').filter((l) => !/^\s*(\/\/|\*|\{\/\*)/.test(l)).join('\n');
t('⑤ 「선물하기」라는 이름을 쓰지 않는다', !/선물하기/.test(주석뺌(편집)) && !/선물하기/.test(주석뺌(util.slice(util.indexOf('onPayProductsByForspayMulti')))) && !/선물하기/.test(주석뺌(주문서)));
t('⑤ 관리자 배송비설정에 켜기 스위치(기본 꺼짐)', /\['multi_ship'\]: e\.target\.checked \? 1 : 0/.test(설정) && /checked=\{Number\(item\?\.setting_obj\?\.multi_ship\) === 1\}/.test(설정));

// 11/20 재검토에서 고친 것
t('⑥ 「다시 결제하기」·새로고침이 배송지 목록을 되살린다(10곳을 다시 쓰게 하지 않는다)',
  /saveRetryDraft\(payData, \{ addrMode, directMode, sameAsBuyer, selectedAddrId, 여러곳, 곳들, 보내는방식 \}, isBuyNow\(\)\);/.test(주문서)
  && /saveSessionDraft\(payData, \{ addrMode, directMode, sameAsBuyer, selectedAddrId, 여러곳, 곳들, 보내는방식 \}/.test(주문서)
  && /if \(s\.여러곳 === true && Array\.isArray\(s\.곳들\) && s\.곳들\.length >= 2\) \{ set여러곳\(true\); set곳들\(s\.곳들\); set보내는방식\(/.test(주문서));
t('⑥ 상품 줄이 바뀌면 배송지별 수량을 되돌린다(줄 번호가 밀려 다른 상품에 붙지 않게)', /지난상품꼴\.current !== 상품꼴/.test(주문서) && /상품이 바뀌어 배송지별 수량을 처음으로 되돌렸습니다/.test(주문서));
t('⑥ 여러 곳이면 PC 포인트 칸도 숨긴다', /enablePoint=\{!여러곳\}/.test(주문서));
t('⑥ 다른 화면의 옛 설정 저장이 스위치를 끄지 못한다(보내지 않았을 때만 DB 값 유지)',
  /설정\.multi_ship === undefined\) \{/.test(백('controllers/brand.controller.js')) && /JSON_EXTRACT\(setting_obj, '\$\.multi_ship'\)/.test(백('controllers/brand.controller.js')));

// 편집 화면의 계산을 실제로 돌린다(React 없이 순수 함수만)
{
  const 뽑기 = (name) => { const i = 편집.indexOf(`export const ${name} = `); const r = 편집.slice(i); const m = r.slice(1).match(/\n(?:export )?const |\nexport default/); return r.slice(0, m ? m.index + 1 : r.length).replace(/^export /, ''); };
  const isAddonLine = (p) => Number(p?.addon_line) === 1;
  const f = new Function('isAddonLine', 'calcOrderTotals', [뽑기('최대곳'), 뽑기('곳의줄'), 뽑기('남은수량'), 뽑기('여러곳검사'), 뽑기('똑같이나누기')].join('\n') + '\nreturn { 곳의줄, 남은수량, 여러곳검사, 똑같이나누기 };')(isAddonLine, () => ({}));
  const 상품 = [{ id: 7, product_name: '홍게', order_count: 3 }, { id: 7, product_name: '홍게', addon_line: 1, order_count: 2 }];
  const 전화 = (v) => /^010-?\d{4}-?\d{4}$/.test(String(v ?? ''));
  const 곳 = (수량, 덧) => ({ receiver: '김', addr_phone: '010-1234-5678', zonecode: '06000', addr: '서울', 수량, ...덧 });
  eq('⑤ 남은 수량 = 주문 수량 − 나눈 합', f.남은수량([곳({ 0: 2, 1: 1 }), 곳({ 0: 1 })], 상품), [0, 1]);
  eq('⑤ 다 안 나누면 결제 못 함', f.여러곳검사([곳({ 0: 2, 1: 1 }), 곳({ 0: 1 })], 상품, 전화)?.[0], '「{{name}}」 {{n}}개를 아직 배송지에 나누지 않았습니다.');
  eq('⑤ 추가상품만 간 배송지는 막는다', f.여러곳검사([곳({ 0: 3, 1: 1 }), 곳({ 1: 1 })], 상품, 전화)?.[0], '{{n}}번째 배송지: 추가상품은 본상품과 같은 곳으로 보내 주세요.');
  eq('⑤ 연락처가 틀리면 막는다', f.여러곳검사([곳({ 0: 2, 1: 2 }), 곳({ 0: 1 }, { addr_phone: '12' })], 상품, 전화)?.[0], '{{n}}번째 배송지의 연락처를 정확히 입력해 주세요.');
  eq('⑤ 다 맞으면 통과', f.여러곳검사([곳({ 0: 2, 1: 2 }), 곳({ 0: 1 })], 상품, 전화), null);
  eq('⑤ 한 곳만이면 막는다', f.여러곳검사([곳({ 0: 3, 1: 2 })], 상품, 전화)?.[0], '배송지를 2곳 이상 입력해 주세요.');
  // ⑦ 같은 상품 보내기(same) — 담은 상품이 받는 분 한 명 몫, 배송지마다 그대로
  eq('⑦ 같은 상품 보내기: 배송지마다 담은 수량 그대로(나눈 수량과 무관)', f.곳의줄(곳({}), 상품, 'same').map((p) => p.order_count), [3, 2]);
  eq('⑦ 같은 상품 보내기: 수량을 안 나눠도 통과', f.여러곳검사([곳({}), 곳({})], 상품, 전화, 'same'), null);
  eq('⑦ 같은 상품 보내기도 받는 분·주소는 본다', f.여러곳검사([곳({}), 곳({}, { receiver: '' })], 상품, 전화, 'same')?.[0], '{{n}}번째 배송지의 받는 분을 입력해 주세요.');
  eq('⑦ 똑같이 나누기: 3개·2개를 2곳에 → 2/1, 1/1', f.똑같이나누기([곳({}), 곳({})], 상품).map((x) => [x.수량[0], x.수량[1]]), [[2, 1], [1, 1]]);
  eq('⑦ 똑같이 나눈 뒤 남는 수량 없음', f.남은수량(f.똑같이나누기([곳({}), 곳({}), 곳({})], 상품), 상품), [0, 0]);
}
t('⑦ 보내는 방식 기본은 같은 상품 보내기, 요약 금액·개수는 배송지 수만큼 곱한다', /const \[보내는방식, set보내는방식\] = useState\('same'\);/.test(주문서)
  && /const 곱 = 여러곳 && 보내는방식 === 'same' \? Math\.max\(1, 곳들\.length\) : 1;/.test(주문서));
t('⑦ 결제에 배송지마다 보낼 줄을 넘긴다', /곳들\.map\(\(곳\) => \(\{ \.\.\.곳, 줄: 곳의줄\(곳, products, 보내는방식\) \}\)\)/.test(주문서) && /Array\.isArray\(곳\?\.줄\) \? 곳\.줄\.map/.test(util));
t('⑦ 회원은 주소록에서 고른다, 다 쓴 배송지는 접는다, 배송비 규칙을 몰 금액으로 적는다', /addressList=\{addressList\}/.test(주문서) && /set주소록대상\(k\)/.test(편집)
  && /if \(펼친 !== k && 곳완성\(곳, isValidPhone\)\)/.test(편집) && /배송비는 배송지마다 \{\{fee\}\}이고, 한 곳에 \{\{min\}\} 이상 보내면 그 곳은 무료입니다\./.test(편집));
t('⑦ 결제 후: 완료 화면에 「배송지 N곳」, 비회원 조회는 목록부터, 주문 상태에 받는 분', /sessionStorage\.setItem\('multiShipOrder'/.test(util)
  && /배송지 \{\{n\}\}곳으로 나눠 주문되었습니다/.test(앞('src/views/shop/order/PayResultView.js'))
  && /\(여러곳주문 \? null : 방금주문\)/.test(앞('src/pages/shop/auth/order-check.js')) && /row\?\.pay_group \? ` · \$\{translate\('여러 곳 주문'\)\}/.test(앞('src/utils/function.js')));
t('⑧ 결제실패/미완료는 묶음을 첫 주문 한 줄로 접고 「몇 곳 · 합계」를 붙인다(메뉴·엑셀 같은 조건)',
  /if \(await hasColumn\('transactions', 'pay_group'\)\) sql \+= ` AND \$\{묶음첫줄식\(table_name\)\} `;/.test(백('controllers/transaction.controller.js'))
  && /String\(k\) === 'failed' && await hasColumn\('transactions', 'pay_group'\)/.test(백('controllers/transaction.controller.js'))
  && /pay_group IS NULL OR \$\{t\}\.ord_num = \$\{t\}\.pay_group/.test(pg) && /배송지 \{row\.group_count\}곳 · 합계/.test(앞('src/components/manager/OrderColumns.js')));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
