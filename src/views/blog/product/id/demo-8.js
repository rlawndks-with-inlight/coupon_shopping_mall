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

/* 상품 상세 - 데모 8: 브루탈리스트 */

const NEON = '#dbff1c';
const BLACK = '#000';
const WHITE = '#fff';

const fixImgUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('//')) return `https:${url}`;
  return url;
};

const Wrapper = styled.div`
  background: ${WHITE};
  color: ${BLACK};
  min-height: 100vh;
`
const Hero = styled.section`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  border-bottom: 4px solid ${BLACK};
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const Cell = styled.div`
  border-right: 4px solid ${BLACK};
  border-bottom: 4px solid ${BLACK};
  padding: 2rem;
`
const ImageCell = styled(Cell)`
  grid-row: span 2;
  padding: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  @media (max-width: 840px) {
    grid-row: span 1;
  }
`
const NameCell = styled(Cell)`
  background: ${NEON};
`
const PriceCell = styled(Cell)`
  background: ${BLACK};
  color: ${WHITE};
  border-right: none;
`
const MonoLabel = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  opacity: 0.6;
  letter-spacing: 2px;
  margin-bottom: 1rem;
`
const HugeImage = styled(LazyLoadImage)`
  width: 420px;
  height: 420px;
  object-fit: contain;
  @media (max-width: 840px) {
    width: 300px;
    height: 300px;
  }
`
const NameHuge = styled.div`
  font-size: 48px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 0.95;
  text-transform: uppercase;
  word-break: keep-all;
  @media (max-width: 840px) {
    font-size: 32px;
  }
`
const DescMono = styled.div`
  font-family: 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.8;
  margin-top: 1.5rem;
  max-width: 400px;
`
const PriceHuge = styled.div`
  font-size: 64px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 0.9;
  @media (max-width: 840px) {
    font-size: 44px;
  }
`
const OrigPrice = styled.div`
  font-size: 13px;
  text-decoration: line-through;
  opacity: 0.5;
  margin-top: 0.5rem;
`
const OptionSection = styled.section`
  display: flex;
  flex-direction: column;
  border-bottom: 4px solid ${BLACK};
`
const OptionField = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  border-bottom: 2px solid ${BLACK};
  &:last-child {
    border-bottom: none;
  }
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const OptionLabel = styled.label`
  font-family: 'Courier New', monospace;
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 2px;
  padding: 20px 2rem;
  display: flex;
  align-items: center;
  background: ${NEON};
  color: ${BLACK};
  border-right: 4px solid ${BLACK};
  @media (max-width: 840px) {
    border-right: none;
    border-bottom: 2px solid ${BLACK};
  }
`
const OptionSelect = styled.select`
  width: 100%;
  padding: 20px 2rem;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: none;
  background: ${WHITE};
  color: ${BLACK};
  cursor: pointer;
  outline: none;
  &:focus {
    background: ${NEON};
  }
  option {
    background: ${WHITE};
    color: ${BLACK};
  }
`
const ButtonGrid = styled.section`
  display: grid;
  grid-template-columns: 1fr 2fr;
  border-bottom: 4px solid ${BLACK};
  @media (max-width: 840px) {
    grid-template-columns: 1fr;
  }
`
const BtnCell = styled.button`
  padding: 32px 0;
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 6px;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
  border-right: 4px solid ${BLACK};
  &:last-child {
    border-right: none;
  }
  background: ${p => p.$primary ? BLACK : WHITE};
  color: ${p => p.$primary ? NEON : BLACK};
  &:hover {
    background: ${p => p.$primary ? NEON : BLACK};
    color: ${p => p.$primary ? BLACK : NEON};
  }
  @media (max-width: 840px) {
    border-right: none;
    border-bottom: 4px solid ${BLACK};
    &:last-child {
      border-bottom: none;
    }
  }
`
const DetailSection = styled.section`
  padding: 5rem 2rem;
  border-bottom: 4px solid ${BLACK};
  @media (max-width: 840px) {
    padding: 3rem 1.25rem;
  }
`
const DetailTitle = styled.h2`
  font-size: 64px;
  font-weight: 900;
  letter-spacing: -3px;
  text-transform: uppercase;
  margin: 0 0 2rem 0;
  @media (max-width: 840px) {
    font-size: 36px;
  }
`
const DetailContent = styled.div`
  max-width: 800px;
  font-size: 14px;
  line-height: 1.9;
  img { max-width: 100%; height: auto; }
`

const Demo8 = () => {
  const router = useRouter();
  const { currentLang, translate } = useLocales();
  const { themeDnsData, themeCartData, onChangeCartData } = useSettingsContext();
  const { user } = useAuthContext();
  const [item, setItem] = useState(null);
  const [selectProductGroups, setSelectProductGroups] = useState({ count: 1, groups: [] });
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
    if (result) toast.success('장바구니에 추가되었습니다.');
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
  const sale = item?.product_sale_price || item?.product_price || 0;
  const orig = item?.product_price || 0;
  const hasSale = orig > sale && sale > 0;
  const disc = hasSale ? Math.round((orig - sale) * 100 / orig) : 0;

  return (
    <Wrapper>
      <Hero>
        <ImageCell>
          {/* 이미지 컨테이너가 가로 flex 라 썸네일을 그냥 두면 이미지 옆에 붙는다 — 세로로 묶는다. */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, maxWidth: '100%' }}>
            <HugeImage src={img} effect="blur" />
            <ProductThumbs images={images} activeIndex={imgIdx} onSelect={setImgIdx} />
          </div>
        </ImageCell>
        <NameCell>
          <MonoLabel>Product / 01</MonoLabel>
          <NameHuge>{name}</NameHuge>
          {comment && <DescMono>// {comment}</DescMono>}
        </NameCell>
        <PriceCell>
          <MonoLabel>Price / KRW</MonoLabel>
          <PriceHuge>{commarNumberWithUnit(sale)}</PriceHuge>
          {hasSale && <OrigPrice>{commarNumberWithUnit(orig)} · -{disc}%</OrigPrice>}
        </PriceCell>
        {/* 배송비를 상세에 표시한다. 예전엔 이 프레임들에 배송비 표기가 없어서
            고객이 장바구니·주문서에 가서야 배송비를 알았다(주문 직전 금액이 달라 보인다). */}
        {item?.delivery_fee > 0
            ? <div style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>{translate('배송비')} {commarNumberWithUnit(item?.delivery_fee)}</div>
            : <div style={{ fontSize: '13px', color: '#888', marginTop: '6px' }}>{translate('무료배송')}</div>}
      </Hero>

      {item?.groups?.length > 0 && (
        <OptionSection>
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
                <option value="" disabled>Select</option>
                {group?.options?.map((option, oIdx) => (
                  <option key={option?.id ?? option?.option_name ?? oIdx} value={oIdx}>
                    {formatLang(option, 'option_name')}{option?.option_price > 0 ? ` (+${commarNumberWithUnit(option.option_price)})` : ''}
                  </option>
                ))}
              </OptionSelect>
            </OptionField>
          ))}
        </OptionSection>
      )}

      {/* 수량 — 이 프레임엔 수량 UI 가 없어서 늘 1개만 살 수 있었다 */}
      <OptionSection>
        <OptionField>
          <OptionLabel>Quantity</OptionLabel>
          <div>
            <QuantityStepper
              value={selectProductGroups?.count ?? 1}
              onChange={(count) => setSelectProductGroups((prev) => ({ ...prev, count }))}
            />
          </div>
        </OptionField>
      </OptionSection>

      <ButtonGrid>
        <BtnCell onClick={handleAddCart}>Cart</BtnCell>
        <BtnCell $primary onClick={() => startBuyNow(item, selectProductGroups, router)}>Buy Now →</BtnCell>
      </ButtonGrid>

      {item?.product_description && (
        <DetailSection>
          <DetailTitle>Details.</DetailTitle>
          <DetailContent dangerouslySetInnerHTML={{ __html: formatLang(item, 'product_description') }} />
        </DetailSection>
      )}
    </Wrapper>
  );
};

export default Demo8;
