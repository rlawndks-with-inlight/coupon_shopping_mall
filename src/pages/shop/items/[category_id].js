import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import Demo1 from "src/views/shop/items/category_id/demo-1";
import Demo2 from "src/views/shop/items/category_id/demo-2";

const getDemo = (num, common) => {

  if (num == 1)
    return <Demo1 {...common} />
  else if (num == 2)
    return <Demo2 {...common} />
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
