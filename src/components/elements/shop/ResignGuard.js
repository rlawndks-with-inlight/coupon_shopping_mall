import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Alert, Button, Stack, Typography } from '@mui/material';
import { apiManager } from 'src/utils/api';
import { useLocales } from 'src/locales';
import { commarNumber, getPriceUnitByLang } from 'src/utils/function';

// 탈퇴 전 확인 — 진행 중인 주문이 있으면 막는다(2026-09-17 결정).
//
// [왜]
//  탈퇴하면 로그인이 막히는데, 회원 주문은 주문비밀번호가 빈 값이라 비회원 주문조회로도
//  안 잡힌다. 배송 중에 탈퇴하면 손님이 자기 주문을 확인할 길이 아예 사라진다.
//  (홈앤쇼핑·무신사 등도 '주문/배송/취소/교환/반품 진행중'이면 즉시 탈퇴를 막는다)
//
// [주의] **막는 최종 판단은 서버가 한다**(utils.js/resign-guard.js).
//  이 화면 검사는 비밀번호를 치기 전에 미리 알려 주기 위한 것일 뿐이다.
//  그래서 조회에 실패하면 여기서는 막지 않는다 — 못 물어봤다고 손님을 가두면 그게 '탈퇴 방해'다.

export const useResignGuard = (enabled = true) => {
    const [state, setState] = useState({ loading: !!enabled, canResign: true, orders: [], point: 0 });

    useEffect(() => {
        if (!enabled) return undefined;
        let 살아있음 = true;
        (async () => {
            const r = await apiManager('auth/resign-check', 'get', {});
            if (!살아있음) return;
            if (!r) { setState({ loading: false, canResign: true, orders: [], point: 0 }); return; }
            setState({
                loading: false,
                canResign: !!r?.can_resign,
                orders: Array.isArray(r?.orders) ? r.orders : [],
                point: Number(r?.point) || 0,
            });
        })();
        return () => { 살아있음 = false; };
    }, [enabled]);

    return state;
};

// 왜 막혔는지, 어떻게 풀 수 있는지 함께 보여 준다.
// 사유를 안 밝히고 막기만 하면 손님은 고장으로 읽는다.
export const ResignBlockNotice = ({ guard, historyPath = '/shop/auth/history' }) => {
    const router = useRouter();
    const { translate } = useLocales();
    if (!guard || guard.loading) return null;

    if (!guard.canResign) {
        return (
            <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {translate('진행 중인 주문이 있어 지금은 탈퇴하실 수 없습니다.')}
                </Typography>
                <Stack sx={{ mt: 0.75 }}>
                    {guard.orders.slice(0, 5).map((o) => (
                        <Typography key={o.id} variant="caption" sx={{ display: 'block' }}>
                            {o.ord_num} · {translate(o.status_text)}
                        </Typography>
                    ))}
                    {guard.orders.length > 5 &&
                        <Typography variant="caption" sx={{ display: 'block' }}>
                            {translate('외 {{n}}건', { n: guard.orders.length - 5 })}
                        </Typography>}
                </Stack>
                <Typography variant="caption" sx={{ display: 'block', mt: 0.75 }}>
                    {translate('배송이 끝난 뒤에 다시 시도하시거나, 주문을 취소한 뒤 탈퇴해 주세요.')}
                </Typography>
                <Button size="small" variant="outlined" sx={{ mt: 1 }} onClick={() => router.push(historyPath)}>
                    {translate('주문내역 보기')}
                </Button>
            </Alert>
        );
    }

    // 막지는 않는다. 다만 사라지는 것은 미리 말해 준다.
    if (guard.point > 0) {
        return (
            <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="caption">
                    {translate('탈퇴하시면 남은 적립금 {{n}}이 사라집니다.', {
                        n: commarNumber(guard.point) + getPriceUnitByLang(),
                    })}
                </Typography>
            </Alert>
        );
    }
    return null;
};

export default ResignBlockNotice;
