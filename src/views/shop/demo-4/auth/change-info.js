import { AuthMenuSideComponent, ContentWrappers, TitleComponent } from "src/components/elements/shop/demo-4";
import { RowMobileReverceColumn } from "src/components/elements/styled-components";
import AccountEditPanel from "src/components/elements/shop/AccountEditPanel";
import styled from "styled-components";

// 프레임3(shop:4) 회원정보 변경 — 좌측 회원메뉴가 있는 이 프레임의 껍데기만 유지하고
// 내용은 공용 패널(AccountEditPanel)을 그대로 쓴다.
//
// 걷어낸 것:
//  · 프로필 사진 업로드 — 쓰지 않기로 했다.
//  · 휴대폰 SMS 인증(인증번호 발송/확인) — 문자 게이트웨이를 쓰지 않기로 해서 동작이 불가능했고,
//    그 탓에 번호를 바꾸려 하면 "본사에 문의해 주세요" 로 저장이 막혀 있었다.
//  · 개인정보/비밀번호 탭 분리 — 공용 패널이 한 화면에 담는다.
//    (탭 경로 ?type=0|1 로 들어오던 링크는 그대로 이 화면에 도착한다)
//
// 공용 패널이 담는 것: 아이디·이름(읽기 전용) / 휴대폰번호 / 비밀번호 변경(2회 입력) /
//                     배송지 추가·수정·삭제 / 회원 탈퇴

const Wrappers = styled.div`
max-width:1400px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-top: 2rem;
`

const ChangeInfoDemo = () => {
  return (
    <Wrappers>
      <RowMobileReverceColumn>
        <AuthMenuSideComponent />
        <ContentWrappers>
          <TitleComponent>{'회원정보변경'}</TitleComponent>
          <div style={{ maxWidth: '720px', width: '100%', margin: '1rem auto 0' }}>
            <AccountEditPanel loginPath="/shop/auth/login" />
          </div>
        </ContentWrappers>
      </RowMobileReverceColumn>
    </Wrappers>
  )
}

export default ChangeInfoDemo;
