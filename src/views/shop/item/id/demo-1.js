import styled from 'styled-components'
import { useTheme } from "@emotion/react";
import { Box, Tab, Tabs, Card, Grid, Divider, Container, Typography, Stack, Button } from '@mui/material';
import { commarNumber } from 'src/utils/function';
import { test_item } from 'src/data/test-data';
import { themeObj } from 'src/components/elements/styled-components';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic'
import { useSettingsContext } from 'src/components/settings';
import { useRouter } from 'next/router';
import { ProductDetailsCarousel, ProductDetailsReview, ProductDetailsSummary } from 'src/views/e-commerce/details';
import { useSelector } from 'react-redux';
import { useState } from 'react';
import Markdown from 'src/components/markdown/Markdown';
import CartWidget from 'src/views/e-commerce/CartWidget';
import Iconify from 'src/components/iconify/Iconify';
import { SkeletonProductDetails } from 'src/components/skeleton';
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
const ItemContainer = styled.div`
display:flex;
flex-direction:column;
`
const ProductExplain = styled.div`
margin-top:2rem;
border-top: 1px solid ${themeObj.grey[300]};
`

const ItemContent = styled.div`
width:100%;
display:flex;
align-items:flex-start;
@media (max-width: 900px) {
  flex-direction: column;
}
`
const ProductImgContainer = styled.div`
width:50%;
display:flex;
padding-top:2rem;
@media (max-width: 900px) {
  width:100%;
  padding-top:0rem;
}
`
const ProductImg = styled.img`
margin:auto;
width:300px;
height:auto;
@media (max-width: 900px) {
  width:80%;
}
`
const ExampleContainer = styled.div`
width:50%;
padding-top:1.1rem;
@media (max-width: 900px) {
  width:100%;
}
`
const Name = styled.div`
font-weight:bold;
font-size:${themeObj.font_size.size2};
border-bottom: 1px solid ${themeObj.grey[300]};
`
const PriceContainer = styled.div`
border-bottom: 1px solid ${themeObj.grey[300]};
padding:2rem 0;
font-size:${themeObj.font_size.size6};
`

const KeyContent = styled.div`
width: 100px;
`
const Row = styled.div`
display: flex;
margin:0.5rem 0;
`
const ItemDetailCard = (props) => {
  const { item } = props;

  const theme = useTheme();
  return (
    <>
      <ItemContent>
        <ProductImgContainer>
          <ProductImg src={item?.product_img} />
        </ProductImgContainer>
        <ExampleContainer>
          <Name theme={theme}>{item.name}</Name>
          <PriceContainer theme={theme}>
            <Row>
              <KeyContent>시중가격</KeyContent>
              <div>{commarNumber(item?.mkt_pr)}원</div>
            </Row>
            <Row style={{ fontWeight: 'bold' }}>
              <KeyContent>판매가격</KeyContent>
              <div>{commarNumber(item?.item_pr)}원</div>
            </Row>
          </PriceContainer>
          <PriceContainer theme={theme}>
            <Row>
              <KeyContent>제조사</KeyContent>
              <div>{item?.mfg_nm}</div>
            </Row>
            <Row>
              <KeyContent>원산지</KeyContent>
              <div>{item?.origin_nm}</div>
            </Row>
            <Row>
              <KeyContent>브랜드</KeyContent>
              <div>{item?.brand_nm}</div>
            </Row>
            <Row>
              <KeyContent>모델</KeyContent>
              <div>{item?.model_nm}</div>
            </Row>
            <Row>
              <KeyContent>배송비결제</KeyContent>
              <div>주문시 결제</div>
            </Row>
          </PriceContainer>
          <PriceContainer theme={theme} style={{ borderBottom: 'none' }}>
            <Row style={{ justifyContent: 'space-between', fontWeight: 'bold' }}>
              <div>총 금액 :</div>
              <div style={{
                fontSize: themeObj.font_size.size5,
              }}>{commarNumber(item?.item_pr)}원</div>
            </Row>
          </PriceContainer>
          <Row>
            <Button type='submit' variant='contained' sx={{ mr: 2, ml: 'auto', width: '190px', height: '50px' }} >
              바로구매
            </Button>
            <Button type='submit' variant='outlined' sx={{ width: '190px', height: '50px' }}>
              장바구니
            </Button>
          </Row>

        </ExampleContainer>
      </ItemContent>
    </>
  )
}

// const Demo1 = (props) => {
//   const {
//     data: {

//     },
//     func: {
//       router
//     },
//   } = props;

//   return (
//     <>
//       <Wrapper>
//         <ContentWrapper>
//           <ItemContainer>
//             <ItemDetailCard item={test_item} />
//             <ProductExplain>
//               <ReactQuill
//                 value={test_item?.content ?? `<body></body>`}
//                 readOnly={true}
//                 theme={"bubble"}
//                 bounds={'.app'}
//               />
//             </ProductExplain>
//           </ItemContainer>
//         </ContentWrapper>
//       </Wrapper>
//     </>
//   )
// }
//여기까지
const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeStretch } = useSettingsContext();

  const {
    query: { name },
  } = useRouter();

  const product = test_item

  const [currentTab, setCurrentTab] = useState('description');


  const TABS = [
    {
      value: 'description',
      label: 'description',
      component: product ? <Markdown children={product?.description} /> : null,
    },
    {
      value: 'reviews',
      label: `Reviews (100)`,
      component: product ? <ProductDetailsReview product={product} /> : null,
    },
  ];
  const SUMMARY = [
    {
      title: '100% Original',
      description: 'Chocolate bar candy canes ice cream toffee cookie halvah.',
      icon: 'ic:round-verified',
    },
    {
      title: '10 Day Replacement',
      description: 'Marshmallow biscuit donut dragée fruitcake wafer.',
      icon: 'eva:clock-fill',
    },
    {
      title: 'Year Warranty',
      description: 'Cotton candy gingerbread cake I love sugar sweet.',
      icon: 'ic:round-verified-user',
    },
  ];
  return (
    <>
      <Wrapper>
        <ContentWrapper>
          <CartWidget totalItems={100} />

          {product && (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={7}>
                  <ProductDetailsCarousel product={test_item} />
                </Grid>

                <Grid item xs={12} md={6} lg={5}>
                  <ProductDetailsSummary
                    product={test_item}
                    cart={''}
                    onAddCart={() => { }}
                    onGotoStep={() => { }}
                  />
                </Grid>
              </Grid>

              <Box
                gap={5}
                display="grid"
                gridTemplateColumns={{
                  xs: 'repeat(1, 1fr)',
                  md: 'repeat(3, 1fr)',
                }}
                sx={{ my: 10 }}
              >
                {SUMMARY.map((item) => (
                  <Box key={item.title} sx={{ textAlign: 'center' }}>
                    <Stack
                      alignItems="center"
                      justifyContent="center"
                      sx={{
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        borderRadius: '50%',
                        color: 'primary.main',
                      }}
                    >
                      <Iconify icon={item.icon} width={36} />
                    </Stack>

                    <Typography variant="h6" sx={{ mb: 1, mt: 3 }}>
                      {item.title}
                    </Typography>

                    <Typography sx={{ color: 'text.secondary' }}>{item.description}</Typography>
                  </Box>
                ))}
              </Box>

              <Card>
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
          {<SkeletonProductDetails />}
        </ContentWrapper>
      </Wrapper>
    </>
  )
}
export default Demo1
