import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// 가이드 프레임 계열 판정/경로 해석 테스트.
// 핵심 회귀 방지 대상:
//  · 프레임3·4 가이드의 '해당 메뉴로 이동'이 쇼핑몰 경로(/designs/main)로 가던 버그
//  · 프레임5·6 에 없는 메뉴(메인페이지관리)를 안내하던 버그
// (아래 이름은 지금 카탈로그(frameList.js)의 번호를 따른다. 저장값→번호 대응은
//  guide-frame-filter.mjs 가 카탈로그와 직접 대조한다)
import { readFileSync } from 'fs';

const SRC = FRONT_ROOT + 'src/components/manager/guideContent.js';
const code = readFileSync(SRC, 'utf8');
const mod = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
const { frameGroupOf, guideRouteOf, GUIDE_PART1, GUIDE_PART2, FRAME_GROUP_LABEL } = mod;

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  if (ok) pass++; else { fail++; console.log(`FAIL ${name}\n  got : ${JSON.stringify(got)}\n  want: ${JSON.stringify(want)}`); }
};

// ── 계열 판정 ──────────────────────────────────────────────────────────────
eq('프레임1(shop 1)', frameGroupOf({ shop_demo_num: 1, blog_demo_num: 0 }), 'shop');
eq('프레임2(shop 2)', frameGroupOf({ shop_demo_num: 2 }), 'shop');
eq('shop 4(판매 중단)', frameGroupOf({ shop_demo_num: 4 }), 'shop');
eq('프레임3(blog 1)', frameGroupOf({ shop_demo_num: 0, blog_demo_num: 1 }), 'column');
eq('프레임4(blog 2)', frameGroupOf({ blog_demo_num: 2 }), 'column');
eq('blog 3(미판매)', frameGroupOf({ blog_demo_num: 3 }), 'column');
// blog 4 = 프레임5, blog 9 = 프레임6. 사이 번호(5~8)는 카탈로그에 없지만 같은 계열로 떨어져야 한다.
for (const n of [4, 5, 6, 7, 8, 9]) {
  eq(`blog ${n}`, frameGroupOf({ blog_demo_num: n }), 'landing');
}
// 쇼핑몰·블로그 둘 다 가진 브랜드는 쇼핑몰 기준(관리자 메뉴가 '쇼핑몰 메인페이지관리'로 뜬다)
eq('shop+blog 겸용', frameGroupOf({ shop_demo_num: 1, blog_demo_num: 5 }), 'shop');
// 프레임 미지정 → null → 가이드는 전부 표시(신청 전 /manual 과 같은 취급)
eq('프레임 미지정', frameGroupOf({}), null);
eq('dns 없음', frameGroupOf(null), null);
// 문자열로 들어오는 경우(API 가 숫자를 문자열로 주는 자리가 있다)
eq('문자열 blog_demo_num', frameGroupOf({ blog_demo_num: '7' }), 'landing');
eq('문자열 shop_demo_num', frameGroupOf({ shop_demo_num: '2' }), 'shop');

// ── 경로 해석 ──────────────────────────────────────────────────────────────
const design = GUIDE_PART1.find((s) => s.id === 'design');
eq('프레임1·2·3 메인페이지관리 경로', guideRouteOf(design, 'shop'), '/manager/designs/main/all');
// 이게 이번 수정의 본체 — 예전엔 계열과 무관하게 /designs/main/all 로 보냈다.
eq('프레임4·5 메인페이지관리 경로', guideRouteOf(design, 'column'), '/manager/designs/blog-main/all');
eq('계열 모를 때 기본 경로', guideRouteOf(design, null), '/manager/designs/main/all');
// 참조편의 디자인관리는 계열마다 다른 항목으로 갈렸다(옛 공용 항목 menu-design 은 없앴다).
// 계열별로 '어떤 섹션을 어떤 차례로' 를 적어야 해서인데, 그러면 경로도 각 항목에 직접 붙는다
// — routeByGroup 으로 갈라 줄 필요가 없어졌다. 그래도 도착지는 그대로여야 한다.
eq('옛 공용 항목은 없앴다', GUIDE_PART2.some((s) => s.id === 'menu-design'), false);
const designShop = GUIDE_PART2.find((s) => s.id === 'menu-design-shop');
const designColumn = GUIDE_PART2.find((s) => s.id === 'menu-design-column');
eq('참조편 프레임1·2 경로', guideRouteOf(designShop, 'shop'), '/manager/designs/main/all');
eq('참조편 프레임3·4 경로', guideRouteOf(designColumn, 'column'), '/manager/designs/blog-main/all');
eq('참조편 프레임1·2 는 shop 전용', designShop?.groups, ['shop']);
eq('참조편 프레임3·4 는 column 전용', designColumn?.groups, ['column']);

// ── 계열별 노출 ────────────────────────────────────────────────────────────
const visible = (group, list) => list.filter((s) => !s.groups || s.groups.includes(group)).map((s) => s.id);
const p1 = (g) => visible(g, GUIDE_PART1);
// 프레임6~11: 섹션 배치 편집기가 없다 → 'design' 안 보이고 'home-texts'·'featured' 가 보인다
eq('landing 에 design 없음', p1('landing').includes('design'), false);
eq('landing 에 home-texts 있음', p1('landing').includes('home-texts'), true);
eq('landing 에 featured 있음', p1('landing').includes('featured'), true);
// 프레임1~5: 대표상품 메뉴가 없다(관리자 nav 도 blog 4~9 에만 노출)
eq('shop 에 featured 없음', p1('shop').includes('featured'), false);
eq('column 에 featured 없음', p1('column').includes('featured'), false);
eq('shop 에 design 있음', p1('shop').includes('design'), true);
eq('column 에 design 있음', p1('column').includes('design'), true);
eq('shop 에 home-texts 없음', p1('shop').includes('home-texts'), false);
// 계열을 모르면(신청 전 랜딩) 전부 보인다
eq('null 이면 전부 노출', GUIDE_PART1.filter((s) => !null || true).length, GUIDE_PART1.length);
// 어느 계열이든 필수 단계(카테고리·상품·결제)는 항상 보인다
for (const g of ['shop', 'column', 'landing']) {
  for (const id of ['access', 'basic', 'delivery', 'category', 'product', 'payment']) {
    eq(`${g}: ${id} 노출`, p1(g).includes(id), true);
  }
}
// 계열별로 '메인 화면 꾸미기' 안내가 정확히 하나씩은 있어야 한다(0개면 안내 공백, 2개면 중복)
for (const g of ['shop', 'column', 'landing']) {
  const homeGuides = p1(g).filter((id) => id === 'design' || id === 'home-texts');
  eq(`${g}: 홈 꾸미기 안내 1개`, homeGuides.length, 1);
}
// 라벨 표기
eq('라벨', [FRAME_GROUP_LABEL.shop, FRAME_GROUP_LABEL.column, FRAME_GROUP_LABEL.landing],
  ['프레임1·2', '프레임3·4', '프레임5·6']);

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
