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
import { Breadcrumbs, Button, Divider } from '@mui/material';
import { Icon } from '@iconify/react';
import { Spinner } from 'evergreen-ui';
import $ from 'jquery';
import { apiManager, apiShop } from 'src/utils/api';
import { useLocales } from 'src/locales';

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
const BannerImg = styled.div`
width:100%;
height:400px;
display:flex;
flex-direction:column;
align-items:center;

`
const SubTitle = styled.div`
color:#fff;
font-size:${themeObj.font_size.size9};
text-align:center;
`
const SellerDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { translate } = useLocales();
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
  return (
    <>
      <BannerImg style={{
        backgroundImage: `url(${item?.background_img})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}>
        <Title style={{ marginTop: 'auto' }}>{item?.nickname}</Title>
        <SubTitle>{item?.seller_name}</SubTitle>
        <Row style={{ margin: '1rem', marginBottom: 'auto', }}>
          {item?.sns_obj?.instagram_id &&
            <>
              <Icon
                onClick={() => {
                  window.location.href = `https://www.instagram.com/${item?.sns_obj?.instagram_id}`
                }}
                icon='fe:instagram' style={{
                  margin: '0.5rem',
                  fontSize: themeObj.font_size.size4,
                  color: '#fff',
                  cursor: 'pointer'
                }} />
            </>}
          {item?.sns_obj?.youtube_channel &&
            <>
              <Icon
                onClick={() => {
                  window.location.href = `${item?.sns_obj?.youtube_channel}`
                }}
                icon='fe:youtube'
                style={{
                  margin: '0.5rem 0.5rem auto 0.5rem',
                  fontSize: themeObj.font_size.size4,
                  color: '#fff',
                  cursor: 'pointer'
                }} />
            </>}
        </Row>
      </BannerImg>
      <ContentWrapper>

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
                      <Icon icon={'basil:cancel-outline'} style={{ margin: '8rem auto 1rem auto', fontSize: themeObj.font_size.size1, color: themeObj.grey[300] }} />
                      <div style={{ margin: 'auto auto 8rem auto' }}>{translate('검색결과가 없습니다.')}</div>
                    </Col>
                  </>}
              </>}
          </>
          :
          <>
          </>}
      </ContentWrapper>
    </>
  )
}
export default SellerDemo