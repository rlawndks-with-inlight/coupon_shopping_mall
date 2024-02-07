import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Paper, Radio, RadioGroup, Select, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Row, Title, postCodeStyle, themeObj } from 'src/components/elements/styled-components';
import { CheckoutCartProductList, CheckoutSteps, CheckoutSummary } from 'src/views/@dashboard/e-commerce/checkout';
import styled from 'styled-components'
import _ from 'lodash'
import Label from 'src/components/label/Label';
import EmptyContent from 'src/components/empty-content/EmptyContent';
import Iconify from 'src/components/iconify/Iconify';
import { useSettingsContext } from 'src/components/settings';
import { calculatorPrice, getCartDataUtil, onPayProductsByAuth, onPayProductsByHand, onPayProductsByVirtualAccount } from 'src/utils/shop-util';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import Payment from 'payment'
import Cards from 'react-credit-cards'
import { formatCreditCardNumber, formatExpirationDate } from 'src/utils/formatCard';
import { useModal } from 'src/components/dialog/ModalProvider';
import toast from 'react-hot-toast';
import { bankCodeList, ntvFrnrList, genderList, telComList } from 'src/utils/format'
import { apiManager } from 'src/utils/api';
import DialogAddAddress from 'src/components/dialog/DialogAddAddress';
import axios from 'axios';
import { useLocales } from 'src/locales';

const Wrappers = styled.div`
max-width:1500px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`

export function AddressItem({ item, onCreateBilling, onDeleteAddress }) {

  const { translate } = useLocales();
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
                {translate('기본주소')}
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
            {translate('삭제')}
          </Button>
          <Button variant="outlined" size="small" onClick={onCreateBilling}>
            {translate('해당 주소로 배송하기')}
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
  const { translate } = useLocales();

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
    buyer_phone: user?.phone_num ?? "",
    card_num: '',
    yymm: '',
    auth_num: '',
    card_pw: '',
    addr: "",
    detail_addr: '',
    password: "",
    use_point: 0,
    bank_code: "",
    acct_num: "",
    ntv_frnr: '',
    gender: '',
    tel_com: '',
    check_virtual_auth_step: 0,
    check_virtual_auth_code: '',
  })
  const [payLoading, setPayLoading] = useState(false);

  const STEPS = [translate('장바구니 확인'), translate('배송지 확인'), translate('결제하기'),];


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
        toast.error(translate('최대사용가능 포인트를 초과하였습니다.'));
        return;
      }
      if (parseFloat(user?.point ?? 0) < parseFloat(payData.use_point)) {
        toast.error(translate('보유포인트가 부족합니다.'));
        return;
      }
      setPayLoading(true);
      let result = await onPayProductsByAuth(products, { ...payData, payment_modules: item, });
    } else if (item?.type == 'virtual_account') {
      setBuyType('virtual_account');
      setPayData({
        ...payData,
        payment_modules: item,
        buyer_name: '',
      })
      return;
    }
  }
  const onPayByHand = async () => {
    if (buyType == 'card') {//카드결제
      if (parseFloat(max_use_point) < parseFloat(payData.use_point)) {
        toast.error(translate('최대사용가능 포인트를 초과하였습니다.'));
        return;
      }
      if (parseFloat(user?.point ?? 0) < parseFloat(payData.use_point)) {
        toast.error(translate('보유포인트가 부족합니다.'));
        return;
      }
      setPayLoading(true);
      let result = await onPayProductsByHand(products, payData);
      if (result) {
        await onChangeCartData([]);
        toast.success(translate('성공적으로 구매에 성공하였습니다.'));
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
  const sendOneWonCheckAccrount = async () => {//1원인증
    if (!payData.bank_code) {
      return toast.error(translate('은행을 선택해 주세요.'));
    }
    if (!payData.acct_num) {
      return toast.error(translate('계좌번호를 입력해 주세요.'));
    }
    if (!payData.buyer_name) {
      return toast.error(translate('예금주를 입력해 주세요.'));
    }
    try {
      const { data: response } = await axios.post(`https://api.cashes.co.kr/api/v1/viss/acct`, {
        compUuid: 'HSTUWO',
        bankCode: payData.bank_code,
        acctNo: payData.acct_num,
        custNm: payData.buyer_name,
      })
      if (response?.code == '0000') {
        toast.success(translate('성공적으로 발송 되었습니다.'));
        setPayData({
          ...payData,
          check_virtual_auth_step: 1,
          verifyTrDt: response?.response?.verifyTrDt,
          verifyTrNo: response?.response?.verifyTrNo,
        })
        return;
      } else {
        return toast.error(response?.message);
      }
    } catch (err) {
      console.log(err);
    }
  }
  const checkOneWonCheckAccrount = async () => {//1원인증확인
    if (!payData.check_virtual_auth_code) {
      return toast.error(translate('인증코드를 입력해 주세요.'));
    }
    try {
      const { data: response } = await axios.post(`https://api.cashes.co.kr/api/v1/viss/confirm`, {
        compUuid: 'HSTUWO',
        verifyTrDt: payData.verifyTrDt,
        verifyTrNo: payData.verifyTrNo,
        verifyVal: payData.check_virtual_auth_code,
      })
      if (response?.code == '0000') {
        toast.success(translate('성공적으로 인증 되었습니다.'));
        setPayData({
          ...payData,
          check_virtual_auth_step: 2,
        })
        $('.dialog-content').scrollTop(100000);
      } else {
        return toast.error(response?.message);
      }
    } catch (err) {
      console.log(err);
    }
  }
  const checkRealNameVirtualAccount = async () => {
    if (!payData.auth_num) {
      return toast.error(translate('생년월일을 입력해 주세요.'));
    }
    try {
      const { data: response } = await axios.post(`https://api.cashes.co.kr/api/v1/viss/realDepositor`, {
        compUuid: 'HSTUWO',
        bankCode: payData.bank_code,
        acctNo: payData.acct_num,
        custNm: payData.buyer_name,
        regNo: payData.auth_num.substring(2, payData.auth_num.length),
      })
      if (response?.code == '0000') {
        toast.success(translate('성공적으로 인증 되었습니다.'));
        setPayData({
          ...payData,
          check_virtual_auth_step: 3,
          checkYn: response?.response?.checkYn,
        })
      } else {
        return toast.error(response?.message);
      }
    } catch (err) {
      console.log(err);
    }
  }
  const sendSmsPushVirtualAccount = async () => {
    try {
      const { data: response } = await axios.post(`https://api.cashes.co.kr/api/v1/viss/smsPush`, {
        compUuid: 'HSTUWO',
        custNm: payData.buyer_name,
        custBirth: payData.auth_num,
        sexCd: payData?.gender,
        ntvFrnrCd: payData?.ntv_frnr,
        telComCd: payData?.tel_com,
        telNo: payData.buyer_phone,
        agree1: 'Y',
        agree2: 'Y',
        agree3: 'Y',
        agree4: 'Y',
      })
      if (response?.code == '0000') {
        toast.success(translate('성공적으로 발송 되었습니다.'));
        setPayData({
          ...payData,
          txSeqNo: response?.response?.txSeqNo
        })
      } else {
        return toast.error(response?.message);
      }
    } catch (err) {
      console.log(err);
    }
  }
  const checkSmsVerityCodeVirtualAccount = async () => {
    try {
      const { data: response } = await axios.post(`https://api.cashes.co.kr/api/v1/viss/smsResult`, {
        compUuid: 'HSTUWO',
        txSeqNo: payData.txSeqNo,
        telNo: payData.buyer_phone,
        otpNo: payData.buyer_phone_check,
      })
      if (response?.code == '0000') {
        toast.success(translate('성공적으로 인증 되었습니다.'));
        setPayData({
          ...payData,
          check_virtual_auth_step: 4,
        })
      } else {
        return toast.error(response?.message);
      }
    } catch (err) {
      console.log(err);
    }
  }
  const requestVirtualAccount = async () => {
    try {
      let result = await onPayProductsByVirtualAccount(products, payData);
      setPayData(result)
    } catch (err) {
      console.log(err);
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
        <Title>{translate('장바구니')}</Title>
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
                      />
                    </>
                    :
                    <>
                      <EmptyContent
                        title={translate("장바구니가 비어 있습니다.")}
                        description={translate("장바구니에 상품을 채워 주세요.")}
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
                            title={translate("배송지가 없습니다.")}
                            description={translate("배송지를 추가해 주세요.")}
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
                      <CardHeader title={translate("결제 수단 선택")} />
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
                      <CardHeader title={translate("카드정보입력")} />
                      <CardContent>
                        <Stack spacing={2}>
                          <Cards cvc={''} focused={cardFucus} expiry={payData.yymm} name={payData.buyer_name} number={payData.card_num} />
                          <Stack>
                            <TextField
                              size='small'
                              label={translate('카드 번호')}
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
                              label={translate('카드 사용자명')}
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
                              label={translate('만료일')}
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
                              label={translate('카드비밀번호 앞 두자리')}
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
                              label={translate('구매자 휴대폰번호')}
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
                              label={translate('주민번호 또는 사업자등록번호')}
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
                                  label={translate('비회원주문 비밀번호')}
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
                                title: translate('정말로 결제 하시겠습니까?')
                              })
                            }}>
                              {translate('결제하기')}
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </>}
                  {(buyType == 'virtual_account') &&
                    <>
                      <CardContent>
                        <Typography variant='subtitle1' sx={{ borderBottom: `1px solid #000`, paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>{_.find(themeDnsData?.payment_modules, { type: buyType })?.title}</Typography>
                        <Stack spacing={2}>
                          {payData?.virtual_account_info ?
                            <>
                              <Row style={{ columnGap: '0.5rem' }}>
                                <Typography variant='subtitle2'>{translate("발급 번호")}</Typography>
                                <Typography variant='body2' sx={{ color: themeObj.grey[600] }}>{payData?.virtual_account_info?.virtual_acct_issued_seq}</Typography>
                              </Row>
                              <Row style={{ columnGap: '0.5rem' }}>
                                <Typography variant='subtitle2'>{translate('발급 은행')}</Typography>
                                <Typography variant='body2' sx={{ color: themeObj.grey[600] }}>{_.find(bankCodeList, { value: payData?.virtual_account_info?.virtual_bank_code })?.label}</Typography>
                              </Row>
                              <Row style={{ columnGap: '0.5rem' }}>
                                <Typography variant='subtitle2'>{translate('계좌번호')}</Typography>
                                <Typography variant='body2' sx={{ color: themeObj.grey[600] }}>{payData?.virtual_account_info?.virtual_acct_num}</Typography>
                              </Row>
                              <Row style={{ columnGap: '0.5rem' }}>
                                <Typography variant='subtitle2'>{translate('예금주명')}</Typography>
                                <Typography variant='body2' sx={{ color: themeObj.grey[600] }}>{payData?.buyer_name}</Typography>
                              </Row>
                              <Row style={{ columnGap: '0.5rem' }}>
                                <Typography variant='subtitle2'>{translate('입금예정금액')}</Typography>
                                <Typography variant='body2' sx={{ color: themeObj.grey[600] }}>{commarNumber(payData?.amount)}원</Typography>
                              </Row>
                            </>
                            :
                            <>
                              <Stack>
                                <Typography variant="subtitle2">
                                  {translate('본인확인')}
                                </Typography>
                              </Stack>
                              <Stack>
                                <FormControl size='small' disabled={payData.check_virtual_auth_step >= 2}>
                                  <InputLabel>{translate('은행')}</InputLabel>
                                  <Select label={translate('은행')} value={payData?.bank_code} onChange={(e) => {
                                    setPayData(
                                      {
                                        ...payData,
                                        ['bank_code']: e.target.value,
                                      }
                                    )
                                  }}>
                                    {bankCodeList.map((itm) => {
                                      return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                    })}
                                  </Select>
                                </FormControl>
                              </Stack>
                              <Stack>
                                <TextField
                                  disabled={payData.check_virtual_auth_step >= 2}
                                  size='small'
                                  label={translate('계좌번호')}
                                  value={payData.acct_num}
                                  onChange={(e) => {
                                    let value = e.target.value;
                                    setPayData({
                                      ...payData,
                                      ['acct_num']: value
                                    })
                                  }}
                                />
                              </Stack>
                              <Stack>
                                <TextField
                                  disabled={payData.check_virtual_auth_step >= 2}
                                  size='small'
                                  label={translate('예금주')}
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
                              {payData.check_virtual_auth_step >= 1 &&
                                <>
                                  <Stack>
                                    <TextField
                                      disabled={payData.check_virtual_auth_step >= 2}
                                      size='small'
                                      label={translate('인증코드')}
                                      value={payData.check_virtual_auth_code}
                                      onChange={(e) => {
                                        let value = e.target.value;
                                        setPayData({
                                          ...payData,
                                          ['check_virtual_auth_code']: value
                                        })
                                      }}
                                    />
                                  </Stack>
                                </>}
                              <Stack>
                                <Button
                                  variant='contained'
                                  disabled={payData.check_virtual_auth_step >= 2}
                                  onClick={() => {
                                    if (payData.check_virtual_auth_step == 0) {
                                      sendOneWonCheckAccrount();
                                    } else {
                                      checkOneWonCheckAccrount();
                                    }
                                  }}>
                                  {payData.check_virtual_auth_step == 0 ? translate('1원인증') : (payData.check_virtual_auth_step >= 2 ? translate('확인완료') : translate('확인'))}
                                </Button>
                              </Stack>
                              {payData.check_virtual_auth_step >= 2 &&
                                <>
                                  <Stack>
                                    <TextField
                                      disabled={payData.check_virtual_auth_step >= 3}
                                      size='small'
                                      label={translate('생년월일')}
                                      placeholder='19991010'
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
                                  <Stack>
                                    <Button
                                      variant='contained'
                                      disabled={payData.check_virtual_auth_step >= 3}
                                      onClick={checkRealNameVirtualAccount}>
                                      {(payData.check_virtual_auth_step == 2 ? translate('실명조회') : translate('확인완료'))}
                                    </Button>
                                  </Stack>
                                </>}
                              {payData.check_virtual_auth_step >= 3 &&
                                <>
                                  <Stack>
                                    <FormControl size='small'>
                                      <InputLabel>{translate('성별')}</InputLabel>
                                      <Select label={translate('성별')} value={payData?.gender}
                                        disabled={payData.check_virtual_auth_step >= 4}
                                        onChange={(e) => {
                                          setPayData(
                                            {
                                              ...payData,
                                              ['gender']: e.target.value,
                                            }
                                          )
                                        }}>
                                        {genderList.map((itm) => {
                                          return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                        })}
                                      </Select>
                                    </FormControl>
                                  </Stack>
                                  <Stack>
                                    <FormControl size='small' >
                                      <InputLabel>{translate('내외국인')}</InputLabel>
                                      <Select label={translate('내외국인')} value={payData?.ntv_frnr}
                                        disabled={payData.check_virtual_auth_step >= 4}
                                        onChange={(e) => {
                                          setPayData(
                                            {
                                              ...payData,
                                              ['ntv_frnr']: e.target.value,
                                            }
                                          )
                                        }}>
                                        {ntvFrnrList.map((itm) => {
                                          return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                        })}
                                      </Select>
                                    </FormControl>
                                  </Stack>
                                  <Stack>
                                    <FormControl size='small' >
                                      <InputLabel>{translate('통신사')}</InputLabel>
                                      <Select label={translate('통신사')} value={payData?.tel_com}
                                        disabled={payData.check_virtual_auth_step >= 4}
                                        onChange={(e) => {
                                          setPayData(
                                            {
                                              ...payData,
                                              ['tel_com']: e.target.value,
                                            }
                                          )
                                        }}>
                                        {telComList.map((itm) => {
                                          return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                        })}
                                      </Select>
                                    </FormControl>
                                  </Stack>
                                  <Stack>
                                    <TextField
                                      disabled={payData.check_virtual_auth_step >= 4}
                                      size='small'
                                      label={translate('전화번호')}
                                      value={payData.buyer_phone}
                                      onChange={(e) => {
                                        let value = e.target.value;
                                        setPayData({
                                          ...payData,
                                          ['buyer_phone']: value
                                        })
                                      }}
                                      InputProps={{
                                        endAdornment: <Button variant='contained' size='small' sx={{ width: '160px', marginRight: '-0.5rem' }}
                                          disabled={payData.check_virtual_auth_step >= 4}
                                          onClick={sendSmsPushVirtualAccount}>{payData.check_virtual_auth_step >= 4 ? translate('확인완료') : translate('인증번호 발송')}</Button>
                                      }}
                                    />
                                  </Stack>
                                  <Stack>
                                    <TextField
                                      disabled={payData.check_virtual_auth_step >= 4}
                                      size='small'
                                      label='인증번호'
                                      value={payData.buyer_phone_check}
                                      onChange={(e) => {
                                        let value = e.target.value;
                                        setPayData({
                                          ...payData,
                                          ['buyer_phone_check']: value
                                        })
                                      }}
                                      InputProps={{
                                        endAdornment: <Button variant='contained' size='small' sx={{ width: '160px', marginRight: '-0.5rem' }}
                                          disabled={payData.check_virtual_auth_step >= 4}
                                          onClick={checkSmsVerityCodeVirtualAccount}>{payData.check_virtual_auth_step >= 4 ? translate('확인완료') : translate('인증번호 확인')}</Button>
                                      }}
                                    />
                                  </Stack>
                                </>}
                              {payData.check_virtual_auth_step >= 4 &&
                                <>
                                  <Stack>
                                    <Button
                                      variant='contained'
                                      onClick={requestVirtualAccount}>
                                      {translate('발급신청')}
                                    </Button>
                                  </Stack>
                                </>}
                            </>}
                        </Stack>
                      </CardContent>
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
                  {translate('배송지 선택하기')}
                </Button>
              </>}
          </Grid>
        </Grid>
        {activeStep > 0 &&
          <>
            <Row style={{ width: '100%', justifyContent: 'space-between', maxWidth: '989px' }}>
              <Button startIcon={<Iconify icon="grommet-icons:form-previous" />} onClick={onClickPrevStep} variant="soft" size="small">
                {translate('이전 단계 돌아가기')}
              </Button>
              {activeStep == 1 &&
                <>
                  <Button
                    size="small"
                    variant="soft"
                    onClick={() => setAddAddressOpen(true)}
                    startIcon={<Iconify icon="eva:plus-fill" />}
                  >
                    {translate('배송지 추가하기')}
                  </Button>
                </>}
            </Row>
          </>}
      </Wrappers>
    </>
  )
}

export default CartDemo