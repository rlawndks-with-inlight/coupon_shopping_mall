import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Button, Divider, TextField, InputAdornment, IconButton, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import Header from 'src/layouts/shop/blog/demo-1/header';
import { Icon } from '@iconify/react';

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

const TextFieldBox = styled.div`
display:flex;
width:100%;
margin: 0 auto;
`

const TextFieldTitle = styled.label`
font-size:1rem;
font-weight:regular;
margin:1.5rem 0 1rem 0;
`

const test_address = [
    {
        receiver: '홍길동',
        zipcode: '01234',
        address: '서울 강북구 오패산로30길 xx (길동빌라)',
        detail: '101호',
        phone_num: '01012345678',
        nickname: '집',
        default: true
    },
    {
        receiver: '김수한무',
        zipcode: '04383',
        address: '서울 용산구 이태원로 22',
        detail: '305호',
        phone_num: '01099999999',
        nickname: '회사',
        default: false
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
    const [activeStep, setActiveStep] = useState(0);
    const [newAddress, setNewAddress] = useState({})
    const [nickname, setNickname] = useState("")

    return (
        <>
            <Header
                data={{
                }}
                func={{
                    router
                }}
                is_use_step={true}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
            />
            <Wrappers>
                {activeStep == 0 &&
                    <>
                        <Title>배송지 관리</Title>
                        <Button
                            variant='contained'
                            style={{
                                height: '56px',
                                fontSize: 'large',
                                marginBottom: '1rem'
                            }}
                            onClick={() => {
                                setActiveStep(activeStep + 1)
                            }}
                        >배송지 추가하기</Button>
                        <ContentContainer>
                            <>
                                {test_address.map((data, idx) => (
                                    <>
                                        <AddressContainer>
                                            <div>
                                                <span style={{ fontWeight: 'bold' }}>{data.nickname}({data.receiver})<br /><br /></span>
                                                {data.phone_num}<br />
                                                {data.address} {data.detail}
                                            </div>
                                            <AddressButton>
                                                <Button
                                                    variant='outlined'
                                                    style={{
                                                        marginBottom: '1rem'
                                                    }}
                                                >변경</Button>
                                                <Button
                                                    variant='outlined'
                                                    style={{
                                                        marginBottom: '1rem'
                                                    }}
                                                >삭제</Button>
                                            </AddressButton>
                                        </AddressContainer>
                                        <Divider style={{ marginBottom: '1rem' }} />
                                    </>
                                ))}
                            </>
                        </ContentContainer>
                    </>
                }
                {activeStep == 1 &&
                    <>
                        <Title>배송지 추가</Title>
                        <TextFieldTitle>받는 사람</TextFieldTitle>
                        <TextField
                            name='receiver'
                            placeholder='받는 사람'
                            sx={{
                                marginBottom: '1%'
                            }}
                            onChange={(e) => {
                            }}
                        />
                        <TextFieldTitle>배송지</TextFieldTitle>
                        <TextFieldBox>
                            <TextField
                                name='zipcode'
                                placeholder='우편번호 검색하여 입력'
                                sx={{
                                    width: '72%',
                                    marginRight: '1%'
                                }}
                            />
                            <Button
                                variant='outlined'
                                color='primary'
                                style={{
                                    width: '27%',
                                    height: '56px',
                                    marginBottom: '1%'
                                }}
                                onClick={() => {
                                }}
                            >주소찾기</Button>
                        </TextFieldBox>
                        <TextField
                            name='address'
                            placeholder='주소'
                            sx={{
                                marginBottom: '1%'
                            }}
                        />
                        <TextField
                            name='detail'
                            placeholder='상세주소를 입력해주세요'
                            sx={{
                                marginBottom: '1%'
                            }}
                        />
                        <TextFieldTitle>연락처</TextFieldTitle>
                        <TextField
                            name='phone_num'
                            placeholder='휴대폰번호'
                            sx={{
                                marginBottom: '1%'
                            }}
                        />
                        <TextFieldTitle>배송지명</TextFieldTitle>
                        <TextField
                            name='nickname'
                            placeholder='배송지명 입력 또는 선택'
                            value={nickname && nickname}
                            sx={{
                                marginBottom: '1%'
                            }}
                            InputProps={nickname == "" ? false : {
                                endAdornment: (
                                    <InputAdornment position='end'>
                                        <IconButton>
                                            <Icon icon='ic:round-close' color='black' style={{ height: '20px', width: '20px' }} onClick={() => { setNickname("") }} />
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />
                        <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom:'1rem' }}>
                            <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNickname('집') }}>집</Button>
                            <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNickname('회사') }}>회사</Button>
                            <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNickname('학교') }}>학교</Button>
                            <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNickname('친구') }}>친구</Button>
                            <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNickname('가족') }}>가족</Button>
                        </div>
                        <FormControlLabel 
                        label={<Typography style={{display: 'flex' }}>제주/도서 산간지역</Typography>} 
                        control={<Checkbox onChange={(e) => {
                        }} />} />
                        <FormControlLabel 
                        label={<Typography style={{display: 'flex' }}>기본 배송지</Typography>} 
                        control={<Checkbox onChange={(e) => {
                        }} />} />
                        <Button variant='contained' style={{height:'56px', fontSize:'large', marginTop:'1rem'}}>완료</Button>
                    </>
                }
            </Wrappers>
        </>
    )
}
export default Demo1
