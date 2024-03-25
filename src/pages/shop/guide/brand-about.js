import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { BrandAboutDemo4 } from "src/views/shop/demo-4";

const getDemo = (num, common) => {

  if (num == 4)
    return <BrandAboutDemo4 {...common} />
}

const BrandAbout = () => {
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
BrandAbout.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default BrandAbout;
