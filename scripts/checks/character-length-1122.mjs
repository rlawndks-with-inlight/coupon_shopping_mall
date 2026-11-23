import { readFileSync, readdirSync } from 'fs';
import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';

// 상품 정보(특성) 내용 1,000자 + 「입력값이 너무 깁니다」 안내(2026-11-22).
//   해담수산(141)이 식품 정보고시 「원재료명 및 함량」을 100자 넘게 넣어 상품 저장 7번·수정 3번이
//   ER_DATA_TOO_LONG 으로 실패했다. 화면엔 「서버 에러 발생」만 떴고, 실패할 때마다 상품 줄은 남아
//   같은 상품이 하나씩 늘었다(넷은 상품 정보 없이 남음).
//   → DB 칸 VARCHAR(100)→(1000) · 저장 전 길이 검사 · 실패하면 반쪽 상품 지움 · 너무 긴 값은 어느 칸인지 안내
//     · 관리자 내용 칸 여러 줄+글자 수 · 손님 화면 긴 값은 두 줄+더보기(인쇄는 전부).

const 읽기 = (root, p) => readFileSync(root + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

// ── 관리자 입력칸 ─────────────────────────────────────────────────────────
const 편집기 = 읽기(FRONT_ROOT, 'src/components/manager/ProductOptionEditor.js');
const 상품화면 = 읽기(FRONT_ROOT, 'src/pages/manager/products/[edit_category]/[id].js');
t('편집기: 항목 100자·내용 1000자(DB 칸과 같다)', /export const 특성최대 = \{ 항목: 100, 내용: 1000 \};/.test(편집기));
// 글자 수 세기·표시는 11/23 부터 공용(src/utils/char-limit.js) — 편집기는 가져다 쓰고 상품 화면용으로 다시 내보낸다
const 공용 = 읽기(FRONT_ROOT, 'src/utils/char-limit.js');
t('편집기: 글자는 코드포인트로 센다(공용)', /export const 글자수 = \(v\) => Array\.from\(String\(v \?\? ''\)\)\.length;/.test(공용)
  && /import \{ 글자수, 글자수표시, 칸최대 \} from 'src\/utils\/char-limit';/.test(편집기) && /export \{ 글자수 \};/.test(편집기));
t('편집기: 내용 칸은 여러 줄', /label="내용" placeholder="예시\) 국내산"\s*\n\s*multiline maxRows=\{8\}/.test(편집기));
t('편집기: 두 칸 모두 글자 수 표시', /\{\.\.\.글자수표시\(c\?\.character_name, 특성최대\.항목\)\}/.test(편집기) && /\{\.\.\.글자수표시\(c\?\.character_value, 특성최대\.내용\)\}/.test(편집기));
// maxLength 는 붙여 넣은 글을 소리 없이 자른다 — 넘치면 빨갛게만 하고 저장 때 막는다
t('편집기: 상품 정보 칸에 maxLength 없음', !/character_(name|value)[\s\S]{0,300}maxLength/.test(편집기.slice(편집기.indexOf('⑤ 상품정보'))));
t('편집기: 넘치면 error(공용)', /if \(n > 최대\) return \{ error: true,/.test(공용));
t('상품 화면: 저장 전 길이 확인(항목·내용)', /if \(글자수\(c\?\.character_name\) > 특성최대\.항목\) \{/.test(상품화면) && /if \(글자수\(c\?\.character_value\) > 특성최대\.내용\) \{/.test(상품화면));
t('상품 화면: 편집기에서 기준을 가져온다', /import ProductOptionEditor, \{ 특성최대, 글자수 \} from 'src\/components\/manager\/ProductOptionEditor';/.test(상품화면));

// ── 손님 화면 ─────────────────────────────────────────────────────────────
const 정보표 = 읽기(FRONT_ROOT, 'src/components/elements/shop/ProductInfoRows.js');
t('정보표: 두 줄로 접는다', /const 접힌줄 = 2;/.test(정보표) && /WebkitLineClamp: 접힌줄/.test(정보표));
t('정보표: 넘침은 실제 높이로 잰다(ResizeObserver)', /el\.scrollHeight > el\.clientHeight \+ 1/.test(정보표) && /new ResizeObserver\(재기\)/.test(정보표));
t('정보표: 인쇄·PDF 는 접지 않고 단추 숨김', /'@media print': \{ display: 'block', WebkitLineClamp: 'unset', overflow: 'visible' \}/.test(정보표) && /'@media print': \{ display: 'none' \}/.test(정보표));
t('정보표: 더보기/접기 번역 키', /translate\(펼침 \? '접기' : '더보기'\)/.test(정보표));
t('정보표: 줄바꿈 살림', /whiteSpace: 'pre-line'/.test(정보표));
// 훅은 정보값 컴포넌트 맨 위에서만(map 안에서 부르면 화면이 하얘진다)
t('정보표: 훅은 정보값 컴포넌트 안', /const 정보값 = \(\{ text \}\) => \{\s*\n\s*const \{ translate \} = useLocales\(\);\s*\n\s*const ref = useRef\(null\);/.test(정보표) && /<정보값 text=\{formatLang\(c, 'character_value', currentLang\)\} \/>/.test(정보표));

// ── 서버 문구 번역 ───────────────────────────────────────────────────────
const api = 읽기(FRONT_ROOT, 'src/utils/api.js');
t('api: 「칸 이름」과 뒤 문장을 따로 번역', /const m = text\.match\(\/\^「\(\[\^」\]\+\)」\\s\*\(\.\+\)\$\/\);/.test(api) && /if \(m && i18n\.exists\(m\[2\]\)\) return `「\$\{i18n\.t\(m\[1\]\)\}」 \$\{i18n\.t\(m\[2\]\)\}`;/.test(api));
const 문장 = ['칸에 입력한 내용이 너무 깁니다. 줄여서 다시 저장해 주세요.', '입력한 내용 중 너무 긴 항목이 있습니다. 줄여서 다시 저장해 주세요.'];
for (const l of ['ko', 'en', 'ja', 'cn', 'es']) {
  const 사전 = 읽기(FRONT_ROOT, `src/locales/langs/${l}.js`);
  t(`사전 ${l}: 너무 긴 입력 문장 2개`, 문장.every((k) => 사전.includes(`"${k}":`)));
}

// ── 서버 ─────────────────────────────────────────────────────────────────
if (!백엔드있음) {
  console.log('  (백엔드 없음 — 서버 검사 건너뜀)');
} else {
  const 상품 = 읽기(BACK_ROOT, 'controllers/product.controller.js');
  const 유틸 = 읽기(BACK_ROOT, 'utils.js/util.js');
  const 마이그 = 읽기(BACK_ROOT, 'migrations/2026-11-22_character_value_1000.sql');
  t('마이그레이션: VARCHAR(1000), 잠금 5초, 표 복사 없음', /MODIFY character_value VARCHAR\(1000\) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL,\s*\n\s*ALGORITHM=INPLACE, LOCK=NONE;/.test(마이그) && /SET SESSION lock_wait_timeout = 5;/.test(마이그));
  t('서버: 특성최대 = 프론트와 같은 100·1000', /const 특성최대 = \{ character_name: 100, character_value: 1000 \};/.test(상품));
  t('서버: 코드포인트로 센다', /Array\.from\(String\(c\?\.character_value \?\? ''\)\)\.length/.test(상품));
  // create·update 둘 다, 쓰기(insertQuery/updateQuery) 전에
  const 검사자리 = [...상품.matchAll(/characters = cleanCharacters\(characters\);\s*\n\s*const 특성잘못 = 특성길이검사\(characters\) \|\| 옵션길이검사\(groups\);\s*\n\s*if \(특성잘못\) \{\s*\n\s*return response\(req, res, -100, 특성잘못, false\);/g)].map((m) => m.index);
  const 만들기 = 상품.indexOf('create: async (req, res, next) => {'), 고치기 = 상품.indexOf('update: async (req, res, next) => {');
  const 첫쓰기 = (시작) => Math.min(...['insertQuery(`${table_name}`', 'updateQuery(`${table_name}`', 'writePool.query('].map((s) => { const i = 상품.indexOf(s, 시작); return i < 0 ? Infinity : i; }));
  t('서버: create 는 상품 줄을 넣기 전에 길이 검사', 검사자리.some((i) => i > 만들기 && i < 첫쓰기(만들기) && i < 고치기));
  t('서버: update 는 상품을 고치기 전에 길이 검사', 검사자리.some((i) => i > 고치기 && i < 첫쓰기(고치기)));
  t('서버: create 실패하면 반쪽 상품 지움', /let 만든상품 = \{ id: 0, brand_id: 0 \};/.test(상품) && /만든상품 = \{ id: product_id, brand_id \};/.test(상품) && /if \(만든상품\.id > 0\) \{\s*\n\s*try \{\s*\n\s*await deleteQuery\(`\$\{table_name\}`, \{ id: 만든상품\.id \}\);/.test(상품));
  t('서버: ER_DATA_TOO_LONG 이면 어느 칸인지 안내', /if \(err\?\.code === 'ER_DATA_TOO_LONG'\) \{/.test(유틸) && /return 긴칸이름\[칸\] \? `「\$\{긴칸이름\[칸\]\}」 \$\{너무긴입력문구\}` : 너무긴입력문구_칸모름;/.test(유틸));
  t('서버: 문장이 프론트 사전 키와 같다', 유틸.includes(`export const 너무긴입력문구 = '${문장[0]}';`) && 유틸.includes(`export const 너무긴입력문구_칸모름 = '${문장[1]}';`));
  // catch 의 「서버 에러 발생」은 전부 서버오류문구(err) 로 — 새로 생긴 곳도 같이 쓰게
  let 남은곳 = [], 고친곳 = 0;
  for (const f of readdirSync(BACK_ROOT + 'controllers').filter((f) => f.endsWith('.js'))) {
    const s = 읽기(BACK_ROOT, 'controllers/' + f);
    고친곳 += (s.match(/response\(req, res, -200, 서버오류문구\(err\), false\)/g) || []).length;
    for (const m of s.matchAll(/response\(req, res, -200, (["'])서버 에러 발생\1, false\)/g)) 남은곳.push(f);
    // \b 는 한글 앞뒤에서 경계를 못 잡는다 — 둘레 글자로 본다
    if (/서버오류문구\(err\)/.test(s) && !/import\s*\{[^}]*[\s,{]서버오류문구[\s,}][^}]*\}\s*from\s*["']\.\.\/utils\.js\/util\.js["']/.test(s)) 남은곳.push(f + '(import 없음)');
  }
  // seller_adjustments 한 곳은 catch 밖이라 err 가 없다
  t(`서버: catch 의 서버 에러 문구 → 서버오류문구(err) (${고친곳}곳)`, 고친곳 >= 217 && 남은곳.filter((f) => f !== 'seller_adjustments.controller.js').length === 0);
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
