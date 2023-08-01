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

// ----------------------------------------------------------------------

ProductDetailsSummary.propTypes = {
  cart: PropTypes.array,
  onAddCart: PropTypes.func,
  product: PropTypes.object,
  onGotoStep: PropTypes.func,
};

export default function ProductDetailsSummary({ product, onAddCart, onGotoStep, ...other }) {
  const {themeCartData, onChangeCartData} = useSettingsContext();
  const [selectProduct, setSelectProduct] = useState({id:product?.id, count: 1, select_option_obj:{}});
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
      let cart_data = themeCartData;
      console.log(cart_data)
      let find_index = _.findIndex(cart_data, {id:selectProduct.id, select_option_obj:selectProduct.select_option_obj});
      if(find_index >= 0){
        cart_data[find_index].count = cart_data[find_index].count + selectProduct.count
      }else{
        cart_data.push(selectProduct);
      }
      onChangeCartData(cart_data);
  };
  const onSelectOption = (group_id, option_id) => {
    setSelectProduct({
      ...selectProduct,
      ['select_option_obj']:{
        ...selectProduct.select_option_obj,
        [`${group_id}`]: option_id
      }
    })
  }
  return (
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
            <Rating value={rating} precision={0.1} readOnly />

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              ({commarNumber(rating)})
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
                  onChange={(e)=>{
                    onSelectOption(group?.id, e.target.value)
                  }}
                >
                  {group?.options && group?.options.map((option) => (
                    <MenuItem key={option?.option_name} value={option?.id}>
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
              onIncrease={() =>  {
                setSelectProduct({
                  ...selectProduct,
                  count: selectProduct.count + 1
                })
              }}
              onDecrease={() =>  {
                setSelectProduct({
                  ...selectProduct,
                  count: selectProduct.count - 1
                })
              }}
            />

            <Typography
              variant="caption"
              component="div"
              sx={{ textAlign: 'right', color: 'text.secondary' }}
            >
              재고: ({commarNumber(inventory)})
            </Typography>
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

          <Button fullWidth size="large" variant="contained">
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
  );
}
