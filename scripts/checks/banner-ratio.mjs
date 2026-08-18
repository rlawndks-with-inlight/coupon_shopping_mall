import { FRONT_ROOT, BACK_ROOT, 백엔드있음 } from './_roots.mjs';
import { readFileSync } from 'fs';

// 배너는 **비율로만** 그린다.
//
// 붙잡아 두는 사고:
//   높이를 강제하면(min-height·max-height) 컨테이너 비율이 이미지 비율과 달라진다.
//   배너는 background-size: cover 라 그 차이만큼 좌우가 잘려 나간다.
//   기본값 min 200px 은 **폰에서 늘 걸렸다**:
//     360px 폭 → 자연 높이 153px 인데 200px 로 늘어남 → 2.35:1 이 1.80:1 → 좌우 약 25% 잘림
//   그래서 권장 규격(2000x850)을 정확히 지켜 올린 가맹점도 폰에서는 잘렸다.
//
// 상한은 높이가 아니라 **폭**으로 잡는다 — 폭을 줄이면 높이가 따라 줄어 비율이 산다.

let pass = 0, fail = 0;
const eq = (n, g, w) => {
    if (JSON.stringify(g) === JSON.stringify(w)) { pass++; console.log('  ok  ' + n); }
    else { fail++; console.log(`FAIL ${n}\n  got : ${JSON.stringify(g)}\n  want: ${JSON.stringify(w)}`); }
};

// 주석은 빼고 본다 — '예전엔 min-height 를 썼다' 같은 설명이 스스로를 걸리게 한다.
const 주석뺀 = (t) => t
    .replace(/\/\*[\s\S]*?\*\//g, '')     // 블록주석 (JSX 주석 {/* */} 도 여기서 함께 지워진다)
    .replace(/^\s*\/\/.*$/gm, '');        // 한 줄 주석

const shop = 주석뺀(readFileSync(FRONT_ROOT + 'src/views/section/shop/HomeBanner.js', 'utf8'));
const blog = 주석뺀(readFileSync(FRONT_ROOT + 'src/views/section/blog/HomeBanner.js', 'utf8'));

for (const [이름, src] of [['쇼핑몰', shop], ['블로그', blog]]) {
    eq(`${이름} 배너는 aspect-ratio 로 비율을 고정한다`, /aspect-ratio:/.test(src), true);
    // 높이 강제가 다시 들어오면 잘림이 돌아온다
    eq(`${이름} 배너에 높이 강제가 없다`,
       /min-height:|max-height:|minHeight|maxHeight/.test(src), false);
    eq(`${이름} 상한은 폭으로 잡는다`, /max-width:/.test(src), true);
}

// 편집기에 그 입력칸이 다시 생기면 안 된다
const 편집기 = 주석뺀(readFileSync(FRONT_ROOT + 'src/views/manager/main_obj/setting.js', 'utf8'));
eq('편집기에 최소/최대 높이 입력칸이 없다', /이미지 최소높이|이미지 최대높이/.test(편집기), false);

// 새 섹션·신규 개설 몰의 기본값에도 남아 있으면 안 된다
for (const [이름, p] of [
    ['섹션 기본값(format.js)', FRONT_ROOT + 'src/utils/format.js'],
    ['기본 배너(default-banners.js)', FRONT_ROOT + 'src/data/default-banners.js'],
]) {
    eq(`${이름} 에 min_height 없음`, /min_height/.test(readFileSync(p, 'utf8')), false);
}
if (백엔드있음) {
    eq('개설 시 심는 섹션(back default-home.js) 에 min_height 없음',
       /min_height/.test(readFileSync(BACK_ROOT + 'utils.js/default-home.js', 'utf8')), false);
}

// 권장 규격과 컨테이너 비율이 같아야 한다 — 다르면 안내대로 올려도 잘린다
const banners = readFileSync(FRONT_ROOT + 'src/data/default-banners.js', 'utf8');
eq('권장 규격은 2000x850(2.35:1)', /label: '2000x850', aspect: 2000 \/ 850/.test(banners), true);
eq('컨테이너도 2000/850 비율', /'2000 \/ 850'/.test(shop) && /2000 \/ 850/.test(blog), true);
eq('2:1 프레임 권장 규격은 2000x1000', /label: '2000x1000', aspect: 2 \/ 1/.test(banners), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
