import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 게시판 화면의 카테고리 제목 번역 고정.
//
// 회귀 방지 대상: 사이드메뉴는 formatLang 으로 번역되는데 본문 제목만 컬럼을 직접 읽어
// 영어 화면에서도 '공지사항' 이 한국어로 남던 문제(프레임3 공지사항 화면에서 보고됨).
import { readFileSync, existsSync } from 'fs';

const FRONT = FRONT_ROOT;

// 실제 formatLang 을 가져다 쓴다(구현이 바뀌면 같이 깨져야 한다).
const fmtSrc = readFileSync(FRONT + 'src/utils/format.js', 'utf8');
const grab = (start, endMark) => {
  const i = fmtSrc.indexOf(start);
  const j = fmtSrc.indexOf(endMark, i) + endMark.length;
  return fmtSrc.slice(i, j).replace(/export const /g, 'const ');
};
let store = { i18nextLng: 'ko' };
globalThis.window = { localStorage: { getItem: (k) => store[k] ?? null } };
const { formatLang } = new Function(
  grab('const currentLangCode', '\n};') + '\n' +
  grab('const SOURCE_LANG', ';') + '\n' +
  grab('const parseLangObj', '\n}') + '\n' +
  // formatLang 이 쓰는 첫 글자 대문자 헬퍼도 함께 가져온다(빠지면 ReferenceError)
  grab('const upperFirst', '\n};') + '\n' +
  grab('export const formatLang', '\n}') + '\n' +
  'return { formatLang };'
)();

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  if (got === want) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`); }
};

// ── ① 실제 운영 데이터로 확인 ────────────────────────────────────────────
// test030(프레임3) 게시판 두 개. lang_obj 는 API 응답 그대로다.
const 공지사항 = {
  id: 114,
  post_category_title: '공지사항',
  lang_obj: { post_category_title: { ko: '공지사항', en: 'announcement', ja: 'お知らせ', cn: '公告', es: 'anuncio' } },
};
const 문의 = {
  id: 115,
  post_category_title: '1:1문의',
  lang_obj: { post_category_title: { ko: '1:1문의', en: '1:1 Inquiry', ja: '1:1お問い合わせ', cn: '一对一咨询', es: 'Consulta 1:1' } },
};

// 번역본은 첫 글자를 올린다(사전에서 온 이웃 항목과 표기를 맞추기 위해).
// 원문(ko)과 대문자가 없는 언어(ja·cn)는 그대로다.
for (const [lang, want] of [['ko', '공지사항'], ['en', 'Announcement'], ['ja', 'お知らせ'], ['cn', '公告'], ['es', 'Anuncio']]) {
  store = { i18nextLng: lang };
  eq(`공지사항 (${lang})`, formatLang(공지사항, 'post_category_title'), want);
}
store = { i18nextLng: 'en' };
eq('1:1문의 (en)', formatLang(문의, 'post_category_title'), '1:1 Inquiry');

// 번역이 없는 언어는 원문으로 떨어진다
store = { i18nextLng: 'vi' };
eq('번역 없는 언어는 원문', formatLang(공지사항, 'post_category_title'), '공지사항');
// 카테고리를 못 찾은 경우(삭제 등) 화면이 죽지 않아야 한다
eq('빈 값', formatLang(undefined, 'post_category_title'), undefined);

// ── ② 화면이 정말 formatLang 을 거치는지 ────────────────────────────────
// 데이터가 맞아도 화면이 컬럼을 직접 읽으면 소용없다 — 그게 원래 문제였다.
const SCREENS = [
  'src/views/shop/demo-4/service/[article_category].js',            // 프레임3 목록(보고된 화면)
  'src/views/shop/demo-4/service/[article_category]/[id].js',       // 프레임3 상세
  'src/views/shop/demo-5/service/[article_category].js',
  'src/views/shop/demo-5/service/[article_category]/[id].js',
  'src/views/shop/demo-9/service/[article_category].js',
  'src/views/shop/demo-9/service/[article_category]/[id].js',
  'src/views/blog/service/article_category/id/demo-3.js',
];
for (const rel of SCREENS) {
  if (!existsSync(FRONT + rel)) { fail++; console.log(`FAIL 파일 없음 ${rel}`); continue; }
  const src = readFileSync(FRONT + rel, 'utf8');
  // `_.find(...)?.post_category_title` 처럼 컬럼을 직접 읽는 자리가 남아 있으면 안 된다
  const raw = /\)\s*\?\.\s*post_category_title/.test(src);
  eq(`원문 직접 읽기 없음 — ${rel.split('/').slice(-3).join('/')}`, raw, false);
  eq(`formatLang 사용 — ${rel.split('/').slice(-3).join('/')}`, src.includes("'post_category_title'"), true);
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
