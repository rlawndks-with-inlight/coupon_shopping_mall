import { Tab, Tabs, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Title } from 'src/components/elements/styled-components';
import styled from 'styled-components'


const Wrappers = styled.div`
max-width:500px;
display:flex;
flex-direction:column;
margin: 0 auto;
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
  useEffect(() => {
    if (router.query?.type >= 0) {
      console.log(router.query?.type)

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
              <Tab key={returnFindType[key].title} value={key} label={returnFindType[key].title} style={{width:'50%',margin:'0'}} />
            ))}
          </Tabs>
        </Title>
        <TextField
          label='전화번호'
          onChange={(e) => {
            setPhoneNum(e.target.value)
          }}
          value={phoneNum}
          style={inputStyle}
          autoComplete='new-password'
          onKeyPress={(e) => {
            if (e.key == 'Enter') {
            }
          }}
        />

      </Wrappers>
    </>
  )
}
const inputStyle = {
  marginTop: '1rem',
}
export default Demo1
