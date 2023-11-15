import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { CartDemo1 } from "src/views/shop/demo-1";
import { CartDemo2 } from "src/views/shop/demo-2";
import { CartDemo3 } from "src/views/shop/demo-3";
import { CartDemo4 } from "src/views/shop/demo-4";
import { CartDemo5 } from "src/views/shop/demo-5";
import { CartDemo6 } from "src/views/shop/demo-6";
import { CartDemo7 } from "src/views/shop/demo-7";

const getDemo = (num, common) => {

  if (num == 1)
    return <CartDemo1 {...common} />
  else if (num == 2)
    return <CartDemo2 {...common} />
  else if (num == 3)
    return <CartDemo3 {...common} />
  else if (num == 4)
    return <CartDemo4 {...common} />
  else if (num == 5)
    return <CartDemo5 {...common} />
  else if (num == 6)
    return <CartDemo6 {...common} />
  else if (num == 7)
    return <CartDemo7 {...common} />
}

const Cart = () => {
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
Cart.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Cart;
