import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import { LoginDemo1 } from "src/views/shop/demo-1";
import { LoginDemo2 } from "src/views/shop/demo-2";
import { LoginDemo3 } from "src/views/shop/demo-3";
import { LoginDemo4 } from "src/views/shop/demo-4";
import { LoginDemo5 } from "src/views/shop/demo-5";
import { LoginDemo6 } from "src/views/shop/demo-6";
import { LoginDemo7 } from "src/views/shop/demo-7";
import { LoginDemo8 } from "src/views/shop/demo-8";
import { LoginDemo9 } from "src/views/shop/demo-9";
//import { LoginDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {

  if (num == 1)
    return <LoginDemo1 {...common} />
  else if (num == 2)
    return <LoginDemo2 {...common} />
  else if (num == 3)
    return <LoginDemo3 {...common} />
  else if (num == 4)
    return <LoginDemo4 {...common} />
  else if (num == 5)
    return <LoginDemo5 {...common} />
  else if (num == 6)
    return <LoginDemo6 {...common} />
  else if (num == 7)
    return <LoginDemo7 {...common} />
  else if (num == 8)
    return <LoginDemo8 {...common} />
  else if (num == 9)
    return <LoginDemo9 {...common} />
  /*else if (num == 10)
    return <LoginDemo10 {...common} />*/
}
const Login = () => {
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
export default Login;
