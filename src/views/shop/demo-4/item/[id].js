import styled from 'styled-components'
import { Box, Tab, Tabs, Card, Grid, Divider, Typography, Button, Radio, FormControlLabel, Dialog, DialogTitle, DialogContent, MenuItem, FormControl, DialogActions, Stack, InputLabel, Select, TextField } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { ProductDetailsCarousel, ProductDetailsReview } from 'src/views/@dashboard/e-commerce/details';
import { useEffect, useState } from 'react';
import ProductAddons from 'src/components/elements/shop/ProductAddons';
import { requiredGroups } from 'src/data/product-options';
import { SkeletonProductDetails } from 'src/components/skeleton';
import dynamic from 'next/dynamic'
import { apiManager, apiShop } from 'src/utils/api';
import { styled as muiStyle } from '@mui/material'
import Head from 'next/head';
import { Row } from 'src/components/elements/styled-components';
import { commarNumber, isPurchasable, commarNumberWithUnit } from 'src/utils/function';
import { Icon } from '@iconify/react';
import { insertCartDataUtil, insertWishDataUtil, selectItemOptionUtil, 배송비표시, 무료배송안내 } from 'src/utils/shop-util';
import toast from 'react-hot-toast';
import DialogBuyNow from 'src/components/dialog/DialogBuyNow';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useModal } from 'src/components/dialog/ModalProvider';
import { isShopgoBrand } from 'src/utils/is-shopgo';
import { formatLang, characterChoices } from 'src/utils/format';
import { useLocales } from 'src/locales';
import ShippingLine from 'src/components/elements/shop/ShippingLine';
import DeliveryNotice from 'src/components/elements/shop/DeliveryNotice';
import QuantityStepper from 'src/components/elements/shop/QuantityStepper';
import { 적립예정 } from 'src/data/point-policy';
import { 찜기능사용 } from 'src/data/wish';

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
        <Row style={{ columnGap: '0.25rem', marginTop: '1rem', marginBottom: '1rem', fontSize: '14px' }}>
          <Typography style={{ width: '6rem', }}>{key_name}</Typography>
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
  // 이 화면에는 번역이 아예 없었다(formatLang 만 쓰고 UI 문구는 한국어 그대로였다).
  const { translate, currentLang } = useLocales();
  const { user, isInitialized } = useAuthContext();
  const [loading, setLoading] = useState(true);

  const [currentTab, setCurrentTab] = useState('description');
  const [product, setProduct] = useState({});
  const [reviewPage, setReviewPage] = useState(1);
  const [buyOpen, setBuyOpen] = useState(false);
  const [characterSelect, setCharacterSelect] = useState(false);
  const [unipassPopup, setUnipassPopup] = useState(false);
  const [unipass, setUnipass] = useState();
  const [reviewContent, setReviewContent] = useState({});
  const [reviewLoading, setReviewLoading] = useState(false);
  const [selectProductGroups, setSelectProductGroups] = useState({
    count: 1,
    groups: [],
  });

  const [buyOrCart, setBuyOrCart] = useState();

  useEffect(() => {
    // isInitialized 를 함께 본다 — 첫 렌더의 user=null 을 비로그인으로 오판하면
    // 로그인한 고객도 폐쇄몰에서 새로고침할 때마다 로그인 화면으로 튕긴다.
    if (themeDnsData?.is_closure == 1 && isInitialized && !user) {
      router.push('/shop/auth/login')
    }
  }, [themeDnsData, isInitialized, user])

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

    if (themeDnsData?.id == 74) {
      let data = await apiShop('product', 'get', {
        id: router.query?.id,
        seller_id: themeDnsData?.seller_id ?? 0
      });
      if (!data) {
        setLoading(false);
        return;
      }

      let sub_image = data?.sub_images;
      let description_image = data?.sub_images;

      data['sub_images'] = (sub_image ?? []).map((img) => img?.product_sub_img).filter((img) => img !== null && img !== undefined)
      data['description_images'] = (description_image ?? []).map((img) => img?.product_description_img).filter((img) => img !== null && img !== undefined)
      data['images'] = data['sub_images'];
      setProduct(data);
      setLoading(false);
    }
    else {
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
      label: 'Detail',
      component: themeDnsData?.id != 74 ? product?.product_description ?
        <StyledReactQuill
          className='none-scroll'
          value={`
    ${formatLang(product, 'product_description') ?? ''}
    ${themeDnsData?.basic_info}
  `}
          readOnly={true}
          theme={"bubble"}
          bounds={'.app'}
        /> : null
        :
        <>
          <div>
            {product?.description_images?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt="Product Image"
                style={{ maxWidth: '100%', height: 'auto', margin: '0 auto' }}
              />
            ))}
          </div>
        </>,
    },
    /*{
      value: 'basic_info',
      label: '기본정보',
      component: product ?
        <BasicInfo /> : null,
    },
    {
      value: 'item_faq',
      label: 'Q&A',
      component: product ? //<></> : null,
        <ProductFaq /> : null,
    },*/
    {
      value: 'reviews',
      label: `상품후기 (${reviewContent?.total ?? 0})`,
      component: product ? <ProductDetailsReview product={product} reviewContent={reviewContent} onChangePage={onChangeReviewPage} reviewPage={reviewPage} reviewLoading={reviewLoading} /> : null,
    },
  ];
  // ShopGo 산하는 상품후기를 쓰지 않는다 — 후기 탭을 감춘다.
  // (별점과 작성 버튼은 ProductDetailsSummary·ProductDetailsReview 에서 함께 막는다)
  const TABS = ALL_TABS.filter((t) => t?.value !== 'reviews' || !isShopgoBrand(themeDnsData));
  // 비회원도 장바구니 담기 허용(다른 데모와 동일 정책).
  const handleAddCart = async () => {
    let result = await insertCartDataUtil({ ...product, seller_id: router.query?.seller_id ?? 0 }, selectProductGroups, themeCartData, onChangeCartData);
    if (result) {
      toast.success(translate("장바구니에 성공적으로 추가되었습니다."))
    }
  };
  const onSelectOption = (group, option, is_option_multiple) => {
    let select_product_groups = selectItemOptionUtil(group, option, selectProductGroups, is_option_multiple);
    setSelectProductGroups(select_product_groups);
  }

  // 옵션 선택이 끝났는지 — 특성(이름으로 매칭, id 없음)과 옵션그룹(id 로 매칭)을 모두 본다.
  const isAllOptionPicked = () => {
    const picked = selectProductGroups?.groups ?? [];
    const characters_ok = (product?.characters ?? []).every((c) => picked.some(
      (g) => g?.character_name === c?.character_name && (g?.options?.length ?? 0) > 0
    ));
    const groups_ok = (product?.groups ?? []).every((grp) => picked.some(
      (g) => Number(g?.id) === Number(grp?.id) && (g?.options?.length ?? 0) > 0
    ));
    return characters_ok && groups_ok;
  }

  // 옵션이든 특성이든 하나라도 있으면 선택 다이얼로그를 먼저 띄운다.
  // 예전엔 characters 만 봐서, 옵션그룹만 있는 상품은 다이얼로그 없이 곧장 결제로 넘어갔다가
  // 공용 검사에 걸려 '옵션을 선택해 주세요' 만 반복됐다(고를 화면이 없었다).
  const needOptionSelect = () => (product?.characters?.length > 0) || (product?.groups?.length > 0);

  async function verifyUnipass(code) {

    let result = await apiManager('util/unipass', 'create', { code: code })
    if (result) {
      if (result?.message == '정상 : ') {
        toast.success('개인통관고유부호가 확인되었습니다.');
        setUnipassPopup(false);
        setBuyOpen(true);
      } else {
        toast.error('회원정보와 일치하지 않는 번호입니다. 다시 확인 바랍니다.');
      }
    } else {
      return;
    }
  }

  return (
    <>
      <Dialog
        open={characterSelect}
        onClose={() => {
          setCharacterSelect(false);
          router.reload()
        }}
        PaperProps={{
          style: {
            maxWidth: '600px', width: '90%'
          }
        }}
      >
        <DialogTitle>{translate('옵션선택')}</DialogTitle>
        <DialogContent>
          {/* 옵션그룹(product_option_groups) 선택.
              이 다이얼로그는 특성(characters)만 그렸다. 그래서 관리자에서 '옵션'을 등록한 상품은
              프레임3에서 고를 방법이 없었고, 공용 검사(assertOptionsSelected)가 '그룹마다 하나 이상'을
              요구하므로 구매·장바구니가 통째로 막혔다. 옵션 추가금액도 붙지 않았다. */}
          {requiredGroups(product).map((group, gIdx) => (
            <Stack key={group?.id ?? gIdx} direction="row" justifyContent="space-between">
              <FormControl sx={{ width: '100%', marginTop: '1rem' }}>
                <InputLabel>{formatLang(group, 'group_name')}</InputLabel>
                <Select
                  label={formatLang(group, 'group_name')}
                  sx={{ width: '100%' }}
                  placeholder={formatLang(group, 'group_name')}
                  onChange={(e) => {
                    const option = (group?.options ?? [])[Number(e.target.value)];
                    if (option) onSelectOption(group, option);
                  }}
                >
                  {(group?.options ?? []).map((option, oIdx) => (
                    <MenuItem key={option?.id ?? oIdx} value={oIdx}>
                      {formatLang(option, 'option_name')}{option?.option_price > 0 ? ` (+${commarNumber(option?.option_price)})` : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          ))}
          {/* 추가상품 — 안 골라도 살 수 있다. 프레임 전체가 같은 컴포넌트를 쓴다. */}
          <ProductAddons product={product} selected={selectProductGroups} onSelect={onSelectOption} style={{ marginTop: '1rem' }} />
          {product?.characters && product?.characters.map((character) => (
            <>
              <Stack direction="row" justifyContent="space-between">
                <FormControl sx={{ width: '100%', marginTop: '1rem' }}>
                  <InputLabel>{formatLang(character, 'character_name')}</InputLabel>
                  <Select
                    label={formatLang(character, 'character_name')}
                    sx={{
                      width: '100%',
                    }}
                    placeholder={formatLang(character, 'character_name')}
                    onChange={(e) => {
                      onSelectOption(character, e.target.value)
                    }}
                  >
                    {/* 보이는 건 번역, 고르면 저장되는 건 원문(value). 특성 값은 주문에 그대로
                        박히므로 번역본을 저장하면 가맹점 주문서가 외국어가 된다. */}
                    {characterChoices(character).map(({ value: data, label }, idx) => (
                      <MenuItem
                        key={idx}
                        value={data}
                      >{label} {/*data.option_price > 0 ? '+' + commarNumber(data.option_price) : ''*/}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </>
          ))}
        </DialogContent>
        <DialogActions>
          <Button
            variant='contained'
            onClick={() => {
              // 예전엔 `characters.length > groups.length` 로 개수만 셌다. groups 에는 특성과 옵션그룹이
              // 섞여 쌓이므로 옵션그룹을 고르면 특성을 안 골라도 통과했고, 같은 특성을 두 번 고른 경우도
              // 통과했다(특성은 id 가 없어 예전 selectItemOptionUtil 이 매번 새 항목을 밀어 넣었다).
              // 개수 대신 항목 하나하나가 실제로 골라졌는지 본다.
              if (!isAllOptionPicked()) {
                toast.error('옵션선택을 완료해주세요.')
              } else {
                if (buyOrCart == 'buy') {
                  setCharacterSelect(false);
                  setBuyOpen(true);
                } else {
                  handleAddCart();
                  setCharacterSelect(false);
                }
              }
            }} color="inherit">{translate('선택완료')}</Button>
          <Button onClick={() => {
            setCharacterSelect(false);
            router.reload()
          }} color="inherit">{translate('나가기')}</Button>
        </DialogActions>
      </Dialog>

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

                    <Grid item xs={12} md={6} lg={6} style={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

                      <div style={{}}>
                        {product?.brand_name &&
                          <>
                            <div style={{ fontSize: '30px', fontFamily: 'Playfair Display', fontWeight: 'bold', borderTop: '1px solid #ccc', padding: '1rem 0' }}>
                              {product?.brand_name[0]?.category_en_name ?? ''}
                            </div>
                          </>
                        }
                        <ItemName style={{ whiteSpace: 'wrap', fontFamily: 'Noto Sans KR', fontSize: '25px' }}>{formatLang(product, 'product_name')}</ItemName>
                        {/* 상품 스펙 — 가맹점이 상품폼에 적어도 프레임1 말고는 어디에도 나오지 않던 값이다. */}
                        {formatLang(product, 'product_spec') &&
                          <div style={{ whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '14px', color: '#666', background: '#f7f7f7', borderRadius: '6px', padding: '16px', margin: '0 0 1rem 0' }}>
                            {formatLang(product, 'product_spec')}
                          </div>
                        }
                        {/*product?.product_code &&
                          <>
                            <ItemCharacter key_name={'상품코드'} value={product?.product_code} />
                          </>*/}
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
                        {themeDnsData?.id != 74 && product?.characters && product?.characters.map((character) => (
                          <>
                            {/* 상세 정보표는 읽기 전용이라 값도 번역본을 그대로 보여줘도 된다
                                (주문에 저장되는 건 위 Select 에서 고른 원문이다) */}
                            <ItemCharacter key_name={formatLang(character, 'character_name')} value={formatLang(character, 'character_value')} />
                          </>
                        ))}
                        {/*
                          product?.status == 0 ?
                            <>
                              {
                            {commarNumber(product?.product_price) != commarNumber(product?.product_sale_price) ?
                              <>
                                <ItemCharacter
                                  key_name={'판매가'}
                                  value={<>
                                    {commarNumberWithUnit(product?.product_sale_price)}
                                    <div style={{ textDecoration: 'line-through', color: '#999999' }}>
                                      {commarNumberWithUnit(product?.product_price)}
                                    </div>
                                  </>
                                  }
                                />
                                <ItemCharacter key_name={'할인율'} value={`${parseFloat((parseInt(product?.product_price - product?.product_sale_price) / parseInt(product?.product_price) * 100).toFixed(2))}%`} />
                              </>
                              :
                            }
                              <>
                                <ItemCharacter
                                  key_name={'판매가'}
                                  value={<>
                                    {commarNumberWithUnit(parseInt(product?.product_sale_price))}
                                  </>
                                  }
                                />
                              </>

                            </>
                            :
                            product?.status == 1 ?
                              <>
                                <ItemCharacter
                                  key_name={'판매가'}
                                  value={<div>거래 진행중인 상품입니다</div>}
                                />
                              </>
                              :
                              product?.status == 2 || product?.status == 3 || product?.status == 4 || product?.status == 6 ?
                                <>
                                  <ItemCharacter
                                    key_name={'판매가'}
                                    value={<div style={{ color: 'red' }}>SOLD OUT</div>}
                                  />
                                </>
                                :
                                product?.status == 7 ?
                                  <>
                                    <ItemCharacter
                                      key_name={'판매가'}
                                      value={<div>매장문의</div>}
                                    />
                                  </>
                                  :
                                  ''
                        */}

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
                              {commarNumberWithUnit(product?.product_price)}
                            </div>
                            <div style={{ fontSize: '22px', display: 'flex' }}>
                              <div style={{ marginRight: '1rem' }}>
                                {parseFloat((parseInt(product?.product_price - product?.product_sale_price) / parseInt(product?.product_price) * 100).toFixed(2))}%
                              </div>
                              {commarNumberWithUnit(product?.product_sale_price)}
                            </div>
                          </>
                          :
                          <>
                            <div style={{ fontSize: '22px' }}>
                              {product?.product_sale_price != 0 ? <div>{commarNumberWithUnit(product?.product_sale_price)}</div> : <div>SOLD OUT</div>}
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
                          /*
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
                          */
                        })}
                      </div>
                      <div style={{ width: '100%' }}>
                        <div style={{ borderTop: '1px solid #ccc', width: '100%', }} onClick={() => { }}>
                          <ItemCharacter
                            key_name={'판매가'}
                            value={<>
                              {commarNumberWithUnit(parseInt(product?.product_sale_price))}
                            </>
                            }
                          />
                          {/* 적립 예정 안내.
                              예전엔 브랜드 74 에만 뜨고, 곱하는 값도 seller_point(셀러 전용 값)였다.
                              일반 가맹점은 그 값이 없어 NaN 이 되거나 아예 안 보였다.
                              적립률(setting_obj.point_rate)로 계산하고, 적립을 쓰는 몰이면 보여준다. */}
                          {적립예정({ dns: themeDnsData, 결제금액: product?.product_sale_price }) > 0 &&
                            <div style={{ textAlign: 'right', color: 'gray' }}>
                              구매시 {commarNumber(적립예정({ dns: themeDnsData, 결제금액: product?.product_sale_price }))}P 적립
                            </div>}
                          {/* 배송비를 상세에 표시한다. 이 프레임에는 배송비 표기가 없어서
                              고객이 장바구니·주문서에 가서야 배송비를 알았다
                              (상세에서 본 금액과 결제 직전 금액이 달라 보인다). */}
                          {/* 이 프레임은 표 형태라 라벨('배송비')을 ItemCharacter 가 그린다.
                              값 쪽 문구만 ShippingLine 에서 가져온다 — 안쪽 여백은 표에 맞춰 0 으로. */}
                          <ItemCharacter
                            key_name={'배송비'}
                            value={<ShippingLine item={product} showLabel={false} />}
                          />
                        </div>
                        {/* 배송 안내(가맹점별·SHOPGO 하위 전용) — 배송비 바로 아래. 둘은 한 묶음이라 떼어 놓지 않는다. */}
                        {/* 이 프레임은 왼쪽 라벨 칸을 직접 그리므로 들여쓰기는 프레임이 맡는다. */}
                        <DeliveryNotice indent={0} />
                        {/* '10-14일 내 도착 예정(검수 후 배송)' · '배송 전 검수' 는
                            해외직구 브랜드(74)의 운영 정책 문구다. 프레임3 으로 팔리면서
                            국내 배송만 하는 가맹점 상품에도 그대로 붙어 고객에게 틀린 배송기간을
                            안내하고 있었다. 해당 브랜드에서만 노출한다. */}
                        {themeDnsData?.id == 74 && <>
                          <div style={{ borderTop: '1px solid #ccc', width: '100%', padding: '1rem 0' }}>
                            <ItemCharacter
                              key_name={'배송기간'}
                              value={<div style={{}}>{translate('10-14일 내 도착 예정(검수 후 배송)')}</div>}
                            />
                          </div>
                          <div style={{ width: '100%', padding: '1rem 0' }}>
                            <div style={{ color: 'gray' }}>{translate('모든 상품은 배송 전 검수를 거칩니다')}</div>
                          </div>
                        </>}
                        {/* 수량 — 이 프레임엔 수량 UI 가 없어서 상세에서 담으면 늘 1개였다.
                            selectProductGroups.count 는 담기·바로구매 양쪽이 이미 읽고 있어
                            여기서 값만 바꿔주면 그대로 연동된다(insertCartDataUtil / DialogBuyNow). */}
                        <Row style={{ alignItems: 'center', columnGap: '1rem', margin: '1rem 0' }}>
                          <div style={{ minWidth: '4rem' }}>{translate('수량')}</div>
                          <QuantityStepper
                            value={selectProductGroups?.count ?? 1}
                            onChange={(count) => setSelectProductGroups((prev) => ({ ...prev, count }))}
                          />
                        </Row>
                        <Button
                          // '새상품(3)'도 파는 상태다. status != 0 으로 막으면 새상품으로 등록한 상품이
                          // 구매·장바구니 둘 다 비활성이 되어 아예 팔 수 없다.
                          // 판정은 공용 헬퍼(getProductStatus 의 color=='info')로 통일한다.
                          disabled={!isPurchasable(product?.status) || !(product?.product_sale_price > 0)}
                          sx={{
                            width: '100%',
                            //marginTop: '1rem',
                            height: '60px',
                            backgroundColor: 'black',
                            borderRadius: '0',
                            fontWeight: 'bold',
                            fontSize: '18px',
                            fontFamily: 'Playfair Display',
                            color: 'white',
                            border: '1px solid #999999',
                            '&:hover': {
                              backgroundColor: 'black',
                            }
                          }}
                          //variant='contained'
                          /*startIcon={<>
                            <Icon icon={'mdi:check-bold'} />
                          </>}*/
                          onClick={() => {
                            // 해외직구 전용 로직(로그인 강제 + 개인통관고유부호 검증)을 걷어내고
                            // 다른 데모와 동일하게 비회원 바로구매를 허용한다.
                            // 원래 shop:4는 unipass 필수 해외직구 데모였으나, 지금은 일반 가맹점이 쓰는
                            // 프레임3이라 그 제약이 그대로 남아 비회원 구매가 막혀 있었다.
                            /* 되살릴 경우 아래 블록을 복구할 것 (브랜드 74 = 해외직구 본사)
                            if (themeDnsData?.id == 74 && !themeDnsData?.seller_id) {
                              toast.error('본사페이지에서는 결제가 진행되지 않습니다.')
                              return;
                            }
                            if (user) {
                              if (user?.unipass) { ... } else {
                                toast.error('개인통관고유부호가 존재하지 않습니다. 관리자에 문의하세요.')
                              }
                            } else {
                              toast.error('로그인을 해주세요.')
                            }
                            */
                            if (needOptionSelect()) {
                              setCharacterSelect(true);
                              setBuyOrCart('buy');
                            } else {
                              setBuyOpen(true);
                            }
                          }}
                        >{translate('구매하기')}</Button>
                        <Row style={{ columnGap: '0.5rem', marginTop: '0.5rem', alignItems: 'center' }}>
                          <Button
                            // '새상품(3)'도 파는 상태다. status != 0 으로 막으면 새상품으로 등록한 상품이
                          // 구매·장바구니 둘 다 비활성이 되어 아예 팔 수 없다.
                          // 판정은 공용 헬퍼(getProductStatus 의 color=='info')로 통일한다.
                          disabled={!isPurchasable(product?.status) || !(product?.product_sale_price > 0)}
                            sx={{
                              width: '90%',
                              height: '60px',
                              //backgroundColor: 'white',
                              borderRadius: '0',
                              fontWeight: 'bold',
                              fontSize: '18px',
                              fontFamily: 'Playfair Display',
                              color: '#999999',
                              border: '1px solid #999999',
                              '&:hover': {
                                backgroundColor: 'transparent',
                              }
                            }}
                            //variant='outlined'
                            /*startIcon={<>
                              <Icon icon={'mdi:cart'} />
                            </>}*/
                            onClick={() => {
                              if (needOptionSelect()) {
                                setCharacterSelect(true);
                                setBuyOrCart('cart');
                              } else {
                                handleAddCart()
                              }
                            }}
                          >{translate('장바구니')}</Button>
                          {/* 찜 기능은 쓰지 않는다(src/data/wish.js) — 프레임마다 있고 없고가 갈려 있었다 */}
                          {찜기능사용 &&
                            <Icon
                              icon={themeWishData.map(wish => { return wish?.product_id }).includes(product?.id) ? 'ph:heart-fill' : 'ph:heart-light'}
                              style={{
                                width: '30px',
                                height: '30px',
                                color: `${themeDnsData?.theme_css.main_color}`,
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
                                      title: translate('상품이 위시리스트에 담겼습니다\n바로 확인 하시겠습니까?')
                                    })
                                  }
                                } else {
                                  toast.error(translate('로그인을 해주세요.'))
                                }
                              }}
                            />}
                        </Row>
                      </div>
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
                          if (tab.value !== 'basic_info' && tab.value !== 'item_faq') {
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
                            {/*
                            commarNumber(product?.product_price) != commarNumber(product?.product_sale_price) && currentTab === 'description' ?
                              <>
                                <div style={{ color: `${themeDnsData?.theme_css?.main_color}`, fontWeight: 'bold' }}>
                                  {commarNumber(product?.product_price)} 원에서 {commarNumber(product?.product_sale_price)} 원으로 가격인하를 하였습니다.
                                </div>
                              </>
                              :
                              <>
                              </>
                              */
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