import PropTypes from 'prop-types';
import { useEffect } from 'react';
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

// ----------------------------------------------------------------------

ProductDetailsSummary.propTypes = {
  cart: PropTypes.array,
  onAddCart: PropTypes.func,
  product: PropTypes.object,
  onGotoStep: PropTypes.func,
};

export default function ProductDetailsSummary({ product, onAddCart, onGotoStep, ...other }) {
  const cart = []
  const { push } = useRouter();

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
    product_comment
  } = product;
  const alreadyProduct = cart.map((item) => item.id).includes(id);

  const isMaxQuantity =
    cart.filter((item) => item.id === id).map((item) => item.quantity)[0] >= available;

  const defaultValues = {
    id,
    name,
    cover,
    available,
    price,
    colors: colors[0],
    size: sizes[4],
    quantity: available < 1 ? 0 : 1,
  };
  const methods = useForm({
    defaultValues,
  });

  const { reset, watch, control, setValue, handleSubmit } = methods;

  const values = watch();

  useEffect(() => {
    if (product) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const onSubmit = async (data) => {
    try {
      if (!alreadyProduct) {
        onAddCart({
          ...data,
          colors: [values.colors],
          subtotal: data.price * data.quantity,
        });
      }
      onGotoStep(0);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddCart = async () => {
    try {
      onAddCart({
        ...values,
        colors: [values.colors],
        subtotal: values.price * values.quantity,
      });
    } catch (error) {
      console.error(error);
    }
  };

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

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle2" sx={{ height: 40, lineHeight: '40px', flexGrow: 1 }}>
            사이즈
          </Typography>
          <Select
            name="size"
            size="small"
            helperText={
              <Link underline="always" color="inherit">
                Size Chart
              </Link>
            }
            sx={{
              maxWidth: 96,
              '& .MuiFormHelperText-root': {
                mx: 0,
                mt: 1,
                textAlign: 'right',
              },
            }}
          >
            {['라지', '스몰'].map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle2" sx={{ height: 36, lineHeight: '36px' }}>
            수량
          </Typography>

          <Stack spacing={1}>
            <IncrementerButton
              name="quantity"
              quantity={values.quantity}
              disabledDecrease={values.quantity <= 1}
              disabledIncrease={values.quantity >= available}
              onIncrease={() => setValue('quantity', values.quantity + 1)}
              onDecrease={() => setValue('quantity', values.quantity - 1)}
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

          <Button fullWidth size="large" type="submit" variant="contained">
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
