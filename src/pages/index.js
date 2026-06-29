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

// ShopGo 배포에서만 마스터 랜딩 노출 (.env: NEXT_PUBLIC_IS_SHOPGO=true)
const IS_SHOPGO = process.env.NEXT_PUBLIC_IS_SHOPGO === 'true';

const TARGETS = [
  { icon: 'tabler:shopping-cart', title: '구매 비용이 부담되는 사업자', desc: '초기 비용 0원으로\n온라인 쇼핑몰을 시작하세요.' },
  { icon: 'tabler:device-mobile', title: 'SNS 중심으로 판매하는 사업자', desc: '인스타·블로그·카카오톡\n채널과 연동해 판매하세요.' },
  { icon: 'tabler:rocket', title: '빠르게 매출을 만들고 싶은 사업자', desc: '복잡한 설정 없이\n오늘 바로 판매를 시작하세요.' },
  { icon: 'tabler:chart-line', title: '판매 채널을 확장하고 싶은 사업자', desc: '다양한 마케팅 도구로\n더 많은 고객에게 도달하세요.' },
];

const ACTIONS = [
  { title: '온라인 쇼핑몰 신청서', desc: '사업자 정보 입력 후 무료 쇼핑몰을 신청하세요.', href: '/apply', cta: '신청하러 가기' },
  { title: '무료 쇼핑몰 프레임 선택', desc: '11종 디자인 프레임을 미리 보고 선택하세요.', href: '/frames', cta: '프레임 보기' },
  { title: '관리자 매뉴얼', desc: '쇼핑몰 운영을 위한 관리자 페이지 가이드.', href: '/manual', cta: '매뉴얼 받기' },
];

const LANGS = [
  { img: '/assets/icons/flags/ic_flag_kr.svg', code: 'KR', label: '한국어' },
  { img: '/assets/icons/flags/ic_flag_us.svg', code: 'US', label: '영어' },
  { img: '/assets/icons/flags/ic_flag_jp.svg', code: 'JP', label: '일본어' },
  { img: '/assets/icons/flags/ic_flag_cn.svg', code: 'CN', label: '중국어' },
  { img: '/assets/icons/flags/ic_flag_es.svg', code: 'ES', label: '스페인어' },
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
const DeviceMockup = () => (
  <Box
    sx={{
      position: 'relative',
      width: '100%',
      maxWidth: 520,
      mx: 'auto',
      pb: { xs: 6, md: 4 },
    }}
  >
    {/* 노트북 */}
    <Box>
      {/* 화면 + 베젤 */}
      <Box
        sx={{
          bgcolor: '#1a1a1a',
          borderRadius: '14px',
          p: { xs: 1, md: 1.25 },
          boxShadow: '0 30px 60px -20px rgba(0,0,0,0.25)',
        }}
      >
        {/* 미니 쇼핑몰 UI */}
        <Box sx={{ bgcolor: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
          {/* 상단바 */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.5,
              py: 1,
              borderBottom: '1px solid #f0f0f0',
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 900, color: SG.text, letterSpacing: '-0.3px' }}>
              ShopGo
            </Typography>
            <Stack direction="row" spacing={0.75} sx={{ display: { xs: 'none', sm: 'flex' } }}>
              {[1, 2, 3].map((n) => (
                <Box key={n} sx={{ width: 22, height: 5, borderRadius: 3, bgcolor: '#eee' }} />
              ))}
            </Stack>
            <Box
              sx={{
                px: 1,
                py: 0.4,
                borderRadius: 999,
                bgcolor: SG.primary,
                fontSize: 8,
                fontWeight: 800,
                color: SG.onPrimary,
              }}
            >
              SHOP
            </Box>
          </Box>
          {/* 히어로 배너 */}
          <Box
            sx={{
              mx: 1.25,
              my: 1.25,
              height: { xs: 40, md: 54 },
              borderRadius: '6px',
              background: `linear-gradient(105deg, ${SG.primary} 0%, ${SG.hover} 100%)`,
              display: 'flex',
              alignItems: 'center',
              px: 1.5,
            }}
          >
            <Box sx={{ width: '45%' }}>
              <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(26,26,26,0.55)', mb: 0.75 }} />
              <Box sx={{ height: 5, width: '70%', borderRadius: 3, bgcolor: 'rgba(26,26,26,0.35)' }} />
            </Box>
          </Box>
          {/* 상품 카드 그리드 */}
          <Box
            sx={{
              px: 1.25,
              pb: 1.5,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1,
            }}
          >
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <Box key={n}>
                <Box
                  sx={{
                    height: { xs: 30, md: 42 },
                    borderRadius: '5px',
                    bgcolor: '#f3f4ef',
                    mb: 0.6,
                  }}
                />
                <Box sx={{ height: 4, width: '85%', borderRadius: 2, bgcolor: '#eee', mb: 0.5 }} />
                <Box sx={{ height: 4, width: '55%', borderRadius: 2, bgcolor: SG.primary }} />
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
      {/* 하단 받침 */}
      <Box
        sx={{
          mx: 'auto',
          width: '112%',
          ml: '-6%',
          height: 12,
          borderRadius: '0 0 12px 12px',
          background: 'linear-gradient(#d8d8d2, #c4c4be)',
        }}
      />
      <Box
        sx={{
          mx: 'auto',
          width: '20%',
          height: 5,
          bgcolor: '#bdbdb6',
          borderRadius: '0 0 6px 6px',
        }}
      />
    </Box>

    {/* 겹치는 스마트폰 */}
    <Box
      sx={{
        position: 'absolute',
        right: { xs: -4, md: -14 },
        bottom: { xs: 8, md: 0 },
        width: { xs: 84, md: 116 },
        bgcolor: '#1a1a1a',
        borderRadius: '18px',
        p: 0.75,
        boxShadow: '0 18px 40px -12px rgba(0,0,0,0.3)',
      }}
    >
      <Box sx={{ bgcolor: '#fff', borderRadius: '14px', overflow: 'hidden' }}>
        {/* 상품 이미지 */}
        <Box
          sx={{
            height: { xs: 64, md: 90 },
            background: `linear-gradient(160deg, ${SG.primary}, ${SG.hover})`,
          }}
        />
        <Box sx={{ p: 1 }}>
          <Box sx={{ height: 5, width: '80%', borderRadius: 3, bgcolor: '#eee', mb: 0.75 }} />
          <Box sx={{ height: 5, width: '55%', borderRadius: 3, bgcolor: '#eee', mb: 1 }} />
          <Box
            sx={{
              height: { xs: 14, md: 18 },
              borderRadius: 999,
              bgcolor: SG.primary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box sx={{ height: 4, width: '45%', borderRadius: 2, bgcolor: 'rgba(26,26,26,0.55)' }} />
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);

const ShopGoLanding = () => {
  const router = useRouter();

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
                  쇼핑몰 제작비 없이,
                  <br />
                  <Box component="span" sx={{ color: SG.primary }}>
                    바로 판매를 시작
                  </Box>
                  하세요.
                </Typography>
                <Typography sx={{ fontSize: { xs: 14, md: 18 }, color: '#555', maxWidth: 560, lineHeight: 1.7 }}>
                  포스페이의 무료 쇼핑몰 서비스로,
                  <br />
                  사업자 누구나 가장 빠르고 간편하게 나만의 쇼핑몰을 운영할 수 있습니다.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 1 }}>
                  <Button
                    size="large"
                    variant="contained"
                    disableElevation
                    onClick={() => router.push('/apply')}
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
                    무료 쇼핑몰 신청하기
                  </Button>
                  <Button
                    size="large"
                    variant="outlined"
                    onClick={() => router.push('/frames')}
                    sx={{
                      borderColor: '#d6d6d0',
                      color: SG.text,
                      fontWeight: 800,
                      px: 4,
                      py: 1.5,
                      borderRadius: 999,
                      '&:hover': { borderColor: SG.hover, bgcolor: SG.subBg },
                    }}
                  >
                    프레임 미리보기
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
                    내 쇼핑몰 주소 예시 —{' '}
                    <Box component="span" sx={{ fontWeight: 700, color: SG.text }}>
                      가맹점명.{MAIN_DOMAIN}
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
              이런 분께 추천드립니다
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            {TARGETS.map((t, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
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
                    <Icon icon={t.icon} width={38} height={38} color="#a3e635" />
                  </Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 1, lineHeight: 1.3, color: SG.text }}>
                    {t.title}
                  </Typography>
                  <Typography sx={{ fontSize: 13, color: SG.gray, lineHeight: 1.6, whiteSpace: 'pre-line' }}>{t.desc}</Typography>
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
              다국어 자동 번역
            </Typography>
            <Typography sx={{ fontSize: 14, color: SG.gray, mt: 1 }}>
              상품명과 상세 정보를 자동으로 번역하여, 해외 고객에게도 쉽게 판매할 수 있습니다.
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
                  alt={l.label}
                  sx={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
                />
                <Typography sx={{ fontSize: 16, fontWeight: 800, color: SG.text, letterSpacing: 0.5 }}>
                  {l.code}
                </Typography>
                <Typography sx={{ fontSize: 14, color: '#888' }}>{l.label}</Typography>
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
              지금 바로 시작하기
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            {ACTIONS.map((a, idx) => (
              <Grid item xs={12} md={4} key={idx}>
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
                  <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 1.5 }}>{a.title}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#aaa', mb: 3, lineHeight: 1.6 }}>{a.desc}</Typography>
                  <Typography sx={{ fontSize: 13, color: SG.primary, fontWeight: 800 }}>{a.cta} →</Typography>
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
