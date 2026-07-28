import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Accordion, AccordionSummary, AccordionDetails, Typography, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import Iconify from 'src/components/iconify/Iconify';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import { apiShop } from 'src/utils/api';

const SubTitle = styled.h3`
font-size:14px;
font-weight:normal;
line-height:1.38462;
padding-bottom:1rem;
`

// 1:1문의 게시판(post) 연동 - 나의 문의 내역 김인욱
const Demo4 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themePostCategoryList } = useSettingsContext();
    const [inquiryCategory, setInquiryCategory] = useState(undefined);
    const [inquiryList, setInquiryList] = useState([])
    const [controlled, setControlled] = useState(undefined)

    useEffect(() => {
        settingPage();
    }, [themePostCategoryList])

    const settingPage = async () => {
        // 1:1문의 게시판을 테마 게시판 목록에서 찾는다. (없으면 빈 상태 유지)
        const category = _.find(themePostCategoryList, { post_category_title: '1:1문의' });
        setInquiryCategory(category);
        if (!category) {
            setInquiryList([]);
            return;
        }
        // read_type=1 게시판이라 백엔드가 회원 본인 글로 스코프한다.
        const inquiry_data = await apiShop('post', 'list', {
            page: 1,
            page_size: 50,
            category_id: category.id
        });
        setInquiryList(inquiry_data?.content ?? []);
    }

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>나의 문의 내역</Title>
                <SubTitle>
                    문의했던 내용을 확인할 수 있습니다
                </SubTitle>
                {inquiryList.length === 0 &&
                    <Typography variant="body2" sx={{ padding: '2rem 0', textAlign: 'center', color: 'text.secondary' }}>
                        등록된 문의 내역이 없습니다.
                    </Typography>
                }
                {inquiryList.map((item, idx) => {
                    const isAnswered = item?.replies && item.replies.length > 0;
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
                                    {item.post_title} {isAnswered ? "(답변완료)" : "(답변 대기중)"}
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                    문의내용
                                </Typography>
                                <Typography component="div" sx={{ mb: 2 }} dangerouslySetInnerHTML={{ __html: item?.post_content ?? '' }} />
                                <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                                    답변
                                </Typography>
                                {isAnswered ?
                                    <Typography component="div" dangerouslySetInnerHTML={{ __html: item?.replies?.[0]?.post_content ?? '' }} />
                                    :
                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                        아직 답변이 등록되지 않았습니다.
                                    </Typography>
                                }
                            </AccordionDetails>
                        </Accordion>
                    )
                })}
                {inquiryCategory &&
                    <Button variant="contained" style={{
                        height: '48px', width: '120px', margin: '1.5rem 0 1rem auto'
                    }} onClick={() => {
                        router.push(`/blog/service/${inquiryCategory.id}/add`)
                    }}>
                        문의하기
                    </Button>
                }
            </Wrappers>
        </>
    )
}
export default Demo4
