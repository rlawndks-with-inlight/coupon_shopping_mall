import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
// @mui
import {
  Box,
  Link,
  Stack,
  Button,
  Rating,
  Divider,
  MenuItem,
  Typography,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  RadioGroup,
  Paper,
  Card,
  CircularProgress,
  Chip,
} from '@mui/material';
// routes
// utils
import { fCurrency } from 'src/utils/formatNumber';
// _mock
import Iconify from 'src/components/iconify/Iconify';
import { IncrementerButton } from 'src/components/custom-input';
import { ColorSinglePicker } from 'src/components/color-utils';
import { commarNumber, getProductStatus } from 'src/utils/function';
import { Row, postCodeStyle, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import { toast } from 'react-hot-toast';
import { CheckoutSteps } from 'src/views/@dashboard/e-commerce/checkout';
import { AddressItem } from 'src/views/shop/demo-1/auth/cart';
import EmptyContent from 'src/components/empty-content/EmptyContent';
import Payment from 'payment'
import Cards from 'react-credit-cards'
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { formatCreditCardNumber, formatExpirationDate } from 'src/utils/formatCard';
import { useModal } from "src/components/dialog/ModalProvider";
import { insertCartDataUtil, onPayProductsByAuth, onPayProductsByHand, selectItemOptionUtil } from 'src/utils/shop-util';
import DaumPostcode from 'react-daum-postcode';
import { apiManager } from 'src/utils/api';
import { useRouter } from 'next/router';
import DialogBuyNow from 'src/components/dialog/DialogBuyNow';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
// ----------------------------------------------------------------------

ProductDetailsSummary.propTypes = {
  cart: PropTypes.array,
  onAddCart: PropTypes.func,
  product: PropTypes.object,
  onGotoStep: PropTypes.func,
};

export default function ProductDetailsSummary({ product, onAddCart, onGotoStep, ...other }) {
  const router = useRouter();
  const { translate, currentLang } = useLocales();
  const { themeCartData, onChangeCartData, themeDirection } = useSettingsContext();

  const { user } = useAuthContext();
  const [selectProductGroups, setSelectProductGroups] = useState({
    count: 1,
    groups: [],
  });
  const cart = []

  const {
    id,
    name,
    sub_name,
    product_sale_price = 0,
    product_price = 0,
    sizes = [],
    price,
    cover,
    status,
    colors = [],
    available,
    priceSale,
    rating,
    product_average_scope,
    totalReview,
    inventoryType,
    inventory,
    product_name,
    product_comment,
    groups = [],
    delivery_fee,
    lang_obj
  } = product;

  const isMaxQuantity = cart.filter((item) => item.id === id).map((item) => item.quantity)[0] >= available;

  const handleAddCart = async () => {
    if (user) {
      let result = await insertCartDataUtil({ ...product, seller_id: router.query?.seller_id ?? 0 }, selectProductGroups, themeCartData, onChangeCartData);
      if (result) {
        toast.success(translate("장바구니에 성공적으로 추가되었습니다."))
      }
    } else {
      toast.error(translate('로그인을 해주세요.'));
    }

  };
  const onSelectOption = (group, option, is_option_multiple) => {
    let select_product_groups = selectItemOptionUtil(group, option, selectProductGroups, is_option_multiple);
    setSelectProductGroups(select_product_groups);
  }
  const [buyOpen, setBuyOpen] = useState(false);

  return (
    <>
      <DialogBuyNow
        buyOpen={buyOpen}
        setBuyOpen={setBuyOpen}
        product={product}
        selectProductGroups={selectProductGroups}
      />
      <form>
        <Stack
          spacing={3}
          sx={{
            p: (theme) => ({
              md: theme.spacing(5, 5, 0, 2),
            }),
          }}
          {...other}
        >
          <Stack spacing={2}>
            <Typography
              variant="overline"
              component="div"
            >
              <Chip label={translate(getProductStatus(status).text)} variant="soft" color={getProductStatus(status).color} />
            </Typography>
            <Typography variant="h5">{formatLang(product, 'product_name', currentLang)}</Typography>
            <Typography variant="h7" color={themeObj.grey[500]}>{formatLang(product, 'product_comment', currentLang)}</Typography>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Rating value={product_average_scope} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                ({commarNumber(product_average_scope)})
              </Typography>
            </Stack>
            <Typography variant="h4">
              {product_price > product_sale_price && (
                <Box
                  component="span"
                  sx={{ color: 'text.disabled', textDecoration: 'line-through', mr: 0.5 }}
                >
                  {fCurrency(product_price)}
                </Box>
              )}
              {commarNumber(product_sale_price)} 원
            </Typography>
            <Typography variant="h7" color={themeObj.grey[500]}>{translate('배송비')}: {commarNumber(delivery_fee)}원</Typography>
          </Stack>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {groups.map((group) => (
            <>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2" sx={{ height: 40, lineHeight: '40px', flexGrow: 1 }}>
                  {group?.group_name}
                </Typography>
                <FormControl size='small'>
                  <InputLabel id="demo-simple-select-label">{translate('선택')}</InputLabel>
                  <Select
                    name="size"
                    size="small"
                    sx={{
                      minWidth: 96,
                      '& .MuiFormHelperText-root': {
                        mx: 0,
                        mt: 1,
                        textAlign: 'right',
                      },
                    }}
                    label={translate("선택")}
                    onChange={(e) => {
                      onSelectOption(group, e.target.value)
                    }}
                  >
                    {group?.options && group?.options.map((option) => (
                      <MenuItem key={option?.option_name} value={option}>
                        {option?.option_name}
                        {(option?.option_price > 0 || option?.option_price < 0) ? ` (${option?.option_price > 0 ? '+' : ''}${commarNumber(option?.option_price)})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </>
          ))}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2" sx={{ height: 36, lineHeight: '36px' }}>
              {translate('수량')}
            </Typography>

            <Stack spacing={1}>
              <IncrementerButton
                name="quantity"
                quantity={selectProductGroups.count}
                disabledDecrease={selectProductGroups.count <= 1}
                disabledIncrease={selectProductGroups.count >= available}
                onIncrease={() => {
                  setSelectProductGroups({
                    ...selectProductGroups,
                    count: selectProductGroups.count + 1
                  })
                }}
                onDecrease={() => {
                  setSelectProductGroups({
                    ...selectProductGroups,
                    count: selectProductGroups.count - 1
                  })
                }}
              />
              {/* <Typography
              variant="caption"
              component="div"
              sx={{ textAlign: 'right', color: 'text.secondary' }}
            >
              재고: ss ({commarNumber(inventory)})
            </Typography> */}
            </Stack>
          </Stack>
          <Divider sx={{ borderStyle: 'dashed' }} />
          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              disabled={getProductStatus(status).color != 'info' || !(product_sale_price > 0)}
              size="large"
              color="warning"
              variant="contained"
              startIcon={<Iconify icon="ic:round-add-shopping-cart" />}
              onClick={handleAddCart}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {translate('장바구니')}
            </Button>
            <Button fullWidth disabled={getProductStatus(status).color != 'info' || !(product_sale_price > 0)} size="large" variant="contained" onClick={() => {
              setBuyOpen(true);
            }}>
              {translate('바로구매')}
            </Button>
          </Stack>
          <Stack direction="row" alignItems="center" justifyContent="center">
            {[].map((social) => (
              <IconButton key={social.name}>
                <Iconify icon={social.icon} />
              </IconButton>
            ))}
          </Stack>
        </Stack>
      </form>
    </>
  );
}
