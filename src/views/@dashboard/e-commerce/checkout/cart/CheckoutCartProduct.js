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
import { getOptionLabel } from 'src/utils/shop-util';
import { optionExtraPrice } from 'src/data/product-options';
import { useSettingsContext } from 'src/components/settings';
import { formatLang } from 'src/utils/format';
import { useLocales } from 'src/locales';
import { useRouter } from 'next/router';

// ----------------------------------------------------------------------

CheckoutCartProduct.propTypes = {
  row: PropTypes.object,
  onDelete: PropTypes.func,
  onDecrease: PropTypes.func,
  onIncrease: PropTypes.func,
  onChangeQuantity: PropTypes.func,
};
export default function CheckoutCartProduct({ row, onDelete, onDecrease, onIncrease, onChangeQuantity, calculatorPrice, ship_active = false, line_delivery = 0, is_first_line = false }) {
  // status 가 빠져 있어 장바구니에서는 품절·판매중단 상품이 판매중과 똑같이 보였다.
  // 결제 직전 백엔드 하드블록에서야 막히는데 그때도 어느 상품인지 알려주지 않았다.
  const { product_name, product_comment, size, price, colors, cover, available, delivery_fee, product_sale_price, groups, order_count, product_price, product_img, status } = row;
  const { themeDnsData } = useSettingsContext();
  const { currentLang, translate } = useLocales();
  const router = useRouter();

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
  const optionPriceOf = (option) => parseFloat(option?.option_price) || 0;
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
      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Image
          alt="product image"
          src={product_img}
          sx={{ width: 64, height: 64, borderRadius: 1.5, mr: 2, cursor: 'pointer' }}
          onClick={() => { router.push(`/shop/item/${row?.id}`) }}
        />

        <Stack spacing={0.5}>
          <Typography noWrap variant="subtitle2" sx={{ maxWidth: 240, cursor: 'pointer' }} onClick={() => { router.push(`/shop/item/${row?.id}`) }}>
            {
              themeDnsData?.setting_obj?.is_use_lang == 1 ?
                formatLang(row, 'product_name', currentLang)
                :
                product_name
            }
          </Typography>
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
      </TableCell>
      <TableCell>
        {/* 옵션 칸이 늘 비어 있던 자리.
            (1) 그룹 이름 필드가 틀렸다 — 옵션그룹(product_option_groups)은 group_name 이고
                character_name 은 상품 스펙(product_characters)의 필드라 여기선 항상 undefined 였다.
            (2) 옵션 값도 option?.value 로 읽었는데, selectItemOptionUtil 이 객체 옵션은
                {id, option_name, option_price, ...} 그대로 저장한다(value 는 문자열 옵션에만 있다).
                그래서 옵션그룹을 쓰는 상품은 옵션명이 통째로 사라졌다.
            두 형태(+ 옛 데이터의 깨진 형태)를 모두 흡수하는 getOptionLabel 을 쓴다. */}
        <Stack spacing={0.5}>
          {groups && groups.length > 0 ?
            <>
              {groups.map((group, index) => {
                const option_text = (group?.options ?? [])
                  // 변동가가 붙은 옵션은 옆에 금액을 같이 보여준다 — 어느 선택이 얼마를
                  // 올렸는지가 여기 말고는 드러나는 자리가 없다(총액에는 이미 더해져 있다).
                  .map((option) => {
                    const label = getOptionLabel(option);
                    if (!label) return '';
                    const add = optionPriceOf(option);
                    return add === 0 ? label : `${label} (${signedPrice(add)})`;
                  })
                  .filter((v) => v !== '')
                  .join(' / ');
                if (!option_text) return null;
                return (
                  <Stack
                    key={group?.id ?? group?.group_name ?? index}
                    direction="row"
                    alignItems="center"
                    sx={{ typography: 'body2', color: 'text.secondary' }}
                  >
                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                      {group?.group_name ? `${group?.group_name}: ` : ''}{option_text}
                    </div>
                  </Stack>
                );
              })}
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
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {/* 정책이 켜진 몰은 배송비가 주문당 1회라 줄마다 값을 찍으면 거짓말이 된다.
            첫 줄에 한 번 적고 나머지 줄은 '—' 로 둔다(표 아래 안내가 이유를 설명한다). */}
        {ship_active
          ? (line_delivery > 0
            ? <>{commarNumber(line_delivery)}{getPriceUnitByLang(currentLang?.value)}</>
            : (is_first_line ? translate('무료') : '—'))
          : <>{commarNumber(setProductPriceByLang(row, 'delivery_fee', 'ko', currentLang?.value))}{getPriceUnitByLang(currentLang?.value)}</>}
      </TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        {product_price > product_sale_price && (
          <Box
            component="span"
            sx={{ color: 'text.disabled', textDecoration: 'line-through', mr: 0.5 }}
          >
            {commarNumber(setProductPriceByLang(row, 'product_price', 'ko', currentLang?.value))}{getPriceUnitByLang(currentLang?.value)}
          </Box>
        )}
        {commarNumber(setProductPriceByLang(row, 'product_sale_price', 'ko', currentLang?.value))}{getPriceUnitByLang(currentLang?.value)}
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
      </TableCell>
      {
        themeDnsData?.id != 74 ?
          <>
            <TableCell>
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

      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>{commarNumber(setProductPriceByLang(calculatorPrice(row), 'total', 'ko', currentLang?.value))}{getPriceUnitByLang(currentLang?.value)}</TableCell>

      <TableCell align="right">
        <IconButton onClick={onDelete}>
          <Iconify icon="eva:trash-2-outline" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
