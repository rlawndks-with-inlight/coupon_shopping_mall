import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { ItemDemo1 } from "src/views/shop/demo-1";
import { ItemDemo2 } from "src/views/shop/demo-2";
import { ItemDemo3 } from "src/views/shop/demo-3";
import { ItemDemo4 } from "src/views/shop/demo-4";
import { ItemDemo5 } from "src/views/shop/demo-5";
import { ItemDemo6 } from "src/views/shop/demo-6";
import { ItemDemo7 } from "src/views/shop/demo-7";
import { ItemDemo8 } from "src/views/shop/demo-8";
import { ItemDemo9 } from "src/views/shop/demo-9";
//import { ItemDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {

  if (num == 1)
    return <ItemDemo1 {...common} />
  else if (num == 2)
    return <ItemDemo2 {...common} />
  else if (num == 3)
    return <ItemDemo3 {...common} />
  else if (num == 4)
    return <ItemDemo4 {...common} />
  else if (num == 5)
    return <ItemDemo5 {...common} />
  else if (num == 6)
    return <ItemDemo6 {...common} />
  else if (num == 7)
    return <ItemDemo7 {...common} />
  else if (num == 8)
    return <ItemDemo8 {...common} />
  else if (num == 9)
    return <ItemDemo9 {...common} />
  /*else if (num == 10)
    return <ItemDemo10 {...common} />*/
}
const Item = () => {
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
Item.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Item;
