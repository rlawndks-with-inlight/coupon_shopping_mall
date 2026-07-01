import { useRouter } from 'next/router';
import { Box, Container, Stack, Typography, Button, Grid } from '@mui/material';
import { Icon } from '@iconify/react';
import MainSiteLayout from 'src/components/main-site/MainSiteLayout';
import { useSubpageT } from 'src/components/main-site/landingStrings';

const PDF_URL = '/manual/manager-guide.pdf';

// 아이콘만 (제목·설명은 번역에서: manual.h{n}Title / manual.h{n}Desc)
const HL_ICONS = [
  'tabler:layout-dashboard',
  'tabler:shopping-bag',
  'tabler:receipt',
  'tabler:users',
  'tabler:palette',
  'tabler:settings',
];

const ManualPage = () => {
  const router = useRouter();
  const st = useSubpageT();

  return (
    <Box>
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={2} alignItems="center" textAlign="center" mb={6}>
          <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>
            MANUAL · 2026
          </Typography>
          <Typography sx={{ fontSize: { xs: 26, md: 40 }, fontWeight: 900, letterSpacing: '-1.2px' }}>
            {st('manual.title')}
          </Typography>
          <Typography sx={{ fontSize: 14, color: '#666', maxWidth: 540, lineHeight: 1.7 }}>
            {st('manual.desc1')}
            <br />
            {st('manual.desc2')}
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
              {st('manual.download')}
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
              {st('manual.viewNewTab')}
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontSize: 12, letterSpacing: 3, color: '#888', fontWeight: 700, mb: 2 }}>
            {st('manual.itemsLabel')}
          </Typography>
          <Grid container spacing={2}>
            {HL_ICONS.map((icon, i) => (
              <Grid item xs={12} sm={6} md={4} key={icon}>
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
                    <Icon icon={icon} width={20} height={20} />
                  </Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 800 }}>{st(`manual.h${i + 1}Title`)}</Typography>
                  <Typography sx={{ fontSize: 13, color: '#666', lineHeight: 1.6 }}>{st(`manual.h${i + 1}Desc`)}</Typography>
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
