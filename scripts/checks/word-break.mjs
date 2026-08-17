import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 본사 화면(shopgo.co.kr)의 모바일 줄바꿈 규칙을 고정한다.
//
// 붙잡아 두는 사고:
//  · 프레임 페이지 히어로가 모바일에서 '… 확인하실 수 있습니 / 다' 로 잘려 있던 것.
//    한글은 CSS 기본값에서 음절 아무 데서나 끊긴다 — keep-all 이 있어야 띄어쓰기에서만 끊긴다.
//    문단마다 손으로 붙이다 보니 빠뜨린 자리가 남았다.
//  · 반대로 keep-all 을 아무 데나 박으면 일본어·중국어가 화면 밖으로 삐져나간다
//    (띄어쓰기가 없어 문장 하나가 통째로 '못 끊는 덩어리'가 된다).
//  · 그래서 규칙을 wordBreak.js 한 곳에 두고, 레이아웃 최상단에서 상속시킨다.
//    ▶ 새 본사 페이지가 MainSiteLayout 을 안 쓰면 규칙을 못 받는다 — 그걸 여기서 잡는다.
import { readFileSync, existsSync } from 'fs';

const FRONT = FRONT_ROOT;
const rd = (p) => readFileSync(FRONT + p, 'utf8');
const 주석뺀 = (s) => s.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${g}\n  want: ${w}`); }
};

// ── 규칙 자체 ────────────────────────────────────────────────────────────
const wbSrc = rd('src/components/main-site/wordBreak.js');
eq('wordBreak.js 있음', existsSync(FRONT + 'src/components/main-site/wordBreak.js'), true);

const { 줄바꿈규칙 } = new Function(
  wbSrc.slice(wbSrc.indexOf('export const 줄바꿈규칙')).split('\n')[0].replace('export ', '') +
  '\nreturn { 줄바꿈규칙 };'
)();
// 한글·라틴은 keep-all(라틴은 normal 과 동작이 같다). 띄어쓰기 없는 ja/cn 만 normal.
eq('ko  → keep-all', 줄바꿈규칙('ko'), 'keep-all');
eq('en  → keep-all', 줄바꿈규칙('en'), 'keep-all');
eq('es  → keep-all', 줄바꿈규칙('es'), 'keep-all');
eq('ja  → normal', 줄바꿈규칙('ja'), 'normal');
eq('cn  → normal', 줄바꿈규칙('cn'), 'normal');
// 사전에 없는 언어가 들어와도 한국어 기준으로 떨어져야 한다(빈 값이면 아무 것도 안 걸린다)
eq('모르는 값 → keep-all', 줄바꿈규칙(undefined), 'keep-all');

// ── 레이아웃이 규칙을 실제로 거는지 ──────────────────────────────────────
const layout = 주석뺀(rd('src/components/main-site/MainSiteLayout.js'));
eq('레이아웃이 useWordBreak 를 가져옴', /import \{ useWordBreak \} from '\.\/wordBreak'/.test(layout), true);
eq('레이아웃이 useWordBreak 를 부름', /const wordBreak = useWordBreak\(\)/.test(layout), true);
// 최상단 Box 의 sx 에 들어가야 아래로 상속된다
const 최상단 = layout.slice(layout.indexOf('const MainSiteLayout'));
eq('레이아웃 최상단 Box 에 wordBreak', /minHeight: '100vh'[^}]*wordBreak/.test(최상단), true);

// ── 레이아웃 밖에서 그려지는 것은 따로 걸어야 한다 ────────────────────────
// DemoNotice 는 _app 에서 직접 그린다(프레임 미리보기를 누르면 뜨는 하단 배너).
const demo = 주석뺀(rd('src/components/main-site/DemoNotice.js'));
eq('데모 배너가 useWordBreak 를 부름', /const wordBreak = useWordBreak\(\)/.test(demo), true);
eq('데모 배너 style 에 wordBreak', /wordBreak,/.test(demo), true);

// ── 본사 페이지는 전부 MainSiteLayout 을 써야 한다 ────────────────────────
// 안 쓰면 그 페이지만 규칙을 못 받아 조용히 옛날 상태로 돌아간다.
const 본사페이지 = ['index.js', 'frames.js', 'faq.js', 'apply.js', 'apply-complete.js', 'manual.js', 'policy/[slug].js'];
for (const p of 본사페이지) {
  eq(`${p} — MainSiteLayout 사용`, /<MainSiteLayout>\{page\}<\/MainSiteLayout>/.test(rd('src/pages/' + p)), true);
}

// ── 상속으로 충분한 자리에는 keep-all 을 다시 박지 말 것 ──────────────────
// 사전에서 문구를 가져오는 화면들이다. 여기에 keep-all 을 박으면 ja/cn 이 넘친다.
for (const p of ['index.js', 'frames.js', 'apply.js', 'apply-complete.js', 'manual.js']) {
  eq(`${p} — 하드코딩 keep-all 없음`, /keep-all/.test(주석뺀(rd('src/pages/' + p))), false);
}

// ── 반대로, 여기는 keep-all 이 반드시 남아 있어야 한다 ────────────────────
// 본문이 '화면 언어와 무관하게 늘 한국어'인 자리. 상속(=화면 언어)에 맡기면
// 일본어·중국어 화면에서 normal 이 내려와 한국어 본문이 어절 한가운데서 잘린다.
//   · policy/[slug].js  약관 원문 (한국어 원문만 제공)
//   · AgreementBox      약관 팝업 — 게다가 포털이라 상속 자체가 안 된다
//   · faq.js            문구가 아직 사전으로 안 옮겨져 한국어 고정
for (const [p, 이유] of [
  ['src/pages/policy/[slug].js', '약관 본문은 한국어 원문'],
  ['src/components/main-site/AgreementBox.js', '약관 팝업(포털) + 한국어 원문'],
  ['src/pages/faq.js', 'FAQ 문구가 아직 한국어 고정'],
]) {
  eq(`${p} — keep-all 유지 (${이유})`, /wordBreak: 'keep-all'/.test(주석뺀(rd(p))), true);
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
