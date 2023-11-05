import styled from 'styled-components'
import { Box, Tab, Tabs, Card, Grid, Divider, } from '@mui/material';
import { test_item } from 'src/data/test-data';
import { useSettingsContext } from 'src/components/settings';
import { ProductDetailsCarousel, ProductDetailsReview, ProductDetailsSummary } from 'src/views/@dashboard/e-commerce/details';
import { useEffect, useState } from 'react';
import { SkeletonProductDetails } from 'src/components/skeleton';
import dynamic from 'next/dynamic'
import { apiManager, apiShop } from 'src/utils/api';
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
const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeStretch } = useSettingsContext();

  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState('description');
  const [item, setItem] = useState({});
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
    console.log(data)
    data['sub_images'] = data['sub_images'].map((img) => {
      return img?.product_sub_img
    })
    if (data?.product_img) {
      data['sub_images'].unshift(data?.product_img)
    }
    data['images'] = data['sub_images'];
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
      component: product ? <ProductDetailsReview product={product} reviewContent={reviewContent} onChangePage={getItemInfo} /> : null,
    },
  ];

  return (
    <>
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
export default Demo1
