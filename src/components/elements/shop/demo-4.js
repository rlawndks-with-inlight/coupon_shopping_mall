import { Chip, Typography, TextField, Button } from "@mui/material"
import { useSettingsContext } from "src/components/settings"
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext"
import styled from "styled-components"
import { styled as muiStyle } from '@mui/material'
import { Col, themeObj } from "../styled-components"
import { useRouter } from "next/router"
import { LazyLoadImage } from "react-lazy-load-image-component"
import { itemThemeCssDefaultSetting } from "src/views/manager/item-card/setting"
import { useEffect, useState } from "react"
import { commarNumber, commarNumberWithUnit } from "src/utils/function"
import { Upload } from "src/components/upload";
import ReactQuillComponent from "src/views/manager/react-quill";
import { useModal } from "src/components/dialog/ModalProvider"
import { apiManager } from "src/utils/api"
import { apiShop } from "src/utils/api"
import toast from "react-hot-toast"
import Link from "next/link"
import { formatLang } from 'src/utils/format';

const ItemWrapper = styled.a`
display: flex;
flex-direction: column;
row-gap: 0.5rem;
text-decoration: none;
color: ${props => props.themeMode == 'dark' ? '#fff' : '#000'};
transition: 0.3s;
padding:25px 15px;
&:hover{
  transform: translateY(-8px);
  color: ${props => props.themeDnsData?.theme_css?.main_color};
}
`
const ItemName = styled(Typography)`
width:90%;
word-break: keep-all;
height: 60px;
margin: 0 auto;
font-family: 'Noto Sans KR';
@media screen and (max-width:500px) {
  font-size:0.75rem;
}
`

const ItemDetail = styled(Typography)`
width:70%;
font-family:'Noto Sans KR';
@media screen and (max-width:500px) {
  font-size:0.75rem;
}
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
  const { item, router, theme_css, seller, text_align = 'center' } = props;
  const [itemThemeCss, setItemThemeCss] = useState(itemThemeCssDefaultSetting);

  const itemStatusList = [
    { label: 'USED', color: 'default' },  //검정
    { label: 'NEW', color: 'primary' },  //빨강
    { label: 'STOPPED', color: 'warning' },
    { label: 'SOLD-OUT', color: 'error' },

    { label: '비공개', color: 'error' }
  ]
  return <>
    <Link href={item?.id && `/shop/item/${item?.id}${seller ? `?seller_id=${seller?.id}` : ''}`} passHref>
      <ItemWrapper
        //href={`/shop/item/${item?.id}`}
        themeMode={themeMode}
        themeDnsData={themeDnsData}
        style={{ cursor: 'pointer', textAlign: `${text_align}`, backgroundColor: `${themeMode != 'dark' ? 'white' : ''}`, margin: '0.25rem' }}
      >
        <ItemImgContainer>
          <ItemImg src={item?.product_img} style={{ height: '70%' }} />
        </ItemImgContainer>
        <div style={{ color: '#999999', fontWeight: 'bold', fontSize: '11px', width: '90%', margin: '0 auto' }}>
          {(item?.category_en_name1 ?? "").toUpperCase()}
        </div>
        <ItemName>
          {/* product_name 에 옵셔널체이닝이 없어, 상품이 없는 자리(빈 객체)가 들어오면
              undefined.length 에서 TypeError 가 났다. 앱에 ErrorBoundary 가 없어
              그 예외 하나로 페이지가 통째로 백지가 된다. 백엔드에서 빈 자리를 걸러내지만
              여기서도 방어한다. */}
          {(item?.product_name ?? '').length < 30 ? (item?.product_name ?? '') : `${item.product_name.slice(0, 30)}...`}
        </ItemName>
        <ItemDetail variant="subtitle2" style={{ margin: '0 auto', width: '90%' }}>
          {item?.status == 1 ? '거래 진행중'
            :
            /* status 3 은 '새상품' — 파는 상태다. 여기 SOLD OUT 목록에 들어 있어서
               새상품으로 등록한 상품이 목록·홈에서 품절로 보이고 가격까지 감춰졌다. 뺀다.
               (2=품절, 4=레거시 미사용 코드는 그대로 둔다) */
            item?.status == 2 || item?.status == 4 ? 'SOLD OUT'
              :
              item?.status == 6 ? '예약중'
                : item?.status == 7 ? '매장문의'
                  :
                  <>
                    {commarNumberWithUnit(item?.product_sale_price)}
                    {/*
                    item?.product_price != item?.product_sale_price ?
                      <span style={{ color: '#EC1C24', marginLeft: '0.5rem' }}>
                        {parseInt((item?.product_price - item?.product_sale_price) * 100 / item?.product_price) + '%'}
                      </span>
                      :
                      ''
                      */
                    }
                  </>
          }
        </ItemDetail>
        <div style={{ width: '80%', margin: '0 auto' }}>
          <Chip
            size="small"
            variant="outlined"  //그랑파리 상품에서는 item.status가 0이다 = 판매중, 그 중에서 show_status가 0이면 신상품, 1이면 중고품
            color={
              item?.show_status == 1 ?
                itemStatusList[0]?.color
                :
                itemStatusList[1]?.color
            } //N 및 N-S 등급은 NEW, 그 외는 USED
            label={
              item?.show_status == 1 ?
                itemStatusList[0]?.label
                :
                itemStatusList[1].label
            }
            style={{
              margin: '0 auto',
            }} />
        </div>
      </ItemWrapper>
    </Link>
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
font-family: 'Noto Sans KR';
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
border-top: 1px solid #ccc;
min-height: 100px;
margin-bottom: 1rem;
padding:1rem;
`
const Title = styled.h1`
margin: 0.8rem auto 1rem auto;
width: 100%;
font-size: ${themeObj.font_size.size2};
color: #5F5F5F;
`
export const TitleComponent = (props) => {
  const { children, style } = props;
  const { themeDnsData } = useSettingsContext();
  return (
    <>
      <Title
        style={{ borderBottom: `1px solid #ccc`, ...style }}
      >{children}</Title>
    </>
  )
}

const MenuContainer = styled.div`
width:350px;
display: flex;
flex-direction: column;
@media screen and (max-width:1000px){
    width: 100%;
}
`
const TitleLabel = muiStyle(Typography)`
border-bottom:1px solid #000;
padding:0.25rem 0;
width:100%;
font-family: Playfair Display;
font-size: 36px;
`
const ManuLabel = muiStyle(Typography)`
padding: 0.25rem 0.5rem;
margin-top:1rem;
`
const SubMenuLabelContainer = styled.div`
display: flex;
flex-direction: column;
`
const SubMenuLabel = styled.div`
font-size: ${themeObj.font_size.size8};
margin:0.3rem 0.5rem;
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

  const authLabel = 'My GRANDPARIS';
  const noneAuthLabel = '고객센터';
  const authList = [
    {
      // '회원정보' 그룹은 하나만 둔다.
      // 예전엔 같은 이름의 그룹이 목록 맨 앞(마이페이지)과 맨 뒤(회원정보 변경)에 따로 있어서
      // 사이드메뉴에 '회원정보' 제목이 두 번 찍혔다.
      label: '회원정보',
      children: [
        {
          label: '마이페이지',
          link: '/shop/auth/my-page/',
        },
        {
          label: '회원정보 변경',
          link: '/shop/auth/change-info/',
        },
        // 배송지 관리·회원탈퇴는 '회원정보 변경' 화면(공용 패널) 안에 함께 들어가 있어
        // 메뉴에 또 두면 같은 일을 하는 입구가 둘이 된다. 메뉴에서만 감춘다.
        // (페이지 자체는 남아 있어 /shop/auth/delivery-address, /resign 으로 직접 들어가면 동작한다)
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
        // 위탁상품관리는 이 브랜드에서 쓰지 않는다.
        // (예전엔 주석이 객체 리터럴 안에 있어 `{}` 빈 항목이 배열에 그대로 남았다)
        {
          label: '위시리스트',
          link: '/shop/auth/wish/',
        },
      ]
    },
    /*{
      label: '혜택관리',
      children: [

        {
          label: '포인트',
          link: '/shop/auth/point/',
        },
      ]
    },*/
    ...(themePostCategoryList ? [
      {
        label: '고객센터',
        children: [
          // filter 로 걸러낸다 — map 안의 if 는 else 경로에서 undefined 를 배열에 남긴다.
          // (그 undefined 를 링크 없는 빈 줄로 렌더하다가 display:none 으로 겨우 감추고 있었다)
          ...themePostCategoryList
            .filter((item) => item?.post_category_title != '관리자문의')
            .map((item) => ({
              label: formatLang(item, 'post_category_title'),
              link: `/shop/service/${item?.id}/`,
            }))
        ]
      },
    ] : []),
  ];
  const noneAuthList = [
    {
      label: '',
      // themePostCategoryList 는 첫 렌더에 아직 안 와 있을 수 있다(그대로 map 하면 크래시).
      children: (themePostCategoryList ?? []).map((item) => ({
        label: formatLang(item, 'post_category_title'),
        link: `/shop/service/${item?.id}`,
      }))
    },
  ]
  return (
    <>
      <MenuContainer>
        <TitleLabel style={{ visibility: 'hidden' }}>{user ? authLabel : noneAuthLabel}</TitleLabel>
        <div style={{ border: '2px solid black', marginTop: '0.5rem', marginBottom: '1.5rem' }} />
        {(user ? authList : noneAuthList).map((item) => (
          <>
            {item.label &&
              <>
                <ManuLabel variant="subtitle1" style={{ color: themeMode == 'dark' ? '#fff' : '#000' }}>{item.label}</ManuLabel>
              </>}
            <SubMenuLabelContainer>
              {item.children.map(itm => (
                <>
                  <SubMenuLabel
                    onClick={() => {
                      router.push(itm?.link);
                    }}
                    style={{
                      fontWeight: `${router.asPath == itm?.link ? 'bold' : ''}`,
                      display: `${itm?.link ? '' : 'none'}`
                    }}
                    themeDnsData={themeDnsData}
                    themeMode={themeMode}
                  >{itm?.label}</SubMenuLabel>
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
  const { basic_info } = themeDnsData;
  return (
    <>
      <div
        style={{ padding: '24px' }}
      //onClick={() => { console.log(themeDnsData) }}

      />

    </>
  )
}

export const ProductFaq = () => {
  const { user } = useAuthContext();
  const [item, setItem] = useState({
    title: '',
    content: '',
    is_reply: 0,
    reply: '',
    product_id: '',
    user_id: '',
  })
  const [reply, setReply] = useState({
    post_title: '',
    post_content: '',
    is_reply: 1,
  })
  const { setModal } = useModal()
  const router = useRouter()
  const onSave = async () => {
    let result = undefined;
    let result2 = undefined;
    if (router.query?.edit_category == 'edit') {
      result = await apiManager('product-faq', 'update', { ...item, id: router.query?.id });
      // 예전엔 category?.is_able_user_add 를 봤는데 category 라는 변수가 이 파일에 없어서
      // 문의 '수정'은 저장 버튼을 누르는 순간 ReferenceError 로 죽었다.
      // 원래 하려던 건 '답변이 있을 때만 답변도 같이 저장' 이므로 그 조건으로 바꾼다.
      if (reply?.post_content && result) {
        if (reply?.id > 0) {
          result2 = await apiManager('product-faq', 'update', { ...reply, });
        } else {
          result2 = await apiManager('product-faq', 'create', { ...reply, });
        }
      } else {
        result2 = true;
      }
    } else {
      result = await apiManager('product-faq', 'create', { ...item, product_id: router.query?.id, user_id: user.id });
      result2 = true;
    }
    if (result && result2) {
      toast.success("성공적으로 저장 되었습니다.");
      //router.push(`/manager/articles/${router.query?.category_id}`);
    }
  }

  return (
    <>

      {user ?
        <>
          <TextField
            label='제목'
            value={item.title}
            onChange={(e) => {
              setItem(
                {
                  ...item,
                  ['title']: e.target.value
                }
              )
            }} />
          <ReactQuillComponent
            value={item.content}
            setValue={(value) => {
              setItem({
                ...item,
                ['content']: value
              });
            }}
          />

          <Button variant="contained" style={{
            height: '48px', width: '120px', margin: '1rem 0 1rem auto'
          }} onClick={() => {
            setModal({
              func: () => { onSave() },
              icon: 'material-symbols:edit-outline',
              title: '저장 하시겠습니까?'
            })
          }}>
            저장
          </Button>
        </>
        :
        <>
          <div style={{ padding: '24px' }}>
            로그인이 필요합니다.<br />
            <Button variant="contained" style={{
              height: '48px', width: '150px', margin: '1rem 0 1rem auto'
            }} onClick={() => {
              router.push('/shop/auth/login')
            }}>
              로그인하러 가기
            </Button>
          </div>
        </>
      }
    </>
  )
}