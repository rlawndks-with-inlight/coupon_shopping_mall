import { useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Divider, Stack, TextField, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import styled from 'styled-components';
import ShopLayout from 'src/layouts/shop/ShopLayout';
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';
import OrderCancelButton, { canCancelOrder } from 'src/components/elements/shop/OrderCancelButton';
import { commarNumber, sanitizePhoneInput, getOrderStatusText, getPriceUnitByLang } from 'src/utils/function';
import { useLocales } from 'src/locales';
import PasswordField from 'src/components/elements/PasswordField';

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

const won = (n) => `${commarNumber(n || 0)}${getPriceUnitByLang()}`; // 통화 단위는 언어별(원/$ 등) — '원' 고정이면 외국어 화면에서 튄다

// 주문 상세(읽기전용) — 회원/비회원 공통 표시
const OrderDetail = ({ order }) => {
  const { translate } = useLocales();
  const track = parseInvoice(order?.invoice_num);
  const receiver = order?.receiver || order?.buyer_name;
  return (
    <>
      <Card sx={{ mb: 2 }}>
        <CardHeader title={translate('주문 정보')} />
        <CardContent sx={{ pt: 0 }}>
          <KV k={translate('주문번호')} v={order?.ord_num} strong />
          {order?.appr_num && <KV k={translate('승인번호')} v={order?.appr_num} />}
          {(order?.trx_dt || order?.trx_tm) && <KV k={translate('승인일시')} v={`${order?.trx_dt || ''} ${order?.trx_tm || ''}`.trim()} />}
          {!!order?.acquirer && <KV k={translate('매입사')} v={order?.acquirer} />}
          {/* installment 가 숫자 0(일시불)이면 `0 && ...` 이 0 으로 평가돼 화면에 '0' 이 찍혔다.
              할부가 실제로 있을 때(개월>0)만 표시한다 — 일시불/0/빈값은 숨긴다. */}
          {Number(order?.installment) > 0 && <KV k={translate('할부기간')} v={translate('{{n}}개월', { n: String(Number(order?.installment)) })} />}
          <KV k={translate('주문현황')} v={getOrderStatusText(order)} />
          <KV k={translate('구매자')} v={`${order?.buyer_name || '-'}${order?.buyer_phone ? ' · ' + order?.buyer_phone : ''}`} />
          {order?.invoice_num && (
            <KV k={translate("택배사/송장")} v={track
              ? <>{track.courier ? track.courier + ' · ' : ''}{track.invoice}
                <Box component="a" href={track.url} target="_blank" rel="noreferrer" sx={{ ml: 1, color: 'primary.main', textDecoration: 'underline' }}>{translate('배송조회')}</Box></>
              : order?.invoice_num} />
          )}
        </CardContent>
      </Card>

      {(order?.addr || receiver) && (
        <Card sx={{ mb: 2 }}>
          <CardHeader title={translate('배송지')} />
          <CardContent sx={{ pt: 0 }}>
            {receiver && <KV k={translate("받는분")} v={`${receiver}${order?.receiver_phone ? ' · ' + order?.receiver_phone : ''}`} />}
            {order?.addr && <KV k={translate('주소')} v={`${order?.zonecode ? '(' + order?.zonecode + ') ' : ''}${order?.addr} ${order?.detail_addr || ''}`} />}
          </CardContent>
        </Card>
      )}

      <Card sx={{ mb: 2 }}>
        <CardHeader title={translate('주문상품')} />
        <CardContent sx={{ pt: 0 }}>
          <Stack spacing={1} divider={<Divider flexItem />}>
            {(order?.orders || []).map((o, i) => (
              <Stack key={i} direction="row" justifyContent="space-between">
                <Typography variant="body2">{o?.order_name} · {o?.order_count}{translate('개')}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{won(o?.order_amount)}</Typography>
              </Stack>
            ))}
          </Stack>
          <Divider sx={{ my: 1.5 }} />
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="subtitle2">{translate('결제금액')}</Typography>
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
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const [form, setForm] = useState({ buyer_phone: '', password: '' });
  const [orders, setOrders] = useState(null); // 조회 결과(배열) / null=미조회
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const onSearch = async () => {
    if (!form.buyer_phone || !form.password) {
      toast.error(translate('전화번호와 주문 비밀번호를 입력해 주세요.'));
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
      toast.error(translate('주문을 찾을 수 없습니다. 전화번호·비밀번호를 확인해 주세요.'));
      return;
    }
    setOrders(list);
    // 취소요청 직후에도 이 함수로 다시 조회한다. 그때 보던 주문을 그대로 열어 둬야
    // 손님이 "요청이 됐나" 를 바로 확인할 수 있다(예전 방식대로면 목록으로 튕긴다).
    setSelected((prev) => {
      const 보던것 = prev?.ord_num && list.find((o) => o?.ord_num === prev.ord_num);
      return 보던것 || (list.length === 1 ? list[0] : null);
    });
  };

  return (
    <Wrappers>
      <Typography variant="h5" sx={{ fontWeight: 800, textAlign: 'center', mt: 2, mb: 0.5 }}>{translate('비회원 주문조회')}</Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}>{translate('주문 시 입력한 전화번호와 주문비밀번호를 입력해 주세요.')}</Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField fullWidth size="small" label={translate('전화번호')} placeholder="010-1234-5678" value={form.buyer_phone}
              inputMode="tel"
              onChange={(e) => setForm({ ...form, buyer_phone: sanitizePhoneInput(e.target.value) })}
              onKeyPress={(e) => { if (e.key === 'Enter') onSearch(); }} />
            <PasswordField fullWidth size="small" label={translate('주문 비밀번호')} value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onKeyPress={(e) => { if (e.key === 'Enter') onSearch(); }} />
            <Button variant="contained" size="large" disabled={loading} onClick={onSearch}>
              {loading ? translate('조회 중...') : translate('주문조회')}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* 여러 건 → 목록에서 선택 */}
      {orders && orders.length > 1 && !selected && (
        <Card sx={{ mb: 2 }}>
          <CardHeader title={`주문 내역 (${orders.length}건)`} subheader={translate("확인할 주문을 선택하세요.")} />
          <CardContent sx={{ pt: 0 }}>
            <Stack spacing={1.5}>
              {orders.map((o, i) => (
                <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, cursor: 'pointer' }}
                  onClick={() => setSelected(o)}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="subtitle2">{o?.ord_num}</Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {getOrderStatusText(o)} · {(o?.orders?.[0]?.order_name) || '-'}
                        {o?.orders?.length > 1 ? ` ${translate('외 {{n}}건', { n: String(o.orders.length - 1) })}` : ''}
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
            <Button size="small" onClick={() => setSelected(null)} sx={{ mb: 1 }}>{translate('← 목록으로')}</Button>
          )}
          <OrderDetail order={selected} />
          {/* 비회원도 스스로 취소요청을 할 수 있어야 한다.
              예전엔 이 화면에 취소 수단이 없었다. 비회원 주문은 user_id 가 0 이라
              서버의 로그인 대조를 통과할 수 없었고, 취소는 늘 「권한이 없습니다」로 막혔다.
              전체 주문의 대부분이 비회원이라 그 문의가 전부 가맹점 전화로 갔다.
              여기서 방금 조회에 쓴 주문비밀번호를 그대로 본인 확인에 쓴다. */}
          {canCancelOrder(selected) && (
            <Stack direction="row" justifyContent="flex-end" sx={{ mb: 3 }}>
              <OrderCancelButton
                trx={selected}
                orders={selected?.orders}
                password={form.password}
                onDone={onSearch}
              />
            </Stack>
          )}
        </>
      )}
    </Wrappers>
  );
};

OrderCheck.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default OrderCheck;
