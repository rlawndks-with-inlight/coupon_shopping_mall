import Logo from "src/components/logo/Logo"
import styled from "styled-components"
import { IconButton, TextField, InputAdornment, Drawer, Badge, Button, Typography, Stack, Chip } from "@mui/material"
import { forwardRef, useEffect, useRef, useState } from "react"
import { Icon } from "@iconify/react"
import { Col, Row, themeObj } from 'src/components/elements/styled-components'
import { CategorySorter, LANGCODE } from "src/views/shop/demo-4/header"
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
const HighestContainer = styled.div`
display:flex;
padding: 0;
max-width: 1360px;
width:90%;
margin: 0 auto;
position:relative;
height:50px;
text-align: right;
@media (max-width:1000px) {
  padding: 0.5rem 0;
}
`
const TopMenuContainer = styled.div`
display:flex;
padding: 0;
padding-top: 0;
max-width: 1360px;
width:90%;
margin: 0 auto;
align-items:center;
position:relative;
height:60px;
@media (max-width:1000px) {
  padding: 0.5rem 0;
}
`
const CategoryContainer = styled.div`
max-width: 1360px;
width:90%;
margin: 0 auto;
display:flex;
align-items:center;
position:relative;
@media (max-width:1000px) { //일단 임시로 안 보이게 해놓음
  display: none;
}
`
const CategoryMenu = styled.div`
padding:1rem 1.5rem 0 1.5rem;
text-align: center;
display:inline-block;
//text-transform:uppercase;
margin:0;
cursor:pointer;
//font-weight:bold;
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
border: 1px solid #ccc;
//max-width:1360px;
width:100%;
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
    const [langChipSelected, setLangChipSelected] = useState(0)
    const { sort, categoryGroup } = CategorySorter(themeCategoryList)
    const [textChipSelected, setTextChipSelected] = useState('')

    const allCategoryRef = useRef([]);
    const authList = [
        {
            name: 'My그랑파리',
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

    useEffect(() => {
        sort(LANGCODE.ENG)
    }, [])

    const toLuxuryEdition = () => {
        const luxuryEditionUrl = 'https://luxuryedition.co.kr';
        window.location.href = luxuryEditionUrl;
    }

    const alphabetList = [
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
        'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'
    ]

    const hangeulList = [
        '가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하', '#'
    ]

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
                    {popups.length > 0 && router.pathname === '/shop' ?  //&& router.asPath == '/shop' 이 조건 넣으니까 팝업이 안 뜸
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
                                            <div style={{ display: 'flex', alignItems: 'center', position: 'absolute', left: '8px', bottom: '8px', cursor: 'pointer' }} onClick={() => {
                                                let popup_list = [...popups];
                                                popup_list.splice(idx, 1);
                                                setPopups(popup_list);
                                            }}>
                                                <Icon icon='ion:close' style={{ color: `${themeMode == 'dark' ? '#fff' : '#222'}`, fontSize: themeObj.font_size.size8, marginRight: '4px', }} onClick={() => { }} />
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
                        background: `${themeMode == 'dark' ? '#000' : '#fff'}`,
                    }}
                        ref={headerWrappersRef}
                    >

                        <TopMenuContainer>
                            <NoneShowMobile>
                                <TextField
                                    label='search by...'
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
                            </NoneShowMobile>
                            <img
                                src={logoSrc()}
                                style={{
                                    aspectRatio: '148/52',
                                    cursor: 'pointer',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    transform: 'translate(-50%, -50%)',
                                    minWidth: '100px',
                                    maxWidth: '148px',
                                    maxHeight: '52px'
                                }}
                                onClick={() => {
                                    if (router.pathname === '/shop') {
                                        router.reload()
                                    } else {
                                        router.push('/shop')
                                    }
                                }}
                            />
                            <NoneShowMobile>
                                {/*<Button variant="outlined"
                                    sx={{ marginRight: '0.5rem', minWidth: '112px' }}
                                    startIcon={<>
                                        <Icon icon={'bx:store'} />
                                    </>}
                                    onClick={() => {
                                        router.push('/shop/guide/company-guide')
                                    }}
                                >
                                    매장안내
                                </Button>
                                <Button variant="outlined"
                                    sx={{ marginRight: '0.5rem', minWidth: '112px' }}
                                    startIcon={<>
                                        <Icon icon={'mdi:cart'} />
                                    </>}
                                    onClick={() => {
                                        router.push('/shop/guide/purchase-guide')
                                    }}
                                >
                                    매입센터
                                </Button>
                                <Button variant="outlined"
                                    sx={{ minWidth: '112px' }}
                                    startIcon={<>
                                        <Icon icon={'heroicons:paper-clip'} />
                                    </>}
                                    onClick={() => {
                                        router.push('/shop/guide/consignment-guide')
                                    }}
                                >
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
                                </IconButton>*/}
                                <div style={{ position: 'absolute', right: '0' }}>
                                    <Button style={{
                                        width: '74px',
                                        height: '30px',
                                        fontWeight: 'bold',
                                        fontSize: '12px',
                                        color: `${themeMode == 'dark' ? 'black' : 'white'}`,
                                        backgroundColor: `${themeMode == 'dark' ? 'white' : 'black'}`,
                                        borderRadius: '0',
                                        marginRight: '10px'
                                    }}
                                        onClick={() => {
                                            router.push(`/shop/guide/consignment-guide`)
                                        }}
                                    >
                                        Sell Item
                                    </Button>
                                    <Button style={{
                                        width: '74px',
                                        height: '30px',
                                        fontWeight: 'bold',
                                        fontSize: '12px',
                                        color: `${themeMode == 'dark' ? 'white' : 'black'}`,
                                        borderRadius: '0',
                                        marginRight: '10px'
                                    }}
                                        onClick={() => {
                                            if (!user) {
                                                router.push(`/shop/auth/login`)
                                            } else {
                                                onLogout()
                                            }
                                        }}
                                    >
                                        {user ? 'Sign out' : 'Sign in'}
                                    </Button>
                                    {user ?
                                        <>
                                        </>
                                        :
                                        <Button style={{
                                            width: '74px',
                                            height: '30px',
                                            fontWeight: 'bold',
                                            fontSize: '12px',
                                            color: `${themeMode == 'dark' ? 'white' : 'black'}`,
                                            borderRadius: '0',
                                            marginRight: '8px'
                                        }}
                                            onClick={() => {
                                                router.push(`/shop/auth/sign-up`)
                                            }}
                                        >
                                            Sign up
                                        </Button>
                                    }
                                    <IconButton
                                        sx={{ padding: '0' }}
                                        onClick={() => {
                                            if (user) {
                                                router.push(`/shop/auth/cart`)
                                            } else {
                                                router.push(`/shop/auth/login`)
                                            }
                                        }}
                                    >
                                        <Badge badgeContent={themeCartData.length} color="error">
                                            <Icon icon={'basil:shopping-bag-outline'} width={'30px'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                        </Badge>
                                    </IconButton>
                                </div>
                            </NoneShowMobile>
                            <NoneShowMobile style={{ marginLeft: 'auto', cursor: 'pointer', fontSize: '14px' }} onMouseOver={() => {
                                setIsAuthMenuOver(true)
                            }}
                                onMouseLeave={() => {
                                    setIsAuthMenuOver(false)
                                }}
                            >

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
                        <div style={{ width: '100%', borderTop: `1px solid ${theme.palette.grey[300]}`, }}>
                            <CategoryContainer>
                                <NoneShowMobile>
                                    <IconButton
                                        onClick={() => setSideMenuOpen(true)}
                                        sx={{ marginRight: '1rem' }}
                                    >
                                        <Icon icon={'basil:menu-solid'} fontSize={'2rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                    </IconButton>
                                </NoneShowMobile>
                                <div
                                    style={{
                                        //width: '100%',
                                        whiteSpace: 'nowrap',
                                        //overflowX: 'auto',
                                        //margin: '0 auto',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                //className={`none-scroll pc-menu-content${index}`}
                                >
                                    {themeCategoryList.map((group, index) => {
                                        if (group?.category_group_name == '카테고리' || group?.category_group_name == '브랜드') {
                                            return <>
                                                <div style={{ position: 'relative' }} ref={(element) => {
                                                    allCategoryRef.current[index] = element;
                                                }}>
                                                    <CategoryMenu borderColor={themeDnsData?.theme_css?.main_color} onClick={() => {
                                                        setOpenAllCategory(group?.id)
                                                    }}>
                                                        {group?.category_group_name == '카테고리' ?
                                                            <div>All Category</div>
                                                            :
                                                            group?.category_group_name == '브랜드' ?
                                                                <div style={{ color: `${themeDnsData?.theme_css?.main_color}` }}>Find Brand</div> : ''}
                                                    </CategoryMenu>
                                                    {openAllCategory == group?.id &&
                                                        <>
                                                            <PopoverContainer style={{ 
                                                                background: `${themeMode == 'dark' ? '#222' : '#FEF8F4'}`, 
                                                                maxHeight: `${window.innerHeight - headerHeight}px`, 
                                                                overflowY: 'auto', 
                                                                borderTop:`2px solid ${themeDnsData?.theme_css?.main_color}`,
                                                                borderBottom:`2px solid ${themeDnsData?.theme_css?.main_color}`,
                                                                }}>
                                                                <div style={{maxWidth:'1360px', margin:'0 auto'}}>
                                                                    {group?.sort_type == 0 &&
                                                                        <>
                                                                            <Row style={{ columnGap: '1rem', flexWrap: 'wrap', rowGap: '2rem', marginBottom: '10px' }}>
                                                                                {group?.product_categories && group?.product_categories.map((category, idx) => (
                                                                                    <>
                                                                                        {category.category_name != 'WATCH' && (
                                                                                            <Col style={{ minWidth: '100px' }}>
                                                                                                <ColumnMenuTitle style={{ margin: '0', cursor: 'pointer' }} onClick={() => {
                                                                                                    router.push(`/shop/items?category_id${index}=${category?.id}&depth=0`)
                                                                                                }}>
                                                                                                    {category?.category_name}
                                                                                                </ColumnMenuTitle>
                                                                                                {category?.children && category?.children.map(children => (
                                                                                                    <>
                                                                                                        <Typography variant="body2" style={{ cursor: 'pointer', marginBottom: '0.2rem' }} onClick={() => {
                                                                                                            router.push(`/shop/items?category_id${index}=${children?.id}&depth=0`)
                                                                                                            setOpenAllCategory("")
                                                                                                        }}>{children?.category_name}</Typography>
                                                                                                    </>
                                                                                                ))}
                                                                                            </Col>
                                                                                        )}
                                                                                    </>
                                                                                ))}
                                                                            </Row>
                                                                            <div style={{ border: '2px solid red', padding: '0' }} />
                                                                            <Col style={{ columnGap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start', rowGap: '2rem', maxHeight: '200px', marginTop: '10px', marginBottom: '10px' }}>
                                                                                {group?.product_categories && group?.product_categories.map((category, idx) => {
                                                                                    return <>
                                                                                        {category.category_name == 'WATCH' && (
                                                                                            <div style={{ minWidth: '100px', display: 'flex' }}>
                                                                                                <ColumnMenuTitle style={{ margin: '0', cursor: 'pointer', marginRight: '2rem' }} onClick={() => {
                                                                                                    router.push(`/shop/items?category_id${index}=${category?.id}&depth=0`)
                                                                                                }}>
                                                                                                    {category?.category_name}
                                                                                                </ColumnMenuTitle>
                                                                                                <Col style={{ columnGap: '3rem', flexWrap: 'wrap', alignItems: 'flex-start', rowGap: '1rem', maxHeight: '200px' }}>
                                                                                                    {category?.children && category?.children.map((children) => {
                                                                                                        return <>
                                                                                                            <Typography variant="body2" style={{ cursor: 'pointer' }} onClick={() => {
                                                                                                                router.push(`/shop/items?category_id${index}=${children?.id}&depth=0`)
                                                                                                                setOpenAllCategory("")
                                                                                                            }}>{children?.category_name}</Typography>
                                                                                                        </>
                                                                                                    })}</Col>
                                                                                            </div>
                                                                                        )}
                                                                                    </>
                                                                                })}
                                                                            </Col>
                                                                            <div style={{ border: '2px solid red', padding: '0' }} />
                                                                        </>}
                                                                    {group?.sort_type == 1 &&
                                                                        <>
                                                                            <Row>
                                                                                    <Chip label={`ABC`} sx={{
                                                                                        margin: '0.5rem 0.5rem 0.5rem 0',
                                                                                        fontWeight: 'bold',
                                                                                        fontSize:'16px',
                                                                                        cursor: 'pointer',
                                                                                        height:'40px',
                                                                                        background:'transparent',
                                                                                        borderRadius:'0',
                                                                                        color: `${langChipSelected == 0 ? themeMode == 'dark' ? 'white' : 'black' : '#999999'}`,
                                                                                        '&:hover': {
                                                                                            textDecoration:'underline',
                                                                                            background:'transparent',
                                                                                        }
                                                                                    }}
                                                                                        onClick={() => { setLangChipSelected(0); sort(LANGCODE.ENG); setTextChipSelected(''); }}
                                                                                    />
                                                                                    <Chip label={`가나다`} sx={{
                                                                                        margin: '0.5rem 0.5rem 0.5rem 0',
                                                                                        fontWeight: 'bold',
                                                                                        fontSize:'16px',
                                                                                        cursor: 'pointer',
                                                                                        height:'40px',
                                                                                        background:'transparent',
                                                                                        borderRadius:'0',
                                                                                        color: `${langChipSelected == 1 ? themeMode == 'dark' ? 'white' : 'black' : '#999999'}`,
                                                                                        '&:hover': {
                                                                                            textDecoration:'underline',
                                                                                            background:'transparent',
                                                                                        }
                                                                                    }}
                                                                                        onClick={() => { setLangChipSelected(1); sort(LANGCODE.KOR); setTextChipSelected(''); }}
                                                                                    />
                                                                            </Row>
                                                                            <Row>
                                                                            {langChipSelected == 0 ?
                                                                                    <>
                                                                                        {alphabetList.map((alphabet) => {
                                                                                            return <>
                                                                                                <Chip
                                                                                                    label={alphabet}
                                                                                                    sx={{
                                                                                                        margin: '0.5rem 0rem 0.5rem 0',
                                                                                                        fontSize: '16px',
                                                                                                        cursor: 'pointer',
                                                                                                        color: `${textChipSelected == alphabet ? themeMode == 'dark' ? 'white' : 'black' : '#999999'}`,
                                                                                                        background: 'transparent',
                                                                                                        '&:hover': {
                                                                                                            color: `${textChipSelected == alphabet ? 'white' : ''}`,
                                                                                                            //background: `${textChipSelected == alphabet ? 'black' : ''}`,
                                                                                                        },
                                                                                                        borderRadius:'0',
                                                                                                        borderBottom:`${textChipSelected == alphabet ? '2px solid black' : ''}`
                                                                                                    }}
                                                                                                    onClick={() => { setTextChipSelected(alphabet); }}
                                                                                                />
                                                                                            </>
                                                                                        })}
                                                                                    </>
                                                                                    :
                                                                                    <>
                                                                                        {hangeulList.map((hangeul) => {
                                                                                            return <>
                                                                                                <Chip
                                                                                                    label={hangeul}
                                                                                                    variant="soft"
                                                                                                    sx={{
                                                                                                        margin: '0.5rem 0rem 0.5rem 0',
                                                                                                        fontSize: '16px',
                                                                                                        cursor: 'pointer',
                                                                                                        color: `${textChipSelected == hangeul ? themeMode == 'dark' ? 'white' : 'black' : '#999999'}`,
                                                                                                        background: 'transparent',
                                                                                                        '&:hover': {
                                                                                                            color: `${textChipSelected == hangeul ? 'white' : ''}`,
                                                                                                            //background: `${textChipSelected == hangeul ? 'black' : ''}`,
                                                                                                        },
                                                                                                        borderRadius:'0',
                                                                                                        borderBottom:`${textChipSelected == hangeul ? '2px solid black' : ''}`
                                                                                                    }}
                                                                                                    onClick={() => { setTextChipSelected(hangeul); }}
                                                                                                />
                                                                                            </>
                                                                                        })}
                                                                                    </>
                                                                                }
                                                                            </Row>
                                                                            <Col style={{ minWidth: '100px', flexWrap: 'wrap', alignItems: 'flex-start', maxHeight: '700px', rowGap: '0.2rem', marginBottom:'1rem' }}>

                                                                                {categoryGroup.map((group) => {
                                                                                    if (textChipSelected == '') {
                                                                                        return <>
                                                                                        <Row>
                                                                                            {
                                                                                                group.childs.map((child) => {
                                                                                                    return <Chip 
                                                                                                    label={langChipSelected == 0 ? child?.category_en_name : child?.category_name}
                                                                                                    sx={{
                                                                                                        margin: '0.5rem 0rem 0.5rem 0',
                                                                                                        fontSize: '16px',
                                                                                                        cursor: 'pointer',
                                                                                                        background: 'transparent',
                                                                                                        '&:hover': {
                                                                                                            background: `${themeMode == 'dark' ? '#999999' : 'white'}`,
                                                                                                        },
                                                                                                    }} 
                                                                                                    onClick={() => {
                                                                                                        router.push(`/shop/items?category_id${index}=${child?.id}&depth=0`)
                                                                                                        setOpenAllCategory("")
                                                                                                    }} />
                                                                                                })

                                                                                            }
                                                                                            </Row>
                                                                                        </>
                                                                                    }
                                                                                    else if (textChipSelected == group?.label) {
                                                                                        return <>
                                                                                            <Row>
                                                                                            {
                                                                                                group.childs.map((child) => {
                                                                                                    return <Chip 
                                                                                                    label={langChipSelected == 0 ? child?.category_en_name : child?.category_name}
                                                                                                    sx={{
                                                                                                        margin: '0.5rem 0rem 0.5rem 0',
                                                                                                        fontSize: '16px',
                                                                                                        cursor: 'pointer',
                                                                                                        background: 'transparent',
                                                                                                        '&:hover': {
                                                                                                            background: `${themeMode == 'dark' ? '#999999' : 'white'}`,
                                                                                                        },
                                                                                                    }} 
                                                                                                    onClick={() => {
                                                                                                        router.push(`/shop/items?category_id${index}=${child?.id}&depth=0`)
                                                                                                        setOpenAllCategory("")
                                                                                                    }} />
                                                                                                })

                                                                                            }
                                                                                            </Row>
                                                                                        </>
                                                                                    }
                                                                                })}

                                                                            </Col>

                                                                        </>}
                                                                </div>
                                                            </PopoverContainer>
                                                        </>}
                                                </div>
                                            </>
                                        }
                                    })}
                                </div>

                                <CategoryMenu borderColor={themeDnsData?.theme_css?.main_color} onClick={() => {
                                //setOpenAllCategory(group?.id)
                                router.push('shop/items/?not_show_select_menu=1&property_id=22')
                            }}>
                                <div>Best</div>
                            </CategoryMenu>
                            <CategoryMenu borderColor={themeDnsData?.theme_css?.main_color} onClick={() => {
                                //setOpenAllCategory(group?.id)
                                router.push('shop/items/?not_show_select_menu=1&property_id=21')
                            }}>
                                <div>New in</div>
                            </CategoryMenu>
                            <CategoryMenu borderColor={themeDnsData?.theme_css?.main_color} onClick={() => {
                                //setOpenAllCategory(group?.id)
                                router.push('shop/items/?not_show_select_menu=1&property_id=20')
                            }}>
                                <div>Sale</div>
                            </CategoryMenu>
                            <NoneShowMobile>
                                <div style={{ position: 'absolute', right: '0' }}>
                                    <IconButton
                                        sx={{ padding: '0', marginRight:'20px' }}
                                        onClick={() => {
                                            if (user) {
                                                router.push(`/shop/auth/my-page`)
                                            } else {
                                                router.push(`/shop/auth/login`)
                                            }
                                        }}
                                    >
                                        <Badge badgeContent={themeCartData.length} color="error">
                                            <Icon icon={'basil:user-outline'} width={'30px'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                        </Badge>
                                    </IconButton>
                                    <IconButton
                                    sx={{ padding: '0', marginRight:'20px' }}
                                    onClick={() => onToggleMode()}
                                >
                                    <Icon icon={themeMode === 'dark' ? 'tabler:sun' : 'tabler:moon-stars'} width={'25px'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                </IconButton>
                                    <IconButton
                                        sx={{ padding: '0' }}
                                        onClick={() => {
                                            if (user) {
                                                router.push(`/shop/auth/wish`)
                                            } else {
                                                router.push(`/shop/auth/login`)
                                            }
                                        }}
                                    >
                                        <Badge badgeContent={themeCartData.length} color="error">
                                            <Icon icon={'basil:heart-outline'} width={'30px'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                        </Badge>
                                    </IconButton>
                                </div>
                            </NoneShowMobile>
                            </CategoryContainer>
                        </div>
                        {/*<TopMenuContainer>
                            <NoneShowMobile>
                                <IconButton
                                    onClick={() => setSideMenuOpen(true)}
                                    sx={{ marginRight: '1rem' }}
                                >
                                    <Icon icon={'basil:menu-solid'} fontSize={'2rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                </IconButton>
                            </NoneShowMobile>
                            <CategoryMenu borderColor={themeDnsData?.theme_css?.main_color} onClick={() => {
                                setOpenAllCategory(11) //그랑파리 카테고리id가 11
                            }}>
                                <div>All Category</div>
                            </CategoryMenu>
                            <CategoryMenu borderColor={themeDnsData?.theme_css?.main_color} onClick={() => {
                                setOpenAllCategory(16) //그랑파리 카테고리id가 16
                            }}>
                                <div style={{ color: `${themeDnsData?.theme_css?.main_color}` }}>Find Brand</div>
                            </CategoryMenu>
                            <CategoryMenu borderColor={themeDnsData?.theme_css?.main_color} onClick={() => {
                                //setOpenAllCategory(group?.id)
                            }}>
                                <div>Best</div>
                            </CategoryMenu>
                            <CategoryMenu borderColor={themeDnsData?.theme_css?.main_color} onClick={() => {
                                //setOpenAllCategory(group?.id)
                            }}>
                                <div>New in</div>
                            </CategoryMenu>
                            <CategoryMenu borderColor={themeDnsData?.theme_css?.main_color} onClick={() => {
                                //setOpenAllCategory(group?.id)
                            }}>
                                <div>Sale</div>
                            </CategoryMenu>
                            <NoneShowMobile>
                                <div style={{ position: 'absolute', right: '0' }}>
                                    <IconButton
                                        sx={{ padding: '0', marginRight:'20px' }}
                                        onClick={() => {
                                            if (user) {
                                                router.push(`/shop/auth/my-page`)
                                            } else {
                                                router.push(`/shop/auth/login`)
                                            }
                                        }}
                                    >
                                        <Badge badgeContent={themeCartData.length} color="error">
                                            <Icon icon={'basil:user-outline'} width={'30px'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                        </Badge>
                                    </IconButton>
                                    <IconButton
                                    sx={{ padding: '0', marginRight:'20px' }}
                                    onClick={() => onToggleMode()}
                                >
                                    <Icon icon={themeMode === 'dark' ? 'tabler:sun' : 'tabler:moon-stars'} width={'25px'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                </IconButton>
                                    <IconButton
                                        sx={{ padding: '0' }}
                                        onClick={() => {
                                            if (user) {
                                                router.push(`/shop/auth/wish`)
                                            } else {
                                                router.push(`/shop/auth/login`)
                                            }
                                        }}
                                    >
                                        <Badge badgeContent={themeCartData.length} color="error">
                                            <Icon icon={'basil:heart-outline'} width={'30px'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                                        </Badge>
                                    </IconButton>
                                </div>
                            </NoneShowMobile>
                                    </TopMenuContainer>*/}
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
                }}>{item.category_en_name}</div>}
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
