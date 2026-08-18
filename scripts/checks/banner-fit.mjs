import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 배너는 자르지 않는다(contain). 비율이 다르면 여백이 생기고, 그 사실을 올릴 때 알려준다.
//
// 붙잡아 두는 것:
//  · cover 로 되돌아가면 규격을 안 지킨 배너가 소리 없이 잘려 나간다.
//    문구·로고가 든 배너면 그게 그대로 사라지는데, 화면만 봐서는 잘렸는지도 알 수 없다.
//  · '여백이 얼마나 생기는지' 계산이 틀리면 안내가 거꾸로 나간다.

let pass = 0, fail = 0;
const eq = (n, g, w) => {
    if (JSON.stringify(g) === JSON.stringify(w)) { pass++; console.log('  ok  ' + n); }
    else { fail++; console.log(`FAIL ${n}\n  got : ${JSON.stringify(g)}\n  want: ${JSON.stringify(w)}`); }
};
const 주석뺀 = (t) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

for (const [이름, p] of [
    ['쇼핑몰', 'src/views/section/shop/HomeBanner.js'],
    ['블로그', 'src/views/section/blog/HomeBanner.js'],
]) {
    const src = 주석뺀(readFileSync(FRONT_ROOT + p, 'utf8'));
    eq(`${이름} 배너는 자르지 않는다(contain)`, /background-size: contain;/.test(src), true);
    eq(`${이름} 배너에 cover 가 없다`, /background-size:[^;]*cover/.test(src), false);
}

// ── 여백 계산을 그대로 돌려 본다 ──────────────────────────────────────────
// 컨테이너보다 넓은 이미지 → 위아래에 남고, 좁은 이미지 → 좌우에 남는다.
const 목표 = 2000 / 850;
const 판정 = (w, h) => {
    const 비 = w / h;
    const 차이 = Math.abs(비 - 목표) / 목표;
    if (차이 <= 0.01) return { 종류: '맞음' };
    const 여백 = 비 > 목표 ? 1 - (목표 / 비) : 1 - (비 / 목표);
    return { 종류: 비 > 목표 ? '위아래' : '좌우', 여백: Math.round(여백 * 100) };
};
eq('권장 규격은 여백 없음', 판정(2000, 850), { 종류: '맞음' });
eq('2000x800(더 넓다) → 위아래 여백', 판정(2000, 800), { 종류: '위아래', 여백: 6 });
eq('2000x1000(더 좁다) → 좌우 여백', 판정(2000, 1000), { 종류: '좌우', 여백: 15 });
eq('정사각형 → 좌우 여백이 크다', 판정(1000, 1000).종류, '좌우');
eq('1% 안쪽 차이는 맞음으로 본다', 판정(2000, 845), { 종류: '맞음' });

// 화면이 같은 계산을 쓰는지
const 안내 = readFileSync(FRONT_ROOT + 'src/components/manager/BannerFitNotice.js', 'utf8');
eq('안내가 위아래/좌우를 가른다', /비 > 목표 \? '위아래' : '좌우'/.test(안내), true);
eq('1% 안쪽은 맞음으로 본다', /차이 <= 0\.01/.test(안내), true);

// 편집기에 실제로 붙어 있는지 — 컴포넌트만 만들고 안 붙이면 아무 일도 안 일어난다
const 편집기 = readFileSync(FRONT_ROOT + 'src/views/manager/main_obj/setting.js', 'utf8');
eq('배너 편집기에 안내가 붙어 있다', /<BannerFitNotice/.test(편집기), true);
eq('안내에 지금 목록을 넘긴다', /srcList=\{\(item\?\.list \?\? \[\]\)/.test(편집기), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
