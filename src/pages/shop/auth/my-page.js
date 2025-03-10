import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { MyPageDemo1 } from "src/views/shop/demo-1";
import { MyPageDemo2 } from "src/views/shop/demo-2";
import { MyPageDemo3 } from "src/views/shop/demo-3";
import { MyPageDemo4 } from "src/views/shop/demo-4";
import { MyPageDemo5 } from "src/views/shop/demo-5";
import { MyPageDemo6 } from "src/views/shop/demo-6";
import { MyPageDemo7 } from "src/views/shop/demo-7";
import { MyPageDemo8 } from "src/views/shop/demo-8";
import { MyPageDemo9 } from "src/views/shop/demo-9";
//import { MyPageDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {
  if (num == 1)
    return <MyPageDemo1 {...common} />
  else if (num == 2)
    return <MyPageDemo2 {...common} />
  else if (num == 3)
    return <MyPageDemo3 {...common} />
  else if (num == 4)
    return <MyPageDemo4 {...common} />
  else if (num == 5)
    return <MyPageDemo5 {...common} />
  else if (num == 6)
    return <MyPageDemo6 {...common} />
  else if (num == 7)
    return <MyPageDemo7 {...common} />
  else if (num == 8)
    return <MyPageDemo8 {...common} />
  else if (num == 9)
    return <MyPageDemo9 {...common} />
  /*else if (num == 10)
    return <MyPageDemo10 {...common} />*/
}
const MyPage = () => {
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
MyPage.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default MyPage;
