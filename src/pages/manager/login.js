// @mui
import { Stack, TextField, InputAdornment, IconButton, Card, CardContent } from '@mui/material';
// auth
// layouts
import LoginLayout from '../../layouts/login';
// routes
//
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
// next
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
// @mui
import { LoadingButton } from '@mui/lab';
// routes
// auth
// components
import Iconify from '../../components/iconify';
import $ from 'jquery';
import { useRouter } from 'next/router';

export default function Login() {
  const { login } = useAuthContext();

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 100)
  }, [])
  const LoginSchema = Yup.object().shape({
    email: Yup.string().required('Email is required').email('Email must be a valid email address'),
    password: Yup.string().required('Password is required'),
  });

  const defaultValues = {
    email: 'demo@minimals.cc',
    password: 'demo1234',
  };

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });

  const {
    reset,
    setError,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = methods;

  const onSubmit = async () => {
      let user = await login(username, password);
      if(user){
        router.push('/manager/one')
      }
  };

  return (
    <LoginLayout>
      {!loading &&
        <>
          <Card>
            <CardContent>
              <img src={'https://backend.comagain.kr/storage/images/logos/IFFUcyTPtgF887r0RPOGXZyLLPvp016Je17MENFT.svg'} style={{ maxWidth: '200px', margin: '1rem auto' }} />
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
                loading={isSubmitSuccessful || isSubmitting}
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
            </CardContent>
          </Card>
        </>}

    </LoginLayout>
  );
}
