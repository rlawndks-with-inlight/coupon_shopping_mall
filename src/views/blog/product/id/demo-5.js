import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { commarNumber, commarNumberWithUnit } from 'src/utils/function';
import { formatLang } from 'src/utils/format';
import { apiShop } from 'src/utils/api';
import { insertCartDataUtil, startBuyNow, selectItemOptionUtil } from 'src/utils/shop-util';
import QuantityStepper from 'src/components/elements/shop/QuantityStepper';
import ProductThumbs, { buildProductImages } from 'src/components/elements/shop/ProductThumbs';
import toast from 'react-hot-toast';

/* 상품 상세 - 데모 5: 다크 럭셔리 (Maison) */

const GOLD = '#c9a876';

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const Wrapper = styled.div`
  background: #0a0a0a;
  color: #fff;
  min-height: 100vh;
`
const Hero = styled.section`
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  min-height: 90vh;
  background:
    radial-gradient(ellipse at 30% 50%, rgba(201, 168, 118, 0.12) 0%, transparent 60%),
    #0a0a0a;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const ImageSide = styled.div`
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
  }
`
const ImageRing = styled.div`
  position: absolute;
  width: 480px;
  height: 480px;
  border: 1px solid ${GOLD}30;
  border-radius: 50%;
  @media (max-width: 840px) {
    width: 300px;
    height: 300px;
  }
`
const ImageGlow = styled.div`
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, ${GOLD}25 0%, transparent 70%);
  filter: blur(40px);
`
const HeroImage = styled(LazyLoadImage)`
  max-width: 400px;
  max-height: 500px;
  object-fit: contain;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 30px 60px rgba(201, 168, 118, 0.3));
  @media (max-width: 840px) {
    max-width: 260px;
    max-height: 300px;
  }
`
const InfoSide = styled.div`
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
  }
`
const Ornament = styled.div`
  font-size: 20px;
  color: ${GOLD};
  letter-spacing: 8px;
  margin-bottom: 0.5rem;
`
const BrandLabel = styled.div`
  font-size: 11px;
  letter-spacing: 5px;
  color: ${GOLD};
  font-weight: 700;
  text-transform: uppercase;
`
const ProductName = styled.h1`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 48px;
  font-weight: 300;
  line-height: 1.2;
  letter-spacing: -1px;
  margin: 0;
  @media (max-width: 840px) {
    font-size: 30px;
  }
`
const Divider = styled.div`
  width: 40px;
  height: 1px;
  background: ${GOLD};
  margin: 0.5rem 0;
`
const Description = styled.div`
  font-size: 14px;
  line-height: 1.9;
  opacity: 0.7;
  font-style: italic;
`
const PriceBlock = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
`
const SalePrice = styled.span`
  font-family: 'Playfair Display', serif;
  font-size: 40px;
  color: ${GOLD};
  font-weight: 300;
`
const OrigPrice = styled.span`
  font-size: 15px;
  text-decoration: line-through;
  opacity: 0.4;
`
const Discount = styled.span`
  font-size: 12px;
  color: #ff6b6b;
  letter-spacing: 2px;
  font-weight: 700;
`
const ButtonRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  @media (max-width: 480px) {
    flex-direction: column;
  }
`
const Btn = styled.button`
  flex: 1;
  padding: 16px 32px;
  border: 1px solid ${GOLD};
  background: ${p => p.$primary ? GOLD : 'transparent'};
  color: ${p => p.$primary ? '#0a0a0a' : GOLD};
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 4px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    background: ${p => p.$primary ? 'transparent' : GOLD};
    color: ${p => p.$primary ? GOLD : '#0a0a0a'};
  }
`
const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-top: 0.5rem;
`
const OptionField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`
const OptionLabel = styled.label`
  font-size: 10px;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: ${GOLD};
  font-weight: 700;
`
const OptionSelect = styled.select`
  width: 100%;
  padding: 13px 14px;
  background: transparent;
  border: 1px solid rgba(201, 168, 118, 0.35);
  color: #fff;
  font-size: 13px;
  letter-spacing: 1px;
  cursor: pointer;
  transition: border-color 0.3s;
  &:focus {
    outline: none;
    border-color: ${GOLD};
  }
  option {
    background: #0a0a0a;
    color: #fff;
  }
`
const DetailSection = styled.section`
  padding: 6rem 3rem;
  background: #0f0f0f;
  border-top: 1px solid rgba(201, 168, 118, 0.15);
  @media (max-width: 840px) {
    padding: 4rem 1.5rem;
  }
`
const DetailTitle = styled.h2`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 38px;
  font-weight: 300;
  text-align: center;
  margin: 0 0 3rem 0;
  @media (max-width: 840px) {
    font-size: 26px;
  }
`
const DetailContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  font-size: 14px;
  line-height: 2;
  opacity: 0.8;
  img { max-width: 100%; height: auto; }
`

const Demo5 = () => {
  const router = useRouter();
  const { currentLang, translate } = useLocales();
  const { themeDnsData, themeCartData, onChangeCartData } = useSettingsContext();
  const { user } = useAuthContext();
  const [item, setItem] = useState(null);
  const [selectProductGroups, setSelectProductGroups] = useState({ count: 1, groups: [] });
  const [imgIdx, setImgIdx] = useState(0);
  const brandName = themeDnsData?.name || 'MAISON';

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
    if (result) {
      toast.success(translate ? translate('장바구니에 성공적으로 추가되었습니다.') : '장바구니에 추가되었습니다.');
    }
  };

  const onSelectOption = (group, option) => {
    setSelectProductGroups(selectItemOptionUtil(group, option, selectProductGroups));
  };

  if (!item) return <Wrapper><DetailSection style={{ textAlign: 'center' }}>Loading...</DetailSection></Wrapper>;

  // 대표이미지 + 서브이미지.
  // 예전엔 대표 한 장만 그려서, 관리자에서 올린 서브이미지가 고객 화면에 아예 안 나왔다.
  const images = buildProductImages(item, fixImgUrl);
  const img = images[Math.min(imgIdx, Math.max(0, images.length - 1))] ?? '';
  const name = formatLang(item, 'product_name', currentLang);
  const comment = item?.product_comment;
  const sale = item?.product_sale_price || item?.product_price || 0;
  const orig = item?.product_price || 0;
  const hasSale = orig > sale && sale > 0;
  const disc = hasSale ? Math.round((orig - sale) * 100 / orig) : 0;

  return (
    <Wrapper>
      <Hero>
        <ImageSide>
          <ImageRing />
          <ImageGlow />
          {/* 이미지 컨테이너가 가로 flex 라 썸네일을 그냥 두면 이미지 옆에 붙는다 — 세로로 묶는다. */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, maxWidth: '100%' }}>
            <HeroImage src={img} effect="blur" />
            <ProductThumbs images={images} activeIndex={imgIdx} onSelect={setImgIdx} />
          </div>
        </ImageSide>
        <InfoSide>
          <Ornament>✦ ✦ ✦</Ornament>
          <BrandLabel>{brandName} · Maison</BrandLabel>
          <ProductName>{name}</ProductName>
          <Divider />
          {comment && <Description>"{comment}"</Description>}
          {hasSale && <Discount>{disc}% EXCLUSIVE OFFER</Discount>}
          <PriceBlock>
            <SalePrice>{commarNumberWithUnit(sale)}</SalePrice>
            {hasSale && <OrigPrice>{commarNumberWithUnit(orig)}</OrigPrice>}
          </PriceBlock>
          {/* 배송비를 상세에 표시한다. 예전엔 이 프레임들에 배송비 표기가 없어서
              고객이 장바구니·주문서에 가서야 배송비를 알았다(주문 직전 금액이 달라 보인다). */}
          {item?.delivery_fee > 0
              ? <div style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>{translate('배송비')} {commarNumberWithUnit(item?.delivery_fee)}</div>
              : <div style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>{translate('무료배송')}</div>}
          {item?.groups?.length > 0 && (
            <OptionGroup>
              {item.groups.map((group, gIdx) => (
                <OptionField key={group?.id ?? group?.group_name ?? gIdx}>
                  <OptionLabel>{formatLang(group, 'group_name')}</OptionLabel>
                  <OptionSelect
                    defaultValue=""
                    onChange={(e) => {
                      if (e.target.value === '') return;
                      const option = group?.options?.[Number(e.target.value)];
                      if (option) onSelectOption(group, option);
                    }}
                  >
                    <option value="" disabled>{translate('선택')}</option>
                    {group?.options?.map((option, oIdx) => (
                      <option key={option?.id ?? option?.option_name ?? oIdx} value={oIdx}>
                        {formatLang(option, 'option_name')}{option?.option_price > 0 ? ` (+${commarNumberWithUnit(option.option_price)})` : ''}
                      </option>
                    ))}
                  </OptionSelect>
                </OptionField>
              ))}
            </OptionGroup>
          )}
          {/* 수량 — 이 프레임엔 수량 UI 가 없어서 늘 1개만 살 수 있었다 */}
          <OptionField>
            <OptionLabel>{translate('수량')}</OptionLabel>
            <div>
              <QuantityStepper
                value={selectProductGroups?.count ?? 1}
                onChange={(count) => setSelectProductGroups((prev) => ({ ...prev, count }))}
              />
            </div>
          </OptionField>
          <ButtonRow>
            <Btn onClick={handleAddCart}>Add to Cart</Btn>
            <Btn $primary onClick={() => startBuyNow(item, selectProductGroups, router)}>Acquire →</Btn>
          </ButtonRow>
        </InfoSide>
      </Hero>
      {item?.product_description && (
        <DetailSection>
          <DetailTitle>The Essence</DetailTitle>
          <DetailContent dangerouslySetInnerHTML={{ __html: formatLang(item, 'product_description') }} />
        </DetailSection>
      )}
    </Wrapper>
  );
};

export default Demo5;
