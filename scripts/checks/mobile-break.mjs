import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 가운데 정렬 안내문의 '모바일 줄바꿈 지점(|)' 을 고정한다.
//
// 붙잡아 두는 사고:
//  · 끊는 자리를 브라우저에 맡기면 기기 폭에 따라 달라진다.
//      360px:  … 화면 구성을 / 확인하실 수 있습니다
//      390px:  … 화면 구성을 확인하실 / 수 있습니다   ← 끝 어절 하나만 떨어진다
//    그래서 사전 문구에 '|' 로 자리를 직접 지정한다(MobileBreakText).
//  · '|' 를 넣고 조각이 여전히 한 줄을 넘으면 아무 의미가 없다 → 폭을 계산해 확인한다.
//  · PC 에서는 '|' 가 사라지고 한 줄로 이어진다. 띄어쓰기를 '|' 뒤에 두면
//    PC 에서 '…화면입니다 로그인' 처럼 어절이 붙거나 두 칸이 된다 → 앞에 둬야 한다.
import { readFileSync, existsSync } from 'fs';

const FRONT = FRONT_ROOT;
const rd = (p) => readFileSync(FRONT + p, 'utf8');

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${g}\n  want: ${w}`); }
};
const ok = (name, cond) => eq(name, !!cond, true);

// ── 공용 컴포넌트로 빠져 있어야 한다 ──────────────────────────────────────
ok('mobileBreak.js 있음', existsSync(FRONT + 'src/components/main-site/mobileBreak.js'));
const index = rd('src/pages/index.js');
ok('index.js 에 사본이 남아 있지 않음', !/const MobileBreakText = \(\{ text \}\)/.test(index));
for (const p of ['src/pages/index.js', 'src/pages/frames.js', 'src/pages/apply-complete.js',
                 'src/components/main-site/DemoNotice.js']) {
  ok(`${p} — 공용 컴포넌트를 씀`, /from '(src\/components\/main-site|\.)\/mobileBreak'/.test(rd(p)));
}

// ── 사전 ─────────────────────────────────────────────────────────────────
const dictSrc = rd('src/components/main-site/landingStrings.js');
const 잘라평가 = (표식) => {
  const i = dictSrc.indexOf(표식);
  const j = dictSrc.indexOf('\n};', i);
  return new Function(`return ${dictSrc.slice(dictSrc.indexOf('{', i), j + 2)}`)();
};
const L = 잘라평가('export const LANDING_STRINGS = {');
const S = 잘라평가('const SUBPAGE_FLAT = {');
const LANGS = ['ko', 'en', 'ja', 'cn', 'es'];

// 글자 폭 근사(Public Sans + CJK 폴백). ±1글자 오차는 있지만 '한 줄을 넘느냐'는 가른다.
const 전각 = (c) => /[가-힣ぁ-んァ-ヶ一-龥·—、。（）]/.test(c);
const 폭 = (s, size, ls = 0) => [...s].reduce((a, c) =>
  a + ((전각(c) ? 1 : c === ' ' ? 0.26 : /[A-Z]/.test(c) ? 0.62 : /[a-z0-9]/.test(c) ? 0.55 : 0.35) * size + ls), 0);

// [사전, 키, fontSize(xs), letterSpacing] — 모바일 가용폭은 360px 뷰포트 기준 328px
const 검사대상 = [
  [L, 'heroSub2', 14, 0], [L, 'targetsSub', 14, 0], [L, 'langsSub', 14, 0],
  [S, 'frames.desc1', 14, 0], [S, 'frames.desc2', 14, 0],
  [S, 'frames.ctaLine1', 20, -0.5], [S, 'frames.ctaLine2', 20, -0.5],
  [S, 'complete.desc1', 14, 0], [S, 'complete.desc2', 14, 0],
];
const 가용 = 328;

for (const [사전, 키, size, ls] of 검사대상) {
  for (const lang of LANGS) {
    const v = 사전[lang]?.[키];
    if (!v) { eq(`${키}(${lang}) 문구 있음`, !!v, true); continue; }
    if (!v.includes('|')) continue;   // 짧아서 한 줄에 들어가는 언어는 지정 안 해도 된다

    const 조각 = v.split('|');
    // ① 지정한 조각이 실제로 한 줄에 들어가야 한다
    const 넘는것 = 조각.map((x) => x.trim()).filter((x) => 폭(x, size, ls) > 가용);
    eq(`${키}(${lang}) — 조각이 한 줄에 들어감`, 넘는것, []);

    // ② PC 에서 한 줄로 이어질 때 띄어쓰기가 깨지지 않아야 한다
    // 판정은 '공백이 있느냐'가 아니라 '이어 붙였을 때 두 낱말이 달라붙느냐'로 본다.
    // 영어 targetsSub 처럼 줄표(—)로 끝나는 자리는 공백 없이 이어야 맞다.
    for (let i = 1; i < 조각.length; i++) {
      ok(`${키}(${lang}) — '|' 뒤에 공백 없음`, !조각[i].startsWith(' '));
      ok(`${키}(${lang}) — 이어 붙여도 낱말이 안 달라붙음`,
        !(/[A-Za-z0-9가-힣]$/.test(조각[i - 1]) && /^[A-Za-z0-9가-힣]/.test(조각[i])));
    }
  }
}

// ── 사장님이 지정한 자리 ──────────────────────────────────────────────────
// 2026-08-14: 프레임 페이지 안내문은 '화면 구성을' 뒤에서 끊는다고 정했다.
// balance 가 고르는 자리('실제 디자인과' 뒤)는 한 덩어리인 목적어를 쪼갠다.
eq('프레임 안내문(ko) 끊을 자리',
  S.ko['frames.desc2'], '미리보기를 통해 실제 디자인과 화면 구성을 |확인하실 수 있습니다');

// ── 데모 배너 ────────────────────────────────────────────────────────────
const demo = rd('src/components/main-site/DemoNotice.js');
// 배너 문구는 이제 언어를 탄다. 한국어일 때만 '|' 로 끊어 주고 나머지는 브라우저에 맡긴다
// (언어마다 길이가 달라 한국어 기준으로 넣은 자리가 다른 언어에서는 엉뚱해진다).
// 그래서 한국어 가지에 있는 문자열을 본다.
const 배너 = demo.match(/'(🔍[^']+)'/)?.[1];
ok('데모 배너에 끊을 자리 지정', 배너?.includes('|'));
for (const 조각 of (배너 ?? '').split('|')) {
  ok(`데모 배너 조각이 한 줄에 들어감 (${Math.round(폭(조각.trim(), 13))}px)`, 폭(조각.trim(), 13) <= 332);
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
