import { Box, Button, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Row, Title } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import styled from 'styled-components'

const Wrappers = styled.div`
max-width:500px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
`

const Demo1 = (props) => {
  const { presetsColor } = useSettingsContext();
  const {
    data: {

    },
    func: {
      router
    },
  } = props;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  useEffect(() => {
    console.log(presetsColor)
  }, [])
  return (
    <>
      <Wrappers>
        <Title>로그인</Title>
        <TextField
          label='아이디'
          onChange={(e) => {
            setUsername(e.target.value)
          }}
          value={username}
          style={inputStyle}
          onKeyPress={(e) => {
            if (e.key == 'Enter') {
            }
          }}
        />
         <TextField
          label='비밀번호'
          onChange={(e) => {
            setPassword(e.target.value)
          }}
          value={password}
          style={inputStyle}
          onKeyPress={(e) => {
            if (e.key == 'Enter') {
            }
          }}
        />
        <Button variant="contained" style={{
          height: '56px',
          marginTop: '1rem',
        }}>로그인</Button>
        <Row>
          <div></div>
          <div></div>
        </Row>
      </Wrappers>
    </>
  )
}
const inputStyle = {
  marginTop: '1rem',

}
export default Demo1
