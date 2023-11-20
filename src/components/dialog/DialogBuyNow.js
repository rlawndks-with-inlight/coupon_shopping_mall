// ** React Imports
import { useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

import { Box, Card, CircularProgress, DialogContentText, Paper, RadioGroup, Stack, TextField } from '@mui/material'
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
import { onPayProductsByAuth, onPayProductsByHand } from 'src/utils/shop-util'
import { formatCreditCardNumber, formatExpirationDate } from 'src/utils/formatCard'
import { useModal } from './ModalProvider'
import toast from 'react-hot-toast'
import EmptyContent from '../empty-content/EmptyContent'


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
  const [addAddressObj, setAddAddressObj] = useState({
    addr: '',
    detail_addr: '',
    is_open_daum_post: false,
  })
  const [addressSearchObj, setAddressSearchObj] = useState({
    page: 1,
    page_size: 10000,
    search: '',
    user_id: user?.id,
  })
  const [addressContent, setAddressContent] = useState({});
  const [payData, setPayData] = useState({
    brand_id: themeDnsData?.id,
    user_id: user?.id ?? undefined,
    product_id: product?.id,
    amount: product?.product_sale_price ?? 0,
    item_name: product?.product_name,
    buyer_name: user?.nickname ?? "",
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
    setBuyStep(0);
    setAddAddressObj({
      addr: '',
      detail_addr: '',
      is_open_daum_post: false,
    })
    setPayData({
      ...payData,
      addr: '',
      detail_addr: ''
    })
  }
  const onAddAddress = async () => {
    if (user) {
      let result = await apiManager('user-addresses', 'create', {
        ...addAddressObj,
        user_id: user?.id,
      })
      if (result) {
        setAddAddressObj({
          addr: '',
          detail_addr: '',
          is_open_daum_post: false,
        })
        setAddAddressOpen(false);
        onChangeAddressPage(addressSearchObj);
      }
    } else {
      setPayData({
        ...payData,
        addr: addAddressObj.addr,
        detail_addr: addAddressObj.detail_addr,
      })
      setAddAddressOpen(false);
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
  const onSelectAddress = (data) => {
    setAddAddressObj({
      ...addAddressObj,
      addr: data?.address,
      detail_addr: '',
      is_open_daum_post: false,
    })
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
      <Dialog
        open={addAddressOpen}
        onClose={() => {
          setAddAddressObj({
            addr: '',
            detail_addr: '',
            is_open_daum_post: false,
          })
          setAddAddressOpen(false);
        }}
        PaperProps={{
          style: {
            width: `${window.innerWidth >= 700 ? '500px' : '90vw'}`,
          }
        }}
      >
        {addAddressObj.is_open_daum_post ?
          <>
            <Row>
              <DaumPostcode style={postCodeStyle} onComplete={onSelectAddress} />
            </Row>
          </>
          :
          <>
            <DialogTitle>{`주소지 추가`}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                새 주소를 입력후 저장을 눌러주세요.
              </DialogContentText>
              <TextField
                autoFocus
                fullWidth
                value={addAddressObj.addr}
                margin="dense"
                label="주소"
                aria-readonly='true'
                onClick={() => {
                  setAddAddressObj({
                    ...addAddressObj,
                    is_open_daum_post: true,
                  })
                }}
              />
              <TextField
                autoFocus
                fullWidth
                value={addAddressObj.detail_addr}
                margin="dense"
                label="상세주소"
                onChange={(e) => {
                  setAddAddressObj({
                    ...addAddressObj,
                    detail_addr: e.target.value
                  })
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button variant="contained" onClick={onAddAddress}>
                저장
              </Button>
              <Button color="inherit" onClick={() => {
                setAddAddressObj({
                  addr: '',
                  detail_addr: '',
                  is_open_daum_post: false,
                })
                setAddAddressOpen(false);
              }}>
                취소
              </Button>
            </DialogActions>
          </>}
      </Dialog>
    </>
  )
}

export default DialogBuyNow
