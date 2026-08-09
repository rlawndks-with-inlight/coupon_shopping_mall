import { useRouter } from "next/router";
import { useEffect } from "react";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { MainDemo7 } from "src/views/shop/demo-7";

// /shop/main 전용 화면은 shop_demo_num 7 에만 있다.
//
// 나머지 프레임에서는 getDemo 가 undefined 를 반환해 헤더·푸터만 남고 본문이 백지였다
// — 판매중인 11개 프레임(shop 1·2·4, blog 4~11)이 전부 여기에 해당한다.
// 이 경로는 사실상 홈의 다른 이름이므로, 전용 화면이 없으면 홈으로 보낸다.
const getDemo = (num, common) => {
    if (num == 7)
        return <MainDemo7 {...common} />
    return null;
}
const Main = () => {

    const router = useRouter();
    const { themeDnsData } = useSettingsContext();
    const demo = getDemo(themeDnsData?.shop_demo_num, {
        data: {
        },
        func: {
            router
        },
    });

    useEffect(() => {
        // themeDnsData 가 아직 안 왔을 때 성급히 튕기지 않는다(빈 값도 '전용 화면 없음'으로 보이기 때문).
        if (!themeDnsData) return;
        if (demo) return;
        router.replace('/shop');
    }, [themeDnsData, !!demo]);

    return (
        <>
            {demo}
        </>
    )
}
Main.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;

export default Main;
