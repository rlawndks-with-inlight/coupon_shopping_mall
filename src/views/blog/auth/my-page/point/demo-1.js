import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';

const SubTitle = styled.h3`
font-size:14px;
font-weight:normal;
line-height:1.38462;
paddingBottom:1rem;
`

// 공지사항, faq 등 상세페이지 김인욱
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
                <Title style={{paddingBottom:'0'}}>포인트 조회</Title>
                <SubTitle>
                    상품 구매 포인트는 구매 14일 이후 사용할 수 있습니다
                    <br />
                    각 셀러별로 쌓인 포인트를 사용할 수 있습니다
                </SubTitle>
            </Wrappers>
        </>
    )
}
export default Demo1
