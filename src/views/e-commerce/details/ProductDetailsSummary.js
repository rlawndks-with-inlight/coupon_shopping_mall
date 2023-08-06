import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { sentenceCase } from 'change-case';
// next
import { useRouter } from 'next/router';
// form
import { Controller, useForm } from 'react-hook-form';
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
} from '@mui/material';
// routes
// utils
import { fShortenNumber, fCurrency } from 'src/utils/formatNumber';
// _mock
// components
import Label from 'src/components/label/Label';
import Iconify from 'src/components/iconify/Iconify';
import { IncrementerButton } from 'src/components/custom-input';
import { ColorSinglePicker } from 'src/components/color-utils';
import { commarNumber } from 'src/utils/function';
import { themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import { toast } from 'react-hot-toast';
import { CheckoutBillingAddress, CheckoutCartProductList, CheckoutSteps, CheckoutSummary } from 'src/views/@dashboard/e-commerce/checkout';

// ----------------------------------------------------------------------

ProductDetailsSummary.propTypes = {
  cart: PropTypes.array,
  onAddCart: PropTypes.func,
  product: PropTypes.object,
  onGotoStep: PropTypes.func,
};
const STEPS = ['상품확인', '배송지 확인', '결제하기'];
export default function ProductDetailsSummary({ product, onAddCart, onGotoStep, ...other }) {
  const { themeCartData, onChangeCartData } = useSettingsContext();
  const [selectProduct, setSelectProduct] = useState({ id: product?.id, count: 1, select_option_obj: {} });
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
    groups = []
  } = product;

  const isMaxQuantity =
    cart.filter((item) => item.id === id).map((item) => item.quantity)[0] >= available;

  const handleAddCart = async () => {
    let cart_data = [...themeCartData];
    let select_product = { ...selectProduct };
    for (var i = 0; i < product?.groups.length; i++) {
      let group = product?.groups[i];
      if (!select_product.select_option_obj[group?.id]) {
        toast.error(`${group?.group_name}을(를) 선택해 주세요.`);
        return;
      }
    }
    let option_key_list = Object.keys(select_product.select_option_obj ?? {});
    let insert_item = true;
    let find_index = -1;
    for (var i = 0; i < cart_data.length; i++) {
      if (cart_data[i]?.id == select_product.id) {
        for (var j = 0; j < option_key_list.length; j++) {
          if (select_product.select_option_obj[option_key_list[j]]?.option_id != cart_data[i].select_option_obj[option_key_list[j]]?.option_id) {
            break;
          }
        }
        if (j == option_key_list.length) {
          insert_item = false;
          find_index = i;
          break;
        }
      }
    }
    if (insert_item) {
      cart_data.push(select_product);
    } else {
      cart_data[find_index].count = cart_data[find_index].count + select_product.count;
    }
    console.log(cart_data)
    onChangeCartData(cart_data);
    toast.success("장바구니에 성공적으로 추가되었습니다.")
  };
  const onSelectOption = (group, option) => {
    setSelectProduct({
      ...selectProduct,
      select_option_obj: {
        ...selectProduct.select_option_obj,
        [`${group?.id}`]: {
          option_id: option?.id,
          ...group
        }
      }
    });
  }
  const [buyStep, setBuyStep] = useState(0);
  const [buyOpen, setBuyOpen] = useState(false);
  const onBuyNow = () => {

  }
  const onBuyDialogClose = () => {
    setBuyOpen(false);
    setBuyStep(0);
  }
  return (
    <>
      <Dialog
        open={buyOpen}
        onClose={() => {
          onBuyDialogClose();
        }}
      >
        <DialogTitle>바로구매</DialogTitle>
        <DialogContent>
          <CheckoutSteps activeStep={buyStep} steps={STEPS} />
          {buyStep == 0 &&
            <>
              <DialogContentText>
                To subscribe to this website, please enter your email address here. We will send updates
                occasionally.
              </DialogContentText>
              <TextField
                autoFocus
                fullWidth
                type="email"
                margin="dense"
                variant="outlined"
                label="Email Address"
              />
            </>}
          {buyStep == 1 &&
            <>

            </>}
          {buyStep == 2 &&
            <>

            </>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onBuyDialogClose} color="inherit">
            나가기
          </Button>
        </DialogActions>
      </Dialog>
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
              sx={{
                color: status === 'sale' ? 'error.main' : 'info.main',
              }}
            >
              {status}
            </Typography>

            <Typography variant="h5">{product_name}</Typography>
            <Typography variant="h7" color={themeObj.grey[500]}>{product_comment}</Typography>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Rating value={product_average_scope / 2} precision={0.1} readOnly />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                ({commarNumber(product_average_scope / 2)})
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
          </Stack>
          <Divider sx={{ borderStyle: 'dashed' }} />
          {groups.map((group) => (
            <>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2" sx={{ height: 40, lineHeight: '40px', flexGrow: 1 }}>
                  {group?.group_name}
                </Typography>
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
                  onChange={(e) => {
                    onSelectOption(group, e.target.value)
                  }}
                >
                  {group?.options && group?.options.map((option) => (
                    <MenuItem key={option?.option_name} value={option}>
                      {option?.option_name}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </>
          ))}
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle2" sx={{ height: 36, lineHeight: '36px' }}>
              수량
            </Typography>

            <Stack spacing={1}>
              <IncrementerButton
                name="quantity"
                quantity={selectProduct.count}
                disabledDecrease={selectProduct.count <= 1}
                disabledIncrease={selectProduct.count >= available}
                onIncrease={() => {
                  setSelectProduct({
                    ...selectProduct,
                    count: selectProduct.count + 1
                  })
                }}
                onDecrease={() => {
                  setSelectProduct({
                    ...selectProduct,
                    count: selectProduct.count - 1
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
              disabled={isMaxQuantity}
              size="large"
              color="warning"
              variant="contained"
              startIcon={<Iconify icon="ic:round-add-shopping-cart" />}
              onClick={handleAddCart}
              sx={{ whiteSpace: 'nowrap' }}
            >
              장바구니
            </Button>

            <Button fullWidth size="large" variant="contained" onClick={() => setBuyOpen(true)}>
              바로구매
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
