import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 프레임별 '먼저 권하는 섹션'.
//
// 붙잡아 두는 것:
//  · 추천은 **막는 것이 아니다.** 홈 13종을 프레임 전부가 그리므로, 목록에서 빼 버리면
//    쓸 수 있는 기능을 화면에서 지우는 셈이 된다. 나머지도 아래 묶음에 남아야 한다.
//  · 추천에 적은 type 이 실제 섹션 목록에 없는 이름이면 그 줄은 조용히 사라진다.
//  · 섹션빌더가 아닌 프레임(blog 4~9 등)은 이 화면에 오지도 않는다.

let pass = 0, fail = 0;
const eq = (n, g, w) => {
    if (JSON.stringify(g) === JSON.stringify(w)) { pass++; console.log('  ok  ' + n); }
    else { fail++; console.log(`FAIL ${n}\n  got : ${JSON.stringify(g)}\n  want: ${JSON.stringify(w)}`); }
};

// 이 파일은 'src/...' 별칭으로 section-builder 를 가져온다. node 는 그 별칭을 모르므로
// 소스를 떼어와 필요한 판정만 넣고 돌린다(복사본을 만들면 진짜 코드와 어긋나도 통과한다).
const SB = await import('file:///' + FRONT_ROOT + 'src/utils/section-builder.js');
const 소스 = readFileSync(FRONT_ROOT + 'src/data/frame-sections.js', 'utf8')
  .replace(/^import .*$/m, '')
  .replace(/export const /g, 'const ');
const { 추천섹션 } = new Function('isShopSectionBuilder', 'isBlogSectionBuilder',
  소스 + '\nreturn { 추천섹션 };')(SB.isShopSectionBuilder, SB.isBlogSectionBuilder);

// 실제 섹션 목록에 있는 type 만 추천에 적혀 있어야 한다
const fmt = readFileSync(FRONT_ROOT + 'src/utils/format.js', 'utf8');
const 조각 = fmt.slice(fmt.indexOf('export const mainObjSchemaList'));
const 있는type = new Set([...조각.matchAll(/\n\s{8}type: '([^']+)'/g)].map((m) => m[1]));
eq('섹션 목록을 읽었다', 있는type.size > 5, true);

const 프레임 = [
    ['프레임1 shop:1', { shop_demo_num: 1, blog_demo_num: 0 }],
    ['프레임2 shop:2', { shop_demo_num: 2, blog_demo_num: 0 }],
    ['프레임3 blog:1', { shop_demo_num: 0, blog_demo_num: 1 }],
    ['프레임4 blog:2', { shop_demo_num: 0, blog_demo_num: 2 }],
];
for (const [이름, dns] of 프레임) {
    const 목록 = 추천섹션(dns);
    eq(`${이름} 추천이 비어 있지 않다`, 목록.length > 0, true);
    eq(`${이름} 추천에 없는 섹션 이름 없음`, 목록.filter((t) => !있는type.has(t)), []);
    eq(`${이름} 첫 추천은 배너`, 목록[0], 'banner');   // 어느 프레임이든 배너부터가 자연스럽다
}

// 판매중단 프레임도 빈손으로 두지 않는다
eq('판매중단 shop:4 도 추천이 있다', 추천섹션({ shop_demo_num: 4 }).length > 0, true);
// 섹션빌더가 아닌 프레임은 빈 배열(이 화면에 오지도 않는다)
eq('섹션빌더가 아니면 빈 배열', 추천섹션({ shop_demo_num: 0, blog_demo_num: 9 }), []);
eq('브랜드 정보가 없어도 안 죽는다', 추천섹션(undefined), []);

// 화면 배선 — 막지 않고 묶기만 하는지
const src = readFileSync(FRONT_ROOT + 'src/views/manager/main_obj/setting.js', 'utf8');
eq('추천 묶음 제목이 있다', /이 프레임에 어울리는 섹션/.test(src), true);
eq('나머지도 그대로 고를 수 있다', /그 밖의 섹션/.test(src), true);
eq('추천을 모르면 예전처럼 한 줄', /if \(!추천목록\.length\) return 전체\.map\(줄\);/.test(src), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
