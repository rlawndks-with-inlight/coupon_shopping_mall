import { FRONT_ROOT } from './_roots.mjs';
import { readFileSync } from 'fs';

// 상단 카테고리 메뉴 — 어느 프레임에 있고, 무엇을 올리는가.
//
// 결론: 만든 카테고리는 **거르지 않고 다 올린다.**
//   별(is_show_header_menu)로 골라 올리던 것을 없앴다 —
//   1,404개 중 1,403개가 켜져 있어 아무도 안 쓰던 기능이고, 노출(눈)과 헷갈렸으며,
//   블로그형 프레임에는 상단 메뉴 자체가 없어 절반은 눌러도 아무 일이 없었다.
//   카테고리를 감추는 수단은 노출(status)이 이미 있다.
//
// 붙잡아 두는 것:
//  · 별 필터가 되살아나면 안 된다(그 기능은 없앴다).
//  · 어드민에 별 아이콘이 다시 생기면 안 된다.
//  · 어느 프레임에 상단 메뉴가 있는지는 '값을 준비하나' 가 아니라 '화면에 그리나' 로 판단한다.
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
// ⚠ 블로그형은 하나도 없다. 2·3 은 categories state 와 hover 표까지 만들어 두지만
//    JSX 에 내보내지 않는다 — 코드가 있으니 그리는 줄 알기 쉽다(실제로 그렇게 잘못 읽었다).
eq('블로그2(프레임4) 도 없다 — 값만 만들고 안 그린다', 상단메뉴있는프레임({ shop_demo_num: 0, blog_demo_num: 2 }), false);
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
];
// 별로 거르던 코드가 되살아나면 안 된다. 만든 카테고리는 다 올린다.
const 아직거르는곳 = 걸러야하는헤더.filter((p) =>
    readFileSync(FRONT_ROOT + p, 'utf8').includes('is_show_header_menu'));
eq('상단 메뉴 헤더가 별로 거르지 않는다', 아직거르는곳, []);

// 블로그 헤더는 카테고리를 화면에 그리지 않는다.
// 그리기 시작하면 이 검사가 걸리고, 그때 별 필터를 함께 넣어야 한다.
for (const p of ['src/layouts/shop/blog/demo-2/header.js', 'src/layouts/shop/blog/demo-3/header.js']) {
    const 본문 = readFileSync(FRONT_ROOT + p, 'utf8');
    const 렌더 = 본문.slice(본문.indexOf(String.fromCharCode(10) + '    return ('));
    eq(`${p.split('/').slice(-2).join('/')} 는 카테고리를 안 그린다`,
       /categories|category_name/.test(렌더), false);
}

// 어드민에 별 아이콘이 없어야 한다.
// 정규식 대신 문자열 포함으로 본다 — 아래 세 문자열은 남은 설명 주석에는 나오지 않는다.
const 어드민 = readFileSync(FRONT_ROOT + 'src/pages/manager/products/categories/[id].js', 'utf8');
eq('어드민에 별 아이콘이 없다', 어드민.includes('iconoir:star-solid'), false);
eq('별 토글도 없다', 어드민.includes("onChangeStatus('is_show_header_menu'"), false);
// 상단 메뉴가 있는 프레임에서만 그 사실을 알린다
eq('상단 메뉴 안내는 프레임을 보고 띄운다', 어드민.includes('상단메뉴있는프레임(themeDnsData)'), true);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
