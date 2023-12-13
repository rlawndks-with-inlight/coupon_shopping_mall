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
  enableEdit: PropTypes.bool,
  enableDiscount: PropTypes.bool,
  onApplyDiscount: PropTypes.func,
};

export default function CheckoutSummary({
  total,
  onEdit,
  discount,
  subtotal,
  shipping,
  enableEdit = false,
  enableDiscount = false,
  payData,
  setPayData,
  themeDnsData
}) {
  const { user } = useAuthContext();
  const { translate } = useLocales();
  const { setting_obj } = themeDnsData;
  const { use_point_min_price = 0, max_use_point = 0, point_rate = 0 } = setting_obj;
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
                    <Button size='small'>
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
          <Divider />

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="subtitle1">{translate('총 결제금액')}</Typography>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="subtitle1" sx={{ color: 'error.main' }}>
                {total ? fCurrency(total ?? 0) : '0'}원
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
