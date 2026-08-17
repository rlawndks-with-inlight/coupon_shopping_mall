import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 푸터 글씨 색을 한 가지 회색으로 고정한다.
//
// 붙잡아 두는 사고:
//  · 색이 #aaa(제목·면책) · #555(법인명) · #999(본문·링크) · #666(이메일) 네 가지로
//    갈려 같은 성격의 줄끼리도 밝기가 달랐다. 한 줄 고칠 때마다 그 자리 색만 정하다 보면
//    다시 갈라진다 — 그래서 상수 하나만 쓰게 못 박는다.
//  · 주력이던 #999 는 푸터 바탕(#fafaf7)에서 대비 2.8:1 이라 10px 면책 문구가 잘 안 보였다.
//    밝은 쪽으로 되돌아가지 않게 대비를 직접 계산해 확인한다.
import { readFileSync } from 'fs';

const FRONT = FRONT_ROOT;
const rd = (p) => readFileSync(FRONT + p, 'utf8');
const 주석뺀 = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${g}\n  want: ${w}`); }
};
const ok = (name, cond) => eq(name, !!cond, true);

const src = rd('src/components/main-site/MainSiteLayout.js');
// 푸터 컴포넌트만 자른다 — 뒤에 오는 MainSiteLayout 의 색(#fff·#111)까지 세면 안 된다.
const 푸터 = 주석뺀(src.slice(src.indexOf('export const MainSiteFooter'), src.indexOf('const MainSiteLayout =')));

// ── 상수 하나만 쓴다 ─────────────────────────────────────────────────────
const m = src.match(/const FOOTER_TEXT = '(#[0-9a-fA-F]{3,6})'/);
ok('FOOTER_TEXT 상수 있음', m);
const 회색 = m?.[1];

// 푸터 안에 글씨 색 리터럴이 하나라도 있으면 갈라지기 시작한 것이다.
// \bcolor 라 'bgcolor' 는 안 걸린다 — 바탕색은 리터럴로 둬도 되고, 실제로 그렇게 쓴다.
const 리터럴 = [...푸터.matchAll(/\bcolor: '(#[0-9a-fA-F]{3,6})'/g)].map((x) => x[1]);
eq('푸터에 글씨 색 리터럴 없음', 리터럴, []);
ok('푸터가 FOOTER_TEXT 를 씀', /color: FOOTER_TEXT/.test(푸터));

// ── 대비 — 작은 글씨(10px 면책)까지 읽혀야 한다 ──────────────────────────
const 상대휘도 = (hex) => {
  const h = hex.length === 4 ? [...hex.slice(1)].map((c) => c + c).join('') : hex.slice(1);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const 대비 = (a, b) => {
  const [x, y] = [상대휘도(a), 상대휘도(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};
const 바탕 = 푸터.match(/bgcolor: '(#[0-9a-fA-F]{3,6})'/)?.[1];
eq('푸터 바탕색', 바탕, '#fafaf7');

const 비 = 대비(회색, 바탕);
console.log(`  글씨 ${회색} / 바탕 ${바탕} → 대비 ${비.toFixed(2)}:1`);

// 색은 '옅게'로 정해졌다(2026-08-14). 대비 기준(4.5:1)에는 못 미치는 값이며,
// 읽힘보다 톤을 택한 결정이다 — 그래서 대비로 잡지 않고 정해진 값 자체를 고정한다.
// 한 번 #666(대비 5.49)으로 잡았다가 '너무 진하다'로 되돌린 이력이 있다.
eq('정해진 회색', 회색, '#999');
ok('대비는 기준 미달임을 알고 쓰는 값', 비 < 4.5);
// 되돌릴 때 참고할 값도 같이 박아 둔다 — 이 바탕에서 기준을 넘는 가장 밝은 회색
ok('#737373 은 기준(4.5:1)을 넘는다', 대비('#737373', 바탕) >= 4.5);
ok('한 칸 밝은 #747474 는 못 넘는다', 대비('#747474', 바탕) < 4.5);
// 결정 배경이 코드에 남아 있어야 한다 — 없으면 다음 사람이 '접근성 위반'으로 보고 되돌린다
ok('진하게 되돌리지 않도록 이유가 주석에 있음', /읽힘보다 톤을 택한/.test(src));

// ── 링크는 색이 아니라 밑줄로 구분한다 ───────────────────────────────────
// 본문과 색이 같아졌으니, 밑줄이 없으면 약관 링크가 그냥 글씨로 보인다.
const 약관줄 = 푸터.slice(푸터.indexOf('POLICY_DOCS.map'));
ok('약관 링크에 밑줄', /textDecoration: 'underline'/.test(약관줄));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
