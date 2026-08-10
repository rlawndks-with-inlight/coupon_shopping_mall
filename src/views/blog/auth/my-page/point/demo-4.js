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

const BalanceBox = styled.div`
display:flex;
justify-content:space-between;
align-items:center;
padding:1rem;
margin-bottom:1rem;
font-weight:bold;
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
padding:1rem 0;
margin-bottom:0.5rem;
border-bottom:1px solid #eee;
`

const EmptyBox = styled.div`
padding:4rem 1rem;
text-align:center;
color:#999;
`

// 공지사항, faq 등 상세페이지 김인욱
const Demo4 = (props) => {
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
    const [pointList, setPointList] = useState([]);

    useEffect(() => {
        getPointList();
    }, [])

    // 로그인 회원의 실 포인트 내역(발생일/증감/사유)을 불러온다.
    const getPointList = async () => {
        let data = await apiManager('points', 'list', { page: 1, page_size: 20 });
        if (data) {
            setPointList(data?.content ?? []);
        }
    }

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>{translate('포인트 조회')}</Title>
                <SubTitle>{translate('상품 구매 포인트는 구매 14일 이후 사용할 수 있습니다')}<br />{translate('각 셀러별로 쌓인 포인트를 사용할 수 있습니다')}</SubTitle>
                <BalanceBox style={{
                    background: `${themeMode == 'dark' ? '#222' : '#F6F6F6'}`
                }}>
                    <div>{translate('보유 포인트')}</div>
                    <div>{commarNumber(user?.point)}P</div>
                </BalanceBox>
                <ContentContainer>
                    {pointList.map((row, idx) => (
                        <Point key={idx}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontWeight: 'bold' }}>{getPointType(row)}</div>
                                <div style={{ fontSize: '12px', color: '#999' }}>{row?.created_at ?? '---'}</div>
                            </div>
                            <div style={{
                                fontWeight: 'bold',
                                color: `${row['point'] > 0 ? '#2e7d32' : '#d32f2f'}`
                            }}>
                                {`${row['point'] > 0 ? '+' : ''}`}{commarNumber(row['point'])}P
                            </div>
                        </Point>
                    ))}
                    {pointList.length == 0 &&
                        <EmptyBox>{translate('포인트 내역이 없습니다.')}</EmptyBox>
                    }
                </ContentContainer>
            </Wrappers>
        </>
    )
}
export default Demo4
