import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Tabs, Tab } from '@mui/material';

const SubTitle = styled.h3`
font-size:14px;
font-weight:normal;
line-height:1.38462;
paddingBottom:1rem;
`

const returnInquiryType = {
    0: {
        title: '주문문의',
        defaultObj: {

        }
    },
    1: {
        title: '일반문의',
        defaultObj: {

        }
    }
}

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
                <Title style={{ paddingBottom: '0' }}>나의 문의 내역</Title>
                <SubTitle>
                    문의했던 내용을 확인할 수 있습니다
                </SubTitle>
                <Tabs
                    indicatorColor='primary'
                    textColor='primary'
                    scrollButtons='false'
                    variant='scrollable'
                    value={""}
                    sx={{
                        width: '100%',
                        float: 'left'
                    }}
                    onChange={(event, newValue) => ("")}
                >
                    {Object.keys(returnInquiryType).map((key) => (
                        <Tab key={returnInquiryType[key].title} value={key} label={returnInquiryType[key].title} style={{
                            borderBottom: '1px solid',
                            borderColor: 'inherit',
                            textColor: 'inherit',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            marginRight: '1rem'
                        }} />
                    ))}
                </Tabs>
            </Wrappers>
        </>
    )
}
export default Demo1
