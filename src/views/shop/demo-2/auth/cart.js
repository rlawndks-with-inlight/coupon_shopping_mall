import { Box, Button, Card, CardContent, CardHeader, CircularProgress, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Paper, Radio, RadioGroup, Select, Stack, TextField, Typography } from '@mui/material';
import { makeOrdNum } from 'src/utils/function';
import { useEffect, useMemo, useState } from 'react';
import { Row, Title, postCodeStyle, themeObj } from 'src/components/elements/styled-components';
import { CheckoutCartProductList, CheckoutSteps, CheckoutSummary } from 'src/views/@dashboard/e-commerce/checkout';
import styled from 'styled-components'
import _ from 'lodash'
import Label from 'src/components/label/Label';
import EmptyContent from 'src/components/empty-content/EmptyContent';
import Iconify from 'src/components/iconify/Iconify';
import { useSettingsContext } from 'src/components/settings';
import { calcOrderTotals, calculatorPrice, getCartDataUtil, makePayData, onPayProductsByAuth, onPayProductsByForspay, onPayProductsByHand, onPayProductsByPayletter, onPayProductsByVirtualAccount } from 'src/utils/shop-util';
import { syncCartWithServer, makeUnavailableMessage, filterUnavailableByProducts } from 'src/utils/cart-sync';
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
import PayProductsByAuthHecto from 'src/utils/hecto-auth';
import PayProductsByPhoneHecto from 'src/utils/hecto-phone';
import PayProductsByHandFintree from 'src/utils/fintree-hand';
import PayProductsByAuthFintree from 'src/utils/fintree-auth';
import PayProductsByAuthWayup from 'src/utils/wayup-auth';

// demo-2 브랜드 무드: 넓은 여백 + 얇은 구분선 + 미니멀 아웃라인 카드 (item/[id].js, header.js 톤과 일치)
const Wrappers = styled.div`
max-width:1200px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:76vh;
margin-bottom:10vh;
`
const Iframe = styled.iframe`
border: none;
width: 100%;
`
// demo-2 카드 톤: 그림자 대신 얇은 경계선
const softCardSx = {
  boxShadow: 'none',
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: 2,
};
export function AddressItem({ item, onCreateBilling, onDeleteAddress, onUpdateAddress }) {

  const { translate } = useLocales();
  const { receiver, addr, address_type, phone, is_default, detail_addr, id } = item;
  const { themeDnsData } = useSettingsContext();

  return (
    <Card
      sx={{
        p: 3,
        mb: 3,
        ...softCardSx,
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
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
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
          {/* 배송지 '수정' — 예전엔 브랜드74 에서만 보였다. 삭제는 되는데 수정이 안 돼
              주소를 고치려면 지웠다 다시 등록해야 했다. 전 브랜드 공통으로 연다. */}
            <Button variant="outlined" size="small" color="inherit" sx={{ mr: 1 }} onClick={() => { onUpdateAddress(id); }}>
              {translate('수정')}
            </Button>
          <Button variant="contained" size="small" color="inherit" sx={{ fontWeight: 600 }} onClick={onCreateBilling}>
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
  const mainColor = themeDnsData?.theme_css?.main_color;
  const [products, setProducts] = useState([]);
  // 서버가 '지금 살 수 없다'고 알려준 라인(품절·판매중단·내려간 상품).
  // 화면에 남아 있는 상품하고만 대조해서 쓴다 — 안내를 보고 지우면 그 즉시 사라져야 한다.
  // (토스트는 사라지므로 안내를 화면에도 남긴다)
  const [unavailableRaw, setUnavailableRaw] = useState([]);
  const unavailable = useMemo(() => filterUnavailableByProducts(unavailableRaw, products), [unavailableRaw, products]);
  const [activeStep, setActiveStep] = useState(0);
  const [buyType, setBuyType] = useState(undefined);
  const [smsPayData, setSmsPayData] = useState({ name: '', phone_num: '' });
  const [cardFucus, setCardFocus] = useState();
  const [addressContent, setAddressContent] = useState({});
  const [addressSearchObj, setAddressSearchObj] = useState({
    page: 1,
    page_size: 10,
    search: '',
    user_id: user?.id,
  });
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  // 배송지 수정 — 기능(DialogAddAddress type='update')은 이미 있는데 이 화면만 배선이 빠져
  //   '수정' 버튼이 undefined 를 호출했다. 프레임3(demo-4) 과 동일하게 연결한다.
  const [updateAddressOpen, setUpdatedAddressOpen] = useState(false);
  const [addressID, setAddressID] = useState();
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

  // 카트 금액 계산 — 주문서/실제 청구(makePayData)와 같은 함수를 쓴다.
  // 예전엔 CheckoutSummary 에 shipping/shipActive 를 안 넘겨 옛 폴백 분기를 탔고,
  // 이미 상품별 배송비가 포함된 합계 위에 브랜드 배송비를 한 번 더 얹었다(이중 부과).
  // 무료배송 판정 기준도 '상품가+배송비'라 주문서('상품가만')와 결과가 뒤집혔다.
  const cartTotals = calcOrderTotals(products, payData?.use_point);

  const STEPS = [translate('장바구니 확인'), translate('배송지 확인'), translate('결제하기'),];


  useEffect(() => {
    getCart();
  }, [])
  const getCart = async () => {
    let data = await getCartDataUtil(themeCartData);
    setProducts(data);
    // 담을 때 저장한 가격 스냅샷이 낡으면 결제 직전 서버 금액검증(recalcOrderAmount)에서 거절된다.
    // 장바구니를 열 때 서버의 현재 값으로 갱신하고 저장소(localStorage)까지 반영해
    // '새로고침해도 옛 가격이 그대로 복원되는' 상태를 끊는다. 금액 계산식 자체는 건드리지 않는다.
    // 빈 장바구니면 서버에 물어볼 것도, 저장소에 덮어쓸 것도 없다.
    let sync = (data?.length > 0) ? await syncCartWithServer(data) : null;
    if (sync && !sync.failed) {
      setProducts(sync.items);
      onChangeCartData(sync.items);
      // 조회에 실패한 라인(타임아웃·500)은 sync.unavailable 에 들어오지 않는다.
      // 일시적 실패를 '판매하지 않는 상품'으로 낙인찍지 않기 위해서다.
      setUnavailableRaw(sync.unavailable);
      if (sync.unavailable.length > 0) {
        toast.error(makeUnavailableMessage(sync.unavailable));
      } else if (sync.priceChanged) {
        toast(translate('상품 가격이 변경되어 최신 금액으로 갱신했습니다.'));
      }
    }
    onChangeAddressPage(addressSearchObj);
  }
  const onDelete = (idx) => {
    let product_list = [...products];
    product_list.splice(idx, 1);
    onChangeCartData(product_list);
    setProducts(product_list);
  }
  // 수량 변경도 저장소에 반영한다.
  //
  // 예전엔 setProducts 만 하고 onChangeCartData 를 안 불렀다(같은 파일 onDelete 는 부른다).
  // 그래서 수량을 바꾸고 새로고침하거나 다른 화면을 거쳐 돌아오면 원래 수량으로 되돌아갔고,
  // 주문서로 넘어갈 때도 저장소 값을 다시 읽어 바꾼 수량이 반영되지 않았다.
  //
  // 요소를 in-place 로 고치지 않고 새 객체로 교체한다 — 얕은 복사만 하면 같은 요소를
  // 가리키므로 React 가 변화를 못 알아채는 경우가 생긴다.
  const setQuantity = (idx, next) => {
    const count = Math.max(1, parseInt(next) || 1);
    const product_list = products.map((item, i) => (i == idx ? { ...item, order_count: count } : item));
    onChangeCartData(product_list);
    setProducts(product_list);
  }
  const onDecreaseQuantity = (idx) => setQuantity(idx, (products[idx]?.order_count ?? 1) - 1);
  const onIncreaseQuantity = (idx) => setQuantity(idx, (products[idx]?.order_count ?? 1) + 1);
  const onChangeQuantity = (idx, val) => setQuantity(idx, val);
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
    // 구매할 수 없는 상품(품절·판매중단·내려간 상품)이 남아 있으면 결제로 넘어가지 않는다.
    // 공용 주문서(OrderSheet)에는 이 차단이 있었는데 장바구니 화면에는 없어서,
    // 여기서 결제를 시작하면 서버가 거절할 때까지 갔다가 이유를 알 수 없는 실패만 봤다.
    // unavailable 은 화면에 남은 라인에서 파생되므로, 안내대로 지우면 즉시 풀린다.
    if (unavailable.length > 0) {
      toast.error(makeUnavailableMessage(unavailable));
      return;
    }
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
      if ((setting_obj?.point_policy_type ?? 'instant') === 'accumulate' && parseFloat(payData.use_point || 0) > 0 && parseFloat(user?.point ?? 0) < parseFloat(setting_obj?.point_use_min || 0)) {
        toast.error(translate('적립 포인트가 최소 사용 기준에 도달하지 않았습니다.'));
        return;
      }
      if (parseFloat(user?.point ?? 0) < parseFloat(payData.use_point)) {
        toast.error(translate('보유포인트가 부족합니다.'));
        return;
      }
      setPayLoading(true);
      let result = await onPayProductsByAuth(products, { ...payData, payment_modules: item, }, 'payvery');
    } else if (item?.type == 'card_fintree') {//카드결제 핀트리
      setBuyType('card_fintree');
      setActiveStep(2);
    } else if (item?.type == 'certification_fintree') {
      setBuyType('certification_fintree');
      setActiveStep(2);
    } else if (item?.type == 'virtual_account') {
      setBuyType('virtual_account');
      // 장바구니의 카트 배열을 그대로 넘긴다. 예전엔 상품상세 바로구매에서 복사해 온
      // product_item / select_product_groups 를 썼는데 이 화면엔 그런 변수가 없어
      // 고객이 무통장입금을 고르는 순간 터졌다.
      let pay_data = await makePayData(products, payData);
      delete pay_data.payment_modules;
      let ord_num = makeOrdNum();
      pay_data.ord_num = ord_num
      pay_data.item_name = pay_data?.products?.length > 1 ? `${pay_data?.products[0]?.order_name} 외 ${pay_data?.products?.length - 1}건` : (pay_data?.products[0]?.order_name || translate('상품'));
      let link = _.find(themeDnsData?.payment_modules, { type: 'virtual_account' })?.virtual_acct_url + `?amount=${pay_data?.amount}`;
      if (_.find(themeDnsData?.payment_modules, { type: 'virtual_account' })?.virtual_acct_url) {
        const popup = window.open(link, ""); // 팝업을 미리 연다.
        popup.location.href = link;
      }
      let insert_pay_ready = await apiManager('pays/virtual', 'create', pay_data)
      setActiveStep(2);
      setPayData(pay_data)
    }
    else if (item?.type == 'gift_certificate') {
      setBuyType('gift_certificate');
      let pay_data = await makePayData(products, payData);
      delete pay_data.payment_modules;
      let ord_num = makeOrdNum();
      pay_data.ord_num = ord_num
      pay_data.item_name = pay_data?.products?.length > 1 ? `${pay_data?.products[0]?.order_name} 외 ${pay_data?.products?.length - 1}건` : (pay_data?.products[0]?.order_name || translate('상품'));
      let link = _.find(themeDnsData?.payment_modules, { type: 'gift_certificate' })?.gift_certificate_url + `?amount=${pay_data?.amount}&name=${user?.name ?? ""}&phone_num=${user?.phone_num ?? ""}`;
      const popup = window.open(link, ""); // 팝업을 미리 연다.
      popup.location.href = link;
      let insert_pay_ready = await apiManager('pays/gift_certificate', 'create', pay_data)
      setActiveStep(2);
      setPayData(pay_data)
    }
    else if (item?.type == 'certification_weroute') {
      setBuyType('certification_weroute');
      setPayLoading(true);
      let result = await onPayProductsByAuth(products, { ...payData, payment_modules: item }, 'weroute');
    } else if (item?.type == 'card_hecto') {
      setBuyType('card_hecto');
      setActiveStep(2)
    } else if (item?.type == 'phone_hecto') {
      setBuyType('phone_hecto');
      setActiveStep(2)
    } else if (item?.type == 'card_payletter') {
      setBuyType('card_payletter');
      let result = await onPayProductsByPayletter(products, { ...payData, payment_modules: item });
    } else if (item?.type == 'auth_forspay') {
      setBuyType('auth_forspay');
      let result = await onPayProductsByForspay(products, { ...payData, payment_modules: item });
    } else if (item?.type == 'sms_pay') {
      setBuyType('sms_pay');
      setActiveStep(2);
    }
  }
  const onPayByHand = async () => {
    // 구매할 수 없는 상품(품절·판매중단·내려간 상품)이 남아 있으면 결제로 넘어가지 않는다.
    // 공용 주문서(OrderSheet)에는 이 차단이 있었는데 장바구니 화면에는 없어서,
    // 여기서 결제를 시작하면 서버가 거절할 때까지 갔다가 이유를 알 수 없는 실패만 봤다.
    // unavailable 은 화면에 남은 라인에서 파생되므로, 안내대로 지우면 즉시 풀린다.
    if (unavailable.length > 0) {
      toast.error(makeUnavailableMessage(unavailable));
      return;
    }
    if (buyType == 'card') {//카드결제
      if (parseFloat(max_use_point) < parseFloat(payData.use_point)) {
        toast.error(translate('최대사용가능 포인트를 초과하였습니다.'));
        return;
      }
      if ((setting_obj?.point_policy_type ?? 'instant') === 'accumulate' && parseFloat(payData.use_point || 0) > 0 && parseFloat(user?.point ?? 0) < parseFloat(setting_obj?.point_use_min || 0)) {
        toast.error(translate('적립 포인트가 최소 사용 기준에 도달하지 않았습니다.'));
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
    let result = await apiManager('user-addresses', (address_obj?.id > 0 ? 'update' : 'create'), {
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

  const onUpdateAddress = async (id) => {
    setAddressID(id);
    setUpdatedAddressOpen(true);
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
      <DialogAddAddress
        addAddressOpen={updateAddressOpen}
        setAddAddressOpen={setUpdatedAddressOpen}
        onAddAddress={onAddAddress}
        type={'update'}
        id={addressID}
        onDeleteAddress={onDeleteAddress}
        onUpdateAddress={onUpdateAddress}
      />
      <Wrappers>
        <Typography variant="h4" sx={{ fontWeight: 700, mt: 8, mb: 2 }}>
          {translate('장바구니')}
        </Typography>
        <Divider sx={{ mb: 4, borderColor: mainColor || 'divider' }} />
        <Box sx={{ mb: 4 }}>
          {/* 결제는 공용 주문서(/shop/auth/order)에서 한다 — 여기 3단계 진행바는 맞지 않는다 */}
          {false && <CheckoutSteps activeStep={activeStep} steps={STEPS} />}
        </Box>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {activeStep == 0 &&
              <>
                <Card sx={softCardSx}>
                  {products.length > 0 ?
                    <>
                      {unavailable.length > 0 &&
                        <Box sx={{ mx: 2, mt: 2, p: 1.5, borderRadius: 1, bgcolor: 'error.lighter' }}>
                          <Typography variant="body2" sx={{ color: 'error.main' }}>
                            {makeUnavailableMessage(unavailable)}
                          </Typography>
                        </Box>}
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
                        <Card sx={{ marginBottom: '1.5rem', ...softCardSx }}>
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
                <Card sx={{ marginBottom: '1.5rem', ...softCardSx }}>
                  {!buyType &&
                    <>
                      <CardHeader title={translate("결제 수단 선택")} titleTypographyProps={{ variant: 'h6', fontWeight: 700 }} />
                      <CardContent>
                        <RadioGroup row>
                          <Stack spacing={2} sx={{ width: 1 }}>
                            {themeDnsData?.payment_modules.map((item, idx) => (
                              <>
                                <Paper
                                  variant="outlined"
                                  sx={{
                                    padding: '1.25rem',
                                    cursor: 'pointer',
                                    borderRadius: 2,
                                    transition: '0.2s',
                                    '&:hover': {
                                      borderColor: mainColor || 'text.primary',
                                    },
                                  }}
                                  onClick={() => {
                                    selectPayType(item)
                                  }}
                                >
                                  <Box sx={{ ml: 1 }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{translate(item.title)}</Typography>
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                      {translate(item.description)}
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
                      <CardHeader title={translate("카드정보입력")} titleTypographyProps={{ variant: 'h6', fontWeight: 700 }} />
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
                            <Button variant='contained' color='inherit' size='large' sx={{ fontWeight: 600 }} onClick={() => {
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
                        {
                          _.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_bank && _.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_name && _.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_num
                            ?
                            <Stack spacing={1.5}>
                              <Typography variant="body1">
                                은행 : {_.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_bank}
                              </Typography>
                              <Typography variant="body1">
                                예금주 : {_.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_name}
                              </Typography>
                              <Typography variant="body1">
                                계좌번호 : {_.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_num}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>{translate('입금 후 1일 안에 구매처리됩니다.')}</Typography>
                            </Stack>
                            :
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{translate('무통장입금을 준비중입니다...')}</Typography>
                        }
                        {/* <Iframe src={_.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_url + `?amount=${payData?.amount}`} /> */}
                      </CardContent>
                    </>}
                  {(buyType == 'gift_certificate') &&
                    <>
                      <CardContent>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>{translate('상품권 결제 준비중입니다...')}</Typography>
                        {/* <Iframe src={_.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_url + `?amount=${payData?.amount}`} /> */}
                      </CardContent>
                    </>}
                  {
                    buyType == 'card_fintree' &&
                    <>
                      <CardContent>
                        <Typography variant='h6' sx={{ fontWeight: 700, borderBottom: `1px solid`, borderColor: 'divider', paddingBottom: '0.75rem', marginBottom: '1rem' }}>{translate(_.find(themeDnsData?.payment_modules, { type: buyType })?.title || '')}</Typography>
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
                              label={themeDnsData?.blog_demo_num > 0 ? translate('주민번호 앞 6자리(생년월일)') : translate('주민번호 또는 사업자등록번호')}
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
                            <PayProductsByHandFintree
                              props={[products, payData, undefined]}
                            />
                          </Stack>
                        </Stack>
                      </CardContent>
                    </>
                  }
                  {
                    buyType == 'certification_fintree' &&
                    <>
                      <div style={{ margin: '2rem' }}>
                        <PayProductsByAuthFintree
                          props={[products, payData]}
                        />
                      </div>
                    </>
                  }
                  {
                    buyType == 'card_hecto' &&
                    <>
                      <div style={{ margin: '2rem' }}>
                        <PayProductsByAuthHecto
                          props={[products, payData]}
                        />
                      </div>
                    </>
                  }
                  {
                    buyType == 'phone_hecto' &&
                    <>
                      <div style={{ margin: '2rem' }}>
                        <PayProductsByPhoneHecto
                          props={[products, payData]}
                        />
                      </div>
                    </>
                  }
                  {
                    buyType == 'certification_wayup' &&
                    <>
                      <div style={{ margin: '2rem' }}>
                        <PayProductsByAuthWayup
                          props={[products, payData]}
                        />
                      </div>
                    </>
                  }
                  {
                    buyType == 'sms_pay' &&
                    <>
                      <CardHeader title={translate('SMS결제 정보입력')} titleTypographyProps={{ variant: 'h6', fontWeight: 700 }} />
                      <CardContent>
                        <Stack spacing={2}>
                          <TextField
                            size='small'
                            label={translate('이름')}
                            value={smsPayData.name}
                            onChange={(e) => {
                              setSmsPayData({ ...smsPayData, name: e.target.value });
                            }}
                          />
                          <TextField
                            size='small'
                            label={translate('핸드폰번호')}
                            value={smsPayData.phone_num}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^0-9]/g, '');
                              setSmsPayData({ ...smsPayData, phone_num: value });
                            }}
                            inputProps={{ maxLength: 11 }}
                            placeholder='01012345678'
                          />
                          <Button
                            variant='contained'
                            color='inherit'
                            size='large'
                            sx={{ fontWeight: 600 }}
                            onClick={() => {
                              if (!smsPayData.name) {
                                toast.error(translate('이름을 입력해 주세요.'));
                                return;
                              }
                              if (!smsPayData.phone_num || smsPayData.phone_num.length < 10) {
                                toast.error(translate('핸드폰번호를 정확히 입력해 주세요.'));
                                return;
                              }
                              toast.success(translate('결제 신청이 완료되었습니다.'));
                              setSmsPayData({ name: '', phone_num: '' });
                              router.push('/shop/auth/sms-pay-success');
                            }}
                          >{translate('완료')}</Button>
                        </Stack>
                      </CardContent>
                    </>
                  }
                </Card>
              </>}
          </Grid>
          <Grid item xs={12} md={4}>
            <CheckoutSummary
              enableDiscount
              // 카트의 use_point 는 주문서로 전달되지 않아 입력해도 버려진다. 포인트는 주문서에서만 입력받는다.
              enablePoint={false}
              themeDnsData={themeDnsData}
              payData={payData}
              setPayData={setPayData}
              // 배송비/최종금액을 calcOrderTotals 로 계산해 넘긴다(옛 폴백 분기의 배송비 이중 부과 제거).
              total={cartTotals.amount}
              shipping={cartTotals.delivery}
              shipActive={cartTotals.shipActive}
              // '총액'은 할인 전 상품가(배송비 제외) = merchTotal(할인가) + 할인액.
              // 화면에서 '총액 − 할인 + 배송비 = 총 결제금액' 이 맞아떨어진다.
              subtotal={cartTotals.merchTotal + _.sum(_.map(products, (item) => calculatorPrice(item).discount))}
              discount={_.sum(_.map(products, (item) => calculatorPrice(item).discount))}
            />
            {activeStep == 0 &&
              <>
                <Button
                  fullWidth
                  size="large"
                  type="submit"
                  variant="contained"
                  color="inherit"
                  sx={{ fontWeight: 600 }}
                  // 빈 장바구니에서 주문하기가 눌리지 않게 한다.
                  // 예전 조건은 item.quantity 를 봤는데 장바구니 줄의 수량 필드는 order_count 라
                  // 늘 undefined → NaN 이었고, `NaN <= 0` 은 false 라 **한 번도 비활성이 된 적이 없다**.
                  disabled={products.length === 0 || _.sum(_.map(products, (item) => (parseInt(item?.order_count) || 0) * (parseFloat(item?.product_sale_price) || 0))) <= 0}
                  onClick={() => { router.push('/shop/auth/order'); }}
                >
                  {translate('주문하기')}
                </Button>
              </>}
          </Grid>
        </Grid>
        {activeStep > 0 &&
          <>
            <Row style={{ width: '100%', justifyContent: 'space-between', maxWidth: '989px', marginTop: '2rem' }}>
              <Button startIcon={<Iconify icon="grommet-icons:form-previous" />} onClick={onClickPrevStep} variant="outlined" color="inherit" size="small">
                {translate('이전 단계 돌아가기')}
              </Button>
              {activeStep == 1 &&
                <>
                  <Button
                    size="small"
                    variant="outlined"
                    color="inherit"
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
