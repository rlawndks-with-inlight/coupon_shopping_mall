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
  // 이번 주문에서 포인트로 깎을 수 있는 상한.
  //
  // 예전엔 보유 포인트와 '최대사용가능 포인트'만 봤다. 주문금액은 보지 않아서,
  // 주문금액보다 큰 포인트를 넣을 수 있었고 '총 결제금액'이 음수로 표시된 뒤
  // 결제 시점에 서버 금액검증에서 거절됐다(고객은 이유를 알 수 없다).
  //
  // 기준금액은 화면에 뜬 '총 결제금액'에 지금 입력된 포인트를 도로 더해서 얻는다.
  // calcOrderTotals 가 amount = 상품가 + 배송비 - 포인트 로 계산하므로 이러면
  // 배송비 정책(브랜드 일괄/상품별)을 여기서 다시 해석하지 않고도 정확히 되돌아온다.
  const currentUsedPoint = Math.max(0, parseInt(payData?.use_point) || 0);
  const payableBeforePoint = Math.max(0, (parseFloat(displayTotal) || 0) + currentUsedPoint);
  // max_use_point 가 0 이면 '포인트 사용 안 함'이라는 뜻이다(기존 동작 유지).
  const pointCap = Math.max(0, Math.min(
    parseFloat(user?.point) || 0,
    parseFloat(max_use_point) || 0,
    payableBeforePoint,
  ));
  // '전체사용': 보유 포인트·최대사용가능 포인트·주문금액 중 가장 작은 값으로 채운다.
  const handleUseAllPoint = () => {
    setPayData({
      ...payData,
      use_point: pointCap,
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
          {/* brandShip.active 는 '브랜드 일괄 배송비 정책'을 켠 경우에만 true 다.
              정책을 안 켜고 상품별 배송비만 쓰는 브랜드는 fee > 0 인데도 이 줄이 숨겨져,
              총액과 총 결제금액이 배송비만큼 어긋나 보였다(청구액은 정상). */}
          {(brandShip.active || brandShip.fee > 0) && (
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
                    error={parseFloat(payData?.use_point) > pointCap}
                    value={payData?.use_point ?? 0}
                    type='number'
                    inputProps={{ min: 0, max: pointCap }}
                    sx={{ paddingRight: '8px' }}
                    endAdornment={<>
                      <InputAdornment position="end">P</InputAdornment>
                      <Button size='small' onClick={handleUseAllPoint}>
                        {translate('전체사용')}
                      </Button>
                    </>}
                    onChange={(e) => {
                      // 상한을 넘겨 입력하면 그 자리에서 상한으로 깎는다.
                      // (그냥 두면 총 결제금액이 음수로 뜨고 결제 시점에 서버가 거절한다)
                      const raw = e.target.value;
                      if (raw === '') {
                        setPayData({ ...payData, use_point: '' });
                        return;
                      }
                      const num = Math.max(0, parseInt(raw) || 0);
                      setPayData({
                        ...payData,
                        use_point: Math.min(num, pointCap),
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
