import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { Box, Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import { Icon } from '@iconify/react';
import styled from 'styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useLocales } from 'src/locales';
import { apiManager } from 'src/utils/api';
import { clearOrderDraft, peekRetryDraft } from 'src/utils/order-draft';
import { 비회원조회주소 } from 'src/utils/guest-lookup';

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
//  result_cd '0000' = 성공, '0001' = 확인 중(포스페이 복귀 시점에 거래조회가 아직 안 끝남), 그 외 = 실패.
//  브랜드 77 은 테스트 결제 안내를 따로 띄운다(기존 동작 유지).

const Wrappers = styled.div`
  max-width: 720px;
  width: 92%;
  min-height: 70vh;
  margin: 4vh auto 8vh;
`;

// 실패 사유는 서버가 정한 문구를 받아 보여 준다 — 같은 이유는 결제수단과 관계없이 같은 문구, 묶지 않은 것은 원문 그대로
// (back utils.js/payments/fail-reason.js, 2026-11-11).
// 서버 문구라도 한 번 더 거른다 — 포스페이가 SQL 원문을 보낸 적이 있다(scripts/checks/pg-message.mjs).
const 손님용사유 = (code, message) => {
  const s = String(message ?? '').replace(/\s+/g, ' ').trim();
  if (!s || s.length > 200) return '';
  // 긴 숫자는 전화번호·계좌번호일 수 있다 — 이 문구는 손님 브라우저를 거쳐 오므로 연락처가 든 문구는 믿지 않는다
  // 대괄호는 막지 않는다 — 통일하지 않은 문구는 결제사 코드([-780] 등)까지 원문 그대로 보여 준다(2026-11-11)
  if (/[{}<>=;`$]|SQL|exception|https?:|\d[\d\s-]{6,}/i.test(s)) return '';
  return s;
};

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

  // 확인 중(0001): 결제창에서 돌아온 순간 포스페이 거래조회가 늦거나 아직 승인 전이면 서버가 '실패' 대신 0001 을 준다.
  // 예전엔 곧바로 '결제에 실패하였습니다' + 「장바구니로」를 보여 줘서, 실제로는 결제된 손님이 다시 결제할 수 있었다
  // (2026-10-19 오픈 전 점검). 여기서 몇 번 더 서버 확정(confirm)을 물어 본 뒤에 판단한다.
  const isPending = q.result_cd === '0001';
  // PC 팝업(VERIFY): 팝업 메시지(win_cd)만으로 결과를 정하지 않는다. 서버가 모바일 복귀와 같은 판정으로 정한 코드로
  // 주소를 바꿔 달면, 아래 화면 분기가 모바일과 똑같이 돈다(2026-11-06). 판정 요청이 실패하면 '모름'(0001)이다.
  const isVerify = q.result_cd === 'VERIFY';
  useEffect(() => {
    if (!router.isReady || !isVerify) return;
    const ord = String(q.ord_num || '');
    let message = '';
    try {
      const 저장값 = JSON.parse(sessionStorage.getItem('forspayFail') || 'null');
      if (저장값?.ord_num === ord) message = String(저장값.message ?? '');
    } catch (e) { /* 사유 없이 간다 */ }
    let 멈춤 = false;
    (async () => {
      let 판정 = { result_cd: '0001', ord_num: ord };
      try {
        const r = await apiManager('pays/forspay/verify', 'create', { ord_num: ord, code: String(q.win_cd || ''), message });
        if (r?.result_cd) 판정 = { result_cd: String(r.result_cd), ord_num: ord, ...(r.trx_dttm ? { trx_dttm: String(r.trx_dttm) } : {}) };
      } catch (e) { /* 모름 → 확인 중 */ }
      if (!멈춤) router.replace({ pathname: router.pathname, query: 판정 });
    })();
    return () => { 멈춤 = true; };
  }, [router.isReady, isVerify]);
  const [확인상태, set확인상태] = useState('idle'); // idle | checking | confirmed | unknown
  useEffect(() => {
    if (!router.isReady || !isPending || 확인상태 !== 'idle') return;
    const ord = String(q.ord_num || '');
    if (!ord) { set확인상태('unknown'); return; }
    set확인상태('checking');
    let 멈춤 = false;
    (async () => {
      for (let i = 0; i < 6 && !멈춤; i++) {
        await new Promise((r) => setTimeout(r, 3000));
        try {
          const r = await apiManager('pays/forspay/confirm', 'create', { ord_num: ord });
          if (r?.settled) { if (!멈춤) set확인상태('confirmed'); return; }
        } catch (e) { /* 다음 회차에 다시 */ }
      }
      if (!멈춤) set확인상태('unknown');
    })();
    return () => { 멈춤 = true; };
  }, [router.isReady, isPending]);
  const 확인중 = isVerify || (isPending && (확인상태 === 'idle' || 확인상태 === 'checking'));
  const 확인불명 = isPending && 확인상태 === 'unknown';
  const isSuccess = q.result_cd === '0000' || (isPending && 확인상태 === 'confirmed');
  // 손님이 결제창을 닫거나 취소한 경우 — '실패'가 아니라 '취소'로 보여 준다(2026-10-22 사장님).
  //   CANCEL : 우리 서버 복귀 경로에서 포스페이에 거래가 아예 없을 때(모바일에서 결제창 X → 409 not_found)
  //   PV999  : 포스페이 문서 「Buyer cancelled in the payment window」(PC 팝업 FORSPAY_RESULT)
  // 그 밖의 코드(PV9999 미지원 기능, 카드 거절 등)는 그대로 '결제에 실패하였습니다'.
  const isCanceled = ['CANCEL', 'PV999'].includes(String(q.result_cd ?? ''));

  // 결제창이 알려 준 실패 사유 — 손님에게 보여 주고, 가맹점 「결제실패/미완료」 목록에 남긴다(포스페이 요청 2026-11-04 ④).
  // 주문번호가 맞을 때만 쓴다. 저장은 표시용이고 주문 상태를 바꾸지 않는다.
  const [실패사유, set실패사유] = useState('');
  useEffect(() => {
    if (!router.isReady || isSuccess || isPending || isVerify) return;
    const ord = String(q.ord_num || '');
    const code = String(q.result_cd || '');
    if (!ord || !code) return;
    let message = '';
    try {
      const 저장값 = JSON.parse(sessionStorage.getItem('forspayFail') || 'null');
      if (저장값?.ord_num === ord) message = String(저장값.message ?? '');
    } catch (e) { /* 사유 없이 간다 */ }
    // PC 는 결제창 원문을 보내 남기고, 모바일은 복귀 때 서버가 이미 받아 뒀다 — 어느 쪽이든 서버가 정한 문구를 받아 보여 준다
    apiManager('pays/forspay/fail-reason', 'create', { ord_num: ord, code, message })
      .then((r) => { if (!isCanceled) set실패사유(손님용사유(code, r?.message)); })
      .catch(() => { });
  }, [router.isReady, isSuccess, isPending, isVerify, q.ord_num, q.result_cd]);

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
    // 주문이 끝났으니 쓰다 만 주문서 내용(주문자·배송지)도 지운다.
    // 수기결제·무통장은 OrderSheet 가 지우는데, 포스페이처럼 결제창으로 나갔다 이 화면으로 돌아오는 결제는
    // 그 코드를 지나지 않아 다음 주문서에 지난 손님 정보가 그대로 떴다(가맹점 요청서 2026-09-11 ③).
    clearOrderDraft();
  }, [router.isReady, isSuccess]);

  // 포스페이 서버 확정.
  //
  // 문서상 브라우저 복귀(return_url·FORSPAY_RESULT)는 UX용이라 정산 근거가 못 된다.
  // 특히 PC 팝업 흐름은 결과를 받으면 이 프론트 페이지로 바로 와서 backend /forspay/return(정산)을
  // 건너뛴다 → 승인됐는데 결제대기로 남는다. 여기서 거래조회 기반 서버 확정을 한 번 호출해
  // approved 면 정산(멱등·원자적)시켜 그 구멍을 메운다. (모바일 리다이렉트는 이미 return 에서
  // 정산돼 멱등 no-op) 포스페이(FS) 성공 복귀에만 건다 — 다른 PG/실패 화면은 건드리지 않는다.
  // 화면 표시는 URL 파라미터 기준 그대로라, 이 호출이 실패해도 페이지는 정상이다(웹훅·대사가 나중에 메움).
  const confirmedRef = useRef(false);
  useEffect(() => {
    if (!router.isReady || confirmedRef.current) return;
    const ord = String(q.ord_num || '');
    if (!isSuccess || !ord.startsWith('FS')) return;
    confirmedRef.current = true;
    (async () => {
      try { await apiManager('pays/forspay/confirm', 'create', { ord_num: ord }); } catch (e) { /* best-effort */ }
    })();
  }, [router.isReady, isSuccess]);

  const view = isTestBrand
    ? { icon: 'mdi:progress-clock', color: '#f0a020', title: translate('테스트결제 진행중입니다.') }
    : isSuccess
      ? { icon: 'mdi:check-circle-outline', color: mainColor, title: translate('결제에 성공하였습니다.') }
      : 확인중
        ? { icon: 'mdi:progress-clock', color: '#f0a020', title: translate('결제를 확인하고 있습니다.') }
        : 확인불명
          ? { icon: 'mdi:help-circle-outline', color: '#f0a020', title: translate('결제 확인이 늦어지고 있습니다.') }
          : isCanceled
            ? { icon: 'mdi:close-circle-outline', color: '#9e9e9e', title: translate('결제가 취소되었습니다.') }
            : { icon: 'mdi:close-circle-outline', color: '#d33', title: translate('결제에 실패하였습니다.') };

  // 할부개월: '00' = 일시불, 그 외 앞자리 0 을 떼고 'N개월'
  const installment = q.installment
    ? (q.installment === '00'
      ? translate('일시불')
      // 개월수는 보간으로 넘긴다 — 'N개월' 의 어순이 언어마다 다르다.
      : translate('{{n}}개월', { n: String(q.installment).replace(/^0+/, '') }))
    : undefined;

  // 승인일시: PG 마다 모양이 다르다 — 'YYYYMMDDHHmmss'(예전 PG) 또는 'YYYY-MM-DD HH:mm:ss'(포스페이).
  // 숫자만 골라 끊는다. 예전엔 앞의 모양만 가정하고 자리로 잘라서, 포스페이 값이
  // '2026--1-0- 22: 1' 로 보였다(2026-10-22 발견).
  const trxDttm = (() => {
    const v = String(q.trx_dttm || '');
    const d = v.replace(/\D/g, '');
    if (d.length < 12) return v || undefined;
    return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)} ${d.slice(8, 10)}:${d.slice(10, 12)}`;
  })();

  const hasDetail = q.ord_num || q.acquirer || installment || q.buyer_name || q.buyer_phone || trxDttm;

  // 결제가 안 된 주문의 입력값으로 주문서로 돌아가기(2026-11-09 사장님 결정 + 가맹점 기준).
  //   취소(결제창 닫기·취소) → 이 화면을 거치지 않고 그 주문서로 바로 돌아간다
  //   실패(잔액 부족 등)     → 실패 사유를 보여 주고 「다시 결제하기」
  //   확인 지연              → 「다시 결제하기」. 단 결제됐을 수 있으니 누를 때 서버에 한 번 더 묻고, 그래도 모르면 확인 창
  // 이 탭에 그 주문의 입력값이 없으면(다른 탭·앱에서 돌아옴 등) 예전처럼 장바구니로 안내한다.
  const [다시결제, set다시결제] = useState(null);
  const 결제안됨 = router.isReady && !isTestBrand && !isSuccess && !확인중;
  useEffect(() => {
    set다시결제(결제안됨 ? peekRetryDraft(String(q.ord_num || '')) : null);
  }, [결제안됨, q.ord_num]);
  const 주문서로 = (replace = false) => {
    const ord = encodeURIComponent(String(q.ord_num || ''));
    const url = `/shop/auth/order?${다시결제?.buynow ? 'buynow=1&' : ''}retry=${ord}`;
    if (replace) router.replace(url); else router.push(url);
  };
  // 취소는 바로 돌아간다(뒤로 가기에 이 화면이 남지 않게 replace). 실패 사유 기록(위 effect)은 이미 보낸 뒤다.
  const 바로돌아감 = !!다시결제 && isCanceled && !확인불명;
  useEffect(() => {
    if (!바로돌아감) return;
    toast(translate('결제가 취소되었습니다.'));
    주문서로(true);
  }, [바로돌아감]);
  const [지연확인창, set지연확인창] = useState(false);
  const [다시묻는중, set다시묻는중] = useState(false);
  const 다시결제하기 = async () => {
    if (!확인불명) { 주문서로(); return; }
    set다시묻는중(true);
    try {
      const r = await apiManager('pays/forspay/confirm', 'create', { ord_num: String(q.ord_num || '') });
      if (r?.settled) {
        set확인상태('confirmed');
        toast.success(translate('결제가 확인되었습니다.'));
        return;
      }
    } catch (e) { /* 모름 → 확인 창 */ } finally { set다시묻는중(false); }
    set지연확인창(true);
  };

  return (
    <Wrappers>
      <Stack alignItems="center" sx={{ pt: 4, pb: 3 }}>
        <Icon icon={view.icon} style={{ fontSize: '4.5rem', color: view.color }} />
        <Typography variant="h6" sx={{ fontWeight: 800, mt: 1.5, textAlign: 'center' }}>
          {view.title}
        </Typography>
        {!isSuccess && !isTestBrand && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.75, textAlign: 'center', wordBreak: 'keep-all' }}>
            {확인중
              ? translate('잠시만 기다려 주세요. 창을 닫거나 다시 결제하지 마세요.')
              : 확인불명
                ? translate('카드사·간편결제 앱에서 결제 여부를 확인해 주세요. 결제되었다면 주문내역에 곧 반영되고, 결제되지 않았다면 다시 주문해 주세요.')
                : isCanceled
                  ? translate('결제가 진행되지 않아 주문이 접수되지 않았습니다.')
                  : translate('결제가 완료되지 않았습니다. 다시 시도해 주세요.')}
          </Typography>
        )}
        {실패사유 && !isTestBrand && (
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5, textAlign: 'center', wordBreak: 'keep-all' }}>
            {translate('실패 사유')}: {translate(실패사유)}
          </Typography>
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

      <Dialog open={지연확인창} onClose={() => set지연확인창(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{translate('결제 여부를 먼저 확인해 주세요')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ wordBreak: 'keep-all' }}>
            {translate('결제가 됐는지 아직 확인되지 않았습니다. 카드사·간편결제 앱에서 결제되지 않은 것을 확인한 뒤 다시 결제해 주세요. 이미 결제된 상태에서 다시 결제하면 두 번 결제됩니다.')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => set지연확인창(false)}>{translate('취소')}</Button>
          <Button variant="contained" onClick={() => { set지연확인창(false); 주문서로(); }}>{translate('확인했습니다, 다시 결제하기')}</Button>
        </DialogActions>
      </Dialog>

      {바로돌아감 ? null : 다시결제 ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
          {확인불명 ? (
            <Button fullWidth variant="outlined" color="inherit"
              onClick={() => router.push(user?.id ? '/shop/auth/history' : 비회원조회주소(q.ord_num))}>
              {user?.id ? translate("주문내역 보기") : translate("주문 조회하기")}
            </Button>
          ) : (
            <Button fullWidth variant="outlined" color="inherit" onClick={() => router.push('/shop/auth/cart')}>
              {translate('장바구니로')}
            </Button>
          )}
          <Button fullWidth variant="contained" disabled={다시묻는중} onClick={다시결제하기}>{translate('다시 결제하기')}</Button>
        </Stack>
      ) : (
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
        <Button fullWidth variant="outlined" color="inherit"
          onClick={() => router.push(isBlogOnly ? '/shop' : '/shop')}>{translate('쇼핑 계속하기')}</Button>
        {/* 실패 시엔 주문내역이 없으므로 장바구니로 되돌려 재시도를 돕는다.
            성공이어도 비회원은 /shop/auth/history 가 늘 빈 표라(회원 주문만 조회한다)
            전화번호+주문비밀번호로 보는 주문조회로 보낸다. */}
        <Button fullWidth variant="contained" disabled={확인중}
          onClick={() => router.push(
            (isSuccess || 확인불명)
              ? (user?.id ? '/shop/auth/history' : 비회원조회주소(q.ord_num)) // 비회원은 조회하면 이 주문 상세가 바로 열린다
              : '/shop/auth/cart'
          )}>
          {(isSuccess || 확인중 || 확인불명) ? (user?.id ? translate("주문내역 보기") : translate("주문 조회하기")) : translate("장바구니로")}
        </Button>
      </Stack>
      )}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" sx={{ color: 'text.disabled' }}>{translate('결제 관련 문의는 판매자 고객센터로 연락해 주세요.')}</Typography>
      </Box>
    </Wrappers>
  );
};

export default PayResultView;
