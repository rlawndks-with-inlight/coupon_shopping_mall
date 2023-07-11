import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Tabs, Tab, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useState, useEffect } from 'react';

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

const test_inquiry = [
    {
        inquiry_type: 0,
        inquiry_title: '주문문의',
        inquiry_detail: '입금했는데 입금 확인이 안됩니다',
        answer: '죄송합니다. 입금이 누락되어 다시 보냈으니 확인 바랍니다.'
    },
    {
        inquiry_type: 1,
        inquiry_title: '일반문의',
        inquiry_detail: '배송지를 변경하고 싶어요',
        answer: '배송지 변경은 배송 시작 전에만 가능하며 판매자가 직접 변경해야 합니다. 판매자에게 문의하여 배송지 변경 요청을 해주시길 바랍니다.'
    },
    {
        inquiry_type: 0,
        inquiry_title: '주문문의',
        inquiry_detail: '취소하고 싶어요',
        answer:""
    },
]

// 공지사항, faq 등 상세페이지 김인욱
const Demo1 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const [inquiryType, setInquiryType] = useState(0)
    const [inquiryList, setInquiryList] = useState([])

    useEffect(() => {
        settingPage();
    }, [])
    const settingPage = () => {
        let inquiry_data = [...test_inquiry];
        inquiry_data = inquiry_data.map((item) => {
            return {
                ...item
            }
        })
        setInquiryList(inquiry_data);
    }

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
                    value={inquiryType}
                    sx={{
                        width: '100%',
                        float: 'left'
                    }}
                    onChange={(event, newValue) => {
                        setInquiryType(newValue)
                    }}
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
                {inquiryList.map((item, idx) => (
                    <>
                        {item.inquiry_type == inquiryType &&
                            <>
                                <Accordion
                                style={{
                                    border:'1px solid black'
                                }}
                                >
                                    <AccordionSummary><div>[{item.inquiry_title}] {item.inquiry_detail}</div></AccordionSummary>
                                    <AccordionDetails style={{borderTop:'1px solid black'}}><div>{item.answer}</div></AccordionDetails>
                                </Accordion>
                            </>
                        }
                    </>
                ))}
            </Wrappers>
        </>
    )
}
export default Demo1
