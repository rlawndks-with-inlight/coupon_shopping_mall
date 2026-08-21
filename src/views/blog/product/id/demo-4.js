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
import ProductThumbs, { buildProductImages } from 'src/components/elements/shop/ProductThumbs';
import toast from 'react-hot-toast';
import BenefitNotice from 'src/components/elements/shop/BenefitNotice';
import OrderFormFields from 'src/components/elements/shop/OrderFormFields';

/* 상품 상세 - 데모 4: 미니멀 모노크롬 */

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const Wrapper = styled.div`
  background: #fff;
  color: #000;
`
const Hero = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 90vh;
  border-bottom: 1px solid #000;
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
    min-height: auto;
  }
`
const ImageSide = styled.div`
  background: #f5f5f5;
  padding: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #000;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
    border-right: none;
    border-bottom: 1px solid #000;
  }
`
const HeroImage = styled(LazyLoadImage)`
  width: 480px;
  height: 480px;
  object-fit: contain;
  @media (max-width: 840px) {
    width: 300px;
    height: 300px;
  }
`
const InfoSide = styled.div`
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2rem;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
  }
`
const TopRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  letter-spacing: 3px;
  text-transform: uppercase;
`
const ProductName = styled.h1`
  font-size: 56px;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -2px;
  margin: 0;
  text-transform: uppercase;
  @media (max-width: 840px) {
    font-size: 36px;
  }
`
const Description = styled.div`
  font-size: 14px;
  line-height: 1.8;
  opacity: 0.8;
`
const PriceBlock = styled.div`
  border-top: 1px solid #000;
  border-bottom: 1px solid #000;
  padding: 2rem 0;
`
const PriceLabel = styled.div`
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  opacity: 0.5;
  margin-bottom: 0.5rem;
`
const PriceRow = styled.div`
  display: flex;
  align-items: baseline;
  gap: 1rem;
  flex-wrap: wrap;
`
const OrigPrice = styled.span`
  font-size: 16px;
  text-decoration: line-through;
  opacity: 0.4;
`
const SalePrice = styled.span`
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -2px;
  @media (max-width: 840px) {
    font-size: 32px;
  }
`
const Discount = styled.span`
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
`
const ButtonRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`
const Btn = styled.button`
  padding: 22px 0;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 4px;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid #000;
  background: ${p => p.$primary ? '#000' : '#fff'};
  color: ${p => p.$primary ? '#fff' : '#000'};
  &:hover {
    background: ${p => p.$primary ? '#fff' : '#000'};
    color: ${p => p.$primary ? '#000' : '#fff'};
  }
`
const OptionGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
`
const OptionField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`
const OptionLabel = styled.label`
  font-size: 10px;
  letter-spacing: 3px;
  text-transform: uppercase;
  opacity: 0.5;
`
const OptionSelect = styled.select`
  width: 100%;
  padding: 16px;
  border: 1px solid #000;
  background: #fff;
  color: #000;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
  cursor: pointer;
  border-radius: 0;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M2 4l4 4 4-4' stroke='black' stroke-width='1.5' fill='none'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  &:focus { outline: none; }
  option { text-transform: none; letter-spacing: normal; font-weight: 400; }
`
const DetailSection = styled.section`
  padding: 5rem 3rem;
  @media (max-width: 840px) {
    padding: 3rem 1.5rem;
  }
`
const DetailTitle = styled.h2`
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -1px;
  text-transform: uppercase;
  margin: 0 0 2rem 0;
`
const DetailContent = styled.div`
  max-width: 720px;
  font-size: 14px;
  line-height: 1.9;
  img { max-width: 100%; height: auto; }
`

const Demo4 = () => {
  const router = useRouter();
  const { currentLang, translate } = useLocales();
  const { themeDnsData, themeCartData, onChangeCartData } = useSettingsContext();
  const { user } = useAuthContext();
  const [item, setItem] = useState(null);
  const [selectProductGroups, setSelectProductGroups] = useState({ count: 1, groups: [] });
  // 주문 추가 입력항목(행사일 등)의 값. 담기·바로구매 때 상품에 실어 보낸다.
  const [orderFormValues, setOrderFormValues] = useState({});
  const [imgIdx, setImgIdx] = useState(0);
  const brandName = themeDnsData?.name || 'BRAND';

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
      toast.success(translate ? translate('장바구니에 성공적으로 추가되었습니다.') : translate('장바구니에 추가되었습니다.'));
    }
  };

  const onSelectOption = (group, option) => {
    setSelectProductGroups(selectItemOptionUtil(group, option, selectProductGroups));
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
        <ImageSide>
          {/* 이미지 컨테이너가 가로 flex 라 썸네일을 그냥 두면 이미지 옆에 붙는다 — 세로로 묶는다. */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, maxWidth: '100%' }}>
            <HeroImage src={img} effect="blur" />
            <ProductThumbs images={images} activeIndex={imgIdx} onSelect={setImgIdx} />
          </div>
        </ImageSide>
        <InfoSide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <TopRow>
              <span>{brandName}</span>
              <span>№ 001</span>
            </TopRow>
            <ProductName>{name}</ProductName>
            {comment && <Description>{comment}</Description>}
            <PriceBlock>
              <PriceLabel>Price</PriceLabel>
              <PriceRow>
                {hasSale && <OrigPrice>{commarNumberWithUnit(orig)}</OrigPrice>}
                <SalePrice>{commarNumberWithUnit(sale)}</SalePrice>
                {hasSale && <Discount>{disc}% OFF</Discount>}
              </PriceRow>
              {/* 배송비를 상세에 표시한다. 예전엔 이 프레임들에 배송비 표기가 없어서
                  고객이 장바구니·주문서에 가서야 배송비를 알았다(주문 직전 금액이 달라 보인다). */}
              {배송비표시(item).free
                  ? <div style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>{translate('무료배송')}</div>
                  : <div style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>{translate('배송비')} {commarNumberWithUnit(배송비표시(item).fee, currentLang?.value)}
                      {무료배송안내(item, currentLang?.value) && <span> · {무료배송안내(item, currentLang?.value)}</span>}</div>}
              {/* 혜택 안내(본사 공통). 이 프레임은 흑백·절제된 톤이라 라벨을 더 흐리게 둔다. */}
              <BenefitNotice sx={{ mt: '10px' }} tone={{ fontSize: 13, labelColor: '#999', textColor: '#333' }} />
              {/* 주문 추가 입력항목 — 서식이 걸린 몰에서만 나타난다 */}
              <OrderFormFields product={item} values={orderFormValues} onChange={setOrderFormValues} sx={{ mt: 2 }} />
            </PriceBlock>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {requiredGroups(item).length > 0 && (
              <OptionGroup>
                {requiredGroups(item).map((group, gIdx) => (
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
                      <option value="" disabled>Select</option>
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
              {/* 추가상품 — 안 골라도 살 수 있다. 프레임 전체가 같은 컴포넌트를 쓴다. */}
              <ProductAddons product={item} selected={selectProductGroups} onSelect={onSelectOption} />
            {/* 수량 — 이 프레임엔 수량 UI 가 없어서 늘 1개만 살 수 있었다 */}
            <OptionField>
              <OptionLabel>Quantity</OptionLabel>
              <div>
                <QuantityStepper
                  value={selectProductGroups?.count ?? 1}
                  onChange={(count) => setSelectProductGroups((prev) => ({ ...prev, count }))}
                />
              </div>
            </OptionField>
            {/* 살 수 없는 상태(품절·중단됨)를 상세에서 바로 알린다 — 예전엔 표시도 없고
                버튼도 살아 있어, 누르고 나서야 살 수 없다는 걸 알았다. */}
            {!purchasable && productStatusText &&
              <div style={{ padding: '10px 14px', borderRadius: '6px', background: '#f5f5f5', color: '#666', fontSize: '13px', fontWeight: 700, textAlign: 'center' }}>
                {translate(productStatusText)}
              </div>
            }
            <ButtonRow>
              <Btn disabled={!purchasable} style={purchasable ? undefined : { opacity: 0.45, cursor: 'not-allowed' }} onClick={handleAddCart}>Add to Cart</Btn>
              <Btn $primary disabled={!purchasable} style={purchasable ? undefined : { opacity: 0.45, cursor: 'not-allowed' }} onClick={() => startBuyNow({ ...item, order_form_values: orderFormValues }, selectProductGroups, router)}>Buy Now →</Btn>
            </ButtonRow>
          </div>
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
          <DetailTitle>The Details</DetailTitle>
          <DetailContent dangerouslySetInnerHTML={{ __html: formatLang(item, 'product_description') }} />
        </DetailSection>
      )}
    </Wrapper>
  );
};

export default Demo4;
