import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import { SignUpDemo1 } from "src/views/shop/demo-1";
import { SignUpDemo2 } from "src/views/shop/demo-2";
import { SignUpDemo3 } from "src/views/shop/demo-3";
import { SignUpDemo4 } from "src/views/shop/demo-4";
import { SignUpDemo5 } from "src/views/shop/demo-5";
import { SignUpDemo6 } from "src/views/shop/demo-6";
import { SignUpDemo7 } from "src/views/shop/demo-7";
import { SignUpDemo8 } from "src/views/shop/demo-8";
import { SignUpDemo9 } from "src/views/shop/demo-9";
//import { SignUpDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {

  if (num == 1)
    return <SignUpDemo1 {...common} />
  else if (num == 2)
    return <SignUpDemo2 {...common} />
  else if (num == 3)
    return <SignUpDemo3 {...common} />
  else if (num == 4)
    return <SignUpDemo4 {...common} />
  else if (num == 5)
    return <SignUpDemo5 {...common} />
  else if (num == 6)
    return <SignUpDemo6 {...common} />
  else if (num == 7)
    return <SignUpDemo7 {...common} />
  else if (num == 8)
    return <SignUpDemo8 {...common} />
  else if (num == 9)
    return <SignUpDemo9 {...common} />
  /*else if (num == 10)
    return <SignUpDemo10 {...common} />*/
}
const SignUp = () => {
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
export default SignUp;
