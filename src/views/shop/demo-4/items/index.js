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
import { getAllIdsWithParents } from "src/utils/function";
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
  const [detailSubCate, setDetailSubCate] = useState()

  useEffect(() => {
    if (themeDnsData?.is_closure == 1 && !user) {
      router.push('/shop/auth/login')
    }
  }, [themeDnsData])

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
    //console.log(router.query)
  }, [
    router.query.category_id,
    router.query.search,
    router.query.keyword,
    router.query.property_ids0,
    router.query.page,
    router.query.page_size,
    router.query.not_show_select_menu,
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
    let query = { ...query_ };
    // keyword 파라미터를 search로 통일
    if (query.keyword && !query.search) {
      query.search = query.keyword;
    }
    delete query.keyword;
    let search_obj = search_obj_;

    //console.log(query)
    //console.log(search_obj)
    //setLoading(true);
    setCategoryIds(query);
    delete search_obj[`category_id`];
    delete search_obj[`property_ids0`];
    // 단일 트리(leaf) 기반 현재 경로 재구성: 클릭된 category_id 를 리프로 갖는 root→node 경로
    let parent_list = getAllIdsWithParents(themeCategoryList?.[0]?.product_categories ?? []);
    let use_list = [];
    for (var i = 0; i < parent_list.length; i++) {
      if (parent_list[i][parent_list[i].length - 1]?.id == query?.category_id) {
        use_list = parent_list[i];
        break;
      }
    }
    let selected_category = use_list[use_list.length - 1];
    setCurCategory(selected_category ?? {});
    let category_children = {};
    if (selected_category && (selected_category?.children ?? []).length > 0) {
      // 선택된 노드의 자식들을 하위 카테고리 탭으로
      category_children = {
        [`category_id`]: {
          parent_id: selected_category?.id,
          children: selected_category?.children
        }
      }
    } else if (use_list.length >= 2) {
      // 리프 노드면 형제(부모의 자식들)를 탭으로 노출해 현재 선택을 강조
      let parent_category = use_list[use_list.length - 2];
      category_children = {
        [`category_id`]: {
          parent_id: parent_category?.id,
          children: parent_category?.children
        }
      }
    }
    let query_str = new URLSearchParams(query).toString();
    router.replace(`/shop/items?${query_str}`);

    setCategoryChildren(category_children)
    setSearchObj({ ...search_obj, ...query });
    let product_list = 0;
    if (themeDnsData?.seller_id > 0) {
      product_list = await apiShop('product', 'list', {
        ...search_obj,
        ...query,
        seller_id: themeDnsData?.seller_id ?? 0
      })
    } else {
      product_list = await apiShop('product', 'list', {
        ...search_obj,
        ...query,
      })
    }
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
      //console.log(sessionStorage)
      sessionStorage.removeItem(`scrollPosition${query}`);
    }
    const handleRouteChangeStart = () => {
      if (!loading) { //items는 메인화면과 다르게 이 조건을 걸어주지 않으면 scrollTo를 실행하기 전에 scrollPosition을 0으로 바꾸는 문제 있음
        sessionStorage.setItem(`scrollPosition${query}`, window.scrollY);
      }
    };
    //console.log(sessionStorage)
    router.events.on('routeChangeStart', handleRouteChangeStart);
    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
    };
  }, [loading, router.query])

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
        {router.query?.category_id ?
          <>
            <Title style={{ marginTop: '100px', fontFamily: 'Playfair Display', color: '#000', fontWeight: 'normal', fontSize: '90px', marginLeft: '0' }}>
              {curCategory?.category_en_name ?? curCategory?.category_name ?? ""}
            </Title>
          </>
          :
          ''
        }
        {router.query?.not_show_select_menu != 1 &&
          <>
            <Row style={{ justifyContent: 'space-between', minHeight: '50px', direction: 'rtl' }}>
              {categoryChildren[`category_id`] &&
                <div style={{ overflowX: 'auto', minHeight: '50px', direction: 'ltr' }}>
                  {categoryChildren[`category_id`]?.children.map((category, idx) => (
                    <>
                      <Button
                        sx={{
                          fontWeight: `${categoryIds[`category_id`] == category?.id ? 'bold' : 'normal'}`,
                          margin: '1rem',
                          borderBottom: `${categoryIds[`category_id`] == category?.id ? '2px solid black' : ''}`,
                          cursor: 'pointer',
                          borderRadius: '0',
                          color: `${themeMode == 'dark' ? 'white' : 'black'}`,
                          '&:hover': {
                            textDecoration: 'underline',
                            background: 'transparent',
                          }
                        }}
                        onClick={() => {
                          router.push(`/shop/items?category_id=${category?.id}`);
                        }}>
                        {category?.category_en_name ?? category?.category_name}
                      </Button >
                    </>
                  ))}
                </div>
              }
            </Row>
            <>
              <Row>
                <BrandFilter style={{ fontFamily: 'Playfair Display', overflowY: 'auto', background: `${themeMode == 'dark' ? '#222' : '#FEF8F4'}`, width: '100%' }}>
                  <Row>
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
                        style={{ width: '100%', margin: '2rem auto 4rem 1rem', maxWidth: '700px', }}
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
                    <Chip
                      label={'공용'}
                      sx={{
                        margin: '0.5rem 0rem 0.5rem 0',
                        fontSize: '16px',
                        cursor: 'pointer',
                        background: `${queryString.parseUrl(router.asPath).query[`property_ids0`] == '48' ? (themeMode == 'dark' ? '#999999' : 'white') : 'transparent'}`,
                        fontFamily: `Noto Sans KR`,
                        '&:hover': {
                          background: `${themeMode == 'dark' ? '#999999' : 'white'}`,
                        },
                      }}
                      onClick={() => {

                        const parsedUrl = queryString.parseUrl(router.asPath).query;
                        parsedUrl[`property_ids0`] = '48'
                        const updatedUrl = queryString.stringifyUrl({ url: queryString.parseUrl(router.asPath).url, query: parsedUrl })

                        router.push(updatedUrl)

                      }} />
                    <Chip
                      label={'남성'}
                      sx={{
                        margin: '0.5rem 0rem 0.5rem 0',
                        fontSize: '16px',
                        cursor: 'pointer',
                        background: `${queryString.parseUrl(router.asPath).query[`property_ids0`] == '47' ? (themeMode == 'dark' ? '#999999' : 'white') : 'transparent'}`,
                        fontFamily: `Noto Sans KR`,
                        '&:hover': {
                          background: `${themeMode == 'dark' ? '#999999' : 'white'}`,
                        },
                      }}
                      onClick={() => {

                        const parsedUrl = queryString.parseUrl(router.asPath).query;
                        parsedUrl[`property_ids0`] = '47'
                        const updatedUrl = queryString.stringifyUrl({ url: queryString.parseUrl(router.asPath).url, query: parsedUrl })

                        router.push(updatedUrl)

                      }} />
                    <Chip
                      label={'여성'}
                      sx={{
                        margin: '0.5rem 0rem 0.5rem 0',
                        fontSize: '16px',
                        cursor: 'pointer',
                        background: `${queryString.parseUrl(router.asPath).query[`property_ids0`] == '46' ? (themeMode == 'dark' ? '#999999' : 'white') : 'transparent'}`,
                        fontFamily: `Noto Sans KR`,
                        '&:hover': {
                          background: `${themeMode == 'dark' ? '#999999' : 'white'}`,
                        },
                      }}
                      onClick={() => {

                        const parsedUrl = queryString.parseUrl(router.asPath).query;
                        parsedUrl[`property_ids0`] = '46'
                        const updatedUrl = queryString.stringifyUrl({ url: queryString.parseUrl(router.asPath).url, query: parsedUrl })

                        router.push(updatedUrl)

                      }} />
                  </Row>
                </BrandFilter>
              </Row>
            </>
          </>
        }



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
                //console.log(searchObj.page_size)
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