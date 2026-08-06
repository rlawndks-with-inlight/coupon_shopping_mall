import ShopLayout from "src/layouts/shop/ShopLayout";
import AccountEditPanel from "src/components/elements/shop/AccountEditPanel";
import styled from "styled-components";

// 회원정보 수정 — 데모 구분 없는 공용 패널 한 벌(AccountEditPanel).
// shop 쪽 /shop/auth/change-info 와 완전히 같은 내용을 보여준다.
//
// 기존 demo-1~5 화면은 이름·연락처가 disabled 라 사실상 기본 배송지만 고를 수 있었고
// (프레임6 만 연락처 수정 가능), '변경' 버튼은 이미 있는 값을 그대로 다시 보냈다.
// SMS/E-mail 수신동의 체크박스는 저장할 컬럼이 없어 새로고침하면 초기화됐다.
// 공용 패널은 휴대폰번호·비밀번호(2회 입력)·배송지·회원탈퇴를 전 프레임 동일하게 제공한다.
//
// 기존 뷰 파일(views/blog/auth/my-page/user-info/demo-1~5.js)은 지우지 않고 남겨 둔다.

const Wrappers = styled.div`
  max-width: 720px;
  width: 92%;
  min-height: 70vh;
  margin: 3vh auto 8vh;
`;

const UserInfo = () => {
    return (
        <Wrappers>
            <AccountEditPanel loginPath="/blog/auth/login" />
        </Wrappers>
    )
}
UserInfo.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default UserInfo;
