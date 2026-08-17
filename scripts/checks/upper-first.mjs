import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 기계번역 결과의 첫 글자를 올리는 규칙 고정.
//
// 배경: 게시판 이름을 구글 번역이 'announcement' 로 소문자로 돌려줘서,
//       사전에서 온 이웃 항목('Orders & Delivery')과 나란히 놓이면 어색했다.
// 지켜야 할 것:
//   ① 번역본을 쓸 때만 올린다. 원문(가맹점이 직접 쓴 이름)은 손대지 않는다 — 'adidas'
//   ② 단어마다 올리면 안 된다(스페인어 'aviso de envío' → 'Aviso De Envío' 는 오표기)
//   ③ 한국어 화면은 아무것도 바뀌지 않는다
import { readFileSync } from 'fs';

const FRONT = FRONT_ROOT;
const src = readFileSync(`${FRONT}src/utils/format.js`, 'utf8');
const cut = (start, end) => {
  const i = src.indexOf(start);
  if (i < 0) throw new Error(`못 찾음: ${start}`);
  return src.slice(i, src.indexOf(end, i) + end.length);
};
const { formatLang, upperFirst } = new Function(
  "const SOURCE_LANG = 'ko';\n" +
  'const currentLangCode = () => globalThis.__lang ?? "ko";\n' +
  cut('const parseLangObj', '\n}') + '\n' +
  cut('const upperFirst =', '\n};') + '\n' +
  cut('export const formatLang', '\n}').replace('export ', '') + '\n' +
  'return { formatLang, upperFirst };'
)();

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  if (JSON.stringify(got) === JSON.stringify(want)) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`); }
};

// ── upperFirst 자체 ─────────────────────────────────────────────────────
eq('영어 첫 글자', upperFirst('announcement'), 'Announcement');
eq('이미 대문자면 그대로', upperFirst('Orders & Delivery'), 'Orders & Delivery');
eq('단어마다 올리지 않는다', upperFirst('aviso de envío'), 'Aviso de envío');
eq('숫자로 시작하면 그대로', upperFirst('1:1 inquiry'), '1:1 inquiry');
eq('일본어는 그대로', upperFirst('お知らせ'), 'お知らせ');
eq('중국어는 그대로', upperFirst('公告'), '公告');
eq('앞 공백은 건너뛴다', upperFirst('  hola'), '  Hola');
eq('빈 값', upperFirst(''), '');
eq('공백뿐', upperFirst('   '), '   ');
eq('null 도 터지지 않는다', upperFirst(null), '');
eq('악센트 글자', upperFirst('índice'), 'Índice');

// ── formatLang 과 함께 ──────────────────────────────────────────────────
const 게시판 = {
  post_category_title: '공지사항',
  lang_obj: { post_category_title: { en: 'announcement', ja: 'お知らせ', cn: '公告', es: 'aviso' } },
};
eq('영어는 첫 글자가 올라간다', formatLang(게시판, 'post_category_title', 'en'), 'Announcement');
eq('스페인어도', formatLang(게시판, 'post_category_title', 'es'), 'Aviso');
eq('일본어는 그대로', formatLang(게시판, 'post_category_title', 'ja'), 'お知らせ');
eq('한국어는 원문 그대로', formatLang(게시판, 'post_category_title', 'ko'), '공지사항');

// ① 번역이 없으면 원문을 손대지 않는다 — 소문자 브랜드명이 대문자가 되면 안 된다
const 브랜드 = { product_name: 'adidas 운동화', lang_obj: {} };
eq('번역이 없으면 원문 그대로', formatLang(브랜드, 'product_name', 'en'), 'adidas 운동화');
const 번역있음 = { product_name: 'adidas 운동화', lang_obj: { product_name: { en: 'adidas sneakers' } } };
eq('번역이 있으면 첫 글자만', formatLang(번역있음, 'product_name', 'en'), 'Adidas sneakers');

// ② lang_obj 가 문자열(JSON)로 와도 동작
const 문자열 = { post_category_title: '공지사항', lang_obj: JSON.stringify({ post_category_title: { en: 'announcement' } }) };
eq('lang_obj 가 JSON 문자열이어도', formatLang(문자열, 'post_category_title', 'en'), 'Announcement');

// ③ 값이 없을 때
eq('컬럼이 없으면 undefined', formatLang({}, 'post_category_title', 'en'), undefined);
eq('obj 가 없어도 안 터진다', formatLang(undefined, 'post_category_title', 'en'), undefined);

// ④ currentLang 객체로 넘겨도 동작
eq('언어를 객체로 넘겨도', formatLang(게시판, 'post_category_title', { value: 'en' }), 'Announcement');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
