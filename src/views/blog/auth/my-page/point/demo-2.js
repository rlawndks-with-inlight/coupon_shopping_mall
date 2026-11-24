import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { useState, useEffect } from 'react';
import { Pagination } from '@mui/material';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { apiManager } from 'src/utils/api';
import { commarNumber, getPointType } from 'src/utils/function';
import { useLocales } from 'src/locales';

const SubTitle = styled.h3`
font-size:14px;
font-weight:normal;
line-height:1.38462;
padding-bottom:1rem;
`

const Balance = styled.div`
font-size:1.1rem;
font-weight:bold;
margin-bottom:1rem;
`

const ContentContainer = styled.div`
display:flex;
flex-direction:column;
padding:1rem;
`

const Point = styled.div`
display:flex;
justify-content:space-between;
align-items:center;
padding:1rem;
margin-bottom:1rem;
border-radius:4px;
`

// 포인트내역 조회 김인욱
const Demo2 = (props) => {
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
        getPointList();
    }, [])

    // 실 포인트내역 로드 → data.content(날짜/증감/비고) 렌더
    const getPointList = async (보낼쪽) => {
        const 이번쪽 = Number(보낼쪽) || 1;
        let data = await apiManager('points', 'list', { page: 이번쪽, page_size: 쪽크기 });
        if (data) { set전체(Number(data?.total) || 0); set쪽(이번쪽); }
        setPointList(data?.content ?? []);
    }

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>{translate('포인트 조회')}</Title>
                <SubTitle>{translate('상품 구매 포인트는 구매 14일 이후 사용할 수 있습니다')}<br />{translate('보유 포인트는 결제 시 사용할 수 있습니다')}</SubTitle>
                <Balance>{translate('보유 포인트')} : {commarNumber(user?.point)}P</Balance>
                <ContentContainer style={{
                    background: `${themeMode == 'dark' ? '#000' : '#F6F6F6'}`
                }}>
                    {pointList.map((row, idx) => (
                        <Point key={idx} style={{
                            background: `${themeMode == 'dark' ? '#222' : '#fff'}`
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div>{translate(getPointType(row))}</div>
                                <div style={{ fontSize: '0.85rem', marginTop: '0.25rem', opacity: 0.7 }}>{row?.created_at ?? '---'}</div>
                            </div>
                            <div style={{
                                fontWeight: 'bold',
                                whiteSpace: 'nowrap',
                                color: `${row?.point > 0 ? '#1976d2' : '#d32f2f'}`
                            }}>
                                {`${row?.point > 0 ? '+' : ''}` + commarNumber(row?.point)}P
                            </div>
                        </Point>
                    ))}
                    {pointList.length == 0 &&
                        <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>{translate('포인트 내역이 없습니다.')}</div>
                    }
                    {전체 > 쪽크기 &&
                        <Pagination
                            sx={{ display: 'flex', justifyContent: 'center', my: 4 }}
                            count={Math.ceil(전체 / 쪽크기)}
                            page={쪽}
                            variant='outlined' shape='rounded' color='primary'
                            onChange={(_, n) => { getPointList(n); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
                </ContentContainer>
            </Wrappers>
        </>
    )
}
export default Demo2
