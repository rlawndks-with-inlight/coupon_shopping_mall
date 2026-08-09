import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import ShopLayout from 'src/layouts/shop/ShopLayout';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import styled from 'styled-components';

const Wrappers = styled.div`
  max-width: 720px;
  width: 92%;
  min-height: 70vh;
  margin: 4vh auto 8vh;
`;

// 라벨-값 한 줄
const KV = ({ k, v, strong }) => (
  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ py: 0.75 }}>
    <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', mr: 2 }}>{k}</Typography>
    <Typography variant="body2" sx={{ fontWeight: strong ? 800 : 600, textAlign: 'right' }}>{v || '-'}</Typography>
  </Stack>
);

// 주문완료 페이지 — 수기 카드결제 성공 직후 이동. sessionStorage('lastOrder')에 담긴 주문 요약을 표시.
// 외부 PG 결제는 기존 /shop/auth/pay-result 가 처리한다.
const OrderComplete = () => {
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();
const { user } = useAuthContext();
  const isBlogOnly = !(themeDnsData?.shop_demo_num > 0) && themeDnsData?.blog_demo_num > 0;
  const [order, setOrder] = useState(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('lastOrder');
      if (raw) setOrder(JSON.parse(raw));
      sessionStorage.removeItem('lastOrder'); // 1회성 — 표시 후 즉시 제거
    } catch (e) { /* noop */ }
  }, []);

  const won = (n) => `${Number(n || 0).toLocaleString()}원`;
  const products = order?.products || [];
  const receiver = order?.receiver || order?.buyer_name;
  const phone = order?.addr_phone || order?.buyer_phone;

  return (
    <Wrappers>
      <Stack alignItems="center" spacing={0.5} sx={{ py: 4 }}>
        <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#141414', color: '#9ee54e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon icon="mdi:check-bold" width={32} height={32} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, mt: 1 }}>주문이 완료되었습니다</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>주문해 주셔서 감사합니다. 아래 주문번호로 조회하실 수 있습니다.</Typography>
      </Stack>

      {order ? (
        <>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <KV k="주문번호" v={order?.ord_num} strong />
              {order?.appr_num && <KV k="승인번호" v={order?.appr_num} />}
              <Divider sx={{ my: 1.5 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography variant="subtitle2">결제금액</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900 }}>{won(order?.amount)}</Typography>
              </Stack>
            </CardContent>
          </Card>

          {(order?.addr || receiver) && (
            <Card sx={{ mb: 2 }}>
              <CardHeader title="배송지" />
              <CardContent sx={{ pt: 0 }}>
                {receiver && <KV k="받는분" v={`${receiver}${phone ? ' · ' + phone : ''}`} />}
                {order?.addr && <KV k="주소" v={`${order?.zonecode ? '(' + order?.zonecode + ') ' : ''}${order?.addr} ${order?.detail_addr || ''}`} />}
              </CardContent>
            </Card>
          )}

          {products.length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardHeader title="주문상품" />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1}>
                  {products.map((p, i) => (
                    <Stack key={i} direction="row" justifyContent="space-between">
                      <Typography variant="body2">{p?.order_name} · {p?.order_count}개</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{won(p?.order_amount)}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          )}

          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', textAlign: 'center', mb: 2 }}>
            승인번호·배송현황은 주문내역에서 확인하실 수 있습니다.<br />
            비회원은{' '}
            <Box component="a" onClick={() => router.push('/shop/auth/order-check')}
              sx={{ color: 'primary.main', textDecoration: 'underline', cursor: 'pointer' }}>전화번호+주문비밀번호로 조회</Box>
            할 수 있습니다.
          </Typography>
        </>
      ) : (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography align="center" sx={{ color: 'text.secondary' }}>주문이 접수되었습니다. 주문내역에서 상세를 확인해 주세요.</Typography>
          </CardContent>
        </Card>
      )}

      {/* 블로그 전용 브랜드(shop_demo_num=0)는 /shop/* 경로가 없다.
          기존엔 무조건 /shop 과 /shop/auth/history 로 보내서, 결제 직후 가장 많이 눌리는
          '주문내역 보기'가 백지(새로고침 시 404)가 됐다. 브랜드 유형에 맞는 경로로 보낸다. */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
        <Button fullWidth variant="outlined" color="inherit" onClick={() => router.push(isBlogOnly ? '/shop' : '/shop')}>쇼핑 계속하기</Button>
        {/* 비회원은 /shop/auth/history 가 늘 빈 표다(회원 주문만 조회한다).
            결제 직후 가장 많이 눌리는 버튼이라 '주문이 사라졌다'로 읽힌다.
            비회원은 전화번호+주문비밀번호로 보는 주문조회로 보낸다. */}
        <Button fullWidth variant="contained"
          onClick={() => router.push(user?.id ? '/shop/auth/history' : '/shop/auth/order-check')}>
          {user?.id ? '주문내역 보기' : '주문 조회하기'}
        </Button>
      </Stack>
    </Wrappers>
  );
};

OrderComplete.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default OrderComplete;
