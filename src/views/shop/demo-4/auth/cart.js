import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControlLabel, Grid, Paper, Radio, RadioGroup, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Row, Title, postCodeStyle } from 'src/components/elements/styled-components';
import { CheckoutCartProductList, CheckoutSteps, CheckoutSummary } from 'src/views/@dashboard/e-commerce/checkout';
import styled from 'styled-components'
import _ from 'lodash'
import Label from 'src/components/label/Label';
import EmptyContent from 'src/components/empty-content/EmptyContent';
import Iconify from 'src/components/iconify/Iconify';
import { useSettingsContext } from 'src/components/settings';
import { calculatorPrice, getCartDataUtil, makePayData, onPayProductsByAuth, onPayProductsByHand } from 'src/utils/shop-util';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import Payment from 'payment'
import Cards from 'react-credit-cards'
import { formatCreditCardNumber, formatExpirationDate } from 'src/utils/formatCard';
import { useModal } from 'src/components/dialog/ModalProvider';
import toast from 'react-hot-toast';
import DaumPostcode from 'react-daum-postcode';
import { apiManager } from 'src/utils/api';
import DialogAddAddress from 'src/components/dialog/DialogAddAddress';

const Wrappers = styled.div`
max-width:1400px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`
const Iframe = styled.iframe`
border: none;
width: 100%;
`
const STEPS = ['장바구니 확인', '배송지 확인', '결제하기'];
export function AddressItem({ item, onCreateBilling, onDeleteAddress }) {
  const { receiver, addr, address_type, phone, is_default, detail_addr, id } = item;
  return (
    <Card
      sx={{
        p: 3,
        mb: 3,
      }}
    >
      <Stack
        spacing={2}
        alignItems={{
          md: 'flex-end',
        }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
      >
        <Stack flexGrow={1} spacing={1}>
          <Stack direction="row" alignItems="center">
            <Typography variant="subtitle1">
              {addr}
              {/* <Box component="span" sx={{ ml: 0.5, typography: 'body2', color: 'text.secondary' }}>
                (123)
              </Box> */}
            </Typography>
            {is_default && (
              <Label color="info" sx={{ ml: 1 }}>
                기본주소
              </Label>
            )}
          </Stack>
          {/* <Typography variant="body2">{addr}</Typography> */}
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {detail_addr}
          </Typography>
        </Stack>
        <Stack flexDirection="row" flexWrap="wrap" flexShrink={0}>
          <Button variant="outlined" size="small" color="inherit" sx={{ mr: 1 }} onClick={() => { onDeleteAddress(id) }}>
            삭제
          </Button>
          <Button variant="outlined" size="small" onClick={onCreateBilling}>
            해당 주소로 배송하기
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
const CartDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { setModal } = useModal()
  const { user } = useAuthContext();

  const { themeCartData, onChangeCartData, themeDnsData } = useSettingsContext();
  const { setting_obj } = themeDnsData;
  const { use_point_min_price = 0, max_use_point = 0, point_rate = 0 } = setting_obj;
  const [products, setProducts] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [buyType, setBuyType] = useState(undefined);
  const [cardFucus, setCardFocus] = useState();
  const [addressContent, setAddressContent] = useState({});
  const [addressSearchObj, setAddressSearchObj] = useState({
    page: 1,
    page_size: 10,
    search: '',
    user_id: user?.id,
  });
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [addAddressObj, setAddAddressObj] = useState({
    addr: '',
    detail_addr: '',
    is_open_daum_post: false,
  })
  const [payData, setPayData] = useState({
    brand_id: themeDnsData?.id,
    user_id: user?.id ?? undefined,
    //total_amount
    buyer_name: user?.nickname ?? "",
    ord_num: '',
    installment: 0,
    buyer_phone: '',
    card_num: '',
    yymm: '',
    auth_num: '',
    card_pw: '',
    addr: "",
    detail_addr: '',
    password: "",
    use_point: 0,
  })
  const [payLoading, setPayLoading] = useState(false);
  useEffect(() => {
    getCart();
  }, [])
  const getCart = async () => {
    let data = await getCartDataUtil(themeCartData);
    setProducts(data);
    onChangeAddressPage(addressSearchObj);
  }
  const onDelete = (idx) => {
    let product_list = [...products];
    product_list.splice(idx, 1);
    onChangeCartData(product_list);
    setProducts(product_list);
  }
  const onDecreaseQuantity = (idx) => {
    let product_list = [...products];
    product_list[idx].order_count--;
    setProducts(product_list)
  }
  const onIncreaseQuantity = (idx) => {
    let product_list = [...products];
    product_list[idx].order_count++;
    setProducts(product_list)
  }
  const onChangeQuantity = (idx, val) => {
    let product_list = [...products];
    product_list[idx].order_count = val;
    setProducts(product_list)
  }
  const onClickNextStep = () => {
    if (activeStep == 0) {

    }
    if (activeStep == 1) {

    }
    setActiveStep(activeStep + 1);
    scrollTo(0, 0)
  }
  const onClickPrevStep = () => {
    setActiveStep(activeStep - 1);
    scrollTo(0, 0)
  }
  const onCreateBilling = (item) => {
    setPayData({
      ...payData,
      addr: item?.addr,
      detail_addr: item?.detail_addr,
    })
    onClickNextStep();
  }
  const selectPayType = async (item) => {
    if (item?.type == 'card') {//카드결제
      setBuyType('card');
      setPayData({
        ...payData,
        payment_modules: item,
      })
    } else if (item?.type == 'certification') {
      if (parseFloat(max_use_point) < parseFloat(payData.use_point)) {
        toast.error('최대사용가능 포인트를 초과하였습니다.');
        return;
      }
      if (parseFloat(user?.point ?? 0) < parseFloat(payData.use_point)) {
        toast.error('보유포인트가 부족합니다.');
        return;
      }
      setPayLoading(true);
      let result = await onPayProductsByAuth(products, { ...payData, payment_modules: item, });
    } else if (item?.type == 'virtual_account') {
      setBuyType('virtual_account');
      let pay_data = await makePayData(products, payData);
      delete pay_data.payment_modules;
      let ord_num = `${pay_data?.user_id || pay_data?.password}${new Date().getTime().toString().substring(0, 11)}`;
      pay_data.ord_num = ord_num
      pay_data.item_name = `${pay_data?.products[0]?.order_name} 외 ${pay_data?.products?.length - 1}`;
      let link = _.find(themeDnsData?.payment_modules, { type: 'virtual_account' })?.virtual_acct_url + `?amount=${pay_data?.amount}`;
      const popup = window.open(link, ""); // 팝업을 미리 연다.
      popup.location.href = link;
      let insert_pay_ready = await apiManager('pays/virtual', 'create', pay_data)
      setPayData(pay_data)
      return;
    } else if (item?.type == 'gift_certificate') {
      setBuyType('gift_certificate');
      let pay_data = await makePayData(products, payData);
      delete pay_data.payment_modules;
      let ord_num = `${pay_data?.user_id || pay_data?.password}${new Date().getTime().toString().substring(0, 11)}`;
      pay_data.ord_num = ord_num
      pay_data.item_name = `${pay_data?.products[0]?.order_name} 외 ${pay_data?.products?.length - 1}`;
      let link = _.find(themeDnsData?.payment_modules, { type: 'gift_certificate' })?.gift_certificate_url + `?amount=${pay_data?.amount}`;
      const popup = window.open(link, ""); // 팝업을 미리 연다.
      popup.location.href = link;
      let insert_pay_ready = await apiManager('pays/gift_certificate', 'create', pay_data)
      setPayData(pay_data)
    }
  }
  const onPayByHand = async () => {
    if (buyType == 'card') {//카드결제
      if (parseFloat(max_use_point) < parseFloat(payData.use_point)) {
        toast.error('최대사용가능 포인트를 초과하였습니다.');
        return;
      }
      if (parseFloat(user?.point ?? 0) < parseFloat(payData.use_point)) {
        toast.error('보유포인트가 부족합니다.');
        return;
      }
      setPayLoading(true);
      let result = await onPayProductsByHand(products, payData);
      if (result) {
        await onChangeCartData([]);
        toast.success('성공적으로 구매에 성공하였습니다.');
        router.push('/shop/auth/history');
      }
    }
  }
  const onAddAddress = async (address_obj) => {
    let result = await apiManager('user-addresses', 'create', {
      ...address_obj,
      user_id: user?.id,
    })
    if (result) {
      setAddAddressOpen(false);
      onChangeAddressPage(addressSearchObj);
    }
  }
  const onDeleteAddress = async (id) => {
    let result = await apiManager('user-addresses', 'delete', {
      id: id
    })
    if (result) {
      onChangeAddressPage(addressSearchObj);
    }
  }
  const onChangeAddressPage = async (search_obj) => {
    setAddressContent({
      ...addressContent,
      content: undefined,
    })
    let data = await apiManager('user-addresses', 'list', search_obj);
    setAddressSearchObj(search_obj);
    if (data) {
      setAddressContent(data);
    }
  }

  return (
    <>
      <Dialog open={payLoading}
        onClose={() => {
          setPayLoading(false);
        }}
        PaperProps={{
          style: {
            background: 'transparent',
            overflow: 'hidden'
          }
        }}
      >
        <CircularProgress />
      </Dialog>
      <DialogAddAddress
        addAddressOpen={addAddressOpen}
        setAddAddressOpen={setAddAddressOpen}
        onAddAddress={onAddAddress}
      />
      <Wrappers>
        <Title>장바구니</Title>
        <CheckoutSteps activeStep={activeStep} steps={STEPS} />
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {activeStep == 0 &&
              <>
                <Card>
                  {products.length > 0 ?
                    <>
                      <CheckoutCartProductList
                        products={products}
                        onDelete={onDelete}
                        onDecreaseQuantity={onDecreaseQuantity}
                        onIncreaseQuantity={onIncreaseQuantity}
                        onChangeQuantity={onChangeQuantity}
                      />
                    </>
                    :
                    <>
                      <EmptyContent
                        title="장바구니가 비어 있습니다."
                        description="장바구니에 상품을 채워 주세요."
                        img="/assets/illustrations/illustration_empty_cart.svg"
                      />
                    </>}
                </Card>
              </>}
            {activeStep == 1 &&
              <>
                {addressContent?.content &&
                  <>
                    {addressContent?.content?.length > 0 ?
                      <>
                        {addressContent?.content && addressContent?.content.map((item, idx) => (
                          <>
                            <AddressItem
                              key={idx}
                              item={item}
                              onCreateBilling={() => onCreateBilling(item)}
                              onDeleteAddress={onDeleteAddress}
                            />
                          </>
                        ))}
                      </>
                      :
                      <>
                        <Card sx={{ marginBottom: '1.5rem' }}>
                          <EmptyContent
                            title="배송지가 없습니다."
                            description="배송지를 추가해 주세요."
                            img=""
                          />
                        </Card>
                      </>}
                  </>}

              </>}
            {activeStep == 2 &&
              <>
                <Card sx={{ marginBottom: '1.5rem' }}>
                  {!buyType &&
                    <>
                      <CardHeader title="결제 수단 선택" />
                      <CardContent>
                        <RadioGroup row>
                          <Stack spacing={3} sx={{ width: 1 }}>
                            {themeDnsData?.payment_modules.map((item, idx) => (
                              <>
                                <Paper
                                  variant="outlined"
                                  sx={{ padding: '1rem', cursor: 'pointer' }}
                                  onClick={() => {
                                    selectPayType(item)
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
                      </CardContent>
                    </>}
                  {buyType == 'card' &&
                    <>
                      <CardHeader title="카드정보입력" />
                      <CardContent>
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
                                  inputProps={{ maxLength: '6' }}
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
                                func: () => { onPayByHand() },
                                icon: 'ion:card-outline',
                                title: '정말로 결제 하시겠습니까?'
                              })
                            }}>
                              결제하기
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </>}
                  {buyType == 'virtual_account' &&
                    <>
                      <Iframe src={_.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_url + `?amount=${payData?.amount}`} />
                    </>}
                </Card>
              </>}
          </Grid>
          <Grid item xs={12} md={4}>
            <CheckoutSummary
              enableDiscount
              themeDnsData={themeDnsData}
              payData={payData}
              setPayData={setPayData}
              total={_.sum(_.map(products, (item) => { return calculatorPrice(item, payData).total })) - payData?.use_point}
              discount={_.sum(_.map(products, (item) => { return calculatorPrice(item, payData).discount }))}
              subtotal={_.sum(_.map(products, (item) => { return calculatorPrice(item, payData).subtotal }))}
            />
            {activeStep == 0 &&
              <>
                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  disabled={_.sum(_.map(products, (item) => { return item.quantity * item.product_sale_price })) <= 0}
                  onClick={onClickNextStep}
                >
                  {'배송지 선택하기'}
                </Button>
              </>}
          </Grid>
        </Grid>
        {activeStep > 0 &&
          <>
            <Row style={{ width: '100%', justifyContent: 'space-between', maxWidth: '989px' }}>
              <Button startIcon={<Iconify icon="grommet-icons:form-previous" />} onClick={onClickPrevStep} variant="soft" size="small">
                이전 단계 돌아가기
              </Button>
              {activeStep == 1 &&
                <>
                  <Button
                    size="small"
                    variant="soft"
                    onClick={() => setAddAddressOpen(true)}
                    startIcon={<Iconify icon="eva:plus-fill" />}
                  >
                    배송지 추가하기
                  </Button>
                </>}
            </Row>
          </>}
      </Wrappers>
    </>
  )
}

export default CartDemo