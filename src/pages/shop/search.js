import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import { SearchDemo1 } from "src/views/shop/demo-1";
import { SearchDemo2 } from "src/views/shop/demo-2";
import { SearchDemo3 } from "src/views/shop/demo-3";
import { SearchDemo4 } from "src/views/shop/demo-4";
import { SearchDemo5 } from "src/views/shop/demo-5";
import { SearchDemo6 } from "src/views/shop/demo-6";
import { SearchDemo7 } from "src/views/shop/demo-7";
import { SearchDemo8 } from "src/views/shop/demo-8";
//import { SearchDemo9 } from "src/views/shop/demo-9";
//import { SearchDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {

  if (num == 1)
    return <SearchDemo1 {...common} />
  else if (num == 2)
    return <SearchDemo2 {...common} />
  else if (num == 3)
    return <SearchDemo3 {...common} />
  else if (num == 4)
    return <SearchDemo4 {...common} />
  else if (num == 5)
    return <SearchDemo5 {...common} />
  else if (num == 6)
    return <SearchDemo6 {...common} />
  else if (num == 7)
    return <SearchDemo7 {...common} />
  else if (num == 8)
    return <SearchDemo8 {...common} />
  /*else if (num == 9)
    return <SearchDemo9 {...common} />
  else if (num == 10)
    return <SearchDemo10 {...common} />*/
}
const Search = () => {
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
Search.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Search;
