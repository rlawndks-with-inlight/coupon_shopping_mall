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
//import { ItemsDemo9 } from "src/views/shop/demo-9";
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
  /*else if (num == 9)
    return <ItemsDemo9 {...common} />
  else if (num == 10)
    return <ItemsDemo10 {...common} />*/
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
