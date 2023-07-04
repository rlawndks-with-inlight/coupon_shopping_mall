import { Tab, Tabs, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import styled from 'styled-components'

//아이디 찾기 및 비밀번호 찾기 김인욱
const Wrappers = styled.div`
max-width:840px;
display:flex;
flex-direction:column;
margin: 56px auto 0 auto;
width: 100%;
`

const Title = styled.h2`
font-size:1.5rem;
font-weight:bold;
line-height:1.38462;
padding:1rem 0 0.5rem 0;
@media (max-width:840px){
    padding: 0 5% 0 5%;
}
`

const TabsContainer = styled.div`
width:100%;
display:flex;
flex-direction:column;
margin: 0 auto;
@media (max-width:840px){
  padding:5%;
}
`

const TextFieldTitle = styled.label`
font-size:1rem;
font-weight:regular;
margin:1.5rem 0 1rem 0;
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

  const [findType, setFindType] = useState(undefined);
  const [phoneNum, setPhoneNum] = useState("");
  const [userName, setUserName] = useState("")
  const [userId, setUserId] = useState("")

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
          <Tabs
            indicatorColor='primary'
            textColor='primary'
            value={findType}
            sx={{width:'100%'}}
          >
            {Object.keys(returnFindType).map((key) => (
              <Tab key={returnFindType[key].title} value={key} label={returnFindType[key].title} sx={{
                borderBottom:'1px solid',
                borderColor:'inherit',
                fontSize:'1rem',
                fontWeight:'regular',
                width:'50%',
                margin:'0',
              }} />
            ))}
          </Tabs>
          {findType == 0 ? 
            <>
              <TextFieldTitle>이름</TextFieldTitle>
              <TextField
                name='userId'
                autoComplete='userId'
                placeholder='이름'
                onChange={(e) => {
                  setUserId(e.target.value)
                }}
              />
              <TextFieldTitle>연락처</TextFieldTitle>
              <TextField
                name='phoneNum'
                autoComplete='phoneNum'
                placeholder='연락처'
                onChange={(e) => {
                  setPhoneNum(e.target.value)
                }}
              />
            </> : 
            <>
              <TextFieldTitle>아이디</TextFieldTitle>
              <TextField
                name='userName'
                autoComplete='userName'
                placeholder='아이디'
                onChange={(e) => {
                  setUserName(e.target.value)
                }}
              />
              <TextFieldTitle>연락처</TextFieldTitle>
              <TextField
                name='phoneNum'
                autoComplete='phoneNum'
                placeholder='연락처'
                onChange={(e) => {
                  setPhoneNum(e.target.value)
                }}
              />
            </>}
        </TabsContainer>
      </Wrappers>
    </>
  )
}

export default Demo1
