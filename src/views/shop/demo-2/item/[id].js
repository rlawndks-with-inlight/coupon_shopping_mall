import styled from 'styled-components'
import { Grid, Typography, Button, Divider, Stack, Tab, Tabs, Chip } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { ProductDetailsCarousel, ProductDetailsReview } from 'src/views/@dashboard/e-commerce/details';
import { useEffect, useState } from 'react';
import { SkeletonProductDetails } from 'src/components/skeleton';
import dynamic from 'next/dynamic'
import { apiManager, apiShop } from 'src/utils/api';
import { commarNumber, getProductStatus, commarNumberWithUnit } from 'src/utils/function';
import { Icon } from '@iconify/react';
import { insertCartDataUtil, insertWishDataUtil, selectItemOptionUtil, 배송비표시, 무료배송안내 } from 'src/utils/shop-util';
import toast from 'react-hot-toast';
import DialogBuyNow from 'src/components/dialog/DialogBuyNow';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import Head from 'next/head';
import { isShopgoBrand } from 'src/utils/is-shopgo';
import { formatLang } from 'src/utils/format';
import QuantityStepper from 'src/components/elements/shop/QuantityStepper';
import { useLocales } from 'src/locales';
import ShippingLine from 'src/components/elements/shop/ShippingLine';
import DeliveryNotice from 'src/components/elements/shop/DeliveryNotice';
import BenefitNotice from 'src/components/elements/shop/BenefitNotice';
import OrderFormFields from 'src/components/elements/shop/OrderFormFields';
import ProductOptions from 'src/components/elements/shop/ProductOptions';
import ProductInfoRows from 'src/components/elements/shop/ProductInfoRows';

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
  // 프레임2 상세는 다국어를 전혀 거치지 않았다 — 언어를 바꿔도 상품명·설명·탭 이름이 한국어로 남았다.
  const { translate, currentLang } = useLocales();
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
  // 주문 추가 입력항목(행사일 등)의 값. 담기·바로구매 때 상품에 실어 보낸다.
  const [orderFormValues, setOrderFormValues] = useState({});

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
    // selectItemOptionUtil 이 새 객체를 돌려주므로 그대로 넣으면 리렌더된다.
    setSelectProductGroups(select_product_groups);
  }

  // 비회원도 장바구니 담기 허용(아래 handleBuyNow와 동일 정책).
  const handleAddCart = async () => {
    let result = await insertCartDataUtil({ ...product, seller_id: themeDnsData?.seller_id ?? 0 , order_form_values: orderFormValues }, selectProductGroups, themeCartData, onChangeCartData);
    if (result) {
      toast.success(translate("장바구니에 추가되었습니다."));
    }
  }

  const handleBuyNow = () => {
    // 비회원도 바로구매 허용(주문서에서 비회원 주문비밀번호로 진행)
    //
    // 특성(characters) 필수 검사를 여기서 없앴다. 특성은 이제 '보여주기 전용 상품정보'다.
    // 예전엔 이 화면에서만 특성이 필수 선택이라, 가맹점이 안내대로 '원산지 / 국내산' 을 넣으면
    // 손님이 '국내산' 버튼을 눌러야만 살 수 있었다(다른 프레임에서는 그냥 표였다).
    // 옵션·재고·입력항목 검사는 startBuyNow 안의 공용 검사가 전부 맡는다.
    setBuyOpen(true);
  }

  const handleWish = () => {
    if (user) {
      insertWishDataUtil(product, themeWishData, onChangeWishData);
    } else {
      toast.error(translate('로그인을 해주세요.'));
    }
  }

  const hasDiscount = product?.product_price > product?.product_sale_price && product?.product_sale_price > 0;
  const discountRate = hasDiscount ? Math.round((1 - product.product_sale_price / product.product_price) * 100) : 0;

  const ALL_TABS = [
    {
      value: 'description',
      label: translate('상품설명'),
      component: product?.product_description ?
        <StyledReactQuill
          className='none-scroll'
          value={formatLang(product, 'product_description', currentLang) ?? ''}
          readOnly={true}
          theme={"bubble"}
          bounds={'.app'}
        /> : null,
    },
    {
      value: 'reviews',
      label: `${translate('상품후기')} (${reviewContent?.total ?? 0})`,
      component: product ? <ProductDetailsReview product={{ ...product, order_form_values: orderFormValues }} reviewContent={reviewContent} onChangePage={(page) => setReviewPage(page)} reviewPage={reviewPage} reviewLoading={reviewLoading} /> : null,
    },
  ];
  // ShopGo 산하는 상품후기를 쓰지 않는다 — 후기 탭을 감춘다.
  // (별점과 작성 버튼은 ProductDetailsSummary·ProductDetailsReview 에서 함께 막는다)
  const TABS = ALL_TABS.filter((t) => t?.value !== 'reviews' || !isShopgoBrand(themeDnsData));

  return (
    <>
      <Head>
        <title>{formatLang(product, 'product_name', currentLang) ?? ''}</title>
      </Head>
      <DialogBuyNow
        buyOpen={buyOpen}
        setBuyOpen={setBuyOpen}
        product={{ ...product, order_form_values: orderFormValues }}
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
                      <ProductDetailsCarousel product={{ ...product, order_form_values: orderFormValues }} />
                    </Grid>
                    <Grid item xs={12} md={6} style={{ display: 'flex', flexDirection: 'column' }}>
                      {/*product?.product_code &&
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                          {product?.product_code}
                        </Typography>
                      */}
                      <Chip size="small" sx={{ alignSelf: 'flex-start', mb: 1, fontWeight: 700 }} label={translate(product?.product_sale_price > 0 ? getProductStatus(product?.status).text : translate('품절'))} color={getProductStatus(product?.status).color || 'default'} variant="soft" />
                      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                        {formatLang(product, 'product_name', currentLang)}
                      </Typography>
                      {product?.product_comment &&
                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                          {formatLang(product, 'product_comment', currentLang)}
                        </Typography>
                      }
                      {/* 상품 스펙 — 가맹점이 상품폼에 적어도 프레임1 말고는 어디에도 나오지 않던 값이다. */}
                      {formatLang(product, 'product_spec', currentLang) &&
                        <div style={{ whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '14px', color: '#666', background: '#f7f7f7', borderRadius: '6px', padding: '16px', margin: '0 0 1rem 0' }}>
                          {formatLang(product, 'product_spec', currentLang)}
                        </div>
                      }
<Divider sx={{ my: 1 }} />
                      <div style={{ margin: '1rem 0' }}>
                        {hasDiscount &&
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px', textDecoration: 'line-through', color: '#999' }}>{commarNumberWithUnit(product?.product_price)}</span>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#e74c3c' }}>{discountRate}%</span>
                          </div>
                        }
                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                          {commarNumberWithUnit(product?.product_sale_price || product?.product_price)}
                        </Typography>
                      </div>
                      <Divider sx={{ my: 1 }} />
                      {/* 배송비 한 줄 — 문구는 ShippingLine 한 곳에서만 만든다. */}
                      <ShippingLine item={product} tone={{ fontSize: 14, color: 'rgba(0,0,0,0.6)', gap: 8 }} />
                      {/* 배송 안내(가맹점별·SHOPGO 하위 전용) — 배송비 바로 아래. 둘은 한 묶음이라 떼어 놓지 않는다. */}
                      <DeliveryNotice tone={{ fontSize: 13 }} sx={{ mt: '6px' }} />
                      {/* 혜택 안내(본사 공통) — 배송비 바로 아래 */}
                      <BenefitNotice sx={{ mb: 1 }} tone={{ fontSize: 13 }} />
                      {/* 옵션 · 추가상품 · 조합형 — 프레임 6개 공용 컴포넌트.
                          예전엔 이 화면이 옵션 UI 를 따로 그렸고, 특성(characters)을
                          '눌러야만 구매되는 필수 버튼'으로 그렸다. 같은 특성을 프레임3·5·6 은
                          읽기 전용 정보표로 그려서, 같은 상품이 프레임에 따라 다르게 팔렸다.
                          이제 고르는 것은 옵션, 보여주는 것은 상품정보로 뜻이 하나다. */}
                      <ProductOptions product={product} selected={selectProductGroups} onSelect={onSelectOption} sx={{ mt: 1.5 }} />
                      {/* 손님 입력항목 — 상품에 걸린 것이 있을 때만 나타난다 */}
                      <OrderFormFields product={product} values={orderFormValues} onChange={setOrderFormValues} sx={{ mt: 2 }} />
                      <ProductInfoRows product={product} sx={{ mt: 2 }} />
                      {/* 수량 — 이 프레임엔 수량 UI 가 없어서 상세에서 담으면 늘 1개였다.
                          selectProductGroups.count 는 담기·바로구매 양쪽이 이미 읽고 있어
                          여기서 값만 바꿔주면 그대로 연동된다(insertCartDataUtil / startBuyNow). */}
                      <Stack direction="row" alignItems="center" spacing={2} sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{translate('수량')}</Typography>
                        <QuantityStepper
                          value={selectProductGroups?.count ?? 1}
                          onChange={(count) => setSelectProductGroups((prev) => ({ ...prev, count }))}
                        />
                      </Stack>
                      <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
                        <Stack direction="row" spacing={1}>
                          <Button variant="outlined" color="inherit" onClick={handleWish} sx={{ minWidth: '50px' }}>
                            <Icon icon={themeWishData?.map(itm => itm?.product_id).includes(product?.id) ? 'mdi:heart' : 'mdi:heart-outline'} fontSize="1.5rem" style={{ color: themeWishData?.map(itm => itm?.product_id).includes(product?.id) ? 'red' : '' }} />
                          </Button>
                          <Button variant="outlined" color="inherit" onClick={handleAddCart} disabled={getProductStatus(product?.status).color != 'info' || !(product?.product_sale_price > 0)} sx={{ flex: 1, fontWeight: 600 }}>
                            {translate('장바구니')}
                          </Button>
                          <Button variant="contained" color="inherit" onClick={handleBuyNow} disabled={getProductStatus(product?.status).color != 'info' || !(product?.product_sale_price > 0)} sx={{ flex: 1, fontWeight: 600 }}>
                            {translate('바로구매')}
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
