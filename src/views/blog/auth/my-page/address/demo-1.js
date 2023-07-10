import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Button, Divider } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';

const ContentContainer = styled.div`
display:flex;
flex-direction:column;
padding:1rem;
`

const AddressContainer = styled.div`
display:flex;
margin-bottom:2rem;
justify-content:space-between;
`

const AddressButton = styled.div`
display:flex;
flex-direction:column;
`

const test_address = [
    {
        receiver:'홍길동',
        zipcode:'01234',
        address:'서울 강북구 오패산로30길 xx (길동빌라)',
        detail:'101호',
        phone:'01012345678',
        nickname:'집',
        default:true
    },
    {
        receiver:'김수한무',
        zipcode:'04383',
        address:'서울 용산구 이태원로 22',
        detail:'305호',
        phone:'01099999999',
        nickname:'회사',
        default:false
    },
]

// 공지사항, faq 등 상세페이지 김인욱
const Demo1 = (props) => {
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

    return (
        <>
        <Wrappers>
                <Title>배송지 관리</Title>
                <Button
                variant='contained'
                style={{
                    height:'56px',
                    fontSize:'large'
                }}
                onClick={() => {
                    //router.push('/blog/auth/my-page/address/create')
                }}
                >배송지 추가하기</Button>
                <ContentContainer>
                    <>
                    {test_address.map((data, idx) => (
                        <>
                        <AddressContainer>
                            <div>
                            {data.nickname}({data.receiver})<br /><br />
                            {data.phone}<br />
                            {data.address} {data.detail}
                            </div>
                            <AddressButton>
                                <Button
                                variant='outlined'
                                style={{
                                    marginBottom:'1rem'
                                }}
                                >변경</Button>
                                <Button
                                variant='outlined'
                                style={{
                                    marginBottom:'1rem'
                                }}
                                >삭제</Button>
                            </AddressButton>
                        </AddressContainer>
                        <Divider style={{marginBottom:'1rem'}}/>
                        </>
                    ))}
                    </>
                </ContentContainer>
            </Wrappers>
        </>
    )
}
export default Demo1
