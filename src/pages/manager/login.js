import { Stack, TextField, InputAdornment, IconButton, Card, CardContent, Link, Typography, Button } from '@mui/material';
import LoginLayout from '../../layouts/login';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LoadingButton } from '@mui/lab';
import Iconify from '../../components/iconify';
import $ from 'jquery';
import { useRouter } from 'next/router';
import { logoSrc } from 'src/data/data';
import { useSettingsContext } from 'src/components/settings';
import NextLink from 'next/link';
import { StyledContent, StyledSection, StyledSectionBg } from 'src/layouts/login/styles';
import Image from 'src/components/image/Image';
import dynamic from 'next/dynamic';
import { Row } from 'src/components/elements/styled-components';
import { MotionContainer, varBounce } from 'src/components/animate';
import { m } from 'framer-motion';
import { PageNotFoundIllustration } from 'src/assets/illustrations';

const Tour = dynamic(
  () => import('reactour'),
  { ssr: false },
);
const Login = () => {
  const { login, user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    if (user?.level >= 10) {
      router.push(`/manager/dashboards`);
    }
    setLoading(false);
  }, [user])
  useEffect(() => {
    if (router.query?.is_first && !user) {
      openTour('is-first', "판매자 계정이 없으시면 클릭 후 가입해 주세요.\n5분 내에 가입이 완료됩니다 !")
    }
  }, [router.query?.is_first])

  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const onSubmit = async () => {
    let user = await login(username, password, true);
    if (user) {
      window.location.href = '/manager/dashboards';
    }
  };
  const [tourOpen, setTourOpen] = useState(false);
  const [tourSteps, setTourSteps] = useState([]);

  const openTour = (class_name, text,) => {
    setTourSteps([
      {
        selector: `.${class_name}`,
        content: text,
      },
    ])
    setTourOpen(true);
  }
  const closeTour = () => {
    setTourOpen(false);
    setTourSteps([]);
  };
  return (
    <>
      {
        themeDnsData?.seller_id > 0 ?
          <>
            <Row style={{ height: '90vh', width: '100%' }}>
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
          </>
          :
          <>
            <StyledSection>
              <Typography variant="h3" sx={{ mb: 10, maxWidth: 520, textAlign: 'center', whiteSpace: 'nowrap' }}>
                {themeDnsData?.name}<br />쇼핑몰에 오신것을 환영합니다!
              </Typography>
              <Image
                disabledEffect
                visibleByDefault
                alt="auth"
                src={'/assets/illustrations/illustration_dashboard.png'}
                sx={{ maxWidth: 720 }}
              />
              <StyledSectionBg />
            </StyledSection>
            <StyledContent style={{ minHeight: '90vh' }}>
              <Stack sx={{ width: 1 }}>

                <img src={logoSrc()} style={{ maxWidth: '200px', margin: '1rem auto' }} />
                <Stack spacing={3}>
                  <TextField
                    name="username"
                    label="아이디를 입력해 주세요."
                    autoComplete='new-password'
                    onChange={(e) => {
                      setUsername(e.target.value)
                    }}
                    onKeyPress={(e) => {
                      if (e.key == 'Enter') {
                        $('#id').focus();
                      }
                    }}
                  />
                  <TextField
                    name="password"
                    id="password"
                    label="패스워드를 입력해 주세요."
                    type={showPassword ? 'text' : 'password'}
                    autoComplete='new-password'
                    onKeyPress={(e) => {
                      if (e.key == 'Enter') {
                        onSubmit();
                      }
                    }}
                    onChange={(e) => {
                      setPassword(e.target.value)
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                            <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
                <LoadingButton
                  fullWidth
                  color="inherit"
                  size="large"
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: 'text.primary',
                    color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
                    '&:hover': {
                      bgcolor: 'text.primary',
                      color: (theme) => (theme.palette.mode === 'light' ? 'common.white' : 'grey.800'),
                    },
                    marginTop: '24px'
                  }}
                  onClick={onSubmit}
                >
                  로그인
                </LoadingButton>
                {window.location.host.split(':')[0] == process.env.MAIN_FRONT_URL &&
                  <>
                    <Stack alignItems="flex-end" sx={{ my: 2 }}>
                      <Link
                        component={NextLink}
                        href={'/manager/register'}
                        variant="body2"
                        color="inherit"
                        underline="always"
                        className='is-first'
                      >
                        컴어게인이 처음이신가요?
                      </Link>
                    </Stack>
                  </>}
              </Stack>
            </StyledContent>
            <Tour
              steps={tourSteps}
              isOpen={tourOpen}
              disableInteraction={false}
              onRequestClose={closeTour} />
          </>
      }
    </>
  );
}
Login.getLayout = (page) => <LoginLayout>{page}</LoginLayout>;
export default Login;
