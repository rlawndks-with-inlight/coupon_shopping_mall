import Logo from "src/components/logo/Logo"
import styled from "styled-components"
import { IconButton, TextField, InputAdornment, Drawer, Badge } from "@mui/material"
import { forwardRef, Fragment, useEffect, useRef, useState } from "react"
import { Icon } from "@iconify/react"
import { Row, themeObj } from 'src/components/elements/styled-components'
import { useTheme } from '@mui/material/styles';
import { useSettingsContext } from "src/components/settings"
import { test_categories } from "src/data/test-data"
import { useRouter } from "next/router"
import { TreeItem, TreeView } from "@mui/lab"
import { getAllIdsWithParents, returnMoment } from "src/utils/function"
import DialogSearch from "src/components/dialog/DialogSearch"
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext"
import { logoSrc } from "src/data/data"
import $ from 'jquery'
import dynamic from 'next/dynamic';
import LanguagePopover from "src/layouts/manager/header/LanguagePopover"
import { useLocales } from "src/locales"
import { formatLang } from "src/utils/format"
import { isStorefrontHome } from "src/utils/blog-shop-route";
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p></p>,
})
const Wrappers = styled.header`
width: 100%;
position: fixed;
top: 0;
display: flex;
flex-direction: column;
z-index: 10;
`
const TopMenuContainer = styled.div`
display:flex;
padding: 1rem 0;
max-width: 1400px;
width:90%;
margin: 0 auto;
align-items:center;
position:relative;
height:100px;
@media (max-width:1000px) {
  padding: 0.5rem 0;
}
`
const CategoryContainer = styled.div`
max-width: 1400px;
width:90%;
margin: 0 auto;
display:flex;
align-items:center;
position:relative;
`
const CategoryMenu = styled.div`
padding:1rem 1.5rem 0 1.5rem;
text-align: center;
display:inline-block;
text-transform:uppercase;
margin:0;
cursor:pointer;
font-weight:bold;
position:relative;
&::after {
  padding-bottom:1rem;
  display:block;
  content: '';
  border-bottom:2px solid ${props => props.borderColor};
  transform: scaleX(0);
  transition: transform 250ms ease-in-out;
}
&:hover:after {
  transform: scaleX(1.5);

}
@media (max-width:1000px) {
  padding:0.5rem 1.5rem 0 1.5rem;
  &::after {
    padding-bottom:0.5rem;
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
`
const AuthMenu = styled.div`
padding:0 0.5rem;
font-weight:bold;
color: ${props => props.theme.palette.grey[500]};
&:hover{
  color:${props => props.hoverColor};
}
border-right: 1px solid ${props => props.theme.palette.grey[300]};
`
const DropDownMenuContainer = styled.div`
position: absolute;
top:58px;
z-index:10;
left: -8px;
display: none;
text-align:left;
padding:0.5rem;
.menu-${props => props.parentId}:hover & {
  display: flex;
}
`
const DropDownMenu = styled.div`
width:136px;
padding:0.25rem;
transition-duration:0.5s;
display:flex;
justify-content:space-between;
position: relative;
cursor:pointer;
&:hover{
  background: ${props => props.theme.palette.grey[300]};
}
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
.menu-${props => props.parentId}:hover & {
  display: flex;
}
`
const PopupContainer = styled.div`
position:fixed;
top:16px;
left:0px;
display:flex;
flex-wrap:wrap;
z-index:20;
`
const PopupContent = styled.div`
/* 카드 배경은 테마와 무관하게 항상 흰색이다.
   글자색을 지정하지 않으면 MUI 테마 글자색(다크모드=흰색)을 물려받아
   흰 배경에 흰 글자가 되어 팝업 내용이 통째로 안 보였다. */
color:#212121;
background:#fff;
margin-right:16px;
margin-bottom:16px;
padding:24px 24px 48px 24px;
box-shadow:0px 4px 4px #00000029;
border-radius:8px;
width:300px;
min-height:200px;
position:relative;
opacity:0.95;
z-index:10;
@media screen and (max-width:400px) { 
width:78vw;
}
`

const MainLogo = styled.img`
cursor: pointer;
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);
height: 88px;
@media (max-width:768px) {
    left:20%;
    height: 66px;
}
@media (max-width:400px) {
    height: 44px;
}
`

// 2단 이하 카테고리 — 들여쓰기와 크기로만 위계를 준다(접기/펼치기 없음).
const returnSidebarLeaf = (item, depth, func, currentLang) => {
    const { router, setSideMenuOpen } = func;
    const go = () => { router.push(`/shop/items?category_id=${item?.id}`); setSideMenuOpen(false); };
    return (
        <Fragment key={item.id}>
            <ColumnMenuContent onClick={go}
                style={{ paddingLeft: `${depth}rem`, fontSize: depth >= 2 ? '0.85rem' : '0.9rem', opacity: depth >= 2 ? 0.7 : 0.85 }}>
                {formatLang(item, 'category_name', currentLang)}
            </ColumnMenuContent>
            {(item.children ?? []).map((c) => returnSidebarLeaf(c, depth + 1, func, currentLang))}
        </Fragment>
    );
};

const Header = () => {

    const router = useRouter();
    const theme = useTheme();
    const { translate, currentLang } = useLocales();
    const { themeMode, onToggleMode, themeCategoryList, themePropertyList, themeDnsData, themePopupList, themeNoneTodayPopupList, onChangeNoneTodayPopupList, themePostCategoryList, onChangePopupList, themeWishData, themeCartData, onChangeCartData, onChangeWishData, themeSellerList } = useSettingsContext();
    const headerCategories = (themeCategoryList ?? []).flatMap((g) => g?.product_categories ?? []);
    const { user, logout } = useAuthContext();
    const headerWrappersRef = useRef();
    const [headerHeight, setHeaderHeight] = useState(130);
    const [keyword, setKeyword] = useState("");
    const onSearch = () => {
        setKeyword("");
        // PC 검색은 /shop/items, 모바일 검색 다이얼로그는 /shop/search 로 갈라져 있었다(아래 DialogSearch).
        // 같은 단어로 검색해도 진입 경로에 따라 완전히 다른 화면이 떠서, 고객은 결과가
        // 왜 달라지는지 알 수 없었다. 프레임1·2 처럼 검색 전용 화면(/shop/search)으로 통일한다.
        router.push(`/shop/search?keyword=${keyword}`)
    }
    const [isAuthMenuOver, setIsAuthMenuOver] = useState(false)
    const [hoverItems, setHoverItems] = useState({

    })
    const [sideMenuOpen, setSideMenuOpen] = useState(false);
    const [popups, setPopups] = useState([]);
    const [postCategories, setPostCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const authList = [
        {
            name: translate('장바구니'),
            link_key: 'cart'
        },
        {
            name: translate('찜목록'),
            link_key: 'wish'
        },
        /*{
            name: translate('포인트내역'),
            link_key: 'point'
        },*/
        {
            name: translate('주문조회'),
            link_key: 'history'
        },
        {
            name: translate('마이페이지'),
            link_key: 'my-page'
        },
    ]
    const noneAuthList = [
        {
            name: translate('로그인'),
            link_key: 'login'
        },
        ...(themeDnsData?.id == 74 ? [] : [{
            name: translate('회원가입'),
            link_key: 'sign-up'
        }]),
        {
            name: translate('비회원 주문조회'),
            link_key: 'order-check'
        },
    ]
    useEffect(() => {
    }, [user])
    useEffect(() => {
        setHeaderHeight(headerWrappersRef.current?.clientHeight ?? 130);
    }, [headerWrappersRef.current, themeCategoryList])
    useEffect(() => {
        if (themeCategoryList) {
            settingHeader();
        }
    }, [themeCategoryList])
    const settingHeader = async () => {
        setLoading(true);
        setPopups(themePopupList)
        setPostCategories(themePostCategoryList);
        let hover_list = getAllIdsWithParents(headerCategories);
        let hover_items = {};
        for (var i = 0; i < hover_list.length; i++) {
            hover_list[i] = hover_list[i].join('_');
            hover_items[`hover_${hover_list[i]?.id}`] = false;
        }
        hover_items['service'] = false;
        setHoverItems(hover_items);
        setLoading(false);
    }
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
                        <div>{formatLang(item, 'category_name', currentLang)}</div>
                        <div>{item.children.length > 0 ? '>' : ''}</div>
                    </DropDownMenu>
                    {item.children.length > 0 ?
                        <>
                            {num == 1 ?
                                <>
                                    <SubDropDownMenuContainer parentId={item?.id}
                                        style={{
                                            background: `${themeMode == 'dark' ? '#000' : '#fff'}`,
                                            border: `1px solid ${theme.palette.grey[300]}`,
                                        }}>
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
                                    <SubSubDropDownMenuContainer parentId={item?.id}
                                        style={{
                                            background: `${themeMode == 'dark' ? '#000' : '#fff'}`,
                                            border: `1px solid ${theme.palette.grey[300]}`,
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
    const returnSidebarMenu = (item, num, func, index) => {
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
                    }}>{formatLang(item, 'category_name', currentLang)}</div>}
                    nodeId={item.id}
                    style={{ margin: '0.25rem 0' }}
                >
                    {item.children.length > 0 &&
                        <>
                            {item.children.map((item2, idx) => (
                                <>
                                    {returnSidebarMenu(item2, num + 1, func, index)}
                                </>
                            ))}
                        </>}
                </TreeItem>
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
        router.push('/shop/auth/login');
    }

    return (
        <>

            <DialogSearch
                open={dialogOpenObj.search}
                handleClose={handleDialogClose}
                root_path={'/shop/search?keyword='}
            />
            {themeDnsData?.is_closure == 1 && !user ?
                <>
                </>
                :
                loading ?
                    <>
                    </>
                    :
                    <>
                        {popups.length > 0 && isStorefrontHome(router) ?
                            <>
                                <PopupContainer>
                                    {popups && popups.map((item, idx) => (
                                        <>
                                            {!(themeNoneTodayPopupList[`${returnMoment().substring(0, 10)}`] ?? []).includes(item?.id) &&
                                                <>
                                                    <PopupContent>
                                                        <Icon icon='ion:close' style={{ color: `${themeMode == 'dark' ? '#fff' : '#222'}`, position: 'absolute', right: '8px', top: '8px', fontSize: themeObj.font_size.size8, cursor: 'pointer' }} onClick={() => {
                                                            let popup_list = [...popups];
                                                            popup_list.splice(idx, 1);
                                                            setPopups(popup_list);
                                                        }} />
                                                        <ReactQuill
                                                            className='none-padding'
                                                            value={item?.popup_content ?? `<body></body>`}
                                                            readOnly={true}
                                                            theme={"bubble"}
                                                            bounds={'.app'}
                                                        />
                                                        <Row style={{ alignItems: 'center', position: 'absolute', left: '8px', bottom: '8px', cursor: 'pointer' }}
                                                            onClick={() => {
                                                                let none_today_popup_list = { ...themeNoneTodayPopupList };
                                                                if (!none_today_popup_list[`${returnMoment().substring(0, 10)}`]) {
                                                                    none_today_popup_list[`${returnMoment().substring(0, 10)}`] = [];
                                                                }
                                                                none_today_popup_list[`${returnMoment().substring(0, 10)}`].push(item?.id);
                                                                onChangeNoneTodayPopupList(none_today_popup_list);
                                                            }}
                                                        >
                                                            <Icon icon='ion:close' style={{ color: `${themeMode == 'dark' ? '#fff' : '#222'}`, fontSize: themeObj.font_size.size8, marginRight: '4px' }} onClick={() => { }} />
                                                            <div style={{ fontSize: themeObj.font_size.size8, }}>{translate('오늘 하루 보지않기')}</div>
                                                        </Row>
                                                    </PopupContent>
                                                </>}
                                        </>
                                    ))}
                                </PopupContainer>

                            </>
                            :
                            <>
                            </>}
                        <Wrappers style={{
                            background: `${themeMode == 'dark' ? '#000' : '#fff'}`
                        }}
                            ref={headerWrappersRef}
                        >
                            <TopMenuContainer>
                                <NoneShowMobile style={{ columnGap: '0.5rem' }}>
                                    <TextField
                                        label={translate('통합검색')}
                                        id='size-small'
                                        size='small'
                                        onChange={(e) => {
                                            setKeyword(e.target.value)
                                        }}
                                        value={keyword}
                                        sx={{ maxWidth: '300px' }}
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
                                    <MainLogo
                                        src={logoSrc()}
                                        onClick={() => {
                                            router.push('/shop')
                                        }}
                                    />
                                </NoneShowMobile>
                                <NoneShowMobile style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '14px' }} onMouseOver={() => {
                                    setIsAuthMenuOver(true)
                                }}
                                    onMouseLeave={() => {
                                        setIsAuthMenuOver(false)
                                    }}
                                >
                                    <div className="fade-in-text" style={{ display: `${isAuthMenuOver ? 'flex' : 'none'}`, alignItems: 'center', fontFamily: 'Noto Sans KR' }}>
                                        {user ?
                                            <>
                                                {authList.map((item, idx) => (
                                                    <>
                                                        <AuthMenu
                                                            theme={theme}
                                                            hoverColor={themeMode == 'dark' ? '#fff' : '#000'}
                                                            onClick={() => { router.push(`/shop/auth/${item.link_key}`) }}
                                                        >{item.name}</AuthMenu>
                                                    </>
                                                ))}
                                                <AuthMenu
                                                    theme={theme}
                                                    hoverColor={themeMode == 'dark' ? '#fff' : '#000'}
                                                    onClick={onLogout}
                                                    style={{ borderRight: `none` }}
                                                >{translate('로그아웃')}</AuthMenu>
                                            </>
                                            :
                                            <>
                                                {noneAuthList.map((item, idx) => (
                                                    <>
                                                        <AuthMenu
                                                            theme={theme}
                                                            hoverColor={themeMode == 'dark' ? '#fff' : '#000'}
                                                            onClick={() => { router.push(`/shop/auth/${item.link_key}`) }}
                                                            style={{ borderRight: `${idx == noneAuthList.length - 1 ? 'none' : ''}` }}
                                                        >{item.name}</AuthMenu>
                                                    </>
                                                ))}

                                            </>}

                                    </div>
                                    <div className="fade-in-text" style={{ display: `${isAuthMenuOver ? 'none' : 'flex'}`, alignItems: 'center' }}>
                                        {user ?
                                            <>
                                                <AuthMenu theme={theme} style={{ borderRight: 'none' }}>{translate('마이페이지')}</AuthMenu>
                                            </>
                                            :
                                            <>
                                                <AuthMenu theme={theme} style={{ display: `${themeDnsData?.id == 74 && !themeDnsData?.seller_id ? 'none' : ''}` }}>{translate('회원가입')}</AuthMenu>
                                                <AuthMenu theme={theme} style={{ borderRight: 'none' }}>{translate('로그인')}</AuthMenu>
                                            </>}

                                        <Icon icon={'ic:baseline-plus'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                    </div>
                                </NoneShowMobile>
                                <ShowMobile style={{ marginLeft: 'auto', columnGap: '0.5rem' }}>
                                    <MainLogo
                                        src={logoSrc()}
                                        onClick={() => {
                                            router.push('/shop')
                                        }}
                                    />
                                    <IconButton
                                        sx={iconButtonStyle}
                                        onClick={() => setSideMenuOpen(true)}
                                    >
                                        <Icon icon={'basil:menu-solid'} fontSize={'2rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
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
                                        <Icon icon={'tabler:search'} fontSize={'1.5rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
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
                                        <Badge badgeContent={themeCartData.length} color="error">
                                            <Icon icon={'basil:shopping-bag-outline'} fontSize={'1.8rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                        </Badge>
                                    </IconButton>
                                    <IconButton
                                        sx={iconButtonStyle}
                                        onClick={() => onToggleMode()}
                                    >
                                        <Icon icon={themeMode === 'dark' ? 'tabler:sun' : 'tabler:moon-stars'} fontSize={'1.5rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                    </IconButton>
                                    {themeDnsData?.setting_obj?.is_use_lang == 1 &&
                                        <>
                                            <LanguagePopover />
                                        </>}
                                </ShowMobile>
                            </TopMenuContainer>
                            <div
                                style={{
                                    width: '100%',
                                    borderTop: `1px solid ${theme.palette.grey[300]}`,
                                    backgroundColor: `${themeMode != 'dark' ? themeDnsData?.theme_css?.main_color : ''}`,
                                    fontFamily: 'Noto Sans KR'
                                }}>
                                <CategoryContainer>
                                    <NoneShowMobile style={{ fontSize: '90%', fontWeight: 'bold', height: '50px' }}>

                                        <Row style={{ margin: '0 1rem', position: 'absolute', right: '0' }} >
                                            <IconButton
                                                sx={iconButtonStyle}
                                                onClick={() => {
                                                    if (user) {
                                                        router.push(`/shop/auth/my-page`)
                                                    } else {
                                                        router.push(`/shop/auth/login`)
                                                    }
                                                }}
                                            >
                                                <Icon icon={'basil:user-outline'} fontSize={'1.8rem'} color={themeMode == 'dark' ? '#fff' : '#fff'} />
                                            </IconButton>
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
                                                <Badge badgeContent={themeWishData.length} color="error">
                                                    <Icon icon={'basil:heart-outline'} fontSize={'2rem'} color={themeMode == 'dark' ? '#fff' : '#fff'} />
                                                </Badge>
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
                                                <Badge badgeContent={themeCartData.length} color="error">
                                                    <Icon icon={'basil:shopping-bag-outline'} fontSize={'1.8rem'} color={themeMode == 'dark' ? '#fff' : '#fff'} />
                                                </Badge>
                                            </IconButton>
                                            <IconButton
                                                sx={iconButtonStyle}
                                                onClick={() => onToggleMode()}
                                            >
                                                <Icon icon={themeMode === 'dark' ? 'tabler:sun' : 'tabler:moon-stars'} fontSize={'1.5rem'} color={themeMode == 'dark' ? '#fff' : '#fff'} />
                                            </IconButton>
                                            {themeDnsData?.setting_obj?.is_use_lang == 1 &&
                                                <>
                                                    <LanguagePopover />
                                                </>}
                                        </Row>

                                    </NoneShowMobile>
                                </CategoryContainer>
                            </div>
                            <div style={{ borderBottom: `1px solid ${theme.palette.grey[300]}` }} />

                            <CategoryContainer>
                                <NoneShowMobile>
                                    <IconButton
                                        onClick={() => setSideMenuOpen(true)}
                                        sx={{ marginRight: '1rem' }}
                                    >
                                        <Icon icon={'basil:menu-solid'} fontSize={'2rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                    </IconButton>
                                </NoneShowMobile>
                                <NoneShowMobile
                                    style={{
                                        width: '100%',
                                        flexWrap: 'wrap'
                                    }}
                                    className="none-scroll pc-menu-content"
                                >
                                    {headerCategories.length > 0 && headerCategories.map((item1, idx1) => (
                                        <>
                                            {item1?.is_show_header_menu == 1 &&
                                                <>
                                                    <div style={{ position: 'relative', fontFamily: 'Noto Sans KR' }} className={`menu-${item1?.id}`}>
                                                        <CategoryMenu borderColor={themeMode == 'dark' ? '#fff' : '#000'} onClick={() => {
                                                            router.push(`/shop/items?category_id=${item1?.id}`)
                                                        }}>
                                                            <div>{formatLang(item1, 'category_name', currentLang)}</div>
                                                        </CategoryMenu>
                                                        {item1?.children.length > 0 ?
                                                            <>
                                                                <DropDownMenuContainer parentId={item1?.id} style={{
                                                                    border: `1px solid ${theme.palette.grey[300]}`,
                                                                    width: `${item1.category_img ? '430px' : '154px'}`,
                                                                    fontSize: '12px',
                                                                    fontWeight: 'normal',
                                                                    background: `${themeMode == 'dark' ? '#000' : '#fff'}`,
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
                                                            </>
                                                            :
                                                            <>
                                                            </>}
                                                    </div>
                                                </>}
                                        </>
                                    ))}
                                    {postCategories.length > 0 &&
                                        <>
                                            <div style={{ position: 'relative', marginLeft: 'auto', fontFamily: 'Noto Sans KR' }} className={`menu-service`}>
                                                <CategoryMenu borderColor={themeMode == 'dark' ? '#fff' : '#000'} >
                                                    <div>{translate('고객센터')}</div>
                                                </CategoryMenu>
                                                <DropDownMenuContainer parentId={'service'} style={{
                                                    border: `1px solid ${theme.palette.grey[300]}`,
                                                    width: `154px`,
                                                    fontSize: '12px',
                                                    fontWeight: 'normal',
                                                    background: `${themeMode == 'dark' ? '#000' : '#fff'}`
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        width: '154px'
                                                    }}>
                                                        {postCategories.map((item, idx) => (
                                                            <>
                                                                {
                                                                    item?.post_category_title != '관리자문의' ?
                                                                        <>
                                                                            <DropDownMenu theme={theme}
                                                                                onClick={() => {
                                                                                    router.push(`/shop/service/${item.id}`)
                                                                                }}>
                                                                                <div>{formatLang(item, 'post_category_title', currentLang)}</div>
                                                                            </DropDownMenu>
                                                                        </>
                                                                        :
                                                                        <>
                                                                        </>
                                                                }
                                                            </>
                                                        ))}
                                                    </div>
                                                </DropDownMenuContainer>
                                            </div>
                                        </>
                                    }
                                </NoneShowMobile>
                                <ShowMobile style={{
                                    whiteSpace: 'nowrap',
                                    overflowX: 'auto',
                                }}
                                    className="none-scroll"
                                >
                                    {headerCategories.length > 0 && headerCategories.map((item1, idx1) => (
                                        <>
                                            {item1?.is_show_header_menu == 1 &&
                                                <>
                                                    <CategoryMenu borderColor={themeMode == 'dark' ? '#fff' : '#000'} onMouseOver={() => {
                                                        onHoverCategory(`hover_${item1?.id}`)
                                                    }}
                                                        onClick={() => {
                                                            router.push(`/shop/items?category_id=${item1?.id}`)
                                                        }}
                                                    >
                                                        <div>{formatLang(item1, 'category_name', currentLang)}</div>
                                                    </CategoryMenu>
                                                </>}
                                        </>
                                    ))}
                                    {
                                        /*
                                        <CategoryMenu borderColor={themeMode == 'dark' ? '#fff' : '#000'} onClick={() => {
    
                                    }}>{translate('고객센터')}</CategoryMenu>
                                        */
                                    }
                                </ShowMobile>
                                <NoneShowMobile style={{
                                    marginLeft: 'auto'
                                }}>
                                </NoneShowMobile>
                            </CategoryContainer>
                            <div style={{ borderBottom: `1px solid ${theme.palette.grey[300]}` }} />
                        </Wrappers>
                    </>}
            <PaddingTop pcHeight={headerHeight} />
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
                    {/*themeDnsData?.setting_obj?.is_use_seller == 1 &&
                        <>
                            <ColumnMenuTitle>{translate('셀러')}</ColumnMenuTitle>
                            {themeSellerList.map((seller) => (
                                <>
                                    <ColumnMenuContent onClick={() => {
                                        router.push(`/shop/seller/${seller?.id}`);
                                        setSideMenuOpen(false);
                                    }} style={{ paddingLeft: '1rem' }}>{seller.seller_name}</ColumnMenuContent>
                                </>
                            ))}
                        </>*/}
                    {/* 상품 카테고리 — 1단은 섹션 제목(고객센터·마이페이지와 동급), 2단 이하는 들여쓴 하위 항목.
                        단일 트리 전환으로 그룹 레이어가 사라져 합성 그룹명을 제목으로 쓸 수 없게 됐고,
                        그 결과 이 블록만 라벨 없는 불릿 목록이 되어 위계가 안 보였다.
                        ※ 이 헤더는 프레임3(ShopLayout4)이 쓴다 — demo-4/header.js 는 쓰이지 않는다. */}
                    {headerCategories.map((cat) => (
                        <Fragment key={cat.id}>
                            <CategoryTitle
                                style={{ cursor: 'pointer' }}
                                onClick={() => { router.push(`/shop/items?category_id=${cat.id}`); setSideMenuOpen(false); }}
                            >
                                {formatLang(cat, 'category_name', currentLang)}
                            </CategoryTitle>
                            {(cat.children ?? []).length > 6 ?
                                <>
                                    {/* 하위가 7개 이상이면 목록이 길어지므로 이 카테고리만 기존 TreeView(접기/펼치기)로 감싼다. */}
                                    <TreeView
                                        defaultCollapseIcon={<Icon icon={'ic:baseline-minus'} />}
                                        defaultExpandIcon={<Icon icon={'ic:baseline-plus'} />}
                                        defaultEndIcon={<Icon icon={'mdi:dot'} />}
                                    >
                                        {(cat.children ?? []).map((sub) => (
                                            <Fragment key={sub.id}>
                                                {returnSidebarMenu(sub, 0, { router, setSideMenuOpen }, 0)}
                                            </Fragment>
                                        ))}
                                    </TreeView>
                                </>
                                :
                                (cat.children ?? []).map((sub) => returnSidebarLeaf(sub, 1, { router, setSideMenuOpen }, currentLang))
                            }
                        </Fragment>
                    ))}
                    {
                        themeDnsData?.id == 74 &&
                        <>
                            <ColumnMenuTitle>{'성별'}</ColumnMenuTitle>
                            <TreeView
                                defaultCollapseIcon={<Icon icon={'ic:baseline-minus'} />}
                                defaultExpandIcon={<Icon icon={'ic:baseline-plus'} />}
                                defaultEndIcon={<Icon icon={'mdi:dot'} />}
                            >
                                <TreeItem label={<div
                                    style={{
                                        marginLeft: '0.25rem'
                                    }}
                                    onClick={() => {
                                        router.push(`/shop/items?property_ids0=48&depth=0`);
                                        setSideMenuOpen(false);
                                    }}>공용</div>}
                                    style={{ margin: '0.25rem 0' }}
                                >
                                </TreeItem>
                                <TreeItem label={<div
                                    style={{
                                        marginLeft: '0.25rem'
                                    }}
                                    onClick={() => {
                                        router.push(`/shop/items?property_ids0=47&depth=0`);
                                        setSideMenuOpen(false);
                                    }}>남성</div>}
                                    style={{ margin: '0.25rem 0' }}
                                >
                                </TreeItem>
                                <TreeItem label={<div
                                    style={{
                                        marginLeft: '0.25rem'
                                    }}
                                    onClick={() => {
                                        router.push(`/shop/items?property_ids0=46&depth=0`);
                                        setSideMenuOpen(false);
                                    }}>여성</div>}
                                    style={{ margin: '0.25rem 0' }}
                                >
                                </TreeItem>
                            </TreeView>
                        </>
                    }
                    {
                        postCategories.length > 0 &&
                        <>
                            <ColumnMenuTitle>{translate('고객센터')}</ColumnMenuTitle>
                        </>
                    }
                    {postCategories.length > 0 && postCategories.map((item, idx) => (
                        <>
                            <ColumnMenuContent onClick={() => {
                                router.push(`/shop/service/${item.id}`);
                                setSideMenuOpen(false);
                            }} style={{ paddingLeft: '1rem' }}>{formatLang(item, 'post_category_title', currentLang)}</ColumnMenuContent>
                        </>
                    ))}
                    <ColumnMenuTitle>{translate('마이페이지')}</ColumnMenuTitle>
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
                            }} style={{ paddingLeft: '1rem' }}>{translate('로그아웃')}</ColumnMenuContent>
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
/* 상품 카테고리 전용 제목 — 1단이 여러 개 반복되므로 ColumnMenuTitle 의 2rem 간격은 너무 벌어진다.
   ColumnMenuTitle 자체를 고치면 고객센터·마이페이지 헤딩까지 같이 바뀌므로 따로 둔다. */
const CategoryTitle = styled(ColumnMenuTitle)`
        margin: 1.25rem 0 0.25rem 0;
`
const ColumnMenuContent = styled.div`
        display:flex;
        align-items:center;
        padding:0.25rem 0;
        cursor:pointer;
        `
const iconButtonStyle = {
    padding: '0.1rem',
}
export default Header
