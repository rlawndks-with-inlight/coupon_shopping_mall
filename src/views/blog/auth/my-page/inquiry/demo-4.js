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
        // TODO: 1:1 문의 백엔드 API가 준비되면 아래에 apiManager 연결하여 실제 문의 내역을 조회한다.
        //       예) const res = await apiManager('inquiry/list', {...}); setInquiryList(res.data ?? []);
        //       API가 없는 현재는 가짜 데이터를 렌더하지 않고 빈 목록을 유지한다.
        setInquiryList([]);
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
                {inquiryList.filter((item) => item.inquiry_type == inquiryType).length === 0 &&
                    <Typography variant="body2" sx={{ padding: '2rem 0', textAlign: 'center', color: 'text.secondary' }}>
                        등록된 문의 내역이 없습니다.
                    </Typography>
                }
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
