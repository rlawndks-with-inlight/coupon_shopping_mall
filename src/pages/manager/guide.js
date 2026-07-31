import Head from 'next/head';
import { Box, Container, Stack, Typography } from '@mui/material';
import ManagerLayout from 'src/layouts/manager/ManagerLayout';
import { useSettingsContext } from 'src/components/settings';
import GuideBody from 'src/components/manager/GuideBody';

const GuidePage = () => {
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

        <GuideBody showRouteButtons brandId={brandId} />
      </Container>
    </>
  );
};

GuidePage.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default GuidePage;
