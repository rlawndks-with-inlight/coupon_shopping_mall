import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import Demo1 from "src/views/shop/home/demo-1";
import Demo2 from "src/views/shop/home/demo-2";
import Demo3 from "src/views/shop/home/demo-3";

const getDemo = (num, common) => {
  if (num == 1)
    return <Demo1 {...common} />
  else if (num == 2)
    return <Demo2 {...common} />
  else if (num == 3)
    return <Demo1 {...common} />
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
