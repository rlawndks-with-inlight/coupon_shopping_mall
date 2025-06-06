import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import Demo1 from "src/views/blog/product/id/demo-1";
import { useSettingsContext } from "src/components/settings";
import Demo2 from "src/views/blog/product/id/demo-2";
import Demo3 from "src/views/blog/product/id/demo-3";
import Demo4 from "src/views/blog/product/id/demo-4";
import Demo5 from "src/views/blog/product/id/demo-5";

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
}
const Product = () => {
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
Product.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Product;
