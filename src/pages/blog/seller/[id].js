import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import Demo1 from "src/views/blog/seller/id/demo-1";
import { useSettingsContext } from "src/components/settings";
import Demo2 from "src/views/blog/seller/id/demo-2";
import Demo3 from "src/views/blog/seller/id/demo-3";
import Demo4 from "src/views/blog/seller/id/demo-4";
import Demo5 from "src/views/blog/seller/id/demo-5";

const getDemo = (num, common) => {

    if (num == 1)
        return <Demo1 {...common} />
    else if (num == 2)
        return <Demo2 {...common} />
    else if (num == 3)
        return <Demo3 {...common} />
    else if (num == 4)
        return <Demo4 {...common} />
    else if (num == 5)
        return <Demo5 {...common} />
    // blog_demo_num 6~9(프레임8~11)는 전용 셀러 화면이 없다. 매핑이 없으면 undefined 를 반환해
    // 헤더/푸터만 있고 본문이 텅 빈 화면이 나오므로, 기능이 갖춰진 demo-2 로 폴백한다.
    else
        return <Demo2 {...common} />
}
const Seller = () => {
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
Seller.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Seller;
