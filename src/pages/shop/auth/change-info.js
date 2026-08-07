import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { ChangeInfoDemo4 } from "src/views/shop/demo-4";
import AccountEditPanel from "src/components/elements/shop/AccountEditPanel";
import styled from "styled-components";

// 회원정보 수정 — 내용은 데모 구분 없는 공용 패널 한 벌(AccountEditPanel).
//
// 기존엔 shop_demo_num == 4 일 때만 화면이 있었고 나머지는 undefined 를 반환해 백지였다.
// 그래서 프레임1·2 는 회원정보를 고칠 방법이 아예 없었다(마이페이지에 읽기 전용 표시만 있었다).
//
// 데모4(프레임3)는 좌측 회원메뉴가 있는 자체 껍데기를 그대로 쓰고,
// 그 외 데모는 아래 단순 래퍼에 같은 패널을 얹는다. 내용은 어느 쪽이든 동일하다.

const Wrappers = styled.div`
  max-width: 720px;
  width: 92%;
  min-height: 70vh;
  margin: 3vh auto 8vh;
`;

const ChangeInfo = () => {
    const { themeDnsData } = useSettingsContext();

    if (Number(themeDnsData?.shop_demo_num) === 4) {
        return <ChangeInfoDemo4 />;
    }
    return (
        <Wrappers>
            <AccountEditPanel loginPath="/shop/auth/login" />
        </Wrappers>
    );
};

ChangeInfo.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default ChangeInfo;
