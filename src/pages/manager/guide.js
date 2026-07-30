import { useRouter } from 'next/router';
import Head from 'next/head';
import { Box, Container, Stack, Typography, Button, Chip, Divider } from '@mui/material';
import { Icon } from '@iconify/react';
import ManagerLayout from 'src/layouts/manager/ManagerLayout';
import { useSettingsContext } from 'src/components/settings';
import { GUIDE_PART1, GUIDE_PART2 } from 'src/components/manager/guideContent';

const badgeColor = (badge) => {
  switch (badge) {
    case '필수': return { bg: '#fdecea', fg: '#d33' };
    case '권장': return { bg: '#eef4ff', fg: '#2e6bd6' };
    case '조건부': return { bg: '#fff4e5', fg: '#f0a020' };
    case '운영': return { bg: '#eaf7ee', fg: '#2e7d32' };
    default: return { bg: '#f1f1f1', fg: '#888' };
  }
};

const GuideCard = ({ s, brandId, router, ordered }) => {
  const bc = badgeColor(s.badge);
  const route = s.route ? s.route.replace('{id}', brandId ?? '') : null;
  return (
    <Box
      id={s.id}
      sx={{
        border: '1px solid #eee',
        borderRadius: 2,
        p: { xs: 2, md: 2.5 },
        bgcolor: '#fff',
        scrollMarginTop: 90,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
        {ordered && (
          <Box
            sx={{
              minWidth: 34, height: 34, borderRadius: '50%',
              bgcolor: '#111', color: '#fff', fontWeight: 800, fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {s.no}
          </Box>
        )}
        <Typography sx={{ fontSize: 17, fontWeight: 800, flex: 1 }}>{s.title}</Typography>
        <Chip label={s.badge} size="small" sx={{ bgcolor: bc.bg, color: bc.fg, fontWeight: 700, height: 22 }} />
      </Stack>

      <Typography sx={{ fontSize: 12.5, color: '#999', mb: 1 }}>
        <Icon icon="mdi:map-marker-outline" style={{ verticalAlign: '-2px' }} /> {s.where}
      </Typography>

      <Typography sx={{ fontSize: 13.5, color: '#555', lineHeight: 1.7, mb: 1.5 }}>{s.why}</Typography>

      <Stack component="ol" spacing={0.5} sx={{ m: 0, pl: 2.5 }}>
        {s.steps.map((step, i) => (
          <Typography key={i} component="li" sx={{ fontSize: 13.5, color: '#333', lineHeight: 1.7 }}>
            {step}
          </Typography>
        ))}
      </Stack>

      {route && (
        <Button
          size="small"
          variant="outlined"
          onClick={() => router.push(route)}
          endIcon={<Icon icon="mdi:arrow-right" />}
          sx={{ mt: 1.5 }}
        >
          해당 메뉴로 이동
        </Button>
      )}
    </Box>
  );
};

const GuidePage = () => {
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();
  const brandId = themeDnsData?.id;

  return (
    <>
      <Head><title>관리자 이용가이드</title></Head>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 900 }}>관리자 이용가이드</Typography>
          <Typography sx={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
            처음이시라면 <b>아래 순서대로</b> 따라 하시면 쇼핑몰을 열 수 있습니다. 앞 단계가 뒤 단계의 준비가 되니 순서를 지켜주세요.
          </Typography>
        </Stack>

        {/* Part 1 — 오픈까지 순서대로 */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 800 }}>① 쇼핑몰 오픈까지 — 이 순서대로</Typography>
        </Stack>
        <Stack spacing={2}>
          {GUIDE_PART1.map((s) => (
            <GuideCard key={s.id} s={s} brandId={brandId} router={router} ordered />
          ))}
        </Stack>

        <Box sx={{ my: 3, p: 2, borderRadius: 2, bgcolor: '#eaf7ee', border: '1px solid #cbe6d2' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#2e7d32' }}>
            ✅ 카테고리 · 상품 · 결제수단이 모두 준비되면 판매가 시작됩니다.
          </Typography>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* Part 2 — 운영하며 필요할 때 */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <Typography sx={{ fontSize: 18, fontWeight: 800 }}>② 운영하며 필요할 때</Typography>
        </Stack>
        <Typography sx={{ fontSize: 13, color: '#999', mb: 2 }}>
          아래는 특별한 순서 없이, 그때그때 필요할 때 사용하는 기능입니다.
        </Typography>
        <Stack spacing={2}>
          {GUIDE_PART2.map((s) => (
            <GuideCard key={s.id} s={s} brandId={brandId} router={router} />
          ))}
        </Stack>
      </Container>
    </>
  );
};

GuidePage.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default GuidePage;
