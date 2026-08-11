import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import styled from 'styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useLocales } from 'src/locales';

// 공용 결제결과 화면 — 데모 구분 없는 단일 화면.
//
// [왜 공용인가]
//  PG 복귀 URL 이 /shop/auth/pay-result 로 고정이라 블로그형 브랜드(shop_demo_num=0)도 반드시 여기로 온다.
//  기존엔 shop_demo_num 으로 9개 데모 화면을 분기해서
//   · 블로그형은 어느 분기에도 안 걸려 백지가 됐고,
//   · 폴백으로 shop 데모1 화면을 붙이면 블로그 레이아웃 안에 쇼핑몰 톤 본문이 들어가 결이 어긋났다.
//  주문완료(order-complete)와 같이 중립적인 한 벌로 만들어 어느 프레임에서든 자연스럽게 보이게 한다.
//
// [표시 데이터]
//  PG 가 쿼리스트링으로 돌려주는 값만 쓴다(서버 조회 없음).
//  result_cd '0000' = 성공, 그 외 = 실패. 브랜드 77 은 테스트 결제 안내를 따로 띄운다(기존 동작 유지).

const Wrappers = styled.div`
  max-width: 720px;
  width: 92%;
  min-height: 70vh;
  margin: 4vh auto 8vh;
`;

// 라벨-값 한 줄. 값이 없으면 줄 자체를 그리지 않는다(PG마다 돌려주는 필드가 달라서).
const KV = ({ k, v }) => {
  if (v === undefined || v === null || v === '') return null;
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ py: 0.75 }}>
      <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'nowrap', mr: 2 }}>{k}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right', wordBreak: 'break-all' }}>{v}</Typography>
    </Stack>
  );
};

const PayResultView = () => {
  const router = useRouter();
  const { translate } = useLocales();
  const { themeDnsData, onChangeCartData } = useSettingsContext();
const { user } = useAuthContext();

  const isBlogOnly = !(themeDnsData?.shop_demo_num > 0) && themeDnsData?.blog_demo_num > 0;
  const mainColor = themeDnsData?.theme_css?.main_color || '#111111';

  const q = router.query || {};
  const isTestBrand = themeDnsData?.id == 77;   // 기존 동작 보존
  const isSuccess = q.result_cd === '0000';

  // 결제 성공으로 돌아왔으면 장바구니를 비운다.
  //
  // 예전엔 장바구니 비우기가 수기 카드결제 성공 경로(OrderSheet 의 onPayByHand)에만 있었다.
  // 인증결제·페이레터·포스페이·무통장입금·상품권처럼 PG 창으로 나갔다 돌아오는 결제는
  // 그 코드를 지나지 않아, 결제를 마치고 와도 방금 산 상품이 장바구니에 그대로 남았다.
  // 고객이 '결제가 안 됐나' 하고 다시 주문하면 이중 결제가 된다(백엔드에 중복 주문 방어가 없다).
  //
  // 리다이렉트형 PG 는 복귀 시점이 유일한 훅이라 여기서 처리한다.
  // 바로구매(buyNowItem)는 장바구니를 거치지 않으므로 그 항목만 정리한다.
  const clearedRef = useRef(false);
  useEffect(() => {
    if (!router.isReady) return;          // 첫 렌더에는 query 가 비어 있다
    if (!isSuccess || clearedRef.current) return;
    clearedRef.current = true;
    try { sessionStorage.removeItem('buyNowItem'); } catch (e) { /* noop */ }
    onChangeCartData([]);
  }, [router.isReady, isSuccess]);

  const view = isTestBrand
    ? { icon: 'mdi:progress-clock', color: '#f0a020', title: translate('테스트결제 진행중입니다.') }
    : isSuccess
      ? { icon: 'mdi:check-circle-outline', color: mainColor, title: translate('결제에 성공하였습니다.') }
      : { icon: 'mdi:close-circle-outline', color: '#d33', title: translate('결제에 실패하였습니다.') };

  // 할부개월: '00' = 일시불, 그 외 앞자리 0 을 떼고 'N개월'
  const installment = q.installment
    ? (q.installment === '00'
      ? translate('일시불')
      // 개월수는 보간으로 넘긴다 — 'N개월' 의 어순이 언어마다 다르다.
      : translate('{{n}}개월', { n: String(q.installment).replace(/^0+/, '') }))
    : undefined;

  // 승인일시: PG가 'YYYYMMDDHHmmss' 로 준다. 읽기 좋게 끊어 준다.
  const trxDttm = (() => {
    const v = String(q.trx_dttm || '');
    if (v.length < 14) return q.trx_dttm || undefined;
    return `${v.slice(0, 4)}-${v.slice(4, 6)}-${v.slice(6, 8)} ${v.slice(8, 10)}:${v.slice(10, 12)}`;
  })();

  const hasDetail = q.ord_num || q.acquirer || installment || q.buyer_name || q.buyer_phone || trxDttm;

  return (
    <Wrappers>
      <Stack alignItems="center" sx={{ pt: 4, pb: 3 }}>
        <Icon icon={view.icon} style={{ fontSize: '4.5rem', color: view.color }} />
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 1.5, textAlign: 'center' }}>
          {view.title}
        </Typography>
        {!isSuccess && !isTestBrand && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, textAlign: 'center' }}>{translate('결제가 완료되지 않았습니다. 다시 시도해 주세요.')}</Typography>
        )}
      </Stack>

      {hasDetail && (
        <Card sx={{ mb: 2 }}>
          <CardHeader title={translate('결제 정보')} />
          <CardContent sx={{ pt: 0 }}>
            <KV k={translate("주문번호")} v={q.ord_num} />
            <KV k={translate("승인일시")} v={trxDttm} />
            <KV k={translate("매입사")} v={q.acquirer} />
            <KV k={translate("할부기간")} v={installment} />
            <KV k={translate("구매자")} v={q.buyer_name} />
            <KV k={translate("연락처")} v={q.buyer_phone} />
          </CardContent>
        </Card>
      )}

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
        <Button fullWidth variant="outlined" color="inherit"
          onClick={() => router.push(isBlogOnly ? '/shop' : '/shop')}>{translate('쇼핑 계속하기')}</Button>
        {/* 실패 시엔 주문내역이 없으므로 장바구니로 되돌려 재시도를 돕는다.
            성공이어도 비회원은 /shop/auth/history 가 늘 빈 표라(회원 주문만 조회한다)
            전화번호+주문비밀번호로 보는 주문조회로 보낸다. */}
        <Button fullWidth variant="contained"
          onClick={() => router.push(
            isSuccess
              ? (user?.id ? '/shop/auth/history' : '/shop/auth/order-check')
              : '/shop/auth/cart'
          )}>
          {isSuccess ? (user?.id ? translate("주문내역 보기") : translate("주문 조회하기")) : translate("장바구니로")}
        </Button>
      </Stack>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>{translate('결제 관련 문의는 판매자 고객센터로 연락해 주세요.')}</Typography>
      </Box>
    </Wrappers>
  );
};

export default PayResultView;
