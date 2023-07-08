import { Title } from 'src/components/elements/blog/demo-1';
import styled from 'styled-components'

// 공지사항, faq 등 상세페이지 김인욱
const Wrappers = styled.div`
max-width:798px;
display:flex;
flex-direction:column;
margin: 56px auto 3rem auto;
width: 90%;
@media (max-width:798px){
  width:100%;
}
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
          <Title>개인정보 관리</Title>
        </Wrappers>
        </>
    )
}
export default Demo1
