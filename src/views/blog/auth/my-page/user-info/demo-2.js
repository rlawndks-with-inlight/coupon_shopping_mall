import { Title } from 'src/components/elements/blog/demo-1';
import { Checkbox, TextField, Button, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Typography } from '@mui/material';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useState, useEffect } from 'react';
import styled from 'styled-components'
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';
import toast from 'react-hot-toast';
import { useLocales } from 'src/locales';

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
  const { translate } = useLocales();
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
    const [selectedAddress, setSelectedAddress] = useState('')
    const [checkboxObj, setCheckboxObj] = useState({
        check_0: false,
        check_1: false,
    })
    // 비밀번호 변경 인라인 섹션 토글
    const [authMode, setAuthMode] = useState(null)

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
            router.push('/shop/auth/my-page');
        }
    }

    const onChangeUserInfo = async () => {
        let result = await apiManager('auth/change-info', 'update', {
            nickname: userObj?.nickname,
            phone_num: userObj?.phone_num,
        })
        if (result) {
            toast.success(translate('성공적으로 변경되었습니다.'));
        }
    }

    const onChangePassword = async () => {
        if (!userObj?.password) {
            return toast.error('현재비밀번호를 입력해주세요.');
        }
        if (!userObj?.new_password) {
            return toast.error('새비밀번호를 입력해주세요.');
        }
        if (userObj.new_password != userObj.new_password_check) {
            return toast.error(translate('비밀번호가 일치하지 않습니다.'));
        }
        let result = await apiManager('auth/change-password', 'update', {
            password: userObj.password,
            new_password: userObj.new_password,
        });
        if (result) {
            toast.success(translate('성공적으로 비밀번호가 변경되었습니다.'));
            setAuthMode(null);
            setUserObj({ ...userObj, password: '', new_password: '', new_password_check: '' });
        }
    }

    const onResign = () => {
        if (window.confirm('정말 회원탈퇴를 진행하시겠습니까?\n탈퇴 후에는 계정 복구가 불가능합니다.')) {
            toast('회원탈퇴는 본인 확인 절차가 필요합니다. 고객센터로 문의해 주세요.');
        }
    }

    return (
        <>
            <Wrappers>
                <Title>{translate('개인정보 관리')}</Title>
                <TextFieldContainer>
                    <TextFieldTitle>{translate('이름')}</TextFieldTitle>
                    <TextField
                        disabled
                        name='name'
                        placeholder={translate('홍길동')}
                        value={userObj?.name ?? ''}
                        sx={{
                            marginBottom: '1%',
                            backgroundColor: '#F6F6F6'
                        }}
                    />
                    <TextFieldTitle>{translate('연락처')}</TextFieldTitle>
                    <div style={{ display: 'flex' }}>
                        <TextField
                            disabled
                            name='phone_num'
                            placeholder='01012345678'
                            value={userObj?.phone_num ?? ''}
                            sx={{
                                marginBottom: '1%',
                                backgroundColor: '#F6F6F6',
                                width: '100%'
                            }}
                        />
                    </div>
                    <TextFieldTitle>{translate('기본 배송지')}</TextFieldTitle>
                    <FormControl sx={{ width: '100%' }}>
                        <InputLabel>{addressList.length > 0 ? translate('기본 배송지를 선택해주세요') : '배송지를 추가해주세요'}</InputLabel>
                        <Select
                            label={addressList.length > 0 ? translate('기본 배송지를 선택해주세요') : '배송지를 추가해주세요'}
                            value={selectedAddress}
                            sx={{
                                width: '100%'
                            }}
                            onChange={async (e) => {
                                let id = e.target.value;
                                setSelectedAddress(id);
                                let result = await apiManager('user-addresses', 'update', {
                                    id,
                                    is_default: 1,
                                });
                                if (result) {
                                    toast.success('기본 배송지로 설정되었습니다.');
                                }
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
                                router.push('/shop/auth/delivery-address');
                            }}
                        >{translate('배송지')}<br />{translate('추가')}</Button>
                    </div>
                    <TextFieldTitle>{translate('마케팅 수신 동의')}</TextFieldTitle>
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
                    >{translate('변경사항 저장')}</Button>
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
                    >{translate('로그아웃')}</Button>
                    <div style={{
                        display: 'flex',
                        textDecoration: 'underline',
                        color: 'gray',
                        marginTop: '16px'
                    }}>
                        <div
                            style={{ marginRight: '5%', cursor: 'pointer' }}
                            onClick={() => {
                                setAuthMode(authMode === 'password' ? null : 'password')
                            }}
                        >{translate('비밀번호 변경')}</div>
                        <div
                            style={{ marginRight: '5%', cursor: 'pointer' }}
                            onClick={() => {
                                onResign()
                            }}
                        >{translate('회원탈퇴')}</div>
                    </div>
                    {authMode === 'password' &&
                        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
                            <TextField
                                type='password'
                                name='password'
                                placeholder={translate('현재 비밀번호')}
                                value={userObj?.password ?? ''}
                                onChange={(e) => {
                                    setUserObj({ ...userObj, password: e.target.value })
                                }}
                                sx={{ marginBottom: '1%' }}
                            />
                            <TextField
                                type='password'
                                name='new_password'
                                placeholder={translate('새 비밀번호')}
                                value={userObj?.new_password ?? ''}
                                onChange={(e) => {
                                    setUserObj({ ...userObj, new_password: e.target.value })
                                }}
                                sx={{ marginBottom: '1%' }}
                            />
                            <TextField
                                type='password'
                                name='new_password_check'
                                placeholder={translate('새 비밀번호 확인')}
                                value={userObj?.new_password_check ?? ''}
                                onChange={(e) => {
                                    setUserObj({ ...userObj, new_password_check: e.target.value })
                                }}
                                sx={{ marginBottom: '1%' }}
                            />
                            <Button
                                variant='contained'
                                style={{ height: '56px', marginTop: '1rem' }}
                                onClick={() => {
                                    onChangePassword()
                                }}
                            >{translate('비밀번호 변경')}</Button>
                        </div>
                    }
                </TextFieldContainer>
            </Wrappers >
        </>
    )
}

export default Demo2
