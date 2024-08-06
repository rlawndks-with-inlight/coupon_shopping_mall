
import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import { WishDemo1 } from "src/views/shop/demo-1";
import { WishDemo2 } from "src/views/shop/demo-2";
import { WishDemo3 } from "src/views/shop/demo-3";
import { WishDemo4 } from "src/views/shop/demo-4";
import { WishDemo5 } from "src/views/shop/demo-5";
import { WishDemo6 } from "src/views/shop/demo-6";
import { WishDemo7 } from "src/views/shop/demo-7";
import { WishDemo8 } from "src/views/shop/demo-8";
//import { WishDemo9 } from "src/views/shop/demo-9";
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
  /*else if (num == 9)
    return <WishDemo9 {...common} />
  else if (num == 10)
    return <WishDemo10 {...common} />*/
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
