import { useRouter } from 'next/router';
import { Box, Container, Stack, Typography, Button, Grid } from '@mui/material';
import MainSiteLayout, { MAIN_DOMAIN } from 'src/components/main-site/MainSiteLayout';

const TARGETS = [
  { title: '구축 비용이 부담되는 사업자', desc: '쇼핑몰 제작비 0원, 바로 판매를 시작할 수 있습니다.' },
  { title: 'SNS 중심으로 판매하는 사업자', desc: '인스타·블로그·카카오톡 채널과 자연스럽게 연결됩니다.' },
  { title: '해외 고객 대상 판매 사업자', desc: '다국어·다통화로 글로벌 고객을 응대할 수 있습니다.' },
  { title: '해외 결제 솔루션이 필요한 사업자', desc: 'PayPal·Stripe 등 해외 결제 PG 연동을 지원합니다.' },
];

const ACTIONS = [
  { title: '온라인 쇼핑몰 신청서', desc: '사업자 정보 입력 후 무료 쇼핑몰을 신청하세요.', href: '/apply', cta: '신청하러 가기' },
  { title: '무료 쇼핑몰 프레임 선택', desc: '11종 디자인 프레임을 미리 보고 선택하세요.', href: '/frames', cta: '프레임 보기' },
  { title: '관리자 매뉴얼', desc: '쇼핑몰 운영을 위한 관리자 페이지 가이드.', href: '/manual', cta: '매뉴얼 받기' },
];

const LANGS = [
  { flag: '🇰🇷', label: '한국어' },
  { flag: '🇺🇸', label: '영어' },
  { flag: '🇯🇵', label: '일본어' },
  { flag: '🇨🇳', label: '중국어' },
  { flag: '🇪🇸', label: '스페인어' },
];

const HomePage = () => {
  const router = useRouter();

  return (
    <>
      {/* HERO */}
      <Box sx={{ py: { xs: 8, md: 16 } }}>
        <Container maxWidth="lg">
          <Stack spacing={3} alignItems="center" textAlign="center">
            <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>
              FREE SHOPPING MALL · POSPAY
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: 32, md: 56 },
                fontWeight: 900,
                lineHeight: 1.15,
                letterSpacing: '-1.5px',
                maxWidth: 900,
              }}
            >
              쇼핑몰 제작비 없이,
              <br />
              바로 판매를 시작하세요.
            </Typography>
            <Typography sx={{ fontSize: { xs: 14, md: 18 }, color: '#555', maxWidth: 640, lineHeight: 1.7 }}>
              포스페이 가맹점 전용 무료 쇼핑몰 시스템.
              <br />
              사업자 정보와 가맹점명만 입력하면 바로 내 쇼핑몰이 열립니다.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 2 }}>
              <Button
                size="large"
                variant="contained"
                onClick={() => router.push('/apply')}
                sx={{
                  bgcolor: '#111',
                  color: '#fff',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 999,
                  '&:hover': { bgcolor: '#000' },
                }}
              >
                무료 쇼핑몰 신청하기
              </Button>
              <Button
                size="large"
                variant="outlined"
                onClick={() => router.push('/frames')}
                sx={{
                  borderColor: '#111',
                  color: '#111',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  borderRadius: 999,
                  '&:hover': { borderColor: '#000', bgcolor: '#fafafa' },
                }}
              >
                프레임 미리보기
              </Button>
            </Stack>
            <Box
              sx={{
                mt: 4,
                px: 3,
                py: 1.5,
                border: '1px dashed #ccc',
                borderRadius: 2,
                bgcolor: '#fafaf7',
              }}
            >
              <Typography sx={{ fontSize: 13, color: '#666' }}>
                내 쇼핑몰 주소 예시 —{' '}
                <Box component="span" sx={{ fontWeight: 700, color: '#111' }}>
                  가맹점명.{MAIN_DOMAIN}
                </Box>
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* TARGETS */}
      <Box id="features" sx={{ py: { xs: 8, md: 12 }, bgcolor: '#fafaf7' }}>
        <Container maxWidth="lg">
          <Stack spacing={1} textAlign="center" mb={6}>
            <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>
              WHO IT'S FOR
            </Typography>
            <Typography sx={{ fontSize: { xs: 24, md: 36 }, fontWeight: 900, letterSpacing: '-1px' }}>
              이런 분께 추천드립니다
            </Typography>
          </Stack>
          <Grid container spacing={2}>
            {TARGETS.map((t, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Box sx={{ p: 3, bgcolor: '#fff', border: '1px solid #eee', borderRadius: 2, height: '100%' }}>
                  <Box sx={{ fontSize: 11, letterSpacing: 2, color: '#888', fontWeight: 700, mb: 1 }}>
                    0{idx + 1}
                  </Box>
                  <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 1, lineHeight: 1.3 }}>{t.title}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{t.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* LANGS */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="md">
          <Stack spacing={1} textAlign="center" mb={5}>
            <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>
              GLOBAL READY
            </Typography>
            <Typography sx={{ fontSize: { xs: 24, md: 36 }, fontWeight: 900, letterSpacing: '-1px' }}>
              다국어 자동 지원
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#666', mt: 1 }}>
              Google Translate 기반으로 해외 고객 응대를 시작할 수 있습니다.
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="center" spacing={{ xs: 2, sm: 4 }} flexWrap="wrap">
            {LANGS.map((l) => (
              <Stack key={l.label} alignItems="center" spacing={1} sx={{ p: 2 }}>
                <Typography sx={{ fontSize: 40 }}>{l.flag}</Typography>
                <Typography sx={{ fontSize: 13, color: '#555' }}>{l.label}</Typography>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ACTIONS */}
      <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: '#111', color: '#fff' }}>
        <Container maxWidth="lg">
          <Stack spacing={1} textAlign="center" mb={6}>
            <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>
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
                    '&:hover': { bgcolor: '#222', borderColor: '#555', transform: 'translateY(-2px)' },
                  }}
                >
                  <Box sx={{ fontSize: 11, letterSpacing: 2, color: '#888', fontWeight: 700, mb: 1.5 }}>
                    STEP {idx + 1}
                  </Box>
                  <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 1.5 }}>{a.title}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#aaa', mb: 3, lineHeight: 1.6 }}>{a.desc}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>{a.cta} →</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </>
  );
};

HomePage.getLayout = (page) => <MainSiteLayout>{page}</MainSiteLayout>;

export default HomePage;
