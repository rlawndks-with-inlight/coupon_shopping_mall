import { Icon } from '@iconify/react';
import { Button, Divider, FormControl, InputAdornment, InputLabel, OutlinedInput, Stack, Tab, Tabs, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import FindInfoQuestion from 'src/components/elements/shop/FindInfoQuestion';
import { TitleComponent } from 'src/components/elements/shop/demo-4';
import { Col, Title } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';
import { isShopgoBrand } from 'src/utils/is-shopgo';
import styled from 'styled-components'
import { useLocales } from 'src/locales';


const Wrappers = styled.div`
max-width:700px;
display:flex;
flex-direction:column;
margin: 1rem auto;
width: 90%;
min-height:90vh;
`

const returnFindType = {
  0: {
    title: "아이디 찾기",
    defaultObj: {

    }
  },
  1: {
    title: "비밀번호 찾기",
    defaultObj: {

    }
  }
}
const FindInfoDemo = (props) => {
  const { translate } = useLocales();
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeDnsData } = useSettingsContext();

  // 기본 탭은 '아이디 찾기'('0').
  // 예전 초기값은 undefined 였다. 본문이 `{findType == 0 && ...}` / `{findType == 1 && ...}` 뿐이라
  // ?type 없이 들어오면 둘 다 false → **탭만 뜨고 본문이 통째로 백지**였다.
  // Tab 의 value 는 Object.keys 결과(문자열)이므로 초기값도 문자열로 맞춘다.
  const [findType, setFindType] = useState('0');
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
    // ?type 이 없으면 기본 탭을 유지한다.
    setFindType(router.query?.type >= 0 ? String(router.query?.type) : '0');
  }, [router.query])

  const onSendPhoneVerifyCode = async () => {
    if (!findUserObj.phone_num) {
      return toast.error(translate('휴대폰 번호를 입력해주세요.'));
    }
    let result = await apiManager('auth/code', 'create', {
      phone_num: findUserObj.phone_num
    })
    if (result) {
      toast.success(translate('성공적으로 발송되었습니다.'));
      setFindUserObj({
        ...findUserObj,
        phoneToken: result?.phone_token,
        is_send_phone_check_num: true,
      })
    }
  }
  const onCheckPhoneVerifyCode = async () => {
    let obj = {
      phone_token: findUserObj.phoneToken,
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
      toast.success(translate('성공적으로 인증되었습니다.'));
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
      phone_token: findUserObj.phoneToken,
      new_password: findUserObj.password,
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
        <TitleComponent>{'아이디/비밀번호 찾기'}</TitleComponent>
        <Title style={{ width: '100%', marginTop: '2rem' }}>
          <Tabs
            value={findType}
            onChange={(event, newValue) => router.push(`/shop/auth/find-info?type=${newValue}`)}
            sx={{ width: '100%', marginTop: '0' }}

          >
            {Object.keys(returnFindType).map((key) => (
              <Tab key={returnFindType[key].title} value={key} label={translate(returnFindType[key].title)} style={{ width: '50%', margin: '0' }} />
            ))}
          </Tabs>
        </Title>
        {isShopgoBrand(themeDnsData) ? (
          <FindInfoQuestion tab={findType} router={router} loginPath="/shop/auth/login" />
        ) : (
        <Stack spacing={2}>
          {findType == 0 &&
            <>
              {findUserObj?.find_user_list?.length > 0 ?
                <>
                  <Title style={{ marginTop: '0' }}>{translate('찾은 유저아이디')}</Title>
                  <Col>
                    {findUserObj?.find_user_list && findUserObj?.find_user_list.map(item => (
                      <>
                        <div style={{ padding: '0.5rem' }}>{item?.user_name}</div>
                        <Divider />
                      </>
                    ))}

                  </Col>
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
                        style={{ width: '150px', height: '48px', marginRight: '-0.5rem' }}
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
                        style={{ width: '150px', height: '48px', marginRight: '-0.5rem' }}
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
                        style={{ width: '150px', height: '48px', marginRight: '-0.5rem' }}
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
                        style={{ width: '150px', height: '48px', marginRight: '-0.5rem' }}
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
      </Wrappers>
    </>
  )
}
export default FindInfoDemo
