import styled from 'styled-components'
import { Box, Tab, Tabs, Card, Grid, Divider, Typography, Button, Radio, FormControlLabel } from '@mui/material';
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
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useModal } from 'src/components/dialog/ModalProvider';
import { BasicInfo, ProductFaq } from 'src/components/elements/shop/demo-4';

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
  const { key_name, value, type = 0 } = props;
  if (type == 0) {
    return (
      <>
        <Row style={{ columnGap: '0.25rem', marginTop: '1rem' }}>
          <Typography variant='body2' style={{ width: '100px' }}>{key_name}:</Typography>
          <Typography variant='subtitle2'>{value}</Typography>
        </Row>
      </>
    )
  } else if (type == 1) {
    return (
      <>
        <Row style={{ columnGap: '0.25rem', marginTop: '1rem', alignItems:'center' }}>
          <Typography variant='body2' style={{ width: '100px' }}>{key_name}:</Typography>
          <div>
            <FormControlLabel value='' control={<Radio disabled />} label='압구정 그랑파리' />
            <FormControlLabel value='' control={<Radio disabled />} label='인스파이어 럭셔리에디션' />
          </div>
        </Row>
      </>
    )
  }
}
const ItemDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;

  const { setModal } = useModal();
  const { themeStretch, themeDnsData, themeWishData, onChangeWishData, themeCartData, onChangeCartData, themePropertyList } = useSettingsContext();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState('description');
  const [product, setProduct] = useState({});
  const [reviewPage, setReviewPage] = useState(1);
  const [buyOpen, setBuyOpen] = useState(false);
  //const [reviewContent, setReviewContent] = useState({});
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
    data['sub_images'] = (data?.sub_images ?? []).map((img) => { //cannot create property on false? 오류 간헐적 발생
      return img?.product_sub_img
    })
    /*if (data?.product_img) {  //메인이미지를 상세이미지에 추가하는 코드
      data['sub_images'].unshift(data?.product_img)
    }*/
    data['images'] = data['sub_images'];
    /*setReviewPage(review_page);
    let review_data = await apiManager('product-reviews', 'list', {
      page: review_page,
      product_id: router.query?.id,
      page_size: 10,
    })
    setReviewContent(review_data)*/
    setProduct(data);
    setLoading(false);
  }

  const TABS = [
    {
      value: 'description',
      label: '상품정보',
      component: product?.product_description ?
        <ReactQuill
          className='none-padding'
          value={`
    ${product?.product_description ?? ''}
    ${themeDnsData?.basic_info}
  `}
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
      value: 'item_faq',
      label: '상품문의',
      component: product ? //<></> : null,
        <ProductFaq /> : null,
    },
    /*{
      value: 'reviews',
      label: `상품후기 (${reviewContent?.total})`,
      component: product ? <ProductDetailsReview product={product} reviewContent={reviewContent} onChangePage={getItemInfo} reviewPage={reviewPage} /> : null,
    },*/
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
                    <Grid item xs={12} md={6} lg={6}>
                      <ProductDetailsCarousel product={product} />
                    </Grid>

                    <Grid item xs={12} md={6} lg={6}>
                      <ItemName variant='h4' style={{whiteSpace:'wrap'}}>{product?.product_name}</ItemName>
                      {product?.brand_name &&
                      <>
                      <ItemCharacter key_name={'브랜드'} value={product?.brand_name[0].category_en_name} />
                      </>
                      }
                      {product?.product_code &&
                        <>
                          <ItemCharacter key_name={'상품코드'} value={product?.product_code} />
                        </>}
                      {themePropertyList.map((group, index) => {
                        let property_list = (product?.properties ?? []).filter(el => el?.property_group_id == group?.id);
                        property_list = property_list.map(property => {
                          return property?.property_name
                        })
                        if (group?.property_group_name == '등급') {
                          return <ItemCharacter key_name={group?.property_group_name} value={`${property_list.join(', ')}`} />
                        }
                        if (group?.property_group_name == '매장') {
                          return <ItemCharacter key_name={group?.property_group_name} value={`${property_list.join(', ')}`} type='1' />
                        }

                      })}
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
                      {commarNumber(product?.product_price) != commarNumber(product?.product_sale_price) ?
                        <>
                          <ItemCharacter key_name={'정상가'} value={<div style={{ textDecoration: 'line-through' }}>{commarNumber(product?.product_price)}원</div>} />
                          <ItemCharacter key_name={'할인가'} value={<div>{commarNumber(product?.product_sale_price)}원</div>} />
                        </>
                        :
                        <>
                          <ItemCharacter key_name={'판매가'} value={<div>{commarNumber(product?.product_sale_price)}원</div>} />
                        </>
                      }
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
                          </>}
                          onClick={() => {
                            handleAddCart()
                          }}
                        >장바구니</Button>
                        <Button
                          sx={{ width: '50%', height: '48px' }}
                          variant={themeWishData.map(wish => { return wish?.product_id }).includes(product?.id) ? 'contained' : 'outlined'}
                          startIcon={<>
                            <Icon icon={'mdi:heart'} />
                          </>}
                          onClick={async () => {
                            if (user) {
                              let result = await insertWishDataUtil(product, themeWishData, onChangeWishData);
                              if (result?.is_add) {
                                setModal({
                                  func: () => {
                                    router.push(`/shop/auth/wish`)
                                  },
                                  icon: 'mdi:heart',
                                  title: '상품이 위시리스트에 담겼습니다\n바로 확인 하시겠습니까?'
                                })
                              }
                            } else {
                              toast.error('로그인을 해주세요.')
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
                      {themeDnsData?.show_basic_info ?
                        TABS.map((tab, index) => (
                          <Tab key={tab.value} value={tab.value} label={tab.label} />
                        ))
                        :
                        TABS.map((tab, index) => {
                          if (index !== 1) {
                            return (
                              <Tab key={tab.value} value={tab.value} label={tab.label} />
                            )
                          }
                        })
                      }
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