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
} from '@mui/material';
// utils
import { fCurrency } from '../../../../utils/formatNumber';
// components
import Iconify from 'src/components/iconify/Iconify';
import { useSettingsContext } from 'src/components/settings';
import { getBrandShipping } from 'src/utils/shop-util';
import { useState } from 'react';
import { useEffect } from 'react';
import { useLocales } from 'src/locales';
import { getPriceUnitByLang } from 'src/utils/function';
import CheckoutPointField from './CheckoutPointField';

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
  // 카트에서는 false 를 넘긴다(아래 CheckoutPointField 주석 참고).
  enablePoint = true,
  payData,
  setPayData,
  themeDnsData,
  // 금액 나누기(주문서가 orderAmountBreakdown 으로 넘긴다) — 상품금액·N개 / 옵션·추가상품.
  // 9/9 요청 「요약에 옵션도 정리」 를 상품 목록 대신 금액 한 줄로 살린다(2026-09-11 사장님 결정, 안 A).
  // 목록은 넣지 않는다 — 상품 카드와 같은 줄이 한 페이지에 세 번 나와 어색했다.
  // 안 넘기는 카트 화면은 예전처럼 '총액' 한 줄이다.
  goods,
  options = 0,
  count = 0,
  // 배송비 줄 아래 한 줄 설명("주문당 1회 · 5만원 이상 무료"). 주문서 PC 에서는 상품 목록 아래 요약을 숨기므로
  // 그 요약에 붙어 있던 이 안내를 여기서 보여 준다(2026-09-11). 카트는 표 아래에 따로 적으므로 안 넘긴다.
  shippingNote = '',
}) {
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
  // 포인트 입력칸은 CheckoutPointField 가 그린다(회원·포인트 쓰는 몰에서만 스스로 나타난다).
  // 카트는 enablePoint=false — 카트의 use_point 는 주문서로 전달되지 않아 입력해도 버려진다.
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
          {Number.isFinite(goods) ? (
            <>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {translate('상품금액 · {{n}}개', { n: Number(count) || 0 })}
                </Typography>
                <Typography variant="subtitle2">{fCurrency(goods) || '0'}{getPriceUnitByLang()}</Typography>
              </Stack>
              {Number(options) !== 0 && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {translate('옵션·추가상품')}
                  </Typography>
                  <Typography variant="subtitle2">{Number(options) < 0 ? '-' : '+'}{fCurrency(Math.abs(Number(options)))}{getPriceUnitByLang()}</Typography>
                </Stack>
              )}
            </>
          ) : (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {translate('총액')}
              </Typography>
              <Typography variant="subtitle2">{subtotal ? fCurrency(subtotal ?? 0) : '0'}{getPriceUnitByLang()}</Typography>
            </Stack>
          )}

          {/* 할인은 가맹점이 상품에 정가를 판매가보다 높게 적었을 때만 생긴다(정가 − 판매가).
              없는데 '할인 0원' 을 늘 보여 주면 "무슨 할인인가" 를 되묻게 된다 — 있을 때만 적는다. */}
          {Number(discount) > 0 && (
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {translate('할인')}
              </Typography>
              <Typography variant="subtitle2">{fCurrency(-discount)}{getPriceUnitByLang()}</Typography>
            </Stack>
          )}
          {/* brandShip.active 는 '브랜드 일괄 배송비 정책'을 켠 경우에만 true 다.
              정책을 안 켜고 상품별 배송비만 쓰는 브랜드는 fee > 0 인데도 이 줄이 숨겨져,
              총액과 총 결제금액이 배송비만큼 어긋나 보였다(청구액은 정상). */}
          {(brandShip.active || brandShip.fee > 0) && (
            <Box>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {translate('배송비')}
                </Typography>
                <Typography variant="subtitle2">
                  {brandShip.fee > 0 ? `${fCurrency(brandShip.fee)}${getPriceUnitByLang()}` : translate('무료배송')}
                </Typography>
              </Stack>
              {/* 안내는 금액 아래 한 줄로 따로 — 금액 칸 안에 넣으면 긴 문장이 「배송비」 글자를 두 줄로 꺾는다(PC 오른쪽 상자 폭) */}
              {shippingNote && <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'right', mt: 0.25 }}>{shippingNote}</Typography>}
            </Box>
          )}
          {enablePoint && (
            <CheckoutPointField themeDnsData={themeDnsData} payData={payData} setPayData={setPayData} total={displayTotal} />
          )}
          <Divider />

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle1">{translate('총 결제금액')}</Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" sx={{ color: 'error.main' }}>
                {displayTotal ? fCurrency(displayTotal ?? 0) : '0'}{getPriceUnitByLang()}
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
