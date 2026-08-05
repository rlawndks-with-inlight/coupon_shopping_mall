import { Icon } from '@iconify/react';
import { Button, Divider, FormControl, InputLabel, OutlinedInput, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import FindInfoQuestion from 'src/components/elements/shop/FindInfoQuestion';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { apiManager } from 'src/utils/api';
import { isShopgoBrand } from 'src/utils/is-shopgo';
import styled from 'styled-components'


const Wrapper = styled.div`
display:flex;
flex-direction:column;
min-height:76vh;
`
const ContentWrapper = styled.div`
max-width:560px;
width:90%;
margin: 3rem auto 4rem auto;
`
const ResultCard = styled.div`
border:1px solid #eee;
border-radius:12px;
padding:0.5rem 1.25rem;
`


const FindInfoDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
  const mainColor = themeDnsData?.theme_css?.main_color;
  const returnFindType = {
    0: {
      title: translate('아이디 찾기'),
      defaultObj: {

      }
    },
    1: {
      title: translate('비밀번호 찾기'),
      defaultObj: {

      }
    }
  }
  const [findType, setFindType] = useState(undefined);
  const [phoneNum, setPhoneNum] = useState("");
  const [findUserObj, setFindUserObj] = useState({})

  useEffect(() => {
    setFindUserObj({
      user_name: '',
      phone_num: '',
      phoneCheck: '',
      is_send_phone_check_num: false,
      find_user_list: [],
      phoneToken: '',
      password: '',
      passwordCheck: ''
    })
    if (router.query?.type >= 0) {
      setFindType(router.query?.type)
    }
  }, [router.query])

  const onSendPhoneVerifyCode = async () => {
    if (!findUserObj.phone_num) {
      return toast.error(translate('휴대폰 번호를 입력해주세요.'));
    }
    let result = await apiManager('auth/code', 'create', {
      phone_num: findUserObj.phone_num
    })
    if (result) {
      toast.success(translate('성공적으로 발송 되었습니다.'));
      setFindUserObj({
        ...findUserObj,
        phoneToken: result?.token,
        is_send_phone_check_num: true,
      })
    }
  }
  const onCheckPhoneVerifyCode = async () => {
    let obj = {
      token: findUserObj.phoneToken,
      rand_num: findUserObj.phoneCheck,
    }
    if (findType == 0) {
      obj['find_user_name'] = 1;
    } else if (findType == 1) {
      if (!findUserObj?.user_name) {
        return toast.error(translate('유저아이디를 입력해주세요.'));
      }
      obj['find_password'] = 1;
      obj['user_name'] = findUserObj?.user_name
    }
    let result = await apiManager('auth/code/check', 'create', obj);
    if (result) {
      toast.success(translate('성공적으로 인증 되었습니다.'));
      if (result?.users.length > 0) {
        setFindUserObj({
          ...findUserObj,
          find_user_list: result?.users,
        })
      } else {
        toast.error(translate('유저를 찾을 수 없습니다.'));
      }

    }
  }
  const onChangePassword = async () => {
    if (!findUserObj.password) {
      return toast.error(translate('비밀번호를 입력해주세요.'));
    }
    if (findUserObj.password != findUserObj.passwordCheck) {
      return toast.error(translate('비밀번호가 일치하지 않습니다.'));
    }
    let result = await apiManager('auth/change-password', 'update', {
      token: findUserObj.phoneToken,
      password: findUserObj.password,
      phone_num: findUserObj.phone_num,
      user_name: findUserObj.user_name,
    })
    if (result) {
      toast.success(translate('성공적으로 비밀번호가 변경되었습니다.'));
      router.push(`/shop/auth/login`)
    }
  }

  const verifyButtonSx = {
    width: '132px',
    height: '48px',
    marginRight: '-0.5rem',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  }
  const primaryButtonSx = {
    height: '52px',
    fontWeight: 600,
    ...(mainColor ? {
      backgroundColor: mainColor,
      '&:hover': { backgroundColor: mainColor, filter: 'brightness(0.92)' },
    } : {}),
  }

  return (
    <>
      <Wrapper>
        <ContentWrapper>
          <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', mb: 0.5 }}>
            {translate('계정 정보 찾기')}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mb: 3 }}>
            {translate('휴대폰 인증으로 아이디와 비밀번호를 찾을 수 있습니다.')}
          </Typography>
          <Tabs
            value={findType}
            onChange={(event, newValue) => router.push(`/shop/auth/find-info?type=${newValue}`)}
            variant="fullWidth"
            sx={{
              mb: 4,
              borderBottom: '1px solid #eee',
              ...(mainColor ? {
                '& .MuiTabs-indicator': { backgroundColor: mainColor },
                '& .Mui-selected': { color: `${mainColor} !important` },
              } : {}),
            }}
          >
            {Object.keys(returnFindType).map((key) => (
              <Tab key={returnFindType[key].title} value={key} label={returnFindType[key].title} sx={{ fontWeight: 600 }} />
            ))}
          </Tabs>
          {isShopgoBrand(themeDnsData) ? (
            <FindInfoQuestion tab={findType} router={router} loginPath="/shop/auth/login" translate={translate} slotProps={{ button: primaryButtonSx }} />
          ) : (
          <Stack spacing={2.5}>
            {findType == 0 &&
              <>
                {findUserObj?.find_user_list?.length > 0 ?
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {translate('찾은 유저아이디')}
                    </Typography>
                    <ResultCard>
                      {findUserObj?.find_user_list && findUserObj?.find_user_list.map((item, idx) => (
                        <div key={idx}>
                          <div style={{ padding: '0.75rem 0.25rem', fontWeight: 500 }}>{item?.user_name}</div>
                          {idx < findUserObj.find_user_list.length - 1 && <Divider />}
                        </div>
                      ))}
                    </ResultCard>
                    <Button
                      variant='contained'
                      color='inherit'
                      sx={primaryButtonSx}
                      startIcon={<Icon icon='material-symbols:lock' style={{ marginBottom: '0.2rem' }} />}
                      onClick={() => {
                        router.push(`/shop/auth/login`)
                      }}
                    >{translate('로그인하기')}</Button>
                  </>
                  :
                  <>
                    <FormControl variant="outlined" >
                      <InputLabel>{translate('휴대폰번호')}</InputLabel>
                      <OutlinedInput
                        label={translate('휴대폰번호')}
                        type="number"
                        autoComplete='new-password'
                        value={findUserObj.phone_num}
                        endAdornment={<Button
                          variant='outlined'
                          color='inherit'
                          sx={verifyButtonSx}
                          onClick={onSendPhoneVerifyCode}
                        >{translate('인증번호 발송')}</Button>}
                        onChange={(e) => {
                          setFindUserObj({ ...findUserObj, ['phone_num']: e.target.value })
                        }} />
                    </FormControl>
                    <FormControl variant="outlined" >
                      <InputLabel>{translate('인증번호')}</InputLabel>
                      <OutlinedInput
                        label={translate('인증번호')}
                        type="number"
                        autoComplete='new-password'
                        value={findUserObj.phoneCheck}
                        endAdornment={<Button
                          variant='outlined'
                          color='inherit'
                          sx={verifyButtonSx}
                          disabled={!findUserObj.is_send_phone_check_num}
                          onClick={onCheckPhoneVerifyCode}
                        >{findUserObj.find_user_list.length > 0 ? translate('확인완료') : translate('인증번호 확인')}</Button>}
                        onChange={(e) => {
                          setFindUserObj({ ...findUserObj, ['phoneCheck']: e.target.value })
                        }} />
                    </FormControl>
                  </>}
              </>}
            {findType == 1 &&
              <>
                {findUserObj.find_user_list?.length > 0 ?
                  <>
                    <FormControl variant="outlined" >
                      <InputLabel>{translate('새비밀번호')}</InputLabel>
                      <OutlinedInput
                        label={translate('새비밀번호')}
                        autoComplete='new-password'
                        type='password'
                        value={findUserObj.password}
                        onChange={(e) => {
                          setFindUserObj({ ...findUserObj, ['password']: e.target.value })
                        }} />
                    </FormControl>
                    <FormControl variant="outlined" >
                      <InputLabel>{translate('새비밀번호확인')}</InputLabel>
                      <OutlinedInput
                        label={translate('새비밀번호확인')}
                        autoComplete='new-password'
                        type='password'
                        value={findUserObj.passwordCheck}
                        onChange={(e) => {
                          setFindUserObj({ ...findUserObj, ['passwordCheck']: e.target.value })
                        }} />
                    </FormControl>
                    <Button
                      variant='contained'
                      color='inherit'
                      sx={primaryButtonSx}
                      startIcon={<Icon icon='material-symbols:lock' style={{ marginBottom: '0.2rem' }} />}
                      onClick={onChangePassword}
                    >{translate('비밀번호 변경하기')}</Button>
                  </>
                  :
                  <>
                    <FormControl variant="outlined" >
                      <InputLabel>{translate('유저아이디')}</InputLabel>
                      <OutlinedInput
                        label={translate('유저아이디')}
                        autoComplete='new-password'
                        value={findUserObj.user_name}
                        onChange={(e) => {
                          setFindUserObj({ ...findUserObj, ['user_name']: e.target.value })
                        }} />
                    </FormControl>
                    <FormControl variant="outlined" >
                      <InputLabel>{translate('휴대폰번호')}</InputLabel>
                      <OutlinedInput
                        label={translate('휴대폰번호')}
                        type="number"
                        autoComplete='new-password'
                        value={findUserObj.phone_num}
                        endAdornment={<Button
                          variant='outlined'
                          color='inherit'
                          sx={verifyButtonSx}
                          onClick={onSendPhoneVerifyCode}
                        >{translate('인증번호 발송')}</Button>}
                        onChange={(e) => {
                          setFindUserObj({ ...findUserObj, ['phone_num']: e.target.value })
                        }} />
                    </FormControl>
                    <FormControl variant="outlined" >
                      <InputLabel>{translate('인증번호')}</InputLabel>
                      <OutlinedInput
                        label={translate('인증번호')}
                        type="number"
                        autoComplete='new-password'
                        value={findUserObj.phoneCheck}
                        endAdornment={<Button
                          variant='outlined'
                          color='inherit'
                          sx={verifyButtonSx}
                          disabled={!findUserObj.is_send_phone_check_num}
                          onClick={onCheckPhoneVerifyCode}
                        >{findUserObj.find_user_list.length > 0 ? translate('확인완료') : translate('인증번호 확인')}</Button>}
                        onChange={(e) => {
                          setFindUserObj({ ...findUserObj, ['phoneCheck']: e.target.value })
                        }} />
                    </FormControl>
                  </>}
              </>}
          </Stack>
          )}
        </ContentWrapper>
      </Wrapper>
    </>
  )
}
export default FindInfoDemo
