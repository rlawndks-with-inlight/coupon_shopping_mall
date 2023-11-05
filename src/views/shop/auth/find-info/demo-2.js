import { TextField, Tab, Tabs, Button, FormControl, InputLabel, OutlinedInput } from "@mui/material";
import { useEffect, useState } from "react";
import { Title } from 'src/components/elements/styled-components';
import { apiManager } from "src/utils/api";
import styled from "styled-components";

const Wrappers = styled.div`
max-width: 500px;
display: flex;
flex-direction: column;
margin: 0 auto;
width: 90%;
min-height: 90vh;
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

//아이디비번찾기 박이규
const Demo2 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;

  const [findType, setFindType] = useState(undefined);
  const [findUsernameObj, setFindUsernameObj] = useState({
    phone_num: '',
    phoneCheck: ''
  })
  const [findPasswordObj, setFindPasswordObj] = useState({
    username: '',
    phone_num: '',
    phoneCheck: ''
  })
  const [phoneCheckStep, setPhoneCheckStep] = useState(0);
  const onClickSendUsernamePhoneVerifyCode = async () => {
    setPhoneCheckStep(1);
    let result = await apiManager('auth/code', 'create',{
      phone_num: user.phone_num
    })

  }
  const onClickSendPasswordPhoneVerifyCode = async () => {
    setPhoneCheckStep(1);
    let result = await apiManager('auth/code', 'create',{
      phone_num: user.phone_num
    })

  }
  useEffect(() => {
    if (router.query?.type >= 0) {
      setFindType(router.query?.type)
    }
  }, [router.query])
  return (
    <>
      <Wrappers>
        <Title style={{ width: '100%' }}>
          <Tabs
            value={findType}
            onChange={(event, newValue) => router.push(`/shop/auth/find-info?type=${newValue}`)}
            sx={{ width: '100%' }}
          >
            {Object.keys(returnFindType).map((key) => (
              <Tab key={returnFindType[key].title} value={key} label={returnFindType[key].title} style={{ width: '50%', margin: '0' }} />
            ))}
          </Tabs>
        </Title>
        {findType == 0 &&
          <>
            <FormControl variant="outlined" style={{ width: '100%', marginTop: '1rem' }}>
              <InputLabel>휴대폰번호</InputLabel>
              <OutlinedInput
                label='휴대폰번호'
                placeholder="하이픈(-) 제외 입력"
                onChange={(e) => {
                  setFindUsernameObj({ ...findUsernameObj, ['phone_num']: e.target.value })
                }}
                value={findUsernameObj.phone_num}
                endAdornment={<>
                  <Button style={{ width: '124px', height: '56px', transform: 'translateX(14px)', }}
                    variant="contained"
                    onClick={() => {
                      if (phoneCheckStep == 0) {
                        onClickSendUsernamePhoneVerifyCode();
                      }
                    }}
                  >인증번호 발송</Button>
                </>}
              />
            </FormControl>

            <FormControl variant="outlined" style={{ width: '100%', marginTop: '1rem' }}>
              <InputLabel>인증번호</InputLabel>
              <OutlinedInput
                label='인증번호'
                onChange={(e) => {
                  setFindUsernameObj({ ...findUsernameObj, ['phone_num']: e.target.value })
                }}
                value={findUsernameObj.phone_num}
                endAdornment={<>
                  <Button style={{ width: '124px', height: '56px', transform: 'translateX(14px)' }}
                    variant="contained"
                    onClick={() => {
                    }}
                  >인증번호 확인</Button>
                </>}
              />
            </FormControl>

          </>}
        {findType == 1 &&
          <>
            <TextField
              label='아이디'
              onChange={(e) => {
                setFindPasswordObj({ ...findPasswordObj, ['username']: e.target.value })
              }}
              value={findPasswordObj.username}
              style={inputStyle}
              autoComplete='new-password'
              onKeyPress={(e) => {
                if (e.key == 'Enter') {
                }
              }}
            />
            <FormControl variant="outlined" style={{ width: '100%', marginTop: '1rem' }}>
              <InputLabel>휴대폰번호</InputLabel>
              <OutlinedInput
                label='휴대폰번호'
                placeholder="하이픈(-) 제외 입력"
                onChange={(e) => {
                  setFindPasswordObj({ ...findPasswordObj, ['phone_num']: e.target.value })
                }}
                value={findPasswordObj.phone_num}
                endAdornment={<>
                  <Button style={{ width: '124px', height: '56px', transform: 'translateX(14px)', }}
                    variant="contained"
                    onClick={() => {
                      if (phoneCheckStep == 0) {
                        onClickSendPasswordPhoneVerifyCode();
                      }
                    }}
                  >인증번호 발송</Button>
                </>}
              />
            </FormControl>

            <FormControl variant="outlined" style={{ width: '100%', marginTop: '1rem' }}>
              <InputLabel>인증번호</InputLabel>
              <OutlinedInput
                label='인증번호'
                onChange={(e) => {
                  setFindPasswordObj({ ...findPasswordObj, ['phone_num']: e.target.value })
                }}
                value={findPasswordObj.phone_num}
                endAdornment={<>
                  <Button style={{ width: '124px', height: '56px', transform: 'translateX(14px)' }}
                    variant="contained"
                    onClick={() => {
                    }}
                  >인증번호 확인</Button>
                </>}
              />
            </FormControl>
          </>}
      </Wrappers>
    </>
  )
}
const inputStyle = {
  marginTop: '1rem',
}
export default Demo2
