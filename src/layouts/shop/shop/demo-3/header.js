import Logo from "src/components/logo/Logo"
import styled from "styled-components"
import { IconButton, TextField, InputAdornment, Drawer, Button, Chip, Dialog } from "@mui/material"
import { forwardRef, useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { Row, themeObj } from 'src/components/elements/styled-components'
import { useTheme } from '@mui/material/styles';
import { useSettingsContext } from "src/components/settings"
import { test_categories } from "src/data/test-data"
import { useRouter } from "next/router"
import { TreeItem, TreeView } from "@mui/lab"
import { getAllIdsWithParents } from "src/utils/function"
import DialogSearch from "src/components/dialog/DialogSearch"
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext"
import { logoSrc } from "src/data/data"
import Slider from "react-slick"

const Wrappers = styled.header`
width: 100%;
position: fixed;
top: 0;
display: flex;
flex-direction: column;
z-index: 10;
border-bottom:1px solid ${themeObj.grey[300]};
@media (max-width:1000px) {
  padding-bottom: 0;
}
`
const TopMenuContainer = styled.div`
display:flex;
padding: 0.5rem 0;
max-width: 1500px;
width:90%;
margin: 0 auto;
align-items:center;
position:relative;

`
const CategoryContainer = styled.div`
max-width: 1500px;
width:100%;
margin: 0 auto;
display:flex;
align-items:center;
position:relative;
`
const CategoryMenuContainer = styled.div`
position:relative;
`
const CategoryMenu = styled.div`
padding:0.5rem 1rem;
text-align: center;
display:inline-block;
text-transform:uppercase;
margin:0;
cursor:pointer;
font-weight:bold;
position:relative;
font-size:${themeObj.font_size.size9};
color:${props => props.is_page_category == 1 ? (props => props.theme?.palette?.primary?.main) : ''};
`
const NoneShowMobile = styled.div`
display: flex;
align-items:center;
@media (max-width:1000px) {
  display: none;
}
`
const PaddingTop = styled.div`
margin-top:150px;
@media (max-width:1000px) {
  margin-top:56px;
}
`
const LogoImg = styled.img`
height: 40px;
width: auto;
cursor: pointer;
margin: 0 auto;
@media (max-width:300px) {
  width:52px;
  height:auto;
}
`
// bottom menu
const BottomMenuContainer = styled.div`
    position: fixed;
    right: 0;
    bottom: -1px;
    left: 0;
    z-index: 5;
    display:none;
    width:100%;
    max-width:1200px;
    margin: 0 auto;
    border-top:1px solid ${themeObj.grey[300]};
    @media screen and (max-width:1000px) {
        display:flex;
    }
`
const MenuContainer = styled.nav`
width: 100%;
max-width: 76.8rem;
height: 3.5rem;
display: -webkit-flex;
display: flex;
margin: 0 auto;
justify-content:space-between;
`
const OneMenuContainer = styled.a`
    color: inherit;
    text-decoration: none;
    width: 50%;
    min-width: 20%;
    height: 100%;
    display: flex;
    flex-direction:column;
    padding: 0.3rem 0 0.2rem;
    position: relative;
    text-align: center;
    cursor:pointer;
    align-items:center;
    background:transparent;
`
const OneMenuName = styled.div`
font-weight: 400;
font-size:${themeObj.font_size.size8};
margin-bottom:auto;
  @media screen and (max-width:330px) {
    font-size:${themeObj.font_size.size10};
  }
`
const Header = () => {

  const router = useRouter();
  const theme = useTheme();
  const { themeMode, onToggleMode, onChangeCategoryList, onChangeCartData, onChangeWishData, themeCategoryList } = useSettingsContext();
  const { user, logout } = useAuthContext();
  const [keyword, setKeyword] = useState("");
  const onSearch = () => {
    router.push(`/shop/search?keyword=${keyword}`)
  }
  const [isAuthMenuOver, setIsAuthMenuOver] = useState(false)
  const [hoverItems, setHoverItems] = useState({

  })
  const [dialogMenuOpen, setDialogMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
  }, [user])
  useEffect(() => {
    setLoading(true);
    let data = [...test_categories];
    onChangeCategoryList(data);
    let hover_list = getAllIdsWithParents(data);
    let hover_items = {};
    for (var i = 0; i < hover_list.length; i++) {
      hover_list[i] = hover_list[i].join('_');
      hover_items[`hover_${hover_list[i]?.id}`] = false;
    }
    hover_items['service'] = false;
    setHoverItems(hover_items);
    setLoading(false);
  }, [])
  const onHoverCategory = (category_name) => {
    let hover_items = hoverItems;
    for (let key in hover_items) {
      hover_items[key] = false;
    }
    hover_items[category_name] = true;
    setHoverItems(hover_items);
  }

  const [dialogOpenObj, setDialogOpenObj] = useState({
    search: false
  })
  const handleDialogClose = () => {
    let obj = { ...dialogOpenObj };
    for (let key in obj) {
      obj[key] = false
    }
    setDialogOpenObj(obj);
  }
  const isPageCategory = (id) => {
    let parent_list = getAllIdsWithParents(themeCategoryList[0]?.product_categories);
    for (var i = 0; i < parent_list.length; i++) {
      if (parent_list[i][parent_list[i].length - 1]?.id == router.query?.category_id && parent_list[i][0]?.id == id) {
        return true;
      }
    }
    return false;
  }

  return (
    <>
      <DialogSearch
        open={dialogOpenObj.search}
        handleClose={handleDialogClose}
        root_path={'/shop/search?keyword='}
      />
      {loading ?
        <>
        </>
        :
        <>
          <Wrappers style={{
            background: `${themeMode == 'dark' ? '#000' : '#fff'}`
          }}
          >
            <NoneShowMobile>
              <TopMenuContainer style={{ padding: '0.5rem 0' }}>
                <Row style={{ marginLeft: 'auto', columnGap: '1rem' }}>
                  {user ?
                    <>
                      <Button sx={{ height: '24px' }} onClick={() => router.push('/shop/auth/my-page')}>마이페이지</Button>
                      <Button sx={{ height: '24px' }} onClick={() => router.push('/shop/service/history')}>주문내역</Button>
                      <Button variant="outlined" sx={{ height: '24px' }} onClick={() => {
                        logout();
                        onChangeCartData([]);
                        onChangeWishData([]);
                        router.push('/shop/auth/login')
                      }}>로그아웃</Button>
                    </>
                    :
                    <>
                      <Button sx={{ height: '24px' }} onClick={() => router.push('/shop/auth/sign-up')}>회원가입</Button>
                      <Button sx={{ height: '24px' }} onClick={() => router.push('/shop/service/notice')}>고객센터</Button>
                      <Button variant="outlined" sx={{ height: '24px' }} onClick={() => router.push('/shop/auth/login')}>로그인</Button>
                    </>}
                </Row>
              </TopMenuContainer>
            </NoneShowMobile>
            <TopMenuContainer>
              <LogoImg src={logoSrc()}
                onClick={() => {
                  router.push('/shop')
                }}
              />
            </TopMenuContainer>
            <CategoryContainer>
              <NoneShowMobile>
                <IconButton
                  onClick={() => setDialogMenuOpen(true)}
                >
                  <Icon icon={'oi:menu'} fontSize={'1rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                </IconButton>
              </NoneShowMobile>
              <NoneShowMobile style={{ width: '100%' }}>
                {themeCategoryList[0]?.product_categories && themeCategoryList[0]?.product_categories.map((item1, idx1) => (
                  <>
                    {item1?.is_show_header_menu == 1 &&
                      <>
                        <CategoryMenuContainer theme={theme}>
                          <CategoryMenu
                            theme={theme}
                            is_page_category={isPageCategory(item1?.id) ? 1 : 0}
                            onClick={() => {
                              router.push(`/shop/items?category_id0=${item1?.id}&depth=0`)
                            }}>
                            <div>{item1.category_name}</div>
                          </CategoryMenu>
                        </CategoryMenuContainer>
                      </>}
                  </>
                ))}
                <TextField
                  label='통합검색'
                  size='small'
                  variant="standard"
                  onChange={(e) => {
                    setKeyword(e.target.value)
                  }}
                  value={keyword}
                  sx={{ margin: '0 1rem 0 2rem', maxWidth: '300px', marginLeft: 'auto', paddingBottom: '0.5rem' }}
                  onKeyPress={(e) => {
                    if (e.key == 'Enter') {
                      onSearch();
                    }
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => onSearch()}
                          aria-label='toggle password visibility'
                        >
                          <Icon icon={'tabler:search'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                />
              </NoneShowMobile>
            </CategoryContainer>
          </Wrappers>
        </>}
      <BottomMenuContainer style={{
        background: `${themeMode == 'dark' ? '#000' : '#fff'}`
      }}>
        <MenuContainer>
          <OneMenuContainer
            onClick={() => { }}
          >
            <Icon icon={'carbon:search'} fontSize={'1.5rem'} style={{ marginTop: 'auto' }} />
            <OneMenuName>
              {'검색'}
            </OneMenuName>
          </OneMenuContainer>
          <OneMenuContainer
            onClick={() => { }}
          >
            <Icon icon={'ri:menu-line'} fontSize={'1.5rem'} style={{ marginTop: 'auto' }} />
            <OneMenuName>
              {'메뉴'}
            </OneMenuName>
          </OneMenuContainer>
          <OneMenuContainer
            onClick={() => router.push('/shop')}
          >
            <Icon icon={'solar:home-2-linear'} fontSize={'1.3rem'} style={{ marginTop: 'auto' }} />
            <OneMenuName>
              {'홈'}
            </OneMenuName>
          </OneMenuContainer>
          <OneMenuContainer
            onClick={() => {
              if (user) {
                router.push(`/shop/auth/cart`)
              } else {
                router.push(`/shop/auth/login`)
              }
            }}
          >
            <Icon icon={'ion:cart-outline'} fontSize={'1.5rem'} style={{ marginTop: 'auto' }} />
            <OneMenuName>
              {'장바구니'}
            </OneMenuName>
          </OneMenuContainer>
          <OneMenuContainer
            onClick={() => { router.push('/shop/auth/my-page') }}
          >
            <Icon icon={'carbon:user'} fontSize={'1.5rem'} style={{ marginTop: 'auto' }} />
            <OneMenuName>
              {'마이페이지'}
            </OneMenuName>
          </OneMenuContainer>
        </MenuContainer>
      </BottomMenuContainer>
      <PaddingTop />
      <Dialog
        open={dialogMenuOpen}
        onClose={() => {
          setDialogMenuOpen(false);
        }}
        PaperProps={{
          style: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
      </Dialog>
    </>
  )
}

export default Header
