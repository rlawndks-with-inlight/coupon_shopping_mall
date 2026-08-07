import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { CartDemo1 } from "src/views/shop/demo-1";
import { CartDemo2 } from "src/views/shop/demo-2";
import { CartDemo3 } from "src/views/shop/demo-3";
import { CartDemo4 } from "src/views/shop/demo-4";
import { CartDemo5 } from "src/views/shop/demo-5";
import { CartDemo6 } from "src/views/shop/demo-6";
import { CartDemo7 } from "src/views/shop/demo-7";
import { CartDemo8 } from "src/views/shop/demo-8";
import { CartDemo9 } from "src/views/shop/demo-9";
import { isBlogBrand } from "src/utils/blog-shop-route";
import Blog_Demo1 from "src/views/blog/auth/cart/demo-1";
import Blog_Demo2 from "src/views/blog/auth/cart/demo-2";
import Blog_Demo3 from "src/views/blog/auth/cart/demo-3";
import Blog_Demo4 from "src/views/blog/auth/cart/demo-4";
import Blog_Demo5 from "src/views/blog/auth/cart/demo-5";
//import { CartDemo10 } from "src/views/shop/demo-10";

// 블로그형 브랜드용 화면. URL 을 /shop 으로 통일하면서 blog 페이지의 뷰 선택을 여기로 옮겼다.
const getBlogDemo = (num, common) => {
    // 모든 blog 프레임 카트를 기능 카트(demo-2)로 수렴 — '주문하기'는 공용 주문서로 이동.
    // (기존: blog 1/3/4/5는 목업, 6~9는 카트 미구현)
    return <Blog_Demo2 {...common} />
}

// 첫 인자가 데모번호가 아니라 브랜드 정보다 — 어떤 화면을 보여줄지는 경로가 아니라
// 브랜드 유형으로 정한다(/blog 경로를 /shop 으로 통일하면서 바뀐 규칙).
const getDemo = (dns, common) => {
  if (isBlogBrand(dns)) return getBlogDemo(dns?.blog_demo_num, common);
  const num = dns?.shop_demo_num;

  // 예전 주석에 'demo-2·demo-3 카트는 빈 스텁'이라 적고 demo-4 카트로 돌려놨었는데 사실이 아니었다.
  // 두 파일 다 900줄이 넘는 실제 구현이고 '주문하기'도 공용 주문서(/shop/auth/order)로 간다.
  // 그대로 두면 프레임2 고객이 자기 프레임 톤(max-width 1200 미니멀)과 다국어 처리를 동시에 잃는다
  // — demo-4 카트는 폭도 다르고 STEPS·'주문하기'·'비회원주문 비밀번호'가 한국어 하드코딩이다.
  if (num == 1)
    return <CartDemo1 {...common} />
  else if (num == 2)
    return <CartDemo2 {...common} />
  else if (num == 3)
    return <CartDemo3 {...common} />
  else if (num == 4)
    return <CartDemo4 {...common} />
  else if (num == 5)
    return <CartDemo5 {...common} />
  else if (num == 6)
    return <CartDemo6 {...common} />
  else if (num == 7)
    return <CartDemo7 {...common} />
  else if (num == 8)
    return <CartDemo8 {...common} />
  else if (num == 9)
    return <CartDemo9 {...common} />
  /*else if (num == 10)
    return <CartDemo10 {...common} />*/
}

const Cart = () => {
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
Cart.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Cart;
