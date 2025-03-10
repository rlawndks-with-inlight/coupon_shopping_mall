import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { FindInfoDemo1 } from "src/views/shop/demo-1";
import { FindInfoDemo2 } from "src/views/shop/demo-2";
import { FindInfoDemo3 } from "src/views/shop/demo-3";
import { FindInfoDemo4 } from "src/views/shop/demo-4";
import { FindInfoDemo5 } from "src/views/shop/demo-5";
import { FindInfoDemo6 } from "src/views/shop/demo-6";
import { FindInfoDemo7 } from "src/views/shop/demo-7";
import { FindInfoDemo8 } from "src/views/shop/demo-8";
import { FindInfoDemo9 } from "src/views/shop/demo-9";
//import { FindInfoDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {

  if (num == 1)
    return <FindInfoDemo1 {...common} />
  else if (num == 2)
    return <FindInfoDemo2 {...common} />
  else if (num == 3)
    return <FindInfoDemo3 {...common} />
  else if (num == 4)
    return <FindInfoDemo4 {...common} />
  else if (num == 5)
    return <FindInfoDemo5 {...common} />
  else if (num == 6)
    return <FindInfoDemo6 {...common} />
  else if (num == 7)
    return <FindInfoDemo7 {...common} />
  else if (num == 8)
    return <FindInfoDemo8 {...common} />
  else if (num == 9)
    return <FindInfoDemo9 {...common} />
  /*else if (num == 10)
    return <FindInfoDemo10 {...common} />*/
}
const FindInfo = () => {
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();

  return (
    <>
      {themeDnsData?.is_closure == 1 ?
        <>
          {getDemo(themeDnsData?.shop_demo_num, {
            data: {
            },
            func: {
              router
            },
          })}
        </>
        :
        <>
          <ShopLayout>
            {getDemo(themeDnsData?.shop_demo_num, {
              data: {
              },
              func: {
                router
              },
            })}
          </ShopLayout>
        </>}
    </>
  )
}
export default FindInfo;
