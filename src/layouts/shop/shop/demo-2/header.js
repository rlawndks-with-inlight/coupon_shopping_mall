
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
import { formatLang } from "src/utils/format"
import { useLocales } from "src/locales"
import DialogSearch from "src/components/dialog/DialogSearch"
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext"
import LanguagePopover from "src/layouts/manager/header/LanguagePopover"
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
/* 기존 2rem(32px)은 카테고리가 몇 개만 있어도 화면을 잡아먹어 '너무 크다'는 피드백을 받았다. */
font-size: 1.25rem;
font-weight: bold;
cursor: pointer;
@media (max-width:1000px) {
  font-size: 1.05rem;
}
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
  // 포인트 비노출 — 적립·차감이 완성되지 않아 항상 0 P 로만 보인다(demo-5 헤더와 동일 처리).
  /*{
    name: '포인트내역',
    link_key: 'point'
  },*/
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
  // themeDnsData: 언어 선택 UI 노출 조건(setting_obj.is_use_lang) 확인용
  const { themeMode, onToggleMode, onChangeCartData, onChangeWishData, themePostCategoryList, themeCategoryList, themeDnsData } = useSettingsContext();
  const headerCategories = (themeCategoryList ?? []).flatMap((g) => g?.product_categories ?? []);
  const { user, logout } = useAuthContext();
  const { currentLang } = useLocales();
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
  }, [headerWrappersRef.current, menuButtonRef.current, , themeCategoryList])
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
              router.push(`/shop/items?category_id=${item?.id}`)
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
            ref={headerWrappersRef}
          >
            <NoneShowMobile style={{ borderBottom: `1px solid ${theme.palette.grey[300]}` }}>
              <TopMenuContainer style={{ padding: '0.5rem 0' }}>
                <Row style={{ marginLeft: 'auto', columnGap: '1rem' }}>
                  {/* 고객센터는 로그인 여부와 무관하게 보여야 한다.
                      예전엔 이 버튼이 비로그인 분기 '안에만' 있어서, 로그인하는 순간 사라졌다.
                      정작 1:1문의는 회원 기능이라 필요한 사람에게 입구가 없는 상태였다.
                      (모바일은 사이드메뉴, PC 전체메뉴는 다이얼로그에 따로 있다 — 여기는 PC 상단 바) */}
                  {
                    themePostCategoryList.length > 0 &&
                    <Button sx={{ height: '24px' }} onClick={() => router.push(`/shop/service/${themePostCategoryList[0]?.id}`)}>고객센터</Button>
                  }
                  {user ?
                    <>
                      <Button sx={{ height: '24px' }} onClick={() => router.push('/shop/auth/my-page')}>마이페이지</Button>
                      <Button sx={{ height: '24px' }} onClick={() => router.push('/shop/auth/history')}>주문내역</Button>
                      <Button variant="outlined" sx={{ height: '24px' }} onClick={() => {
                        onLogout();
                      }}>로그아웃</Button>
                    </>
                    :
                    <>
                      <Button sx={{ height: '24px' }} onClick={() => router.push('/shop/auth/sign-up')}>회원가입</Button>
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
              {/* 검색순위 블록(아래 주석)을 내리면서 우측을 채우던 marginLeft:auto 요소가 사라졌다.
                  PC에서 검색창·아이콘 묶음이 좌측에 몰리지 않도록 여기서 우측 정렬을 받는다. */}
              <NoneShowMobile style={{ marginLeft: 'auto' }}>
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
                    // 장바구니는 비회원도 사용한다(localStorage 저장 + 주문서가 비회원 주문 지원).
                    // 기존엔 비회원을 로그인으로 튕겨 비회원 구매 자체가 불가능했다. 찜하기는 회원 전용 유지.
                    router.push(`/shop/auth/cart`)
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
                {/* 언어 선택 — 이 헤더엔 언어 UI 가 없어 설정을 켜도 고객이 언어를 바꿀 수 없었다.
                    (shop demo-1 헤더와 동일하게 PC·모바일 아이콘 묶음 양쪽에 넣는다) */}
                {themeDnsData?.setting_obj?.is_use_lang == 1 && <LanguagePopover />}
              </NoneShowMobile>
              {/* 실시간 검색순위 — '티셔츠/바지/양말'이 하드코딩된 데모용 UI라 비노출 처리.
                  실제 검색어 집계 기능이 아니라 고정 문자열 3개를 돌리는 것이었음.
                  되살리려면 아래 주석과 상단 ranking_text_list 를 함께 복구할 것. */}
              {/*
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
              */}
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
                    // 장바구니는 비회원도 사용한다(localStorage 저장 + 주문서가 비회원 주문 지원).
                    // 기존엔 비회원을 로그인으로 튕겨 비회원 구매 자체가 불가능했다. 찜하기는 회원 전용 유지.
                    router.push(`/shop/auth/cart`)
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
                {themeDnsData?.setting_obj?.is_use_lang == 1 && <LanguagePopover />}
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
                {headerCategories.length > 0 && headerCategories.map((item1, idx1) => (
                  <>
                    {item1?.is_show_header_menu == 1 &&
                      <>
                        <CategoryMenuContainer
                          theme={theme}
                          className={`menu-${item1?.id}`}
                        >
                          <CategoryMenu
                            theme={theme}
                            is_page_category={isPageCategory(item1?.id) ? 1 : 0}
                            onClick={() => {
                              router.push(`/shop/items?category_id=${item1?.id}`)
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
                      </>}
                  </>
                ))}
              </NoneShowMobile>
              <ShowMobile style={{
                whiteSpace: 'nowrap',
                overflowX: 'auto'
              }}
                className="none-scroll"
              >
                {headerCategories.length > 0 && headerCategories.map((item1, idx1) => (
                  <>
                    {item1?.is_show_header_menu == 1 &&
                      <>
                        <CategoryMenu borderColor={themeMode == 'dark' ? '#fff' : '#000'} themeMode={themeMode} theme={theme} onMouseOver={() => {
                          onHoverCategory(`hover_${item1?.id}`)
                        }}
                          onClick={() => {
                            router.push(`/shop/items?category_id=${item1?.id}`)
                          }}
                        >
                          <div>{item1.category_name}</div>
                        </CategoryMenu>
                      </>}
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
          {/* 전체메뉴는 '대분류(최상위 카테고리) → 하위' 로 보여준다.
              기존엔 카테고리 그룹 이름을 제목으로 찍었는데, 그룹은 원래 '분류축'이라
              가맹점이 만든 대분류가 화면에 드러나지 않았다. 단일 트리 전환 후에는
              그룹이 '카테고리' 하나로 합성되어 제목이 무의미해지기도 한다. */}
          {headerCategories.map((category, index) => (
            <>
              <DialogMenuTitle onClick={() => {
                router.push(`/shop/items?category_id=${category?.id}`);
                setDialogMenuOpen(false);
              }}>{formatLang(category, 'category_name', currentLang)}</DialogMenuTitle>
              <Row style={{ flexWrap: 'wrap', padding: '0.5rem', columnGap: '1rem', rowGap: '1rem' }}>
                {category?.children && category?.children.map((child) => (
                  <>
                    <DialogMenuContent onClick={() => {
                      router.push(`/shop/items?category_id=${child?.id}`);
                      setDialogMenuOpen(false);
                    }}>{formatLang(child, 'category_name', currentLang)}</DialogMenuContent>
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
                    }}>{item?.post_category_title}</DialogMenuContent>
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
        variant="persistent"
        anchor={'left'}
        open={sideMenuOpen}
        onClose={() => {
          setSideMenuOpen(false);
        }}
        PaperProps={{ style: { zIndex: 1300 } }}
        style={{
        }}
      >
        <div onClick={() => setSideMenuOpen(false)} style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px 14px', cursor: 'pointer', fontSize: '24px', lineHeight: 1, color: '#333' }}>✕</div>
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
            {headerCategories.length > 0 && headerCategories.map((item1, idx) => (
              <>
                {returnSidebarMenu(item1, 0, {
                  router,
                  setSideMenuOpen
                })}
              </>
            ))}
          </TreeView>
          {/* 고객센터(공지사항·1:1문의).
              예전엔 이 구간이 통째로 주석이었다. 존재하지 않는 변수 postCategories 를
              참조하고 있어서 살리면 ReferenceError 가 났기 때문으로 보인다.
              그 결과 모바일 폭(≤1000px)에서는 게시판으로 갈 방법이 아예 없었다 —
              PC 전체메뉴 다이얼로그에만 있었고 모바일 사이드메뉴에는 없었다.
              실제 변수(themePostCategoryList)로 되살린다. PC 다이얼로그와 같은 목록이다.
              ※ 이 파일에는 translate 가 없다(useLocales 에서 currentLang 만 받는다).
                 주변 live 코드와 동일하게 한글 문자열을 그대로 쓴다. */}
          {themePostCategoryList.length > 0 &&
            <>
              <ColumnMenuTitle>고객센터</ColumnMenuTitle>
              {themePostCategoryList.map((item, idx) => (
                <ColumnMenuContent key={item?.id ?? idx} onClick={() => {
                  router.push(`/shop/service/${item.id}`);
                  setSideMenuOpen(false);
                }} style={{ paddingLeft: '1rem' }}>{formatLang(item, 'post_category_title', currentLang)}</ColumnMenuContent>
              ))}
            </>
          }
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
          router.push(`/shop/items?category_id=${item?.id}`);
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
