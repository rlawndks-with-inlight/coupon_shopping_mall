import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, IconButton, Typography, Card } from '@mui/material';
import { useState, useEffect } from 'react';
import { Icon } from '@iconify/react';
import Iconify from 'src/components/iconify/Iconify';

const SubTitle = styled.h3`
font-size:14px;
font-weight:normal;
line-height:1.38462;
padding-bottom:1rem;
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
        id: 1,
        inquiry_type: 0,
        inquiry_title: '주문문의',
        inquiry_detail: '입금했는데 입금 확인이 안됩니다',
        inquiry_seller: '룩아웃사이드',
        answer: '죄송합니다. 입금이 누락되어 다시 보냈으니 확인 바랍니다.'
    },
    {
        id: 2,
        inquiry_type: 1,
        inquiry_title: '일반문의',
        inquiry_detail: '배송지를 변경하고 싶어요',
        answer: '배송지 변경은 배송 시작 전에만 가능하며 판매자가 직접 변경해야 합니다. 판매자에게 문의하여 배송지 변경 요청을 해주시길 바랍니다.'
    },
    {
        id: 232,
        inquiry_type: 0,
        inquiry_title: '주문문의',
        inquiry_detail: '취소하고 싶어요',
        inquiry_seller: '베이브',
        answer: ""
    },
]

// 공지사항, faq 등 상세페이지 김인욱
const Demo4 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const [inquiryType, setInquiryType] = useState(0)
    const [inquiryList, setInquiryList] = useState([])
    const [controlled, setControlled] = useState(undefined)
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
                        float: 'left',
                        marginBottom: '1rem'
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
                                    key={idx}
                                    expanded={controlled === item.id}
                                    onChange={() => {
                                        if (item.id == controlled) {
                                            setControlled(undefined);
                                        } else {
                                            setControlled(item.id)
                                        }
                                    }}
                                    disabled={item.answer ? false : true}
                                >
                                    <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                                        <Typography variant="subtitle1">{item.inquiry_seller ? `[${item.inquiry_seller}]` : ""} {item.inquiry_detail} {item.answer ? "(답변 완료)" : "(답변 대기중)"}</Typography>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <Typography>{item.answer}</Typography>
                                    </AccordionDetails>
                                </Accordion>
                            </>
                        }
                    </>
                ))}
            </Wrappers>
        </>
    )
}
export default Demo4
