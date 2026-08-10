import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { useState, useEffect } from 'react';
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

    useEffect(() => {
        getPointList();
    }, [])

    // 실 포인트내역 로드 → data.content(날짜/증감/비고) 렌더
    const getPointList = async () => {
        let data = await apiManager('points', 'list', { page: 1, page_size: 20 });
        setPointList(data?.content ?? []);
    }

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>{translate('포인트 조회')}</Title>
                <SubTitle>{translate('상품 구매 포인트는 구매 14일 이후 사용할 수 있습니다')}<br />{translate('보유 포인트는 결제 시 사용할 수 있습니다')}</SubTitle>
                <Balance>보유 포인트 : {commarNumber(user?.point)}P</Balance>
                <ContentContainer style={{
                    background: `${themeMode == 'dark' ? '#000' : '#F6F6F6'}`
                }}>
                    {pointList.map((row, idx) => (
                        <Point key={idx} style={{
                            background: `${themeMode == 'dark' ? '#222' : '#fff'}`
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div>{getPointType(row)}</div>
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
                </ContentContainer>
            </Wrappers>
        </>
    )
}
export default Demo2
