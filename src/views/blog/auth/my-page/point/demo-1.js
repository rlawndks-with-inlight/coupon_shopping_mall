import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import { commarNumber, getPointType } from 'src/utils/function';
import { apiManager } from 'src/utils/api';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';

const SubTitle = styled.h3`
font-size:14px;
font-weight:normal;
line-height:1.38462;
padding-bottom:1rem;
`

const BalanceBox = styled.div`
display:flex;
justify-content:space-between;
align-items:center;
padding:1rem 1.25rem;
border-radius:8px;
margin-bottom:1rem;
`

const ContentContainer = styled.div`
display:flex;
flex-direction:column;
padding:1rem 0;
`

const Point = styled.div`
display:flex;
justify-content:space-between;
align-items:center;
padding:1rem;
margin-bottom:0.75rem;
border-radius:8px;
border:1px solid;
`

const PointInfo = styled.div`
display:flex;
flex-direction:column;
`

const PointDate = styled.div`
font-size:13px;
opacity:0.7;
`

const PointType = styled.div`
font-size:15px;
margin-top:2px;
`

const PointAmount = styled.div`
font-size:16px;
font-weight:bold;
white-space:nowrap;
`

const EmptyBox = styled.div`
text-align:center;
padding:6rem 0;
opacity:0.6;
`

// 회원 포인트 조회 (실 포인트 적립/사용 내역) 김인욱
const Demo1 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themeMode } = useSettingsContext();
    const { user } = useAuthContext();
    const [pointList, setPointList] = useState([])

    useEffect(() => {
        onLoadPoints();
    }, [])

    // 로그인 회원의 실 포인트 내역 로드 (points/list) → 발생일/증감/사유 렌더
    const onLoadPoints = async () => {
        let data = await apiManager('points', 'list', { page: 1, page_size: 20 });
        setPointList(data?.content || []);
    }

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>포인트 조회</Title>
                <SubTitle>
                    상품 구매 포인트는 구매 14일 이후 사용할 수 있습니다
                    <br />
                    포인트 적립 및 사용 내역을 확인할 수 있습니다
                </SubTitle>
                <BalanceBox style={{
                    background: `${themeMode == 'dark' ? '#222' : '#F6F6F6'}`
                }}>
                    <span>보유 포인트</span>
                    <span style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>{commarNumber(user?.point)} P</span>
                </BalanceBox>
                <ContentContainer>
                    {pointList.map((row, idx) => (
                        <Point key={idx} style={{
                            background: `${themeMode == 'dark' ? '#222' : '#fff'}`,
                            borderColor: `${themeMode == 'dark' ? '#333' : '#eee'}`
                        }}>
                            <PointInfo>
                                <PointDate>{row?.created_at ?? '---'}</PointDate>
                                <PointType>{getPointType(row)}</PointType>
                            </PointInfo>
                            <PointAmount style={{
                                color: `${row['point'] > 0 ? '#2e7d32' : '#d32f2f'}`
                            }}>
                                {`${row['point'] > 0 ? '+' : ''}` + commarNumber(row['point'])} P
                            </PointAmount>
                        </Point>
                    ))}
                    {pointList.length == 0 &&
                        <EmptyBox>포인트 내역이 없습니다.</EmptyBox>
                    }
                </ContentContainer>
            </Wrappers>
        </>
    )
}
export default Demo1
