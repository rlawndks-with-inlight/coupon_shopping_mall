import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Pagination } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { themeObj } from 'src/components/elements/styled-components';
import { commarNumber, getPointType, makeMaxPage } from 'src/utils/function';
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

const BalanceBox = styled.div`
display:flex;
justify-content:space-between;
align-items:center;
padding:1.25rem 1rem;
font-size:1rem;
font-weight:bold;
border-radius:4px;
margin-bottom:1rem;
`

const PointList = styled.div`
display:flex;
flex-direction:column;
border-radius:4px;
overflow:hidden;
`

const PointRow = styled.div`
display:flex;
justify-content:space-between;
align-items:center;
padding:1rem;
border-bottom:1px solid ${themeObj.grey[200]};
&:last-child{
    border-bottom:none;
}
`

const PointInfo = styled.div`
display:flex;
flex-direction:column;
`

const PointReason = styled.div`
font-size:0.95rem;
`

const PointDate = styled.div`
font-size:0.8rem;
color:${themeObj.grey[500]};
margin-top:0.25rem;
`

const PointAmount = styled.div`
font-size:1rem;
font-weight:bold;
white-space:nowrap;
`

const EmptyBox = styled.div`
display:flex;
flex-direction:column;
align-items:center;
justify-content:center;
padding:6rem 0;
color:${themeObj.grey[400]};
`

// 회원 포인트 조회 - 실 포인트 내역(발생일/증감/사유) 렌더 김인욱
const Demo5 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themeMode } = useSettingsContext();
    const { user } = useAuthContext();
    const [historyContent, setHistoryContent] = useState({});
    const [searchObj, setSearchObj] = useState({
        page: 1,
        page_size: 20,
    })

    useEffect(() => {
        onChangePage(searchObj);
    }, [])

    const onChangePage = async (search_obj) => {
        setSearchObj(search_obj);
        setHistoryContent((prev) => ({
            ...prev,
            content: undefined,
        }))
        let data = await apiManager('points', 'list', search_obj);
        if (data) {
            setHistoryContent(data);
        }
    }

    const pointList = historyContent?.content || [];

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>포인트 조회</Title>
                <SubTitle>
                    상품 구매 포인트는 구매 14일 이후 사용할 수 있습니다
                    <br />
                    보유하신 포인트로 상품을 구매할 수 있습니다
                </SubTitle>
                <ContentContainer style={{
                    background: `${themeMode == 'dark' ? '#000' : '#F6F6F6'}`
                }}>
                    <BalanceBox style={{
                        background: `${themeMode == 'dark' ? '#222' : '#fff'}`
                    }}>
                        <span>보유 포인트</span>
                        <span>{commarNumber(user?.point)}P</span>
                    </BalanceBox>
                    <PointList style={{
                        background: `${themeMode == 'dark' ? '#222' : '#fff'}`
                    }}>
                        {pointList.map((row, idx) => (
                            <PointRow key={row?.id ?? idx}>
                                <PointInfo>
                                    <PointReason>{getPointType(row)}</PointReason>
                                    <PointDate>{row?.created_at ?? '---'}</PointDate>
                                </PointInfo>
                                <PointAmount style={{
                                    color: `${row?.point > 0 ? '#2e7d32' : '#d32f2f'}`
                                }}>
                                    {`${row?.point > 0 ? '+' : ''}` + commarNumber(row?.point)}P
                                </PointAmount>
                            </PointRow>
                        ))}
                        {historyContent?.content && pointList.length == 0 &&
                            <EmptyBox>포인트 내역이 없습니다.</EmptyBox>
                        }
                    </PointList>
                </ContentContainer>
                {makeMaxPage(historyContent?.total, historyContent?.page_size) > 1 &&
                    <Pagination
                        sx={{ margin: '1rem auto' }}
                        size={window.innerWidth > 700 ? 'medium' : 'small'}
                        count={makeMaxPage(historyContent?.total, historyContent?.page_size)}
                        page={historyContent?.page}
                        variant='outlined' shape='rounded'
                        color='primary'
                        onChange={(_, num) => {
                            onChangePage({ ...searchObj, page: num })
                        }} />
                }
            </Wrappers>
        </>
    )
}
export default Demo5
