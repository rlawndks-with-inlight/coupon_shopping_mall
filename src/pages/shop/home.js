import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import { HomeDemo1 } from "src/views/shop/demo-1";
import { HomeDemo2 } from "src/views/shop/demo-2";
import { HomeDemo3 } from "src/views/shop/demo-3";
import { HomeDemo4 } from "src/views/shop/demo-4";
import { HomeDemo5 } from "src/views/shop/demo-5";
import { HomeDemo6 } from "src/views/shop/demo-6";
import { HomeDemo7 } from "src/views/shop/demo-7";
import { HomeDemo8 } from "src/views/shop/demo-8";
import { HomeDemo9 } from "src/views/shop/demo-9";
import { isBlogBrand } from "src/utils/blog-shop-route";
import Blog_Demo1 from "src/views/blog/home/demo-1";
import Blog_Demo2 from "src/views/blog/home/demo-2";
import Blog_Demo3 from "src/views/blog/home/demo-3";
import Blog_Demo4 from "src/views/blog/home/demo-4";
import Blog_Demo5 from "src/views/blog/home/demo-5";
import Blog_Demo6 from "src/views/blog/home/demo-6";
import Blog_Demo7 from "src/views/blog/home/demo-7";
import Blog_Demo8 from "src/views/blog/home/demo-8";
import Blog_Demo9 from "src/views/blog/home/demo-9";
//import { HomeDemo10 } from "src/views/shop/demo-10";

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
    else if (num == 6)
        return <Blog_Demo6 {...common} />
    else if (num == 7)
        return <Blog_Demo7 {...common} />
    else if (num == 8)
        return <Blog_Demo8 {...common} />
    else if (num == 9)
        return <Blog_Demo9 {...common} />
}

// 첫 인자가 데모번호가 아니라 브랜드 정보다 — 어떤 화면을 보여줄지는 경로가 아니라
// 브랜드 유형으로 정한다(/blog 경로를 /shop 으로 통일하면서 바뀐 규칙).
const getDemo = (dns, common) => {
  if (isBlogBrand(dns)) return getBlogDemo(dns?.blog_demo_num, common);
  const num = dns?.shop_demo_num;
  if (num == 1)
    return <HomeDemo1 {...common} />
  else if (num == 2)
    return <HomeDemo2 {...common} />
  else if (num == 3)
    return <HomeDemo3 {...common} />
  else if (num == 4)
    return <HomeDemo4 {...common} />
  else if (num == 5)
    return <HomeDemo5 {...common} />
  else if (num == 6)
    return <HomeDemo6 {...common} />
  else if (num == 7)
    return <HomeDemo7 {...common} />
  else if (num == 8)
    return <HomeDemo8 {...common} />
  else if (num == 9)
    return <HomeDemo9 {...common} />
  /*else if (num == 10)
    return <HomeDemo10 {...common} />*/
}
const Home = () => {

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
Home.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;

export default Home;
