import { useRouter } from "next/router";
import styled from "styled-components";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { ResignDemo4 } from "src/views/shop/demo-4";
import { ResignDemo9 } from "src/views/shop/demo-9";
import { isBlogBrand } from "src/utils/blog-shop-route";
import ResignPanel from "src/components/elements/shop/ResignPanel";

// 전용 탈퇴 화면이 없는 프레임을 위한 단순 껍데기.
//
// 예전 폴백은 무조건 ResignDemo4 였는데, 그 화면은 프레임3 의 좌측 회원메뉴
// (AuthMenuSideComponent)까지 통째로 그린다 — 프레임1·2 와 블로그형(4~11) 고객에게
// 남의 프레임 메뉴가 그대로 뜨고, 그 메뉴 링크들도 자기 프레임에 없는 화면을 가리켰다.
const Wrappers = styled.div`
  max-width: 640px;
  width: 92%;
  min-height: 70vh;
  margin: 3vh auto 8vh;
`;

// 첫 인자가 데모번호가 아니라 브랜드 정보다 — 어떤 화면을 보여줄지는 경로가 아니라
// 브랜드 유형으로 정한다(delivery-address.js 와 같은 규칙).
const getDemo = (dns, common) => {
    const num = dns?.shop_demo_num;

    if (!isBlogBrand(dns) && num == 4)
        return <ResignDemo4 {...common} />
    else if (!isBlogBrand(dns) && num == 9)
        return <ResignDemo9 {...common} />
    else
        return (
            <Wrappers>
                <ResignPanel loginPath="/shop/auth/login" />
            </Wrappers>
        )
}

const Resign = () => {
    const router = useRouter();
    const { themeDnsData } = useSettingsContext();

    return (
        <>
            {getDemo(themeDnsData, {
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
