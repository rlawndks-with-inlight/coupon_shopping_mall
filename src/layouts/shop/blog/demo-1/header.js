import Logo from "src/components/logo/Logo"
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

  const { themeMode, onToggleMode } = useSettingsContext();
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
    setLoading(false);
  }, [])

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
    if(isProductPage){
      return true;
    }
    if(router.asPath.includes('/my-page')){
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
            root_path={'blog'}
          />
          <Wrappers style={{
            background: `${(isSellerPage || isProductPage) && scrollY < 350 ? 'transparent' : (themeMode == 'dark' ? '#000' : '#fff')}`
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
                    <Icon icon={'ic:round-arrow-back'} fontSize={'1.8rem'} color={themeMode == 'dark' || ((isSellerPage || isProductPage) && scrollY < 350) ? '#fff' : '#000'} />
                  </IconButton>
                </>
                :
                <>
                  <img src={logoSrc} style={{ height: '40px', width: 'auto', cursor: 'pointer' }} onClick={() => { router.push('/blog') }} />
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
                <Icon icon={'tabler:search'} fontSize={'1.5rem'} color={themeMode == 'dark' || ((isSellerPage || isProductPage) && scrollY < 350) ? '#fff' : '#000'} />
              </IconButton>
              <IconButton
                sx={iconButtonStyle}
                onClick={() => router.push('/blog/auth/my-page')}
              >
                <Icon icon={'basil:user-outline'} fontSize={'1.8rem'} color={themeMode == 'dark' || ((isSellerPage || isProductPage) && scrollY < 350) ? '#fff' : '#000'} />
              </IconButton>
              <IconButton
                sx={iconButtonStyle}
                onClick={() => router.push('/blog/auth/cart')}
              >
                <Icon icon={'basil:shopping-bag-outline'} fontSize={'1.8rem'} color={themeMode == 'dark' || ((isSellerPage || isProductPage) && scrollY < 350) ? '#fff' : '#000'} />
              </IconButton>
              <IconButton
                sx={iconButtonStyle}
                onClick={() => onToggleMode()}
              >
                <Icon icon={themeMode === 'dark' ? 'tabler:sun' : 'tabler:moon-stars'} fontSize={'1.5rem'} color={themeMode == 'dark' || ((isSellerPage || isProductPage) && scrollY < 350) ? '#fff' : '#000'} />
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
