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
    const [userObj, setUserObj] = useState({})
    const [addressList, setAddressList] = useState([])
    const [defaultAddressId, setDefaultAddressId] = useState('')
    const [checkboxObj, setCheckboxObj] = useState({
        check_0: false,
        check_1: false,
    })

    useEffect(() => {
        if (user) {
            setUserObj({ ...user });
            getAddressList();
        }
    }, [user])

    const getAddressList = async () => {
        let data = await apiManager('user-addresses', 'list', {
            page: 1,
            page_size: 100,
            user_id: user?.id,
        });
        if (data) {
            setAddressList(data?.content ?? []);
        }
    }

    const onLogout = async () => {
        let user = await logout();
        onChangeCartData([]);
        onChangeWishData([]);
        if (user) {
            router.push('/blog/auth/my-page');
        }
    }

    const onChangeUserInfo = async () => {
        let result = await apiManager('auth/change-info', 'update', {
            nickname: userObj?.nickname,
            phone_num: userObj?.phone_num,
        })
        if (result) {
            toast.success('성공적으로 변경되었습니다.');
        }
    }

    const onChangePassword = async () => {
        let password = window.prompt('현재 비밀번호를 입력해주세요.');
        if (!password) {
            return;
        }
        let new_password = window.prompt('새 비밀번호를 입력해주세요.');
        if (!new_password) {
            return;
        }
        let new_password_check = window.prompt('새 비밀번호를 다시 입력해주세요.');
        if (new_password != new_password_check) {
            return toast.error('비밀번호가 일치하지 않습니다.');
        }
        let result = await apiManager('auth/change-password', 'update', {
            password,
            new_password,
        })
        if (result) {
            toast.success('성공적으로 비밀번호가 변경되었습니다.');
        }
    }

    const onResign = async () => {
        if (!window.confirm('정말 회원탈퇴 하시겠습니까?')) {
            return;
        }
        let password = window.prompt('본인 확인을 위해 비밀번호를 입력해주세요.');
        if (!password) {
            return;
        }
        let result = await apiManager('auth/resign', 'update', { password });
        if (result) {
            toast.success('회원탈퇴가 완료되었습니다.');
            onChangeCartData([]);
            onChangeWishData([]);
            await logout();
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
                        name='name'
                        placeholder='이름'
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
                            placeholder='연락처'
                            value={userObj?.phone_num ?? ''}
                            sx={{
                                marginBottom: '1%',
                                backgroundColor: '#F6F6F6',
                                width: '100%'
                            }}
                        />
                    </div>
                    <TextFieldTitle>기본 배송지</TextFieldTitle>
                    <FormControl sx={{ width: '100%' }}>
                        <InputLabel>{addressList.length > 0 ? '기본 배송지 선택' : '배송지를 추가해주세요'}</InputLabel>
                        <Select
                            label={addressList.length > 0 ? '기본 배송지 선택' : '배송지를 추가해주세요'}
                            value={defaultAddressId}
                            sx={{
                                width: '100%'
                            }}
                            onChange={async (e) => {
                                let id = e.target.value
                                setDefaultAddressId(id)
                                let result = await apiManager('user-addresses', 'update', {
                                    id,
                                    is_default: 1,
                                })
                                if (result) {
                                    toast.success('기본 배송지로 설정되었습니다.')
                                }
                            }}
                        >
                            {addressList.map((item) => (
                                <MenuItem key={item?.id} value={item?.id}>
                                    {`${item?.addr ?? ''} ${item?.detail_addr ?? ''}`.trim()}
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
                                router.push('/blog/auth/my-page/address')
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
                        variant='contained'
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
                                onChangePassword()
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

export default Demo5
