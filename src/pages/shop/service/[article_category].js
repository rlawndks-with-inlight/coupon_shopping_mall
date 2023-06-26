import { useRouter } from "next/router";
import { useState } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import Demo1 from "src/views/shop/service/article_category/list/demo-1";

const getDemo = (num, common) => {

    if (num == 1)
        return <Demo1 {...common} />
}
const ArticleList = () => {
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
ArticleList.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default ArticleList;
