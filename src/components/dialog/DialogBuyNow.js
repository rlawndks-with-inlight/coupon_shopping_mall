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
import { makePayData, onPayProductsByAuth, onPayProductsByHand, onPayProductsByVirtualAccount } from 'src/utils/shop-util'
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

const STEPS = ['배송지 확인', '결제하기'];
const DialogBuyNow = (props) => {

  const { setModal } = useModal()
  // ** State
  const { buyOpen, setBuyOpen, product, selectProductGroups } = props;
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
    buyer_name: user?.nickname ?? "",
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
    if (item?.type == 'card') {//카드결제
      setBuyType('card');
      setBuyStep(2);
      setPayData({
        ...payData,
        payment_modules: item,
      })
    } else if (item?.type == 'certification') {
      setBuyType('certification');
      let product_item = product;
      let select_product_groups = selectProductGroups;
      product_item.order_count = selectProductGroups?.count;
      select_product_groups = selectProductGroups?.groups;
      setPayLoading(true);
      let result = await onPayProductsByAuth([{
        ...product_item,
        groups: select_product_groups,
        seller_id: router.query?.seller_id ?? 0,
      }], { ...payData, payment_modules: item });
    } else if (item?.type == 'virtual_account') {
      setBuyType('virtual_account');
      setBuyStep(2);
      setPayData({
        ...payData,
        payment_modules: item,
        buyer_name: '',
      })
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
      toast.success('성공적으로 구매에 성공하였습니다.');
      if (payData?.user_id) {
        router.push('/shop/auth/history');
      } else {
        router.push(`/shop/auth/pay-result?type=0&ord_num=${result?.ord_num}`);
      }
    }
  }
  const sendOneWonCheckAccrount = async () => {//1원인증
    if (!payData.bank_code) {
      return toast.error('은행을 선택해 주세요.');
    }
    if (!payData.acct_num) {
      return toast.error('계좌번호를 입력해 주세요.');
    }
    if (!payData.buyer_name) {
      return toast.error('예금주를 입력해 주세요.');
    }
    try {
      const { data: response } = await axios.post(`https://api.cashes.co.kr/api/v1/viss/acct`, {
        compUuid: 'HSTUWO',
        bankCode: payData.bank_code,
        acctNo: payData.acct_num,
        custNm: payData.buyer_name,
      })
      if (response?.code == '0000') {
        toast.success('성공적으로 발송 되었습니다.');
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
      return toast.error('인증코드를 입력해 주세요.');
    }
    try {
      const { data: response } = await axios.post(`https://api.cashes.co.kr/api/v1/viss/confirm`, {
        compUuid: 'HSTUWO',
        verifyTrDt: payData.verifyTrDt,
        verifyTrNo: payData.verifyTrNo,
        verifyVal: payData.check_virtual_auth_code,
      })
      if (response?.code == '0000') {
        toast.success('성공적으로 인증 되었습니다.');
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
      return toast.error('생년월일을 입력해 주세요.');
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
        toast.success('성공적으로 인증 되었습니다.');
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
        toast.success('성공적으로 발송 되었습니다.');
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
        toast.success('성공적으로 인증 되었습니다.');
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
      let product_item = product;
      let select_product_groups = selectProductGroups;
      product_item.order_count = selectProductGroups?.count;
      select_product_groups = selectProductGroups?.groups;
      let result = await onPayProductsByVirtualAccount([{
        ...product_item,
        groups: select_product_groups,
        seller_id: router.query?.seller_id ?? 0
      }], { ...payData });
      setPayData(result)
    } catch (err) {
      console.log(err);
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
          {(buyStep == 2 && buyType == 'virtual_account') &&
            <>
              <Typography variant='subtitle1' sx={{ borderBottom: `1px solid #000`, paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>{_.find(payList, { type: buyType })?.title}</Typography>
              <Stack spacing={2}>
                {payData?.virtual_account_info ?
                  <>
                    <Row style={{ columnGap: '0.5rem' }}>
                      <Typography variant='subtitle2'>발급 번호</Typography>
                      <Typography variant='body2' sx={{ color: themeObj.grey[600] }}>{payData?.virtual_account_info?.virtual_acct_issued_seq}</Typography>
                    </Row>
                    <Row style={{ columnGap: '0.5rem' }}>
                      <Typography variant='subtitle2'>발급 은행</Typography>
                      <Typography variant='body2' sx={{ color: themeObj.grey[600] }}>{_.find(bankCodeList, { value: payData?.virtual_account_info?.virtual_bank_code })?.label}</Typography>
                    </Row>
                    <Row style={{ columnGap: '0.5rem' }}>
                      <Typography variant='subtitle2'>계좌번호</Typography>
                      <Typography variant='body2' sx={{ color: themeObj.grey[600] }}>{payData?.virtual_account_info?.virtual_acct_num}</Typography>
                    </Row>
                    <Row style={{ columnGap: '0.5rem' }}>
                      <Typography variant='subtitle2'>예금주명</Typography>
                      <Typography variant='body2' sx={{ color: themeObj.grey[600] }}>{payData?.buyer_name}</Typography>
                    </Row>
                    <Row style={{ columnGap: '0.5rem' }}>
                      <Typography variant='subtitle2'>입금예정금액</Typography>
                      <Typography variant='body2' sx={{ color: themeObj.grey[600] }}>{commarNumber(payData?.account)}원</Typography>
                    </Row>
                  </>
                  :
                  <>
                    <Stack>
                      <Typography variant="subtitle2">
                        본인확인
                      </Typography>
                    </Stack>
                    <Stack>
                      <FormControl size='small' disabled={payData.check_virtual_auth_step >= 2}>
                        <InputLabel>은행</InputLabel>
                        <Select label='은행' value={payData?.bank_code} onChange={(e) => {
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
                        label='계좌번호'
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
                        label='예금주'
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
                            label='인증코드'
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
                        {payData.check_virtual_auth_step == 0 ? '1원인증' : (payData.check_virtual_auth_step >= 2 ? '확인완료' : '확인')}
                      </Button>
                    </Stack>
                    {payData.check_virtual_auth_step >= 2 &&
                      <>
                        <Stack>
                          <TextField
                            disabled={payData.check_virtual_auth_step >= 3}
                            size='small'
                            label='생년월일'
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
                            {(payData.check_virtual_auth_step == 2 ? '실명조회' : '확인완료')}
                          </Button>
                        </Stack>
                      </>}
                    {payData.check_virtual_auth_step >= 3 &&
                      <>
                        <Stack>
                          <FormControl size='small'>
                            <InputLabel>성별</InputLabel>
                            <Select label='성별' value={payData?.gender}
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
                            <InputLabel>내외국인</InputLabel>
                            <Select label='내외국인' value={payData?.ntv_frnr}
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
                            <InputLabel>통신사</InputLabel>
                            <Select label='통신사' value={payData?.tel_com}
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
                            label='전화번호'
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
                                onClick={sendSmsPushVirtualAccount}>{payData.check_virtual_auth_step >= 4 ? '확인완료' : '인증번호 발송'}</Button>
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
                                onClick={checkSmsVerityCodeVirtualAccount}>{payData.check_virtual_auth_step >= 4 ? '확인완료' : '인증번호 확인'}</Button>
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
                            발급신청
                          </Button>
                        </Stack>
                      </>}
                  </>}
              </Stack>

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
