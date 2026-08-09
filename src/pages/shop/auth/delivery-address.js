import { useRouter } from "next/router";
import styled from "styled-components";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { DeliveryAddressDemo4 } from "src/views/shop/demo-4";
import { DeliveryAddressDemo9 } from "src/views/shop/demo-9";
import { isBlogBrand } from "src/utils/blog-shop-route";
import AddressBookPanel from "src/components/elements/shop/AddressBookPanel";
import Blog_Demo1 from "src/views/blog/auth/my-page/address/demo-1";
import Blog_Demo2 from "src/views/blog/auth/my-page/address/demo-2";
import Blog_Demo3 from "src/views/blog/auth/my-page/address/demo-3";
import Blog_Demo4 from "src/views/blog/auth/my-page/address/demo-4";
import Blog_Demo5 from "src/views/blog/auth/my-page/address/demo-5";


// 블로그형 브랜드용 화면. URL 을 /shop 으로 통일하면서 blog 페이지의 뷰 선택을 여기로 옮겼다.
const getBlogDemo = (num, common) => {

    if (num == 1)
        return <Blog_Demo1 {...common} />
    else if (num == 2)
        return <Blog_Demo2 {...common} />
    else if (num == 3)
        return <Blog_Demo3 {...common} />
    else if (num == 4)
        return <Blog_Demo4 {...common} />
    else if (num == 5)
        return <Blog_Demo5 {...common} />
    // blog_demo_num 6~9(프레임8~11)는 전용 화면이 없다. 폴백이 없으면 undefined 를 반환해
    // 헤더/푸터만 남고 본문이 백지가 되므로, 기능이 갖춰진 demo-2 로 떨어뜨린다.
    else
        return <Blog_Demo2 {...common} />
}

// 프레임1·2 처럼 전용 배송지 화면이 없는 쇼핑몰형을 위한 단순 껍데기.
//
// 예전 폴백은 무조건 DeliveryAddressDemo4 였는데, 그 화면은 프레임3 의 좌측 회원메뉴
// (AuthMenuSideComponent)까지 통째로 그린다 — 프레임1·2 고객에게 남의 프레임 메뉴가
// 그대로 뜨고, 그 메뉴의 링크들도 자기 프레임에 없는 화면을 가리켰다.
const Wrappers = styled.div`
  max-width: 900px;
  width: 92%;
  min-height: 70vh;
  margin: 3vh auto 8vh;
`;

// 첫 인자가 데모번호가 아니라 브랜드 정보다 — 어떤 화면을 보여줄지는 경로가 아니라
// 브랜드 유형으로 정한다(/blog 경로를 /shop 으로 통일하면서 바뀐 규칙).
const getDemo = (dns, common) => {
  if (isBlogBrand(dns)) return getBlogDemo(dns?.blog_demo_num, common);
  const num = dns?.shop_demo_num;

    if (num == 4)
        return <DeliveryAddressDemo4 {...common} />
    else if (num == 9)
        return <DeliveryAddressDemo9 {...common} />
    else
        return (
          <Wrappers>
            <AddressBookPanel />
          </Wrappers>
        )
}

const DeliveryAddress = () => {
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
DeliveryAddress.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default DeliveryAddress;
