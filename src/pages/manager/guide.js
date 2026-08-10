import Head from 'next/head';
import { Box, Container, Stack, Typography } from '@mui/material';
import ManagerLayout from 'src/layouts/manager/ManagerLayout';
import { useSettingsContext } from 'src/components/settings';
import GuideBody from 'src/components/manager/GuideBody';
import { frameGroupOf, FRAME_GROUP_LABEL } from 'src/components/manager/guideContent';

const GuidePage = () => {
  const { themeDnsData } = useSettingsContext();
  const brandId = themeDnsData?.id;
  // 프레임에 따라 '메인 화면을 꾸미는 방법'이 다르다 — 해당 없는 안내를 아예 내리고,
  // 지금 어느 계열을 쓰는 몰인지 위에 한 줄로 밝혀 둔다(없는 메뉴를 찾아 헤매지 않도록).
  const frameGroup = frameGroupOf(themeDnsData);

  return (
    <>
      <Head><title>관리자 이용가이드</title></Head>
      <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack spacing={1} sx={{ mb: 4 }}>
          <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 900 }}>관리자 이용가이드</Typography>
          <Typography sx={{ fontSize: 14, color: '#666', lineHeight: 1.7 }}>
            처음이시라면 <b>아래 순서대로</b> 따라 하시면 쇼핑몰을 열 수 있습니다. 앞 단계가 뒤 단계의 준비가 되니 순서를 지켜주세요.
          </Typography>
          {frameGroup && (
            <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: '#f5f7fa', border: '1px solid #e3e8ef' }}>
              <Typography sx={{ fontSize: 13, color: '#455' }}>
                이 몰은 <b>{FRAME_GROUP_LABEL[frameGroup]}</b> 계열입니다. 아래 안내는 이 계열에 해당하는 내용만 보여드립니다 —
                다른 계열에만 있는 메뉴는 관리자 화면에도 나타나지 않습니다.
              </Typography>
            </Box>
          )}
        </Stack>

        <GuideBody showRouteButtons brandId={brandId} frameGroup={frameGroup} />
      </Container>
    </>
  );
};

GuidePage.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default GuidePage;
