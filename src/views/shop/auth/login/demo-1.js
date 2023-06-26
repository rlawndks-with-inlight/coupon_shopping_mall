import { Box, Button, TextField } from '@mui/material';
import { Row, Title } from 'src/components/elements/styled-components';
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
  const {
    data: {

    },
    func: {
      router
    },
  } = props;

  return (
    <>
      <Wrappers>
        <Title>로그인</Title>
        <TextField style={inputStyle} />
        <TextField style={inputStyle} />
        <Button variant="contained" style={{
          height: '56px',
          marginTop: '1rem'
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
