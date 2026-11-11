import fs from 'fs';
import { pathToFileURL } from 'url';
import { FRONT_ROOT } from './_roots.mjs';

// 이용가이드·PDF 매뉴얼 문체 — 기계가 쓴 티가 나는 버릇을 막는다(사장님 지적 2026-11-11).
//   · 문장 중간 줄표(—)로 뒷말 덧붙이기 → 마침표로 끊는다
//   · 「~가 아니라 ~」 대비 → 사실만 적는다
//   · 경고·체크 이모지, 「한눈에」 「자유롭게」 「안정적 운영」 「~것이 좋습니다」 「공을 들이」 같은 상투어
//   · 「오픈 시퀀스」 「전제」 같은 번역투 용어
// 화면 고정 문구(GuideBody·관리자 가이드 머리말·PDF 표지)도 같이 본다. // 주석은 손님·가맹점에게 안 보이니 뺀다.

let pass = 0, fail = 0;
const t = (name, cond, 보기 = '') => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name + (보기 ? '\n       ' + 보기 : '')); } };

const 버릇 = [
  [/—/, '줄표(—)'],
  [/[⚠✅❌👉✨💡]/u, '이모지'],
  [/가 아니라|이 아니라/, '「~가 아니라」 대비'],
  [/한눈에|자유롭게|안정적 운영|것이 좋습니다|공을 들|차이를 만듭니다|손쉽게|간편하게|효과적으로|원활/, '상투어'],
  [/시퀀스|전제입니다/, '번역투 용어'],
];
const 검사 = (곳, 문) => 버릇.filter(([re]) => re.test(String(문 ?? ''))).map(([, 이름]) => `[${곳}] ${이름}: ${String(문).slice(0, 70)}`);

const m = await import(pathToFileURL(FRONT_ROOT + 'src/components/manager/guideContent.js').href);
const 걸림 = [];
for (const s of m.GUIDE_SECTIONS) {
  const 글 = [['제목', s.title], ['위치', s.where], ['why', s.why], ...Object.values(s.titleByFrame || {}).map((x) => ['프레임제목', x]),
    ...(s.steps || []).map((x, i) => [`순서${i + 1}`, typeof x === 'string' ? x : x?.text]),
    ...(s.fields || []).flatMap((f) => [['칸 이름', f.label], [f.label, f.desc]]), ...(s.shots || []).map((f) => ['사진', f.cap])];
  for (const [곳, 문] of 글) 걸림.push(...검사(`${s.title} › ${곳}`, 문));
}
t('가이드 본문에 기계 문체 버릇이 없다', 걸림.length === 0, 걸림.join('\n       '));

// 화면 고정 문구 — 주석(//, /* */, #)을 뺀 줄만 본다.
const 고정 = [];
for (const rel of ['src/components/manager/GuideBody.js', 'src/pages/manager/guide.js', 'scripts/guide-pdf/build.py']) {
  const 원문 = fs.readFileSync(FRONT_ROOT + rel, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/"""[\s\S]*?"""/g, '');
  원문.split(/\r?\n/).forEach((줄, i) => {
    const 코드 = 줄.replace(/\s\/\/.*$/, '').replace(/^\s*(\/\/|#).*$/, '').replace(/\s#\s.*$/, '');
    if (!/[가-힣]/.test(코드) || /print\(|console\./.test(코드)) return;
    고정.push(...검사(`${rel}:${i + 1}`, 코드.trim()));
  });
}
t('가이드 화면 고정 문구·PDF 표지에 기계 문체 버릇이 없다', 고정.length === 0, 고정.join('\n       '));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
