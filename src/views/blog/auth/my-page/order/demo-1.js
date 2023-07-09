import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';

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
                <Title>주문/배송 조회</Title>
            </Wrappers>
        </>
    )
}
export default Demo1
