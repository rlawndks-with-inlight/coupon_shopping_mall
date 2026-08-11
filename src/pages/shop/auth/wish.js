
import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import WishPanel from "src/components/elements/shop/WishPanel";
import { WishDemo1 } from "src/views/shop/demo-1";
import { WishDemo2 } from "src/views/shop/demo-2";
import { WishDemo3 } from "src/views/shop/demo-3";
import { WishDemo4 } from "src/views/shop/demo-4";
import { WishDemo5 } from "src/views/shop/demo-5";
import { WishDemo6 } from "src/views/shop/demo-6";
import { WishDemo7 } from "src/views/shop/demo-7";
import { WishDemo8 } from "src/views/shop/demo-8";
import { WishDemo9 } from "src/views/shop/demo-9";
//import { WishDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {
  if (num == 1)
    return <WishDemo1 {...common} />
  else if (num == 2)
    return <WishDemo2 {...common} />
  else if (num == 3)
    return <WishDemo3 {...common} />
  else if (num == 4)
    return <WishDemo4 {...common} />
  else if (num == 5)
    return <WishDemo5 {...common} />
  else if (num == 6)
    return <WishDemo6 {...common} />
  else if (num == 7)
    return <WishDemo7 {...common} />
  else if (num == 8)
    return <WishDemo8 {...common} />
  else if (num == 9)
    return <WishDemo9 {...common} />
  /*else if (num == 10)
    return <WishDemo10 {...common} />*/
  // 전용 화면이 없는 프레임(블로그형 포함)은 공용 패널로 그린다.
  // 예전 폴백은 WishDemo1 이었는데, 그 화면은 쇼핑몰 카드 디스패처를 쓰므로
  // 블로그형 브랜드에서는 자기 프레임과 생김새가 다른 쇼핑몰 카드가 나왔다.
  else
    return <WishPanel router={common?.func?.router} />
}
const Wish = () => {
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
Wish.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Wish;
