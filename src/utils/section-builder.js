// 홈을 shop_obj / blog_obj 섹션 배열로 그리는 데모(= 「메인페이지관리」로 편집 가능한 데모) 판정.
//
// 같은 규칙이 config-navigation(메뉴 노출)·OnboardingChecklist(바로가기)·브랜드설정(메인페이지 수정)
// 세 곳에 각각 복사돼 있었고, 그래서 브랜드설정만 규칙이 낡아 블로그형 브랜드도 쇼핑몰 편집기
// (/designs/main)로 보냈다 — 열어도 편집 대상이 없어 빈 화면이 뜬다.
//
// shop 4·5·6·9 는 자체 파일이 HomeDemo1 을 감싸는 구조라 shop_obj 를 그대로 쓴다.
// shop 7·8 은 자체 고정 레이아웃, shop 10 은 빈 컴포넌트, blog 4~9 는 고정 레이아웃 → 편집 대상 없음.
export const SECTION_BUILDER_SHOP_DEMOS = [1, 2, 3, 4, 5, 6, 9];
export const SECTION_BUILDER_BLOG_DEMOS = [1, 2, 3];

export const isShopSectionBuilder = (dns) =>
  SECTION_BUILDER_SHOP_DEMOS.includes(Number(dns?.shop_demo_num))
  || dns?.setting_obj?.is_use_shop_obj_style == 1;

export const isBlogSectionBuilder = (dns) =>
  SECTION_BUILDER_BLOG_DEMOS.includes(Number(dns?.blog_demo_num))
  || dns?.setting_obj?.is_use_blog_obj_style == 1;

// 이 브랜드의 「메인페이지관리」 경로. 편집 대상이 없으면 null 이다
// (null 이면 버튼·메뉴를 아예 내려야 한다 — 누르면 빈 화면이 뜨는 버튼을 남기지 않는다).
export const mainDesignRoute = (dns, segment = 'all') => {
  const shop = isShopSectionBuilder(dns);
  const blog = isBlogSectionBuilder(dns);
  if (blog && !shop) return `/manager/designs/blog-main/${segment}`;
  if (shop) return `/manager/designs/main/${segment}`;
  return null;
};
