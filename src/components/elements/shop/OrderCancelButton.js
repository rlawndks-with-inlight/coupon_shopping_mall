import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, Stack, TextField, Typography,
} from '@mui/material';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useLocales } from 'src/locales';
import { apiManager } from 'src/utils/api';
import { commarNumber } from 'src/utils/function';
import { getOptionLabel } from 'src/utils/shop-util';

// 주문취소 요청 버튼 — 공용.
//
// 쇼핑몰형(shop demo 1·2·4)의 주문내역에는 취소요청이 있는데
// 블로그형(프레임4~11)의 주문내역에는 취소 관련 코드가 아예 없었다.
// 그 프레임 고객은 주문을 취소할 수단이 화면에 없어 전화로만 가능했다.
//
// 뷰 5개에 각각 심으면 판정 조건이 곧 어긋나므로 한 곳에 모은다.
// 취소 가능 상태는 백엔드 cancelRequest 의 CANCELABLE_STATUS 와 반드시 같은 값을 유지할 것.
//   0=결제대기, 5=결제완료, 10=입고 까지만. 출고(15) 이후는 취소가 아니라 반품 절차다.
const CANCELABLE_STATUS = [0, 5, 10];

export const canCancelOrder = (trx) => (
  trx?.is_cancel != 1
  && trx?.is_cancel_trans != 1
  && trx?.trx_status != 1          // 이미 취소요청됨
  && CANCELABLE_STATUS.includes(Number(trx?.trx_status))
);

// 주문 한 줄에서 아직 취소 안 된 수량.
const 남은수량 = (o) => Math.max(0, (Number(o?.order_count) || 0) - (Number(o?.cancel_count) || 0));

const OrderCancelButton = ({ trx, orders, onDone, sx, variant = 'outlined' }) => {
  const { translate } = useLocales();
  const [open, setOpen] = useState(false);
  const [qty, setQty] = useState({});
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!canCancelOrder(trx)) return null;

  // 주문 줄 목록. 화면이 안 넘겨주면(옛 호출부) 줄 선택 없이 '주문 전체' 요청으로 간다.
  const 줄 = (Array.isArray(orders) ? orders : []).filter((o) => 남은수량(o) > 0);
  const 줄선택가능 = 줄.length > 0;

  const 고른수량 = (o) => Math.max(0, Math.min(Number(qty[o.id]) || 0, 남은수량(o)));
  const 고른줄 = 줄.filter((o) => 고른수량(o) > 0);

  const request = async (items) => {
    setLoading(true);
    try {
      const result = await apiManager(`transactions/${trx?.id}/cancel-request`, 'create', {
        // 아무것도 안 고르면 서버가 '남은 전부' 로 본다(옛 화면 호환).
        items: items ?? [],
        reason: reason || null,
      });
      if (result) {
        toast.success(translate('취소요청이 완료되었습니다.'));
        setOpen(false);
        if (onDone) await onDone();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant={variant} color="error" disabled={loading} sx={sx}
        onClick={() => { setQty({}); setReason(''); setOpen(true); }}>
        {translate('취소요청')}
      </Button>

      <Dialog open={open} onClose={loading ? undefined : () => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          {translate('주문 취소요청')}
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
            {줄선택가능
              ? translate('취소할 상품과 수량을 골라 주세요. 판매자 확인 후 환불됩니다.')
              : translate('판매자 확인 후 환불됩니다.')}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            {줄.map((o) => (
              <Stack key={o.id} direction="row" alignItems="center" spacing={1.5}>
                <Stack sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }} noWrap>{o?.order_name}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {(o?.groups ?? []).flatMap((g) => (g?.options ?? []).map(getOptionLabel)).filter(Boolean).join(' / ')}
                    {(o?.groups?.length > 0) ? ' · ' : ''}
                    {commarNumber(o?.order_amount)}
                    {translate('원')} · {translate('{{n}}개 남음', { n: 남은수량(o) })}
                  </Typography>
                </Stack>
                <TextField
                  size="small" type="number" sx={{ width: 88 }}
                  label={translate('수량')}
                  disabled={loading}
                  value={qty[o.id] ?? ''}
                  onChange={(e) => setQty({ ...qty, [o.id]: e.target.value })}
                  inputProps={{ min: 0, max: 남은수량(o) }}
                />
              </Stack>
            ))}

            {줄선택가능 && <Divider />}
            <TextField
              size="small" fullWidth multiline minRows={2}
              label={translate('취소 사유 (선택)')}
              value={reason} disabled={loading}
              onChange={(e) => setReason(e.target.value)}
            />
            {줄선택가능 &&
              <Typography sx={{ fontSize: 11.5, color: 'text.disabled' }}>
                {translate('아무것도 고르지 않으면 주문 전체가 취소 요청됩니다.')}
              </Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={loading}>{translate('닫기')}</Button>
          <Button variant="contained" color="error" disabled={loading}
            onClick={() => request(고른줄.map((o) => ({ order_id: o.id, qty: 고른수량(o) })))}>
            {loading ? translate('요청 중…') : translate('취소요청')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default OrderCancelButton;
