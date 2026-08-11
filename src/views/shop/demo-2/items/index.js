import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components'
import { getAllIdsWithParents } from 'src/utils/function';
import { Col, Row, Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { Items } from 'src/components/elements/shop/common';
import { Breadcrumbs, Button, CircularProgress, Divider, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import $ from 'jquery';
import { apiShop } from 'src/utils/api';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';

const ContentWrapper = styled.div`
max-width:1200px;
width:90%;
margin: 0 auto 5rem auto;
display:flex;
flex-direction:column;
`
const CategoryChipContainer = styled.div`
width: 100%;
display:flex;
flex-wrap:wrap;
row-gap:0.5rem;
column-gap:0.5rem;
@media (max-width:1000px){
white-space: nowrap;
flex-wrap:inherit;
overflow-x:auto;
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
  const { translate, currentLang } = useLocales();
  const { themeCategoryList, themeMode, themeDnsData, themeDirection } = useSettingsContext();
  const [parentList, setParentList] = useState([]);
  const [curCategories, setCurCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productContent, setProductContent] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 15,
  })
  // 예전엔 [themeCategoryList] 와 [router.query] 두 effect 가 각각 1페이지를 불러
  // 화면에 들어올 때마다 같은 조회가 두 번 나갔다. 한 번만 부른다.
  // (router.isReady 전에는 query 가 비어 있어 '조건 없는 목록' 을 먼저 그리게 된다)
  useEffect(() => {
    if (!router.isReady) return;
    settingPage({
      page: 1,
      page_size: 15,
    }, true);
  }, [router.isReady, router.query, themeCategoryList])
  const [moreLoading, setMoreLoading] = useState(false);
  const moreLoadingRef = useRef(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const handleScroll = () => {
    if (!scrollRef.current) {
      return;
    }
    const { top, bottom } = scrollRef.current.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    // ⚠ moreLoading(state) 이 아니라 ref 를 본다. 이 핸들러는 deps [] 로 한 번만 등록되므로
    //   state 를 읽으면 등록 시점의 값(false)에 영원히 묶여 가드가 무의미해진다.
    if (top < windowHeight && bottom >= 0 && !moreLoadingRef.current) {
      moreLoadingRef.current = true;
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
        if (parent_list[i][parent_list[i].length - 1]?.id == router.query?.category_id) {
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
      setProducts(product_list?.content ?? []);
      setLoading(false);
    } else {
      // 함수형 갱신 — 이 함수는 async 라 낡은 클로저의 products 를 읽으면 앞 페이지가 사라진다.
      setProducts((prev) => [...prev, ...(product_list?.content ?? [])]);
    }
    setProductContent(product_list);
    // 결과가 비었든 실패했든 무조건 푼다. 예전엔 products 가 늘었을 때만 풀어서
    // 마지막 페이지(빈 응답)에서 스피너가 영영 돌았다.
    moreLoadingRef.current = false;
    setMoreLoading(false);
  }


  const isDark = themeMode == 'dark';
  const currentCategory = curCategories[curCategories.length - 1];

  return (
    <>
      <ContentWrapper dir={themeDirection}>
        {curCategories.length > 1 ?
          <>
            <Breadcrumbs separator={<Icon icon='material-symbols:navigate-next' style={{ color: '#bbb' }} />} style={{
              padding: '1.75rem 0 0.25rem 0',
              width: '100%',
              overflowX: 'auto'
            }}>
              {curCategories.map((item, idx) => (
                <div key={idx} style={{
                  color: `${idx == curCategories.length - 1 ? (isDark ? '#fff' : '#111') : '#999'}`,
                  fontWeight: `${idx == curCategories.length - 1 ? 600 : 400}`,
                  fontSize: '13px',
                  letterSpacing: '0.3px',
                  cursor: 'pointer'
                }}
                  onClick={() => {
                    router.push(`/shop/items?category_id=${item?.id}`)
                  }}
                >{formatLang(item, 'category_name', currentLang)}</div>
              ))}
            </Breadcrumbs>
          </>
          :
          <>
            <div style={{ marginTop: '48px' }} />
          </>}
        <Typography
          variant="h4"
          sx={{
            mt: '36px',
            mb: '2px',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            textTransform: 'capitalize',
            color: isDark ? '#fff' : '#111',
          }}
        >
          {formatLang(currentCategory, 'category_name', currentLang)}
        </Typography>
        {!loading && products.length > 0 &&
          <Typography variant="body2" sx={{ mb: '0.5rem', color: '#999', fontSize: '13px' }}>
            {commarProductCount(productContent?.total ?? products.length)}
          </Typography>
        }
        <CategoryChipContainer className='none-scroll' style={{ marginTop: '1.25rem' }}>
          {currentCategory?.children && currentCategory?.children.map((item, idx) => (
            <Button
              key={idx}
              variant="outlined"
              color="inherit"
              style={{
                height: '36px',
                width: 'auto',
                borderRadius: '999px',
                textTransform: 'none',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.2px',
                padding: '0 1rem',
                borderColor: isDark ? '#444' : '#e0e0e0',
                color: isDark ? '#ddd' : '#333',
              }}
              onClick={() => {
                router.push(`/shop/items?category_id=${item?.id}`)
              }}
            >{formatLang(item, 'category_name', currentLang)}</Button>
          ))}
        </CategoryChipContainer>
        <div style={{ marginTop: '1.5rem' }} />
        <Divider sx={{ borderColor: isDark ? '#333' : '#eee' }} />
        <div style={{ marginTop: '2rem' }} />
        {products ?
          <>
            {loading ?
              <>
                <Row style={{ width: '100%', height: '300px' }}>
                  <div style={{ margin: 'auto' }}>
                    <CircularProgress color="inherit" />
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
                      <div style={{ margin: 'auto auto 8rem auto', color: '#999', letterSpacing: '0.3px' }}>{translate('검색결과가 없습니다.')}</div>
                    </Col>
                  </>}
              </>}
            {moreLoading ?
              <>
                {productContent?.total > products.length &&
                  <>
                    <Row style={{ width: '100%', marginTop: '2.5rem' }}>
                      <div style={{ margin: '0 auto' }}>
                        <CircularProgress color="inherit" />
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
const commarProductCount = (total) => {
  const n = Number(total) || 0;
  return `${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} items`;
}
export default ItemsDemo
