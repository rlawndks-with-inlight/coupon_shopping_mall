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
import { SearchDemo9 } from "src/views/shop/demo-9";
//import { SearchDemo10 } from "src/views/shop/demo-10";

const getDemo = (num, common) => {

  if (num == 1)
    return <SearchDemo1 {...common} />
  else if (num == 2)
    return <SearchDemo2 {...common} />
  else if (num == 3)
    return <SearchDemo3 {...common} />
  // demo-4·demo-9 의 검색 뷰는 443B 빈 스텁(return <></>)이라 헤더 검색 버튼을 눌러도 백지였다.
  // 프레임3(shop:4)이 실사용 중이므로 같은 계열 헤더를 쓰는 demo-5 구현으로 대체한다.
  else if (num == 4)
    return <SearchDemo5 {...common} />
  else if (num == 5)
    return <SearchDemo5 {...common} />
  else if (num == 6)
    return <SearchDemo6 {...common} />
  else if (num == 7)
    return <SearchDemo7 {...common} />
  else if (num == 8)
    return <SearchDemo8 {...common} />
  else if (num == 9)
    return <SearchDemo5 {...common} />
  /*else if (num == 10)
    return <SearchDemo10 {...common} />*/
  else
    return <SearchDemo1 {...common} />
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
