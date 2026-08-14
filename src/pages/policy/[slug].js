import { useRouter } from 'next/router';
import Head from 'next/head';
import { Box, Container, Typography, Stack, Button } from '@mui/material';
import MainSiteLayout, { policyLabelKey } from 'src/components/main-site/MainSiteLayout';
import { POLICY_DOCS, getPolicyDoc } from 'src/components/main-site/policyContent';
import { useLandingT } from 'src/components/main-site/landingStrings';

// 문단 유형 판별 → 장/조/부칙은 강조 표시
const lineKind = (s) => {
  if (/^제\s*\d+\s*장/.test(s)) return 'chapter';
  if (/^제\s*\d+\s*조/.test(s)) return 'article';
  if (/^부칙/.test(s)) return 'article';
  return 'body';
};

const PolicyPage = () => {
  const router = useRouter();
  const slug = router.query?.slug;
  const doc = getPolicyDoc(slug);
  const t = useLandingT();
  // 제목·틀은 화면 언어로, 본문은 한국어 원문 그대로. 사전에 없으면 원문 제목으로 폴백한다.
  const 제목 = (d) => t[policyLabelKey(d.slug)] || d.title.replace('SHOPGO ', '');

  return (
    <>
      <Head>
        <title>{doc ? `${doc.title} · SHOPGO` : 'SHOPGO 정책'}</title>
      </Head>
      <Box sx={{ bgcolor: '#fff', py: { xs: 5, md: 8 } }}>
        <Container maxWidth="md">
          {!doc ? (
            <Stack spacing={2} alignItems="center" sx={{ py: 10 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800 }}>{t.policyNotFound}</Typography>
              <Button variant="outlined" onClick={() => router.push('/')} sx={{ borderRadius: 999 }}>
                {t.policyHome}
              </Button>
            </Stack>
          ) : (
            <>
              <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 900, letterSpacing: '-0.5px', mb: 1 }}>
                {제목(doc)}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#999', mb: 1 }}>
                {t.policyEffective}: {doc.effectiveDate}
              </Typography>
              {/* 링크는 각 언어로 뜨는데 본문은 한국어다 — 눌러 들어온 사람이 당황하지 않게 먼저 밝힌다 */}
              <Typography sx={{ fontSize: 12, color: '#aaa', mb: 4 }}>
                {t.policyKoreanOnly}
              </Typography>
              <Box sx={{ borderTop: '2px solid #111', pt: 3 }}>
                {doc.lines.map((line, i) => {
                  const kind = lineKind(line);
                  if (kind === 'chapter') {
                    return (
                      <Typography key={i} sx={{ fontSize: 18, fontWeight: 800, mt: 4, mb: 1.5, color: '#111' }}>
                        {line}
                      </Typography>
                    );
                  }
                  if (kind === 'article') {
                    return (
                      <Typography key={i} sx={{ fontSize: 15, fontWeight: 700, mt: 2.5, mb: 1, color: '#222' }}>
                        {line}
                      </Typography>
                    );
                  }
                  // keep-all 을 여기에 직접 둔다 — MainSiteLayout 의 줄바꿈 규칙을 안 따른다.
                  // 그 규칙은 '화면 언어'를 보는데, 이 본문은 화면 언어와 무관하게 늘 한국어다.
                  // 상속에 맡기면 일본어·중국어 화면에서 normal 이 내려와 한국어 본문이
                  // 어절 한가운데서 잘린다(… 있습니 / 다).
                  return (
                    <Typography
                      key={i}
                      sx={{ fontSize: 14, color: '#444', lineHeight: 1.9, mb: 0.75, whiteSpace: 'pre-wrap', wordBreak: 'keep-all' }}
                    >
                      {line}
                    </Typography>
                  );
                })}
              </Box>

              {/* 다른 약관 바로가기 */}
              <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid #eee' }}>
                <Typography sx={{ fontSize: 12, color: '#999', mb: 1.5 }}>{t.policyOthers}</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {POLICY_DOCS.filter((d) => d.slug !== doc.slug).map((d) => (
                    <Button
                      key={d.slug}
                      size="small"
                      variant="text"
                      onClick={() => router.push(`/policy/${d.slug}`)}
                      sx={{ color: '#666', fontSize: 12, textTransform: 'none', p: 0.5, minWidth: 0 }}
                    >
                      {제목(d)}
                    </Button>
                  ))}
                </Stack>
              </Box>
            </>
          )}
        </Container>
      </Box>
    </>
  );
};

PolicyPage.getLayout = (page) => <MainSiteLayout>{page}</MainSiteLayout>;
export default PolicyPage;
