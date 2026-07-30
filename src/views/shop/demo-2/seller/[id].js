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
import { Breadcrumbs, Button, Divider, Typography, Stack } from '@mui/material';
import { Icon } from '@iconify/react';
import { Spinner } from 'evergreen-ui';
import $ from 'jquery';
import { apiManager, apiShop } from 'src/utils/api';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';

const Wrapper = styled.div`
display:flex;
flex-direction:column;
min-height:76vh;
`
const Banner = styled.div`
width:100%;
height:340px;
position:relative;
display:flex;
flex-direction:column;
align-items:center;
justify-content:flex-end;
@media (max-width:800px){
  height:240px;
}
`
const BannerOverlay = styled.div`
position:absolute;
inset:0;
background:linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.55) 100%);
`
const BannerInner = styled.div`
position:relative;
z-index:1;
display:flex;
flex-direction:column;
align-items:center;
text-align:center;
padding-bottom:2.5rem;
`
const ContentWrapper = styled.div`
max-width:1200px;
width:90%;
margin: 2.5rem auto 5rem auto;
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
const SellerDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { translate, currentLang } = useLocales();
  const { themeCategoryList, themeMode, themeDnsData } = useSettingsContext();

  const [parentList, setParentList] = useState([]);
  const [curCategories, setCurCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [productContent, setProductContent] = useState({});
  const [item, setItem] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 15,
  })
  useEffect(() => {
    settingPage({
      page: 1,
      page_size: 15,
    }, true);
  }, [router.query])
  const [loading, setLoading] = useState(true);
  const settingPage = async () => {
    setLoading(true);
    let data = await apiManager('sellers', 'get', { id: router.query?.id });
    if (data) {
      setProducts(data?.products ?? []);
      setItem(data);
    }
    setLoading(false);
  }
  const hasBanner = Boolean(item?.background_img);
  const mutedColor = themeMode == 'dark' ? '#aaa' : '#999';
  const snsIconStyle = {
    margin: '0 0.5rem',
    fontSize: '1.5rem',
    color: hasBanner ? '#fff' : (themeMode == 'dark' ? '#fff' : '#333'),
    cursor: 'pointer'
  }
  return (
    <>
      <Wrapper>
        <Banner style={{
          backgroundColor: themeMode == 'dark' ? '#141414' : '#f2f2f2',
          backgroundImage: hasBanner ? `url(${item?.background_img})` : 'none',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}>
          {hasBanner &&
            <BannerOverlay />
          }
          <BannerInner>
            <Typography variant="h4" sx={{
              fontWeight: 700,
              color: hasBanner ? '#fff' : (themeMode == 'dark' ? '#fff' : '#222'),
              textShadow: hasBanner ? '0 1px 6px rgba(0,0,0,0.45)' : 'none'
            }}>
              {item?.nickname}
            </Typography>
            {item?.seller_name &&
              <Typography variant="body2" sx={{
                mt: 0.5,
                color: hasBanner ? 'rgba(255,255,255,0.85)' : (themeMode == 'dark' ? '#aaa' : '#777')
              }}>
                {item?.seller_name}
              </Typography>
            }
            <Row style={{ marginTop: '1rem', justifyContent: 'center' }}>
              {item?.sns_obj?.instagram_id &&
                <>
                  <Icon
                    onClick={() => {
                      window.location.href = `https://www.instagram.com/${item?.sns_obj?.instagram_id}`
                    }}
                    icon='fe:instagram' style={snsIconStyle} />
                </>}
              {item?.sns_obj?.youtube_channel &&
                <>
                  <Icon
                    onClick={() => {
                      window.location.href = `${item?.sns_obj?.youtube_channel}`
                    }}
                    icon='fe:youtube'
                    style={snsIconStyle} />
                </>}
            </Row>
          </BannerInner>
        </Banner>
        <ContentWrapper>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
            {formatLang(curCategories[curCategories.length - 1], 'category_name', currentLang)}
          </Typography>
          <ChildrenCategoryContainer className='none-scroll'>
            {curCategories[curCategories.length - 1]?.children && curCategories[curCategories.length - 1]?.children.map((item, idx) => (
              <>
                <Button variant="outlined" color="inherit" size="small" style={{
                  height: '36px',
                  width: 'auto',
                  marginRight: '0.25rem',
                  borderRadius: '999px',
                  textTransform: 'none',
                }}
                  onClick={() => {
                    router.push(`/shop/items?category_id0=${item?.id}&depth=${parseInt(router.query?.depth) + 1}`)
                  }}
                >{formatLang(item, 'category_name', currentLang)}</Button>
              </>
            ))}
          </ChildrenCategoryContainer>
          <div style={{ marginTop: '1rem' }} />
          <Divider />
          <div style={{ marginTop: '1.5rem' }} />
          {products ?
            <>
              {loading ?
                <>
                  <Row style={{ width: '100%', height: '300px' }}>
                    <div style={{ margin: 'auto' }}>
                      <Spinner sx={{ height: '72px', color: 'green' }} color={'red'} />
                    </div>
                  </Row>
                </>
                :
                <>
                  {products.length > 0 ?
                    <>
                      <Items items={products} router={router} seller={item} />
                    </>
                    :
                    <>
                      <Col>
                        <Icon icon={'basil:cancel-outline'} style={{ margin: '8rem auto 1rem auto', fontSize: '4rem', color: mutedColor }} />
                        <div style={{ margin: 'auto auto 8rem auto', color: mutedColor }}>{translate('검색결과가 없습니다.')}</div>
                      </Col>
                    </>}
                </>}
            </>
            :
            <>
            </>}
        </ContentWrapper>
      </Wrapper>
    </>
  )
}
export default SellerDemo
