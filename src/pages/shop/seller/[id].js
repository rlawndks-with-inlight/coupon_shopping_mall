import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { SellerDemo1 } from "src/views/shop/demo-1";
import { SellerDemo2 } from "src/views/shop/demo-2";
import { SellerDemo3 } from "src/views/shop/demo-3";
import { SellerDemo4 } from "src/views/shop/demo-4";
import { SellerDemo5 } from "src/views/shop/demo-5";
import { SellerDemo6 } from "src/views/shop/demo-6";
import { SellerDemo7 } from "src/views/shop/demo-7";
import { SellerDemo8 } from "src/views/shop/demo-8";
//import { SellerDemo9 } from "src/views/shop/demo-9";
//import { SellerDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {

  if (num == 1)
    return <SellerDemo1 {...common} />
  else if (num == 2)
    return <SellerDemo2 {...common} />
  else if (num == 3)
    return <SellerDemo3 {...common} />
  else if (num == 4)
    return <SellerDemo4 {...common} />
  else if (num == 5)
    return <SellerDemo5 {...common} />
  else if (num == 6)
    return <SellerDemo6 {...common} />
  else if (num == 7)
    return <SellerDemo7 {...common} />
  else if (num == 8)
    return <SellerDemo8 {...common} />
  /*else if (num == 9)
    return <SellerDemo9 {...common} />
  else if (num == 10)
    return <SellerDemo10 {...common} />*/
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
