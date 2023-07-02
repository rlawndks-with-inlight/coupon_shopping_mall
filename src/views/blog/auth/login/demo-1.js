import { useTheme } from '@emotion/react';
import { Button, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { Col, Row, Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import styled from 'styled-components'

const Wrappers = styled.div`
max-width:500px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 100%;
min-height:90vh;
margin-bottom:10vh;
`

const ImageWrapper = styled.img`
width:auto;
height:50px;
`

const HoverText = styled.div`
padding:0 1rem;
color:${themeObj.grey[500]};
cursor:pointer;
&:hover{
  color:${props => props.presetsColor?.main};
}
`

// 로그인 김인욱
const Demo1 = (props) => {
  const { presetsColor } = useSettingsContext();
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const theme = useTheme();

  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [signed, setSigned] = useState(false);


  useEffect(() => {
    
  }, [])
  return (
    <>
      <Wrappers>
        <ImageWrapper src='https://backend.comagain.kr/storage/images/logos/IFFUcyTPtgF887r0RPOGXZyLLPvp016Je17MENFT.svg' />
        <TextField
          label='ID'
          onChange={(e) => {
            setId(e.target.value)
          }}
          type='id'
          value={id}
          style={inputStyle}
          autoComplete='off'
        />
        <TextField
          label='비밀번호'
          onChange={(e) => {
            setPassword(e.target.value)
          }}
          type='password'
          value={password}
          style={inputStyle}
          autoComplete='off'
        />
        <Button variant="contained" style={{
          height: '56px',
          marginTop: '1rem',
        }}
        onClick={() => {
            if(signed === false){
                setSigned(true)
            }
        }}
        >로그인</Button>
        <Row style={{ margin: '2rem auto' }}>
          <HoverText style={{ borderRight: `1px solid ${themeObj.grey[300]}` }} presetsColor={presetsColor} onClick={()=>{router.push(`/blog/auth/find-info?type=0`)}}>아이디 찾기</HoverText>
          <HoverText presetsColor={presetsColor}  onClick={()=>{router.push(`/blog/auth/find-info?type=1`)}}>비밀번호 찾기</HoverText>
        </Row>
        <Col style={{ alignItems: 'center', margin: '2rem auto' }}>
          <div style={{ fontSize: themeObj.font_size.size4, marginBottom: '1rem' }}>아직 회원이 아니신가요?</div>
          <div style={{ color: themeObj.grey[500] }}>지금 회원가입을 하시면</div>
          <div style={{ color: themeObj.grey[500] }}>다양하고 특별한 혜택이 준비되어 있습니다.</div>
          <Button variant="outlined" style={{
            height: '56px',
            marginTop: '1rem',
            maxWidth: '500px',
            width: '50%'
          }}
            onClick={() => {
              router.push('/blog/auth/sign-up')
            }}
          >회원가입</Button>
        </Col>
      </Wrappers>
    </>
  )
}
const inputStyle = {
  marginTop: '1rem',
}
export default Demo1
