import { FRONT_ROOT } from './_roots.mjs';
import { readdirSync, readFileSync } from 'fs';

// 블로그형 홈 섹션이 '화면 폭' 을 기준으로 크기를 잡고 있지 않은지 본다.
//
// 왜 필요한가:
//   블로그형 프레임(3·4)은 홈 본문이 840px 컬럼으로 묶여 있다. 그런데 이 섹션들은
//   쇼핑몰형에서 복사해 온 것이 많아 '화면이 넓으면 자리도 넓다' 를 전제로 짜여 있다.
//
//   실제로 두 곳이 그랬다:
//     · 게시판   PostBox width:600px  ← 50% 칸(420px)을 180px 삐져나왔다
//     · 동영상   Iframe  width:1016px ← 840px 컬럼을 176px 삐져나왔다
//   둘 다 줄여 주는 조건이 @media(화면 1200px)라, 1400px 모니터에서는 걸리지도 않았다.
//   화면은 넓은데 자리가 좁은 상황을 미디어쿼리는 볼 수 없다.
//
//   눈으로만 잡을 수 있는 종류다 — 빌드도 통과하고 curl 도 200 이다. 가맹점이 그 섹션을
//   홈에 얹어 봐야 드러난다. 그래서 자로 재서 막는다.
//
// 판정: 담긴 자리보다 클 수 있는 '굳은 폭'(width:NNNpx, width:NNvw)을 금지한다.
//       max-width 는 괜찮다 — 자리가 좁으면 알아서 줄어든다.

const 컬럼 = 840;      // 블로그형 홈 본문 최대 폭
const 여유 = 420;      // 2단으로 나뉘었을 때 한 칸

let pass = 0, fail = 0;
const t = (name, cond) => { if (cond) { pass++; console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name); } };

const dir = FRONT_ROOT + 'src/views/section/blog/';
const 파일들 = readdirSync(dir).filter((f) => f.endsWith('.js'));
t('블로그 섹션 파일을 읽었다', 파일들.length > 5);

const 걸린것 = [];
for (const f of 파일들) {
    const 줄들 = readFileSync(dir + f, 'utf8').split('\n');
    줄들.forEach((line, i) => {
        // max-width / min-width 는 건드리지 않는다(앞 글자가 '-' 면 거른다).
        const px = line.match(/(^|[^-])\bwidth\s*:\s*(\d{3,})px/);
        if (px && Number(px[2]) > 여유) 걸린것.push(`${f}:${i + 1}  ${line.trim()}`);
        // vw 는 담긴 자리가 아니라 화면을 본다 — 840px 컬럼 안에서는 늘 틀린다.
        const vw = line.match(/(^|[^-])\bwidth\s*:\s*([\d.]+)vw/);
        if (vw) 걸린것.push(`${f}:${i + 1}  ${line.trim()}`);
    });
}
if (걸린것.length) for (const x of 걸린것) console.log('        ' + x);
t(`굳은 폭이 없다 (컬럼 ${컬럼}px · 2단이면 ${여유}px)`, 걸린것.length === 0);

// 고쳐 둔 두 곳이 되돌아가지 않았는지 못 박는다.
const post = readFileSync(dir + 'HomePost.js', 'utf8');
t('게시판 칸이 자리에 맞춰 접힌다', /flex: 1 1 320px;/.test(post) && /flex-wrap: wrap;/.test(post));
t('게시판 상자는 상한만 둔다', /max-width:600px;/.test(post));
const video = readFileSync(dir + 'HomeVideoSlide.js', 'utf8');
t('동영상이 자리에 맞춘다', /max-width: 1016px;/.test(video) && /aspect-ratio: 1016 \/ 542;/.test(video));

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
