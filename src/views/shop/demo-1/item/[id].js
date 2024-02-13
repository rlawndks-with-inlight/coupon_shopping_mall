import styled from 'styled-components'
import { Box, Tab, Tabs, Card, Grid, Divider, } from '@mui/material';
import { test_item } from 'src/data/test-data';
import { useSettingsContext } from 'src/components/settings';
import { ProductDetailsCarousel, ProductDetailsReview, ProductDetailsSummary } from 'src/views/@dashboard/e-commerce/details';
import { useEffect, useState } from 'react';
import { SkeletonProductDetails } from 'src/components/skeleton';
import dynamic from 'next/dynamic'
import { apiManager, apiShop } from 'src/utils/api';
import Head from 'next/head';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import { BasicInfo } from 'src/components/elements/shop/demo-4';
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
const ItemDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { translate, currentLang } = useLocales();
  const { themeStretch, themeDnsData } = useSettingsContext();

  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState('description');
  const [product, setProduct] = useState({});
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewContent, setReviewContent] = useState({});
  useEffect(() => {
    getItemInfo(1);
  }, [])

  const getItemInfo = async (review_page) => {
    let data = { ...product };
    data = await apiShop('product', 'get', {
      id: router.query?.id
    });
    data['sub_images'] = data['sub_images'].map((img) => {
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
      label: translate('상품설명'),
      component: product?.product_description ?
        <ReactQuill
          className='none-padding'
          value={formatLang(product, 'product_description', currentLang) || `<body></body>`}
          readOnly={true}
          theme={"bubble"}
          bounds={'.app'}
        /> : null,
    },
    /*{ 그랑파리 정보에만 해당되는 내용이 많아 주석 처리해둠
      value: 'basic_info',
      label: '기본정보',
      component: product ?
        <BasicInfo /> : null,
    },*/
    {
      value: 'reviews',
      label: `${translate('상품후기')} (${reviewContent?.total})`,
      component: product ? <ProductDetailsReview product={product} reviewContent={reviewContent} onChangePage={getItemInfo} reviewPage={reviewPage} /> : null,
    },
  ];

  return (
    <>
      <Head>
        <title>{themeDnsData?.name} - {formatLang(product, 'product_name', currentLang)}</title>
      </Head>
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
                      <ProductDetailsSummary
                        product={product}
                        cart={""}
                        onAddCart={() => { }}
                        onGotoStep={() => { }}
                      />
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