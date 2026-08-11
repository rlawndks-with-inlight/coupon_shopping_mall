import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

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
  // 블로그형 브랜드는 shop_demo_num 이 0 이라 위 어느 조건에도 안 걸려 undefined 를 반환했고,
  // 헤더·푸터만 남은 백지가 됐다. blog demo 1·2 홈의 '속성그룹' 섹션 View More 가 이리로 온다
  // (통일 전엔 /blog/items 로 가서 404 였다 — 백지보다 낫지도 않았다).
  // 블로그 전용 상품목록 뷰는 없으므로 기본 목록으로 떨어뜨린다. 최소한 상품은 볼 수 있다.
  else
    return <ItemsDemo1 {...common} />
}
const ItemList = () => {
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();
  return (
    <>
      {getDemo(themeDnsData?.shop_demo_num, {
        data: {
        },
        func: {
          router
        },
      })}
    </>
  )
}
ItemList.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default ItemList;
