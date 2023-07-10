import { m } from 'framer-motion';
// next
import Head from 'next/head';
import NextLink from 'next/link';
// @mui
import { Button, Typography } from '@mui/material';
// layouts
// components
import { MotionContainer, varBounce } from '../components/animate';
// assets
import { PageNotFoundIllustration } from '../assets/illustrations';
import LoginLayout from 'src/layouts/login/LoginLayout';
import { useRouter } from 'next/router';

const Page404 = () => {
  const router = useRouter();
  return (
    <>
      <Head>
        <title> 404 Page Not Found | Minimal UI</title>
      </Head>

      <MotionContainer sx={{ display: 'flex', flexDirection: 'column' }}>
        <m.div variants={varBounce().in}>
          <Typography variant="h3" paragraph>
            페이지를 찾을 수 없습니다.
          </Typography>
        </m.div>
        <m.div variants={varBounce().in}>
          <PageNotFoundIllustration
            sx={{
              height: 260,
              my: { xs: 5, sm: 10 },
            }}
          />
        </m.div>

        <Button size="large" variant="contained" sx={{ margin: 'auto' }} onClick={()=>router.back()}>
          이전 페이지로
        </Button>
      </MotionContainer>
    </>
  );
}
Page404.getLayout = (page) => <LoginLayout>{page}</LoginLayout>;

export default Page404
