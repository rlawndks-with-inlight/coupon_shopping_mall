import { useRouter } from "next/router";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import Demo1 from "src/views/blog/auth/my-page/inquiry/demo-1";
import Demo2 from "src/views/blog/auth/my-page/inquiry/demo-2";
import Demo3 from "src/views/blog/auth/my-page/inquiry/demo-3";
import Demo4 from "src/views/blog/auth/my-page/inquiry/demo-4";
import Demo5 from "src/views/blog/auth/my-page/inquiry/demo-5";

// 1:1 문의 — 원래 /blog/auth/my-page/inquiry 에만 있던 화면이다.
// URL 을 /shop 으로 통일하면서 대응 경로가 없어 여기로 옮겼다.
//
// 쇼핑몰형 데모에는 이 화면이 없다. 쇼핑몰형 브랜드가 이 주소로 들어오면
// 마이페이지로 돌려보낸다(백지를 보여주지 않는다).

const getDemo = (num, common) => {
    if (num == 1)
        return <Demo1 {...common} />
    else if (num == 3)
        return <Demo3 {...common} />
    else if (num == 4)
        return <Demo4 {...common} />
    else if (num == 5)
        return <Demo5 {...common} />
    // blog_demo_num 2 및 6~9(프레임8~11)는 전용 화면이 없다.
    // 폴백이 없으면 undefined 가 되어 본문이 백지가 되므로 기능이 갖춰진 demo-2 로 떨어뜨린다.
    return <Demo2 {...common} />
}

const Inquiry = () => {
    const router = useRouter();
    const { themeDnsData } = useSettingsContext();

    if (themeDnsData?.shop_demo_num > 0) {
        if (typeof window !== 'undefined') router.replace('/shop/auth/my-page');
        return <></>;
    }
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
Inquiry.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default Inquiry;
