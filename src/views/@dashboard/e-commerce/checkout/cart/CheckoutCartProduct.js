import PropTypes from 'prop-types';
// @mui
import { Box, Stack, Divider, TableRow, TableCell, Typography, IconButton } from '@mui/material';
// utils
import { fCurrency } from '../../../../../utils/formatNumber';
// components
import Image from 'src/components/image';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify/Iconify';
import { ColorPreview } from 'src/components/color-utils';
import { IncrementerButton } from 'src/components/custom-input';
import _ from 'lodash';
import { commarNumber, getPriceUnitByLang, setProductPriceByLang, getProductStatus, isPurchasable } from 'src/utils/function';
import { orderLineOptionTexts } from 'src/utils/shop-util';
import { optionExtraPrice } from 'src/data/product-options';
import { useSettingsContext } from 'src/components/settings';
import { formatLang } from 'src/utils/format';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

CheckoutCartProduct.propTypes = {
  row: PropTypes.object,
  onPeek: PropTypes.func,     // 사진·이름을 눌렀을 때 — 상품 페이지로 가지 않고 그 자리에서 「상품 정보」 창을 연다
  onDelete: PropTypes.func,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
  onChangeQuantity: PropTypes.func,
};
export default function CheckoutCartProduct({ row, onPeek, onDelete, onDecrease, onIncrease, onChangeQuantity, calculatorPrice, ship_active = false, line_delivery = 0, is_first_line = false }) {
  // status 가 빠져 있어 장바구니에서는 품절·판매중단 상품이 판매중과 똑같이 보였다.
  // 결제 직전 백엔드 하드블록에서야 막히는데 그때도 어느 상품인지 알려주지 않았다.
  const { product_name, product_comment, size, price, colors, cover, available, delivery_fee, product_sale_price, groups, order_count, product_price, product_img, status } = row;
  const { themeDnsData } = useSettingsContext();
  const { currentLang, translate } = useLocales();
  // 예전엔 상품 페이지로 이동했다. 주문서는 검토 단계라 밖으로 내보내지 않는다(DialogProductPeek 주석).
  const 상품보기 = () => { onPeek?.(); };

  // status 를 아는 경우에만 표시한다. 값이 없으면(옛 장바구니 데이터) 아무 표시도 하지 않는다.
  const status_known = !(status === undefined || status === null || status === '');
  const is_blocked = status_known && !isPurchasable(status);
  const status_text = getProductStatus(status)?.text;

  // 옵션 추가금(1개 기준). calculatorPrice 와 **같은 규칙으로** 더해야 한다 —
  // 거기서는 (product_sale_price + product_option_price) * order_count + delivery_fee 로 총액을 낸다.
  //
  // [고친 문제] 옵션에 변동가를 붙이면 총액에는 반영되는데 화면에는 그 근거가 어디에도 없었다.
  // 고객이 보는 것은 '판매가 10,000원 / 수량 1 / 총액 13,000원' 뿐이라 3,000원이 어디서
  // 붙었는지 알 수 없었다(가맹점이 값을 잘못 넣은 것처럼 보인다). 옵션명 옆과 가격칸에 근거를 남긴다.
  const unit = getPriceUnitByLang(currentLang?.value);
  const option_texts = orderLineOptionTexts(row, currentLang?.value);
  // 추가상품 줄 — 상품가·배송비 없이 추가상품 가격 × 수량뿐이다(shop-util 의 isAddonLine·calculatorPrice).
  const 추가상품줄 = Number(row?.addon_line) === 1;
  // ⚠ 옵션 금액을 여기서 직접 더하면 안 된다.
  //
  // 조합형 상품은 선택옵션의 개별가가 0 이고 금액이 **조합 추가금**으로 따로 붙는다.
  // 직접 더하면 그 금액이 0 으로 나와서, 아래 '옵션 +N / 개당 N' 설명이 통째로 안 떴다.
  // 그래서 손님 화면에는 '가격 50,000원 · 수량 1 · 총액 150,000원' 만 남아
  // 10만원이 어디서 붙었는지 알 길이 없었다(가맹점이 값을 잘못 넣은 것처럼 보인다).
  //
  // 총액(calculatorPrice)이 쓰는 그 함수를 그대로 쓴다 — 같은 함수라 설명과 총액이 어긋날 수 없다.
  // 장바구니 줄은 상품을 통째로 복사하므로 combinations·option_mode 가 줄에 그대로 남아 있다.
  const option_surcharge = optionExtraPrice(row, { groups });
  // 변동가는 음수도 허용된다(관리자 검증은 NaN 만 막는다) → 부호를 그대로 보여준다.
  const signedPrice = (value) => `${value < 0 ? '-' : '+'}${commarNumber(Math.abs(value))}${unit}`;
  const unit_price = (parseFloat(product_sale_price) || 0) + option_surcharge;


  return (
    <TableRow>
      {/* 휴대폰에서는 표가 카드로 쌓인다(CheckoutCartProductList 의 모바일카드 참고).
          이 칸만 라벨 없이 사진+이름 줄로 남는다 — 그래서 data-label 을 안 붙인다. */}
      <TableCell sx={{ display: 'flex', alignItems: 'center', '@media (max-width:599.95px)': { alignItems: 'flex-start', pr: 5 } }}>
        <Image
          alt="product image"
          src={product_img}
          sx={{ width: 64, height: 64, borderRadius: 1.5, mr: 2, cursor: 'pointer' }}
          onClick={상품보기}
        />

        <Stack spacing={0.5}>
          {/* 삭제 버튼이 같은 칸에 붙어 있으므로 그만큼 좁힌다.
              PC 쪽 값은 폭을 맞추려고 정한 것이다 — 240 이면 표가 734px 이 되어 본문(712px)을
              22px 넘긴다(실측). 200 이면 약 694px. 바깥 칸 여백을 8→24 로 넓히며(카드 제목과
              같은 선) 32px 이 더 필요해져 168 로 줄였다. */}
          <Typography noWrap variant="subtitle2" sx={{ maxWidth: { xs: 175, sm: 168 }, cursor: 'pointer' }} onClick={상품보기}>
            {
              themeDnsData?.setting_obj?.is_use_lang == 1 ?
                formatLang(row, 'product_name', currentLang)
                :
                product_name
            }
          </Typography>
          {추가상품줄 && (
            <Box><Label color="info">{translate('추가 상품')}</Label></Box>
          )}
          {is_blocked && (
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Label color={getProductStatus(status)?.color || 'error'}>{status_text || translate("판매불가")}</Label>
              <Typography variant="caption" sx={{ color: 'error.main' }}>
                {translate('이 상품은 결제할 수 없습니다.')}
              </Typography>
            </Stack>
          )}
          <Stack
            direction="row"
            alignItems="center"
            sx={{ typography: 'body2', color: 'text.secondary' }}
          >
            {/* 상품 한줄설명도 번역 대상 컬럼이다(lang_obj_columns.products 에 product_comment 가 있다).
                그런데 여기서는 원문을 그대로 그리고 있어서, 상품명만 번역되고 그 아래 설명은
                한국어로 남았다 — 상품 상세설명에서 났던 것과 같은 종류의 누락이다. */}
            {themeDnsData?.setting_obj?.is_use_lang == 1
              ? formatLang(row, 'product_comment', currentLang)
              : product_comment}
          </Stack>
        </Stack>
        {/* 삭제는 제 칸을 갖고 있었는데 상품 칸 안으로 들여왔다.
            칸 하나(68px + 여백)를 줄여야 표가 본문 폭 안에 들어간다 —
            줄이지 않으면 어떤 PC 화면에서도 「총액」이 잘린다(실측 표 930px / 본문 712px).
            휴대폰 카드에서도 이미 오른쪽 위에 있던 자리라 위치가 달라지지 않는다. */}
        <IconButton onClick={onDelete} sx={{ ml: 'auto', flexShrink: 0 }} aria-label={translate('삭제')}>
          <Iconify icon="eva:trash-2-outline" />
        </IconButton>
      </TableCell>
      <TableCell data-label={translate('옵션')}>
        {/* 옵션 칸이 늘 비어 있던 자리.
            (1) 그룹 이름 필드가 틀렸다 — 옵션그룹(product_option_groups)은 group_name 이고
                character_name 은 상품 스펙(product_characters)의 필드라 여기선 항상 undefined 였다.
            (2) 옵션 값도 option?.value 로 읽었는데, selectItemOptionUtil 이 객체 옵션은
                {id, option_name, option_price, ...} 그대로 저장한다(value 는 문자열 옵션에만 있다).
                그래서 옵션그룹을 쓰는 상품은 옵션명이 통째로 사라졌다.
            두 형태(+ 옛 데이터의 깨진 형태)를 모두 흡수하는 getOptionLabel 을 쓴다. */}
        <Stack spacing={0.5}>
          {/* 글은 orderLineOptionTexts 가 만든다 — 주문 요약정보(사이드바·결제수단 패널)와 같은 글이어야 한다.
              변동가가 붙은 옵션은 옆에 금액이 같이 붙는다(어느 선택이 얼마를 올렸는지 여기 말고는 드러나는 자리가 없다). */}
          {option_texts.length > 0 ?
            <>
              {option_texts.map((text, index) => (
                <Stack
                  key={groups?.[index]?.id ?? groups?.[index]?.group_name ?? index}
                  direction="row"
                  alignItems="center"
                  sx={{ typography: 'body2', color: 'text.secondary' }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap' }}>{text}</div>
                </Stack>
              ))}
            </>
            :
            <>
              ---
            </>}
        </Stack>
      </TableCell>
      {/* 금액 칸은 줄을 끊지 않는다.
          가맹점 제보(2026-08-24): "원화 금액 폰트 안맞음 — '원' 글자가 하단으로 내려감".
          폰트가 아니라 줄바꿈이었다. 두 가지가 겹쳤다:
            ① 숫자와 단위 사이에 공백이 있었다({commarNumber(x)} {단위}) → 거기서 끊긴다
            ② 공백을 없애도 한글은 CSS 기본값에서 **음절 아무 데서나** 끊긴다
               (scripts/checks/word-break.mjs 주석 참고) → '50,00 / 0원' 도 가능하다
          ① 은 붙여서, ② 는 nowrap 으로 막는다. 금액은 길어야 열 몇 글자라 폭 문제도 없다. */}
      <TableCell data-label={translate('가격')} sx={{ whiteSpace: 'nowrap' }}>
        {/* 추가상품 줄의 가격은 그 추가상품 가격이다 — 상품 판매가·정가·배송비를 여기 적으면 손님이 두 번 내는 줄 안다 */}
        {추가상품줄 ? (
          <>{commarNumber(option_surcharge)}{unit}</>
        ) : (
        <>
        {product_price > product_sale_price && (
          <Box
            component="span"
            sx={{ color: 'text.disabled', textDecoration: 'line-through', mr: 0.5 }}
          >
            {commarNumber(setProductPriceByLang(row, 'product_price', 'ko', currentLang?.value))}{getPriceUnitByLang(currentLang?.value)}
          </Box>
        )}
        {commarNumber(setProductPriceByLang(row, 'product_sale_price', 'ko', currentLang?.value))}{getPriceUnitByLang(currentLang?.value)}
        {/* 배송비 칸을 따로 두지 않는다(2026-09-08).
            정책을 켠 몰은 배송비가 **주문당 1회**라 첫 줄에만 값이 찍히고 나머지 줄은 전부 '—' 였다 —
            줄마다 자리를 차지할 만한 정보가 아니고 표 바로 아래에 이미 안내가 있다.
            그 칸을 줄여야 표가 본문 폭(712px) 안에 들어간다.
            (커머스 UX 연구 Baymard 도 줄에는 썸네일·이름·옵션·수량·금액을 두고
             배송비는 주문 단위 항목으로 두라고 한다)
            다만 정책을 **안 쓰는** 몰은 상품마다 배송비가 다르므로 그 몰에서만 여기에 적는다. */}
        {!ship_active && Number(setProductPriceByLang(row, 'delivery_fee', 'ko', currentLang?.value)) > 0 && (
          <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
            {translate('배송비')} +{commarNumber(setProductPriceByLang(row, 'delivery_fee', 'ko', currentLang?.value))}{unit}
          </Typography>
        )}
        {/* 옵션 추가금이 있을 때만 붙인다. 총액(마지막 칸)이 판매가와 다른 이유를 여기서 잇는다:
            판매가 → 옵션 가감 → 개당 금액 → (수량 곱) → 총액 */}
        {option_surcharge !== 0 && (
          <>
            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary' }}>
              {translate('옵션')} {signedPrice(option_surcharge)}
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 700 }}>
              {translate('개당')} {commarNumber(unit_price)}{unit}
            </Typography>
          </>
        )}
        </>
        )}
      </TableCell>
      {
        themeDnsData?.id != 74 ?
          <>
            <TableCell data-label={translate('수량')}>
              <Box sx={{ width: 96, textAlign: 'right' }}>
                <IncrementerButton
                  quantity={order_count}
                  type="cart_page"
                  onDecrease={onDecrease}
                  onIncrease={onIncrease}
                  onChangeQuantity={onChangeQuantity}
                  disabledDecrease={order_count <= 1}
                  disabledIncrease={order_count >= available}
                />
              </Box>
            </TableCell>
          </>
          :
          ''
      }

      <TableCell data-label={translate('총액')} data-total="1" align="right" sx={{ whiteSpace: 'nowrap' }}>{commarNumber(setProductPriceByLang(calculatorPrice(row), 'total', 'ko', currentLang?.value))}{getPriceUnitByLang(currentLang?.value)}</TableCell>

    </TableRow>
  );
}
