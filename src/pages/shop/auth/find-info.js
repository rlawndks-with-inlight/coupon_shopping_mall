import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { FindInfoDemo1 } from "src/views/shop/demo-1";
import { FindInfoDemo2 } from "src/views/shop/demo-2";
import { FindInfoDemo3 } from "src/views/shop/demo-3";
import { FindInfoDemo4 } from "src/views/shop/demo-4";
import { FindInfoDemo5 } from "src/views/shop/demo-5";
import { FindInfoDemo6 } from "src/views/shop/demo-6";
import { FindInfoDemo7 } from "src/views/shop/demo-7";
import { FindInfoDemo8 } from "src/views/shop/demo-8";
import { FindInfoDemo9 } from "src/views/shop/demo-9";
import { isBlogBrand } from "src/utils/blog-shop-route";
import Blog_Demo1 from "src/views/blog/auth/find-info/demo-1";
import Blog_Demo2 from "src/views/blog/auth/find-info/demo-2";
import Blog_Demo3 from "src/views/blog/auth/find-info/demo-3";
import Blog_Demo4 from "src/views/blog/auth/find-info/demo-4";
import Blog_Demo5 from "src/views/blog/auth/find-info/demo-5";
//import { FindInfoDemo10 } from "src/views/shop/demo-10";

// 블로그형 브랜드용 화면. URL 을 /shop 으로 통일하면서 blog 페이지의 뷰 선택을 여기로 옮겼다.
const getBlogDemo = (num, common) => {

    if (num == 1)
        return <Blog_Demo1 {...common} />
    else if (num == 2)
        return <Blog_Demo2 {...common} />
    else if (num == 3)
        return <Blog_Demo3 {...common} />
    else if (num == 4)
        return <Blog_Demo4 {...common} />
    else if (num == 5)
        return <Blog_Demo5 {...common} />
    // blog_demo_num 6~9(프레임8~11)는 전용 화면이 없다. 폴백이 없으면 undefined 를 반환해
    // 헤더/푸터만 남고 본문이 백지가 되므로, 기능이 갖춰진 demo-2 로 떨어뜨린다.
    else
        return <Blog_Demo2 {...common} />
}

// 첫 인자가 데모번호가 아니라 브랜드 정보다 — 어떤 화면을 보여줄지는 경로가 아니라
// 브랜드 유형으로 정한다(/blog 경로를 /shop 으로 통일하면서 바뀐 규칙).
const getDemo = (dns, common) => {
  if (isBlogBrand(dns)) return getBlogDemo(dns?.blog_demo_num, common);
  const num = dns?.shop_demo_num;

  if (num == 1)
    return <FindInfoDemo1 {...common} />
  else if (num == 2)
    return <FindInfoDemo2 {...common} />
  else if (num == 3)
    return <FindInfoDemo3 {...common} />
  else if (num == 4)
    return <FindInfoDemo4 {...common} />
  else if (num == 5)
    return <FindInfoDemo5 {...common} />
  else if (num == 6)
    return <FindInfoDemo6 {...common} />
  else if (num == 7)
    return <FindInfoDemo7 {...common} />
  else if (num == 8)
    return <FindInfoDemo8 {...common} />
  else if (num == 9)
    return <FindInfoDemo9 {...common} />
  /*else if (num == 10)
    return <FindInfoDemo10 {...common} />*/
}
const FindInfo = () => {
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();

  return (
    <>
      {themeDnsData?.is_closure == 1 ?
        <>
          {getDemo(themeDnsData, {
            data: {
            },
            func: {
              router
            },
          })}
        </>
        :
        <>
          <ShopLayout>
            {getDemo(themeDnsData, {
              data: {
              },
              func: {
                router
              },
            })}
          </ShopLayout>
        </>}
    </>
  )
}
export default FindInfo;
