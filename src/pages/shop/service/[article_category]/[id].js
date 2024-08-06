import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import { ArticleDemo1 } from "src/views/shop/demo-1";
import { ArticleDemo2 } from "src/views/shop/demo-2";
import { ArticleDemo3 } from "src/views/shop/demo-3";
import { ArticleDemo4 } from "src/views/shop/demo-4";
import { ArticleDemo5 } from "src/views/shop/demo-5";
import { ArticleDemo6 } from "src/views/shop/demo-6";
import { ArticleDemo7 } from "src/views/shop/demo-7";
import { ArticleDemo8 } from "src/views/shop/demo-8";
//import { ArticleDemo9 } from "src/views/shop/demo-9";
//import { ArticleDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {

  if (num == 1)
    return <ArticleDemo1 {...common} />
  else if (num == 2)
    return <ArticleDemo2 {...common} />
  else if (num == 3)
    return <ArticleDemo3 {...common} />
  else if (num == 4)
    return <ArticleDemo4 {...common} />
  else if (num == 5)
    return <ArticleDemo5 {...common} />
  else if (num == 6)
    return <ArticleDemo6 {...common} />
  else if (num == 7)
    return <ArticleDemo7 {...common} />
  else if (num == 8)
    return <ArticleDemo8 {...common} />
  /*else if (num == 9)
    return <ArticleDemo9 {...common} />
  else if (num == 10)
    return <ArticleDemo10 {...common} />*/
}
const ArticleDetail = () => {
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
ArticleDetail.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default ArticleDetail;
