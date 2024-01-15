import Logo from "src/components/logo/Logo"
import styled from "styled-components"
import { IconButton, TextField, InputAdornment, Drawer, Badge, Button, Typography, Stack, Chip } from "@mui/material"
import { forwardRef, useEffect, useRef, useState } from "react"
import { Icon } from "@iconify/react"
import { Col, Row, themeObj } from 'src/components/elements/styled-components'
import { useTheme } from '@mui/material/styles';
import { useSettingsContext } from "src/components/settings"
import { test_categories } from "src/data/test-data"
import { useRouter } from "next/router"
import { TreeItem, TreeView } from "@mui/lab"
import { getAllIdsWithParents } from "src/utils/function"
import DialogSearch from "src/components/dialog/DialogSearch"
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext"
import { logoSrc } from "src/data/data"
import $ from 'jquery'
import dynamic from 'next/dynamic';
import MenuPopover from "src/components/menu-popover"
import { TitleComponent } from "src/components/elements/shop/demo-4"
const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
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
max-width: 1600px;
width:90%;
margin: 0 auto;
align-items:center;
position:relative;
@media (max-width:1000px) {
  padding: 0.5rem 0;
}
`
const CategoryContainer = styled.div`
max-width: 1622px;
width:100%;
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
z-index:9999;
`
const PopupContent = styled.div`
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
const PopoverContainer = styled.div`
position: fixed;
left: 50%;
z-index: 9;
transform: translate(-50%, 0);
width:1600px;
padding: 1rem;
border: 1px solid #ccc;
@media screen and (max-width:1600px) { 
width:90vw;
}
`

const Header = () => {

    const router = useRouter();
    const theme = useTheme()
    const { themeMode, onToggleMode, themeCategoryList, themeDnsData, themePopupList, themePostCategoryList, onChangePopupList, themeWishData, themeCartData, onChangeCartData, onChangeWishData, themeSellerList } = useSettingsContext();
    const { user, logout } = useAuthContext();
    const headerWrappersRef = useRef();
    const [headerHeight, setHeaderHeight] = useState(130);
    const [keyword, setKeyword] = useState("");
    const onSearch = () => {
        setKeyword("");
        router.push(`/shop/items?search=${keyword}`)
    }
    const [isAuthMenuOver, setIsAuthMenuOver] = useState(false)
    const [hoverItems, setHoverItems] = useState({

    })
    const [sideMenuOpen, setSideMenuOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [popups, setPopups] = useState([]);
    const [postCategories, setPostCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openAllCategory, setOpenAllCategory] = useState("")
    const allCategoryRef = useRef([]);
    const authList = [
        {
            name: 'My그랑',
            link_key: '/shop/auth/my-page',
            icon: 'material-symbols:person',
        },
        {
            name: '장바구니',
            link_key: '/shop/auth/cart',
            icon: 'mdi:cart',
        },
        {
            name: '위시리스트',
            link_key: '/shop/auth/wish',
            icon: 'mdi:heart',
        },
        {
            name: '포인트내역',
            link_key: '/shop/auth/point',
            icon: 'icon-park-solid:powerpoint',
        },
        {
            name: '주문/배송조회',
            link_key: '/shop/auth/history',
            icon: 'iconoir:book-solid',
        },
        ...(user?.level >= 10 ? [
            {
                name: '판매자센터',
                link_key: '/manager',
                icon: 'iconoir:book-solid',
            },
        ] : []),
    ]
    const noneAuthList = [
        {
            name: '로그인',
            link_key: '/shop/auth/login',
            icon: 'material-symbols:lock',
        },
        {
            name: '회원가입',
            link_key: '/shop/auth/sign-up',
            icon: 'ic:sharp-person-add',
        },
        {
            name: '비회원 주문조회',
            link_key: '/shop/auth/login?scroll_to=100000',
            icon: 'lets-icons:order',
        },
    ]
    useEffect(() => {
    }, [user])
    useEffect(() => {
        setHeaderHeight(headerWrappersRef.current?.clientHeight ?? 130);
    }, [headerWrappersRef.current, categories, themeCategoryList])
    useEffect(() => {
        if (themeCategoryList) {
            settingHeader();
        }
    }, [themeCategoryList])
    const settingHeader = async () => {
        setLoading(true);
        setPopups(themePopupList)
        setPostCategories(themePostCategoryList);
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
    }
    const onHoverCategory = (category_name) => {
        let hover_items = hoverItems;
        for (let key in hover_items) {
            hover_items[key] = false;
        }
        hover_items[category_name] = true;
        setHoverItems(hover_items);
    }
    const handleOutsideClick = (e) => {
        let is_contain = false;
        for (var i = 0; i < themeCategoryList.length; i++) {
            if (allCategoryRef.current[i] && allCategoryRef.current[i].contains(e.target)) {
                is_contain = true;
            }
        }
        if (!is_contain) {
            setOpenAllCategory("");
        }

    };
    useEffect(() => {
        if (openAllCategory) {
            document.addEventListener('click', handleOutsideClick);
        }

        // 컴포넌트가 언마운트되거나 모달이 닫힐 때 이벤트 리스너 제거
        return () => {
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [openAllCategory]);
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
                root_path={'shop/items?search='}
            />
            {loading ?
                <>
                </>
                :
                <>
                    {popups.length > 0 ?
                        <>
                            <PopupContainer>
                                {popups && popups.map((item, idx) => (
                                    <>
                                        { }
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
                                            <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', left: '8px', bottom: '8px' }}>
                                                <Icon icon='ion:close' style={{ color: `${themeMode == 'dark' ? '#fff' : '#222'}`, fontSize: themeObj.font_size.size8, marginRight: '4px', cursor: 'pointer' }} onClick={() => { }} />
                                                <div style={{ fontSize: themeObj.font_size.size8, }}>오늘 하루 보지않기</div>
                                            </div>
                                        </PopupContent>
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
                            <img src={logoSrc()} style={{ height: '40px', width: 'auto', cursor: 'pointer' }}
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
                                <Button variant="outlined"
                                    sx={{ marginRight: '0.5rem' }}
                                    startIcon={<>
                                        <Icon icon={'mdi:cart'} />
                                    </>}
                                >
                                    매입센터
                                </Button>
                                <Button variant="outlined"
                                    startIcon={<>
                                        <Icon icon={'heroicons:paper-clip'} />
                                    </>}>
                                    위탁센터
                                </Button>
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
                                    <Icon icon={'basil:user-outline'} fontSize={'1.8rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
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
                                        <Icon icon={'basil:heart-outline'} fontSize={'2rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
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
                                        <Icon icon={'basil:shopping-bag-outline'} fontSize={'1.8rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                    </Badge>
                                </IconButton>
                                <IconButton
                                    sx={iconButtonStyle}
                                    onClick={() => onToggleMode()}
                                >
                                    <Icon icon={themeMode === 'dark' ? 'tabler:sun' : 'tabler:moon-stars'} fontSize={'1.5rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                </IconButton>
                            </NoneShowMobile>
                            <NoneShowMobile style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '14px' }} onMouseOver={() => {
                                setIsAuthMenuOver(true)
                            }}
                                onMouseLeave={() => {
                                    setIsAuthMenuOver(false)
                                }}
                            >
                                <div className="fade-in-text" style={{ display: `${isAuthMenuOver ? 'flex' : 'none'}`, alignItems: 'center' }}>
                                    {user ?
                                        <>
                                            {authList.map((item, idx) => (
                                                <>
                                                    <AuthMenu
                                                        theme={theme}
                                                        hoverColor={themeMode == 'dark' ? '#fff' : '#000'}
                                                        onClick={() => { router.push(`${item.link_key}`) }}
                                                    >{item.name}</AuthMenu>
                                                </>
                                            ))}
                                            <AuthMenu
                                                theme={theme}
                                                hoverColor={themeMode == 'dark' ? '#fff' : '#000'}
                                                onClick={onLogout}
                                                style={{ borderRight: `none` }}
                                            >{'로그아웃'}</AuthMenu>
                                        </>
                                        :
                                        <>
                                            {noneAuthList.map((item, idx) => (
                                                <>
                                                    <AuthMenu
                                                        theme={theme}
                                                        hoverColor={themeMode == 'dark' ? '#fff' : '#000'}
                                                        onClick={() => { router.push(`${item.link_key}`) }}
                                                        style={{ borderRight: `${idx == noneAuthList.length - 1 ? 'none' : ''}` }}
                                                    >{item.name}</AuthMenu>
                                                </>
                                            ))}

                                        </>}

                                </div>
                                <div className="fade-in-text" style={{ display: `${isAuthMenuOver ? 'none' : 'flex'}`, alignItems: 'center' }}>
                                    {user ?
                                        <>
                                            <AuthMenu theme={theme} style={{ borderRight: 'none' }}>마이페이지</AuthMenu>
                                        </>
                                        :
                                        <>
                                            <AuthMenu theme={theme}>회원가입</AuthMenu>
                                            <AuthMenu theme={theme} style={{ borderRight: 'none' }}>로그인</AuthMenu>
                                        </>}

                                    <Icon icon={'ic:baseline-plus'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                </div>
                            </NoneShowMobile>
                            <ShowMobile style={{ marginLeft: 'auto' }}>
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
                            </ShowMobile>
                        </TopMenuContainer>
                        {themeCategoryList.map((group, index) => {
                            if (group?.is_show_header_menu == 1) {
                                return <>
                                    <div style={{ borderBottom: `1px solid ${theme.palette.grey[300]}` }} />
                                    <CategoryContainer>
                                        {index == 0 ?
                                            <>
                                                <NoneShowMobile>
                                                    <IconButton
                                                        onClick={() => setSideMenuOpen(true)}
                                                        sx={{ marginRight: '1rem' }}
                                                    >
                                                        <Icon icon={'basil:menu-solid'} fontSize={'2rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                                    </IconButton>
                                                </NoneShowMobile>
                                            </>
                                            :
                                            <>
                                                <div style={{ width: '48px' }} />
                                            </>}
                                        <NoneShowMobile
                                            style={{
                                                width: '85%',
                                                whiteSpace: 'nowrap',
                                                overflowX: 'auto',
                                                margin: '0 auto'
                                            }}
                                            className={`none-scroll pc-menu-content${index}`}
                                        >
                                            <IconButton style={{ position: 'absolute', left: '2.5rem' }} onClick={() => {
                                                $(`.pc-menu-content${index}`).animate({
                                                    scrollLeft: $(`.pc-menu-content${index}`).scrollLeft() - 800
                                                }, 300)
                                            }}>
                                                <Icon icon='mingcute:left-line' color={themeMode == 'dark' ? '#fff' : '#000'} />
                                            </IconButton>
                                            <IconButton style={{ position: 'absolute', right: '2.5rem' }} onClick={() => {
                                                $(`.pc-menu-content${index}`).animate({
                                                    scrollLeft: $(`.pc-menu-content${index}`).scrollLeft() + 800
                                                }, 300)
                                            }}>
                                                <Icon icon='mingcute:right-line' color={themeMode == 'dark' ? '#fff' : '#000'} />
                                            </IconButton>
                                            <div style={{ position: 'relative' }} ref={(element) => {
                                                allCategoryRef.current[index] = element;
                                            }}>
                                                <CategoryMenu borderColor={themeMode == 'dark' ? '#fff' : '#000'} onClick={() => {
                                                    setOpenAllCategory(group?.id)
                                                }}>
                                                    <div>전체 {group?.category_group_name}</div>
                                                </CategoryMenu>
                                                {openAllCategory == group?.id &&
                                                    <>
                                                        <PopoverContainer style={{ background: `${themeMode == 'dark' ? '#222' : '#fff'}`, maxHeight: `${window.innerHeight - headerHeight}px`, overflowY: 'auto' }}>
                                                            {group?.sort_type == 0 &&
                                                                <>
                                                                    <Row style={{ columnGap: '1rem', flexWrap: 'wrap', rowGap: '2rem' }}>
                                                                        {group?.product_categories && group?.product_categories.map((category, idx) => (
                                                                            <>
                                                                                <Col style={{ minWidth: '100px' }}>
                                                                                    <ColumnMenuTitle style={{ margin: '0' }}>{category?.category_name}</ColumnMenuTitle>
                                                                                    {category?.children && category?.children.map(children => (
                                                                                        <>
                                                                                            <Typography variant="body2" style={{ cursor: 'pointer' }} onClick={() => {
                                                                                                router.push(`/shop/items?category_id${index}=${children?.id}&depth=0`)
                                                                                                setOpenAllCategory("")
                                                                                            }}>{children?.category_name}</Typography>
                                                                                        </>
                                                                                    ))}
                                                                                </Col>
                                                                            </>
                                                                        ))}
                                                                    </Row>
                                                                </>}
                                                            {group?.sort_type == 1 &&
                                                                <>
                                                                    <Col style={{ minWidth: '100px', flexWrap: 'wrap', alignItems: 'flex-start', maxHeight: '700px', rowGap: '0.2rem' }}>
                                                                        {group?.product_categories && group?.product_categories.map((category, idx) => {
                                                                            let is_alphabet = false;
                                                                            let alphabet = "";
                                                                            if (group?.sort_type == 1) {
                                                                                for (var i = 65; i < 90; i++) {
                                                                                    if (category?.category_name[0].toUpperCase() == String.fromCharCode(i) && (group?.product_categories[idx - 1]?.category_name[0] ?? "").toUpperCase() != String.fromCharCode(i)) {
                                                                                        is_alphabet = true;
                                                                                        alphabet = String.fromCharCode(i);
                                                                                        break;
                                                                                    }
                                                                                }
                                                                            }
                                                                            return <>
                                                                                {is_alphabet &&
                                                                                    <>
                                                                                        <Chip label={`[${alphabet}]`} variant="soft" sx={{
                                                                                            marginTop: '0.5rem',
                                                                                            cursor: 'pointer', fontWeight: 'bold', background: `${themeDnsData?.theme_css?.main_color}29`, color: `${themeDnsData?.theme_css?.main_color}`, '&:hover': {
                                                                                                color: '#fff',
                                                                                                background: `${themeDnsData?.theme_css?.main_color}`,
                                                                                            }
                                                                                        }} />
                                                                                        <div style={{ borderBottom: `3px solid ${themeDnsData?.theme_css?.main_color}`, width: '150px', marginBottom: '0.5rem' }} />
                                                                                    </>}
                                                                                <Typography variant="body2" style={{ cursor: 'pointer' }} onClick={() => {
                                                                                    router.push(`/shop/items?category_id${index}=${category?.id}&depth=0`)
                                                                                    setOpenAllCategory("")
                                                                                }}>{category?.category_name}</Typography>
                                                                            </>
                                                                        })}
                                                                    </Col>

                                                                </>}
                                                        </PopoverContainer>
                                                    </>}
                                            </div>

                                            {group?.product_categories && group?.product_categories.map((item1, idx1) => {
                                                if (item1?.is_show_header_menu == 1) {
                                                    return <div style={{ position: 'relative' }} className={`menu-${item1?.id}`}>
                                                        <CategoryMenu borderColor={themeMode == 'dark' ? '#fff' : '#000'} onClick={() => {
                                                            router.push(`/shop/items?category_id${index}=${item1?.id}&depth=0`)
                                                        }}>
                                                            <div>{item1.category_name}</div>
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
                                                }
                                            })}
                                        </NoneShowMobile>
                                        <ShowMobile style={{
                                            whiteSpace: 'nowrap',
                                            overflowX: 'auto'
                                        }}
                                            className="none-scroll"
                                        >
                                            {group?.product_categories && group?.product_categories.map((item1, idx1) => (
                                                <>
                                                    {item1?.is_show_header_menu == 1 &&
                                                        <>
                                                            <CategoryMenu borderColor={themeMode == 'dark' ? '#fff' : '#000'} onMouseOver={() => {
                                                                onHoverCategory(`hover_${item1?.id}`)
                                                            }}
                                                                onClick={() => {
                                                                    router.push(`/shop/items?category_id${index}=${item1?.id}&depth=0`)
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
                                </>
                            }


                        })}
                        <div style={{ borderBottom: `1px solid ${theme.palette.grey[300]}` }} />
                    </Wrappers>
                </>}
            <PaddingTop pcHeight={headerHeight} />
            <Drawer
                anchor={'left'}
                open={sideMenuOpen}
                onClose={() => {
                    setSideMenuOpen(false);
                }}
            >
                <ColumnMenuContainer style={{
                    background: (themeMode == 'dark' ? '#222' : '#fff'),
                    color: (themeMode == 'dark' ? '#fff' : '#000'),
                }}
                    className="none-scroll"
                >
                    {user ?
                        <>
                            <ColumnMenuTitle style={{ borderBottom: '1px solid #ccc', paddingBlock: '1rem' }}>{user?.nickname}님, 환영합니다.</ColumnMenuTitle>
                        </>
                        :
                        <>
                            <ColumnMenuTitle style={{ borderBottom: '1px solid #ccc', paddingBlock: '1rem' }}>로그인을 해주세요.</ColumnMenuTitle>
                        </>}
                    <ColumnMenuTitle style={{ marginTop: '1rem' }}>마이페이지</ColumnMenuTitle>
                    {user ?
                        <>
                            {authList.map((item, idx) => (
                                <>
                                    <Row style={{ alignItems: 'center', cursor: 'pointer' }} onClick={() => {
                                        window.location.href = (`${item.link_key}`);
                                        setSideMenuOpen(false);
                                    }}>
                                        <Icon icon={item.icon} style={{ color: themeDnsData?.theme_css?.main_color }} />
                                        <Typography style={{ padding: '0.3rem', }} variant="subtitle2">{item.name}</Typography>
                                    </Row>

                                </>
                            ))}
                            <Row style={{ alignItems: 'center', cursor: 'pointer' }} onClick={() => {
                                onLogout();
                                setSideMenuOpen(false);
                            }}>
                                <Icon icon={'ri:logout-circle-r-line'} style={{ color: themeDnsData?.theme_css?.main_color }} />
                                <Typography style={{ padding: '0.3rem', }} variant="subtitle2">로그아웃</Typography>
                            </Row>
                        </>
                        :
                        <>
                            {noneAuthList.map((item, idx) => (
                                <>
                                    <Row style={{ alignItems: 'center', cursor: 'pointer' }} onClick={() => {
                                        window.location.href = (`${item.link_key}`);
                                        setSideMenuOpen(false);
                                    }}>
                                        <Icon icon={item.icon} style={{ color: themeDnsData?.theme_css?.main_color }} />
                                        <Typography style={{ padding: '0.3rem', }} variant="subtitle2">{item.name}</Typography>
                                    </Row>
                                </>
                            ))}
                        </>}

                    {themeDnsData?.setting_obj?.is_use_seller == 1 &&
                        <>
                            <ColumnMenuTitle>셀러</ColumnMenuTitle>
                            {themeSellerList.map((seller) => (
                                <>
                                    <Typography onClick={() => {
                                        window.location.href = (`/shop/seller/${seller?.id}`);
                                        setSideMenuOpen(false);
                                    }} style={{ padding: '0.3rem', cursor: 'pointer' }} variant="subtitle2">{seller.seller_name}</Typography>
                                </>
                            ))}
                        </>}
                    {/* {themeCategoryList && themeCategoryList.map((group, index) => (
                        <>
                            {group?.is_show_header_menu == 1 &&
                                <>
                                    <ColumnMenuTitle>{group?.category_group_name}</ColumnMenuTitle>
                                    <TreeView
                                        defaultCollapseIcon={<Icon icon={'ic:baseline-minus'} />}
                                        defaultExpandIcon={<Icon icon={'ic:baseline-plus'} />}
                                        defaultEndIcon={<Icon icon={'mdi:dot'} />}
                                    >
                                        {group?.product_categories && group?.product_categories.map((item1, idx) => (
                                            <>
                                                {returnSidebarMenu(item1, 0, {
                                                    router,
                                                    setSideMenuOpen
                                                }, index)}
                                            </>
                                        ))}
                                    </TreeView>
                                </>}
                        </>
                    ))} */}
                    <ColumnMenuTitle>고객센터</ColumnMenuTitle>
                    {postCategories && postCategories.map((item, idx) => (
                        <>
                            <Typography onClick={() => {
                                window.location.href = (`/shop/service/${item.id}`);
                                setSideMenuOpen(false);
                            }} style={{ padding: '0.3rem', cursor: 'pointer' }} variant="subtitle2">{item.post_category_title}</Typography>
                        </>
                    ))}

                </ColumnMenuContainer>
            </Drawer>
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
                    router.push(`/shop/items?category_id${index}=${item?.id}&depth=${num}`);
                    setSideMenuOpen(false);
                }}>{item.category_name}</div>}
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
    marginLeft: '0.5rem'
}
export default Header
