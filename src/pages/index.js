import { useRouter } from 'next/router';
import { m, useScroll, useSpring } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { Box, Container, Stack, Typography, Button, Grid } from '@mui/material';
import { Icon } from '@iconify/react';
// 기존 템플릿 홈 (ShopGo가 아닌 프로젝트의 원래 동작 유지)
import MainLayout from 'src/layouts/main';
import {
  HomeHero,
  HomeMinimal,
  HomeDarkMode,
  HomeLookingFor,
  HomeForDesigner,
  HomeColorPresets,
  HomePricingPlans,
  HomeAdvertisement,
  HomeCleanInterfaces,
} from 'src/views/home';
// ShopGo 마스터 랜딩
import MainSiteLayout, { MAIN_DOMAIN } from 'src/components/main-site/MainSiteLayout';
import ShopSearch from 'src/components/main-site/ShopSearch';
import { useLandingT } from 'src/components/main-site/landingStrings';

// ShopGo 배포에서만 마스터 랜딩 노출 (.env: NEXT_PUBLIC_IS_SHOPGO=true)
const IS_SHOPGO = process.env.NEXT_PUBLIC_IS_SHOPGO === 'true';

const TARGETS = [
  { icon: 'tabler:shopping-cart', k: 't1' },
  { icon: 'tabler:device-mobile', k: 't2' },
  { icon: 'tabler:rocket', k: 't3' },
  { icon: 'tabler:chart-line', k: 't4' },
];

const ACTIONS = [
  { href: '/frames', k: 'a1' },
  { href: '/apply', k: 'a2' },
  { href: '/manual', k: 'a3' },
];

const LANGS = [
  { img: '/assets/icons/flags/ic_flag_kr.svg', code: 'KR', k: 'langKo' },
  { img: '/assets/icons/flags/ic_flag_us.svg', code: 'US', k: 'langEn' },
  { img: '/assets/icons/flags/ic_flag_jp.svg', code: 'JP', k: 'langJa' },
  { img: '/assets/icons/flags/ic_flag_cn.svg', code: 'CN', k: 'langCn' },
  { img: '/assets/icons/flags/ic_flag_es.svg', code: 'ES', k: 'langEs' },
];

// ShopGo 마스터 랜딩
// 브랜드 포인트 컬러 (라임그린)
const SG = {
  primary: '#a3e635',
  hover: '#84cc16',
  onPrimary: '#1a1a1a',
  accentText: '#a3e635',
  text: '#111',
  bg: '#fff',
  subBg: '#fafaf7',
  gray: '#666',
};

// 코드로만 그린 디바이스 목업 (외부 이미지 없음, SSR 안전)
// 히어로 비주얼: 노트북 + 스마트폰 목업 이미지
// 파일 위치: public/assets/images/hero-mockup.png (디자인 렌더 이미지)
const DeviceMockup = () => (
  <Box
    component="img"
    src="/assets/images/hero-mockup.png"
    alt="ShopGo 쇼핑몰 미리보기"
    sx={{
      display: 'block',
      width: '100%',
      maxWidth: 640,
      height: 'auto',
      mx: 'auto',
    }}
  />
);

const ShopGoLanding = () => {
  const router = useRouter();
  const t = useLandingT();

  return (
    <>
      {/* HERO */}
      <Box sx={{ py: { xs: 7, md: 14 }, bgcolor: SG.bg }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 6, md: 4 }} alignItems="center">
            {/* 좌측: 텍스트 */}
            <Grid item xs={12} md={6}>
              <Stack spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }} textAlign={{ xs: 'center', md: 'left' }}>
                <Typography sx={{ fontSize: 12, letterSpacing: 4, color: SG.primary, fontWeight: 700 }}>
                  FREE SHOPPING MALL · SHOPGO
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 32, md: 52 },
                    fontWeight: 900,
                    lineHeight: 1.18,
                    letterSpacing: '-1.5px',
                    color: SG.text,
                  }}
                >
                  {t.heroLine1}
                  <br />
                  <Box component="span" sx={{ color: SG.primary }}>
                    {t.heroHi}
                  </Box>
                  {t.heroLine2}
                </Typography>
                <Typography sx={{ fontSize: { xs: 14, md: 18 }, color: '#555', maxWidth: 560, lineHeight: 1.7 }}>
                  {t.heroSub1}
                  <br />
                  {t.heroSub2}
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                  <Button
                    size="large"
                    variant="contained"
                    disableElevation
                    onClick={() => router.push('/frames')}
                    sx={{
                      bgcolor: SG.primary,
                      color: SG.onPrimary,
                      fontWeight: 800,
                      px: 4,
                      py: 1.5,
                      borderRadius: 999,
                      '&:hover': { bgcolor: SG.hover },
                    }}
                  >
                    {t.heroBtn}
                  </Button>
                </Stack>
                <Box
                  sx={{
                    mt: 1,
                    px: 3,
                    py: 1.5,
                    border: `1px dashed ${SG.primary}`,
                    borderRadius: 2,
                    bgcolor: SG.subBg,
                  }}
                >
                  <Typography sx={{ fontSize: 13, color: SG.gray }}>
                    {t.heroAddrLabel}{' '}
                    <Box component="span" sx={{ fontWeight: 700, color: SG.text }}>
                      mystore.{MAIN_DOMAIN}
                    </Box>
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            {/* 우측: 코드로 만든 디바이스 목업 */}
            <Grid item xs={12} md={6}>
              <DeviceMockup />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 가맹점·상품 검색 */}
      <ShopSearch />

      {/* TARGETS */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 }, bgcolor: SG.subBg }}>
        <Container maxWidth="lg">
          <Stack spacing={1} textAlign="center" mb={6}>
            <Typography sx={{ fontSize: 12, letterSpacing: 4, color: SG.accentText, fontWeight: 700 }}>
              WHO IT'S FOR
            </Typography>
            <Typography sx={{ fontSize: { xs: 24, md: 36 }, fontWeight: 900, letterSpacing: '-1px', color: SG.text }}>
              {t.targetsTitle}
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            {TARGETS.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.k}>
                <Box
                  sx={{
                    p: 3,
                    bgcolor: '#fff',
                    border: '1px solid #eee',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'all 0.2s',
                    '&:hover': {
                      borderColor: SG.primary,
                      transform: 'translateY(-3px)',
                      boxShadow: '0 14px 30px -16px rgba(0,0,0,0.18)',
                    },
                  }}
                >
                  <Box sx={{ mb: 1.5, lineHeight: 0 }}>
                    <Icon icon={item.icon} width={38} height={38} color="#a3e635" />
                  </Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 1, lineHeight: 1.3, color: SG.text }}>
                    {t[`${item.k}Title`]}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: SG.gray, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{t[`${item.k}Desc`]}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* LANGS */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: SG.bg }}>
        <Container maxWidth="md">
          <Stack spacing={1} textAlign="center" mb={5}>
            <Typography sx={{ fontSize: 12, letterSpacing: 4, color: SG.accentText, fontWeight: 700 }}>
              GLOBAL READY
            </Typography>
            <Typography sx={{ fontSize: { xs: 24, md: 36 }, fontWeight: 900, letterSpacing: '-1px', color: SG.text }}>
              {t.langsTitle}
            </Typography>
            <Typography sx={{ fontSize: 14, color: SG.gray, mt: 1 }}>
              {t.langsSub}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="center" spacing={{ xs: 2, sm: 4 }} flexWrap="wrap">
            {LANGS.map((l) => (
              <Stack
                key={l.code}
                alignItems="center"
                spacing={0.75}
                sx={{
                  px: 2,
                  py: 2,
                  borderRadius: 2,
                  transition: 'all 0.2s',
                  '&:hover': { bgcolor: SG.subBg },
                }}
              >
                <Box
                  component="img"
                  src={l.img}
                  alt={l.code}
                  sx={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                />
                <Typography sx={{ fontSize: 16, fontWeight: 800, color: SG.text, letterSpacing: 0.5 }}>
                  {l.code}
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#888' }}>{t[l.k]}</Typography>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ACTIONS */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#111', color: '#fff' }}>
        <Container maxWidth="lg">
          <Stack spacing={1} textAlign="center" mb={6}>
            <Typography sx={{ fontSize: 12, letterSpacing: 4, color: SG.primary, fontWeight: 700 }}>
              GET STARTED
            </Typography>
            <Typography sx={{ fontSize: { xs: 24, md: 36 }, fontWeight: 900, letterSpacing: '-1px' }}>
              {t.actionsTitle}
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            {ACTIONS.map((a, idx) => (
              <Grid item xs={12} md={4} key={a.k}>
                <Box
                  onClick={() => router.push(a.href)}
                  sx={{
                    p: 4,
                    height: '100%',
                    border: '1px solid #333',
                    borderRadius: 2,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    bgcolor: '#1a1a1a',
                    '&:hover': { bgcolor: '#222', borderColor: SG.primary, transform: 'translateY(-2px)' },
                  }}
                >
                  <Box sx={{ fontSize: 11, letterSpacing: 2, color: SG.primary, fontWeight: 800, mb: 1.5 }}>
                    STEP {idx + 1}
                  </Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 1.5 }}>{t[`${a.k}Title`]}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#aaa', mb: 3, lineHeight: 1.6 }}>{t[`${a.k}Desc`]}</Typography>
                  <Typography sx={{ fontSize: 13, color: SG.primary, fontWeight: 800 }}>{t[`${a.k}Cta`]} →</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

// 기존 템플릿 홈 (ShopGo가 아닌 배포의 원래 동작 그대로)
const TemplateHome = () => {
  const theme = useTheme();

  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const progress = (
    <m.div
      style={{
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 1999,
        position: 'fixed',
        transformOrigin: '0%',
        backgroundColor: theme.palette.primary.main,
        scaleX,
      }}
    />
  );
  if (window.location.host.split(':')[0] != process.env.MAIN_FRONT_URL) {
    return <></>;
  }
  return (
    <>
      {progress}
      <HomeHero />
      <Box
        sx={{
          overflow: 'hidden',
          position: 'relative',
          bgcolor: 'background.default',
        }}
      >
        <HomeMinimal />
        <HomeForDesigner />
        <HomeDarkMode />
        <HomeColorPresets />
        <HomeCleanInterfaces />
        <HomePricingPlans />
        <HomeLookingFor />
        <HomeAdvertisement />
      </Box>
    </>
  );
};

const HomePage = () => (IS_SHOPGO ? <ShopGoLanding /> : <TemplateHome />);

HomePage.getLayout = (page) =>
  IS_SHOPGO ? <MainSiteLayout>{page}</MainSiteLayout> : <MainLayout> {page} </MainLayout>;

export default HomePage;
