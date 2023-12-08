import { Icon } from "@iconify/react";
import { IconButton, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import { Items } from "src/components/elements/shop/common";
import { AuthMenuSideComponent, ContentBorderContainer, ContentWrappers, SubTitleComponent, Title, TitleComponent } from "src/components/elements/shop/demo-4";
import { Col, Row, RowMobileColumn, RowMobileReverceColumn, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiShop } from "src/utils/api";
import { commarNumber } from "src/utils/function";
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
  const slideRef = useRef();
  useEffect(() => {
    if (user) {
      getUserInfo();
    } else {
      router.push(`/shop/auth/login`);
    }
  }, [])

  const getUserInfo = async () => {
    const response = await apiShop('user-info');
    setUserInfo(response);
  }
  return (
    <>
      <Wrappers>
        <RowMobileReverceColumn>
          <AuthMenuSideComponent />
          <ContentWrappers>
            <TitleComponent>{'My 그랑'}</TitleComponent>
            <ContentBorderContainer style={{ display: 'flex' }}>
              <Row style={{ columnGap: '0.5rem', fontWeight: 'bold', margin: 'auto' }}>
                <div>고객님의 포인트는</div>
                <div style={{ color: themeDnsData?.theme_css?.main_color }}>
                  {commarNumber(user?.point)}
                </div>
                <div>입니다.</div>
              </Row>
            </ContentBorderContainer>
            <SubTitleComponent
              endComponent={<MoreText themeDnsData={themeDnsData}
                onClick={() => {
                  window.location.href = `/shop/auth/consignment`
                }}>
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
            <SubTitleComponent
              endComponent={<Row style={{ alignItems: 'center' }}>
                <IconButton onClick={() => {
                  slideRef.current.slickPrev();
                }}>
                  <Icon icon='carbon:previous-filled' style={{ color: themeDnsData?.theme_css?.main_color }} />
                </IconButton>
                <IconButton onClick={() => {
                  slideRef.current.slickNext();
                }}>
                  <Icon icon='carbon:next-filled' style={{ color: themeDnsData?.theme_css?.main_color }} />
                </IconButton>
              </Row>}
            >최근 본 상품</SubTitleComponent>
            <ContentBorderContainer>
              <Items
                items={(userInfo?.product_views ?? []).map(item => {
                  return {
                    ...item,
                    id: item?.product_id
                  }
                })}
                router={router}
                is_slide={(userInfo?.product_views && userInfo?.product_views.length >= 5) ? true : false}
                slide_setting={{
                  autoplay: false,
                  infinite: false,
                }}
                slide_ref={slideRef}
              />
            </ContentBorderContainer>
          </ContentWrappers>
        </RowMobileReverceColumn>
        {/* 미완 */}
      </Wrappers>
    </>
  )
}
export default MyPageDemo