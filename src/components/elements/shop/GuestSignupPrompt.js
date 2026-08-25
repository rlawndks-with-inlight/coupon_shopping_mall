import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useLocales } from 'src/locales';
import { setGuestPromptOpener } from 'src/utils/guest-prompt';

// 비로그인 손님이 담기·바로구매를 누르거나 주문서에 들어올 때 뜨는 창.
//
// 가맹점 의견(2026-08-23): "비회원으로 그냥 진행되는 것보다 회원가입을 한 번 유도하고
// 진행되는 편이 좋겠다."
//
// 유도까지만 한다 — 「비회원으로 계속」이 항상 있어야 한다.
// 예전에 비회원을 로그인으로 튕기던 코드를 걷어낸 이유가 그것이다(비회원 구매 불가).
//
// ShopLayout 에 한 번만 걸린다. 모든 프레임이 그 레이아웃을 거치므로
// 프레임별로 따로 심을 필요가 없다.
const GuestSignupPrompt = () => {
    const router = useRouter();
    const { translate } = useLocales();
    const { user, isInitialized } = useAuthContext();
    const [open, setOpen] = useState(false);
    // 창을 닫을 때 부를 resolve. 이걸 안 부르면 담기가 영영 안 끝난다.
    const 응답 = useRef(null);

    // opener 안에서 최신 로그인 상태를 읽어야 한다.
    // 등록 시점 값에 갇히면 로그인을 마친 뒤에도 창이 계속 뜬다.
    const 상태 = useRef({ user, isInitialized });
    상태.current = { user, isInitialized };

    useEffect(() => {
        setGuestPromptOpener(() => new Promise((resolve) => {
            const { user: 지금유저, isInitialized: 준비됨 } = 상태.current;
            // 세션 복원이 끝나기 전에는 묻지 않는다.
            // useAuthContext 는 첫 렌더에서 user 가 null 이고 저장된 토큰으로 복원한 뒤에야 채워진다.
            // 그 사이를 '비로그인' 으로 보면 로그인한 손님도 새로고침 직후 창을 보게 된다.
            if (!준비됨 || 지금유저) { resolve(true); return; }
            응답.current = resolve;
            setOpen(true);
        }));
        return () => setGuestPromptOpener(null);
    }, []);

    // 어떻게 닫히든 반드시 응답한다(계속=true / 멈춤=false).
    const 닫기 = (계속) => {
        setOpen(false);
        const r = 응답.current;
        응답.current = null;
        if (r) r(계속);
    };

    // 「비회원으로 계속」을 골라도 기억하지 않는다 — 다음번에 또 묻는다.
    // 가맹점 요청(2026-08-25): 한 번 넘기면 그 방문 내내 안 뜨는 것이 약하다.
    const 비회원으로 = () => { 닫기(true); };

    const 이동 = (경로) => {
        // 담던 상품은 장바구니(localStorage)에 아직 안 들어갔다. 그래서 '멈춤'으로 응답하고
        // 손님이 돌아와 다시 누르게 한다 — 반쯤 담긴 상태로 남기는 것보다 낫다.
        닫기(false);
        router.push(경로);
    };

    return (
        <Dialog open={open} onClose={비회원으로} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ pb: 1 }}>{translate('회원으로 구매하시겠어요?')}</DialogTitle>
            <DialogContent>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {/* 문장을 조각내면 언어마다 어순이 깨진다 — 통째로 번역한다. */}
                    {translate('회원이 되시면 주문내역을 한곳에서 확인하고, 배송지를 저장해 다음 주문부터 더 빠르게 하실 수 있습니다. 물론 회원가입 없이 그대로 진행하셔도 됩니다.')}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Stack spacing={1} sx={{ width: '100%' }}>
                    <Button fullWidth variant="contained" size="large" onClick={() => 이동('/shop/auth/sign-up')}>
                        {translate('회원가입')}
                    </Button>
                    <Button fullWidth variant="outlined" onClick={() => 이동('/shop/auth/login')}>
                        {translate('로그인')}
                    </Button>
                    {/* 이 버튼은 절대 빠지면 안 된다 — 없으면 비회원 구매가 막힌다. */}
                    <Button fullWidth variant="text" color="inherit" onClick={비회원으로}>
                        {translate('비회원으로 계속')}
                    </Button>
                </Stack>
            </DialogActions>
        </Dialog>
    );
};

export default GuestSignupPrompt;
