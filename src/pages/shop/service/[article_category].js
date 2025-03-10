import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import { ArticlesDemo1 } from "src/views/shop/demo-1";
import { ArticlesDemo2 } from "src/views/shop/demo-2";
import { ArticlesDemo3 } from "src/views/shop/demo-3";
import { ArticlesDemo4 } from "src/views/shop/demo-4";
import { ArticlesDemo5 } from "src/views/shop/demo-5";
import { ArticlesDemo6 } from "src/views/shop/demo-6";
import { ArticlesDemo7 } from "src/views/shop/demo-7";
import { ArticlesDemo8 } from "src/views/shop/demo-8";
import { ArticlesDemo9 } from "src/views/shop/demo-9";
//import { ArticlesDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {

  if (num == 1)
    return <ArticlesDemo1 {...common} />
  else if (num == 2)
    return <ArticlesDemo2 {...common} />
  else if (num == 3)
    return <ArticlesDemo3 {...common} />
  else if (num == 4)
    return <ArticlesDemo4 {...common} />
  else if (num == 5)
    return <ArticlesDemo5 {...common} />
  else if (num == 6)
    return <ArticlesDemo6 {...common} />
  else if (num == 7)
    return <ArticlesDemo7 {...common} />
  else if (num == 8)
    return <ArticlesDemo8 {...common} />
  else if (num == 9)
    return <ArticlesDemo9 {...common} />
  /*else if (num == 10)
    return <ArticlesDemo10 {...common} />*/
}
const ArticleList = () => {
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
ArticleList.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default ArticleList;
