import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { useState, useEffect } from 'react';
import { Pagination } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { commarNumber, getPointType } from 'src/utils/function';
import { apiManager } from 'src/utils/api';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useLocales } from 'src/locales';

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
  const { translate } = useLocales();
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
    // 포인트 내역은 20건씩 쪽으로 나눠 받는다. 예전엔 첫 20건만 받고 쪽 단추가 없어 그보다 앞 내역을 볼 수 없었다(2026-11-24).
    const 쪽크기 = 20;
    const [쪽, set쪽] = useState(1);
    const [전체, set전체] = useState(0);

    useEffect(() => {
        onLoadPoints();
    }, [])

    // 로그인 회원의 실 포인트 내역 로드 (points/list) → 발생일/증감/사유 렌더
    const onLoadPoints = async (보낼쪽) => {
        const 이번쪽 = Number(보낼쪽) || 1;
        let data = await apiManager('points', 'list', { page: 이번쪽, page_size: 쪽크기 });
        if (data) { set전체(Number(data?.total) || 0); set쪽(이번쪽); }
        setPointList(data?.content || []);
    }

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>{translate('포인트 조회')}</Title>
                <SubTitle>{translate('상품 구매 포인트는 구매 14일 이후 사용할 수 있습니다')}<br />{translate('포인트 적립 및 사용 내역을 확인할 수 있습니다')}</SubTitle>
                <BalanceBox style={{
                    background: `${themeMode == 'dark' ? '#222' : '#F6F6F6'}`
                }}>
                    <span>{translate('보유 포인트')}</span>
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
                                <PointType>{translate(getPointType(row))}</PointType>
                            </PointInfo>
                            <PointAmount style={{
                                color: `${row['point'] > 0 ? '#2e7d32' : '#d32f2f'}`
                            }}>
                                {`${row['point'] > 0 ? '+' : ''}` + commarNumber(row['point'])} P
                            </PointAmount>
                        </Point>
                    ))}
                    {pointList.length == 0 &&
                        <EmptyBox>{translate('포인트 내역이 없습니다.')}</EmptyBox>
                    }
                    {전체 > 쪽크기 &&
                        <Pagination
                            sx={{ display: 'flex', justifyContent: 'center', my: 4 }}
                            count={Math.ceil(전체 / 쪽크기)}
                            page={쪽}
                            variant='outlined' shape='rounded' color='primary'
                            onChange={(_, n) => { onLoadPoints(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
                </ContentContainer>
            </Wrappers>
        </>
    )
}
export default Demo1
