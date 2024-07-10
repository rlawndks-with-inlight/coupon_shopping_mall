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
import { commarNumber, getPriceUnitByLang, setProductPriceByLang } from 'src/utils/function';
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
  onQuantityChange: PropTypes.func,
};
export default function CheckoutCartProduct({ row, onDelete, onDecrease, onIncrease, onQuantityChange, calculatorPrice }) {
  const { product_name, product_comment, size, price, colors, cover, available, delivery_fee, product_sale_price, groups, order_count, product_price, product_img } = row;
  const { themeDnsData } = useSettingsContext();
  const { currentLang, translate } = useLocales();
  const router = useRouter();


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
        <Stack spacing={0.5}>
          {groups && groups.length > 0 ?
            <>
              {groups.map((group, index) => {
                return <>
                  <Stack
                    direction="row"
                    alignItems="center"
                    sx={{ typography: 'body2', color: 'text.secondary' }}
                  >
                    <div style={{ display: 'flex' }}>
                      {group?.group_name}: {group?.options && group?.options.map((option, idx) => (
                        <>
                          {option?.option_name} {option?.option_price > 0 ? '+' : ''}{commarNumber(option?.option_price)}
                        </>
                      ))}
                    </div>
                  </Stack>
                </>
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
      <TableCell>
        <Box sx={{ width: 96, textAlign: 'right' }}>
          <IncrementerButton
            quantity={order_count}
            type="cart_page"
            onDecrease={onDecrease}
            onIncrease={onIncrease}
            onQuantityChange={onQuantityChange}
            disabledDecrease={order_count <= 1}
            disabledIncrease={order_count >= available}
          />
        </Box>
      </TableCell>

      <TableCell align="right">{commarNumber(setProductPriceByLang(calculatorPrice(row), 'total', 'ko', currentLang?.value))} {getPriceUnitByLang(currentLang?.value)}</TableCell>

      <TableCell align="right">
        <IconButton onClick={onDelete}>
          <Iconify icon="eva:trash-2-outline" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
