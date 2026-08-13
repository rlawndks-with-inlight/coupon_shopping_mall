import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { commarNumber, commarNumberWithUnit, isPurchasable, getProductStatus } from 'src/utils/function';
import { formatLang } from 'src/utils/format';
import { apiShop } from 'src/utils/api';
import { insertCartDataUtil, startBuyNow, selectItemOptionUtil } from 'src/utils/shop-util';
import QuantityStepper from 'src/components/elements/shop/QuantityStepper';
import ProductThumbs, { buildProductImages } from 'src/components/elements/shop/ProductThumbs';
import toast from 'react-hot-toast';
import BenefitNotice from 'src/components/elements/shop/BenefitNotice';
import OrderFormFields from 'src/components/elements/shop/OrderFormFields';

/* 상품 상세 - 데모 9: 파스텔 드림 */

const BG = '#fff5f0';
const PINK = '#ffc4c4';
const CORAL = '#ff8a80';
const TEXT = '#2c2c2c';

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const Wrapper = styled.div`
  background: ${BG};
  color: ${TEXT};
  min-height: 100vh;
`
const Hero = styled.section`
  padding: 4rem 2rem;
  background: linear-gradient(180deg, ${BG} 0%, ${PINK}30 100%);
  @media (max-width: 840px) {
    padding: 2rem 1.25rem;
  }
`
const HeroInner = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1100px;
  margin: 0 auto;
  gap: 3rem;
  align-items: center;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`
const ImageWrap = styled.div`
  width: 100%;
  aspect-ratio: 1/1;
  background: #fff;
  border-radius: 60% 40% 50% 50% / 50% 50% 40% 60%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 30px 80px rgba(255, 138, 128, 0.2);
  overflow: hidden;
  max-width: 500px;
  margin: 0 auto;
`
const HeroImage = styled(LazyLoadImage)`
  width: 320px;
  height: 320px;
  object-fit: contain;
  @media (max-width: 840px) {
    width: 240px;
    height: 240px;
  }
`
const Info = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`
const StickerRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`
const Sticker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 6px 14px;
  background: ${p => p.$bg || '#fff'};
  color: ${p => p.$color || TEXT};
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 4px 16px rgba(0,0,0,0.06);
`
const ProductName = styled.h1`
  font-size: 42px;
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 1.1;
  margin: 0;
  @media (max-width: 840px) {
    font-size: 30px;
  }
`
const Description = styled.div`
  font-size: 15px;
  line-height: 1.7;
  opacity: 0.7;
`
const PriceWrap = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 14px 28px;
  background: #fff;
  border-radius: 50px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
  align-self: flex-start;
`
const Price = styled.span`
  font-size: 30px;
  font-weight: 900;
  color: ${CORAL};
`
const OrigPrice = styled.span`
  font-size: 14px;
  text-decoration: line-through;
  opacity: 0.4;
`
const OptionWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`
const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`
const OptionLabel = styled.label`
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  opacity: 0.6;
  padding-left: 0.75rem;
`
const OptionSelect = styled.select`
  width: 100%;
  padding: 13px 22px;
  border-radius: 50px;
  border: 2px solid ${PINK};
  background: #fff;
  color: ${TEXT};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  appearance: none;
  outline: none;
  transition: border-color 0.3s;
  box-shadow: 0 4px 16px rgba(0,0,0,0.04);
  &:focus {
    border-color: ${CORAL};
  }
`
const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
  @media (max-width: 480px) {
    flex-direction: column;
  }
`
const Btn = styled.button`
  flex: 1;
  padding: 16px 28px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  border: ${p => p.$primary ? 'none' : `2px solid ${CORAL}`};
  background: ${p => p.$primary ? `linear-gradient(135deg, ${CORAL} 0%, #ff6b6b 100%)` : 'transparent'};
  color: ${p => p.$primary ? '#fff' : CORAL};
  transition: all 0.3s;
  box-shadow: ${p => p.$primary ? '0 8px 20px rgba(255, 138, 128, 0.4)' : 'none'};
  &:hover {
    transform: translateY(-2px);
  }
`
const DetailSection = styled.section`
  padding: 5rem 2rem;
  background: #fff;
  @media (max-width: 840px) {
    padding: 3rem 1.25rem;
  }
`
const DetailTitle = styled.h2`
  font-size: 36px;
  font-weight: 900;
  text-align: center;
  letter-spacing: -1px;
  margin: 0 0 3rem 0;
  @media (max-width: 840px) {
    font-size: 26px;
  }
`
const DetailContent = styled.div`
  max-width: 720px;
  margin: 0 auto;
  font-size: 15px;
  line-height: 1.9;
  img { max-width: 100%; height: auto; border-radius: 16px; }
`

const Demo9 = () => {
  const router = useRouter();
  const { currentLang, translate } = useLocales();
  const { themeDnsData, themeCartData, onChangeCartData } = useSettingsContext();
  const { user } = useAuthContext();
  const [item, setItem] = useState(null);
  const [selectProductGroups, setSelectProductGroups] = useState({ count: 1, groups: [] });
  // 주문 추가 입력항목(행사일 등)의 값. 담기·바로구매 때 상품에 실어 보낸다.
  const [orderFormValues, setOrderFormValues] = useState({});
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    if (router.query?.id) loadProduct();
  }, [router.query?.id]);

  const loadProduct = async () => {
    const product = await apiShop('product', 'get', { id: router.query?.id });
    if (product) { setItem(product); setImgIdx(0); }
  };

  const handleAddCart = async () => {
    // 비회원도 담기 허용(카트→주문서에서 비회원 주문비밀번호로 진행)
    const result = await insertCartDataUtil(
      { ...item, seller_id: router.query?.seller_id ?? 0 },
      selectProductGroups, themeCartData, onChangeCartData
    );
    if (result) toast.success(translate('장바구니에 추가되었습니다 💕'));
  };

  const onSelectOption = (group, option) => {
    const next = selectItemOptionUtil(group, option, selectProductGroups);
    setSelectProductGroups({ ...next });
  };

  if (!item) return <Wrapper><DetailSection>Loading...</DetailSection></Wrapper>;

  // 대표이미지 + 서브이미지.
  // 예전엔 대표 한 장만 그려서, 관리자에서 올린 서브이미지가 고객 화면에 아예 안 나왔다.
  const images = buildProductImages(item, fixImgUrl);
  const img = images[Math.min(imgIdx, Math.max(0, images.length - 1))] ?? '';
  const name = formatLang(item, 'product_name', currentLang);
  const comment = formatLang(item, 'product_comment');
  // 살 수 있는 상태인지(판매중·새상품만 구매 가능). 상태맵은 프레임1과 같은 것을 쓴다.
  const purchasable = isPurchasable(item?.status);
  const productStatusText = getProductStatus(item?.status)?.text;
  const sale = item?.product_sale_price || item?.product_price || 0;
  const orig = item?.product_price || 0;
  const hasSale = orig > sale && sale > 0;
  const disc = hasSale ? Math.round((orig - sale) * 100 / orig) : 0;

  return (
    <Wrapper>
      <Hero>
        <HeroInner>
          {/* ImageWrap 은 overflow:hidden 인 블롭 모양이라 썸네일을 안에 넣으면 잘린다 — 밖에 둔다.
              HeroInner 는 2열 그리드라 이미지 칸 하나로 묶어야 오른쪽 정보 칸을 밀지 않는다. */}
          <div>
            <ImageWrap>
              <HeroImage src={img} effect="blur" />
            </ImageWrap>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ProductThumbs images={images} activeIndex={imgIdx} onSelect={setImgIdx} />
            </div>
          </div>
          <Info>
            <StickerRow>
              <Sticker $bg={CORAL} $color="#fff">✨ NEW</Sticker>
              {hasSale && <Sticker $bg="#fff" $color={CORAL}>🔥 {disc}%</Sticker>}
              <Sticker $bg="#fff" $color={TEXT}>💝 {themeDnsData?.name || 'Brand'}</Sticker>
            </StickerRow>
            <ProductName>{name}</ProductName>
            {comment && <Description>{comment}</Description>}
            <PriceWrap>
              <Price>{commarNumberWithUnit(sale)}</Price>
              {hasSale && <OrigPrice>{commarNumberWithUnit(orig)}</OrigPrice>}
            </PriceWrap>
            {/* 배송비를 상세에 표시한다. 예전엔 이 프레임들에 배송비 표기가 없어서
                고객이 장바구니·주문서에 가서야 배송비를 알았다(주문 직전 금액이 달라 보인다). */}
            {item?.delivery_fee > 0
                ? <div style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>{translate('배송비')} {commarNumberWithUnit(item?.delivery_fee)}</div>
                : <div style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>{translate('무료배송')}</div>}
            {/* 혜택 안내(본사 공통) */}
            <BenefitNotice sx={{ mt: '10px' }} tone={{ fontSize: 13, labelColor: '#a08b93', textColor: '#4a3f43' }} />
              {/* 주문 추가 입력항목 — 서식이 걸린 몰에서만 나타난다 */}
              <OrderFormFields values={orderFormValues} onChange={setOrderFormValues} sx={{ mt: 2 }} />
            {item?.groups?.length > 0 && (
              <OptionWrap>
                {item.groups.map((group) => (
                  <OptionGroup key={group?.id ?? group?.group_name}>
                    <OptionLabel>{formatLang(group, 'group_name')}</OptionLabel>
                    <OptionSelect
                      defaultValue=""
                      onChange={(e) => {
                        const idx = e.target.value;
                        if (idx === '') return;
                        onSelectOption(group, group?.options?.[idx]);
                      }}
                    >
                      <option value="" disabled>{translate('선택해주세요')}</option>
                      {(group?.options ?? []).map((option, idx) => (
                        <option key={option?.id ?? option?.option_name ?? idx} value={idx}>
                          {formatLang(option, 'option_name')}{option?.option_price > 0 ? ` (+${commarNumberWithUnit(option.option_price)})` : ''}
                        </option>
                      ))}
                    </OptionSelect>
                  </OptionGroup>
                ))}
              </OptionWrap>
            )}
            {/* 수량 — 이 프레임엔 수량 UI 가 없어서 늘 1개만 살 수 있었다 */}
            <OptionWrap>
              <OptionGroup>
                <OptionLabel>{translate('수량')}</OptionLabel>
                <div>
                  <QuantityStepper
                    value={selectProductGroups?.count ?? 1}
                    onChange={(count) => setSelectProductGroups((prev) => ({ ...prev, count }))}
                  />
                </div>
              </OptionGroup>
            </OptionWrap>
            {/* 살 수 없는 상태(품절·중단됨)를 상세에서 바로 알린다 — 예전엔 표시도 없고
                버튼도 살아 있어, 누르고 나서야 살 수 없다는 걸 알았다. */}
            {!purchasable && productStatusText &&
              <div style={{ padding: '10px 14px', borderRadius: '6px', background: '#f5f5f5', color: '#666', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
                {translate(productStatusText)}
              </div>
            }
            <ButtonRow>
              <Btn disabled={!purchasable} style={purchasable ? undefined : { opacity: 0.45, cursor: 'not-allowed' }} onClick={handleAddCart}>{translate('🛒 장바구니')}</Btn>
              <Btn $primary disabled={!purchasable} style={purchasable ? undefined : { opacity: 0.45, cursor: 'not-allowed' }} onClick={() => startBuyNow({ ...item, order_form_values: orderFormValues }, selectProductGroups, router)}>{translate('구매하기 💫')}</Btn>
            </ButtonRow>
          </Info>
        </HeroInner>
      </Hero>
      {/* 상품 스펙 — 가맹점이 상품폼에 적어도 프레임1 말고는 어디에도 나오지 않던 값이다. */}
      {formatLang(item, 'product_spec') &&
        <div style={{ whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '14px', color: '#666', background: '#f7f7f7', borderRadius: '6px', padding: '16px', margin: '0 auto', maxWidth: '900px', width: '90%' }}>
          {formatLang(item, 'product_spec')}
        </div>
      }
      {item?.product_description && (
        <DetailSection>
          <DetailTitle>💗 Product Story</DetailTitle>
          <DetailContent dangerouslySetInnerHTML={{ __html: formatLang(item, 'product_description') }} />
        </DetailSection>
      )}
    </Wrapper>
  );
};

export default Demo9;
