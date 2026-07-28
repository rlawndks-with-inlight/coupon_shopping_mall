import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Button, Divider, TextField, InputAdornment, IconButton, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useState, useEffect, Fragment } from 'react';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import Header from 'src/layouts/shop/blog/demo-1/header';
import { Icon } from '@iconify/react';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { apiManager } from 'src/utils/api';
import { postCodeStyle } from 'src/components/elements/styled-components';
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

// 공지사항, faq 등 상세페이지 김인욱
const Demo5 = (props) => {
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
    const [newAddress, setNewAddress] = useState({})
    const [nickname, setNickname] = useState("")
    const [editId, setEditId] = useState(null);
    const [isOpenPost, setIsOpenPost] = useState(false);

    useEffect(() => {
        if (user) {
            loadAddresses();
        }
    }, [user])

    const loadAddresses = async () => {
        let data = await apiManager('user-addresses', 'list', {
            page: 1,
            page_size: 100,
            user_id: user?.id,
        });
        if (data) {
            setAddressList(data?.content ?? []);
        }
    }

    const resetForm = () => {
        setNewAddress({});
        setNickname("");
        setEditId(null);
        setIsOpenPost(false);
    }

    const onClickAdd = () => {
        resetForm();
        setActiveStep(1);
    }

    const onClickEdit = (row) => {
        setNewAddress({
            receiver: row?.receiver ?? '',
            phone: row?.phone ?? '',
            addr: row?.addr ?? '',
            detail_addr: row?.detail_addr ?? '',
            zonecode: row?.zonecode ?? '',
            is_default: !!row?.is_default,
        });
        setNickname(row?.nickname ?? '');
        setEditId(row?.id ?? null);
        setIsOpenPost(false);
        setActiveStep(1);
    }

    const onCompletePost = (data) => {
        setNewAddress({
            ...newAddress,
            zonecode: data?.zonecode,
            addr: data?.roadAddress || data?.address || '',
        });
        setIsOpenPost(false);
    }

    const onSave = async () => {
        if (!newAddress?.receiver) {
            return alert('받는 사람을 입력해주세요.');
        }
        if (!newAddress?.addr) {
            return alert('주소를 검색하여 입력해주세요.');
        }
        let payload = {
            receiver: newAddress?.receiver,
            phone: newAddress?.phone,
            addr: newAddress?.addr,
            detail_addr: newAddress?.detail_addr,
            zonecode: newAddress?.zonecode,
            nickname: nickname,
            is_default: newAddress?.is_default ? true : false,
            user_id: user?.id,
        }
        let result;
        if (editId) {
            result = await apiManager('user-addresses', 'update', { ...payload, id: editId });
        } else {
            result = await apiManager('user-addresses', 'create', payload);
        }
        if (result) {
            resetForm();
            setActiveStep(0);
            loadAddresses();
        }
    }

    const onDelete = async (id) => {
        let result = await apiManager('user-addresses', 'delete', { id: id });
        if (result) {
            loadAddresses();
        }
    }

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
                            onClick={onClickAdd}
                        >배송지 추가하기</Button>
                        <ContentContainer>
                            <>
                                {addressList.length == 0 &&
                                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'grey' }}>등록된 배송지가 없습니다.</div>
                                }
                                {addressList.map((data, idx) => (
                                    <Fragment key={data?.id ?? idx}>
                                        <AddressContainer>
                                            <div>
                                                <span style={{ fontWeight: 'bold' }}>
                                                    {data?.nickname ? `${data?.nickname}(${data?.receiver})` : data?.receiver}
                                                    {data?.is_default &&
                                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: '#1976d2' }}>[기본배송지]</span>
                                                    }
                                                    <br /><br />
                                                </span>
                                                {data?.phone}<br />
                                                {data?.zonecode ? `[${data?.zonecode}] ` : ''}{data?.addr} {data?.detail_addr}
                                            </div>
                                            <AddressButton>
                                                <Button
                                                    variant='outlined'
                                                    style={{
                                                        marginBottom: '1rem'
                                                    }}
                                                    onClick={() => onClickEdit(data)}
                                                >변경</Button>
                                                <Button
                                                    variant='outlined'
                                                    style={{
                                                        marginBottom: '1rem'
                                                    }}
                                                    onClick={() => onDelete(data?.id)}
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
                        <Title>{editId ? '배송지 수정' : '배송지 추가'}</Title>
                        {isOpenPost ?
                            <DaumPostcode style={postCodeStyle} onComplete={onCompletePost} />
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
                                        name='zipcode'
                                        placeholder='우편번호 검색하여 입력'
                                        value={newAddress?.zonecode ?? ''}
                                        aria-readonly='true'
                                        sx={{
                                            width: '72%',
                                            marginRight: '1%'
                                        }}
                                        onClick={() => { setIsOpenPost(true) }}
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
                                            setIsOpenPost(true)
                                        }}
                                    >주소찾기</Button>
                                </TextFieldBox>
                                <TextField
                                    name='address'
                                    placeholder='주소'
                                    value={newAddress?.addr ?? ''}
                                    aria-readonly='true'
                                    sx={{
                                        marginBottom: '1%'
                                    }}
                                    onClick={() => { setIsOpenPost(true) }}
                                />
                                <TextField
                                    name='detail'
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
                                    name='phone_num'
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
                                    control={<Checkbox checked={!!newAddress?.is_default} onChange={(e) => {
                                        setNewAddress({ ...newAddress, is_default: e.target.checked })
                                    }} />} />
                                <Button variant='contained' style={{ height: '56px', fontSize: 'large', marginTop: '1rem' }} onClick={onSave}>완료</Button>
                            </>
                        }
                    </>
                }
            </Wrappers>
        </>
    )
}
export default Demo5
