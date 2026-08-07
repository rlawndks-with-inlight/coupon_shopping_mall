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

// 스토어프론트 '홈' 인지.
//
// 가맹점 도메인의 루트(/)는 next.config.js 의 rewrite 로 주소를 바꾸지 않은 채
// /shop 페이지를 렌더한다. 그래서 그 화면에서 asPath 는 '/shop/' 이 아니라 '/' 다.
// 헤더들이 팝업 노출·투명 배경·상단 여백을 asPath == '/shop/' 로 판정하고 있었어서,
// 이 함수 없이는 rewrite 가 켜지는 순간 홈에서 팝업이 사라진다.
//
// 두 형태를 모두 홈으로 본다:
//   '/'      가맹점 도메인 루트 (rewrite 경유)
//   '/shop/' 직접 접근하거나 본사 도메인에서 들어온 경우
// 경로가 고정된 /shop/main 같은 화면은 rewrite 대상이 아니므로 여기 해당하지 않는다.
export const isStorefrontHome = (router) => {
  const path = String(router?.asPath ?? '').split('?')[0].replace(/\/+$/, '');
  return path === '' || path === '/shop';
};
