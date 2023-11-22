import { Avatar, Box, Button, Card, FormControl, Grid, InputLabel, OutlinedInput, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AuthMenuSideComponent, ContentWrappers, TitleComponent } from "src/components/elements/shop/demo-4";
import { Col, Row, RowMobileColumn, RowMobileReverceColumn, Title } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiManager, uploadFileByManager } from "src/utils/api";
import styled from "styled-components";
import $ from 'jquery';

const Wrappers = styled.div`
max-width:1600px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-top: 2rem;
`

const returnChangeType = {
  0: {
    title: '회원정보변경',
    defaultObj: {

    }
  },
  1: {
    title: '비밀번호변경',
    defaultObj: {

    }
  }
}
const ChangeInfoDemo = (props) => {

  const { user } = useAuthContext();
  const { themeDnsData } = useSettingsContext();
  const router = useRouter();
  const [userObj, setUserObj] = useState({})
  const [changeType, setChangeType] = useState(undefined);

  useEffect(() => {
    if (user) {

    } else {
      router.push(`/shop/auth/login`);
    }
    setUserObj({
      ...user,
      is_send_phone_check_num: false,
    });
    if (router.query?.type >= 0) {
      setChangeType(router.query?.type ?? 0)
    } else {
      router.push(`/shop/auth/change-info?type=0`)
    }
  }, [router.query])

  const onChangePassword = async () => {
    if (!userObj?.password) {
      return toast.error('현재비밀번호를 입력해주세요.');
    }
    if (!userObj?.new_password) {
      return toast.error('새비밀번호를 입력해주세요.');
    }
    if (userObj.new_password != userObj.new_password_check) {
      return toast.error('비밀번호가 일치하지 않습니다.');
    }
    let result = await apiManager('auth/change-password', 'update', {
      password: userObj.password,
      new_password: userObj.new_password,
    })
    if (result) {
      toast.success('성공적으로 비밀번호가 변경되었습니다.');
      window.location.href = (`/shop/auth/my-page`);
    }
  }
  const onChangeUserInfo = async () => {
    if (user?.phone_num != userObj?.phone_num) {
      if (!userObj?.is_send_phone_check_num) {
        return toast.error('휴대폰인증을 완료해 주세요.');
      }
    }
    let profile_img = userObj?.profile_img;
    if (userObj?.profile_file) {
      const profile_result = await uploadFileByManager({
        file: userObj?.profile_file
      });
      console.log(profile_result);
      profile_img = profile_result?.url;
    }
    let result = await apiManager('auth/change-info', 'update', {
      nickname: userObj?.nickname,
      phone_num: userObj?.phone_num,
      phone_token: userObj?.phone_token,
      profile_img: profile_img,
    })
    if (result) {
      toast.success('성공적으로 변경되었습니다.');
      window.location.href = `/shop/auth/login`;
    }
  }
  const onSendPhoneVerifyCode = async () => {
    if (!userObj.phone_num) {
      return toast.error('휴대폰 번호를 입력해주세요.');
    }
    let result = await apiManager('auth/code', 'create', {
      phone_num: userObj.phone_num
    })
    if (result) {
      toast.success('성공적으로 발송되었습니다.');
      setUserObj({
        ...userObj,
        phone_token: result?.phone_token,
        is_send_phone_check_num: true,
      })
    }
  }
  const onCheckPhoneVerifyCode = async () => {
    let obj = {
      phone_token: userObj.phone_token,
      rand_num: userObj.phone_check,
    }
    let result = await apiManager('auth/code/check', 'create', obj);
    if (result) {
      toast.success('성공적으로 인증되었습니다.');
      setUserObj({
        ...userObj,
        is_check_phone_num: true,
      })
    }
  }
  const addProfileImg = (e) => {
    let file = e.target.files[0]
    if (file) {
      if (!file?.type.includes('image')) {
        return toast.error('프로필사진은 이미지 형식만 가능합니다.');
      }
      if (file.size > 1024 * 1024 * 2) {
        return toast.error('이미지 용량은 2MB를 넘을 수 없습니다.');
      }
      setUserObj(
        {
          ...userObj,
          ['profile_file']: file,
        }
      );
      $('#profile-img').val("");
    }
  }
  return (
    <>
      <Wrappers>
        <RowMobileReverceColumn>
          <AuthMenuSideComponent />
          <ContentWrappers>
            <TitleComponent>{'회원정보변경'}</TitleComponent>
            <Tabs
              value={changeType ?? 0}
              onChange={(event, newValue) => router.push(`/shop/auth/change-info?type=${newValue}`)}
              sx={{ margin: '1rem auto', width: '100%', maxWidth: '720px' }}
            >
              {Object.keys(returnChangeType).map((key) => (
                <Tab key={returnChangeType[key].title} value={key} label={returnChangeType[key].title} sx={{ width: '50%', margin: '0 !important' }} />
              ))}
            </Tabs>
            <Grid container spacing={3}>
              {changeType == 0 &&
                <>
                  <Grid item xs={12} md={4} style={{ margin: '0 auto 1rem auto' }}>
                    <Card sx={{ py: 10, px: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                      <label for='profile-img' style={{ cursor: 'pointer' }}>
                        <Avatar
                          src={userObj.profile_file ? URL.createObjectURL(userObj.profile_file) : userObj.profile_img}
                          sx={{
                            width: '84px',
                            height: '84px',
                            marginBottom: '1rem'
                          }}
                        />
                      </label>
                      <input type="file" style={{ display: 'none' }} id='profile-img' onChange={addProfileImg} />

                      <Typography variant='subtitle1'>{userObj.nickname}</Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={8} style={{ margin: '0 auto 1rem auto' }}>
                    <Card sx={{ p: 3, }}>
                      <Stack spacing={3}>
                        <TextField name="user_name" label="아이디" defaultValue={userObj?.user_name} value={userObj?.user_name} disabled={true} />
                        <TextField name="name" label="이름" defaultValue={userObj?.name} value={userObj?.name} disabled={true} />
                        <TextField name="nickname" label="닉네임" defaultValue={userObj?.nickname} value={userObj?.nickname} onChange={(e) => {
                          setUserObj({
                            ...userObj,
                            ['nickname']: e.target.value
                          })
                        }} />
                        <FormControl variant="outlined" >
                          <InputLabel>휴대폰번호</InputLabel>
                          <OutlinedInput
                            label='휴대폰번호'
                            value={userObj.phone_num}
                            defaultValue={userObj.phone_num}
                            disabled={userObj.is_check_phone_num}
                            endAdornment={<Button
                              variant='outlined'
                              style={{ width: '160px', height: '48px', marginRight: '-0.5rem' }}
                              size="small"
                              disabled={userObj.is_check_phone_num}
                              onClick={onSendPhoneVerifyCode}
                            >인증번호 발송</Button>}
                            onChange={(e) => {
                              setUserObj({
                                ...userObj,
                                ['phone_num']: e.target.value
                              })
                            }} />
                        </FormControl>
                        <FormControl variant="outlined">
                          <InputLabel>인증번호</InputLabel>
                          <OutlinedInput
                            label='인증번호'
                            defaultValue={userObj.phone_check}
                            value={userObj.phone_check}
                            disabled={userObj.is_check_phone_num}
                            endAdornment={<Button
                              variant='outlined'
                              style={{ width: '160px', height: '48px', marginRight: '-0.5rem' }}
                              size="small"
                              disabled={!userObj.is_send_phone_check_num || userObj.is_check_phone_num}
                              onClick={onCheckPhoneVerifyCode}
                            >{userObj.is_check_phone_num ? '확인완료' : '인증번호 확인'}</Button>}
                            onChange={(e) => {
                              setUserObj({
                                ...userObj,
                                ['phone_check']: e.target.value
                              })
                            }} />
                        </FormControl>
                      </Stack>
                      <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
                        <Button variant="contained" onClick={onChangeUserInfo}>
                          변경사항 저장
                        </Button>
                      </Stack>
                    </Card>
                  </Grid>
                </>}
              {changeType == 1 &&
                <>
                  <Grid item xs={12} md={8} style={{ margin: '0 auto 1rem auto' }}>
                    <Card sx={{ p: 3 }}>
                      <Stack spacing={3}>
                        <TextField name="displayName" label="현재비밀번호" type="password" defaultValue={userObj?.password} value={userObj?.password} onChange={(e) => {
                          setUserObj({
                            ...userObj,
                            ['password']: e.target.value
                          })
                        }} />
                        <TextField name="new_password" label="새비밀번호" type="password" defaultValue={userObj?.new_password} value={userObj?.new_password} onChange={(e) => {
                          setUserObj({
                            ...userObj,
                            ['new_password']: e.target.value
                          })
                        }} />
                        <TextField name="new_password_check" label="새비밀번호확인" type="password" defaultValue={userObj?.new_password_check} value={userObj?.new_password_check} onChange={(e) => {
                          setUserObj({
                            ...userObj,
                            ['new_password_check']: e.target.value
                          })
                        }} />
                      </Stack>
                      <Stack spacing={3} alignItems="flex-end" sx={{ mt: 3 }}>
                        <Button variant="contained" onClick={onChangePassword}>
                          변경사항 저장
                        </Button>
                      </Stack>
                    </Card>
                  </Grid>
                </>}
            </Grid>
          </ContentWrappers>
        </RowMobileReverceColumn>
      </Wrappers>
    </>
  )
}
export default ChangeInfoDemo