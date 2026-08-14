import { useRouter } from 'next/router';
import { Box, Container, Stack, Typography, Button, Grid, Chip } from '@mui/material';
import MainSiteLayout, { MAIN_DOMAIN } from 'src/components/main-site/MainSiteLayout';
import { FRAMES, FRAME_GROUP_ORDER, getFramePreviewBrand } from 'src/components/main-site/frameList';
import { useSubpageT, useFrameT } from 'src/components/main-site/landingStrings';
import { MobileBreakText } from 'src/components/main-site/mobileBreak';

const FramesPage = () => {
  const router = useRouter();
  const st = useSubpageT();
  const ft = useFrameT();

  // 경로는 /shop 하나다. f.category('shop'|'blog')는 프레임 분류 표시용일 뿐 URL 이 아니다.
  // (예전엔 그대로 붙여서 프레임 4~11 미리보기가 /blog 로 열렸다 — grep '/blog' 로는
  //  안 잡히는 조립형 URL 이라 /shop 통일 때 누락됐던 자리)
  const buildPreviewUrl = (f) => `https://demo-${f.no}.${MAIN_DOMAIN}/shop`;

  // 계열 순서(쇼핑몰형 → 블로그형 → 단일·소수 상품형)로만 줄을 세우고 줄바꿈은 하지 않는다.
  // 계열마다 제목을 달아 2장씩 끊으면 '서로 다른 묶음 3개'로 읽혀 6장을 나란히 못 본다.
  const 프레임순서 = [...FRAMES].sort(
    (a, b) => FRAME_GROUP_ORDER.indexOf(a.group) - FRAME_GROUP_ORDER.indexOf(b.group) || a.no - b.no
  );

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
            {/* 가운데 정렬 안내문 — 모바일에서 끊을 자리를 사전의 '|' 로 직접 지정한다.
                브라우저에 맡기면 기기 폭에 따라 자리가 달라져 끝 어절 하나만 떨어진다.
                  360px:  … 화면 구성을 / 확인하실 수 있습니다      ← 보기 좋다
                  390px:  … 화면 구성을 확인하실 / 수 있습니다      ← 한 어절만큼 넓어서 깨진다
                textWrap: balance 는 남겨 둔다 — '|' 를 안 넣은 언어(중국어 등)의 보험이다. */}
            <Typography sx={{ fontSize: 14, color: '#666', maxWidth: 620, alignSelf: 'center', lineHeight: 1.7, textAlign: 'center', textWrap: 'balance' }}>
              <MobileBreakText text={st('frames.desc1')} />
              <br />
              <MobileBreakText text={st('frames.desc2')} />
            </Typography>
            {/* 회색 안내 문장(noticeContent·groupNote)은 요청에 따라 제거(모바일·PC 공통). */}
          </Stack>
        </Container>
      </Box>

      {/* FRAME GRID — 3열 2행 한 판.
          계열(쇼핑몰형·블로그형·단일/소수 상품형)은 카드 우측 상단 배지로만 밝힌다.
          배지에 마우스를 올리면 그 계열이 무엇인지 설명이 뜬다 — 특히 프레임5·6은
          헤더·푸터·장바구니·주문·마이페이지가 같은 화면이고 홈과 상품상세만 다르다. */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Grid container spacing={3}>
          {프레임순서.map((f) => {
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
                {/* 배지 글자 길이가 언어마다 다르다(en 'Few-product landing'). 자리가 모자라면
                    말줄임표로 자르지 말고 아랫줄로 내린다 — ml:auto 라서 내려가도 오른쪽에 붙는다. */}
                <Stack direction="row" alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.5, columnGap: 1 }}>
                  <Box sx={{ fontSize: 11, letterSpacing: 3, color: '#888', fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>
                    DEMO · {f.no.toString().padStart(2, '0')}
                  </Box>
                  {/* 계열 배지. 줄을 나누는 대신 여기서 계열을 밝힌다.
                      title 은 마우스오버 설명 — 계열 소개 문단이 사라진 자리를 대신한다. */}
                  <Chip
                    label={st(`frames.group.${f.group}.short`)}
                    title={st(`frames.group.${f.group}.desc`)}
                    size="small"
                    sx={{
                      ml: 'auto',
                      maxWidth: '100%',
                      fontSize: 11,
                      height: 22,
                      fontWeight: 700,
                      color: '#111',
                      bgcolor: 'transparent',
                      border: '1px solid #d8d8d8',
                    }}
                  />
                </Stack>
                <Stack spacing={1} alignItems="flex-start">
                  <Typography sx={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
                    {fi.title}
                  </Typography>
                  <Chip
                    label={fi.keyword}
                    size="small"
                    sx={{ fontSize: 11, height: 22, bgcolor: '#fafaf7', color: '#555' }}
                  />
                </Stack>
                <Typography sx={{ fontSize: 13, color: '#666', lineHeight: 1.7, flexGrow: 1, whiteSpace: 'pre-line' }}>
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
      </Container>

      {/* CTA */}
      <Box sx={{ py: 8, bgcolor: '#111', color: '#fff' }}>
        <Container maxWidth="md">
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Typography sx={{ fontSize: { xs: 20, md: 28 }, fontWeight: 900, letterSpacing: '-0.5px' }}>
              <MobileBreakText text={st('frames.ctaLine1')} />
              <br />
              <MobileBreakText text={st('frames.ctaLine2')} />
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
