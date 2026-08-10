import Logo from "src/components/logo/Logo"
import styled from "styled-components"
import { IconButton, TextField, InputAdornment, Drawer, Button, Dialog } from "@mui/material"
import { forwardRef, useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { Col, Row, themeObj } from 'src/components/elements/styled-components'
import { useTheme } from '@mui/material/styles';
import { useSettingsContext } from "src/components/settings"
import { useRouter } from "next/router"
import { TreeItem, TreeView } from "@mui/lab"
import { getAllIdsWithParents } from "src/utils/function"
import DialogSearch from "src/components/dialog/DialogSearch"
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext"
import { logoSrc } from "src/data/data"
import { formatLang } from 'src/utils/format';

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
const DialogMenuTitle = styled.div`
color:#fff;
border-bottom: 1px solid #fff;
padding: 0.5rem;
font-size: 2rem;
font-weight: bold;
`
const DialogMenuContent = styled.div`
color:#fff;
cursor: pointer;
width: 15%;
font-weight: bold;
padding: 1rem;
`
const authList = [
  {
    name: '장바구니',
    link_key: 'cart'
  },
  {
    name: '찜목록',
    link_key: 'wish'
  },
  {
    name: '포인트내역',
    link_key: 'point'
  },
  {
    name: '주문내역',
    link_key: 'history'
  },
  {
    name: '마이페이지',
    link_key: 'my-page'
  },
]
const noneAuthList = [
  {
    name: '로그인',
    link_key: 'login'
  },
  {
    name: '회원가입',
    link_key: 'sign-up'
  },
  {
    name: '비회원 주문조회',
    link_key: 'order-check'
  },
]
const Header = () => {

  const router = useRouter();
  const theme = useTheme();
  const { themeMode, onToggleMode, onChangeCartData, onChangeWishData, themeCategoryList, themePostCategoryList } = useSettingsContext();
  const headerCategories = (themeCategoryList ?? []).flatMap((g) => g?.product_categories ?? []);
  const { user, logout } = useAuthContext();
  const [keyword, setKeyword] = useState("");
  const onSearch = () => {
    router.push(`/shop/search?keyword=${keyword}`)
  }
  const [hoverItems, setHoverItems] = useState({

  })
  const [dialogMenuOpen, setDialogMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
  }, [user])
  useEffect(() => {
    setLoading(true);
    let hover_list = getAllIdsWithParents(headerCategories);
    let hover_items = {};
    for (var i = 0; i < hover_list.length; i++) {
      hover_list[i] = hover_list[i].join('_');
      hover_items[`hover_${hover_list[i]?.id}`] = false;
    }
    hover_items['service'] = false;
    setHoverItems(hover_items);
    setLoading(false);
  }, [])
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
    let parent_list = getAllIdsWithParents(headerCategories);
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
                      <Button sx={{ height: '24px' }} onClick={() => router.push('/shop/auth/history')}>주문내역</Button>
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
                {headerCategories.length > 0 && headerCategories.map((item1, idx1) => (
                  <>
                    {item1?.is_show_header_menu == 1 &&
                      <>
                        <CategoryMenuContainer theme={theme}>
                          <CategoryMenu
                            theme={theme}
                            is_page_category={isPageCategory(item1?.id) ? 1 : 0}
                            onClick={() => {
                              router.push(`/shop/items?category_id=${item1?.id}`)
                            }}>
                            <div>{formatLang(item1, 'category_name')}</div>
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
            onClick={() => {
              setDialogOpenObj({
                ...dialogOpenObj,
                ['search']: true
              })
            }}
          >
            <Icon icon={'carbon:search'} fontSize={'1.5rem'} style={{ marginTop: 'auto' }} />
            <OneMenuName>
              {'검색'}
            </OneMenuName>
          </OneMenuContainer>
          <OneMenuContainer
            onClick={() => setDialogMenuOpen(true)}
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
        BackdropProps={{
          style: {
            background: `${theme.palette.primary.main}dd`,
          }
        }}
        PaperProps={{
          style: {
            background: 'transparent',
            maxWidth: '1150px',
            overflow: 'hidden',
            boxShadow: 'none',
            borderRadius: 'none',
          },
        }}
      >
        <div style={{ position: 'fixed', top: '16px', right: '16px', cursor: 'pointer', zIndex: 10 }} onClick={() => {
          setDialogMenuOpen(false);
        }}>
          <Icon icon={'mdi:close-box'} style={{ fontSize: '50px', color: '#fff' }} />
        </div>
        <Col style={{ width: '90vw', background: 'transparent', maxHeight: '55vh', overflowY: 'auto' }} className="none-scroll">
          {themeCategoryList.map((group, index) => (
            <>
              <DialogMenuTitle>{formatLang(group, 'category_group_name')}</DialogMenuTitle>
              <Row style={{ flexWrap: 'wrap', padding: '0.5rem', columnGap: '1rem', rowGap: '1rem' }}>
                {group?.product_categories && group?.product_categories.map((category) => (
                  <>
                    <DialogMenuContent onClick={() => {
                      router.push(`/shop/items?category_id=${category?.id}`);
                      setDialogMenuOpen(false);
                    }}>{formatLang(category, 'category_name')}</DialogMenuContent>
                  </>
                ))}
              </Row>
            </>
          ))}
          {
            themePostCategoryList.length > 0 &&
            <>
              <DialogMenuTitle style={{ marginTop: '1rem' }}>고객센터</DialogMenuTitle>
              <Row style={{ flexWrap: 'wrap', padding: '0.5rem', columnGap: '1rem', rowGap: '1rem' }}>
                {themePostCategoryList.map((item, idx) => (
                  <>
                    <DialogMenuContent onClick={() => {
                      router.push(`/shop/service/${item.id}`);
                      setDialogMenuOpen(false);
                    }}>{formatLang(item, 'post_category_title')}</DialogMenuContent>
                  </>
                ))}
              </Row>
            </>
          }
          <DialogMenuTitle style={{ marginTop: '1rem' }}>마이페이지</DialogMenuTitle>
          <Row style={{ flexWrap: 'wrap', padding: '0.5rem', columnGap: '1rem', rowGap: '1rem' }}>
            {user ?
              <>
                {authList.map((item, idx) => (
                  <>
                    <DialogMenuContent onClick={() => {
                      router.push(`/shop/auth/${item.link_key}`);
                      setDialogMenuOpen(false);
                    }}>{item.name}</DialogMenuContent>
                  </>
                ))}
                <DialogMenuContent onClick={() => {
                  logout();
                  onChangeCartData([]);
                  onChangeWishData([]);
                  router.push('/shop/auth/login');
                  setDialogMenuOpen(false);
                }} >로그아웃</DialogMenuContent>
              </>
              :
              <>
                {noneAuthList.map((item, idx) => (
                  <>
                    <DialogMenuContent onClick={() => {
                      router.push(`/shop/auth/${item.link_key}`);
                      setDialogMenuOpen(false);
                    }}>{item?.name}</DialogMenuContent>
                  </>
                ))}
              </>}
          </Row>
        </Col>
      </Dialog>
    </>
  )
}

export default Header
