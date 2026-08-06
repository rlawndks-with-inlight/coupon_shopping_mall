import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import Demo1 from "src/views/blog/auth/my-page/demo-1";
import { useSettingsContext } from "src/components/settings";
import Demo2 from "src/views/blog/auth/my-page/demo-2";
import Demo3 from "src/views/blog/auth/my-page/demo-3";
import Demo4 from "src/views/blog/auth/my-page/demo-4";
import Demo5 from "src/views/blog/auth/my-page/demo-5";

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
    // blog_demo_num 6~9(프레임8~11)는 전용 화면이 없다. 폴백이 없으면 undefined 를 반환해
    // 헤더/푸터만 남고 본문이 백지가 되므로, 기능이 갖춰진 demo-2 로 떨어뜨린다.
    else
        return <Demo2 {...common} />
}
const MyPage = () => {
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
MyPage.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default MyPage;
