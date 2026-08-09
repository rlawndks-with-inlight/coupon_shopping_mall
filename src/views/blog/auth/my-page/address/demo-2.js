import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Button, Divider, TextField, InputAdornment, IconButton, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useState, useEffect, Fragment } from 'react';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import { Icon } from '@iconify/react';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { apiManager } from 'src/utils/api';
import DaumPostcode from 'react-daum-postcode';

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

const DEFAULT_ADDRESS = {
    receiver: '',
    zonecode: '',
    addr: '',
    detail_addr: '',
    phone: '',
    is_default: false,
}

// 공지사항, faq 등 상세페이지 김인욱
const Demo2 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themeMode } = useSettingsContext();
    const { user } = useAuthContext();
    const [activeStep, setActiveStep] = useState(0);
    const [addressList, setAddressList] = useState([]);
    const [newAddress, setNewAddress] = useState({ ...DEFAULT_ADDRESS });
    const [nickname, setNickname] = useState("");
    const [isOpenPost, setIsOpenPost] = useState(false);

    useEffect(() => {
        if (user) {
            loadAddressList();
        }
    }, [user])

    const loadAddressList = async () => {
        let data = await apiManager('user-addresses', 'list', {
            page: 1,
            page_size: 100,
            user_id: user?.id,
        })
        if (data) {
            setAddressList(data?.content ?? []);
        }
    }

    const onClickAddAddress = () => {
        setNewAddress({ ...DEFAULT_ADDRESS });
        setNickname("");
        setIsOpenPost(false);
        setActiveStep(1);
    }

    const onClickEditAddress = (data) => {
        setNewAddress({
            id: data?.id,
            receiver: data?.receiver ?? '',
            zonecode: data?.zonecode ?? '',
            addr: data?.addr ?? '',
            detail_addr: data?.detail_addr ?? '',
            phone: data?.phone ?? '',
            is_default: data?.is_default ?? false,
        });
        setNickname(data?.address_type ?? "");
        setIsOpenPost(false);
        setActiveStep(1);
    }

    const onDeleteAddress = async (id) => {
        let result = await apiManager('user-addresses', 'delete', {
            id: id,
        })
        if (result) {
            loadAddressList();
        }
    }

    const onCompletePost = (data) => {
        setNewAddress({
            ...newAddress,
            zonecode: data?.zonecode,
            addr: data?.roadAddress || data?.address || '',
        })
        setIsOpenPost(false);
    }

    const onSubmitAddress = async () => {
        let is_update = newAddress?.id > 0;
        let result = await apiManager('user-addresses', is_update ? 'update' : 'create', {
            ...newAddress,
            address_type: nickname,
            user_id: user?.id,
        })
        if (result) {
            setNewAddress({ ...DEFAULT_ADDRESS });
            setNickname("");
            setActiveStep(0);
            loadAddressList();
        }
    }

    return (
        <>
            {/* 헤더를 여기서 다시 그리지 않는다 — 페이지에 ShopLayout(블로그형 레이아웃 헤더)이
                이미 씌워져 있어 프레임4~11 에서 헤더가 두 개 겹쳐 보였다. */}
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
                            onClick={onClickAddAddress}
                        >배송지 추가하기</Button>
                        <ContentContainer>
                            <>
                                {/* 목록 0건일 때 아무것도 안 나오던 문제 대응 (demo-4/5 와 동일 문구) */}
                                {addressList.length == 0 &&
                                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'grey' }}>등록된 배송지가 없습니다.</div>
                                }
                                {addressList.map((data, idx) => (
                                    <Fragment key={data?.id ?? idx}>
                                        <AddressContainer>
                                            <div>
                                                <span style={{ fontWeight: 'bold' }}>
                                                    {data?.receiver}{data?.is_default ? ' (기본 배송지)' : ''}<br /><br />
                                                </span>
                                                {data?.phone}<br />
                                                [{data?.zonecode}] {data?.addr} {data?.detail_addr}
                                            </div>
                                            <AddressButton>
                                                <Button
                                                    variant='outlined'
                                                    style={{
                                                        marginBottom: '1rem'
                                                    }}
                                                    onClick={() => onClickEditAddress(data)}
                                                >변경</Button>
                                                <Button
                                                    variant='outlined'
                                                    style={{
                                                        marginBottom: '1rem'
                                                    }}
                                                    onClick={() => onDeleteAddress(data?.id)}
                                                >삭제</Button>
                                            </AddressButton>
                                        </AddressContainer>
                                        <Divider style={{ marginBottom: '1rem' }} />
                                    </Fragment>
                                ))}
                            </>
                        </ContentContainer>
                    </>
                }
                {activeStep == 1 &&
                    <>
                        <Title>배송지 {newAddress?.id > 0 ? '수정' : '추가'}</Title>
                        {isOpenPost ?
                            <>
                                <DaumPostcode
                                    style={{ width: '100%', height: '450px' }}
                                    onComplete={onCompletePost}
                                />
                                <Button
                                    variant='outlined'
                                    style={{ height: '56px', marginTop: '1rem' }}
                                    onClick={() => { setIsOpenPost(false) }}
                                >닫기</Button>
                            </>
                            :
                            <>
                                <TextFieldTitle>받는 사람</TextFieldTitle>
                                <TextField
                                    name='receiver'
                                    placeholder='받는 사람'
                                    value={newAddress?.receiver ?? ''}
                                    sx={{
                                        marginBottom: '1%'
                                    }}
                                    onChange={(e) => {
                                        setNewAddress({ ...newAddress, receiver: e.target.value })
                                    }}
                                />
                                <TextFieldTitle>배송지</TextFieldTitle>
                                <TextFieldBox>
                                    <TextField
                                        name='zonecode'
                                        placeholder='우편번호 검색하여 입력'
                                        value={newAddress?.zonecode ?? ''}
                                        InputProps={{ readOnly: true }}
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
                                        onClick={() => { setIsOpenPost(true) }}
                                    >주소찾기</Button>
                                </TextFieldBox>
                                <TextField
                                    name='addr'
                                    placeholder='주소'
                                    value={newAddress?.addr ?? ''}
                                    InputProps={{ readOnly: true }}
                                    sx={{
                                        marginBottom: '1%'
                                    }}
                                />
                                <TextField
                                    name='detail_addr'
                                    placeholder='상세주소를 입력해주세요'
                                    value={newAddress?.detail_addr ?? ''}
                                    sx={{
                                        marginBottom: '1%'
                                    }}
                                    onChange={(e) => {
                                        setNewAddress({ ...newAddress, detail_addr: e.target.value })
                                    }}
                                />
                                <TextFieldTitle>연락처</TextFieldTitle>
                                <TextField
                                    name='phone'
                                    placeholder='휴대폰번호'
                                    value={newAddress?.phone ?? ''}
                                    sx={{
                                        marginBottom: '1%'
                                    }}
                                    onChange={(e) => {
                                        setNewAddress({ ...newAddress, phone: e.target.value })
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
                                    onChange={(e) => { setNickname(e.target.value) }}
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
                                <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNickname('집') }}>집</Button>
                                    <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNickname('회사') }}>회사</Button>
                                    <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNickname('학교') }}>학교</Button>
                                    <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNickname('친구') }}>친구</Button>
                                    <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNickname('가족') }}>가족</Button>
                                </div>
                                <FormControlLabel
                                    label={<Typography style={{ display: 'flex' }}>기본 배송지</Typography>}
                                    control={<Checkbox checked={newAddress?.is_default ?? false} onChange={(e) => {
                                        setNewAddress({ ...newAddress, is_default: e.target.checked })
                                    }} />} />
                                <Button
                                    variant='contained'
                                    style={{ height: '56px', fontSize: 'large', marginTop: '1rem' }}
                                    onClick={onSubmitAddress}
                                >완료</Button>
                                {/* 목록으로 — 예전엔 '돌아가기'가 본문 안의 헤더 뒤로가기 화살표뿐이었다.
                                    그 헤더를 걷어내면서(레이아웃 헤더와 2중이었다) 여기로 옮긴다. */}
                                <Button
                                    variant='outlined'
                                    style={{ height: '56px', fontSize: 'large', marginTop: '0.5rem' }}
                                    onClick={() => setActiveStep(0)}
                                >취소</Button>
                            </>
                        }
                    </>
                }
            </Wrappers>
        </>
    )
}
export default Demo2
