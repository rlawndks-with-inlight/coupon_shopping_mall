import { useRouter } from "next/router";
import ShopLayout from "src/layouts/shop/ShopLayout";
import { useSettingsContext } from "src/components/settings";
import { Button, Card, Stack, Typography } from "@mui/material";
import { Icon } from "@iconify/react";
import Logo from "src/components/logo";

const SmsPaySuccess = () => {
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();
  const mainColor = themeDnsData?.theme_css?.main_color;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', width: '90%', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4vh 0' }}>
      <Card sx={{ width: '100%', padding: '3rem 2rem' }}>
        <Stack spacing={3} alignItems="center">
          <Logo />
          <Icon
            icon="mdi:check-circle-outline"
            style={{ fontSize: '6rem', color: mainColor || '#4caf50' }}
          />
          <Typography variant="h4" textAlign="center">
            결제 신청이 완료되었습니다
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary">
            입력하신 핸드폰번호로 결제 안내가 전송될 예정입니다.
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{ minWidth: '180px' }}
            onClick={() => { router.push('/'); }}
          >
            홈으로 이동
          </Button>
        </Stack>
      </Card>
    </div>
  );
};

SmsPaySuccess.getLayout = (page) => <ShopLayout>{page}</ShopLayout>;
export default SmsPaySuccess;
