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
import { commarNumber } from "src/utils/function"
import { Upload } from "src/components/upload";
import ReactQuillComponent from "src/views/manager/react-quill";
import { useModal } from "src/components/dialog/ModalProvider"
import { apiManager } from "src/utils/api"
import { apiShop } from "src/utils/api"
import toast from "react-hot-toast"

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
const ItemName = muiStyle(Typography)`
width:70%;
//text-align: center;
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
  const { item, router, theme_css, seller, type = 0, text_align = 'center' } = props;
  const [itemThemeCss, setItemThemeCss] = useState(itemThemeCssDefaultSetting);

  useEffect(() => {
    //console.log(item)
  }, [])

  const itemStatusList = [
    { label: 'USED', color: 'default' },  //검정
    { label: 'NEW', color: 'primary' },  //빨강
    { label: 'STOPPED', color: 'warning' },
    { label: 'SOLD-OUT', color: 'error' },

    { label: '비공개', color: 'error' }
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
      style={{ cursor: 'pointer', textAlign: `${text_align}`, backgroundColor: `${'white'}`, margin: '0.25rem' }}
    >
      <ItemImgContainer>
        <ItemImg src={item?.product_img} style={{ height: '70%' }} />
      </ItemImgContainer>
      <div style={{ color: '#999999', fontWeight: 'bold', fontSize: '11px', width: '90%', margin: '0 auto' }}>
        {item?.product_name.split(" ")[0]}
      </div>
      <ItemName style={{ fontSize: '16px', height: '60px', width: '90%', wordBreak: 'keep-all', margin: `${type == 0 ? '0 auto' : ''}` }}>
        {item?.product_name.length < 30 ? item.product_name : `${item.product_name.slice(0, 30)}...`}
      </ItemName>
      <ItemName variant="subtitle2" style={{ margin: `${type == 0 ? '0 auto' : ''}`, width: '90%' }}>
        {item?.status == 1 ? '거래 진행중'
          :
          item?.product_sale_price == 0 ? 'SOLD OUT'
            :
            <>
              {commarNumber(item?.product_sale_price) + '원'}
              {item?.product_price != item?.product_sale_price ?
                <span style={{ color: '#EC1C24', marginLeft: '0.5rem' }}>
                  {parseInt((item?.product_price - item?.product_sale_price) * 100 / item?.product_price) + '%'}
                </span>
                :
                ''
              }
            </>
        }
      </ItemName>
      <div style={{ width: '80%', margin: '0 auto' }}>
        <Chip
          size="small"
          variant="outlined"  //그랑파리 상품에서는 item.status가 0이다 = 판매중, 그 중에서 show_status가 0이면 신상품, 1이면 중고품
          color={
            item?.status == 0 && item?.show_status == 1 ?
              itemStatusList[0]?.color
              :
              item?.status == 5 ?
                itemStatusList[4]?.color
                :
                itemStatusList[parseInt(item?.status) + 1 ?? 0]?.color}  //N 및 N-S 등급은 NEW, 그 외는 USED
          label={
            item?.status == 0 && item?.show_status == 1 ?
              itemStatusList[0]?.label
              :
              item?.status == 5 ?
                itemStatusList[4]?.label
                :
                itemStatusList[parseInt(item?.status) + 1 ?? 0]?.label}
          style={{
            margin: '0 auto',
          }} />
      </div>
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
        style={{ borderBottom: `1px solid #5F5F5F`, ...style }}
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
        <TitleLabel>{user ? authLabel : noneAuthLabel}</TitleLabel>
        <div style={{ border: '2px solid black', marginTop: '0.5rem', marginBottom: '1.5rem' }} />
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
                  >{itm.label}</SubMenuLabel>
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
      if (category?.is_able_user_add == 1 && result) {
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