import styled from 'styled-components'
import { Box, Tab, Tabs, Card, Grid, Divider, } from '@mui/material';
import { useTheme } from '@mui/material/styles';
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
import { themeObj } from 'src/components/elements/styled-components';
import { isShopgoBrand } from 'src/utils/is-shopgo';
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
margin: 1.5rem auto;
`
const TopBar = styled.div`
display:flex;
align-items:center;
column-gap:0.5rem;
margin-bottom:1.25rem;
padding-bottom:0.75rem;
border-bottom:1px solid ${themeObj.grey[300]};
`
const CategoryLabel = styled.div`
text-transform:uppercase;
font-weight:bold;
font-size:${themeObj.font_size.size9};
letter-spacing:0.08em;
color:${props => props.theme?.palette?.primary?.main};
`
const TopDivider = styled.div`
width:1px;
height:12px;
background:${themeObj.grey[300]};
`
const ProductTitle = styled.div`
font-size:${themeObj.font_size.size8};
color:${themeObj.grey[600]};
overflow:hidden;
text-overflow:ellipsis;
white-space:nowrap;
`
const ItemDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const theme = useTheme();
  const { translate, currentLang } = useLocales();
  const { themeStretch, themeDnsData } = useSettingsContext();

  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState('description');
  const [product, setProduct] = useState({});
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewContent, setReviewContent] = useState({});
  const [reviewLoading, setReviewLoading] = useState(false);

  // 상품 정보 로드 (최초 1회)
  useEffect(() => {
    getProductInfo();
  }, [router.query?.id])

  // 리뷰 로드 (상품 로드 후 + 페이지 변경 시)
  useEffect(() => {
    if (product?.id) {
      getReviewInfo(reviewPage);
    }
  }, [product?.id, reviewPage])

  const getProductInfo = async () => {
    if (!router.query?.id) return;

    let data = await apiShop('product', 'get', {
      id: router.query?.id
    });
    if (!data) {
      setLoading(false);
      return;
    }
    data['sub_images'] = data['sub_images'].map((img) => {
      return img?.product_sub_img
    })
    if (data?.product_img) {
      data['sub_images'].unshift(data?.product_img)
    }
    data['images'] = data['sub_images'];
    setProduct(data);
    setLoading(false);
  }

  const getReviewInfo = async (page) => {
    setReviewLoading(true);
    let review_data = await apiManager('product-reviews', 'list', {
      page: page,
      product_id: router.query?.id,
      page_size: 10,
    })
    setReviewContent(review_data);
    setReviewLoading(false);
  }

  const onChangeReviewPage = (page) => {
    setReviewPage(page);
  }
  const ALL_TABS = [
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
    /*{
      value: 'basic_info',
      label: '기본정보',
      component: product ?
        <BasicInfo /> : null,
    },*/
    {
      value: 'reviews',
      label: `${translate('상품후기')} (${reviewContent?.total ?? 0})`,
      component: product ? <ProductDetailsReview product={product} reviewContent={reviewContent} onChangePage={onChangeReviewPage} reviewPage={reviewPage} reviewLoading={reviewLoading} /> : null,
    },
  ];
  // ShopGo 산하는 상품후기를 쓰지 않는다 — 후기 탭을 감춘다.
  // (별점과 작성 버튼은 ProductDetailsSummary·ProductDetailsReview 에서 함께 막는다)
  const TABS = ALL_TABS.filter((t) => t?.value !== 'reviews' || !isShopgoBrand(themeDnsData));

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
                  <TopBar>
                    <CategoryLabel theme={theme}>Product</CategoryLabel>
                    <TopDivider />
                    <ProductTitle>{formatLang(product, 'product_name', currentLang)}</ProductTitle>
                  </TopBar>
                  <Grid container spacing={3}>
                    {
                      themeDnsData?.id != 95 ?
                        <>
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
                        </>
                        :
                        <>
                          <Grid item xs={12} md={6} lg={4}>
                            <ProductDetailsCarousel product={product} />
                          </Grid>

                          <Grid item xs={12} md={6} lg={8}>
                            <ProductDetailsSummary
                              product={product}
                              cart={""}
                              onAddCart={() => { }}
                              onGotoStep={() => { }}
                            />
                          </Grid>
                        </>
                    }
                  </Grid>
                  <Card style={{
                    marginTop: '2rem',
                    borderRadius: 0,
                    border: `1px solid ${themeObj.grey[300]}`,
                    boxShadow: 'none',
                  }}>
                    <Tabs
                      value={currentTab}
                      onChange={(event, newValue) => setCurrentTab(newValue)}
                      TabIndicatorProps={{
                        sx: { bgcolor: 'primary.main', height: '2px' }
                      }}
                      sx={{
                        px: 3,
                        borderBottom: `1px solid ${themeObj.grey[300]}`,
                        '& .MuiTab-root': {
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                          letterSpacing: '0.04em',
                          fontSize: themeObj.font_size.size9,
                        },
                        '& .Mui-selected': {
                          color: 'primary.main',
                        },
                      }}
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
