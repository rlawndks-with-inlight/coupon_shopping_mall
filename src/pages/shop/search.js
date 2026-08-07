import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import { SearchDemo1 } from "src/views/shop/demo-1";
import { SearchDemo2 } from "src/views/shop/demo-2";
import { SearchDemo3 } from "src/views/shop/demo-3";
import { SearchDemo4 } from "src/views/shop/demo-4";
import { SearchDemo5 } from "src/views/shop/demo-5";
import { SearchDemo6 } from "src/views/shop/demo-6";
import { SearchDemo7 } from "src/views/shop/demo-7";
import { SearchDemo8 } from "src/views/shop/demo-8";
import { SearchDemo9 } from "src/views/shop/demo-9";
import { isBlogBrand } from "src/utils/blog-shop-route";
import Blog_Demo1 from "src/views/blog/search/demo-1";
import Blog_Demo2 from "src/views/blog/search/demo-2";
import Blog_Demo3 from "src/views/blog/search/demo-3";
import Blog_Demo4 from "src/views/blog/search/demo-4";
import Blog_Demo5 from "src/views/blog/search/demo-5";
//import { SearchDemo10 } from "src/views/shop/demo-10";

// 블로그형 브랜드용 화면. URL 을 /shop 으로 통일하면서 blog 페이지의 뷰 선택을 여기로 옮겼다.
const getBlogDemo = (num, common) => {
    // 모든 blog 프레임 검색을 기능 검색(demo-2)으로 수렴 — 장바구니(pages/blog/auth/cart.js)와 같은 방식.
    // 기존: demo-1/3/4/5 는 299B 빈 스텁(return <></>)이라 검색 버튼을 눌러도 백지였고,
    //       blog_demo_num 6~9(프레임8~11)는 매핑 자체가 없어 undefined 를 반환했다.
    // 블로그 프레임에는 상품 목록 페이지(/blog/items)가 없어 검색이 유일한 상품 탐색 수단이다.
    return <Blog_Demo2 {...common} />
}

// 첫 인자가 데모번호가 아니라 브랜드 정보다 — 어떤 화면을 보여줄지는 경로가 아니라
// 브랜드 유형으로 정한다(/blog 경로를 /shop 으로 통일하면서 바뀐 규칙).
const getDemo = (dns, common) => {
  if (isBlogBrand(dns)) return getBlogDemo(dns?.blog_demo_num, common);
  const num = dns?.shop_demo_num;

  if (num == 1)
    return <SearchDemo1 {...common} />
  else if (num == 2)
    return <SearchDemo2 {...common} />
  else if (num == 3)
    return <SearchDemo3 {...common} />
  // demo-4·demo-9 의 검색 뷰는 443B 빈 스텁(return <></>)이라 헤더 검색 버튼을 눌러도 백지였다.
  // 프레임3(shop:4)이 실사용 중이므로 같은 계열 헤더를 쓰는 demo-5 구현으로 대체한다.
  else if (num == 4)
    return <SearchDemo5 {...common} />
  else if (num == 5)
    return <SearchDemo5 {...common} />
  else if (num == 6)
    return <SearchDemo6 {...common} />
  else if (num == 7)
    return <SearchDemo7 {...common} />
  else if (num == 8)
    return <SearchDemo8 {...common} />
  else if (num == 9)
    return <SearchDemo5 {...common} />
  /*else if (num == 10)
    return <SearchDemo10 {...common} />*/
  else
    return <SearchDemo1 {...common} />
}
const Search = () => {
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();
  return (
    <>
      {getDemo(themeDnsData, {
        data: {
        },
        func: {
          router
        },
      })}
    </>
  )
}
Search.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Search;
