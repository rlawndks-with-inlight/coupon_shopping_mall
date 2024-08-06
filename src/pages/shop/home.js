import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import { HomeDemo1 } from "src/views/shop/demo-1";
import { HomeDemo2 } from "src/views/shop/demo-2";
import { HomeDemo3 } from "src/views/shop/demo-3";
import { HomeDemo4 } from "src/views/shop/demo-4";
import { HomeDemo5 } from "src/views/shop/demo-5";
import { HomeDemo6 } from "src/views/shop/demo-6";
import { HomeDemo7 } from "src/views/shop/demo-7";
import { HomeDemo8 } from "src/views/shop/demo-8";
//import { HomeDemo9 } from "src/views/shop/demo-9";
//import { HomeDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {
  if (num == 1)
    return <HomeDemo1 {...common} />
  else if (num == 2)
    return <HomeDemo2 {...common} />
  else if (num == 3)
    return <HomeDemo3 {...common} />
  else if (num == 4)
    return <HomeDemo4 {...common} />
  else if (num == 5)
    return <HomeDemo5 {...common} />
  else if (num == 6)
    return <HomeDemo6 {...common} />
  else if (num == 7)
    return <HomeDemo7 {...common} />
  else if (num == 8)
    return <HomeDemo8 {...common} />
  /*else if (num == 9)
    return <HomeDemo9 {...common} />
  else if (num == 10)
    return <HomeDemo10 {...common} />*/
}
const Home = () => {

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
Home.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;

export default Home;
