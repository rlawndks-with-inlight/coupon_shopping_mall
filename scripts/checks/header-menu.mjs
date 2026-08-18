import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 카테고리 '별' = 상단 메뉴 노출.
//
// 붙잡아 두는 사고:
//  · 상단 메뉴를 그리는 프레임이 별을 안 보고 **전 카테고리**를 뿌렸다.
//    켜지는 것보다 **꺼지지 않는 것**이 문제였다 — 어드민에 끄는 버튼이 있는데 안 먹었다.
//  · 상단 메뉴가 아예 없는 프레임에서도 어드민에 별이 떴다.
//    되지도 않는 버튼을 두면 가맹점은 자기가 잘못 눌렀다고 생각한다.
//  · blog 4~9 는 전부 BlogLayout6 를 쓴다. blog/demo-4·5 의 header.js 는 아무도 import 하지 않는
//    죽은 파일이라, 그 파일만 보고 '이 프레임은 메뉴가 있다' 고 판단하면 틀린다.

let pass = 0, fail = 0;
const eq = (n, g, w) => {
    if (JSON.stringify(g) === JSON.stringify(w)) { pass++; console.log('  ok  ' + n); }
    else { fail++; console.log(`FAIL ${n}\n  got : ${JSON.stringify(g)}\n  want: ${JSON.stringify(w)}`); }
};

const { 상단메뉴있는프레임 } = await import('file:///' + FRONT_ROOT + 'src/data/header-menu-frames.js');

eq('쇼핑몰1 은 상단 메뉴가 있다', 상단메뉴있는프레임({ shop_demo_num: 1 }), true);
eq('쇼핑몰10 은 없다', 상단메뉴있는프레임({ shop_demo_num: 10 }), false);
eq('블로그2(프레임4) 는 있다', 상단메뉴있는프레임({ shop_demo_num: 0, blog_demo_num: 2 }), true);
eq('블로그1(프레임3) 은 없다', 상단메뉴있는프레임({ shop_demo_num: 0, blog_demo_num: 1 }), false);
eq('블로그4(프레임5) 는 없다 — BlogLayout6', 상단메뉴있는프레임({ shop_demo_num: 0, blog_demo_num: 4 }), false);
eq('블로그9(프레임6) 은 없다 — BlogLayout6', 상단메뉴있는프레임({ shop_demo_num: 0, blog_demo_num: 9 }), false);
eq('브랜드 정보가 없어도 안 죽는다', 상단메뉴있는프레임(undefined), false);

// 상단 메뉴를 그리는 헤더는 전부 별로 걸러야 한다
const 걸러야하는헤더 = [
    'src/layouts/shop/shop/demo-1/header.js', 'src/layouts/shop/shop/demo-2/header.js',
    'src/layouts/shop/shop/demo-3/header.js', 'src/layouts/shop/shop/demo-4/header.js',
    'src/layouts/shop/shop/demo-5/header.js', 'src/layouts/shop/shop/demo-6/header.js',
    'src/layouts/shop/shop/demo-7/header.js', 'src/layouts/shop/shop/demo-8/header.js',
    'src/layouts/shop/shop/demo-9/header.js',
    'src/layouts/shop/blog/demo-2/header.js', 'src/layouts/shop/blog/demo-3/header.js',
];
const 안거르는곳 = 걸러야하는헤더.filter((p) => {
    const src = readFileSync(FRONT_ROOT + p, 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');   // 주석 안은 안 돈다
    return !/is_show_header_menu\s*==\s*1/.test(src);
});
eq('상단 메뉴 헤더는 전부 별로 거른다', 안거르는곳, []);

// 어드민의 별은 프레임을 함께 본다
const 어드민 = readFileSync(FRONT_ROOT + 'src/pages/manager/products/categories/[id].js', 'utf8');
eq('어드민 별이 프레임을 본다',
   /is_show_header_menu == 1 && 상단메뉴있는프레임\(themeDnsData\)/.test(어드민), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
