import { Box, Grid, Tab, Tabs, Card, Divider } from "@mui/material";
import { useEffect, useState } from "react";
import { SkeletonProductDetails } from "src/components/skeleton";
import { test_item } from "src/data/test-data";
import dynamic from "next/dynamic";
import { ProductDetailsCarousel, ProductDetailsReview, ProductDetailsSummary } from "src/views/e-commerce/details";
import styled from "styled-components";
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
margin:1rem auto;
`

//상품 상세페이지 박이규
const Demo2 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('description');
  const [product, setProduct] = useState({});

  useEffect(() => {
    getItemInfo(1);
  }, [])

  const getItemInfo = (review_page) => {
    let data = test_item;
    if (data?.product_img) {
      data['images'].unshift(data?.product_img)
    }
    setProduct(data);

    setLoading(false);
  }
  const TABS = [
    {
      value: 'description',
      label: '상세정보',
      component: product ?
        <ReactQuill
          className='none-padding'
          value={product?.content ?? `<body></body>`}
          readOnly={true}
          theme={"bubble"}//bubble, snow중에 bubble이 위에 툴바가 안보임 
          bounds={'.app'}
        /> : null,
    },
    {
      value: 'reviews',
      label: `상품후기 (100)`,
      component: product ? <ProductDetailsReview product={product} /> : null,
    },
    {
      value: 'QnA',
      label: `Q&A`,
      component: product ? <ProductDetailsReview product={product} /> : null,
    },
    {
      value: 'guide',
      label: `쇼핑가이드`,
      component: product ? <ProductDetailsReview product={product} /> : null,
    },
  ];
  return (
    <>
      <Wrapper>
        <ContentWrapper>{//스켈레톤 사용자를 위한 로딩 UI
          loading ? <SkeletonProductDetails />
            :
            <>{product && (//Carousel이 상품 상세페이지의 이미지와 옆으로 넘어가는 기능
              <><Grid container spacing={3}>
                <Grid item xs={12} md={6} lg={7}>
                  <ProductDetailsCarousel product={product} />
                </Grid>
                <Grid item xs={12} md={6} lg={5}>
                  <ProductDetailsSummary
                    product={product}//Summary가 상세보기 이미지 옆의 사이즈, 수량, 평점 등 기능
                    cart={""}//근데 잘나오던 상품 이름이랑 작은 설명이 갑자기 안나옴 7/24일 
                    onAddCart={() => { }}//이거 ProductDetailsSummary여기 118,119줄 product_name,product_comment을 name,sub_name로 바꾸면 나옴 아무튼 통일시켜야함
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
                  {TABS.map(//탭 안에 넣어둔거 상세페이지 들어가면 아래에 상세정보랑 후기 나오는 기능
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
export default Demo2
