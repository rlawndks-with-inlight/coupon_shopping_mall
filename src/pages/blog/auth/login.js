import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import Demo1 from "src/views/blog/auth/login/demo-1";

const getDemo = (num, common) => {

    if (num == 1)
        return <Demo1 {...common} />
}
const Login = () => {
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
Login.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Login;
