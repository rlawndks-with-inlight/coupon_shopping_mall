import { useRouter } from 'next/router';
import { Box, Container, Stack, Typography, Button } from '@mui/material';

export const SERVICE_NAME = 'ShopGo';
export const COMPANY_NAME = '주식회사 우진플랫폼';
export const COMPANY_ADDRESS = '서울시 영등포구 여의대방로 67길 11, 5층 에이5-41호(여의도동)';
export const MAIN_DOMAIN = 'shopgo.co.kr';

const HEADER_HEIGHT = 64;

const PRIMARY = '#a3e635';
const PRIMARY_HOVER = '#84cc16';
const ON_PRIMARY = '#1a1a1a';

const NAV = [
  { label: '서비스 소개', href: '/#features' },
  { label: '프레임', href: '/frames' },
  { label: '매뉴얼', href: '/manual' },
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
                  key={n.label}
                  onClick={() => handleNavClick(n.href, router)}
                  sx={{
                    fontSize: 14,
                    fontWeight: 500,
                    cursor: 'pointer',
                    color: '#bbb',
                    '&:hover': { color: '#fff' },
                  }}
                >
                  {n.label}
                </Typography>
              ))}
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Button
                variant="contained"
                disableElevation
                onClick={() => router.push('/apply')}
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
                무료 쇼핑몰 만들기
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export const MainSiteFooter = () => (
  <Box
    component="footer"
    sx={{ py: 6, bgcolor: '#fafaf7', borderTop: `2px solid ${PRIMARY}` }}
  >
    <Container maxWidth="lg">
      <Stack spacing={2}>
        <Typography sx={{ fontSize: 13, color: '#888', fontWeight: 700 }}>{COMPANY_NAME}</Typography>
        <Typography sx={{ fontSize: 12, color: '#999', lineHeight: 1.8 }}>{COMPANY_ADDRESS}</Typography>
        <Box sx={{ pt: 2, borderTop: '1px solid #eee' }}>
          <Typography sx={{ fontSize: 11, color: '#aaa', lineHeight: 1.7 }}>
            {COMPANY_NAME}은 통신판매의 당사자가 아니며, 쇼핑몰 시스템만 무상으로 제공합니다.
            판매·운영·고객응대·배송·환불·거래에 관한 의무와 책임은 가맹점(판매자)에게 있습니다.
          </Typography>
        </Box>
      </Stack>
    </Container>
  </Box>
);

const MainSiteLayout = ({ children }) => (
  <Box sx={{ bgcolor: '#fff', color: '#111', minHeight: '100vh' }}>
    <MainSiteHeader />
    <Box component="main">{children}</Box>
    <MainSiteFooter />
  </Box>
);

export default MainSiteLayout;
