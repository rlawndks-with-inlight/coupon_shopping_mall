import { Title } from 'src/components/elements/blog/demo-1';
import { Checkbox, TextField, Button, FormControl, InputLabel, Select, MenuItem, FormControlLabel, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Stack } from '@mui/material';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { useState, useEffect } from 'react';
import styled from 'styled-components'
import { useSettingsContext } from 'src/components/settings';
import { apiManager } from 'src/utils/api';
import toast from 'react-hot-toast';
import DialogAddAddress from 'src/components/dialog/DialogAddAddress';

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

const Demo4 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { onChangeCartData, onChangeWishData } = useSettingsContext();
    const { user, logout } = useAuthContext();
    const [userObj, setUserObj] = useState({});
    const [isEditContact, setIsEditContact] = useState(false);
    const [checkboxObj, setCheckboxObj] = useState({
        check_0: false,
        check_1: false,
    })
    // 실 배송지 목록 (apiManager user-addresses)
    const [addressList, setAddressList] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [addAddressOpen, setAddAddressOpen] = useState(false);
    // 비밀번호 변경 / 회원탈퇴 다이얼로그
    const [pwOpen, setPwOpen] = useState(false);
    const [pwObj, setPwObj] = useState({});
    const [resignOpen, setResignOpen] = useState(false);
    const [resignPassword, setResignPassword] = useState('');

    useEffect(() => {
        if (user) {
            setUserObj({ ...user });
            onLoadAddresses();
        }
    }, [user])

    const onLoadAddresses = async () => {
        let data = await apiManager('user-addresses', 'list', {
            page: 1,
            page_size: 100,
            search: '',
            user_id: user?.id,
        })
        if (data?.content) {
            setAddressList(data.content);
            let def = data.content.find((item) => item.is_default);
            if (def) {
                setSelectedAddressId(def.id);
            }
        }
    }

    const onChangeUserInfo = async () => {
        let result = await apiManager('auth/change-info', 'update', {
            nickname: userObj?.nickname,
            phone_num: userObj?.phone_num,
        })
        if (result) {
            toast.success('성공적으로 변경되었습니다.');
            setIsEditContact(false);
        }
    }

    const onAddAddress = async (address_obj) => {
        let result = await apiManager('user-addresses', (address_obj?.id > 0 ? 'update' : 'create'), {
            ...address_obj,
            user_id: user?.id,
        })
        if (result) {
            setAddAddressOpen(false);
            onLoadAddresses();
        }
    }

    const onChangePassword = async () => {
        if (!pwObj?.password) {
            return toast.error('현재비밀번호를 입력해주세요.');
        }
        if (!pwObj?.new_password) {
            return toast.error('새비밀번호를 입력해주세요.');
        }
        if (pwObj.new_password != pwObj.new_password_check) {
            return toast.error('비밀번호가 일치하지 않습니다.');
        }
        let result = await apiManager('auth/change-password', 'update', {
            password: pwObj.password,
            new_password: pwObj.new_password,
        })
        if (result) {
            toast.success('성공적으로 비밀번호가 변경되었습니다.');
            setPwObj({});
            setPwOpen(false);
        }
    }

    const onResign = async () => {
        if (!resignPassword) {
            return toast.error('비밀번호를 입력해주세요.');
        }
        let result = await apiManager('auth/resign', 'update', {
            password: resignPassword,
        })
        if (result) {
            toast.success('회원탈퇴가 완료되었습니다.');
            setResignPassword('');
            setResignOpen(false);
            onChangeCartData([]);
            onChangeWishData([]);
            await logout();
            router.push('/shop/auth/login');
        }
    }

    const onLogout = async () => {
        let user = await logout();
        onChangeCartData([]);
        onChangeWishData([]);
        if (user) {
            router.push('/shop/auth/my-page');
        }
    }

    return (
        <>
            <DialogAddAddress
                addAddressOpen={addAddressOpen}
                setAddAddressOpen={setAddAddressOpen}
                onAddAddress={onAddAddress}
            />
            <Dialog open={pwOpen} onClose={() => { setPwOpen(false); setPwObj({}); }}>
                <DialogTitle>비밀번호 변경</DialogTitle>
                <DialogContent>
                    <DialogContentText>현재 비밀번호와 새 비밀번호를 입력해주세요.</DialogContentText>
                    <Stack spacing={2} sx={{ marginTop: '1rem', minWidth: '280px' }}>
                        <TextField
                            label='현재비밀번호'
                            type='password'
                            value={pwObj?.password ?? ''}
                            onChange={(e) => { setPwObj({ ...pwObj, password: e.target.value }) }}
                        />
                        <TextField
                            label='새비밀번호'
                            type='password'
                            value={pwObj?.new_password ?? ''}
                            onChange={(e) => { setPwObj({ ...pwObj, new_password: e.target.value }) }}
                        />
                        <TextField
                            label='새비밀번호확인'
                            type='password'
                            value={pwObj?.new_password_check ?? ''}
                            onChange={(e) => { setPwObj({ ...pwObj, new_password_check: e.target.value }) }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' onClick={onChangePassword}>변경</Button>
                    <Button color='inherit' onClick={() => { setPwOpen(false); setPwObj({}); }}>취소</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={resignOpen} onClose={() => { setResignOpen(false); setResignPassword(''); }}>
                <DialogTitle>회원탈퇴</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        회원 탈퇴를 하시면 회원 혜택을 더 이상 이용하실 수 없습니다.<br />
                        정말 탈퇴하시려면 비밀번호를 입력해주세요.
                    </DialogContentText>
                    <Stack spacing={2} sx={{ marginTop: '1rem', minWidth: '280px' }}>
                        <TextField
                            label='비밀번호'
                            type='password'
                            value={resignPassword}
                            onChange={(e) => { setResignPassword(e.target.value) }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' color='error' onClick={onResign}>탈퇴하기</Button>
                    <Button color='inherit' onClick={() => { setResignOpen(false); setResignPassword(''); }}>취소</Button>
                </DialogActions>
            </Dialog>
            <Wrappers>
                <Title>개인정보 관리</Title>
                <TextFieldContainer>
                    <TextFieldTitle>이름</TextFieldTitle>
                    <TextField
                        disabled
                        name='username'
                        value={userObj?.name ?? ''}
                        placeholder='홍길동'
                        sx={{
                            marginBottom: '1%',
                            backgroundColor: '#F6F6F6'
                        }}
                    />
                    <TextFieldTitle>연락처</TextFieldTitle>
                    <div style={{ display: 'flex' }}>
                        <TextField
                            disabled={!isEditContact}
                            name='phone_num'
                            value={userObj?.phone_num ?? ''}
                            placeholder='01012345678'
                            onChange={(e) => {
                                setUserObj({ ...userObj, phone_num: e.target.value })
                            }}
                            sx={{
                                marginBottom: '1%',
                                backgroundColor: isEditContact ? 'inherit' : '#F6F6F6',
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
                                if (isEditContact) {
                                    onChangeUserInfo()
                                } else {
                                    setIsEditContact(true)
                                }
                            }}
                        >{isEditContact ? '저장' : '변경'}</Button>
                    </div>
                    <TextFieldTitle>기본 배송지</TextFieldTitle>
                    <FormControl sx={{ width: '100%' }}>
                        <InputLabel>{addressList.length > 0 ? '기본 배송지를 선택해주세요' : '배송지를 추가해주세요'}</InputLabel>
                        <Select
                            label={addressList.length > 0 ? '기본 배송지를 선택해주세요' : '배송지를 추가해주세요'}
                            value={selectedAddressId}
                            sx={{
                                width: '100%'
                            }}
                            onChange={async (e) => {
                                let id = e.target.value
                                setSelectedAddressId(id)
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
                                <MenuItem key={item.id} value={item.id}>
                                    {`${item.receiver ? item.receiver + ' | ' : ''}${item.addr ?? ''} ${item.detail_addr ?? ''}`}
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
                                setAddAddressOpen(true)
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
                                setPwOpen(true)
                            }}
                        >비밀번호 변경</div>
                        <div
                            style={{ marginRight: '5%', cursor: 'pointer' }}
                            onClick={() => {
                                setResignOpen(true)
                            }}
                        >회원탈퇴</div>
                    </div>
                </TextFieldContainer>
            </Wrappers >
        </>
    )
}

export default Demo4
