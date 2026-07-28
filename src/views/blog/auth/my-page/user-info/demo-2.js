import { Title } from 'src/components/elements/blog/demo-1';
import { Checkbox, TextField, Button, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Typography } from '@mui/material';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useState, useEffect } from 'react';
import styled from 'styled-components'
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';
import toast from 'react-hot-toast';

// 공지사항, faq 등 상세페이지 김인욱
const Wrappers = styled.div`
max-width:720px;
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

const Demo2 = (props) => {
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
    const [userObj, setUserObj] = useState({})
    const [addressList, setAddressList] = useState([])
    const [selectedAddress, setSelectedAddress] = useState('')
    const [checkboxObj, setCheckboxObj] = useState({
        check_0: false,
        check_1: false,
    })

    useEffect(() => {
        if (user) {
            setUserObj({ ...user });
            onLoadAddresses();
        }
    }, [user])

    const onLoadAddresses = async () => {
        if (!user?.id) {
            return;
        }
        let data = await apiManager('user-addresses', 'list', {
            page: 1,
            page_size: 100,
            user_id: user?.id,
        })
        if (data?.content) {
            setAddressList(data?.content ?? []);
        }
    }

    const onLogout = async () => {
        let result = await logout();
        onChangeCartData([]);
        onChangeWishData([]);
        if (result) {
            router.push('/blog/auth/my-page');
        }
    }

    const onChangeUserInfo = async () => {
        let result = await apiManager('auth/change-info', 'update', {
            nickname: userObj?.nickname,
            phone_num: userObj?.phone_num,
            email: userObj?.email,
        })
        if (result) {
            toast.success('성공적으로 변경되었습니다.');
        }
    }

    const onMoveChangePassword = () => {
        // 블로그 테마에는 로그인 상태 비밀번호 변경 전용 페이지가 없어
        // auth/change-password 를 처리하는 계정 정보 페이지로 이동한다.
        router.push('/blog/auth/find-info');
    }

    const onResign = () => {
        if (window.confirm('정말 회원탈퇴를 진행하시겠습니까?\n탈퇴 후에는 계정 복구가 불가능합니다.')) {
            toast('회원탈퇴는 본인 확인 절차가 필요합니다. 고객센터로 문의해 주세요.');
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
                        name='name'
                        placeholder='홍길동'
                        value={userObj?.name ?? ''}
                        sx={{
                            marginBottom: '1%',
                            backgroundColor: '#F6F6F6'
                        }}
                    />
                    <TextFieldTitle>연락처</TextFieldTitle>
                    <div style={{ display: 'flex' }}>
                        <TextField
                            disabled
                            name='phone_num'
                            placeholder='01012345678'
                            value={userObj?.phone_num ?? ''}
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
                            name='email'
                            placeholder='이메일 주소 입력'
                            value={userObj?.email ?? ''}
                            onChange={(e) => {
                                setUserObj({ ...userObj, ['email']: e.target.value })
                            }}
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
                        <InputLabel>{addressList.length > 0 ? '기본 배송지를 선택해주세요' : '배송지를 추가해주세요'}</InputLabel>
                        <Select
                            label={addressList.length > 0 ? '기본 배송지를 선택해주세요' : '배송지를 추가해주세요'}
                            value={selectedAddress}
                            sx={{
                                width: '100%'
                            }}
                            onChange={(e) => {
                                setSelectedAddress(e.target.value);
                            }}
                        >
                            {addressList.map((address) => (
                                <MenuItem key={address?.id} value={address?.id}>
                                    {address?.addr} {address?.detail_addr}
                                </MenuItem>
                            ))}
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
                            onClick={() => {
                                router.push('/blog/auth/my-page/address');
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
                            onChangeUserInfo()
                        }}
                    >변경사항 저장</Button>
                    <Button
                        variant='outlined'
                        style={{
                            marginTop: '1rem',
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
                                onMoveChangePassword()
                            }}
                        >비밀번호 변경</div>
                        <div
                            style={{ marginRight: '5%', cursor: 'pointer' }}
                            onClick={() => {
                                onResign()
                            }}
                        >회원탈퇴</div>
                    </div>
                </TextFieldContainer>
            </Wrappers >
        </>
    )
}

export default Demo2
