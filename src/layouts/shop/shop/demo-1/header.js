import Logo from "src/components/logo/Logo"
import styled from "styled-components"
import { IconButton, TextField, InputAdornment, Drawer } from "@mui/material"
import { forwardRef, useEffect, useState } from "react"
import { Icon } from "@iconify/react"
import { Row } from 'src/components/elements/styled-components'
import { useTheme } from '@mui/material/styles';
import { useSettingsContext } from "src/components/settings"
import { test_categories } from "src/data/test-data"
import { useRouter } from "next/router"
import { TreeItem, TreeView } from "@mui/lab"

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
max-width: 1200px;
width:90%;
margin: 0 auto;
align-items:center;
position:relative;
@media (max-width:1000px) {
  padding: 0.5rem 0;
}
`
const CategoryContainer = styled.div`
max-width: 1222px;
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
margin-top:131px;
@media (max-width:1000px) {
  margin-top:99px;
}
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
top:53px;
z-index:10;
left: -22px;
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
&:hover{
  background: ${props => props.theme.palette.grey[300]};
}
`
const SubDropDownMenuContainer = styled.div`
position: absolute;
left: 144px;
top:0;
display: none;
text-align:left;
padding:0.5rem;
width:144px;
flex-direction:column;
.menu-${props => props.parentId}:hover & {
  display: flex;
}
`
const SubSubDropDownMenuContainer = styled.div`
position: absolute;
left: 144px;
top:0;
display: none;
text-align:left;
padding:0.5rem;
width:144px;
flex-direction:column;
.menu-${props => props.parentId}:hover & {
  display: flex;
}
`
const Header = () => {

  const router = useRouter();
  const theme = useTheme();
  const { themeMode, onToggleMode, themeAuth } = useSettingsContext();
  const [keyword, setKeyword] = useState("");
  const onSearch = () => {

  }
  const [isAuthMenuOver, setIsAuthMenuOver] = useState(false)
  const [hoverItems, setHoverItems] = useState({

  })
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [categories, setCategories] = useState(test_categories)
  const [loading, setLoading] = useState(true);
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
        <DropDownMenu theme={theme} className={`menu-${item?.id}`}>
          <div>{item.category_name}</div>
          <div>{item.children.length > 0 ? '>' : ''}</div>
          {item.children.length > 0 ?
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
            <>
            </>}
        </DropDownMenu>
      </>
    )
  }
  return (
    <>
      {loading ?
        <>
        </>
        :
        <>
          <Wrappers style={{
            background: `${themeMode == 'dark' ? '#000' : '#fff'}`
          }}
          >
            <TopMenuContainer>
              <img src={'https://backend.comagain.kr/storage/images/logos/IFFUcyTPtgF887r0RPOGXZyLLPvp016Je17MENFT.svg'} style={{ height: '40px', width: 'auto' }} />
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
                  sx={iconButtonStyle}
                  onClick={() => onSearch()}
                >
                  <Icon icon={'basil:user-outline'} fontSize={'1.8rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                </IconButton>
                <IconButton
                  sx={iconButtonStyle}
                  onClick={() => onSearch()}
                >
                  <Icon icon={'basil:heart-outline'} fontSize={'2rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                </IconButton>
                <IconButton
                  sx={iconButtonStyle}
                  onClick={() => onSearch()}
                >
                  <Icon icon={'basil:shopping-bag-outline'} fontSize={'1.8rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
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
                  <AuthMenu theme={theme} hoverColor={themeMode == 'dark' ? '#fff' : '#000'} onClick={() => { router.push('/shop/auth/sign-up') }}>회원가입</AuthMenu>
                  <AuthMenu theme={theme} hoverColor={themeMode == 'dark' ? '#fff' : '#000'} onClick={() => { router.push('/shop/auth/login') }}>로그인</AuthMenu>
                  <AuthMenu theme={theme} hoverColor={themeMode == 'dark' ? '#fff' : '#000'} >주문조회</AuthMenu>
                  <AuthMenu theme={theme} hoverColor={themeMode == 'dark' ? '#fff' : '#000'}>최근본상품</AuthMenu>
                  <AuthMenu theme={theme} hoverColor={themeMode == 'dark' ? '#fff' : '#000'} style={{ borderRight: 'none' }}>좋아요 0개</AuthMenu>
                </div>
                <div className="fade-in-text" style={{ display: `${isAuthMenuOver ? 'none' : 'flex'}`, alignItems: 'center' }}>
                  <AuthMenu theme={theme}>회원가입</AuthMenu>
                  <AuthMenu theme={theme} style={{ borderRight: 'none' }}>로그인</AuthMenu>
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
                  onClick={() => onSearch()}
                >
                  <Icon icon={'tabler:search'} fontSize={'1.5rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                </IconButton>
                <IconButton
                  sx={iconButtonStyle}
                  onClick={() => onSearch()}
                >
                  <Icon icon={'basil:shopping-bag-outline'} fontSize={'1.8rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                </IconButton>
                <IconButton
                  sx={iconButtonStyle}
                  onClick={() => onToggleMode()}
                >
                  <Icon icon={themeMode === 'dark' ? 'tabler:sun' : 'tabler:moon-stars'} fontSize={'1.5rem'} color={themeMode == 'dark' ? '#fff' : '#000'} />
                </IconButton>
              </ShowMobile>
            </TopMenuContainer>
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
              <NoneShowMobile style={{ justifyContent: 'space-between', width: '100%' }}>
                {categories.map((item1, idx1) => (
                  <>
                    <CategoryMenu borderColor={themeMode == 'dark' ? '#fff' : '#000'} className={`menu-${item1?.id}`} onClick={() => {

                    }}>
                      <div>{item1.category_name}</div>
                      {item1?.children.length > 0 ?
                        <>
                          <DropDownMenuContainer parentId={item1?.id} style={{
                            border: `1px solid ${theme.palette.grey[300]}`,
                            width: `${item1.category_img ? '430px' : '144px'}`,
                            fontSize: '12px',
                            fontWeight: 'normal',
                            background: `${themeMode == 'dark' ? '#000' : '#fff'}`
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

                    </CategoryMenu>
                  </>
                ))}
                <CategoryMenu borderColor={themeMode == 'dark' ? '#fff' : '#000'} className={`menu-service`} >
                  <div>고객센터</div>
                  <DropDownMenuContainer parentId={'service'} style={{
                    border: `1px solid ${theme.palette.grey[300]}`,
                    width: `144px`,
                    fontSize: '12px',
                    fontWeight: 'normal',
                    background: `${themeMode == 'dark' ? '#000' : '#fff'}`
                  }}>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      width: '144px'
                    }}>
                      {[
                        {
                          name: '공지사항',
                          link_key: 'notice'
                        },
                        {
                          name: 'FAQ',
                          link_key: 'faq'
                        },
                      ].map((item, idx) => (
                        <>
                          <DropDownMenu theme={theme}
                            onClick={() => {
                              router.push(`/shop/service/${item.link_key}`)
                            }}>
                            <div>{item.name}</div>
                          </DropDownMenu>
                        </>
                      ))}
                    </div>
                  </DropDownMenuContainer>
                </CategoryMenu>
              </NoneShowMobile>
              <ShowMobile style={{
                whiteSpace: 'nowrap',
                overflowX: 'auto'
              }}
                className="none-scroll"
              >
                {categories.map((item1, idx1) => (
                  <>
                    <CategoryMenu borderColor={themeMode == 'dark' ? '#fff' : '#000'} onMouseOver={() => {
                      onHoverCategory(`hover_${item1?.id}`)
                    }}
                    >
                      <div>{item1.category_name}</div>
                    </CategoryMenu>
                  </>
                ))}
                <CategoryMenu borderColor={themeMode == 'dark' ? '#fff' : '#000'}>고객센터</CategoryMenu>
              </ShowMobile>
              <NoneShowMobile style={{
                marginLeft: 'auto'
              }}>
              </NoneShowMobile>
            </CategoryContainer>
            <div style={{ borderBottom: `1px solid ${theme.palette.grey[300]}` }} />
          </Wrappers>
        </>}
      <PaddingTop />
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
            aria-label="icon expansion"
            defaultCollapseIcon={<Icon icon={'ic:baseline-minus'} />}
            defaultExpandIcon={<Icon icon={'ic:baseline-plus'} />}
          >
            {categories.map((item1, idx) => (
              <>
                {returnSidebarMenu(item1, 1)}
              </>
            ))}
          </TreeView>

          <ColumnMenuTitle>고객센터</ColumnMenuTitle>
          {[
            {
              name: '공지사항',
              link_key: 'notice'
            },
            {
              name: 'FAQ',
              link_key: 'faq'
            },
          ].map((item, idx) => (
            <>
              <ColumnMenuContent onClick={() => {
                router.push(`/shop/service/${item.link_key}`)
              }} style={{ paddingLeft: '1rem' }}>{item.name}</ColumnMenuContent>
            </>
          ))}
          <ColumnMenuTitle style={{
            cursor: 'pointer'
          }}>마이페이지</ColumnMenuTitle>
        </ColumnMenuContainer>
      </Drawer>
    </>
  )
}
const returnSidebarMenu = (item, num) => {
  return (
    <>
      <TreeItem label={item.category_name}
      nodeId={item.id}
      // style={{ paddingLeft: `${num}rem` }}
      >
        {item.children.map((item2, idx) => (
          <>
            {returnSidebarMenu(item2, num + 1)}
          </>
        ))}
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
        padding:2rem 0 0.5rem 0;
        font-weight: bold;
        `
const ColumnMenuContent = styled.div`
        display:flex;
        align-items:center;
        padding:0.5rem 0;
        cursor:pointer;
        `
const iconButtonStyle = {
  padding: '0.1rem',
  marginLeft: '0.5rem'
}
export default Header
