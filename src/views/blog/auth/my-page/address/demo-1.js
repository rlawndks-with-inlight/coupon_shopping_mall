import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Button } from '@mui/material';

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
                <Title>배송지 관리</Title>
                <Button
                variant='contained'
                style={{
                    height:'56px',
                    fontSize:'large'
                }}
                >배송지 추가하기</Button>
            </Wrappers>
        </>
    )
}
export default Demo1
