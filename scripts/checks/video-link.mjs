import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 동영상 슬라이드가 링크 때문에 홈 전체를 죽이지 않는지 고정.
//
// 붙잡아 두는 사고: 예전 코드는 `link.split('?')[1].split('=')[1]` 이었다.
//   · 링크를 비워 두면            → undefined.split → TypeError
//   · https://youtu.be/ID (단축)  → '?' 가 없어 undefined → TypeError
// 섹션 하나가 렌더 도중 터지면 그 위 트리가 같이 죽어 **홈이 백지**가 된다.
import { readFileSync } from 'fs';

const FRONT = FRONT_ROOT;
const src = readFileSync(`${FRONT}src/utils/function.js`, 'utf8');
const i = src.indexOf('export const youtubeEmbedId');
if (i < 0) throw new Error('youtubeEmbedId 를 못 찾음');
const { youtubeEmbedId } = new Function(
  `${src.slice(i, src.indexOf('\n};', i) + 3).replace('export ', '')}\nreturn { youtubeEmbedId };`
)();

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  if (got === want) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`); }
};

const ID = 'dQw4w9WgXcQ';
eq('일반 주소', youtubeEmbedId(`https://www.youtube.com/watch?v=${ID}`), ID);
eq('파라미터가 더 붙어도', youtubeEmbedId(`https://www.youtube.com/watch?v=${ID}&t=30s`), ID);
eq('v 가 뒤에 와도', youtubeEmbedId(`https://www.youtube.com/watch?list=PL1&v=${ID}`), ID);
eq('단축 주소', youtubeEmbedId(`https://youtu.be/${ID}`), ID);
eq('단축 + 파라미터', youtubeEmbedId(`https://youtu.be/${ID}?t=10`), ID);
eq('embed 주소', youtubeEmbedId(`https://www.youtube.com/embed/${ID}`), ID);
eq('쇼츠', youtubeEmbedId(`https://www.youtube.com/shorts/${ID}`), ID);
eq('라이브', youtubeEmbedId(`https://www.youtube.com/live/${ID}`), ID);
eq('http 도', youtubeEmbedId(`http://youtube.com/watch?v=${ID}`), ID);
eq('앞뒤 공백', youtubeEmbedId(`  https://youtu.be/${ID}  `), ID);
eq('id 만 넣어도', youtubeEmbedId(ID), ID);

// 못 알아보는 것은 빈 문자열 — 부르는 쪽이 그 항목만 건너뛴다
eq('빈 값', youtubeEmbedId(''), '');
eq('undefined', youtubeEmbedId(undefined), '');
eq('null', youtubeEmbedId(null), '');
eq('유튜브가 아닌 주소', youtubeEmbedId('https://naver.com'), '');
eq('말이 안 되는 값', youtubeEmbedId('그냥 글자'), '');
eq('숫자', youtubeEmbedId(12345), '');

// ── 화면이 정말 이 함수를 거치는지 ───────────────────────────────────────
for (const rel of ['src/views/section/blog/HomeVideoSlide.js', 'src/views/section/shop/HomeVideoSlide.js']) {
  const s = readFileSync(FRONT + rel, 'utf8');
  const name = rel.split('/').slice(-2).join('/');
  if (/link\.split\(/.test(s)) { fail++; console.log(`FAIL ${name} — 아직 link.split 을 직접 쓴다`); }
  else pass++;
  if (/youtubeEmbedId\(/.test(s)) pass++;
  else { fail++; console.log(`FAIL ${name} — youtubeEmbedId 를 안 쓴다`); }
  if (/if \(!link\) return null/.test(s)) pass++;
  else { fail++; console.log(`FAIL ${name} — 못 알아본 항목을 건너뛰지 않는다`); }
}

// ── 히어로2 가 좁은 칸에서 접히는지(창 폭이 아니라 칸 폭 기준) ───────────
// 주석에는 '왜 안 쓰는지' 설명이 들어 있으므로 코드만 보고 판단한다.
const hero = readFileSync(`${FRONT}src/views/section/shop/HomeItemHero.js`, 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
if (/@container/.test(hero)) {
  fail++; console.log('FAIL 히어로2 — styled-components 5.x 는 @container 를 버린다. flex-wrap 을 쓸 것');
} else pass++;
if (/flex-wrap: wrap/.test(hero)) pass++;
else { fail++; console.log('FAIL 히어로2 — flex-wrap 이 없다'); }
if (/flex: 1 1 200px/.test(hero)) pass++;
else { fail++; console.log('FAIL 히어로2 — 좌우 칸 최소 폭(200px)이 없다'); }

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
