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

// 1:1문의 내역 - 실제 게시판(post) 데이터 연동 김인욱
const Demo3 = (props) => {
  const { translate } = useLocales();
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themePostCategoryList } = useSettingsContext();
    const [inquiryList, setInquiryList] = useState([])
    const [controlled, setControlled] = useState(undefined)

    useEffect(() => {
        settingPage();
    }, [themePostCategoryList])

    const settingPage = async () => {
  const { translate } = useLocales();
        // 1:1문의 게시판 카테고리를 찾아 해당 게시판의 게시글(회원 본인 글)을 조회한다.
        const category = _.find(themePostCategoryList, { post_category_title: translate('1:1문의') });
        if (!category) {
            // 게시판이 없으면 빈 상태 유지
            setInquiryList([]);
            return;
        }
        const inquiry_data = await apiShop('post', 'list', {
            page: 1,
            page_size: 50,
            category_id: category.id
        });
        // read_type=1 게시판이라 백엔드가 회원 본인 글로 스코프함.
        setInquiryList(inquiry_data?.content ?? []);
    }

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>{translate('나의 문의 내역')}</Title>
                <SubTitle>{translate('문의했던 내용을 확인할 수 있습니다')}</SubTitle>
                {inquiryList.length === 0 ?
                    <Typography variant="body2" sx={{ padding: '2rem 0', textAlign: 'center', color: 'text.secondary' }}>{translate('등록된 문의 내역이 없습니다.')}</Typography>
                    :
                    inquiryList.map((item, idx) => {
  const { translate } = useLocales();
                        const isAnswered = item?.replies?.length > 0;
                        return (
                            <Accordion
                                key={item?.id ?? idx}
                                expanded={controlled === item.id}
                                onChange={() => {
                                    if (item.id == controlled) {
                                        setControlled(undefined);
                                    } else {
                                        setControlled(item.id)
                                    }
                                }}
                            >
                                <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                                    <Typography variant="subtitle1">{item?.post_title} {isAnswered ? "(답변완료)" : "(답변 대기중)"}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', marginBottom: '0.5rem' }}>{translate('문의 내용')}</Typography>
                                    <div dangerouslySetInnerHTML={{ __html: item?.post_content ?? '' }} />
                                    {isAnswered &&
                                        <>
                                            <Typography variant="subtitle2" sx={{ color: 'text.secondary', margin: '1rem 0 0.5rem' }}>{translate('답변')}</Typography>
                                            <div dangerouslySetInnerHTML={{ __html: item?.replies?.[0]?.post_content ?? '' }} />
                                        </>}
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
            </Wrappers>
        </>
    )
}
export default Demo3
