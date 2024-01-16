import { Icon } from "@iconify/react";
import { Button, Chip, CircularProgress, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
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

const ContentWrapper = styled.div`
max-width:1600px;
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

  const sortList = [
    {
      label: '그랑파리랭킹순',
      order: 'sort_idx',
      is_asc: 0,
    },
    {
      label: '최근등록순',
      order: 'id',
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
    getItemList(router.query, { ...searchObj, page: 1 }, true)
  }, [router.query])

  const handleScroll = () => {
    if (!scrollRef.current) {
      return;
    }
    const { top, bottom } = scrollRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    if (top < windowHeight && bottom >= 0 && !moreLoading) {
      setMoreLoading(true);
      $('.more-page').trigger("click");
    }
  };
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  const getItemList = async (query, search_obj, is_first) => {
    if (is_first) {
      setLoading(true);
      setProductContent({});
    }
    setCategoryIds(query);
    let category_children = {};
    for (var i = 0; i < themeCategoryList.length; i++) {
      let find_category = undefined;
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
    setCategoryChildren(category_children)
    setSearchObj({ ...search_obj, search: query?.search ?? "" });
    let product_list = await apiShop('product', 'list', {
      ...search_obj,
      brand_id: themeDnsData?.id,
      ...query
    })
    if (product_list.content.length == 0) {
      setProductContent({
        ...productContent,
        total: -1,
      })
    }
    if (is_first) {
      setProductContent(product_list);
      setLoading(false);
    } else {
      setProductContent({
        ...product_list,
        content: [...productContent?.content, ...product_list.content ?? []]
      });
    }
  }
  useEffect(() => {
    if ((productContent?.content ?? []).length > 0) {
      setMoreLoading(false);
    }
  }, [productContent?.content])
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
          </>
          :
          <>
            <TextField
              label=''
              variant="standard"
              onChange={(e) => {
                setSearchObj({
                  ...searchObj,
                  search: e.target.value
                })
              }}
              value={searchObj?.search}
              style={{ width: '100%', margin: '2rem auto 0 auto', maxWidth: '700px', }}
              sx={{input: {color:'red'}}}
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
                        padding: '0.5rem'
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
                  <Button
                    size="small"
                    variant={`${!categoryIds[`category_id${index}`] ? 'contained' : 'text'}`}
                    onClick={() => {
                      let query = { ...categoryIds };
                      delete query[`category_id${index}`];
                      query = new URLSearchParams(query).toString();
                      router.push(`/shop/items?${query}`);
                    }}>전체</Button>
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
                            cursor: 'pointer', fontWeight: 'bold', background: `${themeDnsData?.theme_css?.main_color}29`, color: `${themeDnsData?.theme_css?.main_color}`, '&:hover': {
                              color: '#fff',
                              background: `${themeDnsData?.theme_css?.main_color}`
                            }
                          }} />
                        </>}
                      <Button
                        size="small"
                        variant={`${(categoryIds[`category_id${index}`] == category?.id || categoryChildren[`category_id${index}`]?.parent_id == category?.id) ? 'contained' : 'text'}`}
                        onClick={() => {
                          let query = { ...categoryIds };
                          query[`category_id${index}`] = category?.id;

                          query = new URLSearchParams(query).toString();
                          router.push(`/shop/items?${query}`);
                        }}>{category?.category_name}</Button>
                    </>
                  })}

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
                            }}>{category?.category_name}</Button>
                        </>
                      ))}
                    </ContentBorderContainer>
                  </>}
              </>
            })}
          </>}


        <Row style={{ columnGap: '0.5rem', marginBottom: '1rem', overflowX: 'auto', whiteSpace: 'nowrap' }} className={`none-scroll`}>
          {sortList.map((item) => (
            <>
              <Button variant={`${(searchObj?.order ?? "sort_idx") == item.order && (searchObj?.is_asc ?? 0) == item.is_asc ? 'contained' : 'outlined'}`} onClick={() => {
                getItemList(router.query, { ...searchObj, page: 1, order: item.order, is_asc: item.is_asc }, true)
              }}>{item.label}</Button>
            </>
          ))}
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
                  </>
                  :
                  <>
                    <Col>
                      <Icon icon={'basil:cancel-outline'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: themeObj.grey[300] }} />
                      <div style={{ margin: 'auto auto 8rem auto' }}>검색결과가 없습니다.</div>
                    </Col>
                  </>}
              </>}
            {moreLoading ?
              <>
                {productContent?.total > productContent?.content.length &&
                  <>
                    <Row style={{ width: '100%' }}>
                      <div style={{ margin: '0 auto' }}>
                        <CircularProgress />
                      </div>
                    </Row>
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
              </>}
          </>
          :
          <>
          </>}
      </ContentWrapper>
    </>
  )
}
export default ItemsDemo