import { FRONT_ROOT, BACK_ROOT } from './_roots.mjs';
// OPEN 재대조에서 고친 항목들의 규칙 고정.
//
// 회귀 방지 대상
//  ① 브랜드설정 '메인페이지 수정'이 블로그형도 쇼핑몰 편집기로 보내던 문제
//  ② 상품카드에 중고몰 전용 NEW/USED 칩이 무조건 붙던 문제
//  ③ 상품 상세검색 필터가 '판매중(0)' 을 못 잡고, 한 번 고르면 전체로 못 돌아오던 문제
//  ④ 상세에서 품절·중단됨을 알 수 없고 버튼도 살아 있던 문제
import { readFileSync } from 'fs';
import {
  isShopSectionBuilder, isBlogSectionBuilder, mainDesignRoute,
} from 'file:///c:/Users/user/Desktop/project24/shop/coupon_shopping_mall_front-master/src/utils/section-builder.js';

const FRONT = FRONT_ROOT;

let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const g = JSON.stringify(got), w = JSON.stringify(want);
  if (g === w) pass++;
  else { fail++; console.log(`FAIL ${name}\n  got : ${g}\n  want: ${w}`); }
};

// ── ① 메인페이지관리 경로 ────────────────────────────────────────────────
// 판매중 11개 프레임: 1·2·3 = shop 1·2·4 / 4·5 = blog 1·2 / 6~11 = blog 4~9
eq('프레임1(shop1)', mainDesignRoute({ shop_demo_num: 1, blog_demo_num: 0 }), '/manager/designs/main/all');
eq('프레임2(shop2)', mainDesignRoute({ shop_demo_num: 2, blog_demo_num: 0 }), '/manager/designs/main/all');
eq('프레임3(shop4)', mainDesignRoute({ shop_demo_num: 4, blog_demo_num: 0 }), '/manager/designs/main/all');
// 이게 고친 문제다 — 블로그형인데 쇼핑몰 편집기로 보내면 편집할 섹션이 없어 빈 화면이 뜬다
eq('프레임4(blog1)', mainDesignRoute({ shop_demo_num: 0, blog_demo_num: 1 }), '/manager/designs/blog-main/all');
eq('프레임5(blog2)', mainDesignRoute({ shop_demo_num: 0, blog_demo_num: 2 }), '/manager/designs/blog-main/all');
// 프레임6~11 은 고정 레이아웃이라 편집 대상이 아예 없다 → 버튼을 내려야 한다
for (const n of [4, 5, 6, 7, 8, 9]) {
  eq(`프레임(blog${n})은 편집 대상 없음`, mainDesignRoute({ shop_demo_num: 0, blog_demo_num: n }), null);
}
eq('shop 7 은 고정 레이아웃', mainDesignRoute({ shop_demo_num: 7, blog_demo_num: 0 }), null);
// 브랜드 목록의 행을 넘길 때 쓰는 두 번째 인자(브랜드 id 세그먼트)
eq('브랜드설정에서는 id 세그먼트', mainDesignRoute({ shop_demo_num: 0, blog_demo_num: 2 }, 12), '/manager/designs/blog-main/12');
// 둘 다 있으면 쇼핑몰 쪽(기존 동작 유지)
eq('shop·blog 둘 다면 shop', mainDesignRoute({ shop_demo_num: 1, blog_demo_num: 1 }), '/manager/designs/main/all');
// setting_obj 로 강제 켠 경우
eq('setting_obj 로 켠 블로그', mainDesignRoute({ shop_demo_num: 0, blog_demo_num: 9, setting_obj: { is_use_blog_obj_style: 1 } }), '/manager/designs/blog-main/all');
eq('빈 값', mainDesignRoute(undefined), null);
eq('isShopSectionBuilder(shop9)', isShopSectionBuilder({ shop_demo_num: 9 }), true);
eq('isBlogSectionBuilder(blog4)', isBlogSectionBuilder({ blog_demo_num: 4 }), false);

// ── ② 중고몰 전용 표기 ───────────────────────────────────────────────────
const fnSrc = readFileSync(FRONT + 'src/utils/function.js', 'utf8');
const grab = (start, end) => {
  const i = fnSrc.indexOf(start);
  const j = fnSrc.indexOf(end, i) + end.length;
  return fnSrc.slice(i, j).replace(/export const /g, 'const ');
};
const F = new Function(
  grab('export const getProductStatus', '\n}') + '\n' +
  grab('export const isPurchasable', ';') + '\n' +
  grab('export const isUsedGoodsBrand', ';') + '\n' +
  'return { getProductStatus, isPurchasable, isUsedGoodsBrand };'
)();

eq('그랑파리는 중고몰', F.isUsedGoodsBrand({ id: 5 }), true);
eq('74도 중고몰', F.isUsedGoodsBrand({ id: 74 }), true);
// 이게 고친 문제다 — 다른 가맹점은 show_status 가 늘 0 이라 새 상품에도 'USED' 가 붙었다
eq('일반 가맹점은 아님', F.isUsedGoodsBrand({ id: 99 }), false);
eq('브랜드 없음', F.isUsedGoodsBrand(undefined), false);
eq('문자열 id 도 같게', F.isUsedGoodsBrand({ id: '5' }), true);

// ── ③ 상세검색 필터 ─────────────────────────────────────────────────────
const listSrc = readFileSync(FRONT + 'src/pages/manager/products/list.js', 'utf8');
// 화면 파일이라 통째로 import 할 수 없다 — 두 헬퍼가 모듈 스코프에 있는 덕에 잘라 쓸 수 있다.
const L = new Function(
  listSrc.slice(listSrc.indexOf('const isFilterOn'), listSrc.indexOf('const ProductList')) + '\n' +
  'return { isFilterOn, productStatusOptions };'
)();

// 0(판매중)이 유효한 값이다 — truthy 검사를 쓰면 이 칸이 영영 안 켜진다
eq('판매중(0) 체크됨', L.isFilterOn(0, 0), true);
eq('판매중(0) 다른 옵션은 꺼짐', L.isFilterOn(0, 2), false);
eq('문자열 0 도 같게', L.isFilterOn('0', 0), true);
// 조건 없음 상태에서는 어떤 칸도 켜지지 않아야 한다(= 전체)
eq("빈 문자열은 '전체'", L.isFilterOn('', 0), false);
eq('undefined 는 전체', L.isFilterOn(undefined, 0), false);
eq('null 도 전체', L.isFilterOn(null, 0), false);

// 상태 목록은 표의 Select 와 필터가 같은 것을 봐야 한다
eq('브랜드5 상태 8종', L.productStatusOptions(5).length, 8);
eq('브랜드74 상태 2종', L.productStatusOptions(74).length, 2);
eq('기본 상태 5종', L.productStatusOptions(1).map((o) => o.value), [0, 1, 2, 3, 5]);
eq('기본 상태 라벨', L.productStatusOptions(1).map((o) => o.label), ['판매중', '중단됨', '품절', '새상품', '비공개']);

// ── ④ 상세 구매 가능 판정 ────────────────────────────────────────────────
// 상세의 안내·버튼 잠금이 쓰는 것과 같은 판정이다.
eq('판매중은 구매 가능', F.isPurchasable(0), true);
eq('새상품도 구매 가능', F.isPurchasable(3), true);
eq('중단됨은 불가', F.isPurchasable(1), false);
eq('품절은 불가', F.isPurchasable(2), false);
eq('비공개는 불가', F.isPurchasable(5), false);
// 안내 문구는 상태맵에서 가져온다(판매중은 문구가 없어 안내를 띄우지 않는다)
eq('품절 문구', F.getProductStatus(2).text, '품절');
eq('중단됨 문구', F.getProductStatus(1).text, '중단됨');
eq('판매중은 문구 없음', F.getProductStatus(0).text, '판매중');

console.log(`\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail ? 1 : 0);
