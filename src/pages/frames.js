import { useRouter } from 'next/router';
import { Box, Container, Stack, Typography, Button, Grid, Chip } from '@mui/material';
import MainSiteLayout, { MAIN_DOMAIN } from 'src/components/main-site/MainSiteLayout';
import { FRAMES, FRAME_GROUP_ORDER, getFramePreviewBrand } from 'src/components/main-site/frameList';
import { useSubpageT, useFrameT } from 'src/components/main-site/landingStrings';

const FramesPage = () => {
  const router = useRouter();
  const st = useSubpageT();
  const ft = useFrameT();

  // 경로는 /shop 하나다. f.category('shop'|'blog')는 프레임 분류 표시용일 뿐 URL 이 아니다.
  // (예전엔 그대로 붙여서 프레임 4~11 미리보기가 /blog 로 열렸다 — grep '/blog' 로는
  //  안 잡히는 조립형 URL 이라 /shop 통일 때 누락됐던 자리)
  const buildPreviewUrl = (f) => `https://demo-${f.no}.${MAIN_DOMAIN}/shop`;

  return (
    <Box>
      {/* HERO */}
      <Box sx={{ py: { xs: 6, md: 10 }, bgcolor: '#fafaf7', borderBottom: '1px solid #eee' }}>
        <Container maxWidth="lg">
          <Stack spacing={1.5} textAlign="center">
            <Typography sx={{ fontSize: 12, letterSpacing: 4, color: '#888', fontWeight: 700 }}>
              FRAME CATALOG · 6 DESIGNS
            </Typography>
            <Typography sx={{ fontSize: { xs: 26, md: 40 }, fontWeight: 900, letterSpacing: '-1.2px' }}>
              {st('frames.title')}
            </Typography>
            <Typography sx={{ fontSize: 14, color: '#666', maxWidth: 620, alignSelf: 'center', lineHeight: 1.7, textAlign: 'center' }}>
              {st('frames.desc1')}
              <br />
              {st('frames.desc2')}
            </Typography>
            {/* 미리보기는 콘텐츠가 채워진 예시 화면이라 개설 직후 빈 몰과 격차가 크다.
                "본 화면 그대로 개설된다"는 오해를 카탈로그 단계에서 먼저 막는다. */}
            <Typography sx={{ fontSize: 13, color: '#8a8a90', maxWidth: 620, alignSelf: 'center', lineHeight: 1.7, textAlign: 'center', pt: 0.5 }}>
              {st('frames.noticeContent')}
            </Typography>
            {/* 프레임을 고르는 것이 '몰 전체'를 고르는 것으로 읽히지 않게, 프레임이 정하는 범위를 먼저 밝힌다.
                주문서·결제·주문내역 등은 어느 프레임을 골라도 같은 화면이다. */}
            <Typography sx={{ fontSize: 13, color: '#8a8a90', maxWidth: 620, alignSelf: 'center', lineHeight: 1.7, textAlign: 'center' }}>
              {st('frames.groupNote')}
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* FRAME GRID — 계열별로 묶는다.
          6장을 나란히 놓으면 "서로 다른 6개 몰"로 읽히는데, 실제로 갈리는 경계는 3개다.
          특히 프레임5·6은 헤더·푸터·장바구니·주문·마이페이지가 같은 화면이고
          홈과 상품상세 디자인만 다르다 — 그걸 모르고 고르면 기대와 어긋난다. */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        {FRAME_GROUP_ORDER.map((group, gi) => {
          const list = FRAMES.filter((f) => f.group === group);
          if (!list.length) return null;
          return (
        <Box key={group} sx={{ mt: gi === 0 ? 0 : { xs: 6, md: 9 } }}>
          <Stack spacing={0.75} sx={{ mb: 3, pb: 2, borderBottom: '1px solid #eee' }}>
            <Typography sx={{ fontSize: { xs: 17, md: 20 }, fontWeight: 900, letterSpacing: '-0.4px' }}>
              {st(`frames.group.${group}.title`)}
            </Typography>
            <Typography sx={{ fontSize: 13, color: '#666', lineHeight: 1.7, wordBreak: 'keep-all' }}>
              {st(`frames.group.${group}.desc`)}
            </Typography>
          </Stack>
        <Grid container spacing={3}>
          {list.map((f) => {
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
                <Typography sx={{ fontSize: 13, color: '#666', lineHeight: 1.7, flexGrow: 1, whiteSpace: 'pre-line', wordBreak: 'keep-all' }}>
                  {fi.desc}
                </Typography>
                <Box sx={{ pt: 1.5, borderTop: '1px dashed #eee' }}>
                  <Typography sx={{ fontSize: 11, color: '#888', fontWeight: 700, mb: 0.5 }}>
                    {st('frames.recommendLabel')}
                  </Typography>
                  {/* 추천업종에 '※ …' 같은 단서 한 줄이 붙는 프레임이 있다(스크롤형).
                      줄바꿈을 살리지 않으면 업종 뒤에 그대로 이어 붙어 한 문장처럼 읽힌다. */}
                  <Typography sx={{ fontSize: 12, color: '#444', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{fi.recommend}</Typography>
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
        </Box>
          );
        })}
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
