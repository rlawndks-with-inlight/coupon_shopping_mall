import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components'
import { useTheme } from "@emotion/react";
import { useRouter } from "next/router";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { commarNumber, getAllIdsWithParents } from 'src/utils/function';
import { Col, Row, RowMobileColumn, Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { Item, Items } from 'src/components/elements/shop/common';
import _ from 'lodash';
import { Breadcrumbs, Button, CircularProgress, Divider } from '@mui/material';
import { Icon } from '@iconify/react';
import { Spinner } from 'evergreen-ui';
import $ from 'jquery';
import { apiShop } from 'src/utils/api';

const ContentWrapper = styled.div`
max-width:1600px;
width:90%;
margin: 0 auto 5rem auto;
display:flex;
flex-direction:column;
`
const ChildrenCategoryContainer = styled.div`
overflow-x: auto;
width: 100%;
display:flex;
flex-wrap:wrap;
row-gap:0.5rem;
column-gap:0.5rem;
@media (max-width:1000px){
white-space: nowrap;
flex-wrap:inherit;
display:block;
}
`
const ItemsDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeCategoryList, themeMode, themeDnsData } = useSettingsContext();

  const [parentList, setParentList] = useState([]);
  const [curCategories, setCurCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productContent, setProductContent] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 15,
  })
  useEffect(() => {
    settingPage({
      page: 1,
      page_size: 15,
    });
  }, [themeCategoryList])
  useEffect(() => {
    settingPage({
      page: 1,
      page_size: 15,
    }, true);
  }, [router.query])
  const [moreLoading, setMoreLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
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
  const settingPage = async (search_obj, is_first) => {
    if (is_first) {
      setLoading(true);
      setProducts([]);
    }
    if ((themeCategoryList[0]?.product_categories ?? []).length > 0) {
      let parent_list = []
      if (parentList.length > 0) {
        parent_list = parentList;
      } else {
        parent_list = getAllIdsWithParents(themeCategoryList[0]?.product_categories ?? []);
      }
      setParentList(parent_list);
      let use_list = [];
      for (var i = 0; i < parent_list.length; i++) {
        if (parent_list[i][router.query?.depth]?.id == router.query?.category_id0) {
          use_list = parent_list[i];
          break;
        }
      }
      setCurCategories(use_list);
    }
    let product_list = await apiShop('product', 'list', {
      ...search_obj,
      brand_id: themeDnsData?.id,
      ...router.query
    })
    setSearchObj(search_obj);
    if (is_first) {
      setProducts(product_list.content ?? []);
      setLoading(false);
    } else {
      setProducts([...products, ...product_list.content ?? []]);
    }
    setProductContent(product_list);
  }
  useEffect(() => {
    if (products.length > 0) {
      setMoreLoading(false);
    }
  }, [products])
  return (
    <>
      <ContentWrapper>
        {curCategories.length > 1 ?
          <>
            <Breadcrumbs separator={<Icon icon='material-symbols:navigate-next' />} style={{
              padding: '0.5rem 0',
              width: '100%',
              overflowX: 'auto'
            }}>
              {curCategories.map((item, idx) => (
                <>
                  <div style={{
                    color: `${idx == curCategories.length - 1 ? (themeMode == 'dark' ? '#fff' : '#000') : ''}`,
                    fontWeight: `${idx == curCategories.length - 1 ? 'bold' : ''}`,
                    cursor: 'pointer'
                  }}
                    onClick={() => {
                      router.push(`/shop/items?category_id0=${item?.id}&depth=${idx}`)
                    }}
                  >{item.category_name}</div>
                </>
              ))}
            </Breadcrumbs>
          </>
          :
          <>
            <div style={{ marginTop: '42px' }} />
          </>}
        <Title style={{ marginTop: '38px' }}>
          {curCategories[curCategories.length - 1]?.category_name}
        </Title>
        <ChildrenCategoryContainer className='none-scroll'>
          {curCategories[curCategories.length - 1]?.children && curCategories[curCategories.length - 1]?.children.map((item, idx) => (
            <>
              <Button variant="outlined" style={{
                height: '36px',
                width: 'auto',
                marginRight: '0.25rem',
              }}
                onClick={() => {
                  router.push(`/shop/items?category_id0=${item?.id}&depth=${parseInt(router.query?.depth) + 1}`)
                }}
              >{item.category_name}</Button>
            </>
          ))}
        </ChildrenCategoryContainer>
        <div style={{
          marginTop: '1rem'
        }} />
        <Divider />
        <div style={{
          marginTop: '1rem'
        }} />
        {products ?
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
                {products.length > 0 ?
                  <>
                    <Items items={products} router={router} />
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
                {productContent?.total > products.length &&
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
                  if (products.length < productContent?.total) {
                    settingPage({
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
