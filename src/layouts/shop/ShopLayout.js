import { StyledEngineProvider } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ShopLayout1 from "./shop/demo-1/ShopLayout1";

import BlogLayout1 from "./blog/demo-1/BlogLayout1";
import BlogLayout2 from "./blog/demo-2/BlogLayout2";
import ShopLayout2 from "./shop/demo-2/ShopLayout2";

const test_data = {
    categories: [

    ],
    company_info: {

    }
}
const getDemo = (num, common) => {
    const {
        data: {
            category
        },
        children
    } = common;

    if (category == 'shop') {
        if (num == 1)
            return <ShopLayout1 {...common} />
        else if (num == 2)
            return <ShopLayout2 {...common} />
        else
            return { children }
    } else if (category == 'blog') {
        if (num == 1)
            return <BlogLayout1 {...common} />
        else if (num == 2)
            return <BlogLayout2 {...common} />
        else
            return { children }
    } else {
        { children }
    }
}

const ShopLayout = ({ children, scrollToTop }) => {
    const router = useRouter();
    const [layoutDemoNum, setLayoutDemoNum] = useState(1);// 데모 번호
    const [category, setCategory] = useState("");
    useEffect(() => {
        if (router.asPath.split('/')[1] == 'shop' || router.asPath.split('/')[1] == 'blog') {
            setCategory(router.asPath.split('/')[1])
        } else if (router.asPath == '/') {
            console.log(1)
        }
    }, [router.asPath])

    return (
        <>
                {getDemo(layoutDemoNum, {
                    data: {
                        category: router.asPath.split('/')[1]
                    },
                    func: {
                        router
                    },
                    children,
                    scrollToTop
                })}
        </>
    )
}
export default ShopLayout;
