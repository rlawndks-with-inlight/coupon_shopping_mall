import { readFileSync, readdirSync, statSync } from 'fs';
import { FRONT_ROOT } from './_roots.mjs';

// 쪽(페이지) 단추 점검(2026-11-24). 손님 주문내역에서 쪽 번호를 누르면 목록은 넘어가는데 강조는 늘 1이었다.
//   원인: MUI Pagination 은 처음 그릴 때 page 가 undefined 면 「스스로 관리」로 굳는다(useControlled).
//   목록을 받기 전 historyContent = {} 라 page={historyContent?.page} 가 undefined → 그 뒤 서버가 3쪽이라 해도 강조는 1.
//   → page 는 처음부터 숫자여야 한다: page={Number(x?.page) || 1}.
//   같이 찾은 것: 블로그형 주문내역·포인트 내역은 첫 20건만 받고 쪽 단추가 없어 그보다 앞 내역을 못 봤다.

const 읽기 = (p) => readFileSync(FRONT_ROOT + p, 'utf8');
let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

const 모든파일 = (dir) => readdirSync(FRONT_ROOT + dir).flatMap((n) => {
  const p = `${dir}/${n}`;
  return statSync(FRONT_ROOT + p).isDirectory() ? 모든파일(p) : (/\.js$/.test(n) ? [p] : []);
});
// <Pagination ...> 의 page={...} 식을 모두 뽑는다(중괄호 짝을 맞춰서)
const 쪽식들 = [];
for (const f of 모든파일('src')) {
  const s = 읽기(f);
  let i = s.indexOf('<Pagination');
  while (i >= 0) {
    let j = i + 11, 깊이 = 0;
    while (j < s.length && !(깊이 === 0 && (s.startsWith('/>', j) || s[j] === '>'))) { if (s[j] === '{') 깊이++; else if (s[j] === '}') 깊이--; j++; }
    const 꼴 = s.slice(i, j);
    const m = 꼴.match(/\bpage=\{/);
    if (m) {
      let k = m.index + m[0].length, d = 1; const 시작 = k;
      while (k < 꼴.length && d) { if (꼴[k] === '{') d++; else if (꼴[k] === '}') d--; k++; }
      쪽식들.push({ f, 줄: s.slice(0, i).split('\n').length, 식: 꼴.slice(시작, k - 1).trim() });
    } else 쪽식들.push({ f, 줄: s.slice(0, i).split('\n').length, 식: null });
    i = s.indexOf('<Pagination', j);
  }
}
// 처음부터 숫자인 식: 기본값(|| 1 · ?? 1)이 있거나, 처음부터 page 를 가진 상태(searchObj.page·쪽)
const 안전 = (식) => /\|\| 1$|\?\? 1$/.test(식) || /^parseInt\(searchObj\.page\)$|^parseInt\(page\)$|^page$|^쪽$/.test(식);
const 위험 = 쪽식들.filter((x) => x.식 !== null && !안전(x.식));
t(`쪽 단추 ${쪽식들.length}곳: page 가 처음부터 숫자`, 위험.length === 0);
for (const x of 위험) console.log(`       ${x.f}:${x.줄} page={${x.식}}`);
// page 없이 쓰는 곳(스스로 관리)은 홈 꾸밈 예시 하나뿐이어야 한다 — 목록과 붙은 쪽 단추는 반드시 page 를 준다
const 없음 = 쪽식들.filter((x) => x.식 === null).map((x) => x.f);
t('page 없는 쪽 단추는 꾸밈 예시(HomeHugePackElements)뿐', 없음.every((f) => /HomeHugePackElements/.test(f)));

// 처음부터 page 를 갖는 상태인지 — ManagerTable·content-table 은 searchObj.page, 상품 목록은 searchObj.page
const 관리자표 = 읽기('src/views/manager/mui/table/ManagerTable.js');
t('관리자 표: searchObj 의 page', /const \{ page, page_size \} = props\?\.searchObj;/.test(관리자표));

// 손님 주문내역·포인트(쇼핑형 1~9)는 고쳐진 꼴
for (let n = 1; n <= 9; n++) {
  const h = 읽기(`src/views/shop/demo-${n}/auth/history.js`);
  const p = 읽기(`src/views/shop/demo-${n}/auth/point.js`);
  t(`쇼핑형 ${n}: 주문조회·포인트 쪽 강조`, /page=\{Number\(historyContent\?\.page\) \|\| 1\}/.test(h) && /page=\{Number\(historyContent\?\.page\) \|\| 1\}/.test(p));
}

// 블로그형 주문내역(1~5) — 20건씩 쪽으로, 취소 건 포함(type: 'user'), 취소 뒤엔 지금 쪽 다시 읽기
for (let n = 1; n <= 5; n++) {
  const s = 읽기(`src/views/blog/auth/my-page/order/demo-${n}.js`);
  t(`블로그형 ${n} 주문내역: 쪽 단추·지금 쪽 다시 읽기·취소 건 포함`,
    /apiManager\('transactions', 'list', \{ page: 이번쪽, page_size: 주문쪽크기, type: 'user' \}\)/.test(s)
    && /const 이번쪽 = Number\(보낼쪽\) \|\| 쪽;/.test(s) && /if \(data\) \{ set전체\(Number\(data\?\.total\) \|\| 0\); set쪽\(이번쪽\); \}/.test(s)
    && /\{전체 > 주문쪽크기 &&\s*\n\s*<Pagination/.test(s) && /page=\{쪽\}/.test(s) && !/page: 1, page_size: 20/.test(s));
}
// 블로그형 포인트(1·2·4) — 20건씩 쪽으로(3·5는 원래 쪽 단추가 있었다)
for (const n of [1, 2, 4]) {
  const s = 읽기(`src/views/blog/auth/my-page/point/demo-${n}.js`);
  t(`블로그형 ${n} 포인트: 쪽 단추`, /apiManager\('points', 'list', \{ page: 이번쪽, page_size: 쪽크기 \}\)/.test(s) && /\{전체 > 쪽크기 &&\s*\n\s*<Pagination/.test(s) && /page=\{쪽\}/.test(s));
}

// 아이콘 단추의 클릭은 단추(IconButton)에 — 안쪽 그림(Icon)에 걸면 그림 밖 단추 자리(약 40px 중 가장자리)를 눌러도 반응이 없다.
//   11/24 같이 찾은 것: 관리자 목록의 수정·복사·설정 단추, 블로그형 회원가입 약관 보기 「→」 37곳.
//   주석 처리된 옛 코드(줄 앞이나 { 뒤에서 시작하는 /* */)는 뺀다.
const 주석빼기 = (s) => s.replace(/(^|\{)[ \t]*\/\*[\s\S]*?\*\//gm, '$1');
const 태그끝 = (s, i) => { let d = 0; for (; i < s.length; i++) { const c = s[i]; if (c === '{') d++; else if (c === '}') d--; else if (c === '>' && d === 0) return i; } return -1; };
const 그림클릭 = [];
for (const f of 모든파일('src')) {
  const s = 주석빼기(읽기(f));
  let i = s.indexOf('<IconButton');
  while (i >= 0) {
    const e = 태그끝(s, i);
    if (e < 0) break;
    const 여는 = s.slice(i, e + 1);
    const 다음 = s.slice(e + 1).match(/^\s*<Icon\b/);
    if (!여는.endsWith('/>') && !/onClick/.test(여는) && 다음) {
      const j = e + 1 + 다음[0].indexOf('<Icon');
      if (/\bonClick=\{/.test(s.slice(j, 태그끝(s, j) + 1))) 그림클릭.push(`${f}:${s.slice(0, i).split('\n').length}`);
    }
    i = s.indexOf('<IconButton', e);
  }
}
t('아이콘 단추: 클릭이 안쪽 그림이 아니라 단추에', 그림클릭.length === 0);
for (const x of 그림클릭) console.log('       ' + x);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
