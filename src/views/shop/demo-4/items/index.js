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
import styled from "styled-components";
import $ from 'jquery';
import { CategorySorter, LANGCODE } from "src/views/shop/demo-4/header"

const ContentWrapper = styled.div`
max-width:1400px;
width:90%;
margin: 0 auto 5rem auto;
display:flex;
flex-direction:column;
`
const ItemsDemo = (props) => {

  const router = useRouter();
  const { user } = useAuthContext();
  const { themeDnsData, themeCategoryList, themePropertyList } = useSettingsContext();
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
  const [langChipSelected, setLangChipSelected] = useState('')
  const [textChipSelected, setTextChipSelected] = useState('')
  const { sort, categoryGroup } = CategorySorter(themeCategoryList)

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
  }, [router.query.category_id0, router.query.category_id1, router.query.category_id2, router.query.search, router.query.property_ids0])

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

  const getItemList = async (query_ = {}, search_obj_={}) => {
    let query = query_;
    let search_obj = search_obj_;

    console.log(query)
    console.log(search_obj)
    setLoading(true);
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
    setLoading(false);
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
      setMoreLoading(false);
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

  return (
    <>
      <ContentWrapper>
        {router.query?.not_show_select_menu == 1 ?
          <>
            {router.query?.property_id &&
              <>
                <Title style={{ marginTop: '38px' }}>
                  {themePropertyList.map((group) => {
                    let properties = group?.product_properties;
                    if (_.find(properties, { id: parseInt(router.query?.property_id) })) {
                      return _.find(properties, { id: parseInt(router.query?.property_id) })?.property_name
                    } else {
                      return ""
                    }
                  })}
                </Title>
              </>}
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
              style={{ width: '100%', margin: '2rem auto 0 auto', maxWidth: '700px', }}
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
          :
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
              style={{ width: '100%', margin: '2rem auto 0 auto', maxWidth: '700px', }}
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
            {themeCategoryList.map((group, index) => {
              return <>
                <SubTitleComponent>{group?.category_group_name}</SubTitleComponent>
                <ContentBorderContainer style={{ maxHeight: '150px', overflowX: 'auto', minHeight: '50px', }}>
                  {group?.sort_type == 1 &&
                    <>
                      <Row style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', margin: '-1rem 0 -0.5rem 0' }}>
                        <div style={{ borderBottom: `2px solid gray`, marginRight: '0.5rem' }}>
                          <Chip label={`알파벳순`} variant="soft" sx={{
                            margin: '0.5rem 0.5rem 0.5rem 0',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            color: `${langChipSelected == 0 ? 'white' : ''}`,
                            background: `${langChipSelected == 0 ? 'black' : ''}`,
                            '&:hover': {
                              color: `${langChipSelected == 0 ? 'white' : ''}`,
                              background: `${langChipSelected == 0 ? 'black' : ''}`,
                            }
                          }}
                            onClick={() => { setLangChipSelected(0); sort(LANGCODE.ENG); setTextChipSelected(''); }}
                          />
                          <Chip label={`가나다순`} variant="soft" sx={{
                            margin: '0.5rem 0.5rem 0.5rem 0',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            color: `${langChipSelected == 1 ? 'white' : ''}`,
                            background: `${langChipSelected == 1 ? 'black' : ''}`,
                            '&:hover': {
                              color: `${langChipSelected == 1 ? 'white' : ''}`,
                              background: `${langChipSelected == 1 ? 'black' : ''}`,
                            }
                          }}
                            onClick={() => { setLangChipSelected(1); sort(LANGCODE.KOR); setTextChipSelected(''); }}
                          />
                        </div>
                        {langChipSelected == 0 ?
                          <Row>
                            {alphabetList.map((alphabet) => {
                              return <>
                                <Chip
                                  label={alphabet}
                                  variant="soft"
                                  sx={{
                                    margin: '0.5rem 0.5rem 0.5rem 0',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
                                    cursor: 'pointer',
                                    color: `${textChipSelected == alphabet ? 'white' : ''}`,
                                    background: `${textChipSelected == alphabet ? 'black' : ''}`,
                                    '&:hover': {
                                      color: `${textChipSelected == alphabet ? 'white' : ''}`,
                                      background: `${textChipSelected == alphabet ? 'black' : ''}`,
                                    }
                                  }}
                                  onClick={() => { setTextChipSelected(alphabet); }}
                                />
                              </>
                            })}
                          </Row>
                          :
                          <Row>
                            {hangeulList.map((hangeul) => {
                              return <>
                                <Chip
                                  label={hangeul}
                                  variant="soft"
                                  sx={{
                                    margin: '0.5rem 0.5rem 0.5rem 0',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    color: `${textChipSelected == hangeul ? 'white' : ''}`,
                                    background: `${textChipSelected == hangeul ? 'black' : ''}`,
                                    '&:hover': {
                                      color: `${textChipSelected == hangeul ? 'white' : ''}`,
                                      background: `${textChipSelected == hangeul ? 'black' : ''}`,
                                    }
                                  }}
                                  onClick={() => { setTextChipSelected(hangeul); }}
                                />
                              </>
                            })}
                          </Row>
                        }
                      </Row>
                    </>
                  }
                  <Button
                    size="small"
                    variant={`${!categoryIds[`category_id${index}`] ? 'contained' : 'text'}`}
                    onClick={() => {
                      let { [`category_id${index}`]: _, ...rest } = categoryIds;
                      let query = rest;
                      console.log([`category_id${index}`])
                      console.log(rest)
                      query = new URLSearchParams(query).toString();
                      if (query == 'depth=0') {
                        router.push(`/shop/items/?`)
                      } else {
                        router.push(`/shop/items?${query}`);
                      }
                    }}>전체</Button>


                  <>

                    {group?.sort_type != 1 ?
                      <>
                        {group?.product_categories && group?.product_categories.map((category, idx) => {
                          return <Button
                            size="small"
                            variant={`${(categoryIds[`category_id${index}`] == category?.id || categoryChildren[`category_id${index}`]?.parent_id == category?.id) ? 'contained' : 'text'}`}
                            onClick={() => {
                              let query = { ...categoryIds };
                              query[`category_id${index}`] = category?.id;

                              query = new URLSearchParams(query).toString();
                              router.push(`/shop/items?${query}`);
                            }}>{category?.category_en_name ?? category?.category_name}</Button>
                        })}
                      </>
                      :
                      <>
                        {
                          categoryGroup.map((group) => {
                            if (textChipSelected == '') {
                              return <>
                                <Chip label={`[${group.label ? group.label : "#"}]`} variant="soft" sx={{
                                  cursor: 'pointer', fontWeight: 'bold', background: `${themeDnsData?.theme_css?.main_color}29`, color: `${themeDnsData?.theme_css?.main_color}`, '&:hover': {
                                    color: '#fff',
                                    background: `${themeDnsData?.theme_css?.main_color}`,
                                  }
                                }} />
                                {
                                  group.childs.map((child) => {
                                    return <Button
                                      size='small'
                                      variant={`${(categoryIds[`category_id${index}`] == child?.id || categoryChildren[`category_id${index}`]?.parent_id == child?.id) ? 'contained' : 'text'}`}
                                      onClick={() => {
                                        let query = { ...categoryIds };
                                        query[`category_id${index}`] = child?.id;

                                        query = new URLSearchParams(query).toString();
                                        router.push(`/shop/items?${query}`);
                                      }}>
                                      {langChipSelected == 0 ? child?.category_en_name : child?.category_name}
                                    </Button>
                                  })

                                }
                              </>
                            }
                            else if (textChipSelected == group?.label) {
                              return <>
                                <Chip label={`[${group.label ? group.label : "#"}]`} variant="soft" sx={{
                                  cursor: 'pointer', fontWeight: 'bold', background: `${themeDnsData?.theme_css?.main_color}29`, color: `${themeDnsData?.theme_css?.main_color}`, '&:hover': {
                                    color: '#fff',
                                    background: `${themeDnsData?.theme_css?.main_color}`,
                                  }
                                }} />
                                {
                                  group.childs.map((child) => {
                                    return <Button
                                      size='small'
                                      variant={`${(categoryIds[`category_id${index}`] == child?.id || categoryChildren[`category_id${index}`]?.parent_id == child?.id) ? 'contained' : 'text'}`}
                                      onClick={() => {
                                        let query = { ...categoryIds };
                                        query[`category_id${index}`] = child?.id;

                                        query = new URLSearchParams(query).toString();
                                        router.push(`/shop/items?${query}`);
                                      }}>
                                      {langChipSelected == 0 ? child?.category_en_name : child?.category_name}
                                    </Button>
                                  })

                                }
                              </>
                            }
                          })
                        }
                      </>
                    }
                  </>

                </ContentBorderContainer>
                {categoryChildren[`category_id${index}`] &&
                  <>
                    <Typography variant="subtitle2" style={{ color: themeObj.grey[600], marginBottom: '0.25rem' }}>{group?.category_group_name} - 중분류</Typography>
                    <ContentBorderContainer style={{ maxHeight: '150px', overflowX: 'auto', minHeight: '50px', }}>
                      {categoryChildren[`category_id${index}`]?.children.map((category, idx) => (
                        <>
                          <Button
                            size="small"
                            variant={`${categoryIds[`category_id${index}`] == category?.id ? 'contained' : 'text'}`}
                            onClick={() => {
                              let query = { ...categoryIds };
                              query[`category_id${index}`] = category?.id;
                              query = new URLSearchParams(query).toString();
                              router.push(`/shop/items?${query}`);
                            }}>{category?.category_en_name ?? category?.category_name}</Button>
                        </>
                      ))}
                    </ContentBorderContainer>
                  </>}
              </>
            })}
          </>
        }


        <Row style={{ columnGap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', whiteSpace: 'nowrap' }} className={`none-scroll`}>
          {sortList.map((item) => (
            <>
              <Button variant={`${(searchObj?.order ?? "sort_idx") == item.order && (searchObj?.is_asc ?? 0) == item.is_asc ? 'contained' : 'outlined'}`} onClick={() => {
                getItemList({ ...router.query, page: 1 }, { ...searchObj, page: 1, order: item.order, is_asc: item.is_asc })
              }}>{item.label}</Button>
            </>
          ))}
          <FormControl variant='outlined' size='small' sx={{ width: '200px', marginLeft: 'auto' }}>

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
                    <Items items={productContent?.content ?? []} router={router} />
                    <Divider sx={{ marginTop: '1rem' }} />
                    <Box sx={{ padding: '0.75rem', display: 'flex' }}>
                      <Pagination
                        sx={{ marginLeft: 'auto' }}
                        size={'medium'}
                        count={getMaxPage(productContent?.total, productContent?.page_size)}
                        page={parseInt(searchObj.page)}
                        variant='outlined' shape='rounded'
                        color='primary'
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
      </ContentWrapper>
    </>
  )
}
export default ItemsDemo