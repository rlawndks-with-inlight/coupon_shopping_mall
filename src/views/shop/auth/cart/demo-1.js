import { useEffect, useState } from 'react';
// next
import Head from 'next/head';
import { useRouter } from 'next/router';
// @mui
import { Grid, Container } from '@mui/material';
// routes
// redux
import { useDispatch, useSelector } from 'src/redux/store';
import {
  resetCart,
  getCart,
  nextStep,
  backStep,
  gotoStep,
  deleteCart,
  createBilling,
  applyShipping,
  applyDiscount,
  increaseQuantity,
  decreaseQuantity,
} from 'src/redux/slices/product';
// components
import { useSettingsContext } from 'src/components/settings';
// sections

import {
  CheckoutCart,
  CheckoutSteps,
  CheckoutPayment,
  CheckoutOrderComplete,
  CheckoutBillingAddress,
} from 'src/views/@dashboard/e-commerce/checkout';
import styled from 'styled-components';
// ----------------------------------------------------------------------

const Wrappers = styled.div`
max-width:1200px;
display:flex;
flex-direction:column;
margin: 2rem auto;
width: 90%;
min-height:90vh;
margin-bottom:10vh;
`

const STEPS = ['장바구니', '배송지 확인', '결제진행'];

const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;

  const { replace } = useRouter();

  const { themeStretch } = useSettingsContext();

  const dispatch = useDispatch();

  const { checkout } = useSelector((state) => state.product);

  const { cart, billing, activeStep } = checkout;

  const completed = activeStep === STEPS.length;

  const [cartList, setCartList] = useState({
    cart :[],
    billing,
    activeStep
  });

  useEffect(() => {
    dispatch(getCart(cart));
  }, [dispatch, cart]);

  useEffect(() => {
    if (activeStep === 1) {
      dispatch(createBilling(null));
    }
  }, [dispatch, activeStep]);

  const handleNextStep = () => {
    dispatch(nextStep());
  };

  const handleBackStep = () => {
    dispatch(backStep());
  };

  const handleGotoStep = (step) => {
    dispatch(gotoStep(step));
  };

  const handleApplyDiscount = (value) => {
    if (cart.length) {
      dispatch(applyDiscount(value));
    }
  };

  const handleDeleteCart = (productId) => {
    dispatch(deleteCart(productId));
  };

  const handleIncreaseQuantity = (productId) => {
    dispatch(increaseQuantity(productId));
  };

  const handleDecreaseQuantity = (productId) => {
    dispatch(decreaseQuantity(productId));
  };

  const handleCreateBilling = (address) => {
    dispatch(createBilling(address));
    dispatch(nextStep());
  };

  const handleApplyShipping = (value) => {
    dispatch(applyShipping(value));
  };

  const handleReset = () => {
    if (completed) {
      dispatch(resetCart());
    }
  };

  return (
    <>
      <Head>
        <title> Ecommerce: Checkout | Minimal UI</title>
      </Head>
      <Wrappers>

        <Container maxWidth={themeStretch ? false : 'lg'}>

          <Grid container justifyContent={completed ? 'center' : 'flex-start'}>
            <Grid item xs={12} md={8}>
              <CheckoutSteps activeStep={activeStep} steps={STEPS} />
            </Grid>
          </Grid>

          {completed ? (
            <CheckoutOrderComplete open={completed} onReset={handleReset} onDownloadPDF={() => { }} />
          ) : (
            <>
              {activeStep === 0 && (
                <CheckoutCart
                  checkout={checkout}
                  onNextStep={handleNextStep}
                  onDeleteCart={handleDeleteCart}
                  onApplyDiscount={handleApplyDiscount}
                  onIncreaseQuantity={handleIncreaseQuantity}
                  onDecreaseQuantity={handleDecreaseQuantity}
                />
              )}
              {activeStep === 1 && (
                <CheckoutBillingAddress
                  checkout={checkout}
                  onBackStep={handleBackStep}
                  onCreateBilling={handleCreateBilling}
                />
              )}
              {activeStep === 2 && billing && (
                <CheckoutPayment
                  checkout={checkout}
                  onNextStep={handleNextStep}
                  onBackStep={handleBackStep}
                  onGotoStep={handleGotoStep}
                  onApplyShipping={handleApplyShipping}
                  onReset={handleReset}
                />
              )}
            </>
          )}
        </Container>
      </Wrappers>
    </>
  );
}
export default Demo1
