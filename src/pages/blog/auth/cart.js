import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import Demo1 from "src/views/blog/auth/cart/demo-1";
import { useSettingsContext } from "src/components/settings";
import Demo2 from "src/views/blog/auth/cart/demo-2";
import Demo3 from "src/views/blog/auth/cart/demo-3";
import Demo4 from "src/views/blog/auth/cart/demo-4";
import Demo5 from "src/views/blog/auth/cart/demo-5";

const getDemo = (num, common) => {
    // 모든 blog 프레임 카트를 기능 카트(demo-2)로 수렴 — '주문하기'는 공용 주문서로 이동.
    // (기존: blog 1/3/4/5는 목업, 6~9는 카트 미구현)
    return <Demo2 {...common} />
}

const Cart = () => {
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
Cart.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Cart;
