import { useRouter } from "next/router";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { DeliveryAddressDemo4 } from "src/views/shop/demo-4";
import { DeliveryAddressDemo9 } from "src/views/shop/demo-9";


const getDemo = (num, common) => {

    if (num == 4)
        return <DeliveryAddressDemo4 {...common} />
    else if (num == 9)
        return <DeliveryAddressDemo9 {...common} />
    else
        return <DeliveryAddressDemo4 {...common} />
}

const DeliveryAddress = () => {
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
DeliveryAddress.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default DeliveryAddress;
