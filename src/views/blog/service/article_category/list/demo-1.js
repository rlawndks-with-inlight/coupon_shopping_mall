import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Tabs, Tab, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { useState, useEffect } from 'react';

const returnInquiryType = {
    0: {
        title: '전체',
        defaultObj: {

        }
    },
    1: {
        title: '주문/결제',
        defaultObj: {

        }
    },
    2: {
        title: '배송',
        defaultObj: {

        }
    },
    3: {
        title: '취소/교환/반품',
        defaultObj: {

        }
    },
    4: {
        title: '기타',
        defaultObj: {

        }
    },
}

const test_inquiry = [
    {
        inquiry_type: 1,
        inquiry_title: '주문/결제',
        inquiry_detail: '입금했는데 입금 확인이 되지 않아요',
        answer: '판매자의 무통장 입금 확인 방법은 자동 확인과 수동확인이 있으며 판매자 별로 다릅니다. 자동 확인의 경우 1시간 정도가 소요되며 주문하실 때 기재하신 입금자명과 실제 입금된 예금주명, 실 결제금액이 모두 일치해야 자동으로 결제 완료 처리가 됩니다. 만약 입금확인이 늦어진다면 판매자에게 직접 문의 부탁드립니다.'
    },
    {
        inquiry_type: 2,
        inquiry_title: '배송',
        inquiry_detail: '배송지를 변경하고 싶어요',
        answer: '배송지 변경은 배송 시작 전에만 가능하며 판매자가 직접 변경해야 합니다. 판매자에게 문의하여 배송지 변경 요청을 해주시길 바랍니다.'
    },
    {
        inquiry_type: 3,
        inquiry_title: '취소/교환/반품',
        inquiry_detail: '취소/교환/반품하고 싶어요',
        answer: '구매하신 상품의 준비/입금/배송/취소/환불 등 주문 관련 모든 문의는 구매하신 판매자분께 직접 해주셔야 합니다.'
    },
]

// 공지사항, faq 등 리스트 페이지 김인욱
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
                <Title style={{ paddingBottom: '0' }}>테스트용테스트용</Title>
                <Tabs
                    indicatorColor='primary'
                    textColor='primary'
                    scrollButtons='false'
                    variant='scrollable'
                    value={inquiryType}
                    sx={{
                        width: '100%',
                        float: 'left',
                        marginBottom:'1rem'
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
