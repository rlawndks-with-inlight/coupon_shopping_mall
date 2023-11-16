import { Typography } from "@mui/material"
import { useSettingsContext } from "src/components/settings"
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext"
import styled from "styled-components"
import { styled as muiStyle } from '@mui/material'
import { Col, themeObj } from "../styled-components"
import { useRouter } from "next/router"
export const Item4 = props => {
  return <></>
}

export const Seller4 = props => {
  return <></>
}

const MenuContainer = styled.div`
width:180px;
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
const SubMenuLabel = styled.a`
font-size: ${themeObj.font_size.size8};
margin:0.5rem;
cursor: pointer;
text-decoration: none;
`
export const AuthMenuSideComponent = (props) => {

  const { user } = useAuthContext();
  const { themeDnsData, themePostCategoryList, themeMode } = useSettingsContext();

  const router = useRouter();

  const authLabel = 'My 그랑';
  const noneAuthLabel = '고객센터';
  const authList = [
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
          link: '#',
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
          label: '마일리지',
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
          link: '#',
        },
        {
          label: '회원정보 변경',
          link: '#',
        },
        {
          label: '회원탈퇴',
          link: '#',
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
  console.log(router)
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
                  <SubMenuLabel href={itm.link} style={{
                    fontWeight: `${router.asPath == itm.link ? 'bold' : ''}`,
                    color: `${themeMode == 'dark' ? '#fff' : '#000'}`
                  }}>- {itm.label}</SubMenuLabel>
                </>
              ))}
            </SubMenuLabelContainer>
          </>
        ))}
      </MenuContainer>
    </>
  )
}