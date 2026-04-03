import styled from 'styled-components'
import { Grid, Typography, Button, Divider, Stack, Tab, Tabs } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { ProductDetailsCarousel, ProductDetailsReview } from 'src/views/@dashboard/e-commerce/details';
import { useEffect, useState } from 'react';
import { SkeletonProductDetails } from 'src/components/skeleton';
import dynamic from 'next/dynamic'
import { apiManager, apiShop } from 'src/utils/api';
import { styled as muiStyle } from '@mui/material'
import { commarNumber } from 'src/utils/function';
import { Icon } from '@iconify/react';
import { insertCartDataUtil, insertWishDataUtil, selectItemOptionUtil } from 'src/utils/shop-util';
import toast from 'react-hot-toast';
import DialogBuyNow from 'src/components/dialog/DialogBuyNow';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import Head from 'next/head';

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
const StyledReactQuill = styled(ReactQuill)`
.ql-editor {
  font-size: 16px;
  font-family: 'Noto Sans KR';
}
`

const ItemDemo = (props) => {
  const {
    data: {},
    func: { router },
  } = props;
  const { themeDnsData, themeWishData, onChangeWishData, themeCartData, onChangeCartData } = useSettingsContext();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState('description');
  const [product, setProduct] = useState({});
  const [reviewPage, setReviewPage] = useState(1);
  const [buyOpen, setBuyOpen] = useState(false);
  const [reviewContent, setReviewContent] = useState({});
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectProductGroups, setSelectProductGroups] = useState({
    count: 1,
    groups: [],
  });

  useEffect(() => {
    getProductInfo();
  }, [router.query?.id])

  useEffect(() => {
    if (product?.id) {
      getReviewInfo(reviewPage);
    }
  }, [product?.id, reviewPage])

  const getProductInfo = async () => {
    if (!router.query?.id) return;
    let data = await apiShop('product', 'get', {
      id: router.query?.id,
      seller_id: themeDnsData?.seller_id ?? 0
    });
    if (!data) {
      setLoading(false);
      return;
    }
    data['sub_images'] = (data?.sub_images ?? []).map((img) => img?.product_sub_img).filter(Boolean);
    if (data?.product_img) {
      data['sub_images'].unshift(data?.product_img);
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

  const onSelectOption = (group, option) => {
    let select_product_groups = selectItemOptionUtil(group, option, selectProductGroups);
    setSelectProductGroups(select_product_groups);
  }

  const handleAddCart = async () => {
    if (user) {
      let result = await insertCartDataUtil({ ...product, seller_id: themeDnsData?.seller_id ?? 0 }, selectProductGroups, themeCartData, onChangeCartData);
      if (result) {
        toast.success("장바구니에 추가되었습니다.");
      }
    } else {
      toast.error('로그인을 해주세요.');
    }
  }

  const handleBuyNow = () => {
    if (!user) {
      toast.error('로그인을 해주세요.');
      return;
    }
    if (product?.characters?.length > 0 && selectProductGroups?.groups?.length < product?.characters?.length) {
      toast.error('옵션을 선택해주세요.');
      return;
    }
    setBuyOpen(true);
  }

  const handleWish = () => {
    if (user) {
      insertWishDataUtil(product, themeWishData, onChangeWishData);
    } else {
      toast.error('로그인을 해주세요.');
    }
  }

  const hasDiscount = product?.product_price > product?.product_sale_price && product?.product_sale_price > 0;
  const discountRate = hasDiscount ? Math.round((1 - product.product_sale_price / product.product_price) * 100) : 0;

  const TABS = [
    {
      value: 'description',
      label: '상품정보',
      component: product?.product_description ?
        <StyledReactQuill
          className='none-scroll'
          value={product?.product_description ?? ''}
          readOnly={true}
          theme={"bubble"}
          bounds={'.app'}
        /> : null,
    },
    {
      value: 'reviews',
      label: `상품후기 (${reviewContent?.total ?? 0})`,
      component: product ? <ProductDetailsReview product={product} reviewContent={reviewContent} onChangePage={(page) => setReviewPage(page)} reviewPage={reviewPage} reviewLoading={reviewLoading} /> : null,
    },
  ];

  return (
    <>
      <Head>
        <title>{product?.product_name ?? ''}</title>
      </Head>
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
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                      <ProductDetailsCarousel product={product} />
                    </Grid>
                    <Grid item xs={12} md={6} style={{ display: 'flex', flexDirection: 'column' }}>
                      {product?.product_code &&
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          {product?.product_code}
                        </Typography>
                      }
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {product?.product_name}
                      </Typography>
                      {product?.product_comment &&
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                          {product?.product_comment}
                        </Typography>
                      }
                      <Divider sx={{ my: 1 }} />
                      <div style={{ margin: '1rem 0' }}>
                        {hasDiscount &&
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#999' }}>{commarNumber(product?.product_price)}원</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#e74c3c' }}>{discountRate}%</span>
                          </div>
                        }
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {commarNumber(product?.product_sale_price || product?.product_price)}원
                        </Typography>
                      </div>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', my: 1 }}>
                        {product?.delivery_fee > 0 ? `배송비 ${commarNumber(product?.delivery_fee)}원` : '무료배송'}
                      </Typography>
                      {product?.characters && product?.characters.map((character, idx) => (
                        <div key={idx} style={{ marginTop: '0.5rem' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{character?.character_name}</Typography>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {character?.character_value && character?.character_value.split(/[,/]\s*/)?.map(val => val.trim()).map((option, optIdx) => (
                              <Button
                                key={optIdx}
                                variant={selectProductGroups?.groups?.find(g => g?.character_name === character?.character_name && g?.option === option) ? 'contained' : 'outlined'}
                                size="small"
                                color="inherit"
                                onClick={() => onSelectOption(character, option)}
                                sx={{ minWidth: '60px', fontSize: '13px' }}
                              >
                                {option}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                        <Stack direction="row" spacing={1}>
                          <Button variant="outlined" color="inherit" onClick={handleWish} sx={{ minWidth: '50px' }}>
                            <Icon icon={themeWishData?.map(itm => itm?.product_id).includes(product?.id) ? 'mdi:heart' : 'mdi:heart-outline'} fontSize="1.5rem" style={{ color: themeWishData?.map(itm => itm?.product_id).includes(product?.id) ? 'red' : '' }} />
                          </Button>
                          <Button variant="outlined" color="inherit" onClick={handleAddCart} sx={{ flex: 1, fontWeight: 600 }}>
                            장바구니
                          </Button>
                          <Button variant="contained" color="inherit" onClick={handleBuyNow} sx={{ flex: 1, fontWeight: 600 }}>
                            바로구매
                          </Button>
                        </Stack>
                      </div>
                    </Grid>
                  </Grid>
                  <div style={{ marginTop: '3rem' }}>
                    <Tabs
                      value={currentTab}
                      onChange={(e, val) => setCurrentTab(val)}
                      sx={{ borderBottom: '1px solid #eee', mb: 3 }}
                    >
                      {TABS.map((tab) => (
                        <Tab key={tab.value} value={tab.value} label={tab.label} />
                      ))}
                    </Tabs>
                    {TABS.map((tab) => tab.value === currentTab && (
                      <div key={tab.value}>
                        {tab.component}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          }
        </ContentWrapper>
      </Wrapper>
    </>
  )
}
export default ItemDemo
