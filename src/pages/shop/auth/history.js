
import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import { HistoryDemo1 } from "src/views/shop/demo-1";
import { HistoryDemo2 } from "src/views/shop/demo-2";
import { HistoryDemo3 } from "src/views/shop/demo-3";
import { HistoryDemo4 } from "src/views/shop/demo-4";
import { HistoryDemo5 } from "src/views/shop/demo-5";
import { HistoryDemo6 } from "src/views/shop/demo-6";
import { HistoryDemo7 } from "src/views/shop/demo-7";
import { HistoryDemo8 } from "src/views/shop/demo-8";
import { HistoryDemo9 } from "src/views/shop/demo-9";
//import { HistoryDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {

  if (num == 1)
    return <HistoryDemo1 {...common} />
  else if (num == 2)
    return <HistoryDemo2 {...common} />
  else if (num == 3)
    return <HistoryDemo3 {...common} />
  else if (num == 4)
    return <HistoryDemo4 {...common} />
  else if (num == 5)
    return <HistoryDemo5 {...common} />
  else if (num == 6)
    return <HistoryDemo6 {...common} />
  else if (num == 7)
    return <HistoryDemo7 {...common} />
  else if (num == 8)
    return <HistoryDemo8 {...common} />
  else if (num == 9)
    return <HistoryDemo9 {...common} />
  /*else if (num == 10)
    return <HistoryDemo10 {...common} />*/
}
const History = () => {
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
History.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default History;
