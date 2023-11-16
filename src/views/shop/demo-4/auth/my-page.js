import { useRouter } from "next/router";
import { useState } from "react";
import { useEffect } from "react";
import { AuthMenuSideComponent, ContentBorderContainer, ContentWrappers, SubTitleComponent, Title, TitleComponent } from "src/components/elements/shop/demo-4";
import { Col, RowMobileColumn, RowMobileReverceColumn, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiShop } from "src/utils/api";
import styled from "styled-components";

const Wrappers = styled.div`
max-width:1600px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-top: 2rem;
`
const MoreText = styled.div`
font-size: ${themeObj.font_size.size8};
font-weight: normal;
cursor: pointer;
&:hover{
  color: ${props => props.themeDnsData?.theme_css?.main_color};
}
`
const MyPageDemo = (props) => {

  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({});

  useEffect(() => {
    getUserInfo();
  }, [])
  const getUserInfo = async () => {
    const response = await apiShop('user-info');
    console.log(response)
  }
  return (
    <>
      <Wrappers>
        <RowMobileReverceColumn>
          <AuthMenuSideComponent />
          <ContentWrappers>
            <TitleComponent>{'My 그랑'}</TitleComponent>
            <ContentBorderContainer>

            </ContentBorderContainer>
            <SubTitleComponent
              endComponent={<MoreText themeDnsData={themeDnsData}>
                더보기
              </MoreText>}
            >위탁상품관리</SubTitleComponent>
            <ContentBorderContainer>

            </ContentBorderContainer>
            <SubTitleComponent
              endComponent={<MoreText themeDnsData={themeDnsData}>
                더보기
              </MoreText>}
            >최근 주문목록</SubTitleComponent>
            <ContentBorderContainer>

            </ContentBorderContainer>
            <SubTitleComponent>최근 본 상품</SubTitleComponent>
            <ContentBorderContainer>

            </ContentBorderContainer>
          </ContentWrappers>
        </RowMobileReverceColumn>
      </Wrappers>
    </>
  )
}
export default MyPageDemo