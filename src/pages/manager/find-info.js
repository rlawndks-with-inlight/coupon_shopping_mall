import { Icon } from '@iconify/react';
import { Button, Divider, FormControl, InputLabel, OutlinedInput, Stack, Tab, Tabs, Link, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import LoginLayout from '../../layouts/login';
import { StyledContent } from 'src/layouts/login/styles';
import { apiManager } from 'src/utils/api';
import { logoSrc } from 'src/data/data';
import { Col } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { isShopgoBrand } from 'src/utils/is-shopgo';
import FindInfoQuestion from 'src/components/elements/shop/FindInfoQuestion';
import { PasswordOutlinedInput } from 'src/components/elements/PasswordField';

// 가맹점(매니저) 관리자용 아이디/비밀번호 찾기.
// 백엔드(SMS 휴대폰 인증) 및 스토어프론트 UI는 이미 존재하며, 여기서는 동일한 3개 엔드포인트를 재사용한다.
//   POST /api/auth/code          (인증번호 발송)
//   POST /api/auth/code/check    (find_user_name=아이디찾기 / find_password=비번찾기)
//   PUT  /api/auth/change-password (비밀번호 재설정)
// * 휴대폰 발송은 브랜드 DNS의 bonaeja_obj(문자 게이트웨이) 설정이 있어야 동작한다.
const returnFindType = {
  0: { title: '아이디 찾기' },
  1: { title: '비밀번호 찾기' },
};

const FindInfo = () => {
  const router = useRouter();
  const { themeDnsData } = useSettingsContext();
  const [findType, setFindType] = useState('0');
  const [findUserObj, setFindUserObj] = useState({
    user_name: '',
    phone_num: '',
    phoneCheck: '',
    is_send_phone_check_num: false,
    find_user_list: [],
    phoneToken: '',
    password: '',
    passwordCheck: '',
  });

  useEffect(() => {
    setFindUserObj({
      user_name: '',
      phone_num: '',
      phoneCheck: '',
      is_send_phone_check_num: false,
      find_user_list: [],
      phoneToken: '',
      password: '',
      passwordCheck: '',
    });
    if (router.query?.type == 0 || router.query?.type == 1) {
      setFindType(String(router.query?.type));
    }
  }, [router.query]);

  const onSendPhoneVerifyCode = async () => {
    if (!findUserObj.phone_num) {
      return toast.error('휴대폰 번호를 입력해주세요.');
    }
    let result = await apiManager('auth/code', 'create', {
      phone_num: findUserObj.phone_num,
    });
    if (result) {
      toast.success('성공적으로 발송 되었습니다.');
      setFindUserObj({
        ...findUserObj,
        phoneToken: result?.token,
        is_send_phone_check_num: true,
      });
    }
  };

  const onCheckPhoneVerifyCode = async () => {
    let obj = {
      token: findUserObj.phoneToken,
      rand_num: findUserObj.phoneCheck,
    };
    if (findType == 0) {
      obj['find_user_name'] = 1;
    } else if (findType == 1) {
      if (!findUserObj?.user_name) {
        return toast.error('아이디를 입력해주세요.');
      }
      obj['find_password'] = 1;
      obj['user_name'] = findUserObj?.user_name;
    }
    let result = await apiManager('auth/code/check', 'create', obj);
    if (result) {
      if (result?.users?.length > 0) {
        toast.success('성공적으로 인증 되었습니다.');
        setFindUserObj({
          ...findUserObj,
          find_user_list: result?.users,
        });
      } else {
        toast.error('일치하는 회원 정보를 찾을 수 없습니다.');
      }
    }
  };

  const onChangePassword = async () => {
    if (!findUserObj.password) {
      return toast.error('비밀번호를 입력해주세요.');
    }
    if (findUserObj.password != findUserObj.passwordCheck) {
      return toast.error('비밀번호가 일치하지 않습니다.');
    }
    let result = await apiManager('auth/change-password', 'update', {
      token: findUserObj.phoneToken,
      password: findUserObj.password,
      phone_num: findUserObj.phone_num,
      user_name: findUserObj.user_name,
    });
    if (result) {
      toast.success('성공적으로 비밀번호가 변경되었습니다.');
      router.push(`/manager/login`);
    }
  };

  return (
    <>
      <StyledContent style={{ minHeight: '90vh' }}>
        <Stack sx={{ width: 1, maxWidth: 480, margin: '0 auto' }}>
          <img src={logoSrc()} alt="logo" style={{ maxWidth: '200px', margin: '1rem auto 2rem auto' }} />
          <Tabs
            value={findType}
            onChange={(event, newValue) => router.push(`/manager/find-info?type=${newValue}`)}
            sx={{ width: '100%', mb: 3 }}
            variant="fullWidth"
          >
            {Object.keys(returnFindType).map((key) => (
              <Tab key={returnFindType[key].title} value={key} label={returnFindType[key].title} />
            ))}
          </Tabs>

          {isShopgoBrand(themeDnsData) ? (
            <FindInfoQuestion tab={findType} router={router} loginPath="/manager/login" isManager />
          ) : (
            <Stack spacing={2}>
              {findType == 0 && (
                <>
                  {findUserObj?.find_user_list?.length > 0 ? (
                    <>
                      <Typography variant="subtitle1" sx={{ mt: 1 }}>
                        찾은 아이디
                      </Typography>
                      <Col>
                        {findUserObj?.find_user_list.map((item) => (
                          <>
                            <div style={{ padding: '0.5rem' }}>{item?.user_name}</div>
                            <Divider />
                          </>
                        ))}
                      </Col>
                      <Button
                        variant="contained"
                        style={{ height: '48px' }}
                        startIcon={<Icon icon="material-symbols:lock" style={{ marginBottom: '0.2rem' }} />}
                        onClick={() => router.push(`/manager/login`)}
                      >
                        로그인하기
                      </Button>
                    </>
                  ) : (
                    <>
                      <FormControl variant="outlined">
                        <InputLabel>휴대폰번호</InputLabel>
                        <OutlinedInput
                          label="휴대폰번호"
                          type="number"
                          autoComplete="new-password"
                          value={findUserObj.phone_num}
                          endAdornment={
                            <Button
                              variant="outlined"
                              style={{ width: '150px', height: '48px', marginRight: '-0.5rem' }}
                              onClick={onSendPhoneVerifyCode}
                            >
                              인증번호 발송
                            </Button>
                          }
                          onChange={(e) => {
                            setFindUserObj({ ...findUserObj, ['phone_num']: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormControl variant="outlined">
                        <InputLabel>인증번호</InputLabel>
                        <OutlinedInput
                          label="인증번호"
                          type="number"
                          autoComplete="new-password"
                          value={findUserObj.phoneCheck}
                          endAdornment={
                            <Button
                              variant="outlined"
                              style={{ width: '150px', height: '48px', marginRight: '-0.5rem' }}
                              disabled={!findUserObj.is_send_phone_check_num}
                              onClick={onCheckPhoneVerifyCode}
                            >
                              {findUserObj.find_user_list.length > 0 ? '확인완료' : '인증번호 확인'}
                            </Button>
                          }
                          onChange={(e) => {
                            setFindUserObj({ ...findUserObj, ['phoneCheck']: e.target.value });
                          }}
                        />
                      </FormControl>
                    </>
                  )}
                </>
              )}
              {findType == 1 && (
                <>
                  {findUserObj.find_user_list?.length > 0 ? (
                    <>
                      <FormControl variant="outlined">
                        <InputLabel>새 비밀번호</InputLabel>
                        <PasswordOutlinedInput
                          label="새 비밀번호"
                          autoComplete="new-password"

                          value={findUserObj.password}
                          onChange={(e) => {
                            setFindUserObj({ ...findUserObj, ['password']: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormControl variant="outlined">
                        <InputLabel>새 비밀번호 확인</InputLabel>
                        <PasswordOutlinedInput
                          label="새 비밀번호 확인"
                          autoComplete="new-password"

                          value={findUserObj.passwordCheck}
                          onChange={(e) => {
                            setFindUserObj({ ...findUserObj, ['passwordCheck']: e.target.value });
                          }}
                        />
                      </FormControl>
                      <Button
                        variant="contained"
                        style={{ height: '48px' }}
                        startIcon={<Icon icon="material-symbols:lock" style={{ marginBottom: '0.2rem' }} />}
                        onClick={onChangePassword}
                      >
                        비밀번호 변경하기
                      </Button>
                    </>
                  ) : (
                    <>
                      <FormControl variant="outlined">
                        <InputLabel>아이디</InputLabel>
                        <OutlinedInput
                          label="아이디"
                          autoComplete="new-password"
                          value={findUserObj.user_name}
                          onChange={(e) => {
                            setFindUserObj({ ...findUserObj, ['user_name']: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormControl variant="outlined">
                        <InputLabel>휴대폰번호</InputLabel>
                        <OutlinedInput
                          label="휴대폰번호"
                          type="number"
                          autoComplete="new-password"
                          value={findUserObj.phone_num}
                          endAdornment={
                            <Button
                              variant="outlined"
                              style={{ width: '150px', height: '48px', marginRight: '-0.5rem' }}
                              onClick={onSendPhoneVerifyCode}
                            >
                              인증번호 발송
                            </Button>
                          }
                          onChange={(e) => {
                            setFindUserObj({ ...findUserObj, ['phone_num']: e.target.value });
                          }}
                        />
                      </FormControl>
                      <FormControl variant="outlined">
                        <InputLabel>인증번호</InputLabel>
                        <OutlinedInput
                          label="인증번호"
                          type="number"
                          autoComplete="new-password"
                          value={findUserObj.phoneCheck}
                          endAdornment={
                            <Button
                              variant="outlined"
                              style={{ width: '150px', height: '48px', marginRight: '-0.5rem' }}
                              disabled={!findUserObj.is_send_phone_check_num}
                              onClick={onCheckPhoneVerifyCode}
                            >
                              {findUserObj.find_user_list.length > 0 ? '확인완료' : '인증번호 확인'}
                            </Button>
                          }
                          onChange={(e) => {
                            setFindUserObj({ ...findUserObj, ['phoneCheck']: e.target.value });
                          }}
                        />
                      </FormControl>
                    </>
                  )}
                </>
              )}
            </Stack>
          )}

          <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
            <Link component={NextLink} href="/manager/login" variant="body2" sx={{ color: 'text.secondary', cursor: 'pointer' }}>
              로그인으로 돌아가기
            </Link>
          </Stack>
        </Stack>
      </StyledContent>
    </>
  );
};

FindInfo.getLayout = (page) => <LoginLayout>{page}</LoginLayout>;
export default FindInfo;
