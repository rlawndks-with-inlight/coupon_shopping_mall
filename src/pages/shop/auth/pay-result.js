import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { PayResultDemo1 } from "src/views/shop/demo-1";
import { PayResultDemo2 } from "src/views/shop/demo-2";
import { PayResultDemo3 } from "src/views/shop/demo-3";
import { PayResultDemo4 } from "src/views/shop/demo-4";
import { PayResultDemo5 } from "src/views/shop/demo-5";
import { PayResultDemo6 } from "src/views/shop/demo-6";
import { PayResultDemo7 } from "src/views/shop/demo-7";

const getDemo = (num, common) => {
  if (num == 1)
    return <PayResultDemo1 {...common} />
  else if (num == 2)
    return <PayResultDemo2 {...common} />
  else if (num == 3)
    return <PayResultDemo3 {...common} />
  else if (num == 4)
    return <PayResultDemo4 {...common} />
  else if (num == 5)
    return <PayResultDemo5 {...common} />
  else if (num == 6)
    return <PayResultDemo6 {...common} />
  else if (num == 7)
    return <PayResultDemo7 {...common} />
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
