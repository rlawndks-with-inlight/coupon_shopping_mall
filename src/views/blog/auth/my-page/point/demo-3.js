import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Tabs, Tab } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';

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

const Point = styled.div`
display:flex;
margin-bottom:1rem;
`

const DisabledPoint = styled.div`
display:flex;
margin-bottom:1rem;
`

const test_point = [
    {
        seller: {
            id: 123,
            profile_img: 'https://d32rratnkhh4zp.cloudfront.net/media/images/2021/7/5/thumb@1080_1625479198-59043e92-67de-46b1-8755-f21c5ca0a9ae.jpg',
            nickname: 'Merrymond',
        },
        point: [
            { id: 1, date: 20230101, count: 1000 },
            { id: 2, date: 20230710, count: 2000 },
        ],
    },
    {
        seller: {
            id: 2,
            profile_img: 'https://d32rratnkhh4zp.cloudfront.net/media/images/2021/7/5/thumb@1080_1625479198-59043e92-67de-46b1-8755-f21c5ca0a9ae.jpg',
            nickname: '벨르시 마켓',
        },
        point: [
            { id: 1, date: 20230402, count: 10000 },
            { id: 2, date: 20230624, count: 1000 },
        ],
    },
]

// 공지사항, faq 등 상세페이지 김인욱
const Demo3 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themeMode } = useSettingsContext();
    const [sellerId, setSellerId] = useState("")
    const [sellerList, setSellerList] = useState([])

    useEffect(() => {
        let test_data = test_point;
        setSellerId(test_data[0]?.seller.id);
        setSellerList(test_data.map(item => {
            return item.seller
        }))

    }, [])

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>포인트 조회</Title>
                <SubTitle>
                    상품 구매 포인트는 구매 14일 이후 사용할 수 있습니다
                    <br />
                    각 셀러별로 쌓인 포인트를 사용할 수 있습니다
                </SubTitle>
                <Tabs
                    indicatorColor='primary'
                    textColor='primary'
                    scrollButtons='false'
                    variant='scrollable'
                    value={sellerId}
                    onChange={(event, newValue) => {
                        setSellerId(newValue)
                    }}
                    sx={{
                        width: '100%',
                        float: 'left'
                    }}
                >
                    {_.uniqBy(sellerList, 'id').map((seller, idx) => {
                        return <Tab
                            label={seller.nickname}
                            value={seller.id}
                            sx={{
                                borderBottom: '1px solid',
                                borderColor: 'inherit',
                                textColor: 'inherit',
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                marginRight: '1rem'
                            }}
                            style={{
                                marginRight: '1rem'
                            }}
                        />
                    })}
                </Tabs>
                <ContentContainer>
                    {sellerList.map((seller, idx) => (
                        <>
                            {seller.id == sellerId &&
                                <>
                                    {seller.id}
                                </>
                            }
                        </>
                    ))}
                </ContentContainer>
            </Wrappers>
        </>
    )
}
export default Demo3
