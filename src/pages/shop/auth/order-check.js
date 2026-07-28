import { useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Divider, Stack, TextField, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import ShopLayout from 'src/layouts/shop/ShopLayout';
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';
import { getTrxStatusByNumber, commarNumber } from 'src/utils/function';

const Wrappers = styled.div`
  max-width: 640px;
  width: 92%;
  min-height: 70vh;
  margin: 4vh auto 8vh;
`;

const KV = ({ k, v, strong }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ py: 0.75 }}>
    <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', mr: 2 }}>{k}</Typography>
    <Typography variant="body2" component="div" sx={{ fontWeight: strong ? 800 : 600, textAlign: 'right' }}>{v || '-'}</Typography>
  </Stack>
);

// 택배 배송조회(네이버 통합조회). 송장은 `택배사-송장번호` 형식.
const parseInvoice = (invoice_num) => {
  if (!invoice_num) return null;
  const trimmed = String(invoice_num).trim();
  const di = trimmed.indexOf('-');
  const hasCourier = di > 0 && /[^0-9]/.test(trimmed.slice(0, di));
  const courier = hasCourier ? trimmed.slice(0, di) : '';
  const invoice = hasCourier ? trimmed.slice(di + 1) : trimmed;
  if (!invoice) return null;
  return {
    courier,
    invoice,
    url: `https://search.naver.com/search.naver?query=${encodeURIComponent(`${courier} ${invoice} 택배조회`.trim())}`,
  };
};

const won = (n) => `${commarNumber(n || 0)}원`;

// 주문 상세(읽기전용) — 회원/비회원 공통 표시
const OrderDetail = ({ order }) => {
  const track = parseInvoice(order?.invoice_num);
  const receiver = order?.receiver || order?.buyer_name;
  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardHeader title="주문 정보" />
        <CardContent sx={{ pt: 0 }}>
          <KV k="주문번호" v={order?.ord_num} strong />
          {order?.appr_num && <KV k="승인번호" v={order?.appr_num} />}
          <KV k="주문현황" v={getTrxStatusByNumber(order?.trx_status)} />
          <KV k="구매자" v={`${order?.buyer_name || '-'}${order?.buyer_phone ? ' · ' + order?.buyer_phone : ''}`} />
          {order?.invoice_num && (
            <KV k="택배사/송장" v={track
              ? <>{track.courier ? track.courier + ' · ' : ''}{track.invoice}
                <Box component="a" href={track.url} target="_blank" rel="noreferrer" sx={{ ml: 1, color: 'primary.main', textDecoration: 'underline' }}>배송조회</Box></>
              : order?.invoice_num} />
          )}
        </CardContent>
      </Card>

      {(order?.addr || receiver) && (
        <Card sx={{ mb: 2 }}>
          <CardHeader title="배송지" />
          <CardContent sx={{ pt: 0 }}>
            {receiver && <KV k="받는분" v={`${receiver}${order?.receiver_phone ? ' · ' + order?.receiver_phone : ''}`} />}
            {order?.addr && <KV k="주소" v={`${order?.zonecode ? '(' + order?.zonecode + ') ' : ''}${order?.addr} ${order?.detail_addr || ''}`} />}
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 2 }}>
        <CardHeader title="주문상품" />
        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={1} divider={<Divider flexItem />}>
            {(order?.orders || []).map((o, i) => (
              <Stack key={i} direction="row" justifyContent="space-between">
                <Typography variant="body2">{o?.order_name} · {o?.order_count}개</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{won(o?.order_amount)}</Typography>
              </Stack>
            ))}
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="subtitle2">결제금액</Typography>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>{won(order?.amount)}</Typography>
          </Stack>
        </CardContent>
      </Card>
    </>
  );
};

// 비회원 주문조회 — 전화번호 + 주문비밀번호.
// 백엔드: transactions/0 GET { brand_id, buyer_phone, password } → 해당 브랜드의 매칭 주문 배열.
const OrderCheck = () => {
  const { themeDnsData } = useSettingsContext();
  const [form, setForm] = useState({ buyer_phone: '', password: '' });
  const [orders, setOrders] = useState(null); // 조회 결과(배열) / null=미조회
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSearch = async () => {
    if (!form.buyer_phone || !form.password) {
      toast.error('전화번호와 주문 비밀번호를 입력해 주세요.');
      return;
    }
    setLoading(true);
    const data = await apiManager('transactions/0', 'get', {
      brand_id: themeDnsData?.id,
      buyer_phone: form.buyer_phone,
      password: form.password,
    });
    setLoading(false);
    const list = Array.isArray(data) ? data : (data && Object.keys(data).length > 0 ? [data] : []);
    if (list.length === 0) {
      setOrders([]);
      setSelected(null);
      toast.error('주문을 찾을 수 없습니다. 전화번호·비밀번호를 확인해 주세요.');
      return;
    }
    setOrders(list);
    setSelected(list.length === 1 ? list[0] : null);
  };

  return (
    <Wrappers>
      <Typography variant="h5" sx={{ fontWeight: 800, textAlign: 'center', mt: 2, mb: 0.5 }}>비회원 주문조회</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}>
        주문 시 입력한 전화번호와 주문비밀번호를 입력해 주세요.
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField fullWidth size="small" label="전화번호" placeholder="010-1234-5678" value={form.buyer_phone}
              onChange={(e) => setForm({ ...form, buyer_phone: e.target.value })}
              onKeyPress={(e) => { if (e.key === 'Enter') onSearch(); }} />
            <TextField fullWidth size="small" type="password" label="주문 비밀번호" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyPress={(e) => { if (e.key === 'Enter') onSearch(); }} />
            <Button variant="contained" size="large" disabled={loading} onClick={onSearch}>
              {loading ? '조회 중...' : '주문조회'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 여러 건 → 목록에서 선택 */}
      {orders && orders.length > 1 && !selected && (
        <Card sx={{ mb: 2 }}>
          <CardHeader title={`주문 내역 (${orders.length}건)`} subheader="확인할 주문을 선택하세요." />
          <CardContent sx={{ pt: 0 }}>
            <Stack spacing={1.5}>
              {orders.map((o, i) => (
                <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, cursor: 'pointer' }}
                  onClick={() => setSelected(o)}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2">{o?.ord_num}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {getTrxStatusByNumber(o?.trx_status)} · {(o?.orders?.[0]?.order_name) || '-'}
                        {o?.orders?.length > 1 ? ` 외 ${o.orders.length - 1}건` : ''}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2">{won(o?.amount)}</Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* 단건 상세 */}
      {selected && (
        <>
          {orders && orders.length > 1 && (
            <Button size="small" onClick={() => setSelected(null)} sx={{ mb: 1 }}>← 목록으로</Button>
          )}
          <OrderDetail order={selected} />
        </>
      )}
    </Wrappers>
  );
};

OrderCheck.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default OrderCheck;
