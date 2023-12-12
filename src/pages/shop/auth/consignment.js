import { useRouter } from "next/router";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";

import { ConsignmentDemo4 } from "src/views/shop/demo-4";


const getDemo = (num, common) => {
    if (num == 4)
        return <ConsignmentDemo4 {...common} />
}

const Consignment = () => {
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
Consignment.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Consignment;
