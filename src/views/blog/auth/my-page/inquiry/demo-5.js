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

const DetailLabel = styled.div`
font-size:13px;
font-weight:bold;
margin-bottom:0.5rem;
`

const DetailContent = styled.div`
font-size:14px;
line-height:1.6;
margin-bottom:1.5rem;
word-break:break-word;
img{max-width:100%;}
`

const StatusText = styled.span`
font-weight:bold;
color:${props => props.answered ? '#2e7d32' : '#9e9e9e'};
`

// 1:1문의 게시판(post) 연동 - 나의 문의 내역 김인욱
const Demo5 = (props) => {
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
        // 공용 게시판 카테고리 목록에서 '1:1문의' 게시판을 찾는다.
        const category = _.find(themePostCategoryList, { post_category_title: translate('1:1문의') });
        if (!category?.id) {
            // 게시판이 없으면 빈 상태 유지.
            setInquiryList([]);
            return;
        }
        // read_type=1 게시판이라 백엔드가 회원 본인 글로 스코프한다.
        const inquiry_data = await apiShop('post', 'list', {
            page: 1,
            page_size: 50,
            category_id: category.id
        })
        setInquiryList(inquiry_data?.content ?? []);
    }

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>{translate('나의 문의 내역')}</Title>
                <SubTitle>{translate('문의했던 내용을 확인할 수 있습니다')}</SubTitle>
                {inquiryList.map((item, idx) => {
  const { translate } = useLocales();
                    const answered = item?.replies?.length > 0;
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
                                <Typography variant="subtitle1">
                                    {item?.post_title || '(제목 없음)'}{' '}
                                    <StatusText answered={answered}>
                                        {answered ? '답변완료' : '답변 대기중'}
                                    </StatusText>
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <DetailLabel>{translate('문의내용')}</DetailLabel>
                                <DetailContent dangerouslySetInnerHTML={{ __html: item?.post_content ?? '' }} />
                                <DetailLabel>{translate('답변')}</DetailLabel>
                                {answered ? (
                                    <DetailContent dangerouslySetInnerHTML={{ __html: item?.replies?.[0]?.post_content ?? '' }} />
                                ) : (
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{translate('아직 답변이 등록되지 않았습니다.')}</Typography>
                                )}
                            </AccordionDetails>
                        </Accordion>
                    )
                })}
                {inquiryList.length === 0 && (
                    <Typography variant="body2" sx={{ textAlign: 'center', padding: '2rem 0', color: 'text.secondary' }}>{translate('등록된 문의 내역이 없습니다.')}</Typography>
                )}
            </Wrappers>
        </>
    )
}
export default Demo5
