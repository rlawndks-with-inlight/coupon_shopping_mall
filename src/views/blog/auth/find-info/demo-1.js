import { Tab, Tabs, TextField, Button } from '@mui/material';
import { useEffect, useState } from 'react';
import styled from 'styled-components'

//아이디 찾기 및 비밀번호 찾기 김인욱
const Wrappers = styled.div`
max-width:798px;
display:flex;
flex-direction:column;
margin: 56px auto 0 auto;
width: 90%;
@media (max-width:798px){
  width:100%;
}
`

const Title = styled.h2`
font-size:1.5rem;
font-weight:bold;
line-height:1.38462;
padding:1rem 0 0.5rem 0;
@media (max-width:798px){
    padding: 0 5% 0 5%;
}
`

const TabsContainer = styled.div`
width:100%;
display:flex;
flex-direction:column;
margin: 0 auto;
@media (max-width:798px){
  padding:5%;
}
`

const TextFieldBox = styled.div`
display:flex;
width:100%;
margin-top: 1.5rem;
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
const Demo1 = (props) => {
  const {
    data: {

    },
    func: {
      router
    },
  } = props;

  const [findType, setFindType] = useState(0);
  const [phoneNum, setPhoneNum] = useState("");
  const [username, setUsername] = useState("")
  const [userid, setUserid] = useState("")
  const [buttonText, setButtonText] = useState("인증받기")
  const [certificationNum, setCertificationNum] = useState("")
  const [findIdObj, setFindIdObj] = useState({
    name: '',
    nameCheck: '',
    phone_num: '',
    phoneCheck: ''
  })
  const [findPasswordObj, setFindPasswordObj] = useState({
    id: '',
    idCheck: '',
    phone_num: '',
    phoneCheck: ''
  })
  useEffect(() => {
    if (router.query?.type >= 0) {
      setFindType(router.query?.type)
    }
  }, [router.query])

  return (
    <>
      <Wrappers>
        <Title>아이디/비밀번호 찾기</Title>
        <TabsContainer>
          <div>
          <Tabs
            value={findType}
            onChange={(event, newValue) => router.push(`/blog/auth/find-info?type=${newValue}`)}
            sx={{ width: '100%' }}
          >
            {Object.keys(returnFindType).map((key) => (
              <Tab key={returnFindType[key].title} value={key} label={returnFindType[key].title} style={{ width: '50%', margin: '0' }} />
            ))}
          </Tabs>
          </div>
          {findType == 0 ?
            <>
              <TextField
                name='userId'
                autoComplete='new-password'
                label='이름'
                sx={{ marginTop: '1.5rem' }}
                onChange={(e) => {
                  setUserId(e.target.value)
                }}
              />
              <TextFieldBox>
                <TextField
                  name='phoneNum'
                  autoComplete='new-password'
                  label='연락처'
                  sx={{
                    width: '72%',
                    marginRight: '1%',
                  }}
                  onChange={(e) => {
                    setPhoneNum(e.target.value)
                  }}
                />
                <Button
                  variant='outlined'
                  color='primary'
                  style={{
                    width: '27%',
                    height: '56px'
                  }}
                  onClick={() => {
                    setButtonText("재전송")
                  }}
                >{buttonText}</Button>
              </TextFieldBox>
              <TextField
                name='certificationNum'
                autoComplete='new-password'
                label='인증번호 입력'
                sx={{
                  marginTop: '1%'
                }}
              />
              <Button
                variant='contained'
                color='primary'
                style={{
                  height: '56px',
                  marginTop: '10%',
                  fontSize: 'large'
                }}
              >인증완료</Button>
            </>
            :
            <>
              <TextField
                name='userName'
                autoComplete='new-password'
                label='아이디'
                sx={{ marginTop: '1.5rem' }}
                onChange={(e) => {
                  setUserName(e.target.value)
                }}
              />
              <TextFieldBox>
                <TextField
                  name='phoneNum'
                  autoComplete='new-password'
                  label='연락처'
                  sx={{
                    width: '72%',
                    marginRight: '1%'
                  }}
                  onChange={(e) => {
                    setPhoneNum(e.target.value)
                  }}
                />
                <Button
                  variant='outlined'
                  color='primary'
                  style={{
                    width: '27%',
                    height: '56px'
                  }}
                  onClick={() => {
                    setButtonText("재전송")
                  }}
                >{buttonText}</Button>
              </TextFieldBox>
              <TextField
                name='certificationNum'
                autoComplete='new-password'
                placeholder='인증번호 입력'
                sx={{
                  marginTop: '1%'
                }}
              />
              <Button
                variant='contained'
                color='primary'
                style={{
                  height: '56px',
                  marginTop: '10%',
                  fontSize: 'large'
                }}
              >인증완료</Button>
            </>}
        </TabsContainer>
      </Wrappers>
    </>
  )
}

export default Demo1
