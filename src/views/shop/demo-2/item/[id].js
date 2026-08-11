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
import { insertCartDataUtil, insertWishDataUtil, selectItemOptionUtil } from 'src/utils/shop-util';
import toast from 'react-hot-toast';
import DialogBuyNow from 'src/components/dialog/DialogBuyNow';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import Head from 'next/head';
import { isShopgoBrand } from 'src/utils/is-shopgo';
import { formatLang, characterChoices } from 'src/utils/format';
import QuantityStepper from 'src/components/elements/shop/QuantityStepper';
import { useLocales } from 'src/locales';

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
    let result = await insertCartDataUtil({ ...product, seller_id: themeDnsData?.seller_id ?? 0 }, selectProductGroups, themeCartData, onChangeCartData);
    if (result) {
      toast.success("장바구니에 추가되었습니다.");
    }
  }

  // 고른 특성인지 판정 — 특성(characters)은 id 가 없어 이름으로 본다.
  const isCharacterPicked = (character) => selectProductGroups?.groups?.some(
    (g) => g?.character_name === character?.character_name && (g?.options?.length ?? 0) > 0
  );

  const handleBuyNow = () => {
    // 비회원도 바로구매 허용(주문서에서 비회원 주문비밀번호로 진행)
    //
    // 예전 조건은 `groups.length < characters.length` 였다. groups 에는 특성과 옵션그룹이 섞여 쌓이므로
    // 개수만 세면 '색상만 두 번 고른' 경우도 통과했고, 옵션그룹을 고르면 특성을 안 골라도 통과했다.
    // 개수 대신 특성 하나하나가 실제로 골라졌는지 본다. 옵션그룹은 startBuyNow 안의 공용 검사가 맡는다.
    const characters = product?.characters ?? [];
    if (characters.length > 0 && !characters.every(isCharacterPicked)) {
      toast.error('옵션을 선택해주세요.');
      return;
    }
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
      component: product ? <ProductDetailsReview product={product} reviewContent={reviewContent} onChangePage={(page) => setReviewPage(page)} reviewPage={reviewPage} reviewLoading={reviewLoading} /> : null,
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
                      <Typography variant="body2" sx={{ color: 'text.secondary', my: 1 }}>
                        {product?.delivery_fee > 0 ? `${translate('배송비')} ${commarNumberWithUnit(product?.delivery_fee)}` : translate('무료배송')}
                      </Typography>
                      {/* 옵션그룹(product_option_groups) 선택.
                          이 화면은 특성(characters)만 그리고 옵션그룹은 아예 그리지 않았다.
                          그래서 관리자에서 '옵션'을 등록한 상품은 프레임2 상세에 선택 UI 가 없었고,
                          고객은 옵션을 고를 방법이 없는 채로 장바구니·바로구매가 막혔다
                          (공용 검사 assertOptionsSelected 가 '그룹마다 하나 이상' 을 요구한다).
                          옵션 추가금액도 붙지 않아 실제보다 싸게 주문됐다.
                          프레임1(ProductDetailsSummary)·프레임4~11 은 원래 그리고 있었다 — 같은 규칙으로 맞춘다. */}
                      {product?.groups && product?.groups.map((group, gIdx) => (
                        <div key={group?.id ?? gIdx} style={{ marginTop: '0.5rem' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{formatLang(group, 'group_name')}</Typography>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {(group?.options ?? []).map((option, oIdx) => (
                              <Button
                                key={option?.id ?? oIdx}
                                variant={selectProductGroups?.groups?.find(g =>
                                  Number(g?.id) === Number(group?.id)
                                  && g?.options?.some(o => Number(o?.id) === Number(option?.id))
                                ) ? 'contained' : 'outlined'}
                                size="small"
                                color="inherit"
                                onClick={() => onSelectOption(group, option)}
                                sx={{ minWidth: '60px', fontSize: '13px' }}
                              >
                                {formatLang(option, 'option_name')}{option?.option_price > 0 ? ` (+${commarNumberWithUnit(option?.option_price)})` : ''}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                      {product?.characters && product?.characters.map((character, idx) => (
                        <div key={idx} style={{ marginTop: '0.5rem' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{formatLang(character, 'character_name', currentLang)}</Typography>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {/* 보이는 건 번역, 고르면 저장되는 건 원문(value). 특성 값은 주문에 그대로
                                박히므로 번역본을 저장하면 가맹점 주문서가 외국어가 된다. */}
                            {characterChoices(character, currentLang).map(({ value: option, label }, optIdx) => (
                              <Button
                                key={optIdx}
                                // 저장 형태에 맞춰 판정한다. selectItemOptionUtil 은 'option' 키를 만들지 않고
                                // options: [{ value: '블랙' }] 로 넣는다 — 예전 판정식(g?.option === option)은
                                // 늘 undefined 라 무엇을 골라도 버튼이 미선택(outlined) 그대로였다.
                                variant={selectProductGroups?.groups?.find(g =>
                                  g?.character_name === character?.character_name
                                  && (g?.options?.[0]?.value === option || g?.options?.[0]?.option_name === option)
                                ) ? 'contained' : 'outlined'}
                                size="small"
                                color="inherit"
                                onClick={() => onSelectOption(character, option)}
                                sx={{ minWidth: '60px', fontSize: '13px' }}
                              >
                                {label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
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
