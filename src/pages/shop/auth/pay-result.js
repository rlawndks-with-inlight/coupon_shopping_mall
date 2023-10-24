import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import Demo1 from "src/views/shop/auth/pay-result/demo-1";
import Demo2 from "src/views/shop/auth/pay-result/demo-2";
import Demo3 from "src/views/shop/auth/pay-result/demo-3";

const getDemo = (num, common) => {
  if (num == 1)
    return <Demo1 {...common} />
  else if (num == 2)
    return <Demo2 {...common} />
  else if (num == 3)
    return <Demo3 {...common} />
}
const PayResult = () => {
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
PayResult.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default PayResult;
