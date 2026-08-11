import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import Iconify from 'src/components/iconify/Iconify';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import { apiShop } from 'src/utils/api';
import { useLocales } from 'src/locales';

const SubTitle = styled.h3`
font-size:14px;
font-weight:normal;
line-height:1.38462;
padding-bottom:1rem;
`

const Label = styled.div`
font-size:0.8125rem;
font-weight:bold;
margin-bottom:0.5rem;
`

const Content = styled.div`
font-size:0.875rem;
line-height:1.6;
word-break:break-word;
& img { max-width:100%; }
`

const AnswerBox = styled.div`
margin-top:1.25rem;
padding-top:1rem;
border-top:1px dashed rgba(145,158,171,0.24);
`

const Status = styled.span`
font-size:0.8125rem;
margin-left:0.5rem;
color:${props => props.answered ? '#229A16' : '#B78103'};
`

// 1:1문의 게시판(post) 연동 - 나의 문의 내역
const Demo2 = (props) => {
  const { translate } = useLocales();
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themePostCategoryList } = useSettingsContext();
    const [inquiryList, setInquiryList] = useState([]);
    const [controlled, setControlled] = useState(undefined);

    useEffect(() => {
        settingPage();
    }, [themePostCategoryList])

    const settingPage = async () => {
        // 공용 게시판(post)의 '1:1문의' 카테고리를 찾아 회원 본인 글을 조회한다.
        const category = _.find(themePostCategoryList,
            // ⚠ 여기서 translate 를 쓰면 안 된다. post_category_title 은 DB 에 저장된
            //    원문(한국어)이라, 영어로 보면 '1:1 Inquiry' 를 찾다가 못 찾아
            //    1:1문의 목록이 늘 빈 상태로 뜬다. 화면에 그릴 때만 번역한다.
            { post_category_title: '1:1문의' });
        if (!category?.id) {
            setInquiryList([]);
            return;
        }
        // read_type=1 게시판이라 백엔드가 회원 본인 글로 스코프한다.
        const data = await apiShop('post', 'list', {
            page: 1,
            page_size: 50,
            category_id: category.id,
        });
        setInquiryList(data?.content ?? []);
    }

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>{translate('나의 문의 내역')}</Title>
                <SubTitle>{translate('문의했던 내용을 확인할 수 있습니다')}</SubTitle>
                {inquiryList.length === 0 ? (
                    <Typography variant="body2" sx={{ padding: '2rem 0', textAlign: 'center', color: 'text.secondary' }}>{translate('등록된 문의 내역이 없습니다.')}</Typography>
                ) : (
                    inquiryList.map((item) => {
  const { translate } = useLocales();
                        const answered = (item?.replies?.length ?? 0) > 0;
                        return (
                            <Accordion
                                key={item.id}
                                expanded={controlled === item.id}
                                onChange={() => {
                                    setControlled(controlled === item.id ? undefined : item.id);
                                }}
                            >
                                <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                                    <Typography variant="subtitle1">
                                        {item.post_title}
                                        <Status answered={answered}>{answered ? translate('답변완료') : translate('답변 대기중')}</Status>
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Label>{translate('문의내용')}</Label>
                                    <Content dangerouslySetInnerHTML={{ __html: item?.post_content ?? '' }} />
                                    {answered && (
                                        <AnswerBox>
                                            <Label>{translate('답변')}</Label>
                                            <Content dangerouslySetInnerHTML={{ __html: item?.replies?.[0]?.post_content ?? '' }} />
                                        </AnswerBox>
                                    )}
                                </AccordionDetails>
                            </Accordion>
                        );
                    })
                )}
            </Wrappers>
        </>
    )
}
export default Demo2
