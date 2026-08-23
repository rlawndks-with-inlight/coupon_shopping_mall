import Logo from "src/components/logo/Logo"
import { 헤더배경 } from "src/utils/overlay-icon";
import styled from "styled-components"
import { IconButton, TextField, InputAdornment } from "@mui/material"
import { useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { Row } from 'src/components/elements/styled-components'
import { useTheme } from '@mui/material/styles';
import { useSettingsContext } from "src/components/settings"
import { test_categories } from "src/data/test-data"
import { useRouter } from "next/router"
import DialogSearch from "src/components/dialog/DialogSearch"
import { logoSrc } from "src/data/data"
import LanguagePopover from "src/layouts/manager/header/LanguagePopover"

const Wrappers = styled.header`
width: 100%;
position: fixed;
top: 0;
display: flex;
flex-direction: column;
z-index: 10;
`
/* padding 을 없앤다 — 헤더 총높이(56px)는 1px 도 안 바뀐다.
   전역 box-sizing:border-box 라 height:56px + padding 0.5rem 이면 **콘텐츠 상자가 40px** 이고,
   그게 로고 40px 의 진짜 상한이었다. padding 만 걷어내면 총높이를 유지한 채 안쪽 여유가
   40px → 56px 로 늘어난다.
   이 프레임은 헤더가 position:fixed 이고 본문 상단 여백을 각 화면이 56px 로 하드코딩하고 있어서,
   헤더 높이를 실제로 키우면 그 전부를 함께 고쳐야 한다 — 그 위험을 통째로 피하는 선택이다. */
/* 로고를 '한 축'이 아니라 '상자'로 잡는다 — 이유는 shop/demo-1/header.js 의 LogoImg 주석 참고.
   ≤480px 은 변경 전(40px, 상한 없음 = 5:1 기준 200px)을 유지한다. 48px/220px 로 키우면
   컨테이너(width 90%, 320px 화면에서 288px)에서 우측 아이콘이 밀려 잘린다. */
const LogoImg = styled.img`
height: calc(48px * var(--logo-scale, 1));
width: auto;
max-width: calc(220px * var(--logo-scale, 1));
object-fit: contain;
flex-shrink: 0;
cursor: pointer;
@media (max-width:480px) {
  height: calc(40px * var(--logo-scale, 1));
  max-width: calc(200px * var(--logo-scale, 1));
}
`
const TopMenuContainer = styled.div`
display:flex;
padding: 0;
max-width: 720px;
width:90%;
margin: 0 auto;
align-items:center;
position:relative;
height: 56px;
`


const Header = (props) => {

    const { activeStep, setActiveStep, is_use_step } = props;
    const theme = useTheme();
    const router = useRouter();

    const { themeMode, onToggleMode, themeDnsData, themeCategoryList, onChangeCategoryList, onChangePostCategoryList } = useSettingsContext();
  // logoSrc() 는 안에서 useSettingsContext() 를 쓴다 - 즉 훅이다.
  // 아래 JSX 의 loading 분기 안에서 부르면 첫 렌더에는 안 불리고 그다음 렌더에만 불려
  // 훅 순서가 바뀐다(React: change in the order of Hooks). 여기서 한 번만 부른다.
  const 로고주소 = logoSrc();
    // ⚠ 이 헤더는 카테고리를 **화면에 그리지 않는다.**
    //    아래 categories state 와 hover 표까지 만들어 두지만 JSX 어디에도 나오지 않는다.
    //    그래서 카테고리 '별'(상단 메뉴 노출)은 이 프레임에서 아무 의미가 없다.
    //    한 번 여기에 별 필터를 넣었다가 물렸다 — 안 그리는 목록을 걸러 봐야 소용이 없고,
    //    오히려 '여기가 상단 메뉴를 그린다' 고 잘못 읽히게 만든다.
    //    상단 메뉴를 붙일 거라면 그때 이 목록을 렌더하면서 별로 거르면 된다.
    const headerCategories = (themeCategoryList ?? []).flatMap((g) => g?.product_categories ?? []);
    const [keyword, setKeyword] = useState("");
    const [isSellerPage, setIsSellerPage] = useState(false);
    const [isProductPage, setIsProductPage] = useState(false);
    const [dialogOpenObj, setDialogOpenObj] = useState({
        search: false
    })
    const onSearch = () => {
        router.push(`/shop/search?keyword=${keyword}`)
    }
    const [hoverItems, setHoverItems] = useState({

    })
    const [categories, setCategories] = useState(test_categories)
    const [loading, setLoading] = useState(true);
    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        setLoading(true);
        let hover_list = getAllIdsWithParents(categories);
        let hover_items = {};
        for (var i = 0; i < hover_list.length; i++) {
            hover_list[i] = hover_list[i].join('_');
            hover_items[`hover_${hover_list[i]}`] = false;
        }
        hover_items['service'] = false;
        setHoverItems(hover_items);
        settingHeader();
        setLoading(false);

    }, [])
    const settingHeader = async () => {
        setLoading(true);

        setCategories(headerCategories);

        setLoading(false);
    }
    useEffect(() => {
        if (router.asPath.split('/')[2] == 'seller') {
            setIsSellerPage(true)
        } else {
            setIsSellerPage(false)
        }
        // /blog/product/:id → /shop/item/:id 로 통일됨(예전 'product' 로는 상세 판별이 안 된다)
        if (router.asPath.split('/')[2] == 'item') {
            setIsProductPage(true)
        } else {
            setIsProductPage(false)
        }
    }, [router.asPath])
    function getAllIdsWithParents(categories) {
        const result = [];
        function traverseCategories(category, parentIds = []) {
            const idsWithParents = [...parentIds, category.id];
            result.push(idsWithParents);
            if (category.children && category.children.length > 0) {
                for (const child of category.children) {
                    traverseCategories(child, idsWithParents);
                }
            }
        }
        for (const category of categories) {
            traverseCategories(category);
        }
        return result;
    }
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollHeight = window.scrollY;
            setScrollY(currentScrollHeight)
        };
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    const onHoverCategory = (category_name) => {
        let hover_items = hoverItems;
        for (let key in hover_items) {
            hover_items[key] = false;
        }
        hover_items[category_name] = true;
        setHoverItems(hover_items);
    }
    const handleDialogClose = () => {
        let obj = { ...dialogOpenObj };
        for (let key in obj) {
            obj[key] = false
        }
        setDialogOpenObj(obj);
    }
    const isBackArrowShow = () => {
        // 상품상세에서 로고를 뒤로가기로 바꾸지 않는다 — 어느 몰인지 안 보이고,
        // 그 화면만 헤더가 딴판이 된다(가맹점 요청 2026-08-21).
        /*if (isProductPage) {
            return true;
        }*/
        /*if (router.asPath.includes('/my-page') || router.asPath.includes('/cart')) {
            return true;
        }*/
        return false;
    }
    return (
        <>
            {loading ?
                <>
                </>
                :
                <>
                    <DialogSearch
                        open={dialogOpenObj.search}
                        handleClose={handleDialogClose}
                        root_path={'/shop/search?keyword='}
                    />
                    <Wrappers style={{
                        // 사진 위일 때는 어두운 그라데이션을 깐다 — 흰 아이콘이 흰 상품사진에 묻힌다.
                        background: 헤더배경(isSellerPage && scrollY < 350,
                                             themeMode == 'dark' ? '#000' : '#fff')
                    }}
                    >
                        <TopMenuContainer>
                            {isBackArrowShow() || is_use_step ?
                                <>
                                    <IconButton
                                        sx={{ ...iconButtonStyle, marginLeft: '-4px' }}
                                        onClick={() => {
                                            if (is_use_step && activeStep > 0) {
                                                setActiveStep(activeStep - 1);
                                                return;
                                            }
                                            router.back()
                                        }}
                                    >
                                        <Icon icon={'ic:round-arrow-back'} fontSize={'1.8rem'} color={themeMode == 'dark' || (isSellerPage && scrollY < 350) ? '#fff' : '#000'} />
                                    </IconButton>
                                </>
                                :
                                <>
                                    {/* 위 TopMenuContainer 의 padding:0 과 세트다.
                                        콘텐츠 상자 56px 안에서 48px 이면 상하 4px 여유가 남는다. */}
                                    <LogoImg src={로고주소} onClick={() => { router.push('/shop') }} />
                                </>}

                            {/* 상품 목록 — 이 헤더에는 상품을 둘러볼 수단이 검색뿐이었다.
                                카테고리를 읽어 두기만 하고(headerCategories) 클릭 이동은 없었다.
                                고객이 찾는 물건의 '이름을 이미 알고 있을 때'만 살 수 있었다는 뜻이다. */}
                            <IconButton
                                sx={{ ...iconButtonStyle, marginLeft: 'auto' }}
                                onClick={() => router.push('/shop/items')}
                            >
                                <Icon icon={'material-symbols:grid-view-outline'} fontSize={'1.5rem'} color={themeMode == 'dark' || (isSellerPage && scrollY < 350) ? '#fff' : '#000'} />
                            </IconButton>
                            <IconButton
                                sx={{ ...iconButtonStyle, marginRight: '1rem' }}
                                onClick={() => {
                                    setDialogOpenObj({
                                        ...dialogOpenObj,
                                        ['search']: true
                                    })
                                }}
                            >
                                <Icon icon={'iconoir:search'} fontSize={'1.5rem'} color={themeMode == 'dark' || (isSellerPage && scrollY < 350) ? '#fff' : '#000'} />
                            </IconButton>
                            {/* 언어 선택 — 이 헤더엔 언어 UI 가 없어 설정을 켜도 고객이 언어를 바꿀 수 없었다. */}
                            {themeDnsData?.setting_obj?.is_use_lang == 1 && <LanguagePopover />}
                            {/*
                             <IconButton
                                sx={iconButtonStyle}
                                onClick={() => router.push('/shop/auth/cart')}
                            >
                                <Icon icon={'fluent:cart-20-regular'} fontSize={'1.8rem'} color={themeMode == 'dark' || (isSellerPage && scrollY < 350) ? '#fff' : '#000'} />
                            </IconButton>
                             */}

                        </TopMenuContainer>
                    </Wrappers>
                </>}
        </>
    )
}
const iconButtonStyle = {
    padding: '0.1rem',
    marginLeft: '0.5rem'
}
export default Header
