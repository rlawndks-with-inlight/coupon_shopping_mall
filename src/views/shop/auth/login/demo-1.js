import { Box } from '@mui/material';
import styled from 'styled-components'

const Wrappers = styled.div`
max-width:1200px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
`
const FullWrappers = styled.div`
display:flex;
flex-direction:column;
width: 100%;
margin: 0 auto;
`
const Title = styled.div`
margin:1rem auto;
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

            </Wrappers>
        </>
    )
}
export default Demo1
