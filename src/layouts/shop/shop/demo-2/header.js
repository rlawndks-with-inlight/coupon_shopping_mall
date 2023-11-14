
import styled from "styled-components"
import { IconButton, TextField, InputAdornment, Drawer, Button, Chip, Dialog } from "@mui/material"
import { forwardRef, useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { Col, Row, Title, themeObj } from 'src/components/elements/styled-components'
import { useTheme } from '@mui/material/styles';
import { useSettingsContext } from "src/components/settings"
import { useRouter } from "next/router"
import { TreeItem, TreeView } from "@mui/lab"
import { getAllIdsWithParents } from "src/utils/function"
import DialogSearch from "src/components/dialog/DialogSearch"
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext"
import { logoSrc } from "src/data/data"
import Slider from "react-slick"
import { useRef } from "react"

const Wrappers = styled.header`
width: 100%;
position: fixed;
top: 0;
display: flex;
flex-direction: column;
z-index: 10;
border-bottom:1px solid ${themeObj.grey[300]};
padding-bottom: 0.5rem;
@media (max-width:1000px) {
  border-bottom:none;
  padding-bottom: 0;
}
`
const TopMenuContainer = styled.div`
display:flex;
padding: 1rem 0;
max-width: 1600px;
width:90%;
margin: 0 auto;
align-items:center;
position:relative;
@media (max-width:1600px) {
  padding: 0.5rem 0;
}
`
const CategoryContainer = styled.div`
max-width: 1500px;
width:90%;
margin: 0 auto;
display:flex;
align-items:center;
position:relative;
`
const CategoryMenuContainer = styled.div`
position:relative;
transition: 0.5s;

&:hover{
  color:#fff;
  background: ${props => props.theme?.palette?.primary?.main};
}
`
const CategoryMenu = styled.div`
padding:0.25rem;
text-align: center;
display:inline-block;
text-transform:uppercase;
margin:0 0.25rem;
cursor:pointer;
font-weight:bold;
position:relative;
font-size:${themeObj.font_size.size7};
color:${props => props.is_page_category == 1 ? (props => props.theme?.palette?.primary?.main) : ''};
&:hover{
  color:#fff;
}
@media (max-width:1000px) {
  padding:0.5rem;
  &:hover{
    color:${props => props.theme?.palette?.primary?.main};
    background: ${props => props.themeMode == 'dark' ? '#000' : '#fff'};
  }
}
`

const NoneShowMobile = styled.div`
display: flex;
align-items:center;
@media (max-width:1000px) {
  display: none;
}
`
const ShowMobile = styled.div`
display: none;
align-items:center;
@media (max-width:1000px) {
  display: flex;
}
`
const PaddingTop = styled.div`
margin-top:${props => props.pcHeight}px;
@media (max-width:1000px) {
  margin-top:96px;
}
`

const DropDownMenuContainer = styled.div`
position: absolute;
top:32px;
z-index:10;
left: 0px;
visibility: hidden;
opacity: 0;
text-align:left;
padding:0.5rem;
background: ${props => props.theme.palette.primary.main};
transition: 0.5s;
.menu-${props => props.parentId}:hover & {
  visibility: visible;
  opacity: 1;
}
`
const DropDownMenu = styled.div`
width:136px;
padding:0.25rem;
display:flex;
justify-content:space-between;
position: relative;
cursor:pointer;
color:#fff;

`
const SubDropDownMenuContainer = styled.div`
position: absolute;
left: 136px;
top:0;
display: none;
text-align:left;
padding:0.5rem;
width:154px;
flex-direction:column;
background: ${props => props.theme.palette.primary.main};
box-shadow: 0px 4px 4px #00000029;
.menu-${props => props.parentId}:hover & {
  display: flex;
}
`
const SubSubDropDownMenuContainer = styled.div`
position: absolute;
left: 136px;
top:0;
display: none;
text-align:left;
padding:0.5rem;
width:154px;
flex-direction:column;
background: ${props => props.theme.palette.primary.main};
box-shadow: 0px 4px 4px #00000029;
.menu-${props => props.parentId}:hover & {
  display: flex;
}
`
const LogoImg = styled.img`
height: 40px;
width: auto;
cursor: pointer;
@media (max-width:1000px) {
  position:absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
@media (max-width:300px) {
  width:52px;
  height:auto;
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
const ranking_text_list = [
  '티셔츠',
  '바지',
  '양말',
]
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
    link_key: 'login?scroll_to=100000'
  },
]
const Header = () => {

  const router = useRouter();
  const theme = useTheme();
  const { themeMode, onToggleMode, onChangeCartData, onChangeWishData, themePostCategoryList, themeCategoryList } = useSettingsContext();
  const { user, logout } = useAuthContext();
  const [keyword, setKeyword] = useState("");
  const onSearch = () => {
    router.push(`/shop/search?keyword=${keyword}`)
  }
  const menuButtonRef = useRef();
  const headerWrappersRef = useRef();
  const [headerHeight, setHeaderHeight] = useState(130);
  const [hoverItems, setHoverItems] = useState({

  })
  const [dialogMenuOpen, setDialogMenuOpen] = useState(false);
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true);
  const [menuButtonLocation, setMenuButtonLocation] = useState({
    top: 0,
    left: 0
  })
  useEffect(() => {
    setHeaderHeight(headerWrappersRef.current?.clientHeight ?? 130);
    let getBoundingClientRect = menuButtonRef.current?.getBoundingClientRect();
    setMenuButtonLocation({
      top: getBoundingClientRect?.top ?? 0,
      left: getBoundingClientRect?.left ?? 0,
    });
  }, [headerWrappersRef.current, categories, menuButtonRef.current])
  useEffect(() => {
    setLoading(true);
    setCategories(themeCategoryList[0]?.product_categories ?? []);
    let hover_list = getAllIdsWithParents(themeCategoryList[0]?.product_categories ?? []);
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

  const returnDropdownMenu = (item, num) => {
    return (
      <>
        <div style={{ position: 'relative' }} className={`menu-${item?.id}`}>
          <DropDownMenu theme={theme}
            onClick={() => {
              router.push(`/shop/items?category_id0=${item?.id}&depth=${num}`)
            }}>
            <div>{item.category_name}</div>
            <div>{item.children.length > 0 ? '>' : ''}</div>
          </DropDownMenu>
          {item.children.length > 0 ?
            <>
              {num == 1 ?
                <>
                  <SubDropDownMenuContainer parentId={item?.id} theme={theme}>
                    {item.children.map((item2, idx) => (
                      <>
                        {returnDropdownMenu(item2, num + 1)}
                      </>
                    ))}
                  </SubDropDownMenuContainer>
                </>
                :
                ''}
              {num == 2 ?
                <>
                  <SubSubDropDownMenuContainer parentId={item?.id} theme={theme}
                    style={{
                    }}>
                    {item.children.map((item2, idx) => (
                      <>
                        {returnDropdownMenu(item2, num + 1)}
                      </>
                    ))}
                  </SubSubDropDownMenuContainer>
                </>
                :
                ''}
            </>
            :
            <>
            </>}
        </div>
      </>
    )
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
  const onLogout = async () => {
    let result = await logout();
    onChangeCartData([]);
    onChangeWishData([]);
    if (result) {
      router.push('/shop/auth/login');
    }
  }
  const text_setting = {
    infinite: true,
    speed: 500,
    autoplay: true,
    autoplaySpeed: 2500,
    slidesToShow: 1,
    slidesToScroll: 1,
    dots: false,
    vertical: true,
  }
  const isPageCategory = (id) => {
    let parent_list = getAllIdsWithParents(categories);
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
        root_path={'shop'}
      />
      {loading ?
        <>
        </>
        :
        <>
          <Wrappers style={{
            background: `${themeMode == 'dark' ? '#000' : '#fff'}`
          }}
            ref={headerWrappersRef}
          >
            <NoneShowMobile style={{ borderBottom: `1px solid ${theme.palette.grey[300]}` }}>
              <TopMenuContainer style={{ padding: '0.5rem 0' }}>
                <Row style={{ marginLeft: 'auto', columnGap: '1rem' }}>
                  {user ?
                    <>
                      <Button sx={{ height: '24px' }} onClick={() => router.push('/shop/auth/my-page')}>마이페이지</Button>
                      <Button sx={{ height: '24px' }} onClick={() => router.push('/shop/service/history')}>주문내역</Button>
                      <Button variant="outlined" sx={{ height: '24px' }} onClick={() => {
                        onLogout();
                      }}>로그아웃</Button>
                    </>
                    :
                    <>
                      <Button sx={{ height: '24px' }} onClick={() => router.push('/shop/auth/sign-up')}>회원가입</Button>
                      <Button sx={{ height: '24px' }} onClick={() => router.push(`/shop/service/${themePostCategoryList[0]?.id}`)}>고객센터</Button>
                      <Button variant="outlined" sx={{ height: '24px' }} onClick={() => router.push('/shop/auth/login')}>로그인</Button>
                    </>}
                </Row>
              </TopMenuContainer>
            </NoneShowMobile>
            <TopMenuContainer>
              <ShowMobile style={{ margin: '0 auto 0 -0.5rem' }}>
                <IconButton
                  sx={iconButtonStyle}
                  onClick={() => setSideMenuOpen(true)}
                >
                  <Icon icon={'iconamoon:menu-burger-horizontal-thin'} fontSize={'1.9rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />

                </IconButton>
                <IconButton
                  sx={iconButtonStyle}
                  onClick={() => {
                    setDialogOpenObj({
                      ...dialogOpenObj,
                      ['search']: true
                    })
                  }}
                >
                  <Icon icon={'iconamoon:search-thin'} fontSize={'1.7rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                </IconButton>
              </ShowMobile>
              <LogoImg src={logoSrc()}
                onClick={() => {
                  router.push('/shop')
                }}
              />
              <NoneShowMobile>
                <TextField
                  label='통합검색'
                  id='size-small'
                  size='small'
                  onChange={(e) => {
                    setKeyword(e.target.value)
                  }}
                  value={keyword}
                  sx={{ margin: '0 1rem 0 2rem', maxWidth: '300px' }}
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
                <IconButton
                  sx={{ ...iconButtonStyle, marginRight: '0.5rem' }}
                  onClick={() => {
                    if (user) {
                      router.push(`/shop/auth/wish`)
                    } else {
                      router.push(`/shop/auth/login`)
                    }
                  }}
                >
                  <Icon icon={'ph:heart-thin'} fontSize={'2.8rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                </IconButton>
                <IconButton
                  sx={{ ...iconButtonStyle, marginRight: '0.5rem' }}
                  onClick={() => {
                    if (user) {
                      router.push(`/shop/auth/cart`)
                    } else {
                      router.push(`/shop/auth/login`)
                    }
                  }}
                >
                  <Icon icon={'ph:shopping-bag-open-thin'} fontSize={'2.8rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                </IconButton>
                <IconButton
                  sx={iconButtonStyle}
                  onClick={() => onToggleMode()}
                >
                  <Icon icon={themeMode === 'dark' ? 'ph:sun-thin' : 'ph:moon-stars-thin'} fontSize={'2.8rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                </IconButton>
              </NoneShowMobile>
              <NoneShowMobile style={{ marginLeft: 'auto' }}>
                <div>
                  <Slider {...text_setting} style={{ width: '200px' }}>
                    {ranking_text_list.map((text, idx) => (
                      <>
                        <Row style={{ columnGap: '0.5rem', cursor: 'pointer' }}>
                          <Chip label={idx + 1} size="small" variant="outlined" />
                          <div>{text}</div>
                        </Row>
                      </>
                    ))}
                  </Slider>
                </div>
              </NoneShowMobile>
              <ShowMobile style={{ marginLeft: 'auto' }}>
                <IconButton
                  sx={iconButtonStyle}
                  onClick={() => {
                    if (user) {
                      router.push(`/shop/auth/wish`)
                    } else {
                      router.push(`/shop/auth/login`)
                    }
                  }}
                >
                  <Icon icon={'ph:heart-thin'} fontSize={'1.8rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                </IconButton>
                <IconButton
                  sx={iconButtonStyle}
                  onClick={() => {
                    if (user) {
                      router.push(`/shop/auth/cart`)
                    } else {
                      router.push(`/shop/auth/login`)
                    }
                  }}
                >
                  <Icon icon={'ph:shopping-bag-open-thin'} fontSize={'1.8rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                </IconButton>

                <IconButton
                  sx={iconButtonStyle}
                  onClick={() => onToggleMode()}
                >
                  <Icon icon={themeMode === 'dark' ? 'ph:sun-thin' : 'ph:moon-stars-thin'} fontSize={'1.8rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                </IconButton>
              </ShowMobile>
            </TopMenuContainer>
            <CategoryContainer>
              <NoneShowMobile>
                <IconButton
                  ref={menuButtonRef}
                  onClick={() => setDialogMenuOpen(true)}
                  sx={{ marginRight: '1rem' }}
                >
                  <Icon icon={'oi:menu'} fontSize={'2rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                </IconButton>
              </NoneShowMobile>
              <NoneShowMobile style={{ width: '100%', flexWrap: 'wrap' }}>
                {categories && categories.map((item1, idx1) => (
                  <>
                    <CategoryMenuContainer
                      theme={theme}
                      className={`menu-${item1?.id}`}
                    >
                      <CategoryMenu
                        theme={theme}
                        is_page_category={isPageCategory(item1?.id) ? 1 : 0}
                        onClick={() => {
                          router.push(`/shop/items?category_id0=${item1?.id}&depth=0`)
                        }}>
                        {item1.category_name}
                      </CategoryMenu>
                      {item1?.children.length > 0 &&
                        <>
                          <DropDownMenuContainer parentId={item1?.id} theme={theme} style={{
                            width: `${item1.category_img ? '430px' : '144px'}`,
                            fontSize: themeObj.font_size.size8,
                            fontWeight: 'normal',
                          }}>
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              width: '154px'
                            }}>
                              {item1?.children.map((item2, idx2) => (
                                <>
                                  {returnDropdownMenu(item2, 1)}
                                </>
                              ))}
                            </div>
                            {item1.category_img ?
                              <>
                                <img src={item1.category_img} style={{ height: 'auto', width: '270px' }} />
                              </>
                              :
                              <>
                              </>}
                          </DropDownMenuContainer>
                        </>}
                    </CategoryMenuContainer>
                  </>
                ))}
              </NoneShowMobile>
              <ShowMobile style={{
                whiteSpace: 'nowrap',
                overflowX: 'auto'
              }}
                className="none-scroll"
              >
                {categories.map((item1, idx1) => (
                  <>
                    <CategoryMenu borderColor={themeMode == 'dark' ? '#fff' : '#000'} themeMode={themeMode} theme={theme} onMouseOver={() => {
                      onHoverCategory(`hover_${item1?.id}`)
                    }}
                      onClick={() => {
                        router.push(`/shop/items?category_id0=${item1?.id}&depth=0`)
                      }}
                    >
                      <div>{item1.category_name}</div>
                    </CategoryMenu>
                  </>
                ))}
              </ShowMobile>
              <NoneShowMobile style={{
                marginLeft: 'auto'
              }}>
              </NoneShowMobile>
            </CategoryContainer>
          </Wrappers>
        </>}
      <PaddingTop pcHeight={headerHeight} />

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
          }
        }}
      >
        <div style={{ ...menuButtonLocation, position: 'fixed', cursor: 'pointer' }} onClick={() => {
          setDialogMenuOpen(false);
        }}>
          <Icon icon={'mdi:close-box'} style={{ fontSize: '50px', color: '#fff' }} />
        </div>
        <Col style={{ width: '90vw', background: 'transparent', maxHeight: '55vh', overflowY: 'auto' }} className="none-scroll">
          {themeCategoryList.map((group, index) => (
            <>
              <DialogMenuTitle>{group?.category_group_name}</DialogMenuTitle>
              <Row style={{ flexWrap: 'wrap', padding: '0.5rem', columnGap: '1rem', rowGap: '1rem' }}>
                {group?.product_categories && group?.product_categories.map((category) => (
                  <>
                    <DialogMenuContent onClick={() => {
                      router.push(`/shop/items?category_id${index}=${category?.id}&depth=0`);
                      setDialogMenuOpen(false);
                    }}>{category?.category_name}</DialogMenuContent>
                  </>
                ))}
              </Row>
            </>
          ))}
          <DialogMenuTitle style={{ marginTop: '1rem' }}>고객센터</DialogMenuTitle>
          <Row style={{ flexWrap: 'wrap', padding: '0.5rem', columnGap: '1rem', rowGap: '1rem' }}>
            {themePostCategoryList.map((item, idx) => (
              <>
                <DialogMenuContent onClick={() => {
                  router.push(`/shop/service/${item.id}`);
                  setDialogMenuOpen(false);
                }}>{item?.post_category_title}</DialogMenuContent>
              </>
            ))}
          </Row>
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
                  onLogout();
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
      <Drawer
        anchor={'left'}
        open={sideMenuOpen}
        onClose={() => {
          setSideMenuOpen(false);
        }}
        style={{
        }}
      >
        <ColumnMenuContainer style={{
          background: (themeMode == 'dark' ? '#222' : '#fff'),
          color: (themeMode == 'dark' ? '#fff' : '#000'),
        }}
          className="none-scroll"
        >
          <ColumnMenuTitle>쇼핑 카테고리</ColumnMenuTitle>
          <TreeView
            defaultCollapseIcon={<Icon icon={'ic:baseline-minus'} />}
            defaultExpandIcon={<Icon icon={'ic:baseline-plus'} />}
            defaultEndIcon={<Icon icon={'mdi:dot'} />}
          >
            {categories.map((item1, idx) => (
              <>
                {returnSidebarMenu(item1, 0, {
                  router,
                  setSideMenuOpen
                })}
              </>
            ))}
          </TreeView>
          <ColumnMenuTitle>고객센터</ColumnMenuTitle>
          {themePostCategoryList.map((item, idx) => (
            <>
              <ColumnMenuContent onClick={() => {
                router.push(`/shop/service/${item.id}`);
                setSideMenuOpen(false);
              }} style={{ paddingLeft: '1rem' }}>{item.post_category_title}</ColumnMenuContent>
            </>
          ))}
          <ColumnMenuTitle>마이페이지</ColumnMenuTitle>
          {user ?
            <>
              {authList.map((item, idx) => (
                <>
                  <ColumnMenuContent onClick={() => {
                    router.push(`/shop/auth/${item.link_key}`);
                    setSideMenuOpen(false);
                  }} style={{ paddingLeft: '1rem' }}>{item.name}</ColumnMenuContent>
                </>
              ))}
              <ColumnMenuContent onClick={() => {
                onLogout();
                setSideMenuOpen(false);
              }} style={{ paddingLeft: '1rem' }}>로그아웃</ColumnMenuContent>
            </>
            :
            <>
              {noneAuthList.map((item, idx) => (
                <>
                  <ColumnMenuContent onClick={() => {
                    router.push(`/shop/auth/${item.link_key}`);
                    setSideMenuOpen(false);
                  }} style={{ paddingLeft: '1rem' }}>{item.name}</ColumnMenuContent>
                </>
              ))}
            </>}

        </ColumnMenuContainer>
      </Drawer>
    </>
  )
}
const returnSidebarMenu = (item, num, func) => {
  const {
    router,
    setSideMenuOpen
  } = func;
  return (
    <>
      <TreeItem label={<div
        style={{
          marginLeft: '0.25rem'
        }}
        onClick={() => {
          router.push(`/shop/items?category_id0=${item?.id}&depth=${num}`);
          setSideMenuOpen(false);
        }}>{item.category_name}</div>}
        nodeId={item.id}
        style={{ margin: '0.25rem 0' }}
      >
        {item.children.length > 0 &&
          <>
            {item.children.map((item2, idx) => (
              <>
                {returnSidebarMenu(item2, num + 1, func)}
              </>
            ))}
          </>}
      </TreeItem>
    </>
  )
}
const ColumnMenuContainer = styled.div`
        width: 400px;
        padding:0 2rem 4rem 2rem;
        height:100vh;
        overflow-y:auto;
        display:flex;
        flex-direction:column;
        @media (max-width:800px){
          width: 70vw;
        padding:0 5vw 4rem 5vw;
}
`
const ColumnMenuTitle = styled.div`
        margin: 2rem 0 0.5rem 0;
        font-weight: bold;
`
const ColumnMenuContent = styled.div`
        display:flex;
        align-items:center;
        padding:0.25rem 0;
        cursor:pointer;
`
const iconButtonStyle = {
  padding: '0.1rem',
  marginLeft: '0.2rem'
}
export default Header
