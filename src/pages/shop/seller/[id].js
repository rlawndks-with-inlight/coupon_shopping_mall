import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import Demo1 from "src/views/shop/seller/id/demo-1";
import Demo2 from "src/views/shop/seller/id/demo-2";
import Demo3 from "src/views/shop/seller/id/demo-3";
import Demo4 from "src/views/shop/seller/id/demo-4";
import Demo5 from "src/views/shop/seller/id/demo-5";
import Demo6 from "src/views/shop/seller/id/demo-6";
import Demo7 from "src/views/shop/seller/id/demo-7";

const getDemo = (num, common) => {

  if (num == 1)
    return <Demo1 {...common} />
  else if (num == 2)
    return <Demo2 {...common} />
  else if (num == 3)
    return <Demo3 {...common} />
  else if (num == 4)
    return <Demo4 {...common} />
  else if (num == 5)
    return <Demo5 {...common} />
  else if (num == 6)
    return <Demo6 {...common} />
  else if (num == 7)
    return <Demo7 {...common} />
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