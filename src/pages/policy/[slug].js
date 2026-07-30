import { useRouter } from 'next/router';
import Head from 'next/head';
import { Box, Container, Typography, Stack, Button } from '@mui/material';
import MainSiteLayout from 'src/components/main-site/MainSiteLayout';
import { POLICY_DOCS, getPolicyDoc } from 'src/components/main-site/policyContent';

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

  return (
    <>
      <Head>
        <title>{doc ? `${doc.title} · SHOPGO` : 'SHOPGO 정책'}</title>
      </Head>
      <Box sx={{ bgcolor: '#fff', py: { xs: 5, md: 8 } }}>
        <Container maxWidth="md">
          {!doc ? (
            <Stack spacing={2} alignItems="center" sx={{ py: 10 }}>
              <Typography sx={{ fontSize: 20, fontWeight: 800 }}>문서를 찾을 수 없습니다</Typography>
              <Button variant="outlined" onClick={() => router.push('/')} sx={{ borderRadius: 999 }}>
                홈으로
              </Button>
            </Stack>
          ) : (
            <>
              <Typography sx={{ fontSize: { xs: 24, md: 32 }, fontWeight: 900, letterSpacing: '-0.5px', mb: 1 }}>
                {doc.title}
              </Typography>
              <Typography sx={{ fontSize: 13, color: '#999', mb: 4 }}>
                시행일: {doc.effectiveDate}
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
                <Typography sx={{ fontSize: 12, color: '#999', mb: 1.5 }}>다른 약관·정책</Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {POLICY_DOCS.filter((d) => d.slug !== doc.slug).map((d) => (
                    <Button
                      key={d.slug}
                      size="small"
                      variant="text"
                      onClick={() => router.push(`/policy/${d.slug}`)}
                      sx={{ color: '#666', fontSize: 12, textTransform: 'none', p: 0.5, minWidth: 0 }}
                    >
                      {d.title}
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
