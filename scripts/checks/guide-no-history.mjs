import { pathToFileURL } from 'url';
import { FRONT_ROOT } from './_roots.mjs';

// 이용가이드·PDF 매뉴얼에는 '지금 쓰는 법'만 적는다(사장님 지적 2026-11-06).
//   「예전에 있던 카테고리 이미지·설명 칸은 없앴습니다」 같은 변경 내력·만든 쪽 사정은 업체에 필요 없다.
//   이유가 필요하면 guideContent.js 의 // 주석에 적는다(주석은 화면·PDF 에 안 나간다).

let pass = 0, fail = 0;
const t = (name, cond, 보기 = '') => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name + (보기 ? '\n       ' + 보기 : '')); } };

const m = await import(pathToFileURL(FRONT_ROOT + 'src/components/manager/guideContent.js').href);
const 내력 = /예전에|예전처럼|예전 문구|없앴|넣지 않았|두지 않았|\(지금은|이제는|바뀌었습니다|옮겼습니다|고쳤습니다|개선되었|추가되었습니다/;
const 걸림 = [];
for (const s of m.GUIDE_SECTIONS) {
  const 글 = [['why', s.why], ...(s.steps || []).map((x, i) => [`순서${i + 1}`, typeof x === 'string' ? x : x?.text]),
    ...(s.fields || []).map((f) => [f.label, f.desc]), ...(s.shots || []).map((f) => ['사진', f.cap])];
  for (const [곳, 문] of 글) if (문 && 내력.test(문)) 걸림.push(`[${s.title} › ${곳}] ${String(문).slice(0, 80)}`);
}
t('이용가이드에 변경 내력 문장이 없다', 걸림.length === 0, 걸림.join('\n       '));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
