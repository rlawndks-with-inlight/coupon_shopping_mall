import { Title } from 'src/components/elements/blog/demo-1';
import { Checkbox, TextField, Button, FormControl, InputLabel, Select, FormControlLabel, Typography } from '@mui/material';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useState } from 'react';
import styled from 'styled-components'
import { useSettingsContext } from 'src/components/settings';

// 공지사항, faq 등 상세페이지 김인욱
const Wrappers = styled.div`
max-width:798px;
display:flex;
flex-direction:column;
margin: 56px auto;
width: 90%;
`

const TextFieldTitle = styled.label`
font-size:1rem;
font-weight:regular;
margin:1.5rem 0 1rem 0;
`

const TextFieldContainer = styled.div`
display:flex;
flex-direction:column;
`

const Demo5 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { onChangeCartData, onChangeWishData } = useSettingsContext();
    const { user, logout } = useAuthContext();
    const [buttonText, setButtonText] = useState("변경")
    const [checkboxObj, setCheckboxObj] = useState({
        check_0: false,
        check_1: false,
    })

    const onLogout = async () => {
        let user = await logout();
        onChangeCartData([]);
        onChangeWishData([]);
        if (user) {
            router.push('/blog/auth/my-page');
        }
    }

    return (
        <>
            <Wrappers>
                <Title>개인정보 관리</Title>
                <TextFieldContainer>
                    <TextFieldTitle>이름</TextFieldTitle>
                    <TextField
                        disabled
                        name='username'
                        placeholder='홍길동'//{user.nickname}
                        sx={{
                            marginBottom: '1%',
                            backgroundColor: '#F6F6F6'
                        }}
                    />
                    <TextFieldTitle>연락처</TextFieldTitle>
                    <div style={{ display: 'flex' }}>
                        <TextField
                            disabled
                            name='username'
                            placeholder='01012345678'//{user.id}
                            sx={{
                                marginBottom: '1%',
                                backgroundColor: '#F6F6F6',
                                width: '80%',
                                marginRight: '1%'
                            }}
                        />
                        <Button
                            variant='outlined'
                            style={{
                                height: '56px',
                                width: '19%'
                            }}
                            onClick={() => {
                                setButtonText("인증받기")
                            }}
                        >{buttonText}</Button>
                    </div>
                    <TextFieldTitle>이메일</TextFieldTitle>
                    <div style={{ display: 'flex' }}>
                        <TextField
                            name='mailaddress'
                            placeholder='이메일 주소 입력'
                            sx={{
                                marginBottom: '1%',
                                width: '80%',
                                marginRight: '1%'
                            }}
                        />
                        <Button
                            variant='outlined'
                            style={{
                                height: '56px',
                                width: '19%'
                            }}
                            onClick={() => {
                                setButtonText("인증받기")
                            }}
                        >{buttonText}</Button>
                    </div>
                    <TextFieldTitle>기본 배송지</TextFieldTitle>
                    <FormControl sx={{ width: '100%' }}>
                        <InputLabel>배송지를 추가해주세요</InputLabel>
                        <Select
                            label='배송지를 추가해주세요'
                            sx={{
                                width: '100%'
                            }}
                            onChange={(e) => {
                                if (e.target.value) {
                                    if (_.findIndex(selectOptions, { id: e.target.value }) < 0) {
                                        setSelectOptions([...selectOptions, {
                                            id: e.target.value,
                                            count: 1
                                        }])
                                    }
                                }
                            }}
                        >
                        </Select>
                    </FormControl>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                            variant='contained'
                            style={{
                                marginTop: '1rem',
                                height: '56px',
                                width: '19%',
                                whiteSpace: 'nowrap'
                            }}
                        >배송지<br />추가</Button>
                    </div>
                    <TextFieldTitle>마케팅 수신 동의</TextFieldTitle>
                    <div style={{ display: 'flex' }}>
                        <FormControlLabel label={<Typography>SMS</Typography>} control={<Checkbox checked={checkboxObj.check_0} />} onChange={(e) => {
                            setCheckboxObj({ ...checkboxObj, ['check_0']: e.target.checked })
                        }} />
                        <FormControlLabel label={<Typography>E-mail</Typography>} control={<Checkbox checked={checkboxObj.check_1} />} onChange={(e) => {
                            setCheckboxObj({ ...checkboxObj, ['check_1']: e.target.checked })
                        }} />
                    </div>
                    <Button
                        variant='contained'
                        style={{
                            marginTop: '2rem',
                            height: '56px',
                            fontSize: 'large'
                        }}
                        onClick={() => {
                            onLogout()
                        }}
                    >로그아웃</Button>
                    <div style={{
                        display: 'flex',
                        textDecoration: 'underline',
                        color: 'gray',
                        marginTop: '16px'
                    }}>
                        <div
                            style={{ marginRight: '5%', cursor: 'pointer' }}
                            onClick={() => {
                            }}
                        >비밀번호 변경</div>
                        <div
                            style={{ marginRight: '5%', cursor: 'pointer' }}
                            onClick={() => {
                            }}
                        >회원탈퇴</div>
                    </div>
                </TextFieldContainer>
            </Wrappers >
        </>
    )
}

export default Demo5
