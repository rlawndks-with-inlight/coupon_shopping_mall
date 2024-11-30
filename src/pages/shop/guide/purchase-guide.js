import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { PurchaseGuideDemo4 } from "src/views/shop/demo-4";

const getDemo = (num, common) => {

  //if (num == 4)
  //return <PurchaseGuideDemo4 {...common} />
}

const PurchaseGuide = () => {
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
PurchaseGuide.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default PurchaseGuide;
