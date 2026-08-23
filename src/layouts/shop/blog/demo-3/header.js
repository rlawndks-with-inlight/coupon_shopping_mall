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
padding: 0.5rem 0;
max-width: 798px;
width:90%;
margin: 0 auto;
align-items:center;
position:relative;
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
        if (router.asPath.split('/')[2] == 'product') {
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
        if (router.asPath.includes('/my-page') || router.asPath.includes('/cart')) {
            return true;
        }
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
                                    <img src={로고주소} style={{ height: 'calc(40px * var(--logo-scale, 1))', width: 'auto', cursor: 'pointer' }} onClick={() => { router.push('/shop') }} />
                                </>}
                            <IconButton
                                sx={{ ...iconButtonStyle, marginLeft: 'auto' }}
                                onClick={() => {
                                    setDialogOpenObj({
                                        ...dialogOpenObj,
                                        ['search']: true
                                    })
                                }}
                            >
                                <Icon icon={'tabler:search'} fontSize={'1.5rem'} color={themeMode == 'dark' || (isSellerPage && scrollY < 350) ? '#fff' : '#000'} />
                            </IconButton>
                            <IconButton
                                sx={iconButtonStyle}
                                onClick={() => router.push('/shop/auth/my-page')}
                            >
                                <Icon icon={'basil:user-outline'} fontSize={'1.8rem'} color={themeMode == 'dark' || (isSellerPage && scrollY < 350) ? '#fff' : '#000'} />
                            </IconButton>
                            <IconButton
                                sx={iconButtonStyle}
                                onClick={() => router.push('/shop/auth/cart')}
                            >
                                <Icon icon={'basil:shopping-bag-outline'} fontSize={'1.8rem'} color={themeMode == 'dark' || (isSellerPage && scrollY < 350) ? '#fff' : '#000'} />
                            </IconButton>
                            <IconButton
                                sx={iconButtonStyle}
                                onClick={() => onToggleMode()}
                            >
                                <Icon icon={themeMode === 'dark' ? 'tabler:sun' : 'tabler:moon-stars'} fontSize={'1.5rem'} color={themeMode == 'dark' || (isSellerPage && scrollY < 350) ? '#fff' : '#000'} />
                            </IconButton>
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
