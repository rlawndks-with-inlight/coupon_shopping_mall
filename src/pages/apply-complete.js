import { useRouter } from 'next/router';
import { Box, Container, Stack, Typography, Button } from '@mui/material';
import { Icon } from '@iconify/react';
import MainSiteLayout from 'src/components/main-site/MainSiteLayout';
import { useSubpageT } from 'src/components/main-site/landingStrings';
import { MobileBreakText } from 'src/components/main-site/mobileBreak';

const ApplyCompletePage = () => {
  const router = useRouter();
  const st = useSubpageT();

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
          {st('complete.title')}
        </Typography>
        {/* 모바일 줄바꿈 자리는 사전의 '|' 로 지정한다 — 프레임 페이지 안내문과 같은 이유다. */}
        <Typography sx={{ fontSize: 14, color: '#666', lineHeight: 1.8, maxWidth: 420, textWrap: 'balance' }}>
          <MobileBreakText text={st('complete.desc1')} />
          <br />
          <MobileBreakText text={st('complete.desc2')} />
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
            {st('complete.home')}
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
            {st('complete.manual')}
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
};

ApplyCompletePage.getLayout = (page) => <MainSiteLayout>{page}</MainSiteLayout>;

export default ApplyCompletePage;
