import styled from 'styled-components'
import { Box, Tab, Tabs, Card, Grid, Divider, Typography, Button, } from '@mui/material';
import { test_item } from 'src/data/test-data';
import { useSettingsContext } from 'src/components/settings';
import { ProductDetailsCarousel, ProductDetailsReview, ProductDetailsSummary } from 'src/views/@dashboard/e-commerce/details';
import { useEffect, useState } from 'react';
import { SkeletonProductDetails } from 'src/components/skeleton';
import dynamic from 'next/dynamic'
import { apiManager, apiShop } from 'src/utils/api';
import { styled as muiStyle } from '@mui/material'
import Head from 'next/head';
import { Row } from 'src/components/elements/styled-components';
import { commarNumber, getProductStatus } from 'src/utils/function';
import { Icon } from '@iconify/react';
import { insertCartDataUtil, insertWishDataUtil, selectItemOptionUtil } from 'src/utils/shop-util';
import toast from 'react-hot-toast';
import DialogBuyNow from 'src/components/dialog/DialogBuyNow';
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})
const Wrapper = styled.div`
display:flex;
flex-direction:column;
min-height:76vh;
`
const ContentWrapper = styled.div`
max-width:1200px;
width:90%;
margin: 1rem auto;
`
const ItemName = muiStyle(Typography)`
border-bottom: 1px solid #ccc;
text-align: center;
padding: 1rem 0;
`
const ItemCharacter = (props) => {
  const { key_name, value } = props;
  return (
    <>
      <Row style={{ columnGap: '0.25rem', marginTop: '1rem' }}>
        <Typography variant='body2' style={{ width: '100px' }}>{key_name}:</Typography>
        <Typography variant='subtitle2'>{value}</Typography>
      </Row>
    </>
  )
}
const ItemDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeStretch, themeDnsData, themeWishData, onChangeWishData } = useSettingsContext();

  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState('description');
  const [product, setProduct] = useState({});
  const [reviewPage, setReviewPage] = useState(1);
  const [buyOpen, setBuyOpen] = useState(false);
  const [reviewContent, setReviewContent] = useState({});
  const [selectProductGroups, setSelectProductGroups] = useState({
    count: 1,
    groups: [],
  });
  useEffect(() => {
    getItemInfo(1);
  }, [])

  const getItemInfo = async (review_page) => {
    let data = { ...product };
    data = await apiShop('product', 'get', {
      id: router.query?.id
    });
    data['sub_images'] = (data['sub_images'] ?? []).map((img) => {
      return img?.product_sub_img
    })
    if (data?.product_img) {
      data['sub_images'].unshift(data?.product_img)
    }
    data['images'] = data['sub_images'];
    setReviewPage(review_page);
    let review_data = await apiManager('product-reviews', 'list', {
      page: review_page,
      product_id: router.query?.id,
      page_size: 10,
    })
    setReviewContent(review_data)
    setProduct(data);
    setLoading(false);
  }
  const TABS = [
    {
      value: 'description',
      label: '상품설명',
      component: product?.product_description ?
        <ReactQuill
          className='none-padding'
          value={product?.product_description ?? `<body></body>`}
          readOnly={true}
          theme={"bubble"}
          bounds={'.app'}
        /> : null,
    },
    {
      value: 'reviews',
      label: `상품후기 (${reviewContent?.total})`,
      component: product ? <ProductDetailsReview product={product} reviewContent={reviewContent} onChangePage={getItemInfo} reviewPage={reviewPage} /> : null,
    },
  ];
  const handleAddCart = async () => {
    if (user) {
      let result = await insertCartDataUtil({ ...product, seller_id: router.query?.seller_id ?? 0 }, selectProductGroups, themeCartData, onChangeCartData);
      if (result) {
        toast.success("장바구니에 성공적으로 추가되었습니다.")
      }
    } else {
      toast.error('로그인을 해주세요.');
    }

  };
  const onSelectOption = (group, option, is_option_multiple) => {
    let select_product_groups = selectItemOptionUtil(group, option, selectProductGroups, is_option_multiple);
    setSelectProductGroups(select_product_groups);
  }
  return (
    <>
      <DialogBuyNow
        buyOpen={buyOpen}
        setBuyOpen={setBuyOpen}
        product={product}
        selectProductGroups={selectProductGroups}
      />
      <Wrapper>
        <ContentWrapper>
          {loading ?
            <SkeletonProductDetails />
            :
            <>
              {product && (
                <>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6} lg={7}>
                      <ProductDetailsCarousel product={product} />
                    </Grid>

                    <Grid item xs={12} md={6} lg={5}>
                      <ItemName variant='h4'>{product?.product_name}</ItemName>
                      {product?.characters && product?.characters.map((character) => (
                        <>
                          <ItemCharacter key_name={character?.character_name} value={character?.character_value} />
                        </>
                      ))}
                      {/* <ProductDetailsSummary
                        product={product}
                        cart={""}
                        onAddCart={() => { }}
                        onGotoStep={() => { }}
                      /> */}
                      <ItemCharacter key_name={'정상가'} value={<div style={{ textDecoration: 'line-through' }}>{commarNumber(product?.product_price)}원</div>} />
                      <ItemCharacter key_name={'할인가'} value={<div>{commarNumber(product?.product_sale_price)}원</div>} />
                      <div style={{ borderBottom: '1px solid #ccc', width: '100%', marginTop: '1rem' }} />
                      <Button
                        disabled={getProductStatus(product?.status).color != 'info' || !(product?.product_sale_price > 0)}
                        sx={{ width: '100%', marginTop: '1rem', height: '48px' }}
                        variant='contained'
                        startIcon={<>
                          <Icon icon={'mdi:check-bold'} />
                        </>}
                        onClick={() => {
                          setBuyOpen(true)
                        }}
                      >바로구매</Button>
                      <Row style={{ columnGap: '0.5rem', marginTop: '0.5rem' }}>
                        <Button
                          disabled={getProductStatus(product?.status).color != 'info' || !(product?.product_sale_price > 0)}
                          sx={{ width: '50%', height: '48px' }}
                          variant='outlined'
                          startIcon={<>
                            <Icon icon={'mdi:cart'} />
                          </>}>장바구니</Button>
                        <Button
                          sx={{ width: '50%', height: '48px' }}
                          variant={themeWishData.map(wish => { return wish?.id }).includes(product?.id) ? 'contained' : 'outlined'}
                          startIcon={<>
                            <Icon icon={'mdi:heart'} />
                          </>}
                          onClick={async () => {
                            let result = await insertWishDataUtil(product, themeWishData, onChangeWishData);
                            if (result?.is_add) {
                              console.log(123)
                            }
                          }}
                        >위시리스트</Button>
                      </Row>
                    </Grid>
                  </Grid>
                  <Card style={{
                    marginTop: '2rem'
                  }}>
                    <Tabs
                      value={currentTab}
                      onChange={(event, newValue) => setCurrentTab(newValue)}
                      sx={{ px: 3, bgcolor: 'background.neutral' }}
                    >
                      {TABS.map((tab) => (
                        <Tab key={tab.value} value={tab.value} label={tab.label} />
                      ))}
                    </Tabs>
                    <Divider />
                    {TABS.map(
                      (tab) =>
                        tab.value === currentTab && (
                          <Box
                            key={tab.value}
                            sx={{
                              ...(currentTab === 'description' && {
                                p: 3,
                              }),
                            }}
                          >
                            {tab.component}
                          </Box>
                        )
                    )}
                  </Card>
                </>
              )}
            </>}
        </ContentWrapper>
      </Wrapper>
    </>
  )
}
export default ItemDemo