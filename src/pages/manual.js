import { useRouter } from 'next/router';
import { Box, Container, Stack, Typography, Button, Grid } from '@mui/material';
import { Icon } from '@iconify/react';
import MainSiteLayout from 'src/components/main-site/MainSiteLayout';

const PDF_URL = '/manual/manager-guide.pdf';

const HIGHLIGHTS = [
  { icon: 'tabler:layout-dashboard', title: '대시보드', desc: '주문·매출·회원 현황을 한눈에 확인합니다.' },
  { icon: 'tabler:shopping-bag', title: '상품 관리', desc: '상품 등록·옵션 설정·재고/품절 관리.' },
  { icon: 'tabler:receipt', title: '주문 처리', desc: '주문 확인·배송·환불·교환 처리 흐름.' },
  { icon: 'tabler:users', title: '회원 관리', desc: '회원 등급·쿠폰·포인트·CS 응대.' },
  { icon: 'tabler:palette', title: '디자인 설정', desc: '프레임 변경·로고·컬러·배너 편집.' },
  { icon: 'tabler:settings', title: '운영 설정', desc: '배송비·결제 수단·정책 페이지 관리.' },
];

const ManualPage = () => {
  const router = useRouter();

  return (
    <Box>
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={2} alignItems="center" textAlign="center" mb={6}>
          <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>
            MANUAL · 2026
          </Typography>
          <Typography sx={{ fontSize: { xs: 26, md: 40 }, fontWeight: 900, letterSpacing: '-1.2px' }}>
            관리자 페이지 가이드
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#666', maxWidth: 540, lineHeight: 1.7 }}>
            쇼핑몰 운영에 필요한 모든 메뉴와 기능을 한 권으로 정리한 가이드입니다.
            <br />
            PDF로 다운로드해 언제든 확인할 수 있습니다.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 2 }}>
            <Button
              variant="contained"
              size="large"
              href={PDF_URL}
              download
              sx={{
                bgcolor: '#111',
                color: '#fff',
                fontWeight: 700,
                borderRadius: 999,
                px: 4,
                py: 1.5,
                '&:hover': { bgcolor: '#000' },
              }}
              startIcon={<Icon icon="tabler:download" />}
            >
              매뉴얼 PDF 다운로드
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => window.open(PDF_URL, '_blank')}
              sx={{
                borderColor: '#111',
                color: '#111',
                fontWeight: 700,
                borderRadius: 999,
                px: 4,
                py: 1.5,
                '&:hover': { borderColor: '#000', bgcolor: '#fafafa' },
              }}
              startIcon={<Icon icon="tabler:eye" />}
            >
              새 탭에서 보기
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: 12, letterSpacing: 3, color: '#888', fontWeight: 700, mb: 2 }}>
            매뉴얼에 포함된 주요 항목
          </Typography>
          <Grid container spacing={2}>
            {HIGHLIGHTS.map((h) => (
              <Grid item xs={12} sm={6} md={4} key={h.title}>
                <Stack
                  spacing={1.5}
                  sx={{
                    p: 3,
                    border: '1px solid #eee',
                    borderRadius: 2,
                    bgcolor: '#fff',
                    height: '100%',
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: '#111',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon icon={h.icon} width={20} height={20} />
                  </Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{h.title}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{h.desc}</Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box
          sx={{
            mt: 6,
            p: 3,
            border: '1px dashed #ccc',
            borderRadius: 2,
            bgcolor: '#fafaf7',
            textAlign: 'center',
          }}
        >
          <Typography sx={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
            아직 신청 전이신가요?{' '}
            <Box
              component="span"
              onClick={() => router.push('/frames')}
              sx={{ color: '#111', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              무료 쇼핑몰 신청하기
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

ManualPage.getLayout = (page) => <MainSiteLayout>{page}</MainSiteLayout>;

export default ManualPage;
