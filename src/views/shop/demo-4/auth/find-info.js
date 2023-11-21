import { Icon } from '@iconify/react';
import { Button, Divider, FormControl, InputAdornment, InputLabel, OutlinedInput, Stack, Tab, Tabs, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { TitleComponent } from 'src/components/elements/shop/demo-4';
import { Col, Title } from 'src/components/elements/styled-components';
import { apiManager } from 'src/utils/api';
import styled from 'styled-components'


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
    title: '아이디 찾기',
    defaultObj: {

    }
  },
  1: {
    title: '비밀번호 찾기',
    defaultObj: {

    }
  }
}
const FindInfoDemo = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;

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
      return toast.error('휴대폰 번호를 입력해주세요.');
    }
    let result = await apiManager('auth/code', 'create', {
      phone_num: findUserObj.phone_num
    })
    if (result) {
      toast.success('성공적으로 발송되었습니다.');
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
        return toast.error('유저아이디를 입력해주세요.');
      }
      obj['find_password'] = 1;
      obj['user_name'] = findUserObj?.user_name
    }
    let result = await apiManager('auth/code/check', 'create', obj);
    if (result) {
      toast.success('성공적으로 인증되었습니다.');
      if (result?.users.length > 0) {
        setFindUserObj({
          ...findUserObj,
          find_user_list: result?.users,
        })
      } else {
        toast.error('유저를 찾을 수 없습니다.');
      }

    }
  }
  const onChangePassword = async () => {
    if (!findUserObj.password) {
      return toast.error('비밀번호를 입력해주세요.');
    }
    if (findUserObj.password != findUserObj.passwordCheck) {
      return toast.error('비밀번호가 일치하지 않습니다.');
    }
    let result = await apiManager('auth/change-password', 'create', {
      token: findUserObj.phoneToken,
      password: findUserObj.password,
      phone_num: findUserObj.phone_num,
      user_name: findUserObj.user_name,
    })
    if (result) {
      toast.success('성공적으로 비밀번호가 변경되었습니다.');
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
              <Tab key={returnFindType[key].title} value={key} label={returnFindType[key].title} style={{ width: '50%', margin: '0' }} />
            ))}
          </Tabs>
        </Title>
        <Stack spacing={2}>
          {findType == 0 &&
            <>
              {findUserObj?.find_user_list?.length > 0 ?
                <>
                  <Title style={{ marginTop: '0' }}>찾은 유저아이디</Title>
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
                  >로그인하기</Button>
                </>
                :
                <>
                  <FormControl variant="outlined" >
                    <InputLabel>휴대폰번호</InputLabel>
                    <OutlinedInput
                      label='휴대폰번호'
                      type="number"
                      autoComplete='new-password'
                      value={findUserObj.phone_num}
                      endAdornment={<Button
                        variant='outlined'
                        style={{ width: '150px', height: '48px', marginRight: '-0.5rem' }}
                        onClick={onSendPhoneVerifyCode}
                      >인증번호 발송</Button>}
                      onChange={(e) => {
                        setFindUserObj({ ...findUserObj, ['phone_num']: e.target.value })
                      }} />
                  </FormControl>
                  <FormControl variant="outlined" >
                    <InputLabel>인증번호</InputLabel>
                    <OutlinedInput
                      label='인증번호'
                      type="number"
                      autoComplete='new-password'
                      value={findUserObj.phoneCheck}
                      endAdornment={<Button
                        variant='outlined'
                        style={{ width: '150px', height: '48px', marginRight: '-0.5rem' }}
                        disabled={!findUserObj.is_send_phone_check_num}
                        onClick={onCheckPhoneVerifyCode}
                      >{findUserObj.find_user_list.length > 0 ? '확인완료' : '인증번호 확인'}</Button>}
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
                    <InputLabel>새비밀번호</InputLabel>
                    <OutlinedInput
                      label='새비밀번호'
                      autoComplete='new-password'
                      type='password'
                      value={findUserObj.password}
                      onChange={(e) => {
                        setFindUserObj({ ...findUserObj, ['password']: e.target.value })
                      }} />
                  </FormControl>
                  <FormControl variant="outlined" >
                    <InputLabel>새비밀번호확인</InputLabel>
                    <OutlinedInput
                      label='새비밀번호확인'
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
                  >비밀번호 변경하기</Button>
                </>
                :
                <>
                  <FormControl variant="outlined" >
                    <InputLabel>유저아이디</InputLabel>
                    <OutlinedInput
                      label='유저아이디'
                      autoComplete='new-password'
                      value={findUserObj.user_name}
                      onChange={(e) => {
                        setFindUserObj({ ...findUserObj, ['user_name']: e.target.value })
                      }} />
                  </FormControl>
                  <FormControl variant="outlined" >
                    <InputLabel>휴대폰번호</InputLabel>
                    <OutlinedInput
                      label='휴대폰번호'
                      type="number"
                      autoComplete='new-password'
                      value={findUserObj.phone_num}
                      endAdornment={<Button
                        variant='outlined'
                        style={{ width: '150px', height: '48px', marginRight: '-0.5rem' }}
                        onClick={onSendPhoneVerifyCode}
                      >인증번호 발송</Button>}
                      onChange={(e) => {
                        setFindUserObj({ ...findUserObj, ['phone_num']: e.target.value })
                      }} />
                  </FormControl>
                  <FormControl variant="outlined" >
                    <InputLabel>인증번호</InputLabel>
                    <OutlinedInput
                      label='인증번호'
                      type="number"
                      autoComplete='new-password'
                      value={findUserObj.phoneCheck}
                      endAdornment={<Button
                        variant='outlined'
                        style={{ width: '150px', height: '48px', marginRight: '-0.5rem' }}
                        disabled={!findUserObj.is_send_phone_check_num}
                        onClick={onCheckPhoneVerifyCode}
                      >{findUserObj.find_user_list.length > 0 ? '확인완료' : '인증번호 확인'}</Button>}
                      onChange={(e) => {
                        setFindUserObj({ ...findUserObj, ['phoneCheck']: e.target.value })
                      }} />
                  </FormControl>
                </>}
            </>}
        </Stack>
        {/* 미완 */}

      </Wrappers>
    </>
  )
}
const inputStyle = {
  marginTop: '1rem',
}
export default FindInfoDemo
