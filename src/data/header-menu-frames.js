// 상단 메뉴에 카테고리를 그리는 프레임.
//
// 왜 필요한가:
//   카테고리 목록의 '별'(is_show_header_menu)은 **상단 메뉴에 올릴지**를 정하는 값이다.
//   그런데 그 별은 카테고리 그룹 설정만 보고 떴다 — 프레임과 무관하게.
//   상단 메뉴 자체가 없는 프레임(매거진형·파스텔 감성형 등)에서도 별이 보였고,
//   눌러도 아무 일이 일어나지 않았다. 되지도 않는 버튼을 두면 가맹점은 자기가
//   잘못 눌렀다고 생각한다.
//
// 조사한 결과(2026-08-19):
//   쇼핑몰형 1·2·3·4·5·6·7·8·9  헤더가 카테고리를 그린다(별로 거른다)
//   쇼핑몰형 10                 빈 컴포넌트
//   블로그형 2·3                헤더가 카테고리를 그린다(별로 거른다)
//   블로그형 1                  BlogLayout1 — 헤더에 카테고리 메뉴가 없다
//   블로그형 4~9                전부 BlogLayout6 를 쓴다 — 카테고리 메뉴가 없다
//     (blog/demo-4·5 폴더의 header.js 는 어디서도 import 하지 않는 죽은 파일이다.
//      ShopLayout.js 의 매핑이 4~9 를 모두 BlogLayout6 로 보낸다)
const HEADER_MENU_SHOP_DEMOS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const HEADER_MENU_BLOG_DEMOS = [2, 3];

// 이 브랜드의 화면에 상단 카테고리 메뉴가 있는가.
export const 상단메뉴있는프레임 = (dns) => {
    const shop = Number(dns?.shop_demo_num) || 0;
    if (shop > 0) return HEADER_MENU_SHOP_DEMOS.includes(shop);
    const blog = Number(dns?.blog_demo_num) || 0;
    return HEADER_MENU_BLOG_DEMOS.includes(blog);
};

export { HEADER_MENU_SHOP_DEMOS, HEADER_MENU_BLOG_DEMOS };
