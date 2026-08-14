import { useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Container, Stack, Typography, Button, IconButton, Drawer, Divider } from '@mui/material';
import { Icon } from '@iconify/react';
import { useLandingT } from './landingStrings';
import { useWordBreak } from './wordBreak';
import LangSwitcher from './LangSwitcher';
import { POLICY_DOCS } from './policyContent';

export const SERVICE_NAME = 'ShopGo';
export const COMPANY_NAME = '㈜우진플랫폼';
export const COMPANY_ADDRESS = '서울시 영등포구 여의대방로 67길 11, 5층 에이5-41호(여의도동)';
export const MAIN_DOMAIN = 'shopgo.co.kr';
export const SHOP_INQUIRY_EMAIL = 'kimin6756@gmail.com'; // ㈜우진플랫폼 (쇼핑몰 문의)
export const PAY_INQUIRY_EMAIL = 'office@forspay.com'; // ㈜포스페이 (결제 문의)
// 서비스 운영사 표기 — 결제사(포스페이) + 플랫폼(우진플랫폼).
//
// 아래 상수는 '한국어 원문 겸 폴백'이다. 화면은 사전(footerPay*·footerPlatform*)을 먼저 쓴다.
// 예전엔 법인명·주소를 법적 표기로 보고 번역하지 않았는데, 영어 화면에서 한 칸 안에
// 한국어와 영어가 섞여 보인다는 지적이 있어 전부 번역하기로 했다(2026-08-14).
// 법인명 표기는 footerDisclaimer 안의 표기와 같아야 한다 — 같은 화면에 나란히 보인다.
export const FORSPAY_NAME = '㈜포스페이';
export const FORSPAY_DESC = '국내 PG · 해외 PSP · 통합결제 서비스';
export const FORSPAY_ADDRESS = '서울시 성동구 연무장5가길 25 성수역SKV1타워 1702호';
export const FORSPAY_URL = 'https://forspay.com/';
export const PLATFORM_DESC = '무료 쇼핑몰 플랫폼 개발 및 운영';

const HEADER_HEIGHT = 64;

const PRIMARY = '#a3e635';
const PRIMARY_HOVER = '#84cc16';
const ON_PRIMARY = '#1a1a1a';

// 푸터 글씨는 이 회색 하나로만 쓴다.
// 예전엔 #aaa(제목·면책) · #555(법인명) · #999(본문·링크) · #666(이메일) 네 가지가 섞여
// 같은 성격의 줄끼리도 밝기가 달랐다. 위계는 색이 아니라 굵기·크기로만 준다.
//
// 값을 #666 으로 잡은 이유: 푸터 바탕(#fafaf7)에서 대비 약 5.5:1 이라 10px 면책 문구까지
// 읽힌다. 기존 주력이던 #999 는 2.8:1, #aaa 는 더 낮아 작은 글씨가 잘 안 보였다.
const FOOTER_TEXT = '#666';

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
        {/* 서비스 운영사 — 결제사(포스페이) 먼저, 그다음 플랫폼(우진플랫폼).
            법인명·주소를 포함해 전부 사전에서 가져온다. 상수는 사전이 비었을 때의 폴백일 뿐이다. */}
        <Typography sx={{ fontSize: 11, letterSpacing: 2, color: FOOTER_TEXT, fontWeight: 700 }}>{t.footerOperator}</Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 2.5, sm: 6 }} sx={{ pt: 0.5 }}>
          {/* 포스페이(결제) 먼저 */}
          <Stack spacing={0.5}>
            <Typography sx={{ fontSize: 13, color: FOOTER_TEXT, fontWeight: 700 }}>
              {t.footerPayName || FORSPAY_NAME}
              <Box component="a" href={FORSPAY_URL} target="_blank" rel="noreferrer"
                sx={{ ml: 0.75, fontSize: 11, fontWeight: 500, color: FOOTER_TEXT, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>forspay.com</Box>
            </Typography>
            <Typography sx={{ fontSize: 12, color: FOOTER_TEXT }}>{t.footerPayDesc || FORSPAY_DESC}</Typography>
            <Typography sx={{ fontSize: 12, color: FOOTER_TEXT, lineHeight: 1.8 }}>{t.footerPayAddress || FORSPAY_ADDRESS}</Typography>
            <Typography sx={{ fontSize: 12, color: FOOTER_TEXT }}>
              {t.footerPayInquiry}{' '}
              <Box component="a" href={`mailto:${PAY_INQUIRY_EMAIL}`}
                sx={{ color: FOOTER_TEXT, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{PAY_INQUIRY_EMAIL}</Box>
            </Typography>
          </Stack>
          {/* 우진플랫폼(플랫폼 운영) */}
          <Stack spacing={0.5}>
            <Typography sx={{ fontSize: 13, color: FOOTER_TEXT, fontWeight: 700 }}>{t.footerPlatformName || COMPANY_NAME}</Typography>
            <Typography sx={{ fontSize: 12, color: FOOTER_TEXT }}>{t.footerPlatformDesc || PLATFORM_DESC}</Typography>
            <Typography sx={{ fontSize: 12, color: FOOTER_TEXT, lineHeight: 1.8 }}>{t.footerPlatformAddress || COMPANY_ADDRESS}</Typography>
            <Typography sx={{ fontSize: 12, color: FOOTER_TEXT }}>
              {t.footerShopInquiry}{' '}
              <Box component="a" href={`mailto:${SHOP_INQUIRY_EMAIL}`}
                sx={{ color: FOOTER_TEXT, fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{SHOP_INQUIRY_EMAIL}</Box>
            </Typography>
          </Stack>
        </Stack>
        {/* 약관 링크 — 색이 본문과 같아졌으니 밑줄로 링크임을 밝힌다.
            예전엔 색만으로 구분했는데, 그것도 본문(#999)과 같은 값이라 실은 구분이 안 됐다. */}
        <Stack direction="row" flexWrap="wrap" gap={{ xs: 1, sm: 2 }} sx={{ pt: 1 }}>
          {POLICY_DOCS.map((d) => (
            <Box
              key={d.slug}
              component="a"
              href={`/policy/${d.slug}`}
              sx={{
                fontSize: 12,
                color: FOOTER_TEXT,
                fontWeight: 400,
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
                textDecorationColor: 'rgba(102,102,102,0.35)',
                '&:hover': { textDecorationColor: FOOTER_TEXT },
              }}
            >
              {t[policyLabelKey(d.slug)] || d.title.replace('SHOPGO ', '')}
            </Box>
          ))}
        </Stack>
        <Box sx={{ pt: 2, borderTop: '1px solid #eee' }}>
          <Typography sx={{ fontSize: 10, color: FOOTER_TEXT, lineHeight: 1.7 }}>
            {t.footerDisclaimer}
          </Typography>
        </Box>
      </Stack>
    </Container>
  </Box>
  );
};

// 줄바꿈은 여기 한 군데서만 정한다 — word-break 는 상속되는 속성이라
// 최상단에 한 번 걸면 헤더·본문·푸터의 모든 글자에 적용된다.
// 문단마다 keep-all 을 붙이던 방식은 붙이다 빠뜨린 자리가 생겼다(프레임 페이지 히어로 등).
// 포털로 그려지는 Dialog·Drawer 는 상속을 못 받으므로 그쪽은 useWordBreak() 를 직접 쓴다.
const MainSiteLayout = ({ children }) => {
  const wordBreak = useWordBreak();
  return (
    <Box sx={{ bgcolor: '#fff', color: '#111', minHeight: '100vh', display: 'flex', flexDirection: 'column', wordBreak }}>
      <MainSiteHeader />
      <Box component="main" sx={{ flex: 1 }}>{children}</Box>
      <MainSiteFooter />
    </Box>
  );
};

export default MainSiteLayout;
