import { useEffect, useState } from 'react';
import ProductAddons from 'src/components/elements/shop/ProductAddons';
import { requiredGroups } from 'src/data/product-options';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { commarNumber, commarNumberWithUnit, isPurchasable, getProductStatus } from 'src/utils/function';
import { formatLang } from 'src/utils/format';
import { apiShop } from 'src/utils/api';
import { insertCartDataUtil, startBuyNow, selectItemOptionUtil, 배송비표시, 무료배송안내 } from 'src/utils/shop-util';
import QuantityStepper from 'src/components/elements/shop/QuantityStepper';
import DetailNotices from 'src/components/elements/shop/DetailNotices';
import ProductThumbs, { buildProductImages } from 'src/components/elements/shop/ProductThumbs';
import { themeObj } from 'src/components/elements/styled-components';
import toast from 'react-hot-toast';

/* 상품 상세 - 데모 6: 소프트 에디토리얼 */

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const Wrapper = styled.div`
  background: #fafaf7;
  min-height: 100vh;
`
const Hero = styled.section`
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  min-height: 85vh;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const ImageSide = styled.div`
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, ${p => p.$color}08 0%, ${p => p.$color}20 100%);
  position: relative;
  overflow: hidden;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
    aspect-ratio: 4/5;
  }
`
const ImageCircle = styled.div`
  position: absolute;
  width: 85%;
  aspect-ratio: 1/1;
  border-radius: 50%;
  background: radial-gradient(circle, ${p => p.$color}15 0%, transparent 70%);
`
const HeroImage = styled(LazyLoadImage)`
  max-width: 480px;
  max-height: 520px;
  object-fit: contain;
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 30px 60px rgba(0, 0, 0, 0.15));
  @media (max-width: 840px) {
    max-width: 280px;
    max-height: 340px;
  }
`
const InfoSide = styled.div`
  padding: 5rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
  }
`
const BrandLabel = styled.div`
  font-size: 12px;
  letter-spacing: 5px;
  font-weight: 700;
  color: ${p => p.$color};
  text-transform: uppercase;
`
const ProductName = styled.h1`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 52px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 1.1;
  margin: 0;
  color: #1a1a1a;
  @media (max-width: 840px) {
    font-size: 34px;
  }
`
const Description = styled.div`
  font-size: 16px;
  color: ${themeObj.grey[600]};
  line-height: 1.8;
  font-style: italic;
`
const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`
const SalePrice = styled.span`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 40px;
  font-weight: 700;
  color: ${p => p.$color};
`
const OrigPrice = styled.span`
  font-size: 15px;
  text-decoration: line-through;
  color: ${themeObj.grey[400]};
`
const Discount = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: #e74c3c;
  letter-spacing: 2px;
`
const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 1.5rem;
  @media (max-width: 480px) {
    flex-direction: column;
  }
`
const Btn = styled.button`
  flex: 1;
  padding: 18px 40px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 3px;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid #1a1a1a;
  background: ${p => p.$primary ? '#1a1a1a' : 'transparent'};
  color: ${p => p.$primary ? '#fff' : '#1a1a1a'};
  transition: all 0.3s;
  &:hover {
    background: ${p => p.$primary ? 'transparent' : '#1a1a1a'};
    color: ${p => p.$primary ? '#1a1a1a' : '#fff'};
  }
`
const DetailSection = styled.section`
  padding: 6rem 2rem;
  background: #fff;
  @media (max-width: 840px) {
    padding: 4rem 1.5rem;
  }
`
const DetailTitle = styled.h2`
  font-family: 'Playfair Display', 'Noto Serif KR', serif;
  font-size: 40px;
  font-weight: 900;
  text-align: center;
  letter-spacing: -1.5px;
  margin: 0 0 3rem 0;
  @media (max-width: 840px) {
    font-size: 28px;
  }
`
const DetailContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
  font-size: 15px;
  line-height: 2;
  color: ${themeObj.grey[700]};
  img { max-width: 100%; height: auto; }
`
const OptionArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 0.5rem;
`
const OptionField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`
const OptionName = styled.span`
  font-size: 11px;
  letter-spacing: 3px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${themeObj.grey[600]};
`
const OptionSelect = styled.select`
  padding: 14px 16px;
  font-size: 14px;
  font-family: inherit;
  color: #1a1a1a;
  background: #fff;
  border: 1px solid ${themeObj.grey[300]};
  cursor: pointer;
  appearance: none;
  transition: border-color 0.3s;
  &:focus { outline: none; border-color: #1a1a1a; }
`

const Demo6 = () => {
  const router = useRouter();
  const { currentLang, translate } = useLocales();
  const { themeDnsData, themeCartData, onChangeCartData } = useSettingsContext();
  const { user } = useAuthContext();
  const [item, setItem] = useState(null);
  const [selectProductGroups, setSelectProductGroups] = useState({ count: 1, groups: [] });
  const [imgIdx, setImgIdx] = useState(0);
  const brandName = themeDnsData?.name || 'BRAND';
  const mainColor = themeDnsData?.theme_css?.main_color || '#8B7355';

  useEffect(() => {
    if (router.query?.id) loadProduct();
  }, [router.query?.id]);

  const loadProduct = async () => {
    const product = await apiShop('product', 'get', { id: router.query?.id });
    if (product) { setItem(product); setImgIdx(0); }
  };

  // 선택옵션 — <select> 가 값을 주므로 옵션 객체로 먼저 바꾼다.
  const handleSelectOption = (group, e) => {
    const option = (group?.options ?? []).find((o) => String(o?.id) === e.target.value);
    if (!option) return;
    onSelectOption(group, option);
  };

  // 추가상품(ProductAddons)이 부르는 것.
  // 이 이름이 선언 없이 아래 JSX 에서 쓰이고 있었다 — 이 화면을 열면 ReferenceError 로
  // 상품상세가 통째로 백지가 된다(컴파일은 통과하므로 빌드로는 안 걸린다).
  const onSelectOption = (group, option) => {
    const updated = selectItemOptionUtil(group, option, selectProductGroups);
    setSelectProductGroups({ ...updated });
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
        <ImageSide $color={mainColor}>
          <ImageCircle $color={mainColor} />
          {/* 이미지 컨테이너가 가로 flex 라 썸네일을 그냥 두면 이미지 옆에 붙는다 — 세로로 묶는다. */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, maxWidth: '100%' }}>
            <HeroImage src={img} effect="blur" />
            <ProductThumbs images={images} activeIndex={imgIdx} onSelect={setImgIdx} />
          </div>
        </ImageSide>
        <InfoSide>
          <BrandLabel $color={mainColor}>{brandName} · Signature</BrandLabel>
          <ProductName>{name}</ProductName>
          {comment && <Description>"{comment}"</Description>}
          <PriceRow>
            {hasSale && <Discount>{disc}% OFF</Discount>}
            <SalePrice $color={mainColor}>{commarNumberWithUnit(sale)}</SalePrice>
            {hasSale && <OrigPrice>{commarNumberWithUnit(orig)}</OrigPrice>}
          </PriceRow>
          {/* 가격 아래 안내 묶음 — 배송비 · 배송 안내 · 혜택을 한 표로 그린다.
              라벨 칸을 함께 나누므로 혜택 라벨이 몇 글자든 세로줄이 맞는다(DetailNotices). */}
          <DetailNotices item={item} />
          {requiredGroups(item).length > 0 && (
            <OptionArea>
              {requiredGroups(item).map((group) => (
                <OptionField key={group?.id}>
                  <OptionName>{formatLang(group, 'group_name')}</OptionName>
                  <OptionSelect defaultValue="" onChange={(e) => handleSelectOption(group, e)}>
                    <option value="" disabled>
                      {formatLang(group, 'group_name')} 선택
                    </option>
                    {(group?.options ?? []).map((option) => (
                      <option key={option?.id} value={option?.id}>
                        {formatLang(option, 'option_name')}
                        {option?.option_price > 0 ? ` (+${commarNumberWithUnit(option.option_price)})` : ''}
                      </option>
                    ))}
                  </OptionSelect>
                </OptionField>
              ))}
            </OptionArea>
          )}
              {/* 추가상품 — 안 골라도 살 수 있다. 프레임 전체가 같은 컴포넌트를 쓴다. */}
              <ProductAddons product={item} selected={selectProductGroups} onSelect={onSelectOption} />
          {/* 수량 — 이 프레임엔 수량 UI 가 없어서 늘 1개만 살 수 있었다.
              OptionField 는 <label> 이라 버튼이 든 스테퍼를 감싸면 클릭이 엉키므로 쓰지 않는다. */}
          <OptionArea>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <OptionName>{translate('수량')}</OptionName>
              <div>
                <QuantityStepper
                  value={selectProductGroups?.count ?? 1}
                  onChange={(count) => setSelectProductGroups((prev) => ({ ...prev, count }))}
                />
              </div>
            </div>
          </OptionArea>
          {/* 살 수 없는 상태(품절·중단됨)를 상세에서 바로 알린다 — 예전엔 표시도 없고
              버튼도 살아 있어, 누르고 나서야 살 수 없다는 걸 알았다. */}
          {!purchasable && productStatusText &&
            <div style={{ padding: '10px 14px', borderRadius: '6px', background: '#f5f5f5', color: '#666', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
              {translate(productStatusText)}
            </div>
          }
          <ButtonRow>
            <Btn disabled={!purchasable} style={purchasable ? undefined : { opacity: 0.45, cursor: 'not-allowed' }} onClick={handleAddCart}>Add to Cart</Btn>
            <Btn $primary disabled={!purchasable} style={purchasable ? undefined : { opacity: 0.45, cursor: 'not-allowed' }} onClick={() => startBuyNow(item, selectProductGroups, router)}>Buy Now →</Btn>
          </ButtonRow>
        </InfoSide>
      </Hero>
      {/* 상품 스펙 — 가맹점이 상품폼에 적어도 프레임1 말고는 어디에도 나오지 않던 값이다. */}
      {formatLang(item, 'product_spec') &&
        <div style={{ whiteSpace: 'pre-line', lineHeight: 1.7, fontSize: '14px', color: '#666', background: '#f7f7f7', borderRadius: '6px', padding: '16px', margin: '0 auto', maxWidth: '900px', width: '90%' }}>
          {formatLang(item, 'product_spec')}
        </div>
      }
      {item?.product_description && (
        <DetailSection>
          <DetailTitle>About This Product</DetailTitle>
          <DetailContent dangerouslySetInnerHTML={{ __html: formatLang(item, 'product_description') }} />
        </DetailSection>
      )}
    </Wrapper>
  );
};

export default Demo6;
