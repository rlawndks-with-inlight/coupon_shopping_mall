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
import { Row } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useEffect, useState } from 'react';

const Page404 = () => {
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (themeDnsData?.id) {
      setLoading(false);
    }
  }, [themeDnsData])
  return (
    <>
      <Head>
        <title> 404 Page </title>
      </Head>
      {!loading &&
        <>
          <Row style={{ height: '90vh' }}>
            <MotionContainer sx={{ display: 'flex', flexDirection: 'column', margin: 'auto' }}>
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

              <Button size="large" variant="contained" sx={{ margin: 'auto' }} onClick={() => router.back()}>
                이전 페이지로
              </Button>
            </MotionContainer>
          </Row>
        </>}
    </>
  );
}
export default Page404
