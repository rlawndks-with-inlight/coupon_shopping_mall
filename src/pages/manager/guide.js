import Head from 'next/head';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Icon } from '@iconify/react';
import ManagerLayout from 'src/layouts/manager/ManagerLayout';
import { useSettingsContext } from 'src/components/settings';
import GuideBody from 'src/components/manager/GuideBody';
import { frameGroupOf, frameNoOf, FRAME_GROUP_LABEL } from 'src/components/manager/guideContent';

const GuidePage = () => {
  const { themeDnsData } = useSettingsContext();
  const brandId = themeDnsData?.id;
  // 프레임에 따라 '메인 화면을 꾸미는 방법'이 다르다 — 해당 없는 안내를 아예 내리고,
  // 지금 어느 계열을 쓰는 몰인지 위에 한 줄로 밝혀 둔다(없는 메뉴를 찾아 헤매지 않도록).
  const frameGroup = frameGroupOf(themeDnsData);
  const frameNo = frameNoOf(themeDnsData);

  return (
    <>
      <Head><title>관리자 이용가이드</title></Head>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} flexWrap="wrap" useFlexGap>
            <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 900 }}>관리자 이용가이드</Typography>
            {/* 랜딩(/manual)과 같은 파일. PDF 는 프레임을 가리지 않고 전 항목이 들어 있다(프레임별 꼬리표로 구분). */}
            <Button
              variant="outlined" size="small" href="/manual/manager-guide.pdf" download="쇼핑몰_관리자_이용가이드.pdf"
              startIcon={<Icon icon="tabler:download" />}
              sx={{ color: '#333', borderColor: '#ccc', fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              PDF 다운로드
            </Button>
          </Stack>
          <Typography sx={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
            처음이시라면 <b>아래 순서대로</b> 따라 하시면 쇼핑몰을 열 수 있습니다. 앞 단계가 뒤 단계의 준비가 되니 순서를 지켜주세요.
          </Typography>
          {frameGroup && (
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#f5f7fa', border: '1px solid #e3e8ef' }}>
              <Typography sx={{ fontSize: 13, color: '#455' }}>
                이 몰은 <b>{frameNo ? `프레임${frameNo}` : FRAME_GROUP_LABEL[frameGroup]}</b>입니다. 아래 안내에는 이 프레임에 해당하는 내용만 나옵니다.
                다른 프레임에만 있는 메뉴는 이 관리자 화면에도 없습니다.
              </Typography>
            </Box>
          )}
        </Stack>

        <GuideBody showRouteButtons brandId={brandId} frameGroup={frameGroup} frameNo={frameNo} />
      </Container>
    </>
  );
};

GuidePage.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default GuidePage;
