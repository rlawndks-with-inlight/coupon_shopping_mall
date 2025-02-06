// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import { Box, Card, CircularProgress, DialogContentText, FormControl, InputLabel, MenuItem, Paper, RadioGroup, Select, Stack, TextField } from '@mui/material'
import styled from 'styled-components'
import { Row, postCodeStyle, themeObj } from '../elements/styled-components'
import { useRouter } from 'next/router'
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext'
import { CheckoutSteps } from 'src/views/@dashboard/e-commerce/checkout'
import { useSettingsContext } from '../settings'
import { useEffect } from 'react'
import Payment from 'payment'
import Cards from 'react-credit-cards'
import { apiManager } from 'src/utils/api'
import { AddressItem } from 'src/views/shop/demo-1/auth/cart'
import Iconify from '../iconify'
import DaumPostcode from 'react-daum-postcode';
import { makePayData, onPayProductsByAuth, onPayProductsByAuth_Fintree, onPayProductsByHand, onPayProductsByVirtualAccount } from 'src/utils/shop-util'
import { formatCreditCardNumber, formatExpirationDate } from 'src/utils/formatCard'
import { useModal } from './ModalProvider'
import toast from 'react-hot-toast'
import EmptyContent from '../empty-content/EmptyContent'
import DialogAddAddress from './DialogAddAddress'
import { bankCodeList, ntvFrnrList, genderList, telComList } from 'src/utils/format'
import axios from 'axios'
import $ from 'jquery';
import _ from 'lodash'
import { commarNumber, returnMoment } from 'src/utils/function'

const Iframe = styled.iframe`
border: none;
width: 100%;
`
const DialogBuyNow = (props) => {

  const { setModal } = useModal()
  const STEPS = ['배송지 확인', '결제하기'];

  // ** State
  const { buyOpen, setBuyOpen, product, selectProductGroups, is_blog } = props;
  const { user } = useAuthContext();
  const { themeDnsData, onChangeCartData, themeCartData } = useSettingsContext();
  const router = useRouter();
  const [buyType, setBuyType] = useState(undefined);
  const [addAddressOpen, setAddAddressOpen] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [buyStep, setBuyStep] = useState(0);
  const [payList, setPayList] = useState([]);
  const [cardFucus, setCardFocus] = useState()
  const [selectAddress, setSelectAddress] = useState({});
  const [addressSearchObj, setAddressSearchObj] = useState({
    page: 1,
    page_size: 10000,
    search: '',
    user_id: user?.id,
  })
  const [addressContent, setAddressContent] = useState({});
  const payDataInitialSetting = {
    brand_id: themeDnsData?.id,
    user_id: user?.id ?? undefined,
    product_id: product?.id,
    amount: product?.product_sale_price ?? 0,
    item_name: product?.product_name,
    buyer_name: user?.name ?? "",
    ord_num: '',
    installment: 0,
    buyer_phone: user?.phone_num ?? "",
    buyer_phone_check: '',
    card_num: '',
    yymm: '',
    auth_num: '',
    card_pw: '',
    addr: "",
    detail_addr: '',
    temp: [],
    password: "",
    bank_code: "",
    acct_num: "",
    ntv_frnr: '',
    gender: '',
    tel_com: '',
    check_virtual_auth_step: 0,
    check_virtual_auth_code: '',
  }
  const [payData, setPayData] = useState(payDataInitialSetting)

  useEffect(() => {
    if (user) {
      onChangeAddressPage(addressSearchObj)
    }
    setPayList(themeDnsData?.payment_modules)
  }, [])
  /*useEffect(() => {
    console.log(payData)
  }, [payData])*/
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
  const onBuyDialogClose = () => {
    setBuyOpen(false);

    setTimeout(() => {
      setBuyStep(0);
      setPayData(payDataInitialSetting)
    }, 300)
  }

  const onAddAddress = async (address_obj) => {
    if (user) {
      let result = await apiManager('user-addresses', 'create', {
        ...address_obj,
        user_id: user?.id,
      })
      if (result) {
        onChangeAddressPage(addressSearchObj);
      }
    } else {
      setPayData({
        ...payData,
        addr: address_obj.addr,
        detail_addr: address_obj.detail_addr,
      })
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
  const onCreateBilling = (item) => {
    setSelectAddress(item);
    setPayData({
      ...payData,
      addr: item?.addr,
      detail_addr: item?.detail_addr,
    })
    setBuyStep(1);
  }
  const selectPayType = async (item) => {
    let product_item = product;
    let select_product_groups = selectProductGroups;
    product_item.order_count = selectProductGroups?.count;
    select_product_groups = selectProductGroups?.groups;

    if (item?.type == 'card') {//카드결제
      setBuyType('card');
      setBuyStep(2);
      setPayData({
        ...payData,
        payment_modules: item,
      })
    } else if (item?.type == 'certification') {
      setBuyType('certification');

      setPayLoading(true);
      let result = await onPayProductsByAuth([{
        ...product_item,
        groups: select_product_groups,
        seller_id: router.query?.seller_id ?? 0,
      }], { ...payData, payment_modules: item }, 'payvery');
    } else if (item?.type == 'card_fintree') {//카드결제 핀트리
      setBuyType('card_fintree');
      setBuyStep(2);
      setPayData({
        ...payData,
        payment_modules: item,
      })
    } else if (item?.type == 'certification_fintree') {
      setBuyType('certification_fintree');
      setPayLoading(true);
      let result = await onPayProductsByAuth_Fintree([{
        ...product_item,
        groups: select_product_groups,
        seller_id: router.query?.seller_id ?? 0,
      }], { ...payData, payment_modules: item });
    } else if (item?.type == 'virtual_account') {
      setBuyType('virtual_account');
      let pay_data = await makePayData([{
        ...product_item,
        groups: select_product_groups,
        seller_id: router.query?.seller_id ?? 0,
      }], payData);
      delete pay_data.payment_modules;
      let ord_num = `${pay_data?.user_id || pay_data?.password}${new Date().getTime().toString().substring(0, 11)}`;
      pay_data.ord_num = ord_num
      pay_data.item_name = `${pay_data?.products[0]?.order_name} 외 ${pay_data?.products?.length - 1}`;
      let link = _.find(themeDnsData?.payment_modules, { type: 'virtual_account' })?.virtual_acct_url + `?amount=${pay_data?.amount}`;
      if (_.find(themeDnsData?.payment_modules, { type: 'virtual_account' })?.virtual_acct_url) {
        const popup = window.open(link, ""); // 팝업을 미리 연다.
        popup.location.href = link;
      }
      let insert_pay_ready = await apiManager('pays/virtual', 'create', pay_data)
      setBuyStep(2);
      setPayData(pay_data)
    }
    else if (item?.type == 'gift_certificate') {
      setBuyType('gift_certificate');
      let pay_data = await makePayData([{
        ...product_item,
        groups: select_product_groups,
        seller_id: router.query?.seller_id ?? 0,
      }], payData);
      delete pay_data.payment_modules;
      let ord_num = `${pay_data?.user_id || pay_data?.password}${new Date().getTime().toString().substring(0, 11)}`;
      pay_data.ord_num = ord_num
      pay_data.item_name = `${pay_data?.products[0]?.order_name} 외 ${pay_data?.products?.length - 1}`;
      let link = _.find(themeDnsData?.payment_modules, { type: 'gift_certificate' })?.gift_certificate_url + `?amount=${pay_data?.amount}&name=${user?.name ?? ""}&phone_num=${user?.phone_num ?? ""}`;
      const popup = window.open(link, ""); // 팝업을 미리 연다.
      popup.location.href = link;
      let insert_pay_ready = await apiManager('pays/gift_certificate', 'create', pay_data)
      setBuyStep(2);
      setPayData(pay_data)
    }
    else if (item?.type == 'certification_weroute') {
      setBuyType('certification_weroute');
      setPayLoading(true);
      let result = await onPayProductsByAuth([{
        ...product_item,
        groups: select_product_groups,
        seller_id: router.query?.seller_id ?? 0,
      }], { ...payData, payment_modules: item }, 'weroute');
    }
  }
  const onBuyNow = async () => {
    let product_item = product;
    let select_product_groups = selectProductGroups;
    product_item.order_count = selectProductGroups?.count;
    select_product_groups = selectProductGroups?.groups;
    let result = await onPayProductsByHand([{
      ...product_item,
      groups: select_product_groups,
      seller_id: router.query?.seller_id ?? 0
    }], { ...payData });
    if (result) {
      await onChangeCartData([]);
      toast.success('성공적으로 구매 완료하였습니다.');
      if (is_blog == 1) {
        alert('성공적으로 구매 완료하였습니다.\n메인 페이지로 이동합니다.')
        router.push('/')
        return;
      } else if (payData?.user_id) {
        router.push('/shop/auth/history');
      } else {
        router.push(`/shop/auth/pay-result?type=0&ord_num=${result?.ord_num}`);
      }
    }
  }

  return (
    <>
      <Dialog
        open={buyOpen}
        onClose={() => {
          onBuyDialogClose();
        }}
        PaperProps={{
          style: {
            maxWidth: '600px', width: '90%',
          }
        }}
      >
        <DialogTitle>바로구매</DialogTitle>
        <DialogContent className='dialog-content'>
          <CheckoutSteps activeStep={buyStep} steps={STEPS} />
          {buyStep == 0 &&
            <>
              {user ?
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
                  <Row>
                    <Button
                      size="small"
                      variant="soft"
                      style={{ marginLeft: 'auto' }}
                      onClick={() => setAddAddressOpen(true)}
                      startIcon={<Iconify icon="eva:plus-fill" />}
                    >
                      배송지 추가하기
                    </Button>
                  </Row>
                </>
                :
                <>
                  {payData.addr ?
                    <>
                      <DialogTitle>{payData?.addr}</DialogTitle>
                      <DialogContent>
                        <DialogContentText>
                          {payData.detail_addr}
                        </DialogContentText>
                        <TextField
                          autoFocus
                          fullWidth
                          value={payData.password}
                          margin="dense"
                          label="비회원비밀번호"
                          type='password'
                          onChange={(e) => {
                            setPayData({
                              ...payData,
                              password: e.target.value
                            })
                          }}
                        />
                      </DialogContent>
                      <Row style={{ marginTop: '2rem' }}>
                        <Button variant="contained" onClick={() => {
                          if (!payData.password) {
                            toast.error('비회원 비밀번호를 입력해 주세요.');
                          } else {
                            setBuyStep(1);
                          }
                        }} style={{ marginLeft: 'auto' }}>
                          다음단계로
                        </Button>
                      </Row>
                    </>
                    :
                    <>
                      <DialogTitle>{`주소지 선택`}</DialogTitle>
                      <DialogContent>
                        <DialogContentText>
                          새 주소를 입력후 저장을 눌러주세요.
                        </DialogContentText>
                      </DialogContent>
                      <Row style={{ marginTop: '2rem' }}>
                        <Button variant="contained" onClick={() => setAddAddressOpen(true)} style={{ marginLeft: 'auto' }}>
                          주소지찾기
                        </Button>
                      </Row>
                    </>}
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
            </>}
          {(buyStep == 2 && buyType == 'card') &&
            <>
              <Typography variant='subtitle1' sx={{ borderBottom: `1px solid #000`, paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>{_.find(payList, { type: buyType })?.title}</Typography>
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
                    label={is_blog == 1 ? '주민번호 앞 6자리(생년월일)' : '주민번호 또는 사업자등록번호'}
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
          {(buyStep == 2 && buyType == 'card_fintree') &&
            <>
              <Typography variant='subtitle1' sx={{ borderBottom: `1px solid #000`, paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>{_.find(payList, { type: buyType })?.title}</Typography>
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
                    label={is_blog == 1 ? '주민번호 앞 6자리(생년월일)' : '주민번호 또는 사업자등록번호'}
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
          {(buyStep == 2 && buyType == 'virtual_account') &&
            <>
              {
                _.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_bank && _.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_name && _.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_num
                  ?
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      은행 : {_.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_bank}
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      예금주 : {_.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_name}
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      계좌번호 : {_.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_num}
                    </div>
                    <div style={{ marginBottom: '1rem' }}>
                      입금 후 1일 안에 구매처리됩니다.
                    </div>
                  </>
                  :
                  <>
                    무통장입금을 준비중입니다...
                  </>
              }
              {/* <Iframe src={_.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_url + `?amount=${payData?.amount}`} /> */}
            </>}
          {(buyStep == 2 && buyType == 'gift_certificate') &&
            <>
              상품권결제 준비중입니다...
              {/* <Iframe src={_.find(themeDnsData?.payment_modules, { type: buyType })?.virtual_acct_url + `?amount=${payData?.amount}`} /> */}
            </>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onBuyDialogClose} color="inherit">
            나가기
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={payLoading}
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
    </>
  )
}

export default DialogBuyNow
