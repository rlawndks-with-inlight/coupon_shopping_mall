import { useRouter } from 'next/router';
import { Box, Container, Stack, Typography, Button } from '@mui/material';
import { Icon } from '@iconify/react';
import MainSiteLayout from 'src/components/main-site/MainSiteLayout';
import { useSubpageT } from 'src/components/main-site/landingStrings';
import GuideBody from 'src/components/manager/GuideBody';

const PDF_URL = '/manual/manager-guide.pdf';

const ManualPage = () => {
  const router = useRouter();
  const st = useSubpageT();

  return (
    <Box>
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack spacing={1.5} alignItems="center" textAlign="center" mb={5}>
          <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>
            MANUAL · 2026
          </Typography>
          <Typography sx={{ fontSize: { xs: 26, md: 40 }, fontWeight: 900, letterSpacing: '-1.2px' }}>
            {st('manual.title')}
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#666', maxWidth: 560, lineHeight: 1.7 }}>
            처음이시라면 아래 순서대로 따라 하시면 쇼핑몰을 열 수 있습니다.
          </Typography>
          <Button
            variant="text"
            size="small"
            href={PDF_URL}
            download
            startIcon={<Icon icon="tabler:download" />}
            sx={{ color: '#888', fontSize: 12.5, mt: 0.5 }}
          >
            PDF로 받기 (선택)
          </Button>
        </Stack>

        {/* 로그인 전 랜딩이라 '해당 메뉴로 이동' 버튼은 숨김 */}
        <GuideBody showRouteButtons={false} />

        <Box
          sx={{ mt: 6, p: 3, border: '1px dashed #ccc', borderRadius: 2, bgcolor: '#fafaf7', textAlign: 'center' }}
        >
          <Typography sx={{ fontSize: 13, color: '#666', lineHeight: 1.7 }}>
            {st('manual.preApply')}{' '}
            <Box
              component="span"
              onClick={() => router.push('/frames')}
              sx={{ color: '#111', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {st('manual.applyLink')}
            </Box>
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

ManualPage.getLayout = (page) => <MainSiteLayout>{page}</MainSiteLayout>;

export default ManualPage;
