import { Icon } from "@iconify/react";
import { Button, CircularProgress } from "@mui/material";
import _ from "lodash";
import { useRouter } from "next/router";
import { useRef } from "react";
import { useEffect } from "react";
import { useState } from "react";
import { Items } from "src/components/elements/shop/common";
import { ContentBorderContainer, SubTitleComponent } from "src/components/elements/shop/demo-4";
import { Col, Row, themeObj } from "src/components/elements/styled-components";
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
  const { themeDnsData, themeCategoryList } = useSettingsContext();
  const [categoryIds, setCategoryIds] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 15,
  })
  const [productContent, setProductContent] = useState({});
  const [moreLoading, setMoreLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
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
    setSearchObj(search_obj);
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
        {themeCategoryList.slice(0).reverse().map((group, index) => {
          return <>
            <SubTitleComponent>{group?.category_group_name}</SubTitleComponent>
            <ContentBorderContainer style={{ maxHeight: '150px', overflowX: 'auto', minHeight: '50px' }}>
              {group?.product_categories && group?.product_categories.map(category => {
                return <Button
                  size="small"
                  variant={`${categoryIds[`category_id${themeCategoryList.length - index - 1}`] == category?.id ? 'contained' : 'text'}`}
                  onClick={() => {
                    let query = { ...categoryIds };
                    query[`category_id${themeCategoryList.length - index - 1}`] = category?.id
                    query = new URLSearchParams(query).toString();
                    router.push(`/shop/items?${query}`);
                  }}>{category?.category_name}</Button>
              })}
            </ContentBorderContainer>
          </>
        })}
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