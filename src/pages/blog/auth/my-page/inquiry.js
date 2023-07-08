import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import Demo1 from "src/views/blog/auth/my-page/inquiry/demo-1";

const getDemo = (num, common) => {

    if (num == 1)
        return <Demo1 {...common} />
}
const Inquiry = () => {
    const router = useRouter();
    const [layoutDemoNum, setLayoutDemoNum] = useState(1);

    return (
        <>
            {getDemo(layoutDemoNum, {
                data: {
                },
                func: {
                    router
                },
            })}
        </>
    )
}
Inquiry.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Inquiry;
