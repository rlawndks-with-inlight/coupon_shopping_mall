import { Icon } from '@iconify/react';
import { Button, FormControl, InputLabel, OutlinedInput, Stack, Tab, Tabs } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import FindInfoQuestion from 'src/components/elements/shop/FindInfoQuestion';
import { themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { useLocales } from 'src/locales';
import { apiManager } from 'src/utils/api';
import { isShopgoMerchant } from 'src/utils/is-shopgo';
import styled from 'styled-components'


const Wrappers = styled.div`
display:flex;
flex-direction:column;
margin: 2rem auto 4rem auto;
width: 90%;
max-width: 480px;
min-height:70vh;
`
const HeadLine = styled.div`
text-transform:uppercase;
letter-spacing:2px;
font-weight:bold;
text-align:center;
font-size:${themeObj.font_size.size3};
margin: 1rem 0 0.75rem 0;
`
const AccentBar = styled.div`
width:40px;
height:3px;
border-radius:2px;
margin: 0 auto 1.75rem auto;
`
const Card = styled.div`
border:1px solid ${themeObj.grey[300]};
border-radius:8px;
padding: 2rem 1.5rem;
`
const FoundLabel = styled.div`
text-transform:uppercase;
letter-spacing:1px;
font-weight:bold;
font-size:${themeObj.font_size.size8};
color:${themeObj.grey[600]};
margin-bottom: 0.75rem;
`
const FoundBox = styled.div`
border:1px solid ${themeObj.grey[300]};
border-radius:6px;
overflow:hidden;
`
const FoundItem = styled.div`
padding: 0.85rem 1rem;
font-size:${themeObj.font_size.size7};
border-bottom:1px solid ${themeObj.grey[200]};
&:last-child{
  border-bottom:none;
}
`
const adornBtnStyle = { width: '130px', height: '48px', marginRight: '-0.5rem', textTransform: 'none' }


const FindInfoDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const theme = useTheme();
  const { translate } = useLocales();
  const { themeDnsData } = useSettingsContext();
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
  return (
    <>
      <Wrappers>
        <HeadLine>{translate('정보 찾기')}</HeadLine>
        <AccentBar style={{ background: theme.palette.primary.main }} />
        <Tabs
          value={findType}
          onChange={(event, newValue) => router.push(`/shop/auth/find-info?type=${newValue}`)}
          variant="fullWidth"
          sx={{
            marginBottom: '1.5rem',
            '& .MuiTab-root': {
              textTransform: 'uppercase',
              fontWeight: 'bold',
              letterSpacing: '1px',
              fontSize: themeObj.font_size.size8,
            },
          }}
        >
          {Object.keys(returnFindType).map((key) => (
            <Tab key={returnFindType[key].title} value={key} label={returnFindType[key].title} />
          ))}
        </Tabs>
        <Card>
          {isShopgoMerchant(themeDnsData) ? (
            <FindInfoQuestion tab={findType} router={router} loginPath="/shop/auth/login" translate={translate} />
          ) : (
          <Stack spacing={2}>
            {findType == 0 &&
              <>
                {findUserObj?.find_user_list?.length > 0 ?
                  <>
                    <FoundLabel>{translate('찾은 유저아이디')}</FoundLabel>
                    <FoundBox>
                      {findUserObj?.find_user_list && findUserObj?.find_user_list.map(item => (
                        <FoundItem key={item?.user_name}>{item?.user_name}</FoundItem>
                      ))}
                    </FoundBox>
                    <Button
                      variant='contained'
                      style={{ height: '48px' }}
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
                          style={adornBtnStyle}
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
                          style={adornBtnStyle}
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
                      style={{ height: '48px' }}
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
                          style={adornBtnStyle}
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
                          style={adornBtnStyle}
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
        </Card>
      </Wrappers>
    </>
  )
}
export default FindInfoDemo
