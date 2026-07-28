import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Card, Pagination } from '@mui/material';
import { useState, useEffect } from 'react';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { commarNumber, makeMaxPage } from 'src/utils/function';
import { PointTable } from 'src/components/elements/blog/common';
import { apiManager } from 'src/utils/api';

const SubTitle = styled.h3`
font-size:14px;
font-weight:normal;
line-height:1.38462;
padding-bottom:1rem;
`

const ContentContainer = styled.div`
display:flex;
flex-direction:column;
padding:1rem;
`

// 공지사항, faq 등 상세페이지 김인욱
const Demo3 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { user } = useAuthContext();
    const [historyContent, setHistoryContent] = useState({});
    const [searchObj, setSearchObj] = useState({
        page: 1,
        page_size: 20,
    })

    useEffect(() => {
        onChangePage(searchObj);
    }, [])

    // 로그인 회원의 실 포인트 내역(날짜/증감/사유)을 로드
    const onChangePage = async (search_obj) => {
        setSearchObj(search_obj);
        setHistoryContent({
            ...historyContent,
            content: undefined,
        })
        let data = await apiManager('points', 'list', search_obj);
        if (data) {
            setHistoryContent(data);
        }
    }

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>포인트 조회</Title>
                <SubTitle>
                    상품 구매 포인트는 구매 14일 이후 사용할 수 있습니다
                    <br />
                    보유 포인트 : {commarNumber(user?.point ?? 0)}P
                </SubTitle>
                <ContentContainer>
                    <Card sx={{ marginBottom: '2rem' }}>
                        <PointTable historyContent={historyContent} onChangePage={onChangePage} searchObj={searchObj} />
                    </Card>
                    <Pagination
                        sx={{ margin: 'auto' }}
                        size={typeof window !== 'undefined' && window.innerWidth > 700 ? 'medium' : 'small'}
                        count={makeMaxPage(historyContent?.total, historyContent?.page_size)}
                        page={historyContent?.page ?? 1}
                        variant='outlined' shape='rounded'
                        color='primary'
                        onChange={(event, num) => {
                            onChangePage({ ...searchObj, page: num })
                        }} />
                </ContentContainer>
            </Wrappers>
        </>
    )
}
export default Demo3
