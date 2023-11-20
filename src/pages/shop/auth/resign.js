import { useRouter } from "next/router";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { ResignDemo4 } from "src/views/shop/demo-4";


const getDemo = (num, common) => {

    if (num == 4)
        return <ResignDemo4 {...common} />
}

const Resign = () => {
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
Resign.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Resign;
