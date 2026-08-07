// 브랜드 유형 판정 — /blog 경로를 /shop 으로 통일하면서 생긴 단일 규칙.
//
// [왜 통일했나]
//  같은 쇼핑몰인데 브랜드 유형에 따라 URL 루트가 /shop 과 /blog 로 갈려 있었다.
//  그 탓에 화면마다 "이 브랜드는 어느 쪽인가"를 판단해 링크를 분기해야 했고,
//  PG 복귀 URL 이 /shop/auth/pay-result 로 고정이라 블로그형 브랜드도 결국 /shop 으로
//  들어오면서 레이아웃·화면이 어긋나는 문제가 반복됐다.
//  → 경로는 /shop 하나로 두고, 어떤 화면을 보여줄지는 브랜드 유형으로 정한다.
//
// 각 페이지의 getDemo 가 이 함수로 갈라진다:
//   const getDemo = (dns, common) => {
//     if (isBlogBrand(dns)) return getBlogDemo(dns?.blog_demo_num, common);
//     const num = dns?.shop_demo_num;
//     ...
//   }
//
// 옛 /blog 주소는 src/pages/blog/** 의 리다이렉트 페이지들이 대응 /shop 주소로 넘긴다.
// 그 대응표는 각 리다이렉트 파일에 목적지로 적혀 있다(여기에 따로 두면 이 파일만 고치고
// 실제 파일은 안 고치는 식으로 어긋날 수 있다).

// 블로그형 브랜드인지 — 쇼핑몰 데모가 없고 블로그 데모만 있는 브랜드.
export const isBlogBrand = (dns) =>
  !(dns?.shop_demo_num > 0) && dns?.blog_demo_num > 0;
