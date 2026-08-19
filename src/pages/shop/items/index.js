import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { isBlogBrand } from "src/utils/blog-shop-route";
import BlogItems from "src/views/blog/search/demo-2";

import { ItemsDemo1 } from "src/views/shop/demo-1";
import { ItemsDemo2 } from "src/views/shop/demo-2";
import { ItemsDemo3 } from "src/views/shop/demo-3";
import { ItemsDemo4 } from "src/views/shop/demo-4";
import { ItemsDemo5 } from "src/views/shop/demo-5";
import { ItemsDemo6 } from "src/views/shop/demo-6";
import { ItemsDemo7 } from "src/views/shop/demo-7";
import { ItemsDemo8 } from "src/views/shop/demo-8";
import { ItemsDemo9 } from "src/views/shop/demo-9";
//import { ItemsDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {

  if (num == 1)
    return <ItemsDemo1 {...common} />
  else if (num == 2)
    return <ItemsDemo2 {...common} />
  else if (num == 3)
    return <ItemsDemo3 {...common} />
  else if (num == 4)
    return <ItemsDemo4 {...common} />
  else if (num == 5)
    return <ItemsDemo5 {...common} />
  else if (num == 6)
    return <ItemsDemo6 {...common} />
  else if (num == 7)
    return <ItemsDemo7 {...common} />
  else if (num == 8)
    return <ItemsDemo8 {...common} />
  else if (num == 9)
    return <ItemsDemo9 {...common} />
  /*else if (num == 10)
    return <ItemsDemo10 {...common} />*/
  // 여기까지 오면 쇼핑몰형이 아니다. 블로그형은 아래 getDemo 에서 먼저 갈라진다.
  else
    return <ItemsDemo1 {...common} />
}

// 블로그형 브랜드의 전체보기.
//
// [증상] 프레임 3·4 에서 검색은 카드가 예쁘게 깔리는데 '전체보기' 만 디자인이 무너졌다.
// [원인] 블로그형은 shop_demo_num 이 0 이라 위 분기에 안 걸려 ItemsDemo1(쇼핑몰 프레임1 목록)로
//        떨어졌다. 그 화면은 쇼핑몰 레이아웃의 헤더·폭을 전제로 짜여 있어 블로그 레이아웃 안에서
//        카드가 제각각으로 흩어진다. 백지는 면했지만 '되긴 되는' 상태였다.
// [수정] 블로그 검색 화면을 목록으로도 쓴다. 같은 카드(elements/blog/common 의 Items)를 쓰므로
//        검색과 전체보기의 디자인이 자동으로 같아진다 — 두 화면을 따로 관리하지 않는다.
const getBlogItems = (common) => <BlogItems 전체보기 {...common} />;
const ItemList = () => {
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();
  return (
    <>
      {/* 브랜드 유형으로 먼저 가른다 — 블로그형은 shop_demo_num 이 0 이라 번호로는 못 고른다. */}
      {isBlogBrand(themeDnsData)
        ? getBlogItems({ data: {}, func: { router } })
        : getDemo(themeDnsData?.shop_demo_num, { data: {}, func: { router } })}
    </>
  )
}
ItemList.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default ItemList;
