import { useRouter } from 'next/router';
import { Box, Container, Stack, Typography, Button } from '@mui/material';
import { Icon } from '@iconify/react';
import { useLandingT } from './landingStrings';
import LangSwitcher from './LangSwitcher';

export const SERVICE_NAME = 'ShopGo';
export const COMPANY_NAME = '주식회사 우진플랫폼';
export const COMPANY_ADDRESS = '서울시 영등포구 여의대방로 67길 11, 5층 에이5-41호(여의도동)';
export const MAIN_DOMAIN = 'shopgo.co.kr';
export const SHOP_INQUIRY_EMAIL = 'kimin6756@gmail.com'; // ㈜우진플랫폼 (쇼핑몰 문의)
export const PAY_INQUIRY_EMAIL = 'office@forspay.com'; // ㈜포스페이 (결제 문의)

const HEADER_HEIGHT = 64;

const PRIMARY = '#a3e635';
const PRIMARY_HOVER = '#84cc16';
const ON_PRIMARY = '#1a1a1a';

const NAV = [
  { k: 'navAbout', href: '/#features' },
  { k: 'navFrames', href: '/frames' },
  { k: 'navManual', href: '/manual' },
];

const handleNavClick = (href, router) => {
  if (href.startsWith('/#')) {
    const id = href.replace('/', '');
    if (router.pathname !== '/') {
      router.push(href);
      return;
    }
    const el = typeof document !== 'undefined' ? document.querySelector(id) : null;
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  } else {
    router.push(href);
  }
};

export const MainSiteHeader = () => {
  const router = useRouter();
  const t = useLandingT();
  return (
    <Box
      component="header"
      sx={{
        position: 'sticky',
        top: 0,
        bgcolor: 'rgba(17,17,17,0.96)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid ${PRIMARY}`,
        zIndex: 10,
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ height: HEADER_HEIGHT }}
        >
          <Typography
            variant="h6"
            onClick={() => router.push('/')}
            sx={{
              fontWeight: 800,
              letterSpacing: '-0.5px',
              cursor: 'pointer',
              color: '#fff',
              userSelect: 'none',
            }}
          >
            Shop
            <Box component="span" sx={{ color: PRIMARY }}>
              Go
            </Box>
          </Typography>
          <Stack direction="row" spacing={{ md: 3 }} alignItems="center">
            <Stack
              direction="row"
              spacing={3}
              alignItems="center"
              sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}
            >
              {NAV.map((n) => (
                <Typography
                  key={n.k}
                  onClick={() => handleNavClick(n.href, router)}
                  sx={{
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    color: '#bbb',
                    '&:hover': { color: '#fff' },
                  }}
                >
                  {t[n.k]}
                </Typography>
              ))}
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <LangSwitcher dark />
              <Button
                variant="contained"
                disableElevation
                onClick={() => router.push('/frames')}
                sx={{
                  bgcolor: PRIMARY,
                  color: ON_PRIMARY,
                  fontWeight: 700,
                  px: 2.5,
                  py: 0.75,
                  borderRadius: 999,
                  whiteSpace: 'nowrap',
                  '&:hover': { bgcolor: PRIMARY_HOVER },
                }}
              >
                {t.ctaCreate}
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

// 푸터 신뢰 배지 — 실제로 사실인 항목만 표기(개인정보 암호화는 DB 암호화 적용 후 추가).
const TRUST_BADGES = [
  { icon: 'tabler:lock', label: 'SSL 보안접속' },
  { icon: 'tabler:cloud', label: 'AWS 클라우드 인프라' },
  { icon: 'tabler:credit-card', label: '포스페이 안전결제(PG)' },
];

export const MainSiteFooter = () => (
  <Box
    component="footer"
    sx={{ py: 6, bgcolor: '#fafaf7', borderTop: `2px solid ${PRIMARY}` }}
  >
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <Typography sx={{ fontSize: 13, color: '#888', fontWeight: 700 }}>{COMPANY_NAME}</Typography>
        <Typography sx={{ fontSize: 12, color: '#999', lineHeight: 1.8 }}>{COMPANY_ADDRESS}</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 3 }} sx={{ pt: 0.5 }}>
          <Typography sx={{ fontSize: 12, color: '#999' }}>
            쇼핑몰 문의{' '}
            <Box
              component="a"
              href={`mailto:${SHOP_INQUIRY_EMAIL}`}
              sx={{ color: '#666', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {SHOP_INQUIRY_EMAIL}
            </Box>
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#999' }}>
            가맹 및 결제 문의{' '}
            <Box
              component="a"
              href={`mailto:${PAY_INQUIRY_EMAIL}`}
              sx={{ color: '#666', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {PAY_INQUIRY_EMAIL}
            </Box>
          </Typography>
        </Stack>
        <Stack direction="row" flexWrap="wrap" alignItems="center" sx={{ gap: 1, pt: 1 }}>
          {TRUST_BADGES.map((b) => (
            <Stack
              key={b.label}
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{ px: 1.25, py: 0.5, borderRadius: 999, border: '1px solid #e8e8e2', bgcolor: '#fff' }}
            >
              <Icon icon={b.icon} width={14} height={14} style={{ color: '#6b8f2e' }} />
              <Typography sx={{ fontSize: 11.5, color: '#777', fontWeight: 600 }}>{b.label}</Typography>
            </Stack>
          ))}
          <Box
            component="a"
            href="/security"
            sx={{
              fontSize: 11.5,
              color: '#888',
              fontWeight: 600,
              textDecoration: 'none',
              ml: 0.5,
              '&:hover': { color: '#111', textDecoration: 'underline' },
            }}
          >
            보안 안내 자세히 →
          </Box>
        </Stack>
        <Box sx={{ pt: 2, borderTop: '1px solid #eee' }}>
          <Typography sx={{ fontSize: 10, color: '#aaa', lineHeight: 1.7 }}>
            무료 쇼핑몰은 ㈜우진플랫폼이 제공하며,
            결제서비스는 ㈜포스페이의 결제 솔루션을 통해 제공됩니다.
            상품의 판매, 계약, 배송, 환불, 고객응대 및 쇼핑몰 운영에 관한 모든 책임은 해당 판매자에게 있으며,
            양사는 플랫폼 및 결제서비스 제공자로서 거래의 당사자가 아닙니다.
          </Typography>
        </Box>
      </Stack>
    </Container>
  </Box>
);

const MainSiteLayout = ({ children }) => (
  <Box sx={{ bgcolor: '#fff', color: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <MainSiteHeader />
    <Box component="main" sx={{ flex: 1 }}>{children}</Box>
    <MainSiteFooter />
  </Box>
);

export default MainSiteLayout;
