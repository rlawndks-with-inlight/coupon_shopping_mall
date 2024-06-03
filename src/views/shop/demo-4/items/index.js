import { Icon } from "@iconify/react";
import { Button, Chip, CircularProgress, IconButton, InputAdornment, TextField, Typography, Stack, Skeleton, FormControl, InputLabel, Select, MenuItem, Box, Pagination, Divider } from "@mui/material";
import _ from "lodash";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Items } from "src/components/elements/shop/common";
import { ContentBorderContainer, SubTitleComponent } from "src/components/elements/shop/demo-4";
import { Col, Row, Title, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiShop } from "src/utils/api";
import styled, { css } from "styled-components";
import $ from 'jquery';
import { CategorySorter, LANGCODE } from "src/views/shop/demo-4/header"
import queryString from 'query-string'

const ContentWrapper = styled.div`
max-width:1400px;
width:90%;
margin: 0 auto 5rem auto;
display:flex;
flex-direction:column;
${({ width }) => css`
--parentWidth: ${width};
`}
`

const BrandFilter = styled.div`
font-size:44px;
max-width: 1400px;
width:var(--parentWidth);
z-index: 9;
@media (max-width:1000px) {
  font-size:22px;
}
`

const FilterTab = styled.div`
display:flex;
margin:auto 0 auto auto;
@media screen and (max-width:500px) {
  font-size:0.75rem;
}
`

const ItemsDemo = (props) => {

  const router = useRouter();
  const { user } = useAuthContext();
  const { themeDnsData, themeCategoryList, themePropertyList, themeMode } = useSettingsContext();
  const [categoryIds, setCategoryIds] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 20,
  })
  const [curCategory, setCurCategory] = useState({

  })
  const [productContent, setProductContent] = useState({});
  const [moreLoading, setMoreLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const [categoryChildren, setCategoryChildren] = useState({});
  const [langChipSelected, setLangChipSelected] = useState(0)
  const [textChipSelected, setTextChipSelected] = useState('A')
  const { sort, categoryGroup } = CategorySorter(themeCategoryList)
  const [filterOpen, setFilterOpen] = useState(false)
  const [detailCategory, setDetailCategory] = useState()

  useEffect(() => {
    sort(LANGCODE.ENG)
  }, [])

  const sortList = [
    /*{
      label: '그랑파리랭킹순',
      order: 'sort_idx',
      is_asc: 0,
    },*/
    {
      label: '최근등록순',
      order: 'created_at',
      is_asc: 0,
    },
    {
      label: '높은가격순',
      order: 'product_sale_price',
      is_asc: 0,
    },
    {
      label: '낮은가격순',
      order: 'product_sale_price',
      is_asc: 1,
    },
  ]
  useEffect(() => {
    getItemList({ ...router.query }, searchObj)
  }, [
    router.query.category_id0, 
    router.query.category_id1, 
    router.query.category_id2, 
    router.query.search, 
    router.query.property_ids0,
    router.query.page,
    router.query.page_size
  ])

  useEffect(() => {
    setFilterOpen(false)
    setDetailCategory()
    //console.log(themeCategoryList)
  }, [router.query])

  /*const handleScroll = () => {
    if (!scrollRef.current) {
      return;
    }
    const { top, bottom } = scrollRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    if (top < windowHeight && bottom >= 0 && !moreLoading) {
      
      setMoreLoading(true);
      $('.more-page').trigger("click");
    }
  };*/

  const getItemList = async (query_ = {}, search_obj_ = {}) => {
    let query = query_;
    let search_obj = search_obj_;

    //console.log(query)
    //console.log(search_obj)
    //setLoading(true);
    setCategoryIds(query);
    let category_children = {};
    for (var i = 0; i < themeCategoryList.length; i++) {
      let find_category = undefined;
      delete search_obj[`category_id${i}`];
      for (var j = 0; j < themeCategoryList[i]?.product_categories.length; j++) {
        let category = themeCategoryList[i]?.product_categories[j];
        let children = (category?.children ?? []).map(item => { return item?.id });
        if (query[`category_id${i}`] == category?.id || children?.includes(parseInt(query[`category_id${i}`]))) {
          find_category = category;
          break;
        }
      }
      if (find_category && find_category?.children.length > 0) {
        category_children = {
          ...category_children,
          [`category_id${i}`]: {
            parent_id: find_category?.id,
            children: find_category?.children
          }
        }
      }
    }
    let query_str = new URLSearchParams(query).toString();
    router.push(`/shop/items?${query_str}`);

    setCategoryChildren(category_children)
    setSearchObj({ ...search_obj, ...query });
    let product_list = await apiShop('product', 'list', {
      ...search_obj,
      ...query
    })
    if (product_list.content.length == 0) {
      setProductContent({
        ...productContent,
        total: -1,
      })
    }
    setProductContent(product_list);
    
    // if (is_first) {
    //   setProductContent(product_list);
    //   setLoading(false);
    // } else {
    //   setProductContent({
    //     ...product_list,
    //     content: [...product_list.content ?? []]
    //   });
    // }
  }
  useEffect(() => {
    if ((productContent?.content ?? []).length > 0) {
      setLoading(false);
    }
  }, [productContent?.content])

  const getMaxPage = (total, page_size) => {
    if (total == 0) {
      return 1;
    }
    if (total % page_size == 0) {
      return parseInt(total / page_size);
    } else {
      return parseInt(total / page_size) + 1;
    }
  }

  const alphabetList = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N',
    'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '#'
  ]

  const hangeulList = [
    '가', '나', '다', '라', '마', '바', '사', '아', '자', '차', '카', '타', '파', '하', '#'
  ]

  useEffect(() => {
    const query = new URLSearchParams(router.query).toString()

    const savedScrollPosition = sessionStorage.getItem(`scrollPosition${query}`);
    if (savedScrollPosition && !loading) {  
      window.scrollTo(0, parseInt(savedScrollPosition, 10));
      console.log(sessionStorage)
      sessionStorage.removeItem(`scrollPosition${query}`);
    }
    const handleRouteChangeStart = () => {
      if (!loading) { //items는 메인화면과 다르게 이 조건을 걸어주지 않으면 scrollTo를 실행하기 전에 scrollPosition을 0으로 바꾸는 문제 있음
        sessionStorage.setItem(`scrollPosition${query}`, window.scrollY);
      }
    };
    console.log(sessionStorage)
    router.events.on('routeChangeStart', handleRouteChangeStart);
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [loading])

  return (
    <>
      <ContentWrapper width={'90%'}>

        {router.query?.property_ids0 &&
          <>
            <Title style={{ marginTop: '100px', fontFamily: 'Playfair Display', color: '#000', fontWeight: 'normal', fontSize: '90px', marginLeft: '0' }}>
              {themePropertyList.map((group) => {
                let properties = group?.product_properties;
                if (_.find(properties, { id: parseInt(router.query?.property_ids0) })) {
                  return _.find(properties, { id: parseInt(router.query?.property_ids0) })?.property_name
                } else {
                  return ""
                }
              })}
            </Title>
          </>}
        {router.query?.category_id0 ?
          <>
            <Title style={{ marginTop: '100px', fontFamily: 'Playfair Display', color: '#000', fontWeight: 'normal', fontSize: '90px', marginLeft: '0' }}>
              {themeCategoryList.map((group, index) => {
                let categories = group?.product_categories;
                if (_.find(categories, { id: parseInt(router.query?.category_id0) })) {
                  return _.find(categories, { id: parseInt(router.query?.category_id0) })?.category_en_name
                } else {
                  return ""
                }
              })}
            </Title>
          </>
          :
          router.query?.category_id1 ?
            <>
              <Title style={{ marginTop: '100px', fontFamily: 'Playfair Display', color: '#000', fontWeight: 'normal', fontSize: '90px', marginLeft: '0' }}>
                {themeCategoryList.map((group, index) => {
                  let categories = group?.product_categories;
                  if (_.find(categories, { id: parseInt(router.query?.category_id1) })) {
                    return _.find(categories, { id: parseInt(router.query?.category_id1) })?.category_en_name
                  } else {
                    return ""
                  }
                })}
              </Title>
            </>
            :
            ''
        }
        {router.query?.not_show_select_menu != 1 &&
          <>
            <Row style={{ justifyContent: 'space-between', minHeight: '50px', direction: 'rtl' }}>
              <img
                src={filterOpen ? '/grandparis/dropdown_02.png' : '/grandparis/dropdown_01.png'}
                style={{
                  maxHeight: '40px',
                  margin: 'auto 0',
                  marginRight: '0',
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setFilterOpen(!filterOpen)
                  console.log(themeCategoryList)
                }}
              />
              {themeCategoryList.map((group, index) => {
                return <>
                  {categoryChildren[`category_id${index}`] &&
                    <div style={{ maxHeight: '150px', overflowX: 'auto', minHeight: '50px', direction: 'ltr' }}>
                      {categoryChildren[`category_id${index}`]?.children.map((category, idx) => (
                        <>
                          <Button
                            sx={{
                              fontWeight: `${categoryIds[`category_id${index}`] == category?.id ? 'bold' : 'normal'}`,
                              margin: '1rem',
                              borderBottom: `${categoryIds[`category_id${index}`] == category?.id ? '2px solid black' : ''}`,
                              cursor: 'pointer',
                              borderRadius: '0',
                              color: `${themeMode == 'dark' ? 'white' : 'black'}`,
                              '&:hover': {
                                textDecoration: 'underline',
                                background: 'transparent',
                              }
                            }}
                            onClick={() => {
                              let query = { ...categoryIds };
                              query[`category_id${index}`] = category?.id;
                              query = new URLSearchParams(query).toString();
                              router.push(`/shop/items?${query}`);
                            }}>
                            {category?.category_en_name ?? category?.category_name}
                          </Button >
                        </>
                      ))}
                    </div>
                  }
                </>
              })}
            </Row>
          </>
        }




        <>
          {themeCategoryList.map((group, index) => {

            return <Row>
              <BrandFilter style={{ fontFamily: 'Playfair Display', overflowY: 'auto', background: `${themeMode == 'dark' ? '#222' : '#FEF8F4'}`, display: `${filterOpen ? '' : 'none'}`, position: 'absolute', }}>

                <>
                  <div style={{ margin: '0.5rem', fontSize: '22px', fontWeight: 'bold' }}>Brand</div>
                  <Row>
                    <Chip label={`ABC`} sx={{
                      margin: '0.5rem 0.5rem 0.5rem 0',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      cursor: 'pointer',
                      height: '40px',
                      background: 'transparent',
                      borderRadius: '0',
                      fontFamily: 'Playfair Display',
                      color: `${langChipSelected == 0 ? themeMode == 'dark' ? 'white' : 'black' : '#999999'}`,
                      '&:hover': {
                        textDecoration: 'underline',
                        background: 'transparent',
                      }
                    }}
                      onClick={() => { setLangChipSelected(0); sort(LANGCODE.ENG); setTextChipSelected('A'); }}
                    />
                    <Chip label={`가나다`} sx={{
                      margin: '0.5rem 0.5rem 0.5rem 0',
                      fontWeight: 'bold',
                      fontSize: '16px',
                      cursor: 'pointer',
                      height: '40px',
                      background: 'transparent',
                      borderRadius: '0',
                      fontFamily: 'Noto Sans KR',
                      color: `${langChipSelected == 1 ? themeMode == 'dark' ? 'white' : 'black' : '#999999'}`,
                      '&:hover': {
                        textDecoration: 'underline',
                        background: 'transparent',
                      }
                    }}
                      onClick={() => { setLangChipSelected(1); sort(LANGCODE.KOR); setTextChipSelected('가'); }}
                    />
                  </Row>
                  <Row style={{ flexWrap: 'wrap' }}>
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
                                fontFamily: 'Playfair Display',
                                '&:hover': {
                                  color: `${textChipSelected == alphabet ? 'white' : ''}`,
                                  //background: `${textChipSelected == alphabet ? 'black' : ''}`,
                                },
                                borderRadius: '0',
                                borderBottom: `${textChipSelected == alphabet ? '2px solid black' : ''}`
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
                                fontFamily: 'Noto Sans KR',
                                '&:hover': {
                                  color: `${textChipSelected == hangeul ? 'white' : ''}`,
                                  //background: `${textChipSelected == hangeul ? 'black' : ''}`,
                                },
                                borderRadius: '0',
                                borderBottom: `${textChipSelected == hangeul ? '2px solid black' : ''}`
                              }}
                              onClick={() => { setTextChipSelected(hangeul); }}
                            />
                          </>
                        })}
                      </>
                    }
                  </Row>
                  <Col style={{ minWidth: '100px', flexWrap: 'wrap', alignItems: 'flex-start', rowGap: '0.2rem', marginBottom: '1rem', }}>

                    {categoryGroup.map((group) => {
                      if (textChipSelected == '') {
                        return <>
                          <Row style={{ flexWrap: 'wrap' }}>
                            {
                              group.childs.map((child) => {
                                return <Chip
                                  label={langChipSelected == 0 ? child?.category_en_name : child?.category_name}
                                  sx={{
                                    margin: '0.5rem 0rem 0.5rem 0',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    background: 'transparent',
                                    fontFamily: `${langChipSelected == 0 ? 'Playfair Display' : 'Noto Sans KR'}`,
                                    '&:hover': {
                                      background: `${themeMode == 'dark' ? '#999999' : 'white'}`,
                                    },
                                  }}
                                  onClick={() => {
                                    const parsedUrl = queryString.parseUrl(router.asPath).query;
                                    parsedUrl[`category_id${index}`] = child?.id
                                    const updatedUrl = queryString.stringifyUrl({ url: queryString.parseUrl(router.asPath).url, query: parsedUrl })

                                    router.push(updatedUrl)
                                  }} />
                              })

                            }
                          </Row>
                        </>
                      }
                      else if (textChipSelected == group?.label) {
                        return <>
                          <Row style={{ flexWrap: 'wrap' }}>
                            {
                              group.childs.map((child) => {
                                return <Chip
                                  label={langChipSelected == 0 ? child?.category_en_name : child?.category_name}
                                  sx={{
                                    margin: '0.5rem 0rem 0.5rem 0',
                                    fontSize: '16px',
                                    cursor: 'pointer',
                                    background: 'transparent',
                                    fontFamily: `${langChipSelected == 0 ? 'Playfair Display' : 'Noto Sans KR'}`,
                                    '&:hover': {
                                      background: `${themeMode == 'dark' ? '#999999' : 'white'}`,
                                    },
                                  }}
                                  onClick={() => {
                                    const parsedUrl = queryString.parseUrl(router.asPath).query;
                                    parsedUrl[`category_id${index}`] = child?.id
                                    const updatedUrl = queryString.stringifyUrl({ url: queryString.parseUrl(router.asPath).url, query: parsedUrl })

                                    router.push(updatedUrl)
                                  }} />
                              })

                            }
                          </Row>
                        </>
                      }
                    })}

                  </Col>
                    
                    <Row style={{ flexWrap: 'wrap', display: 'flex', borderBottom: '1px solid #999999',  }}>
                      {group?.sort_type == 0 && group?.product_categories && group?.product_categories.map((category, idx) => {
                        if (category.name != 'PRIVATE') {
                          return <>
                          {idx == 0 && <div style={{margin:'0.5rem', fontSize:'22px', fontWeight:'bold'}} >Category</div>}
                            <Chip
                              label={category.category_name}
                              sx={{
                                margin: '0.5rem 0rem 0.5rem 0',
                                fontSize: '16px',
                                cursor: 'pointer',
                                background: 'transparent',
                                fontFamily: `${langChipSelected == 0 ? 'Playfair Display' : 'Noto Sans KR'}`,
                                '&:hover': {
                                  background: `${themeMode == 'dark' ? '#999999' : 'white'}`,
                                },
                              }}
                              onClick={() => {
                                if (category.children) {
                                  setDetailCategory(category.id);
                                  console.log(detailCategory)
                                } else {
                                const parsedUrl = queryString.parseUrl(router.asPath).query;
                                parsedUrl[`category_id0`] = category?.id
                                const updatedUrl = queryString.stringifyUrl({ url: queryString.parseUrl(router.asPath).url, query: parsedUrl })

                                router.push(updatedUrl)
                                }
                              }} />
                        </>
                        }
                      })}
                    </Row>
                    <Row>
                      {group?.sort_type == 0 && group.product_categories && group?.product_categories.map((category, idx) => {
                        return <>
                        {detailCategory == category.id && category.children.map((child, idx) => {
                          return <>
                          <Chip
                            label={child.category_name}
                            sx={{
                              margin: '0.5rem 0rem 0.5rem 0',
                              marginLeft: `${idx == 0 ? '7rem' : '0.5rem'}`,
                              fontSize: '16px',
                              cursor: 'pointer',
                              background: 'transparent',
                              fontFamily: `${langChipSelected == 0 ? 'Playfair Display' : 'Noto Sans KR'}`,
                              '&:hover': {
                                background: `${themeMode == 'dark' ? '#999999' : 'white'}`,
                              },
                            }}
                            onClick={() => {
                              const parsedUrl = queryString.parseUrl(router.asPath).query;
                              parsedUrl[`category_id0`] = child?.id
                              const updatedUrl = queryString.stringifyUrl({ url: queryString.parseUrl(router.asPath).url, query: parsedUrl })

                              router.push(updatedUrl)
                            }} />
                      </>
                        })}
                        </>
                      })}
                    </Row>
                </>


              </BrandFilter>
            </Row>
          }

          )
          }
        </>

        <>
          <TextField
            label=''
            variant="standard"
            focused
            //color='primary'
            onChange={(e) => {
              setSearchObj({
                ...searchObj,
                search: e.target.value
              })
            }}
            value={searchObj?.search}
            style={{ width: '100%', margin: '2rem auto 4rem auto', maxWidth: '700px', }}
            autoComplete='new-password'
            placeholder="키워드를 검색해주세요."
            onKeyPress={(e) => {
              if (e.key == 'Enter') {
                let query = { ...categoryIds };
                query[`search`] = searchObj?.search;

                query = new URLSearchParams(query).toString();
                router.push(`/shop/items?${query}`);
              }
            }}
            InputProps={{
              sx: {
                padding: '0.5rem 0'
              },
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton
                    edge='end'
                    onClick={() => {
                      let query = { ...categoryIds };
                      query[`search`] = searchObj?.search;
                      query = new URLSearchParams(query).toString();
                      router.push(`/shop/items?${query}`);
                    }}
                    aria-label='toggle password visibility'
                    style={{
                      padding: '0.5rem',
                    }}
                  >
                    <Icon icon={'tabler:search'} />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

        </>


        <Row
          style={{
            columnGap: '0.5rem',
            marginBottom: '1rem',
            overflowX: 'auto',
            whiteSpace: 'nowrap',
            borderTop: '1px solid #CCCCCC',
            borderBottom: '1px solid #CCCCCC',
            height: '80px',
            width: '100%'
          }}
          className={`none-scroll`}
        >
          <FilterTab style={{ margin: 'auto 0 auto auto', display: 'flex' }}>
            {sortList.map((item) => (
              <>
                <div
                  style={{
                    cursor: 'pointer',
                    margin: '0.5rem',
                    fontWeight: `${(searchObj?.order ?? "sort_idx") == item.order && (searchObj?.is_asc ?? 0) == item.is_asc ? 'bold' : ''}`,
                    borderBottom: `${(searchObj?.order ?? "sort_idx") == item.order && (searchObj?.is_asc ?? 0) == item.is_asc ? '2px solid black' : ''}`
                  }}
                  onClick={() => {
                    getItemList({ ...router.query, page: 1 }, { ...searchObj, page: 1, order: item.order, is_asc: item.is_asc })
                  }}>
                  {item.label}
                </div>
              </>
            ))}
          </FilterTab>
          <FormControl variant='outlined' size='small' sx={{ width: '200px', margin: 'auto 0' }}>

            <Select value={searchObj.page_size}
              onChange={(e) => {
                getItemList({ ...router.query, page: 1, page_size: e.target.value }, { ...searchObj, page_size: e.target.value });
                //console.log(productContent)
                console.log(searchObj.page_size)
              }}>
              <MenuItem value={10}>10개씩 보기</MenuItem>
              <MenuItem value={20}>20개씩 보기</MenuItem>
              <MenuItem value={30}>30개씩 보기</MenuItem>
              <MenuItem value={50}>50개씩 보기</MenuItem>
              <MenuItem value={100}>100개씩 보기</MenuItem>
            </Select>
          </FormControl>

        </Row>

        {productContent?.content ?
          <>
            {loading ?
              <>
                <Row style={{ width: '100%', height: '300px' }}>
                  <div style={{ margin: 'auto' }}>
                    <CircularProgress />
                  </div>
                </Row>
              </>
              :
              <>
                {productContent?.content.length > 0 ?
                  <>
                    <Items items={productContent?.content ?? []} router={router} item_column={4} />
                    <Divider sx={{ marginTop: '1rem' }} />
                    <Box sx={{ padding: '0.75rem', display: 'flex' }}>
                      <Pagination
                        sx={{ marginLeft: 'auto', getItemAriaLabel: 'last' }}
                        size={'medium'}
                        count={getMaxPage(productContent?.total, productContent?.page_size)}
                        page={parseInt(searchObj.page)}
                        variant='outlined' shape='rounded'
                        color='primary'
                        siblingCount={4}
                        boundaryCount={0}
                        showFirstButton
                        showLastButton
                        onChange={(_, num) => {
                          getItemList({ ...router.query, page: num, page_size: searchObj.page_size }, { ...searchObj })
                        }} />
                    </Box>
                  </>
                  :
                  <>
                    <Col>
                      <Icon icon={'basil:cancel-outline'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: themeObj.grey[300] }} />
                      <div style={{ margin: 'auto auto 8rem auto' }}>검색결과가 없습니다.</div>
                    </Col>
                  </>}
              </>}
            {/* {moreLoading ?
              <>
                {productContent?.total > productContent?.content.length &&
                  <>
                  
                  
                    <Stack spacing={'1rem'} >
          
          <div style={{ display:'flex',  }}>
          <Skeleton variant='rounded' style={{
              height: '34vw',
              maxWidth: '200px',
              width: '90%',
              maxHeight: '200px',
              margin: '10rem 1rem 10rem auto'
            }} />
            <Skeleton variant='rounded' style={{
              height: '34vw',
              maxWidth: '200px',
              width: '90%',
              maxHeight: '200px',
              margin: '10rem 1rem'
            }} />
            <Skeleton variant='rounded' style={{
              height: '34vw',
              maxWidth: '200px',
              width: '90%',
              maxHeight: '200px',
              margin: '10rem 1rem'
            }} />
            <Skeleton variant='rounded' style={{
              height: '34vw',
              maxWidth: '200px',
              width: '90%',
              maxHeight: '200px',
              margin: '10rem 1rem'
            }} />
            <Skeleton variant='rounded' style={{
              height: '34vw',
              maxWidth: '200px',
              width: '90%',
              maxHeight: '200px',
              margin: '10rem auto 10rem 1rem'
            }} />
          </div>
          <div style={{ display:'flex',  }}>
          <Skeleton variant='rounded' style={{
              height: '34vw',
              maxWidth: '200px',
              width: '90%',
              maxHeight: '200px',
              margin: '10rem 1rem 10rem auto'
            }} />
            <Skeleton variant='rounded' style={{
              height: '34vw',
              maxWidth: '200px',
              width: '90%',
              maxHeight: '200px',
              margin: '10rem 1rem'
            }} />
            <Skeleton variant='rounded' style={{
              height: '34vw',
              maxWidth: '200px',
              width: '90%',
              maxHeight: '200px',
              margin: '10rem 1rem'
            }} />
            <Skeleton variant='rounded' style={{
              height: '34vw',
              maxWidth: '200px',
              width: '90%',
              maxHeight: '200px',
              margin: '10rem 1rem'
            }} />
            <Skeleton variant='rounded' style={{
              height: '34vw',
              maxWidth: '200px',
              width: '90%',
              maxHeight: '200px',
              margin: '10rem auto 10rem 1rem'
            }} />
          </div>
            
          </Stack>
                  </>}
              </>
              :
              <>
                <Button className='more-page' onClick={() => {

                  if (productContent?.content.length < productContent?.total) {
                    getItemList(
                      categoryIds,
                      {
                        ...searchObj,
                        page: searchObj?.page + 1
                      })
                  }
                }} ref={scrollRef} />
              </>} */}
          </>
          :
          <>
          </>}
      </ContentWrapper >
    </>
  )
}
export default ItemsDemo