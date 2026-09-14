import styled from 'styled-components'
import ProductNotFound from 'src/components/elements/shop/ProductNotFound';
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
import { isReviewEnabled } from 'src/utils/review';
import useReviewSummary from 'src/components/elements/shop/review/useReviewSummary';
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
  const [notFound, setNotFound] = useState(false);

  const [currentTab, setCurrentTab] = useState('description');
  const [product, setProduct] = useState({});

  // 상품 정보 로드 (최초 1회)
  useEffect(() => {
    getProductInfo();
  }, [router.query?.id])

  // 리뷰 로드 (상품 로드 후 + 페이지 변경 시)
  // 후기 수(탭 라벨)는 요약 훅이 60초 공유로 가져온다. 목록·정렬·작성은 ProductDetailsReview 가 스스로 한다.
  const { summary: reviewSummary } = useReviewSummary(product?.id, isReviewEnabled(themeDnsData));

  const getProductInfo = async () => {
    if (!router.query?.id) return;

    let data = await apiShop('product', 'get', {
      id: router.query?.id
    });
    if (!data) {
      // 없는 상품 주소로 들어오면 예전엔 빈 {} 로 그리다가 캐러셀에서 화면이 죽었다.
      setNotFound(true);
      setLoading(false);
      return;
    }
    data['sub_images'] = data['sub_images'].map((img) => {
      return img?.product_sub_img
    }).filter(Boolean) // 상세설명 전용 행은 product_sub_img 가 비어 있다 — 걸러야 빈 썸네일(엑박)이 안 생긴다.
    if (data?.product_img) {
      data['sub_images'].unshift(data?.product_img)
    }
    data['images'] = data['sub_images'];
    setProduct(data);
    setLoading(false);
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
      label: `${translate('상품후기')} (${reviewSummary?.count ?? 0})`,
      component: product ? <ProductDetailsReview product={product} variant="full" /> : null,
    },
  ];
  // 후기 탭은 가맹점이 「후기설정」에서 켰을 때만(isReviewEnabled). 별점 줄·후기 영역도 같은 판정을 쓴다.
  const TABS = ALL_TABS.filter((t) => t?.value !== 'reviews' || isReviewEnabled(themeDnsData));

  return (
    <>
      <Head>
        <title>{themeDnsData?.name} - {formatLang(product, 'product_name', currentLang)}</title>
      </Head>
      <Wrapper>
        <ContentWrapper>
          {loading ?
            <SkeletonProductDetails />
            : notFound ?
            <ProductNotFound />
            :
            <>
              {product && (
                <>
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
                              ...((currentTab === 'description' || currentTab === 'reviews') && {
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