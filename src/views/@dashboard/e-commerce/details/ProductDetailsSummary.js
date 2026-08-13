import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import BenefitNotice from 'src/components/elements/shop/BenefitNotice';
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
  Card,
  CircularProgress,
  Chip,
} from '@mui/material';
// routes
// utils
import { fCurrency } from 'src/utils/formatNumber';
// _mock
import Iconify from 'src/components/iconify/Iconify';
import { IncrementerButton } from 'src/components/custom-input';
import { ColorSinglePicker } from 'src/components/color-utils';
import { commarNumber, getPriceUnitByLang, getProductStatus, setProductPriceByLang } from 'src/utils/function';
import { PointerText, Row, postCodeStyle, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import { toast } from 'react-hot-toast';
import { CheckoutSteps } from 'src/views/@dashboard/e-commerce/checkout';
import { AddressItem } from 'src/views/shop/demo-1/auth/cart';
import EmptyContent from 'src/components/empty-content/EmptyContent';
import Payment from 'payment'
import Cards from 'react-credit-cards'
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { formatCreditCardNumber, formatExpirationDate } from 'src/utils/formatCard';
import { useModal } from "src/components/dialog/ModalProvider";
import { insertCartDataUtil, onPayProductsByAuth, onPayProductsByHand, selectItemOptionUtil } from 'src/utils/shop-util';
import DaumPostcode from 'react-daum-postcode';
import { apiManager } from 'src/utils/api';
import { useRouter } from 'next/router';
import DialogBuyNow from 'src/components/dialog/DialogBuyNow';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
import { isShopgoBrand } from 'src/utils/is-shopgo';
import OrderFormFields from 'src/components/elements/shop/OrderFormFields';
// ----------------------------------------------------------------------

ProductDetailsSummary.propTypes = {
  cart: PropTypes.array,
  onAddCart: PropTypes.func,
  product: PropTypes.object,
  onGotoStep: PropTypes.func,
};

export default function ProductDetailsSummary({ product, onAddCart, onGotoStep, ...other }) {
  const router = useRouter();
  const { translate, currentLang } = useLocales();
  const { themeDnsData, themeCartData, onChangeCartData, themeDirection } = useSettingsContext();

  const { user } = useAuthContext();
  const [selectProductGroups, setSelectProductGroups] = useState({
    count: 1,
    groups: [],
  });
  // 주문 추가 입력항목(행사일 등)의 값. 담기·바로구매 때 상품에 실어 보낸다.
  const [orderFormValues, setOrderFormValues] = useState({});

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
    product_name,
    product_comment,
    product_spec,
    groups = [],
    delivery_fee,
    lang_obj,
    price_lang = 'ko'
  } = product;

  // 비회원도 장바구니 담기 허용 — 장바구니는 localStorage에 저장되고 주문서가 비회원 주문을 지원한다.
  // 바로 아래 handleBuyNow는 이미 비회원에게 열려 있었는데 담기만 로그인을 요구해 앞뒤가 안 맞았다.
  const handleAddCart = async () => {
    //옵션 체크 안해도 저장 되는데 이 부분은 수정할 여지가 있어보임
    let result = await insertCartDataUtil({ ...product, seller_id: router.query?.seller_id ?? 0 , order_form_values: orderFormValues }, selectProductGroups, themeCartData, onChangeCartData);
    if (result) {
      toast.success(translate("장바구니에 성공적으로 추가되었습니다."))
    }
  };
  const onSelectOption = (group, option, is_option_multiple) => {
    let select_product_groups = selectItemOptionUtil(group, option, selectProductGroups, is_option_multiple);
    setSelectProductGroups(select_product_groups);
    //console.log(select_product_groups)
  }
  const [buyOpen, setBuyOpen] = useState(false);

  return (
    <>
      <DialogBuyNow
        buyOpen={buyOpen}
        setBuyOpen={setBuyOpen}
        product={{ ...product, order_form_values: orderFormValues }}
        selectProductGroups={selectProductGroups}
      />
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
            >
              <Chip label={translate(getProductStatus(status).text)} variant="soft" color={getProductStatus(status).color} />
            </Typography>
            <Typography variant="h5">{formatLang(product, 'product_name', currentLang)}</Typography>
            <Typography variant="h7" color={themeObj.grey[500]}>{formatLang(product, 'product_comment', currentLang)}</Typography>

            {product_spec &&
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  whiteSpace: 'pre-line',
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: 'text.secondary',
                }}
              >
                {formatLang(product, 'product_spec', currentLang)}
              </Box>}

            {/* ShopGo 산하는 상품후기를 쓰지 않는다 — 별점도 함께 감춘다.
                후기 탭이 없는데 별점만 남으면 근거 없는 숫자가 된다. */}
            {!isShopgoBrand(themeDnsData) && (
              <Stack direction="row" alignItems="center" spacing={1}>
                <Rating value={product_average_scope} precision={0.1} readOnly />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  ({commarNumber(product_average_scope)})
                </Typography>
              </Stack>
            )}
            {
              themeDnsData?.id == 95 && product_sale_price > 99999 ?
                <>
                </>
                :
                <>
                  <Typography variant="h4">
                    {product_price > product_sale_price && (
                      <Box
                        component="span"
                        sx={{ color: 'text.disabled', textDecoration: 'line-through', mr: 0.5 }}
                      >
                        {fCurrency(setProductPriceByLang(product, 'product_price', price_lang, currentLang?.value))}
                      </Box>
                    )}
                    {commarNumber(setProductPriceByLang(product, 'product_sale_price', price_lang, currentLang?.value))} {getPriceUnitByLang(currentLang?.value)}
                  </Typography>
                  <Typography variant="h7" color={themeObj.grey[500]}>{translate('배송비')}: {commarNumber(setProductPriceByLang(product, 'delivery_fee', price_lang, currentLang?.value))}{getPriceUnitByLang(currentLang?.value)}</Typography>
                  {
                    themeDnsData?.id == 95 && product_sale_price < 100000 &&
                    <>
                      <Typography variant="h7" style={{ color: 'black' }}>{translate('⚠️결제 시 주의사항⚠️')}</Typography>
                      <Typography variant="h7" style={{ color: 'black' }}>{translate('주말 및 공휴일은 카드 결제 시 카드 취소 불가로,')}</Typography>
                      <Typography variant="h7" style={{ color: 'black' }}>{translate('카드 수수료 12% 제외 후 계좌이체로 환불이 진행됩니다')}</Typography>
                    </>
                  }
                </>
            }
          </Stack>
          {/* 혜택 안내(본사 공통). 배송비 바로 아래, 구분선 위 — 가격 정보 묶음의 끝이다.
              본사에 등록된 것이 없으면 아무것도 그리지 않으므로,
              이 컴포넌트를 함께 쓰는 다른 클라이언트 몰에는 영향이 없다. */}
          <BenefitNotice sx={{ mt: 1 }} tone={{ fontSize: 13, labelColor: themeObj.grey[500] }} />
              {/* 주문 추가 입력항목 — 서식이 걸린 몰에서만 나타난다 */}
              <OrderFormFields values={orderFormValues} onChange={setOrderFormValues} sx={{ mt: 2 }} />
          <Divider sx={{ borderStyle: 'dashed' }} />
          {
            themeDnsData?.id == 95 && product_sale_price > 99999 ?
              <>
              </>
              :
              <>
                {groups.map((group) => (
                  <>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle2" sx={{ height: 40, lineHeight: '40px', flexGrow: 1 }}>
                        {group?.group_name}
                      </Typography>
                      <FormControl size='small'>
                        <InputLabel id="demo-simple-select-label">{translate('선택')}</InputLabel>
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
                          label={translate("선택")}
                          onChange={(e) => {
                            onSelectOption(group, e.target.value)
                          }}
                        >
                          {group?.options && group?.options.map((option) => (
                            <MenuItem key={option?.option_name} value={option}>
                              {option?.option_name}
                              {(option?.option_price > 0 || option?.option_price < 0) ? ` (${option?.option_price > 0 ? '+' : ''}${commarNumber(setProductPriceByLang(option, 'option_price', price_lang, currentLang?.value))})` : ''}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                  </>
                ))}
              </>
          }
          {
            themeDnsData?.id == 95 && product_sale_price > 99999 ?
              <>
                <Stack direction="row" justifyContent="space-between">
                  <div>{translate('별도 문의가 필요한 상품입니다. 페이지 하단의 고객센터로 문의바랍니다.')}</div>
                </Stack>
              </>
              :
              <>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="subtitle2" sx={{ height: 36, lineHeight: '36px' }}>
                    {translate('수량')}
                  </Typography>

                  <Stack spacing={1}>
                    <IncrementerButton
                      name="quantity"
                      quantity={selectProductGroups.count}
                      disabledDecrease={selectProductGroups.count <= 1}
                      disabledIncrease={selectProductGroups.count >= available}
                      type='product_page'
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
                      onChangeQuantity={(val) => {
                        setSelectProductGroups({
                          ...selectProductGroups,
                          count: val
                        })
                      }}
                    />
                  </Stack>
                </Stack>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <Stack direction="row" spacing={2}>
                  <Button
                    fullWidth
                    disabled={getProductStatus(status).color != 'info' || !(product_sale_price > 0)}
                    size="large"
                    color="warning"
                    variant="contained"
                    startIcon={<Iconify icon="ic:round-add-shopping-cart" />}
                    onClick={handleAddCart}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {translate('장바구니')}
                  </Button>
                  <Button fullWidth disabled={getProductStatus(status).color != 'info' || !(product_sale_price > 0)} size="large" variant="contained" onClick={() => {
                    // 비회원도 바로구매 허용(주문서에서 비회원 주문비밀번호로 진행) — 장바구니 주문과 통일
                    setBuyOpen(true);
                  }}>
                    {translate('바로구매')}
                  </Button>
                </Stack>
              </>
          }
        </Stack>
      </form>
    </>
  );
}
