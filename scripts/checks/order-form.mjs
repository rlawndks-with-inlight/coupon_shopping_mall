import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 주문서 추가 입력항목 — 유형 정의·검증·리드타임 고정.
//
// 붙잡아 두는 것:
//  · 프론트 유형 목록과 백엔드 화이트리스트가 어긋나면, 관리자가 고른 유형이
//    저장될 때 'text' 로 폴백돼 달력이 텍스트칸으로 바뀐다(조용히 망가진다)
//  · 필수 검사는 동의체크(true)·복수선택(빈 배열)을 따로 봐야 한다
//  · 리드타임: 오늘+N일 이전은 못 고르게 — 출장 준비 기간
//  · 개인정보 유형(tel/address)은 백엔드 암호화 목록과 같아야 한다
import { readFileSync } from 'fs';

const FRONT = FRONT_ROOT;
const BACK = BACK_ROOT;

const src = readFileSync(FRONT + 'src/data/order-form-types.js', 'utf8');
const mod = await import('data:text/javascript;base64,' + Buffer.from(src).toString('base64'));
const { ORDER_FORM_TYPES, PII_TYPES, parseOptionList, dateRange, findMissingRequired, typeLabel } = mod;

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  if (JSON.stringify(got) === JSON.stringify(want)) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`); }
};

// ── 프론트 유형 ↔ 백엔드 화이트리스트 ────────────────────────────────────
const ctrl = readFileSync(BACK + 'controllers/order_form.controller.js', 'utf8');
const 백엔드유형 = [...ctrl.slice(ctrl.indexOf('const FIELD_TYPES'), ctrl.indexOf('];', ctrl.indexOf('const FIELD_TYPES')))
  .matchAll(/'([a-z]+)'/g)].map((m) => m[1]);
eq('유형 12종', ORDER_FORM_TYPES.length, 12);
eq('프론트 유형 = 백엔드 화이트리스트',
  ORDER_FORM_TYPES.map((t) => t.value).sort(), [...백엔드유형].sort());

// 개인정보 유형도 양쪽이 같아야 한다 — 어긋나면 전화번호가 평문으로 남는다
const helper = readFileSync(BACK + 'utils.js/order-form.js', 'utf8');
const 백엔드PII = [...helper.slice(helper.indexOf('PII_FIELD_TYPES = ['), helper.indexOf('];', helper.indexOf('PII_FIELD_TYPES = [')))
  .matchAll(/'([a-z]+)'/g)].map((m) => m[1]);
eq('암호화 유형이 양쪽 같음', [...PII_TYPES].sort(), [...백엔드PII].sort());
eq('전화·주소가 암호화 대상', PII_TYPES.includes('tel') && PII_TYPES.includes('address'), true);

// ── 보기 목록 파싱 ───────────────────────────────────────────────────────
eq('줄바꿈 분리', parseOptionList('가능\n불가\n모름'), ['가능', '불가', '모름']);
eq('공백 줄 제거', parseOptionList('가능\n\n  \n불가'), ['가능', '불가']);
eq('앞뒤 공백 제거', parseOptionList('  가능  \n 불가 '), ['가능', '불가']);
eq('빈 값', parseOptionList(''), []);
eq('undefined', parseOptionList(undefined), []);

// ── 리드타임 ─────────────────────────────────────────────────────────────
const 기준 = new Date(2026, 7, 13); // 2026-08-13
const 날짜 = (d) => (d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` : null);
eq('리드타임 없으면 오늘부터', 날짜(dateRange({}, 기준).min), '2026-08-13');
eq('7일 리드타임', 날짜(dateRange({ lead_days: 7 }, 기준).min), '2026-08-20');
eq('월 넘어가는 리드타임', 날짜(dateRange({ lead_days: 20 }, 기준).min), '2026-09-02');
eq('상한 없으면 null', dateRange({ lead_days: 7 }, 기준).max, null);
eq('상한 90일', 날짜(dateRange({ lead_days: 7, max_days: 90 }, 기준).max), '2026-11-11');
eq('0 은 제한 없음', 날짜(dateRange({ lead_days: 0 }, 기준).min), '2026-08-13');

// ── 필수 검사 ────────────────────────────────────────────────────────────
const 항목 = [
  { id: 1, label: '행사일', field_type: 'date', is_required: 1 },
  { id: 2, label: '요청사항', field_type: 'textarea', is_required: 0 },
  { id: 3, label: '취소 규정 확인', field_type: 'agree', is_required: 1 },
  { id: 4, label: '필요 장비', field_type: 'multiselect', is_required: 1 },
];
eq('다 채우면 통과', findMissingRequired(항목, { 1: '2026-09-01', 3: true, 4: ['빔프로젝터'] }), null);
eq('날짜 비면 그 항목', findMissingRequired(항목, { 3: true, 4: ['x'] })?.label, '행사일');
// 동의체크는 '값이 있다'가 아니라 '체크됐다'여야 한다 — false 도 값이라 통과시키면 안 된다
eq('동의 미체크 잡힘', findMissingRequired(항목, { 1: 'a', 3: false, 4: ['x'] })?.label, '취소 규정 확인');
eq('동의 1 도 통과', findMissingRequired(항목, { 1: 'a', 3: 1, 4: ['x'] }), null);
// 복수선택은 빈 배열이 미입력이다
eq('복수선택 빈 배열 잡힘', findMissingRequired(항목, { 1: 'a', 3: true, 4: [] })?.label, '필요 장비');
// 공백만 넣은 것도 미입력
eq('공백만 넣으면 잡힘', findMissingRequired(항목, { 1: '   ', 3: true, 4: ['x'] })?.label, '행사일');
// 선택 항목은 비어도 통과
eq('선택 항목은 비어도 됨', findMissingRequired(항목, { 1: 'a', 3: true, 4: ['x'], 2: '' }), null);
eq('항목이 없으면 통과', findMissingRequired([], {}), null);
eq('값 객체가 없어도 안 터짐', findMissingRequired(항목, undefined)?.label, '행사일');

eq('유형 이름 조회', typeLabel('date'), '날짜 (달력)');
eq('모르는 유형은 그대로', typeLabel('zzz'), 'zzz');

// ── 백엔드 배선 ──────────────────────────────────────────────────────────
// 값을 프론트가 보낸 라벨로 저장하면 주문 내역을 위조할 수 있다 — 서버 것을 쓴다
eq('라벨은 서버 것을 저장', /f\.label,\n\s*f\.field_type,/.test(helper), true);
// 줄 단위 저장 — 행사일이 다른 두 상품을 한 번에 담아도 각각 남아야 한다
eq('줄마다 저장(주문 줄 순회)', /lines\.forEach\(\(p, line_index\)/.test(helper), true);
// 항목은 **그 상품에 걸린 것만** 저장한다 — 남의 상품 항목 id 를 보내도 안 들어간다
eq('상품별 항목으로 저장', /getOrderFormFieldsForProducts\(lines\.map/.test(helper), true);
eq('product_id·line_index 함께 저장', /product_id, line_index, field_id/.test(helper), true);
// 저장 실패가 결제를 막으면 카드는 승인됐는데 주문이 없는 상태가 된다
const pay = readFileSync(BACK + 'controllers/pay.controller.js', 'utf8');
eq('입력값 저장은 try 로 감쌈', /try \{\s*await saveOrderFormValues/.test(pay), true);
// transaction_orders 와 같은 배열을 넘겨야 줄 순서가 맞는다
eq('주문 줄과 같은 배열을 넘김', /saveOrderFormValues\(trans_id, products\)/.test(pay), true);
// 서버도 필수 항목을 본다 — 프론트 검사는 우회할 수 있다
eq('서버가 필수항목 재검사', /findMissingOrderFormField\(줄\)/.test(pay), true);
// 재고: 결제 전 검사, 결제 후 차감, 취소 시 복구
eq('결제 전 재고 검사', /await checkStock\(줄\)/.test(pay), true);
eq('결제 후 재고 차감', /await decreaseStock\(trans_id, products\)/.test(pay), true);
// 취소 부수처리는 utils.js/cancel.js 로 모았다 — PG 경로 6곳이 같은 것을 쓴다.
eq('취소 경로가 공용 처리를 쓴다', (pay.match(/await markCanceled\(/g) || []).length, 6);
// 서식은 자기 브랜드 기준(혜택 안내와 달리 부모가 아니다)
// 몰 설정에는 더 이상 서식이 실리지 않는다. 상품마다 다르므로 상품 상세에 실려 간다.
// 여기 남아 있으면 그 몰의 모든 상품에 같은 칸이 떠서, 답례품만 사는 손님에게도 행사날짜를 묻는다.
const shop = readFileSync(BACK + 'controllers/shop.controller.js', 'utf8');
eq('설정 응답에서 서식 제거됨', /order_form/.test(shop), false);
const prodCtrl = readFileSync(BACK + 'controllers/product.controller.js', 'utf8');
eq('상품 상세가 입력항목을 실어 보냄', /order_form_fields: \(await 안전조회\(/.test(prodCtrl), true);
// ⚠ 배치 쿼리에 넣으면 마이그레이션 전 배포 때 상품 상세가 통째로 죽는다(= 몰 전체 정지)
eq('신규 테이블은 안전조회로 분리', /const 안전조회 = async/.test(prodCtrl), true);
// brand_id 없는 테이블 분기(언어팩 켜기가 통째로 실패하던 함정)
const langp = readFileSync(BACK + 'utils.js/schedules/lang-process.js', 'utf8');
eq('order_form_fields 조인 분기 있음', /table == 'order_form_fields'/.test(langp), true);

// ── 화면 배선 ────────────────────────────────────────────────────────────
const 주석뺀 = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

// 입력은 **상품상세**에서 받는다(네이버와 같은 자리). 주문서에는 입력칸이 없어야 한다 —
// 주문서에서 한 번만 받으면 행사일이 다른 두 상품을 담았을 때 하나밖에 못 받는다.
const sheet = 주석뺀(readFileSync(FRONT + 'src/views/shop/order/OrderSheet.js', 'utf8'));
eq('주문서에는 입력칸 없음', /<OrderFormFields/.test(sheet), false);
// 다만 결제 직전 한 번 더 본다 — 예전에 담아 둔 줄은 값이 비어 있을 수 있다.
eq('결제 직전 재검사', /findMissingRequired\(항목, p\?\.order_form_values\)/.test(sheet), true);
eq('빠진 항목 이름을 알려줌', /name: formatLang\(빠진항목, 'label'/.test(sheet), true);

// 프레임 6개 상품상세에 전부 들어가야 한다. 하나라도 빠지면 그 프레임만 값을 못 받는다.
const 상세화면 = {
  '프레임1': 'src/views/@dashboard/e-commerce/details/ProductDetailsSummary.js',
  '프레임2': 'src/views/shop/demo-2/item/[id].js',
  '프레임3': 'src/views/blog/product/id/demo-1.js',
  '프레임4': 'src/views/blog/product/id/demo-2.js',
  '프레임5': 'src/views/blog/product/id/demo-4.js',
  '프레임6': 'src/views/blog/product/id/demo-9.js',
};
for (const [이름, rel] of Object.entries(상세화면)) {
  const s = 주석뺀(readFileSync(FRONT + rel, 'utf8'));
  eq(`${이름} 입력칸 렌더`, /<OrderFormFields/.test(s), true);
  eq(`${이름} 값 상태`, /const \[orderFormValues, setOrderFormValues\] = useState/.test(s), true);
  // 값은 상품 객체에 실어 보낸다 — 담기·바로구매·구매다이얼로그가 전부 product 를 넘긴다.
  eq(`${이름} 상품에 값 실음`, /order_form_values: orderFormValues/.test(s), true);
}

// 공용 관문 — 담기·바로구매 양쪽이 여기를 지난다
const util = 주석뺀(readFileSync(FRONT + 'src/utils/shop-util.js', 'utf8'));
// 담기·바로구매 두 곳 모두에서 검사해야 한다(한 쪽만 걸면 그 경로로 빈 값이 들어온다)
eq('담기·바로구매 두 곳 다 검사', (util.match(/if \(!assertOrderFormFilled\(/g) || []).length, 2);
eq('값·항목 모두 상품에서 읽는다', /assertOrderFormFilled\(product\)/.test(util), true);
eq('항목도 상품에서 읽는다', /product\?\.order_form_fields/.test(util), true);
eq('장바구니 줄에 값 저장', /order_form_values: orderFormValues \?\? \{\}/.test(util), true);
// ⚠ 시그니처에 값이 빠지면 '같은 상품을 날짜만 다르게' 담았을 때 한 줄로 합쳐져 날짜가 사라진다
eq('장바구니 시그니처에 값 포함', /orderFormSignature\(line\?\.order_form_values\)/.test(util), true);

const cmp = 주석뺀(readFileSync(FRONT + 'src/components/elements/shop/OrderFormFields.js', 'utf8'));
// 서식이 없으면 아무것도 안 그린다 — 대부분의 몰은 이 카드가 없다
eq('항목 없으면 렌더 안 함', /if \(!fields\.length\) return null/.test(cmp), true);
eq('항목은 상품에서 받는다', /product\?\.order_form_fields/.test(cmp), true);
// 리드타임을 달력 min 으로 넣어야 '못 고르게' 막힌다. 안내문만으로는 못 막는다.
eq('달력에 min 적용', /min: 날짜시간 \?/.test(cmp), true);
eq('라벨도 번역 경유', /formatLang\(f, 'label'/.test(cmp), true);

// 설정 응답 → 화면
const ctx = readFileSync(FRONT + 'src/components/settings/SettingsContext.js', 'utf8');
eq('몰 설정에 서식을 싣지 않음', /dns_data\['order_form'\]/.test(ctx), false);

// 관리자 목록
const admin = 주석뺀(readFileSync(FRONT + 'src/pages/manager/orders/trx/[type].js', 'utf8'));
eq('주문목록에 추가입력 열', /id: 'order_forms'/.test(admin), true);
// 실제 데이터로 판단한다 — 항목을 내려도 이미 접수된 주문의 값이 화면에서 사라지지 않는다
eq('값이 있는 주문이 있을 때만 열 생성', /r\?\.order_forms\?\.length > 0/.test(admin), true);

// 관리 화면(마스터 전용)
const page = readFileSync(FRONT + 'src/pages/manager/designs/order-form/index.js', 'utf8');
eq('본사 아니면 막는다', /themeDnsData\?\.is_main_dns != 1/.test(page), true);
// 적용은 가맹점이 상품마다 한다. 여기서 몰을 골라도 아무 일이 없으므로 그 칸을 없앴다.
eq('적용 가맹점 고르기 제거됨', /적용할 가맹점/.test(page), false);
// 가맹점 상품등록 화면이 이 템플릿을 읽어 **복사**한다
const editor = readFileSync(FRONT + 'src/components/manager/ProductOptionEditor.js', 'utf8');
eq('상품등록에서 템플릿 불러오기', /order-forms\/templates/.test(editor), true);
eq('참조가 아니라 복사(id 를 뗀다)', /\(\{ id, template_id, \.\.\.f \}\)/.test(editor), true);
const nav = readFileSync(FRONT + 'src/layouts/manager/nav/config-navigation.js', 'utf8');
const 마스터블록 = nav.slice(nav.indexOf('if (isMasterSite()) {'), nav.indexOf('\n  return [', nav.indexOf('if (isMasterSite()) {')));
// 메뉴에서는 내렸다. 템플릿은 '같은 업종 가맹점이 여럿일 때' 쓰는 물건인데 아직 하나뿐이라,
// 빈 화면이 메뉴에 남아 있으면 매번 '이건 뭐지'가 된다.
// ⚠ 지운 게 아니다 — 되살릴 한 줄을 주석으로 남겨 두고 페이지·API 는 계속 산다.
const 주석뺀nav = 마스터블록.replace(/^\s*\/\/.*$/gm, '');
eq('메뉴에서는 내려감', /orderForm/.test(주석뺀nav), false);
eq('되살릴 한 줄은 남아 있음', /\/\/ \{ title: '입력항목 서식'/.test(마스터블록), true);
// 페이지와 API 는 살아 있어야 한다 — 상품등록의 '서식 불러오기' 가 이걸 읽는다.
eq('템플릿 조회 API 살아있음',
  /router\.route\('\/templates'\)/.test(readFileSync(BACK + 'routes/order_form.route.js', 'utf8')), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
