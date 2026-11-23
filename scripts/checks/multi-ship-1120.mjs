import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 여러 곳으로 배송(2026-11-20) — 결제 한 번(포스페이 주문번호 G), 배송지마다 주문(G, G-2 … G-10, pay_group=G).
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
  // ord_num 만 utf8mb4_unicode_ci 다 — 표 기본 정렬로 만들면 ord_num = pay_group 비교가 Illegal mix of collations 로 죽는다(11/20 배포 중 발견)
  t('① 마이그레이션: 칸만 INSTANT 로, 인덱스 없음, 정렬 방식은 ord_num 과 같게', /ADD COLUMN pay_group VARCHAR\(64\) CHARACTER SET utf8mb4 COLLATE ', @주문번호정렬/.test(마이그) && /ALGORITHM=INSTANT/.test(마이그) && !/ADD INDEX|CREATE INDEX/i.test(마이그));
  const 정렬맞춤 = 백('migrations/2026-11-20_pay_group_collation.sql');
  t('① 정렬 맞춤 마이그레이션: 빈 칸일 때만 INSTANT 로 지우고 다시 만든다', /SET @고칠것 := \(@다름 AND @값있음 = 0\);/.test(정렬맞춤)
    && /DROP COLUMN pay_group, ALGORITHM=INSTANT/.test(정렬맞춤) && /COLLATE ', @주문번호정렬/.test(정렬맞춤));
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
  && /\(parseInt\(use_point\) \|\| 0\) > 0/.test(pay) && /hasColumn\('transactions', 'pay_group'\)/.test(pay) && /if \(\[0, '0', false, 'false'\]\.includes\(s\?\.multi_ship\)\) return response/.test(pay));
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
t('⑤ 켠 몰·포스페이 있을 때만 「여러 곳으로 배송」, 켜면 포스페이만 보인다',
  /const 여러곳가능 = !\[0, '0', false, 'false'\]\.includes\(themeDnsData\?\.setting_obj\?\.multi_ship\) && 모든결제수단\.some\(\(m\) => m\?\.type == 'auth_forspay'\);/.test(주문서)
  && /const paymentModules = 여러곳 \? 모든결제수단\.filter\(\(m\) => m\?\.type == 'auth_forspay'\) : 모든결제수단;/.test(주문서));
t('⑤ 결제 전 검사(수량 다 나누기·받는 분·연락처·주소·추가상품·배송 안 함·포인트)', /const 문제 = 여러곳검사\(곳들, products, isValidPhoneNumber, 보내는방식\);/.test(주문서) && /여러 곳으로 배송할 때는 포인트를 사용할 수 없습니다/.test(주문서));
t('⑤ 금액은 배송지별 calcOrderTotals 의 합', /const 곳금액 = 여러곳 \? 곳별금액\(곳들, products, 보내는방식\) : null;/.test(주문서) && /calcOrderTotals\(곳의줄\(곳, products, 방식\), 0, \{ \.\.\.곳, country_code: 'KR' \}\)/.test(편집));
t('⑤ 결제: 배송지마다 makePayData, 목록은 JSON 한 칸', /const d = await makePayData\(줄, \{ \.\.\.배송지, use_point: 0 \}\);/.test(util) && /destinations_json: JSON\.stringify\(destinations\)/.test(util));
// 주석의 「선물하기라고 부르지 않는다」는 빼고, 화면 글자·코드에만 없는지 본다
const 주석뺌 = (x) => x.split('\n').filter((l) => !/^\s*(\/\/|\*|\{\/\*)/.test(l)).join('\n');
t('⑤ 「선물하기」라는 이름을 쓰지 않는다', !/선물하기/.test(주석뺌(편집)) && !/선물하기/.test(주석뺌(util.slice(util.indexOf('onPayProductsByForspayMulti')))) && !/선물하기/.test(주석뺌(주문서)));
// 기본 켜짐(사장님 2026-11-20) — 값이 없으면 켜진 것이고, 명시적으로 끈 몰(0)만 꺼진다. 주문서·서버·설정 화면이 같은 규칙.
t('⑤ 관리자 배송비설정 스위치(기본 켜짐, 끄면 0)', /\['multi_ship'\]: e\.target\.checked \? 1 : 0/.test(설정) && /checked=\{!\[0, '0', false, 'false'\]\.includes\(item\?\.setting_obj\?\.multi_ship\)\}/.test(설정));

// 11/20 재검토에서 고친 것
t('⑥ 「다시 결제하기」·새로고침이 배송지 목록을 되살린다(10곳을 다시 쓰게 하지 않는다)',
  /saveRetryDraft\(payData, \{ addrMode, directMode, sameAsBuyer, selectedAddrId, 여러곳, 곳들, 보내는방식 \}, isBuyNow\(\)\);/.test(주문서)
  && /saveSessionDraft\(payData, \{ addrMode, directMode, sameAsBuyer, selectedAddrId, 여러곳, 곳들, 보내는방식 \}/.test(주문서)
  && /if \(s\.여러곳 === true && Array\.isArray\(s\.곳들\) && s\.곳들\.length >= 2\) \{ set여러곳\(true\); set곳들\(s\.곳들\); set보내는방식\(/.test(주문서));
t('⑥ 상품 줄이 바뀌면 배송지별 수량을 되돌린다(줄 번호가 밀려 다른 상품에 붙지 않게)', /지난상품꼴\.current !== 상품꼴/.test(주문서) && /상품이 바뀌어 배송지별 수량을 처음으로 되돌렸습니다/.test(주문서));
t('⑥ 여러 곳이면 PC 포인트 칸도 숨긴다', /enablePoint=\{!여러곳\}/.test(주문서));
t('⑥ 다른 화면의 옛 설정 저장이 스위치 값을 지우지 못한다(끈 몰이 조용히 다시 켜지지 않게, 보내지 않았을 때만 DB 값 0·1 유지)',
  /설정\.multi_ship === undefined\) \{/.test(백('controllers/brand.controller.js')) && /JSON_EXTRACT\(setting_obj, '\$\.multi_ship'\)/.test(백('controllers/brand.controller.js'))
  && /if \(m !== null && m !== undefined\) \{/.test(백('controllers/brand.controller.js')));

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
  && /if \(곳\.접음 && 곳완성\(곳, isValidPhone\)\)/.test(편집) && /배송비는 배송지마다 \{\{fee\}\}이고, 한 곳에 \{\{min\}\} 이상 보내면 그 곳은 무료입니다\./.test(편집));
t('⑦ 결제 후: 완료 화면에 「배송지 N곳」, 비회원 조회는 목록부터, 주문 상태에 받는 분', /sessionStorage\.setItem\('multiShipOrder'/.test(util)
  && /배송지 \{\{n\}\}곳으로 나눠 주문되었습니다/.test(앞('src/views/shop/order/PayResultView.js'))
  && /\(여러곳주문 \? null : 방금주문\)/.test(앞('src/pages/shop/auth/order-check.js')) && /row\?\.pay_group \? ` · \$\{translate\('여러 곳 배송'\)\}/.test(앞('src/utils/function.js')));
t('⑧ 결제실패/미완료는 묶음을 첫 주문 한 줄로 접고 「몇 곳 · 합계」를 붙인다(메뉴·엑셀 같은 조건)',
  /if \(await hasColumn\('transactions', 'pay_group'\)\) sql \+= ` AND \$\{묶음첫줄식\(table_name\)\} `;/.test(백('controllers/transaction.controller.js'))
  && /String\(k\) === 'failed' && await hasColumn\('transactions', 'pay_group'\)/.test(백('controllers/transaction.controller.js'))
  && /pay_group IS NULL OR \$\{t\}\.ord_num = \$\{t\}\.pay_group/.test(pg) && /배송지 \{row\.group_count\}곳 · 합계/.test(앞('src/components/manager/OrderColumns.js')));

// 11/23 포스몰 — 배송지 2 에서 주소를 고르자마자 상세주소·요청사항을 쓰기 전에 접혔다. 접힘은 손님이 누를 때만
// 같은 날 점검: 켤 때 옮겨 온 1번도 상세주소 없이 접혀 있었다 → 처음엔 아무것도 접지 않고, 접음은 배송지 안에 둬 되살릴 때도 그대로
{
  t('⑬ 접힘은 배송지 안의 접음(손님이 누른 것)으로만 정한다', /if \(곳\.접음 && 곳완성\(곳, isValidPhone\)\) \{/.test(편집));
  t('⑬ 처음 켤 때·빈 배송지는 접음이 없다', !/접음/.test(편집.slice(편집.indexOf('const 빈곳 ='), 편집.indexOf('// 배송지 한 곳의 주문 줄'))));
  t('⑬ 「입력 완료」가 그 배송지를 접는다', /const 접기 = \(k\) => 고치기\(k, \{ 접음: true \}\);/.test(편집) && /onClick=\{\(\) => 접기\(k\)\}>\{translate\('입력 완료'\)\}/.test(편집));
  t('⑬ 「수정」이 그 배송지를 편다', /const 펴기 = \(k\) => 고치기\(k, \{ 접음: false \}\);/.test(편집) && /onClick=\{\(\) => 펴기\(k\)\}>\{translate\('수정'\)\}/.test(편집));
  t('⑬ 「배송지 추가」는 다 쓴 곳만 접고 새 곳을 한 번에 더한다', /set곳들\(\[\.\.\.곳들\.map\(\(곳\) => \(곳완성\(곳, isValidPhone\) \? \{ \.\.\.곳, 접음: true \} : 곳\)\), 빈곳\(\)\]\);/.test(편집));
  t('⑬ 옛 「펼친」·「접힘」 상태가 남지 않았다', !/set펼친|\[펼친,|set접힘|접힘\.has/.test(편집));
  t('⑬ 결제 때 서버로 보내는 배송지에 접음은 없다(필요한 칸만 골라 보낸다)', /destinations\.push\(\{\s*\n\s*receiver: 곳\.receiver, addr_phone: 곳\.addr_phone, zonecode: 곳\.zonecode, addr: 곳\.addr,/.test(util));
  // 우편번호 검색이 끝나면: 앞 주소의 상세주소를 비우고 상세주소 칸으로 커서(한 곳·여러 곳·주소록 창)
  const 우편 = 주문서.slice(주문서.indexOf('const onCompletePost'), 주문서.indexOf('setPostOpen(false);\n  };'));
  t('⑬ 주소를 고르면 상세주소를 비운다(여러 곳·한 곳)', /addr: 주소, detail_addr: '' \} : 곳/.test(우편) && /setPayData\(\{ \.\.\.payData, zonecode: data\?\.zonecode, addr: 주소, detail_addr: '' \}\);/.test(우편));
  t('⑬ 주소를 고르면 상세주소 칸으로 커서', /상세주소로\(`multi-detail-addr-\$\{k\}`\);/.test(우편) && /상세주소로\('order-detail-addr'\);/.test(우편)
    && /id=\{`multi-detail-addr-\$\{k\}`\}/.test(편집) && /id="order-detail-addr"/.test(주문서) && /<Dialog open=\{postOpen\}[^\n]*disableRestoreFocus/.test(주문서));
  const 주소록창 = 앞('src/components/dialog/DialogAddAddress.js');
  t('⑬ 주소록 창도 주소를 고르면 상세주소 칸에 커서', /set상세먼저\(true\);/.test(주소록창) && /autoFocus=\{!상세먼저\}/.test(주소록창) && /autoFocus=\{상세먼저\}/.test(주소록창));
}

// 11/23 포스몰 — 1개만 담고 배송지 2곳이면 요약이 「2개」라 나눠보내기가 왜 막혔는지 몰랐다 · 고르지 않은 단추가 막힌 단추처럼 보였다
{
  t('⑭ 막혔을 때 담은 수량 기준과 푸는 방법을 적는다(옛 문구 없음)', /담은 수량이 1개라 나눠 보낼 수 없습니다\. 위 상품 목록에서 수량을 2개 이상으로 늘리면 쓸 수 있습니다\./.test(편집) && !/2개 이상 담았을 때 쓸 수 있습니다/.test(편집));
  t('⑭ 새 문구가 5개 언어 사전에 있고 옛 문구는 없다', ['ko', 'en', 'ja', 'cn', 'es'].map((l) => 앞(`src/locales/langs/${l}.js`)).every((d) => d.includes('"담은 수량이 1개라 나눠 보낼 수 없습니다. 위 상품 목록에서 수량을 2개 이상으로 늘리면 쓸 수 있습니다.":') && !d.includes('"2개 이상 담았을 때 쓸 수 있습니다.":')));
  t('⑭ 고르지 않은 단추는 진한 글자, 고른 단추는 진한 테두리, 막힌 단추는 점선', /'& \.MuiToggleButtonGroup-grouped:not\(\.Mui-selected\):not\(\.Mui-disabled\)': \{ color: 'text\.primary' \}/.test(편집)
    && /'& \.MuiToggleButtonGroup-grouped\.Mui-selected': \{ borderColor:/.test(편집) && /'& \.MuiToggleButtonGroup-grouped\.Mui-disabled': \{ borderStyle: 'dashed' \}/.test(편집));
}

// 11/20 저녁 — 이름은 「여러 곳으로 배송」(11/21 선물 등 뺌), 작은 체크칸 대신 꽉 찬 두 단추, 1개만 담으면 나눠 보내기 막기
const 고르기 = 주문서.slice(주문서.indexOf('{(여러곳가능 || 여러곳) && ('), 주문서.indexOf('{여러곳 ? ('));
t('⑨ 한 곳/여러 곳은 꽉 찬 두 단추(작은 체크칸 아님)', /<ToggleButtonGroup exclusive fullWidth/.test(고르기) && !/Checkbox/.test(고르기)
  && /minHeight: 52/.test(고르기) && /translate\('한 곳으로 배송'\)/.test(고르기) && /translate\('여러 곳으로 배송'\)/.test(고르기));
t('⑨ 꺼져 있을 때 무엇을 할 수 있는지 한 줄 안내', /\{!여러곳 && \(/.test(고르기) && /최대 \{\{n\}\}곳까지 보낼 수 있습니다/.test(고르기));
t('⑨ 켤 때 하던 일(배송지 준비·국내·포인트 0·포스페이 아닌 결제수단 해제)은 그대로', /set곳들\(처음곳들\(isKR \? payData : /.test(고르기) && /setAddrMode\('KR'\)/.test(고르기)
  && /use_point: 0/.test(고르기) && /buyType != 'auth_forspay'/.test(고르기));
t('⑨ 1개만 담으면 나눠 보내기를 못 누르고, 나눠 보내기 중 1개가 되면 같은 상품 보내기로', /const 나눔가능 = 담은개수 >= 2;/.test(편집)
  && /<ToggleButton value="split" disabled=\{!나눔가능\}>/.test(편집) && /if \(!나눔가능 && 방식 === 'split'\) set방식\('same'\)/.test(편집));
t('⑨ 단추 순서는 나눠 보내기 먼저, 기본 선택은 같은 상품 보내기(11/21)', 편집.indexOf('<ToggleButton value="split"') > 0 && 편집.indexOf('<ToggleButton value="split"') < 편집.indexOf('<ToggleButton value="same"')
  && /const \[보내는방식, set보내는방식\] = useState\('same'\);/.test(주문서));
t('⑨ 옛 이름 「여러 곳으로 보내기」가 남지 않는다', ![주문서, 편집, 설정, pay].some((x) => /여러 곳으로 보내기/.test(x)));

// 11/21 팀장 통화 — 이름 「여러 곳으로 배송」(선물 등 뺌), 단추 「주문 상품 나눠보내기 / 주문 상품 묶어보내기」
{
  const 사전들 = ['ko', 'en', 'ja', 'cn', 'es'].map((l) => 앞(`src/locales/langs/${l}.js`));
  const 가이드 = 앞('src/components/manager/guideContent.js');
  t('⑪ 단추 이름은 주문 상품 나눠보내기 · 주문 상품 묶어보내기',
    /<ToggleButton value="split" disabled=\{!나눔가능\}>\{translate\('주문 상품 나눠보내기'\)\}/.test(편집) && /<ToggleButton value="same">\{translate\('주문 상품 묶어보내기'\)\}/.test(편집)
    && /translate\('주문 상품 나눠보내기'\)\}: \{translate\('담은 수량이 1개라 나눠 보낼 수 없습니다\. 위 상품 목록에서 수량을 2개 이상으로 늘리면 쓸 수 있습니다\.'\)/.test(편집));
  t('⑪ 「선물 등」·선물 상자 아이콘·옛 단추 이름이 화면·사전·가이드에 남지 않는다',
    ![주석뺌(주문서), 주석뺌(편집), 가이드, ...사전들].some((x) => /선물 등|담은 수량 나눠 보내기|모두 같은 상품 보내기/.test(x)) && !/eva:gift/.test(주석뺌(주문서)));
  t('⑪ 새 이름 3개가 5개 언어 사전에 모두 있다',
    사전들.every((x) => ['주문 상품 나눠보내기', '주문 상품 묶어보내기', '여러 곳으로 배송'].every((k) => x.includes(`  "${k}": "`))));
  t('⑪ 가이드도 새 단추 이름으로 설명한다', /「주문 상품 나눠보내기」로 주문 수량을 배송지에 나눠 보내거나, 「주문 상품 묶어보내기」로/.test(가이드));
}

// 11/21 포스몰 실주문 — 둘째 배송지(G-2) 부분취소가 포스페이 「1000 Not found」로 막혔다.
//   부분취소는 getCancelState 의 trx 로 포스페이를 부르는데 거기서 pay_group 을 안 읽어 자기 주문번호(G-2)로 불렀다.
{
  const 취소 = 백('utils.js/cancel.js');
  const 상태 = 취소.slice(취소.indexOf('export const getCancelState'), 취소.indexOf('const [rows] = await readPool.query', 취소.indexOf('export const getCancelState')));
  t('⑩ 부분취소가 읽는 주문(getCancelState)에 결제 묶음 번호가 실린다 — 둘째 배송지부터 묶음 번호로 포스페이를 부르게',
    /SELECT pay_group FROM transactions WHERE id=\?/.test(상태) && /trx\.pay_group = /.test(상태));
  t('⑩ 부분취소의 PG 취소·포스페이 대조는 그 trx 의 결제주문번호를 쓴다',
    /pgCancel: async \(\{ trx, amount \}\)[\s\S]{0,300}ord_num: 결제주문번호\(trx\)/.test(pay) && /pgPrecheck: async \(\{ trx, 이미현금 \}\) => 포스페이취소대조\(trx, 이미현금\)/.test(pay));
}

// 11/22 점검(11/20~21 배포분 다시 보기)에서 나온 것
{
  const 처음 = 편집.slice(편집.indexOf('export const 처음곳들'), 편집.indexOf('export const 곳의줄'));
  t('⑫ 해외 배송지를 고른 채 켜면 주소는 옮기지 않는다(받는 분·연락처만) — 여러 곳 배송은 국내만',
    /set곳들\(처음곳들\(isKR \? payData : \{ receiver: payData\?\.receiver, addr_phone: payData\?\.addr_phone \}, products\)\)/.test(고르기)
    && /addr: payData\?\.addr/.test(처음));
  t('⑫ 끄면 켜기 전 국내/해외로 되돌린다(한 곳 배송 칸 주소와 어긋나지 않게)',
    /const 켜기전주소방식 = useRef\(null\);/.test(주문서) && /켜기전주소방식\.current = addrMode;/.test(고르기)
    && /setAddrMode\(켜기전주소방식\.current \?\? \(isDomestic\(payData\?\.country_code\) \? 'KR' : 'OVERSEAS'\)\)/.test(고르기));
  t('⑫ 되살린 여러 곳 상태에서 몰이 꺼져도 한 곳으로 돌아갈 단추가 남고, 쓸 수 없다고 알린다',
    /\{\(여러곳가능 \|\| 여러곳\) && \(/.test(주문서) && /\{여러곳 && !여러곳가능 && \(/.test(고르기)
    && /translate\('이 쇼핑몰에서는 여러 곳으로 배송할 수 없습니다\.'\)/.test(고르기)
    && ['ko', 'en', 'ja', 'cn', 'es'].every((l) => 앞(`src/locales/langs/${l}.js`).includes('"이 쇼핑몰에서는 여러 곳으로 배송할 수 없습니다."')));
  t('⑫ 편집기 상품명은 화면 언어로(formatLang)',
    /import \{ formatLang \} from 'src\/utils\/format';/.test(편집) && /formatLang\(p, 'product_name', lang\)/.test(편집)
    && !/줄이름\(p, translate\)/.test(편집) && (편집.match(/줄이름\(p, translate, currentLang\)/g) ?? []).length === 3);
  const 정산시작 = pay.indexOf('async function 묶음정산');
  const 정산 = pay.slice(정산시작, pay.indexOf('if (다됨()) return true;', 정산시작) + 30);
  t('⑫ 묶음 결제도 뒤늦은 웹훅 카드번호로 빈 칸을 채운다(이미 확정된 줄만, 빈 칸만, 다됨 판정 앞에서)',
    /const 카드번호 = String\(data\?\.card_num \?\? ''\)\.trim\(\);/.test(정산) && /!r\.card_num/.test(정산)
    && /UPDATE transactions SET card_num=\? WHERE id IN \([\s\S]{0,80}\) AND \(card_num IS NULL OR card_num=''\)/.test(정산)
    && 정산.indexOf('const 카드번호') > 0 && 정산.indexOf('const 카드번호') < 정산.indexOf('if (다됨()) return true;'));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
