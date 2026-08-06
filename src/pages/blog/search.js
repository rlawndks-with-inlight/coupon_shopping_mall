import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import Demo1 from "src/views/blog/search/demo-1";
import { useSettingsContext } from "src/components/settings";
import Demo2 from "src/views/blog/search/demo-2";
import Demo3 from "src/views/blog/search/demo-3";
import Demo4 from "src/views/blog/search/demo-4";
import Demo5 from "src/views/blog/search/demo-5";

const getDemo = (num, common) => {
    // 모든 blog 프레임 검색을 기능 검색(demo-2)으로 수렴 — 장바구니(pages/blog/auth/cart.js)와 같은 방식.
    // 기존: demo-1/3/4/5 는 299B 빈 스텁(return <></>)이라 검색 버튼을 눌러도 백지였고,
    //       blog_demo_num 6~9(프레임8~11)는 매핑 자체가 없어 undefined 를 반환했다.
    // 블로그 프레임에는 상품 목록 페이지(/blog/items)가 없어 검색이 유일한 상품 탐색 수단이다.
    return <Demo2 {...common} />
}
const Search = () => {
    const router = useRouter();
    const { themeDnsData } = useSettingsContext();
    return (
        <>
            {getDemo(themeDnsData?.blog_demo_num, {
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
