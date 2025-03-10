
import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import { PointDemo1 } from "src/views/shop/demo-1";
import { PointDemo2 } from "src/views/shop/demo-2";
import { PointDemo3 } from "src/views/shop/demo-3";
import { PointDemo4 } from "src/views/shop/demo-4";
import { PointDemo5 } from "src/views/shop/demo-5";
import { PointDemo6 } from "src/views/shop/demo-6";
import { PointDemo7 } from "src/views/shop/demo-7";
import { PointDemo8 } from "src/views/shop/demo-8";
import { PointDemo9 } from "src/views/shop/demo-9";
//import { PointDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {

  if (num == 1)
    return <PointDemo1 {...common} />
  else if (num == 2)
    return <PointDemo2 {...common} />
  else if (num == 3)
    return <PointDemo3 {...common} />
  else if (num == 4)
    return <PointDemo4 {...common} />
  else if (num == 5)
    return <PointDemo5 {...common} />
  else if (num == 6)
    return <PointDemo6 {...common} />
  else if (num == 7)
    return <PointDemo7 {...common} />
  else if (num == 8)
    return <PointDemo8 {...common} />
  else if (num == 9)
    return <PointDemo9 {...common} />
  /*else if (num == 10)
    return <PointDemo10 {...common} />*/
}
const Point = () => {
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
Point.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Point;
