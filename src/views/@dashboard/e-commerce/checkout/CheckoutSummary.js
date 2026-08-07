import PropTypes from 'prop-types';
// @mui
import {
  Box,
  Card,
  Stack,
  Button,
  Divider,
  TextField,
  CardHeader,
  Typography,
  CardContent,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
// components
import Iconify from 'src/components/iconify/Iconify';
import { Col } from 'src/components/elements/styled-components';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useSettingsContext } from 'src/components/settings';
import { commarNumber } from 'src/utils/function';
import { getBrandShipping } from 'src/utils/shop-util';
import { useState } from 'react';
import { useEffect } from 'react';
import { useLocales } from 'src/locales';

// ----------------------------------------------------------------------

CheckoutSummary.propTypes = {
  onEdit: PropTypes.func,
  total: PropTypes.number,
  discount: PropTypes.number,
  subtotal: PropTypes.number,
  shipping: PropTypes.number,
  shipActive: PropTypes.bool,
  enableEdit: PropTypes.bool,
  enableDiscount: PropTypes.bool,
  enablePoint: PropTypes.bool,
  onApplyDiscount: PropTypes.func,
};

export default function CheckoutSummary({
  total,
  onEdit,
  discount,
  subtotal,
  shipping,
  shipActive = false,
  enableEdit = false,
  enableDiscount = false,
  // 포인트 입력란 노출 여부. 기본 true — 기존 호출부(주문서 등)의 동작을 그대로 유지한다.
  // 카트에서는 false 를 넘긴다(아래 showPointUsage 주석 참고).
  enablePoint = true,
  payData,
  setPayData,
  themeDnsData
}) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { setting_obj } = themeDnsData;
  const { use_point_min_price = 0, max_use_point = 0, point_rate = 0 } = setting_obj;
  // 배송비·최종금액은 호출부가 calcOrderTotals 로 계산해 넘겨준다.
  //
  // 예전엔 여기서 자체 계산했다 — 상품별 배송비가 포함된 total 에 브랜드 배송비를
  // 한 번 더 얹었고, 무료배송 기준도 '상품가+배송비'로 봐서 실제 청구(상품가만 기준)와
  // 어긋났다. 결과적으로 고객이 본 금액과 결제되는 금액이 달랐다.
  // 표시와 청구는 반드시 같은 함수를 써야 한다.
  //
  // 호출부가 shipping 을 주면 그 값을 그대로 쓴다(공용 주문서 — 실제 결제가 일어나는 화면).
  // 안 주면 예전처럼 자체 계산한다(데모 카트들 — 결제는 하지 않고 주문서로 넘어간다).
  // 카트도 순차적으로 calcOrderTotals 로 옮기는 게 맞지만, 안 넘기는 호출부를
  // 갑자기 깨뜨리지 않도록 폴백을 남겨 둔다.
  const fallbackShip = getBrandShipping((subtotal ?? 0) - (discount ?? 0));
  const hasExplicitShipping = shipping !== undefined && shipping !== null;
  const brandShip = hasExplicitShipping ? { active: shipActive, fee: shipping } : fallbackShip;
  const displayTotal = hasExplicitShipping
    ? total
    : (fallbackShip.active ? ((total ?? 0) + fallbackShip.fee) : total);
  // 포인트 UI 노출 게이트: 로그인(user) && 포인트설정값 존재(최대사용가능 포인트 또는 적립률이 truthy)일 때만 노출.
  // 비회원/미사용 브랜드면 숨김.
  // 추가로 enablePoint 게이트를 둔다 — 카트의 use_point 는 주문서로 전달되지 않아
  // 입력해도 버려진다. 포인트는 주문서에서만 입력받는다.
  const showPointUsage = enablePoint && !!user && (parseFloat(max_use_point) > 0 || parseFloat(point_rate) > 0);
  // '전체사용': 보유 포인트와 최대사용가능 포인트 중 작은 값으로 입력값을 채움(둘 다 초과 방지).
  const handleUseAllPoint = () => {
    const maxUsable = Math.min(parseFloat(user?.point) || 0, parseFloat(max_use_point) || 0);
    setPayData({
      ...payData,
      use_point: maxUsable,
    });
  };
  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader
        title={translate('주문 요약정보')}
        action={
          enableEdit && (
            <Button size="small" onClick={onEdit} startIcon={<Iconify icon="eva:edit-fill" />}>
              Edit
            </Button>
          )
        }
      />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {translate('총액')}
            </Typography>
            <Typography variant="subtitle2">{subtotal ? fCurrency(subtotal ?? 0) : '0'}원</Typography>
          </Stack>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {translate('할인')}
            </Typography>
            <Typography variant="subtitle2">{discount ? fCurrency(-discount) : '0'}원</Typography>
          </Stack>
          {brandShip.active && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {translate('배송비')}
              </Typography>
              <Typography variant="subtitle2">
                {brandShip.fee > 0 ? `${fCurrency(brandShip.fee)}원` : translate('무료배송')}
              </Typography>
            </Stack>
          )}
          {showPointUsage && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {translate('사용할 포인트')}
              </Typography>
              <Col>
                <FormControl variant="outlined" size='small' sx={{ maxWidth: '170px', paddingRight: '0' }}>
                  <OutlinedInput
                    disabled={parseFloat(use_point_min_price) > subtotal - discount}
                    error={parseFloat(payData?.use_point) > parseFloat(user?.point) || parseFloat(payData?.use_point) > parseFloat(max_use_point)}
                    value={payData?.use_point ?? 0}
                    type='number'
                    sx={{ paddingRight: '8px' }}
                    endAdornment={<>
                      <InputAdornment position="end">P</InputAdornment>
                      <Button size='small' onClick={handleUseAllPoint}>
                        {translate('전체사용')}
                      </Button>
                    </>}
                    onChange={(e) => {
                      setPayData({
                        ...payData,
                        use_point: e.target.value,
                      })
                    }} />
                </FormControl>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
                  {translate('잔여 포인트')} ({commarNumber(user?.point)}P)
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
                  {translate('최대사용가능 포인트')} ({commarNumber(max_use_point)}P)
                </Typography>
              </Col>
            </Stack>
          )}
          <Divider />

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle1">{translate('총 결제금액')}</Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" sx={{ color: 'error.main' }}>
                {displayTotal ? fCurrency(displayTotal ?? 0) : '0'}원
              </Typography>
              {/* <Typography variant="caption" sx={{ fontStyle: 'italic' }}>
                (VAT included if applicable)
              </Typography> */}
            </Box>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
