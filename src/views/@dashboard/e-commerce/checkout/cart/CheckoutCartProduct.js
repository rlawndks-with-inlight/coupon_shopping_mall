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
export default function CheckoutCartProduct({ row, onDelete, onDecrease, onIncrease, onChangeQuantity, calculatorPrice }) {
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
              <Label color={getProductStatus(status)?.color || 'error'}>{status_text || '판매불가'}</Label>
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
            {product_comment}
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
                  .map((option) => getOptionLabel(option))
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
      <TableCell>
        {commarNumber(setProductPriceByLang(row, 'delivery_fee', 'ko', currentLang?.value))} {getPriceUnitByLang(currentLang?.value)}
      </TableCell>
      <TableCell>
        {product_price > product_sale_price && (
          <Box
            component="span"
            sx={{ color: 'text.disabled', textDecoration: 'line-through', mr: 0.5 }}
          >
            {commarNumber(setProductPriceByLang(row, 'product_price', 'ko', currentLang?.value))} {getPriceUnitByLang(currentLang?.value)}
          </Box>
        )}
        {commarNumber(setProductPriceByLang(row, 'product_sale_price', 'ko', currentLang?.value))} {getPriceUnitByLang(currentLang?.value)}
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

      <TableCell align="right">{commarNumber(setProductPriceByLang(calculatorPrice(row), 'total', 'ko', currentLang?.value))} {getPriceUnitByLang(currentLang?.value)}</TableCell>

      <TableCell align="right">
        <IconButton onClick={onDelete}>
          <Iconify icon="eva:trash-2-outline" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
