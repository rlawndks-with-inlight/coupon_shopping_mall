import { Box, Button, Card, CardContent, CardHeader, FormControlLabel, Grid, Paper, Radio, RadioGroup, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Row, Title } from 'src/components/elements/styled-components';
import { pay_list, test_address_list, test_item, test_items } from 'src/data/test-data';
import { CheckoutBillingAddress, CheckoutCartProductList, CheckoutSteps, CheckoutSummary } from 'src/views/@dashboard/e-commerce/checkout';
import styled from 'styled-components'
import _ from 'lodash'
import Label from 'src/components/label/Label';
import EmptyContent from 'src/components/empty-content/EmptyContent';
import Iconify from 'src/components/iconify/Iconify';
import { useSettingsContext } from 'src/components/settings';
import { getProductsByUser } from 'src/utils/api-shop';
const Wrappers = styled.div`
max-width:1500px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`
const calculatorPrice = (item) => {
  let { product_sale_price, product_price, select_option_obj, count } = item;
  let product_origin_price = 0;
  let product_option_price = 0;
  let item_options_key_list = Object.keys(select_option_obj ?? {});
  for (var i = 0; i < item_options_key_list.length; i++) {
    let key = item_options_key_list[i];
    let option = _.find(select_option_obj[key]?.options, { id: select_option_obj[key]?.option_id });
    product_option_price += option?.option_price ?? 0;
  }
  return {
    subtotal: (product_price + product_option_price) * count,
    total: (product_sale_price + product_option_price) * count,
    discount: (product_price - product_sale_price) * count
  }
}
const STEPS = ['장바구니 확인', '배송지 확인', '결제하기'];
function AddressItem({ item, onCreateBilling }) {
  const { receiver, address, address_type, phone, is_default } = item;

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
              {receiver}
              <Box component="span" sx={{ ml: 0.5, typography: 'body2', color: 'text.secondary' }}>
                ({address_type})
              </Box>
            </Typography>

            {is_default && (
              <Label color="info" sx={{ ml: 1 }}>
                기본주소
              </Label>
            )}
          </Stack>

          <Typography variant="body2">{address}</Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {phone}
          </Typography>
        </Stack>

        <Stack flexDirection="row" flexWrap="wrap" flexShrink={0}>
          {!is_default && (
            <Button variant="outlined" size="small" color="inherit" sx={{ mr: 1 }}>
              삭제
            </Button>
          )}
          <Button variant="outlined" size="small" onClick={onCreateBilling}>
            해당 주소로 배송하기
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeCartData, onChangeCartData } = useSettingsContext();
  const [products, setProducts] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [addressList, setAddressList] = useState([]);
  const [selectAddress, setSelectAddress] = useState(undefined);
  const [selectPayMethod, setSelectPayMethod] = useState(undefined)
  useEffect(() => {
    getCart();
  }, [])
  const getCart = async () => {
    let data = themeCartData;
    if (data.length > 0) {
      let products = await getProductsByUser({
        page: 1,
        page_size: 100000,
      })
      products = products?.content ?? [];
      for (var i = 0; i < data.length; i++) {
        let find_item = _.find(products, { id: data[i]?.id })
        if (find_item) {
          data[i] = {
            ...data[i],
            ...find_item,
          }
        }
      }
      setProducts(data);
    }
    let address_data = test_address_list;
    setAddressList(address_data)
  }
  const onDelete = (idx) => {
    let product_list = [...products];
    product_list.splice(idx, 1);
    onChangeCartData(product_list);
    setProducts(product_list);
  }
  const onDecreaseQuantity = (idx) => {
    let product_list = [...products];
    product_list[idx].count--;
    setProducts(product_list)
  }
  const onIncreaseQuantity = (idx) => {
    let product_list = [...products];
    product_list[idx].count++;
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
    setSelectAddress(item);
    onClickNextStep();
  }
  return (
    <>
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
                        calculatorPrice={calculatorPrice}
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
                    <Card sx={{ marginBottom: '1.5rem' }}>
                      <EmptyContent
                        title="배송지가 없습니다."
                        description="배송지를 추가해 주세요."
                        img=""
                      />
                    </Card>
                  </>}
              </>}
            {activeStep == 2 &&
              <>
                <Card sx={{ marginBottom: '1.5rem' }}>
                  <CardHeader title="결제 수단 선택" />
                  <CardContent>
                    <RadioGroup row>
                      <Stack spacing={3} sx={{ width: 1 }}>
                        {pay_list.map((item, idx) => (
                          <>
                            <Paper
                              variant="outlined"
                              sx={{ padding: '1rem', cursor: 'pointer' }}
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
                </Card>
              </>}
          </Grid>
          <Grid item xs={12} md={4}>
            <CheckoutSummary
              enableDiscount
              total={_.sum(_.map(products, (item) => { return calculatorPrice(item).total}))}
              discount={_.sum(_.map(products, (item) => { return calculatorPrice(item).discount}))}
              subtotal={_.sum(_.map(products, (item) => { return calculatorPrice(item).subtotal}))}
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
                    onClick={() => { }}
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

export default Demo1
