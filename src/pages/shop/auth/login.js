import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import { LoginDemo1 } from "src/views/shop/demo-1";
import { LoginDemo2 } from "src/views/shop/demo-2";
import { LoginDemo3 } from "src/views/shop/demo-3";
import { LoginDemo4 } from "src/views/shop/demo-4";
import { LoginDemo5 } from "src/views/shop/demo-5";
import { LoginDemo6 } from "src/views/shop/demo-6";
import { LoginDemo7 } from "src/views/shop/demo-7";
import { LoginDemo8 } from "src/views/shop/demo-8";
import { LoginDemo9 } from "src/views/shop/demo-9";
import { isBlogBrand } from "src/utils/blog-shop-route";
import Blog_Demo1 from "src/views/blog/auth/login/demo-1";
import Blog_Demo2 from "src/views/blog/auth/login/demo-2";
import Blog_Demo3 from "src/views/blog/auth/login/demo-3";
import Blog_Demo4 from "src/views/blog/auth/login/demo-4";
import Blog_Demo5 from "src/views/blog/auth/login/demo-5";
//import { LoginDemo10 } from "src/views/shop/demo-10";

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
    return <LoginDemo1 {...common} />
  else if (num == 2)
    return <LoginDemo2 {...common} />
  else if (num == 3)
    return <LoginDemo3 {...common} />
  else if (num == 4)
    return <LoginDemo4 {...common} />
  else if (num == 5)
    return <LoginDemo5 {...common} />
  else if (num == 6)
    return <LoginDemo6 {...common} />
  else if (num == 7)
    return <LoginDemo7 {...common} />
  else if (num == 8)
    return <LoginDemo8 {...common} />
  else if (num == 9)
    return <LoginDemo9 {...common} />
  // 폐쇄몰(is_closure=1) 블로그 전용 브랜드는 ShopLayout 이 여기로 리다이렉트하는데
  // shop_demo_num=0 이라 위 분기에 안 걸려 로그인 화면조차 백지가 됐다(= 사이트 진입 불가).
  else
    return <LoginDemo1 {...common} />
  /*else if (num == 10)
    return <LoginDemo10 {...common} />*/
}
const Login = () => {
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
export default Login;
