import { readFileSync } from 'fs';
import _ from 'lodash';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';

// 글자 길이 제한 점검(2026-11-23). 11/22 상품 정보 1,000자 뒤에 「다른 데도 걸릴 곳이 있나」 찾은 것들.
//   ① 주문명(item_name 150자) — 「첫 상품명 외 N건」이 상품명 150자 + 꼬리로 넘친다 → 서버가 잘라 넣는다
//   ② 주문 줄 옵션 스냅샷(order_groups 5000자) — 그룹이 7개쯤이면 넘친다 → 12000자 + 넘치면 안 쓰는 값부터 덜기
//   ③ 입점 승인 — 신청서(120·120·60)를 브랜드 칸(50·20·50)에 옮겨 담다 실패 → 브랜드 칸을 늘림, 신청서 입력 제한
//   ④ 손님 이름 칸 — 암호화 칸이라 한글 약 51자까지 → 주문서·주소록·비회원 문의 50자, 서버도 막음
//   ⑤ 관리자 짧은 칸 — 옵션 이름 30·항목 50 등 → 공용 글자 수 표시, 상품 저장 전 서버 검사

const 읽기 = (root, p) => readFileSync(root + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

// ── ④ 손님 이름 칸 ────────────────────────────────────────────────────────
const 함수 = 읽기(FRONT_ROOT, 'src/utils/function.js');
const 주문서 = 읽기(FRONT_ROOT, 'src/views/shop/order/OrderSheet.js');
const 여러곳 = 읽기(FRONT_ROOT, 'src/views/shop/order/MultiShipEditor.js');
const 주소록 = 읽기(FRONT_ROOT, 'src/components/dialog/DialogAddAddress.js');
const 문의 = 읽기(FRONT_ROOT, 'src/components/elements/shop/GuestInquiryFields.js');
t('④ 이름 최대 50자 상수', /export const 이름최대 = 50;/.test(함수));
t('④ 주문서: 주문자 이름(카드 사용자명 둘 포함) 3칸·받는 사람 1칸에 50자',
  (주문서.match(/inputProps=\{\{ maxLength: 이름최대 \}\} onChange=\{\(e\) => setPayData\(\{ \.\.\.payData, buyer_name: e\.target\.value \}\)\}/g) ?? []).length === 3
  && /inputProps=\{\{ maxLength: 이름최대 \}\} onChange=\{\(e\) => setPayData\(\{ \.\.\.payData, receiver: e\.target\.value \}\)\}/.test(주문서));
t('④ 여러 곳으로 배송: 받는 사람 50자', /value=\{곳\.receiver\} inputProps=\{\{ maxLength: 이름최대 \}\}/.test(여러곳));
t('④ 주소록: 받는 사람 50자', /label=\{translate\('받는 사람'\)\}\s*\n\s*inputProps=\{\{ maxLength: 이름최대 \}\}/.test(주소록));
t('④ 비회원 문의: 이름 50자', /value=\{value\?\.none_user_name \?\? ''\}\s*\n\s*inputProps=\{\{ maxLength: 이름최대 \}\}/.test(문의));

// ── ③ 입점 신청서 ─────────────────────────────────────────────────────────
const 신청 = 읽기(FRONT_ROOT, 'src/pages/apply.js');
const 신청최대 = { business_name: 120, business_number: 20, mail_order_number: 120, ceo_name: 60, ceo_phone: 30, manager_name: 50, manager_phone: 30, cs_phone: 30, referrer_name: 60, desired_slug: 40 };
for (const [k, n] of Object.entries(신청최대)) {
  t(`③ 신청서 ${k} ${n}자`, new RegExp(`value=\\{form\\.${k}\\}\\s*\\n\\s*inputProps=\\{\\{ maxLength: ${n} \\}\\}`).test(신청));
}

// ── ⑤ 관리자 짧은 칸 ─────────────────────────────────────────────────────
const 공용 = 읽기(FRONT_ROOT, 'src/utils/char-limit.js');
const 칸최대 = new Function(`${공용.slice(공용.indexOf('const 칸최대'), 공용.indexOf('};', 공용.indexOf('const 칸최대')) + 2).replace('export ', '')}\nreturn 칸최대;`)();
t('⑤ 칸 크기 = DB 칸', _.isEqual(칸최대, { 상품명: 150, 상품설명: 255, 옵션이름: 30, 옵션항목: 50, 입력항목이름: 60, 카테고리명: 50, 특성그룹명: 50, 특성명: 50, 팝업제목: 100 }));
const 표시 = new Function(`${공용.slice(공용.indexOf('export const 글자수 ='), 공용.length).replace(/export /g, '')}\nreturn 글자수표시;`)();
t('⑤ 표시: 짧으면 아무것도 안 단다', _.isEqual(표시('색상', 30), {}));
t('⑤ 표시: 80%부터 「n / 최대자」', 표시('가'.repeat(24), 30).helperText === '24 / 30자' && !표시('가'.repeat(24), 30).error);
t('⑤ 표시: 넘치면 빨강', 표시('가'.repeat(31), 30).error === true && /30자까지 넣을 수 있습니다/.test(표시('가'.repeat(31), 30).helperText));
t('⑤ 표시: 이모지는 1자', _.isEqual(표시('😀'.repeat(30), 30), 표시('가'.repeat(30), 30)));
const 화면칸 = [
  ['src/components/manager/ProductOptionEditor.js', /\{\.\.\.글자수표시\(g\?\.group_name, 칸최대\.옵션이름\)\}/],
  ['src/components/manager/ProductOptionEditor.js', /\{\.\.\.글자수표시\(o\?\.option_name, 칸최대\.옵션항목\)\}/],
  ['src/components/manager/ProductOptionEditor.js', /\{\.\.\.글자수표시\(f\?\.label, 칸최대\.입력항목이름\)\}/],
  ['src/pages/manager/products/[edit_category]/[id].js', /\{\.\.\.글자수표시\(item\.product_name, 칸최대\.상품명\)\}/],
  ['src/pages/manager/products/[edit_category]/[id].js', /\{\.\.\.글자수표시\(item\.product_comment, 칸최대\.상품설명\)\}/],
  ['src/pages/manager/products/categories/[id].js', /\{\.\.\.글자수표시\(category\.category_name, 칸최대\.카테고리명\)\}/],
  ['src/pages/manager/products/properties/[id].js', /\{\.\.\.글자수표시\(property\.property_name, 칸최대\.특성명\)\}/],
  ['src/pages/manager/products/property-groups/[edit_category]/[id].js', /\{\.\.\.글자수표시\(item\.property_group_name, 칸최대\.특성그룹명\)\}/],
  ['src/pages/manager/designs/popup/[edit_category]/[id].js', /\{\.\.\.글자수표시\(item\.popup_title, 칸최대\.팝업제목\)\}/],
  ['src/pages/manager/designs/order-form/index.js', /\{\.\.\.글자수표시\(f\.label, 칸최대\.입력항목이름\)\}/],
];
for (const [f, re] of 화면칸) {
  const s = 읽기(FRONT_ROOT, f);
  t(`⑤ ${f.split('/').slice(-3).join('/')} ${re.source.match(/칸최대\\\.(\S+?)\\\)/)?.[1] ?? ''}`, re.test(s) && /from 'src\/utils\/char-limit'/.test(s));
}
const 상품화면 = 읽기(FRONT_ROOT, 'src/pages/manager/products/[edit_category]/[id].js');
t('⑤ 상품 화면: 저장 전 옵션 이름·항목명·간단한 설명 검사',
  /if \(글자수\(g\?\.group_name\) > 칸최대\.옵션이름\) \{/.test(상품화면) && /글자수\(o\?\.option_name\) > 칸최대\.옵션항목/.test(상품화면) && /if \(글자수\(item\?\.product_comment\) > 칸최대\.상품설명\) \{/.test(상품화면));

// ── 사전 ─────────────────────────────────────────────────────────────────
for (const l of ['ko', 'en', 'ja', 'cn', 'es']) {
  const d = 읽기(FRONT_ROOT, `src/locales/langs/${l}.js`);
  t(`사전 ${l}: 새 문구 셋`, ['주문하는 분 이름은 50자 이내로 입력해 주세요.', '상품 간단한 설명은 255자 이내로 입력해 주세요.', '주문하는 분'].every((k) => d.includes(`"${k}":`)));
}

// ── 서버 ─────────────────────────────────────────────────────────────────
if (!백엔드있음) {
  console.log('  (백엔드 없음 — 서버 검사 건너뜀)');
} else {
  const 결제 = 읽기(BACK_ROOT, 'controllers/pay.controller.js');
  const 상품 = 읽기(BACK_ROOT, 'controllers/product.controller.js');
  const 유틸 = 읽기(BACK_ROOT, 'utils.js/util.js');
  const 입점 = 읽기(BACK_ROOT, 'controllers/merchant_application.controller.js');

  // 결제 쪽 길이 함수를 떼어 와 실제로 돌린다
  const i = 결제.indexOf('const 글자수 = ');
  const e = 결제.indexOf("return JSON.stringify(덜기([...안쓰는옵션값, 'lang_obj']));\n};", i) + 60;
  const f = new Function('_', 'Buffer', `${결제.slice(i, e)}\nreturn { 글자수, 주문명맞추기, 이름너무김, 옵션칸맞추기 };`)(_, Buffer);
  const 긴 = f.주문명맞추기(`${'가'.repeat(150)} 외 3건`);
  t('① 주문명: 150자로 줄이고 「외 N건」은 남긴다', f.글자수(긴) === 150 && 긴.endsWith('… 외 3건'));
  t('① 주문명: 짧으면 그대로, 없으면 없는 채로', f.주문명맞추기('사과 외 2건') === '사과 외 2건' && f.주문명맞추기(undefined) === undefined);
  t('① 주문명: 주문을 만들기 전에(여러 곳 갈림길보다 앞) 맞춘다',
    결제.indexOf('item_name = 주문명맞추기(item_name);') > 0 && 결제.indexOf('item_name = 주문명맞추기(item_name);') < 결제.indexOf('if (req.body?.destinations_json) {'));
  t('④ 서버 이름: 한글 50자 통과·51자 막음', !f.이름너무김('가'.repeat(50)) && f.이름너무김('가'.repeat(51)));
  t('④ 서버 이름: 주문자·받는 분·여러 곳 배송지마다',
    /if \(이름너무김\(buyer_name\)\) return response\(req, res, -100, "주문하는 분 이름은 50자 이내로 입력해 주세요\.", false\);/.test(결제)
    && /if \(이름너무김\(receiver\)\) return response\(req, res, -100, "받는 분 이름은 50자 이내로 입력해 주세요\.", false\);/.test(결제)
    && /if \(이름너무김\(이름\)\) return response\(req, res, -100, `\$\{k \+ 1\}번째 배송지의 받는 분 이름은 50자 이내로 입력해 주세요\.`, false\);/.test(결제));
  const 그룹 = (n) => Array.from({ length: n }, (_, k) => ({ id: k, group_name: `그룹${k}`, group_description: '', lang_obj: 'x'.repeat(300), created_at: '2026-11-23 10:00:00', updated_at: '2026-11-23 10:00:00', is_delete: 0, sort: k, addon_line: 1,
    options: Array.from({ length: 4 }, (_, j) => ({ id: j, option_name: `옵션${j}`, option_price: 1000, lang_obj: 'y'.repeat(300), created_at: '2026-11-23 10:00:00', stock_qty: 3, is_soldout: 0 })) }));
  t('② 옵션칸: 작으면 원본 그대로', f.옵션칸맞추기(그룹(2)) === JSON.stringify(그룹(2)) && f.옵션칸맞추기(undefined) === '[]');
  const 큰 = JSON.parse(f.옵션칸맞추기(그룹(30)));
  t('② 옵션칸: 넘치면 12000자 안으로, 이름·가격·id·추가상품 표시는 남는다',
    f.글자수(JSON.stringify(큰)) <= 12000 && 큰[29].group_name === '그룹29' && 큰[29].options[3].option_price === 1000 && 큰[29].options[3].id === 3
    && JSON.stringify(큰).includes('"addon_line":1') && !('created_at' in 큰[0]));
  t('② 옵션칸: 주문 줄 저장 두 곳 모두 거친다(JSON.stringify 그대로 넣는 곳 없음)',
    (결제.match(/옵션칸맞추기\((p|products\[i\])\?\.groups\)/g) ?? []).length === 2 && !/JSON\.stringify\([^)]*\?\.groups \?\? \[\]\)/.test(결제));
  const 마이그옵션 = 읽기(BACK_ROOT, 'migrations/2026-11-23_order_groups_12000.sql');
  t('② 마이그레이션: 12000자, NOT NULL DEFAULT [], 설명 그대로, 복사 없음, 잠금 5초',
    /MODIFY order_groups VARCHAR\(12000\) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '\[\]' COMMENT '주문 그룹정보',\s*\n\s*ALGORITHM=INPLACE, LOCK=NONE;/.test(마이그옵션)
    && /SET SESSION lock_wait_timeout = 5;/.test(마이그옵션));
  const 마이그브랜드 = 읽기(BACK_ROOT, 'migrations/2026-11-23_brand_text_widen.sql');
  t('③ 마이그레이션: 브랜드 칸 = 신청서 칸(120·120·60·120)',
    /MODIFY name VARCHAR\(120\)[^\n]*NOT NULL COMMENT '브랜드 명'/.test(마이그브랜드) && /MODIFY company_name VARCHAR\(120\)/.test(마이그브랜드)
    && /MODIFY ceo_name VARCHAR\(60\)/.test(마이그브랜드) && /MODIFY mail_order_num VARCHAR\(120\)/.test(마이그브랜드) && /SET SESSION lock_wait_timeout = 5;/.test(마이그브랜드));
  t('③ 승인: 별명(45자)은 잘라 넣는다', /nickname: Array\.from\(String\(app\.manager_name \|\| app\.business_name \|\| finalAdminId\)\)\.slice\(0, 45\)\.join\(''\),/.test(입점));
  t('⑤ 서버: 옵션 이름 30·항목명 50, 상품 줄 만들기 전에', /const 옵션최대 = \{ group_name: 30, option_name: 50 \};/.test(상품)
    && (상품.match(/const 특성잘못 = 특성길이검사\(characters\) \|\| 옵션길이검사\(groups\);/g) ?? []).length === 2);
  t('⑤ 서버: 상품 간단한 설명 255자', /설명: 255,/.test(상품) && /if \(\[\.\.\.String\(b\.product_comment \?\? ''\)\]\.length > 컬럼한계\.설명\) return '상품 간단한 설명은 255자 이내로 입력해 주세요\.';/.test(상품));
  t('칸 이름표: 주문자·신청서·브랜드·입력항목', ["buyer_name: '주문하는 분'", "mail_order_num: '통신판매업신고번호'", "company_name: '상호'", "ceo_name: '대표자'", "label: '항목 이름'"].every((k) => 유틸.includes(k)));
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
