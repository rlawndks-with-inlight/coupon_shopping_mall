import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 판매 프레임 목록·번호 고정.
//
// 11개 → 6개로 줄이고 번호를 다시 매겼다. 이 작업에서 실제로 낼 뻔한 사고를 붙잡아 둔다:
//   ① 미리보기 표(DEMO_PREVIEW_BRAND)에 번호가 중복돼 demo-3 이 폐지된 프레임을 열던 것
//   ② 판매중단 프레임의 no 가 null 인데 .toString() 을 불러 관리자 화면이 죽던 것
//   ③ key 를 같이 바꾸면 운영 중인 가맹점 화면과 접수된 신청서가 통째로 어긋난다
import { readFileSync } from 'fs';

const FRONT = FRONT_ROOT;
const src = readFileSync(FRONT + 'src/components/main-site/frameList.js', 'utf8');

// 배열 리터럴만 잘라 평가한다(파일 전체는 import 가 있어 못 돌린다).
const arrayOf = (name) => {
  const i = src.indexOf(`export const ${name} = [`);
  if (i < 0) throw new Error(`${name} 없음`);
  const start = src.indexOf('[', i);
  let depth = 0, end = start;
  for (let k = start; k < src.length; k++) {
    if (src[k] === '[') depth++;
    else if (src[k] === ']') { depth--; if (depth === 0) { end = k; break; } }
  }
  return new Function(`return ${src.slice(start, end + 1)}`)();
};

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${g}\n  want: ${w}`); }
};

const FRAMES = arrayOf('FRAMES');
const LEGACY = arrayOf('LEGACY_FRAMES');

// ── 판매 목록 ────────────────────────────────────────────────────────────
eq('판매 프레임 6개', FRAMES.length, 6);
eq('번호는 1~6 연속', FRAMES.map((f) => f.no), [1, 2, 3, 4, 5, 6]);

// ⚠ key 는 DB 값이다. 여기가 바뀌면 운영 중인 가맹점 화면이 뒤바뀌고
//   이미 접수된 신청서(merchant_applications.selected_frame)와도 어긋난다.
eq('key 는 그대로', FRAMES.map((f) => f.key),
  ['shop:1', 'shop:2', 'blog:1', 'blog:2', 'blog:4', 'blog:9']);
eq('계열', FRAMES.map((f) => f.group),
  ['shop', 'shop', 'column', 'column', 'landing', 'landing']);

// ── 판매중단 목록 ────────────────────────────────────────────────────────
eq('판매중단 5개', LEGACY.length, 5);
eq('판매중단 key', LEGACY.map((f) => f.key),
  ['shop:4', 'blog:5', 'blog:6', 'blog:7', 'blog:8']);
// 번호를 주면 판매 목록과 겹친다 — 반드시 없어야 한다
eq('판매중단은 번호 없음', LEGACY.map((f) => f.no), [null, null, null, null, null]);

// 두 목록에 같은 key 가 겹치면 findFrameByKey 결과가 흔들린다
const dup = FRAMES.map((f) => f.key).filter((k) => LEGACY.some((l) => l.key === k));
eq('두 목록에 겹치는 key 없음', dup, []);

// ── 미리보기 표 ─────────────────────────────────────────────────────────
// 이게 이번 작업에서 실제로 냈던 사고다: 번호가 중복되면 뒤엣것이 이겨
// demo-3 이 새 프레임3 이 아니라 폐지한 예전 3번(남의 운영몰)을 연다.
const tableSrc = src.slice(src.indexOf('const DEMO_PREVIEW_BRAND = {'));
const table = tableSrc.slice(0, tableSrc.indexOf('};') + 2).replace('const DEMO_PREVIEW_BRAND = ', '');
const nums = [...table.matchAll(/^\s*(\d+):/gm)].map((m) => Number(m[1]));
eq('미리보기 번호 중복 없음', nums.length, new Set(nums).size);
eq('미리보기 번호는 1~6', nums.sort((a, b) => a - b), [1, 2, 3, 4, 5, 6]);

const brands = new Function(`return ${table}`)();
eq('프레임 수와 미리보기 수가 같다', Object.keys(brands).length, FRAMES.length);
for (const f of FRAMES) {
  eq(`프레임${f.no} 미리보기 있음`, typeof brands[f.no] === 'string' && brands[f.no].length > 3, true);
}
// 폐지한 프레임의 브랜드가 남아 있으면 안 된다(그 디자인을 파는 것처럼 보인다)
for (const dnsName of ['demo4.asapmall.kr', 'babypop.co.kr', 'dokdoland.com', 'buddymall.co.kr', 'malu-79.com']) {
  eq(`판매중단 브랜드 미노출 — ${dnsName}`, Object.values(brands).includes(dnsName), false);
}

// ── 화면이 no 를 안전하게 다루는지 ───────────────────────────────────────
// LEGACY 는 no 가 null 이라 .toString() 을 그냥 부르면 화면이 죽는다.
for (const rel of [
  'src/pages/manager/merchant-applications/index.js',
]) {
  // 주석은 뺀다 — '이렇게 부르면 죽는다' 라고 설명하는 주석까지 잡으면 오탐이다.
  const s = readFileSync(FRONT + rel, 'utf8')
    .split(/\r?\n/).filter((l) => !l.trim().startsWith('//')).join('\n');
  eq(`no.toString() 직접 호출 없음 — ${rel.split('/').pop()}`, /f\.no\.toString\(\)/.test(s), false);
  eq(`no == null 가드 있음 — ${rel.split('/').pop()}`, s.includes('f.no == null'), true);
}

// ── 카탈로그 배치: 3열 2행 한 판 ─────────────────────────────────────────
// 계열마다 제목을 달아 2장씩 끊어 놓으면 6장을 나란히 못 본다.
// 계열은 카드 우측 상단 배지로만 밝힌다.
{
  const page = readFileSync(FRONT + 'src/pages/frames.js', 'utf8')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')   // JSX 주석
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
  eq('계열 제목 문단 없음', /frames\.group\.\$\{[^}]*\}\.title/.test(page), false);
  // .desc 는 배지 마우스오버(title 속성) 한 자리에서만 쓴다 — 본문 문단으로 되살아나면 2회가 된다
  eq('계열 설명은 한 자리에서만', (page.match(/frames\.group\.\$\{[^}]*\}\.desc/g) || []).length, 1);
  eq('계열 배지 씀', /frames\.group\.\$\{f\.group\}\.short/.test(page), true);
  eq('배지 설명은 마우스오버로 남음', /title=\{st\(`frames\.group\.\$\{f\.group\}\.desc`\)\}/.test(page), true);
  // Grid 가 하나여야 한 판이다(계열별로 쪼개면 3개가 된다)
  eq('Grid container 한 개', (page.match(/<Grid container/g) || []).length, 1);
  eq('3열(md=4)', /md=\{4\}/.test(page), true);
}

// ── 계열 배지 문구가 5개 언어에 다 있는지 ────────────────────────────────
// 없으면 useSubpageT 가 키 문자열('frames.group.landing.short')을 그대로 그린다.
{
  const dict = readFileSync(FRONT + 'src/components/main-site/landingStrings.js', 'utf8');
  const 언어별 = [...dict.matchAll(/^\s{2}(ko|en|ja|cn|es):\s*\{/gm)];
  for (const g of ['shop', 'column', 'landing']) {
    const 개수 = (dict.match(new RegExp(`"frames\\.group\\.${g}\\.short"`, 'g')) || []).length;
    eq(`frames.group.${g}.short 5개 언어`, 개수, 5);
  }
  // 배지는 카드 폭이 좁다 — 번호 꼬리표('· 프레임1·2')가 붙은 .title 을 재활용하면 잘린다
  const shorts = [...dict.matchAll(/"frames\.group\.\w+\.short":\s*"([^"]+)"/g)].map((m) => m[1]);
  eq('배지 문구 15개', shorts.length, 15);
  eq('배지에 프레임 번호 꼬리표 없음', shorts.filter((s) => s.includes('·') && /\d/.test(s)), []);
  eq('언어 블록 5개', 언어별.length >= 5, true);
}

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
