import { useRouter } from 'next/router';
import { Box, Container, Stack, Typography, Button } from '@mui/material';
import { Icon } from '@iconify/react';
import MainSiteLayout from 'src/components/main-site/MainSiteLayout';

const ApplyCompletePage = () => {
  const router = useRouter();

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 8, md: 14 } }}>
      <Stack spacing={3} alignItems="center" textAlign="center">
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: '#111',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon icon="tabler:check" width={36} height={36} />
        </Box>
        <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 900, letterSpacing: '-1px' }}>
          신청이 접수되었습니다
        </Typography>
        <Typography sx={{ fontSize: 14, color: '#666', lineHeight: 1.8, maxWidth: 420 }}>
          담당자가 검토 후 입력하신 연락처로 연락드리겠습니다.
          <br />
          승인이 완료되면 신청하신 가맹점명으로 쇼핑몰이 개설됩니다.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ pt: 2 }}>
          <Button
            variant="contained"
            onClick={() => router.push('/')}
            sx={{
              bgcolor: '#111',
              color: '#fff',
              fontWeight: 700,
              borderRadius: 999,
              px: 4,
              py: 1.25,
              '&:hover': { bgcolor: '#000' },
            }}
          >
            홈으로
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/manual')}
            sx={{
              borderColor: '#111',
              color: '#111',
              fontWeight: 700,
              borderRadius: 999,
              px: 4,
              py: 1.25,
              '&:hover': { borderColor: '#000', bgcolor: '#fafafa' },
            }}
          >
            관리자 매뉴얼 받기
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

ApplyCompletePage.getLayout = (page) => <MainSiteLayout>{page}</MainSiteLayout>;

export default ApplyCompletePage;
