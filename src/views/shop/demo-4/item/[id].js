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
font-size:16px;
`

const StyledReactQuill = styled(ReactQuill)`
.ql-editor {
  font-size: 16px;
  font-family: 'Noto Sans KR';
}
`

const ItemCharacter = (props) => {
  const { key_name, value, type = 0 } = props;
  if (type == 0) {
    return (
      <>
        <Row style={{ columnGap: '0.25rem', marginTop: '1rem', fontSize: '14px' }}>
          <Typography style={{width:'6rem', }}>{key_name}</Typography>
          <Typography>{value}</Typography>
        </Row>
      </>
    )
  } /*else if (type == 1) {
    return (
      <>
        <Row style={{ columnGap: '0.25rem', marginTop: '1rem', alignItems:'center' }}>
          <Typography>{key_name} :</Typography>
          <div>
            <FormControlLabel value='' control={<Radio />} label='압구정 그랑파리' />
            <FormControlLabel value='' control={<Radio disabled />} label='인스파이어 럭셔리에디션' />
          </div>
        </Row>
      </>
    )
  }*/
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
    //console.log(themePropertyList)
    //console.log(product)
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
      label: 'Detail',
      component: product?.product_description ?
        <StyledReactQuill
          className='none-scroll'
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
      label: 'Q&A',
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

                      {product?.brand_name &&
                        <>
                          <div style={{ fontSize: '40px', fontFamily: 'Playfair Display', fontWeight: 'bold', borderTop: '1px solid #ccc', padding: '1rem 0' }}>
                            {product?.brand_name[0].category_en_name}
                          </div>
                        </>
                      }
                      <ItemName style={{ whiteSpace: 'wrap' }}>{product?.product_name}</ItemName>
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
                        /*if (group?.property_group_name == '매장') {
                          return <ItemCharacter key_name={group?.property_group_name} value={`${property_list.join(', ')}`} type='1' />
                        }*/
                      })}
                      {product?.characters && product?.characters.map((character) => (
                        <>
                          <ItemCharacter key_name={character?.character_name} value={character?.character_value} />
                        </>
                      ))}
                      {commarNumber(product?.product_price) != commarNumber(product?.product_sale_price) ?
                          <>
                            <ItemCharacter 
                            key_name={'판매가'} 
                            value={<>
                              {commarNumber(product?.product_sale_price)}원
                            <div style={{textDecoration:'line-through', color: '#999999'}}>
                              {commarNumber(product?.product_price)}원
                              </div>
                            </>
                            } 
                            />
                            <ItemCharacter key_name={'할인율'} value={`${parseFloat((parseInt(product?.product_price - product?.product_sale_price) / parseInt(product?.product_price) * 100).toFixed(2))}%`} />
                          </>
                          :
                          <>
                            <div style={{ fontSize: '22px' }}>
                              {product?.product_sale_price != 0 ? <div>{commarNumber(product?.product_sale_price)}원</div> : <div>SOLD OUT</div>}
                            </div>
                          </>
                        }
                      {/* <ProductDetailsSummary
                        product={product}
                        cart={""}
                        onAddCart={() => { }}
                        onGotoStep={() => { }}
                      /> 
                      <div style={{ marginTop: '5rem' }}>
                        {commarNumber(product?.product_price) != commarNumber(product?.product_sale_price) ?
                          <>
                            <div style={{ fontSize: '14px', textDecoration: 'line-through', color: '#999999' }}>
                              {commarNumber(product?.product_price)}원
                            </div>
                            <div style={{ fontSize: '22px', display: 'flex' }}>
                              <div style={{ marginRight: '1rem' }}>
                                {parseFloat((parseInt(product?.product_price - product?.product_sale_price) / parseInt(product?.product_price) * 100).toFixed(2))}%
                              </div>
                              {commarNumber(product?.product_sale_price)}원
                            </div>
                          </>
                          :
                          <>
                            <div style={{ fontSize: '22px' }}>
                              {product?.product_sale_price != 0 ? <div>{commarNumber(product?.product_sale_price)}원</div> : <div>SOLD OUT</div>}
                            </div>
                          </>
                        }
                      </div> */}
                      <div style={{ borderBottom: '1px solid #ccc', width: '100%', marginTop: '1rem' }} />
                      {themePropertyList.map((group, index) => {
                        let property_list = (product?.properties ?? []).filter(el => el?.property_group_id == group?.id);
                        property_list = property_list.map(property => {
                          return property?.property_name
                        })
                        if (group?.property_group_name == '매장') {
                          return <>
                            <div style={{ margin: '1rem 0 3rem 0' }}>
                              {`${property_list.join(', ')}` == '압구정, 인스파이어' ?
                                <div style={{ fontSize: '14px' }}>
                                  <Icon icon={'mdi:location'} style={{ color: '#FF5B0D' }} /> 압구정 그랑파리<br />
                                  <Icon icon={'mdi:location'} style={{ color: '#FF5B0D' }} /> 인스파이어 럭셔리에디션
                                </div>
                                :
                                `${property_list.join(', ')}` == '압구정' ?
                                  <div style={{ fontSize: '14px', color: '#999999' }}>
                                    <Row style={{ color: 'black' }}><Icon icon={'mdi:location'} style={{ color: '#FF5B0D' }} /> &nbsp;압구정 그랑파리</Row>
                                    <Icon icon={'mdi:location'} /> 인스파이어 럭셔리에디션
                                  </div>
                                  :
                                  `${property_list.join(', ')}` == '인스파이어' ?
                                    <div style={{ fontSize: '14px', color: '#999999' }}>
                                      <Icon icon={'mdi:location'} /> 압구정 그랑파리
                                      <Row style={{ color: 'black' }}><Icon icon={'mdi:location'} style={{ color: '#FF5B0D' }} /> &nbsp;인스파이어 럭셔리에디션</Row>
                                    </div>
                                    :
                                    <div style={{ fontSize: '14px', color: '#999999' }}>
                                      <Icon icon={'mdi:location-on-outline'} /> 압구정 그랑파리<br />
                                      <Icon icon={'mdi:location-on-outline'} /> 인스파이어 럭셔리에디션
                                    </div>
                              }
                            </div>
                          </>
                        }
                      })}
                      <Button
                        disabled={product?.status != 0 || !(product?.product_sale_price > 0)}
                        sx={{
                          width: '100%',
                          marginTop: '1rem',
                          height: '60px',
                          backgroundColor: 'black',
                          borderRadius: '0',
                          fontWeight: 'bold',
                          fontSize: '18px',
                          fontFamily: 'Playfair Display',
                          color: 'white',
                          border:'1px solid #999999',
                          '&:hover': {
                            backgroundColor: 'black',
                          }
                        }}
                        //variant='contained'
                        /*startIcon={<>
                          <Icon icon={'mdi:check-bold'} />
                        </>}*/
                        onClick={() => {
                          setBuyOpen(true)
                        }}
                      >Buy Now</Button>
                      <Row style={{ columnGap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                        <Button
                          disabled={product?.status != 0 || !(product?.product_sale_price > 0)}
                          sx={{
                            width: '90%',
                            height: '60px',
                            //backgroundColor: 'white',
                            borderRadius: '0',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            fontFamily: 'Playfair Display',
                            color: '#999999',
                            border:'1px solid #999999',
                            '&:hover': {
                              backgroundColor: 'transparent',
                            }
                          }}
                          //variant='outlined'
                          /*startIcon={<>
                            <Icon icon={'mdi:cart'} />
                          </>}*/
                          onClick={() => {
                            handleAddCart()
                          }}
                        >add to cart</Button>
                        <Icon
                          icon={themeWishData.map(wish => { return wish?.product_id }).includes(product?.id) ? 'ph:heart-fill' : 'ph:heart-light'}
                          style={{
                            width: '30px',
                            height: '30px',
                            color: '#FF5B0D',
                            cursor: 'pointer',
                            margin: '0 1rem'
                          }}
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
                        />
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
                            {commarNumber(product?.product_price) != commarNumber(product?.product_sale_price) && currentTab === 'description' ?
                              <>
                                <div style={{ color: `${themeDnsData?.theme_css?.main_color}`, fontWeight: 'bold' }}>
                                  {commarNumber(product?.product_price)} 원에서 {commarNumber(product?.product_sale_price)} 원으로 가격인하를 하였습니다.
                                </div>
                              </>
                              :
                              <>
                              </>
                            }
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