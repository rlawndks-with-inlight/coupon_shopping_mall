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
  RadioGroup,
  Paper,
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
import { CheckoutSteps } from 'src/views/@dashboard/e-commerce/checkout';
import { test_address_list, test_pay_list } from 'src/data/test-data';
import { AddressItem } from 'src/views/shop/auth/cart/demo-1';
import EmptyContent from 'src/components/empty-content/EmptyContent';
import Payment from 'payment'
import Cards from 'react-credit-cards'
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { formatCreditCardNumber, formatExpirationDate } from 'src/utils/formatCard';
import { useModal } from "src/components/dialog/ModalProvider";
import { onPayItemByCard } from 'src/utils/api-shop';
import { insertCartDataUtil, selectItemOptionUtil } from 'src/utils/shop-util';
// ----------------------------------------------------------------------

ProductDetailsSummary.propTypes = {
  cart: PropTypes.array,
  onAddCart: PropTypes.func,
  product: PropTypes.object,
  onGotoStep: PropTypes.func,
};
const STEPS = ['배송지 확인', '결제하기'];
export default function ProductDetailsSummary({ product, onAddCart, onGotoStep, ...other }) {
  const { setModal } = useModal()
  const { themeCartData, onChangeCartData, themeDnsData } = useSettingsContext();
  const { user } = useAuthContext();
  const [addressList, setAddressList] = useState([]);
  const [selectAddress, setSelectAddress] = useState({});
  const [payList, setPayList] = useState([]);
  const [selectProductGroups, setSelectProductGroups] = useState({
    count: 1,
    groups: [],
  });
  const [payData, setPayData] = useState({
    brand_id: themeDnsData?.id,
    user_id: user?.id ?? undefined,
    product_id: product?.id,
    amount: product?.product_sale_price ?? 0,
    item_name: product?.product_name,
    buyer_name: user?.nick_name ?? "",
    installment: 0,
    buyer_phone: '',
    card_num: '',
    yymm: '',
    auth_num: '',
    card_pw: '',
    addr: "",
    detail_addr: '',
    temp: [],
    password: ""
  })
  const [cardFucus, setCardFocus] = useState()
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
  } = product;
  useEffect(() => {
    let address_list = test_address_list;
    setAddressList(address_list);
    let pay_list = test_pay_list;
    setPayList(pay_list)
  }, [])
  const isMaxQuantity =
    cart.filter((item) => item.id === id).map((item) => item.quantity)[0] >= available;
  const handleAddCart = async () => {
    let result = insertCartDataUtil(product, selectProductGroups, themeCartData, onChangeCartData);
    if (result) {
      toast.success("장바구니에 성공적으로 추가되었습니다.")
    }
  };
  const onSelectOption = (group, option, is_option_multiple) => {
    let select_product_groups = selectItemOptionUtil(group, option, selectProductGroups, is_option_multiple);
    setSelectProductGroups(select_product_groups);
  }
  const [buyStep, setBuyStep] = useState(0);
  const [buyOpen, setBuyOpen] = useState(false);
  const onBuyNow = async () => {
    let result = await onPayItemByCard(payData);
    console.log(result)
  }
  const onBuyDialogClose = () => {
    setBuyOpen(false);
    setBuyStep(0);
  }
  const onCreateBilling = (item) => {
    setSelectAddress(item);
    setPayData({
      ...payData,
      ['addr']: item?.address
    })
    setBuyStep(1);
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
              {addressList.length > 0 ?
                <>
                  {addressList.map((item, idx) => (
                    <>
                      <AddressItem
                        key={idx}
                        item={item}
                        onCreateBilling={() => onCreateBilling(item)}
                      />
                    </>
                  ))}
                </>
                :
                <>
                  <EmptyContent
                    title="배송지가 없습니다."
                    description="배송지를 추가해 주세요."
                    img=""
                  />
                </>}
            </>}
          {buyStep == 1 &&
            <>
              <RadioGroup row>
                <Stack spacing={3} sx={{ width: 1 }}>
                  {payList.map((item, idx) => (
                    <>
                      <Paper
                        variant="outlined"
                        sx={{ padding: '1rem', cursor: 'pointer' }}
                        onClick={() => {
                          if (idx == 0) {
                            setBuyStep(2);
                          }
                        }}
                      >
                        <Box sx={{ ml: 1 }}>
                          <Typography variant="subtitle2">{item.title}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {item.description}
                          </Typography>
                        </Box>
                      </Paper>
                    </>
                  ))}
                </Stack>
              </RadioGroup>
            </>}
          {buyStep == 2 &&
            <>
              <Stack spacing={2}>
                <Cards cvc={''} focused={cardFucus} expiry={payData.yymm} name={payData.buyer_name} number={payData.card_num} />
                <Stack>
                  <TextField
                    size='small'
                    label='카드 번호'
                    value={payData.card_num}
                    placeholder='0000 0000 0000 0000'
                    onChange={(e) => {
                      let value = e.target.value;
                      value = formatCreditCardNumber(value, Payment)
                      setPayData({
                        ...payData,
                        ['card_num']: value
                      })
                    }}
                  />
                </Stack>
                <Stack>
                  <TextField
                    size='small'
                    label='카드 사용자명'
                    value={payData.buyer_name}
                    onChange={(e) => {
                      let value = e.target.value;
                      setPayData({
                        ...payData,
                        ['buyer_name']: value
                      })
                    }}
                  />
                </Stack>
                <Stack>
                  <TextField
                    size='small'
                    label='만료일'
                    value={payData.yymm}
                    inputProps={{ maxLength: '5' }}
                    onChange={(e) => {
                      let value = e.target.value;
                      value = formatExpirationDate(value, Payment)
                      setPayData({
                        ...payData,
                        ['yymm']: value
                      })
                    }}
                  />
                </Stack>
                <Stack>
                  <TextField
                    size='small'
                    label='카드비밀번호 앞 두자리'
                    value={payData.card_pw}
                    type='password'
                    inputProps={{ maxLength: '2' }}
                    onChange={(e) => {
                      let value = e.target.value;
                      setPayData({
                        ...payData,
                        ['card_pw']: value
                      })
                    }}
                  />
                </Stack>
                <Stack>
                  <TextField
                    size='small'
                    label='구매자 휴대폰번호'
                    value={payData.buyer_phone}
                    onChange={(e) => {
                      let value = e.target.value;
                      setPayData({
                        ...payData,
                        ['buyer_phone']: value
                      })
                    }}
                  />
                </Stack>
                <Stack>
                  <TextField
                    size='small'
                    label='주민번호 또는 사업자등록번호'
                    value={payData.auth_num}
                    onChange={(e) => {
                      let value = e.target.value;
                      setPayData({
                        ...payData,
                        ['auth_num']: value
                      })
                    }}
                  />
                </Stack>
                {!user &&
                  <>
                    <Stack>
                      <TextField
                        size='small'
                        label='비회원주문 비밀번호'
                        type='password'
                        value={payData.password}
                        onChange={(e) => {
                          let value = e.target.value;
                          setPayData({
                            ...payData,
                            ['password']: value
                          })
                        }}
                      />
                    </Stack>
                  </>}
                <Stack>
                  <Button variant='contained' onClick={() => {
                    setModal({
                      func: () => { onBuyNow() },
                      icon: 'ion:card-outline',
                      title: '정말로 결제 하시겠습니까?'
                    })
                  }}>
                    결제하기
                  </Button>
                </Stack>
              </Stack>
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
            <Button fullWidth size="large" variant="contained" onClick={() => {

              setBuyOpen(true);
            }}>
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
