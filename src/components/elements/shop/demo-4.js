import { Chip, Typography } from "@mui/material"
import { useSettingsContext } from "src/components/settings"
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext"
import styled from "styled-components"
import { styled as muiStyle } from '@mui/material'
import { Col, themeObj } from "../styled-components"
import { useRouter } from "next/router"
import { LazyLoadImage } from "react-lazy-load-image-component"
import { itemThemeCssDefaultSetting } from "src/views/manager/item-card/setting"
import { useState } from "react"
import { commarNumber } from "src/utils/function"
const ItemWrapper = styled.a`
display: flex;
flex-direction: column;
row-gap: 0.5rem;
text-decoration: none;
color: ${props => props.themeMode == 'dark' ? '#fff' : '#000'};
transition: 0.3s;
&:hover{
  transform: translateY(-8px);
  color: ${props => props.themeDnsData?.theme_css?.main_color};
}
`
const ItemName = muiStyle(Typography)`
width:70%;
margin: 0 auto;
text-align: center;
`
const ItemImgContainer = styled.div`
width: 100%;
height: 300px;
margin: 0 auto;
display: flex;
@media screen and (max-width:1700px){
  height:16vw; 
}
@media screen and (max-width:1150px){
  height:28vw; 
}
@media screen and (max-width:850px){
  height:40vw; 
}
`
const ItemImg = styled(LazyLoadImage)`
object-fit: contain;
margin: auto;
height: 100%;
`

const InfoTitle = styled.div`
color: ${props => props.themeDnsData?.theme_css?.main_color};
font-weight: 700;
margin-top:1rem;
margin-bottom:1rem;
`

const InfoDetail = styled.div`
margin-top:1rem;
margin-bottom:2rem;
`

export const Item4 = (props) => {
  const { user } = useAuthContext();
  const { themeWishData, onChangeWishData, themeMode, themeDnsData } = useSettingsContext();
  const { item, router, theme_css, seller } = props;
  const [itemThemeCss, setItemThemeCss] = useState(itemThemeCssDefaultSetting);

  const itemStatusList = [
    { label: 'USED', color: 'info' },
    { label: 'STOPPED', color: 'warning' },
    { label: 'SOLD-OUT', color: 'error' },
    { label: 'NEW', color: 'success' },
  ]
  return <>
    <ItemWrapper
      //href={`/shop/item/${item?.id}`}
      themeMode={themeMode}
      themeDnsData={themeDnsData}
      onClick={() => {
        if (item?.id) {
          router.push(`/shop/item/${item?.id}${seller ? `?seller_id=${seller?.id}` : ''}`)
        }
      }}
      style={{cursor:'pointer'}}
    >
      <ItemImgContainer>
        <ItemImg src={item?.product_img} />
      </ItemImgContainer>
      <Chip
        size="small"
        variant="outlined"
        color={itemStatusList[item?.status ?? 0].color}
        label={itemStatusList[item?.status ?? 0].label}
        style={{
          margin: '0 auto',
        }} />
      <ItemName variant="body2">{item?.product_name}</ItemName>
      <ItemName variant="subtitle2">{commarNumber(item?.product_sale_price)}원</ItemName>
    </ItemWrapper>
  </>
}

export const Seller4 = props => {
  return <></>
}
export const ContentWrappers = styled.div`
width: 1100px;
display: flex;
flex-direction: column;
margin: 0 auto 1rem 1rem;
@media screen and (max-width:1750px){
    width: 80%;
    margin-left: auto;
}
@media screen and (max-width:1550px){
    width: 70%;
    margin-left: auto;
}
@media screen and (max-width:1000px){
  width: 100%;
  margin: 0 auto;
}
`
const SubTitle = styled.h3`
margin: 1rem auto 0.25rem auto;
width: 100%;
font-size: ${themeObj.font_size.size6};
display: flex;
justify-content: space-between;
align-items: center;
`
export const SubTitleComponent = (props) => {
  const { children, endComponent } = props;
  const { themeDnsData } = useSettingsContext();

  return (
    <>
      <SubTitle
      >
        {children}
        {endComponent}
      </SubTitle>
    </>
  )
}
export const ContentBorderContainer = styled.div`
border: 1px solid #ccc;
min-height: 100px;
margin-bottom: 1rem;
padding:1rem;
`
const Title = styled.h1`
margin: 0 auto 1rem auto;
width: 100%;
font-size: ${themeObj.font_size.size2};
`
export const TitleComponent = (props) => {
  const { children, style } = props;
  const { themeDnsData } = useSettingsContext();
  return (
    <>
      <Title
        style={{ borderBottom: `3px solid ${themeDnsData?.theme_css?.main_color}`, ...style }}
      >{children}</Title>
    </>
  )
}

const MenuContainer = styled.div`
width:220px;
display: flex;
flex-direction: column;
@media screen and (max-width:1000px){
    width: 100%;
}
`
const TitleLabel = muiStyle(Typography)`
border-bottom:3px solid #ccc;
padding:0.25rem 0;
width:100%;
`
const ManuLabel = muiStyle(Typography)`
background:#eee;
padding: 0.25rem 0.5rem;
margin-top:1rem;
`
const SubMenuLabelContainer = styled.div`
display: flex;
flex-direction: column;
`
const SubMenuLabel = styled.div`
font-size: ${themeObj.font_size.size8};
margin:0.5rem;
cursor: pointer;
text-decoration: none;
color: ${props => props.themeMode == 'dark' ? '#fff' : '#000'};
transition: 0.3s;
&:hover{
  color: ${props => props.themeDnsData?.theme_css?.main_color};
}
`
export const AuthMenuSideComponent = (props) => {

  const { user } = useAuthContext();
  const { themeDnsData, themePostCategoryList, themeMode } = useSettingsContext();

  const router = useRouter();

  const authLabel = 'My 그랑';
  const noneAuthLabel = '고객센터';
  const authList = [
    {
      label: '회원정보',
      children: [
        {
          label: '마이페이지',
          link: '/shop/auth/my-page/',
        },
      ]
    },
    {
      label: '쇼핑정보',
      children: [

        {
          label: '주문/배송조회',
          link: '/shop/auth/history/',
        },
        {
          label: '반품/환불조회',
          link: '/shop/auth/history/?is_cancel=1',
        },
        {
          label: '위탁상품관리',
          link: '/shop/auth/consignment/',
        },
        {
          label: '위시리스트',
          link: '/shop/auth/wish/',
        },
      ]
    },
    {
      label: '혜택관리',
      children: [

        {
          label: '포인트',
          link: '/shop/auth/point/',
        },
      ]
    },
    {
      label: '고객센터',
      children: [
        ...themePostCategoryList.map((item) => {
          return {
            label: item?.post_category_title,
            link: `/shop/service/${item?.id}/`,
          }
        })
      ]
    },
    {
      label: '회원정보',
      children: [
        {
          label: '배송지 관리',
          link: '/shop/auth/delivery-address/',
        },
        {
          label: '회원정보 변경',
          link: '/shop/auth/change-info/',
        },
        {
          label: '회원탈퇴',
          link: '/shop/auth/resign/',
        },
      ]
    },
  ];
  const noneAuthList = [
    {
      label: '',
      children: [
        ...themePostCategoryList.map((item) => {
          return {
            label: item?.post_category_title,
            link: `/shop/service/${item?.id}`,
          }
        })
      ]
    },
  ]
  return (
    <>
      <MenuContainer>
        <TitleLabel variant="h5">{user ? authLabel : noneAuthLabel}</TitleLabel>
        {(user ? authList : noneAuthList).map((item) => (
          <>
            {item.label &&
              <>
                <ManuLabel variant="subtitle1" style={{ color: '#000' }}>{item.label}</ManuLabel>
              </>}
            <SubMenuLabelContainer>
              {item.children.map(itm => (
                <>
                  <SubMenuLabel
                    onClick={() => {
                      router.push(itm.link);
                    }}
                    style={{
                      fontWeight: `${router.asPath == itm.link ? 'bold' : ''}`,

                    }}
                    themeDnsData={themeDnsData}
                    themeMode={themeMode}
                  >- {itm.label}</SubMenuLabel>
                </>
              ))}
            </SubMenuLabelContainer>
          </>
        ))}
      </MenuContainer>
    </>
  )
}

export const BasicInfo = () => {
  const { themeDnsData } = useSettingsContext()
  return (
    <>
    <div style={{padding:'24px'}}>
      <InfoTitle themeDnsData={themeDnsData}>
        배송안내
      </InfoTitle>
      <InfoDetail>
        평일 4시, 토요일 12시까지 주문 및 입금 확인된 건에 한하여 당일 발송 실시.<br />
        마감 시간 후 입금 확인 건은 익일(다음날) 발송 됩니다.
      </InfoDetail>
      <InfoTitle themeDnsData={themeDnsData}>
        배송방법
      </InfoTitle>
      <InfoDetail>
        택배를 기본으로 하며, 서울/수도권 지역은 구매자 부담으로 퀵서비스도 가능합니다.<br />
        대한통운(http://www.doortodoor.co.kr)
      </InfoDetail>
      <InfoTitle themeDnsData={themeDnsData}>
        배송비
      </InfoTitle>
      <InfoDetail>
        구매자가 부담(4,000원), 2건 이상 구매시 한번의 배송비(4,000원)만 부담으로 합배송 가능합니다.<br />
        택배회사에서 지정하는 도서 산간 지역은 배송비 추가 발생합니다. (자동 적용)
      </InfoDetail>
      <InfoTitle themeDnsData={themeDnsData}>
        배송기간
      </InfoTitle>
      <InfoDetail>
        - 기본적으로 익일(발송 다음 날) 받으십니다.<br />
        - 명절이나 연휴, 택배 물량 증가, 교통 체증 등의 이유로 2~3일 지연 될 수 있습니다.(자동 적용)
      </InfoDetail>
      <InfoTitle themeDnsData={themeDnsData}>
        주문취소
      </InfoTitle>
      <InfoDetail>
        1) 상품 대금을 결제하기 전에는 언제든지 주문 취소 가능<br />
        2) 무통장 입금 시 48시간 이내에 미입금 되면 자동 주문 취소(자동 적용)
      </InfoDetail>
      <InfoTitle themeDnsData={themeDnsData}>
        반품 및 환불제도
      </InfoTitle>
      <InfoDetail>
        1) 반품접수 : ① 그랑파리(02-517-2950/02-517-8950)로 전화 ② 주문/배송 페이지에서 반품 신청<br />
        2) 요청기간 : 상품 수령 후 24시간 이내 (상품수령 확인은 대한통운 택배사의 배송 추적을 이용)<br />
        3) 반품기간 : 반품요청 후 반품요청일(공휴일 제외)을 포함하여 4일 이내에 반드시 그랑파리로 도착해야 합니다.<br />
        - 반품요청 없이 반품한 상품은 반품기간이 경과되어 반품이 취소 될 수도 있습니다.<br />
        4) 반품방법 : ① 가까운 우체국이나 택배사, 편의점 등에서 선불 발송 ② 그랑파리 매장으로 방문 반품<br />
        5) 반품 배송비 : 왕복 배송비는 고객 부담을 기본으로 합니다.<br />
        카드 결제 건은 4,000원을 동봉해서 선불 발송으로 보내 주셔야합니다.<br />
        반품 후 카드 취소 시에 배송비도 일괄적으로 취소되기 때문입니다.<br />
        6) 환불기간 : 반품 도착 후 2일(공휴일 제외)이내<br />
        - 카드 취소시 해당 카드사에는 5일(공휴일제외)이후 확인가능<br />
        카드 취소에 대해 더 자세한 내용은 그랑파리로 전화 문의주세요.
      </InfoDetail>
      <InfoTitle themeDnsData={themeDnsData}>
        반품 불가 사유
      </InfoTitle>
      <InfoDetail>
        1) 구매자의 부주의로 인한 상품 훼손 시 <br />
        2) 상품 상세 설명에 이미 공지된 내용의 주지 부주의로 인한 반품 요구 시<br />
        3) 상품 수령 후 반품 요청 기간 및 반품 기간 경과 시<br />
        4) 상품에 붙어 있는 그랑파리 택(tag)이 떨어졌을 경우 사용하신 것으로 간주<br />
      </InfoDetail>
      </div>
    </>
  )
}