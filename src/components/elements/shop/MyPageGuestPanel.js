import { Button, Divider, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useLocales } from 'src/locales';

// 마이페이지 비로그인 랜딩(쇼핑몰형 프레임1·2·3 공용).
//
// 마이페이지는 비로그인이어도 로그인 화면으로 튕기지 않고 이 패널을 보여준다.
// 11개 프레임 중 10개가 이미 이 방식이었고, 프레임3(shop demo-4)만 리다이렉트했다.
// 튕겨내면 비회원 주문조회로 가는 길이 마이페이지에서 끊긴다.
//
// 구성은 이미 운영 중인 blog demo-1 마이페이지의 비로그인 영역을 따랐다 —
// 안내 문구 + 로그인/회원가입 CTA, 그리고 비회원 다이얼로그에 있던
// '비회원으로 주문/배송조회' 진입(/shop/auth/order-check).
//
// 3개 프레임이 공유하므로 특정 데모 톤(색/폰트)을 넣지 않는다.
// MUI 기본 컴포넌트만 쓰고 색은 테마를 따라간다.

const Wrapper = styled.div`
  max-width: 560px;
  width: 90%;
  margin: 0 auto;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 3rem 0 6rem 0;
`;

const MyPageGuestPanel = () => {
  const { translate } = useLocales();
  const router = useRouter();

  return (
    <Wrapper>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{translate('마이페이지')}</Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, wordBreak: 'keep-all' }}>{translate('로그인하시면 주문내역과 배송지를 간편하게 확인하실 수 있습니다.')}</Typography>

      <Stack spacing={1.5}>
        <Button
          variant="contained"
          size="large"
          sx={{ height: '52px' }}
          onClick={() => router.push('/shop/auth/login')}
        >{translate('로그인')}</Button>
        <Button
          variant="outlined"
          size="large"
          sx={{ height: '52px' }}
          onClick={() => router.push('/shop/auth/sign-up')}
        >{translate('회원가입')}</Button>
      </Stack>

      <Divider sx={{ my: 4 }} />

      {/* 비회원 주문조회 — 로그인 없이도 주문/배송을 확인할 수 있는 경로 */}
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1.5, wordBreak: 'keep-all' }}>{translate('회원가입 없이 주문하셨나요?')}</Typography>
      <Button
        variant="text"
        size="large"
        sx={{ alignSelf: 'flex-start', px: 0 }}
        onClick={() => router.push('/shop/auth/order-check')}
      >{translate('비회원 주문/배송조회')}</Button>
    </Wrapper>
  );
};

export default MyPageGuestPanel;
