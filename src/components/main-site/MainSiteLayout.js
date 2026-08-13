import { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Stack, Typography, Button, IconButton, Drawer, Divider } from '@mui/material';
import { Icon } from '@iconify/react';
import { useLandingT } from './landingStrings';
import LangSwitcher from './LangSwitcher';
import { POLICY_DOCS } from './policyContent';

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
  { k: 'navFaq', href: '/faq' },
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
  const [menuOpen, setMenuOpen] = useState(false);
  const goNav = (href) => { setMenuOpen(false); handleNavClick(href, router); };
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
            onClick={() => { window.location.href = '/'; }}
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
              {/* 모바일 햄버거 — 데스크톱(md+)에선 상단 내비가 보이므로 숨김 */}
              <IconButton
                onClick={() => setMenuOpen(true)}
                aria-label="menu"
                sx={{ display: { xs: 'inline-flex', md: 'none' }, color: '#fff', ml: 0.5 }}
              >
                <Icon icon="mdi:menu" width={24} height={24} />
              </IconButton>
            </Stack>
          </Stack>
        </Stack>
      </Container>

      {/* 모바일 내비 Drawer */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{ sx: { width: 260, bgcolor: '#111', color: '#fff' } }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${PRIMARY}` }}>
          <Typography sx={{ fontWeight: 800, color: '#fff' }}>
            Shop<Box component="span" sx={{ color: PRIMARY }}>Go</Box>
          </Typography>
          <IconButton onClick={() => setMenuOpen(false)} aria-label="close" sx={{ color: '#fff' }}>
            <Icon icon="mdi:close" width={22} height={22} />
          </IconButton>
        </Stack>
        <Stack sx={{ py: 1 }}>
          {NAV.map((n) => (
            <Typography
              key={n.k}
              onClick={() => goNav(n.href)}
              sx={{
                px: 2,
                py: 1.5,
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                color: '#ddd',
                '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.06)' },
              }}
            >
              {t[n.k]}
            </Typography>
          ))}
        </Stack>
        <Divider sx={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            variant="contained"
            disableElevation
            onClick={() => { setMenuOpen(false); router.push('/frames'); }}
            sx={{
              bgcolor: PRIMARY,
              color: ON_PRIMARY,
              fontWeight: 700,
              py: 1,
              borderRadius: 999,
              '&:hover': { bgcolor: PRIMARY_HOVER },
            }}
          >
            {t.ctaCreate}
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

// 약관 문서(policyContent)는 한국어 원문만 있지만, 링크 '표기'는 보고 있는 화면의 언어여야 한다.
// slug → 사전 키. 사전에 없으면 한국어 원문 제목으로 폴백한다(링크가 비어 보이는 것보다 낫다).
export const policyLabelKey = (slug) =>
  'policy' + slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');

export const MainSiteFooter = () => {
  const t = useLandingT();
  return (
  <Box
    component="footer"
    sx={{ py: 6, bgcolor: '#fafaf7', borderTop: `2px solid ${PRIMARY}` }}
  >
    <Container maxWidth="lg">
      <Stack spacing={2}>
        {/* 법인명·주소는 법적 표기라 번역하지 않는다 */}
        <Typography sx={{ fontSize: 13, color: '#888', fontWeight: 700 }}>{COMPANY_NAME}</Typography>
        <Typography sx={{ fontSize: 12, color: '#999', lineHeight: 1.8 }}>{COMPANY_ADDRESS}</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.5, sm: 3 }} sx={{ pt: 0.5 }}>
          <Typography sx={{ fontSize: 12, color: '#999' }}>
            {t.footerShopInquiry}{' '}
            <Box
              component="a"
              href={`mailto:${SHOP_INQUIRY_EMAIL}`}
              sx={{ color: '#666', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {SHOP_INQUIRY_EMAIL}
            </Box>
          </Typography>
          <Typography sx={{ fontSize: 12, color: '#999' }}>
            {t.footerPayInquiry}{' '}
            <Box
              component="a"
              href={`mailto:${PAY_INQUIRY_EMAIL}`}
              sx={{ color: '#666', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              {PAY_INQUIRY_EMAIL}
            </Box>
          </Typography>
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={{ xs: 1, sm: 2 }} sx={{ pt: 1 }}>
          {POLICY_DOCS.map((d) => (
            <Box
              key={d.slug}
              component="a"
              href={`/policy/${d.slug}`}
              sx={{
                fontSize: 12,
                color: '#999',
                fontWeight: 400,
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {t[policyLabelKey(d.slug)] || d.title.replace('SHOPGO ', '')}
            </Box>
          ))}
        </Stack>
        <Box sx={{ pt: 2, borderTop: '1px solid #eee' }}>
          <Typography sx={{ fontSize: 10, color: '#aaa', lineHeight: 1.7 }}>
            {t.footerDisclaimer}
          </Typography>
        </Box>
      </Stack>
    </Container>
  </Box>
  );
};

const MainSiteLayout = ({ children }) => (
  <Box sx={{ bgcolor: '#fff', color: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <MainSiteHeader />
    <Box component="main" sx={{ flex: 1 }}>{children}</Box>
    <MainSiteFooter />
  </Box>
);

export default MainSiteLayout;
