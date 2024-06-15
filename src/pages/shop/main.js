import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { MainDemo7 } from "src/views/shop/demo-7";

const getDemo = (num, common) => {
    if (num == 7)
        return <MainDemo7 {...common} />
}
const Main = () => {

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
Main.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;

export default Main;