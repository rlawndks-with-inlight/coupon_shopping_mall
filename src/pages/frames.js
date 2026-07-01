import { useRouter } from 'next/router';
import { Box, Container, Stack, Typography, Button, Grid, Chip } from '@mui/material';
import MainSiteLayout, { MAIN_DOMAIN } from 'src/components/main-site/MainSiteLayout';
import { FRAMES, getFramePreviewBrand } from 'src/components/main-site/frameList';
import { useSubpageT, useFrameT } from 'src/components/main-site/landingStrings';

const FramesPage = () => {
  const router = useRouter();
  const st = useSubpageT();
  const ft = useFrameT();

  const buildPreviewUrl = (f) => `https://demo-${f.no}.${MAIN_DOMAIN}/${f.category}`;

  return (
    <Box>
      {/* HERO */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fafaf7', borderBottom: '1px solid #eee' }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5} textAlign="center">
            <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>
              FRAME CATALOG · 11 DESIGNS
            </Typography>
            <Typography sx={{ fontSize: { xs: 26, md: 40 }, fontWeight: 900, letterSpacing: '-1.2px' }}>
              {st('frames.title')}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#666', maxWidth: 620, alignSelf: 'center', lineHeight: 1.7, textAlign: 'center' }}>
              {st('frames.desc1')}
              <br />
              {st('frames.desc2')}
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* FRAME GRID */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={3}>
          {FRAMES.map((f) => {
            const fi = ft(f.key);
            return (
            <Grid item xs={12} sm={6} md={4} key={f.key}>
              <Stack
                spacing={2}
                sx={{
                  p: 3,
                  height: '100%',
                  border: '1px solid #e5e5e5',
                  borderRadius: 2,
                  bgcolor: '#fff',
                  transition: 'all 0.2s',
                  '&:hover': { borderColor: '#111', boxShadow: '0 6px 24px rgba(0,0,0,0.06)' },
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Box sx={{ fontSize: 11, letterSpacing: 3, color: '#888', fontWeight: 700 }}>
                    DEMO · {f.no.toString().padStart(2, '0')}
                  </Box>
                  <Chip
                    label={fi.keyword}
                    size="small"
                    sx={{ fontSize: 11, height: 22, bgcolor: '#fafaf7', color: '#555' }}
                  />
                </Stack>
                <Typography sx={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                  {fi.title}
                </Typography>
                <Typography sx={{ fontSize: 13, color: '#666', lineHeight: 1.7, flexGrow: 1 }}>
                  {fi.desc}
                </Typography>
                <Box sx={{ pt: 1.5, borderTop: '1px dashed #eee' }}>
                  <Typography sx={{ fontSize: 11, color: '#888', fontWeight: 700, mb: 0.5 }}>
                    {st('frames.recommendLabel')}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#444', lineHeight: 1.6 }}>{fi.recommend}</Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ pt: 1 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    disabled={!getFramePreviewBrand(f.no)}
                    onClick={() => window.open(buildPreviewUrl(f), '_blank')}
                    sx={{
                      borderColor: '#111',
                      color: '#111',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      '&:hover': { borderColor: '#000', bgcolor: '#fafafa' },
                      '&.Mui-disabled': { borderColor: '#ddd', color: '#bbb' },
                    }}
                  >
                    {getFramePreviewBrand(f.no) ? st('frames.preview') : st('frames.comingSoon')}
                  </Button>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => router.push(`/apply?frame=${f.key}`)}
                    sx={{
                      bgcolor: '#111',
                      color: '#fff',
                      fontWeight: 700,
                      borderRadius: 1.5,
                      '&:hover': { bgcolor: '#000' },
                    }}
                  >
                    {st('frames.applyBtn')}
                  </Button>
                </Stack>
              </Stack>
            </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* CTA */}
      <Box sx={{ py: 8, bgcolor: '#111', color: '#fff' }}>
        <Container maxWidth="md">
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography sx={{ fontSize: { xs: 20, md: 28 }, fontWeight: 900, letterSpacing: '-0.5px' }}>
              {st('frames.ctaLine1')}
              <br />
              {st('frames.ctaLine2')}
            </Typography>
            {
              /*
              <Button
              variant="contained"
              size="large"
              onClick={() => router.push('/apply')}
              sx={{
                bgcolor: '#fff',
                color: '#111',
                fontWeight: 800,
                borderRadius: 999,
                px: 4,
                py: 1.5,
                '&:hover': { bgcolor: '#eee' },
              }}
            >
              무료 쇼핑몰 신청하기
            </Button>
              */
            }
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

FramesPage.getLayout = (page) => <MainSiteLayout>{page}</MainSiteLayout>;

export default FramesPage;
