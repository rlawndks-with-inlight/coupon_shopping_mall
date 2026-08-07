import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Button, Divider, TextField, InputAdornment, IconButton, Checkbox, FormControlLabel, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import _ from 'lodash';
import Header from 'src/layouts/shop/blog/demo-1/header';
import { Icon } from '@iconify/react';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { apiManager } from 'src/utils/api';
import DaumPostcode from 'react-daum-postcode';
import { postCodeStyle } from 'src/components/elements/styled-components';

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
    address_type: '',
    is_default: false,
    is_open_daum_post: false,
}

// 공지사항, faq 등 상세페이지 김인욱
const Demo1 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { user } = useAuthContext();
    const { themeMode } = useSettingsContext();
    const [activeStep, setActiveStep] = useState(0);
    const [addressContent, setAddressContent] = useState({});
    const [newAddress, setNewAddress] = useState({ ...DEFAULT_ADDRESS });
    const [editId, setEditId] = useState(undefined);
    const [searchObj, setSearchObj] = useState({
        page: 1,
        page_size: 100,
        user_id: user?.id,
    })

    useEffect(() => {
        if (user) {
            onChangePage({ ...searchObj, user_id: user?.id });
        }
    }, [user])

    const onChangePage = async (search_obj) => {
        setSearchObj(search_obj);
        setAddressContent((prev) => ({ ...prev, content: undefined }));
        let data = await apiManager('user-addresses', 'list', search_obj);
        if (data) {
            setAddressContent(data);
        }
    }

    const onAddAddress = async () => {
        const payload = {
            receiver: newAddress.receiver,
            zonecode: newAddress.zonecode,
            addr: newAddress.addr,
            detail_addr: newAddress.detail_addr,
            phone: newAddress.phone,
            address_type: newAddress.address_type,
            is_default: newAddress.is_default,
            user_id: user?.id,
        }
        let result;
        if (editId) {
            result = await apiManager('user-addresses', 'update', { ...payload, id: editId });
        } else {
            result = await apiManager('user-addresses', 'create', payload);
        }
        if (result) {
            setNewAddress({ ...DEFAULT_ADDRESS });
            setEditId(undefined);
            setActiveStep(0);
            onChangePage({ ...searchObj, user_id: user?.id });
        }
    }

    const onDeleteAddress = async (id) => {
        let result = await apiManager('user-addresses', 'delete', { id: id });
        if (result) {
            onChangePage({ ...searchObj, user_id: user?.id });
        }
    }

    const onClickAdd = () => {
        setNewAddress({ ...DEFAULT_ADDRESS });
        setEditId(undefined);
        setActiveStep(1);
    }

    const onClickEdit = (data) => {
        setNewAddress({
            receiver: data?.receiver ?? '',
            zonecode: data?.zonecode ?? '',
            addr: data?.addr ?? '',
            detail_addr: data?.detail_addr ?? '',
            phone: data?.phone ?? '',
            address_type: data?.address_type ?? '',
            is_default: data?.is_default ?? false,
            is_open_daum_post: false,
        });
        setEditId(data?.id);
        setActiveStep(1);
    }

    const onSelectAddress = (data) => {
        setNewAddress((prev) => ({
            ...prev,
            zonecode: data?.zonecode ?? '',
            addr: data?.roadAddress || data?.address || '',
            is_open_daum_post: false,
        }));
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
                                {/* 목록 0건일 때 아무것도 안 나오던 문제 대응 (demo-4/5 와 동일 문구).
                                    로딩 중에는 content 가 undefined 라 이 조건이 걸리지 않아 깜빡임이 없다. */}
                                {addressContent?.content?.length == 0 &&
                                    <div style={{ textAlign: 'center', padding: '2rem 0', color: 'grey' }}>등록된 배송지가 없습니다.</div>
                                }
                                {addressContent?.content && addressContent?.content.map((data, idx) => (
                                    <div key={data?.id ?? idx}>
                                        <AddressContainer>
                                            <div>
                                                <span style={{ fontWeight: 'bold' }}>
                                                    {data?.address_type}({data?.receiver})
                                                    {data?.is_default && <span style={{ marginLeft: '0.5rem', color: '#1976d2', fontWeight: 'normal', fontSize: '0.85rem' }}>[기본배송지]</span>}
                                                    <br /><br />
                                                </span>
                                                {data?.phone}<br />
                                                ({data?.zonecode}) {data?.addr} {data?.detail_addr}
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
                                                    onClick={() => onDeleteAddress(data?.id)}
                                                >삭제</Button>
                                            </AddressButton>
                                        </AddressContainer>
                                        <Divider style={{ marginBottom: '1rem' }} />
                                    </div>
                                ))}
                            </>
                        </ContentContainer>
                    </>
                }
                {activeStep == 1 &&
                    <>
                        <Title>{editId ? '배송지 수정' : '배송지 추가'}</Title>
                        {newAddress.is_open_daum_post ?
                            <DaumPostcode style={postCodeStyle} onComplete={onSelectAddress} />
                            :
                            <>
                                <TextFieldTitle>받는 사람</TextFieldTitle>
                                <TextField
                                    name='receiver'
                                    placeholder='받는 사람'
                                    value={newAddress.receiver}
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
                                        value={newAddress.zonecode}
                                        sx={{
                                            width: '72%',
                                            marginRight: '1%'
                                        }}
                                        InputProps={{ readOnly: true }}
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
                                            setNewAddress({ ...newAddress, is_open_daum_post: true })
                                        }}
                                    >주소찾기</Button>
                                </TextFieldBox>
                                <TextField
                                    name='addr'
                                    placeholder='주소'
                                    value={newAddress.addr}
                                    sx={{
                                        marginBottom: '1%'
                                    }}
                                    InputProps={{ readOnly: true }}
                                    onClick={() => {
                                        setNewAddress({ ...newAddress, is_open_daum_post: true })
                                    }}
                                />
                                <TextField
                                    name='detail_addr'
                                    placeholder='상세주소를 입력해주세요'
                                    value={newAddress.detail_addr}
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
                                    value={newAddress.phone}
                                    sx={{
                                        marginBottom: '1%'
                                    }}
                                    onChange={(e) => {
                                        setNewAddress({ ...newAddress, phone: e.target.value })
                                    }}
                                />
                                <TextFieldTitle>배송지명</TextFieldTitle>
                                <TextField
                                    name='address_type'
                                    placeholder='배송지명 입력 또는 선택'
                                    value={newAddress.address_type}
                                    sx={{
                                        marginBottom: '1%'
                                    }}
                                    onChange={(e) => {
                                        setNewAddress({ ...newAddress, address_type: e.target.value })
                                    }}
                                    InputProps={newAddress.address_type == "" ? false : {
                                        endAdornment: (
                                            <InputAdornment position='end'>
                                                <IconButton>
                                                    <Icon icon='ic:round-close' color='black' style={{ height: '20px', width: '20px' }} onClick={() => { setNewAddress({ ...newAddress, address_type: '' }) }} />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }}
                                />
                                <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                    <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNewAddress({ ...newAddress, address_type: '집' }) }}>집</Button>
                                    <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNewAddress({ ...newAddress, address_type: '회사' }) }}>회사</Button>
                                    <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNewAddress({ ...newAddress, address_type: '학교' }) }}>학교</Button>
                                    <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNewAddress({ ...newAddress, address_type: '친구' }) }}>친구</Button>
                                    <Button variant='outlined' style={{ marginRight: '1%' }} onClick={() => { setNewAddress({ ...newAddress, address_type: '가족' }) }}>가족</Button>
                                </div>
                                <FormControlLabel
                                    label={<Typography style={{ display: 'flex' }}>기본 배송지</Typography>}
                                    control={<Checkbox checked={!!newAddress.is_default} onChange={(e) => {
                                        setNewAddress({ ...newAddress, is_default: e.target.checked })
                                    }} />} />
                                <Button
                                    variant='contained'
                                    style={{ height: '56px', fontSize: 'large', marginTop: '1rem' }}
                                    onClick={onAddAddress}
                                >완료</Button>
                            </>
                        }
                    </>
                }
            </Wrappers>
        </>
    )
}
export default Demo1
