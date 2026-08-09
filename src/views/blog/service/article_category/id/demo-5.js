import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Button, Stack, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import _ from 'lodash';
import dynamic from 'next/dynamic';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import GuestInquiryFields, { GUEST_INQUIRY_EMPTY, validateGuestInquiry } from 'src/components/elements/shop/GuestInquiryFields';
import { useModal } from 'src/components/dialog/ModalProvider';
import { apiShop } from 'src/utils/api';
import ReactQuillComponent from 'src/views/manager/react-quill';

const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const Content = styled.div`
color:${props => props.themeMode == 'dark' ? '#fff' : 'gray'};
`

const PostHead = styled.div`
display:flex;
flex-direction:column;
row-gap:0.5rem;
padding-bottom:1rem;
border-bottom:1px solid ${props => props.themeMode == 'dark' ? '#333' : '#eee'};
margin-bottom:1rem;
`

const PostTitle = styled.h2`
font-size:1.25rem;
font-weight:bold;
line-height:1.4;
color:${props => props.themeMode == 'dark' ? '#fff' : '#222'};
`

const PostMeta = styled.div`
display:flex;
column-gap:1rem;
font-size:0.85rem;
color:${props => props.themeMode == 'dark' ? '#aaa' : '#999'};
`

const ReplyBox = styled.div`
display:flex;
flex-direction:column;
row-gap:0.5rem;
padding:1rem;
margin-top:1rem;
border-radius:8px;
background-color:${props => props.themeMode == 'dark' ? '#1e1e1e' : '#f6f6f6'};
`

const ReplyLabel = styled.div`
font-size:0.85rem;
font-weight:bold;
color:${props => props.themeMode == 'dark' ? '#fff' : '#333'};
`

const LoginPrompt = styled.div`
display:flex;
flex-direction:column;
align-items:center;
row-gap:1.5rem;
padding:4rem 0;
text-align:center;
color:${props => props.themeMode == 'dark' ? '#fff' : 'gray'};
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

    const { setModal } = useModal();
    const { user } = useAuthContext();
    // 비회원 1:1문의 입력값. 로그인 상태면 쓰지 않는다.
    const [guestObj, setGuestObj] = useState({ ...GUEST_INQUIRY_EMPTY });
    const { themeMode, themePostCategoryList } = useSettingsContext();

    const [postCategory, setPostCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState({
        parent_id: -1,
        post_title: '',
        post_content: '',
        is_reply: 0,
    })

    const isAdd = router.query?.id == 'add';

    useEffect(() => {
        settingPage();
    }, [router.query?.article_category, router.query?.id, themePostCategoryList])

    const settingPage = async () => {
        setPostCategory(_.find(themePostCategoryList, { id: parseInt(router.query?.article_category) }));
        if (router.query?.id > 0) {
            // 비회원이 조회 화면(/shop/auth/inquiry-check)에서 넘어온 경우 연락처·글비밀번호를 함께 보낸다.
            // 백엔드 post.get 이 이 두 값으로 '작성자 본인' 을 인정한다(계정이 없어 이것뿐이다).
            // 회원이거나 일반 게시판이면 router.query 에 없으므로 아무 영향이 없다.
            let data = await apiShop('post', 'get', {
              id: router.query?.id,
              none_user_phone: router.query?.none_user_phone,
              password: router.query?.password,
            })
            setItem(data);
        }
        setLoading(false);
    }

    const onSave = async () => {
        // 비회원은 이름·연락처·글비밀번호가 있어야 저장할 수 있다(백엔드와 같은 기준).
        if (!user) {
            const invalid = validateGuestInquiry(guestObj);
            if (invalid) { toast.error(invalid); return; }
        }
        let result = await apiShop('post', 'create', {
            ...item,
            category_id: router.query?.article_category,
            ...(user ? {} : guestObj),
        });
        if (result) {
            toast.success('성공적으로 저장 되었습니다.');
            router.push(`/shop/service/${router.query?.article_category}`);
        }
    }

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>{postCategory?.post_category_title}</Title>
                {!loading &&
                    <Content themeMode={themeMode}>
                        {isAdd ?
                            <>
                                {/* 비회원도 문의를 남길 수 있다 — 로그인 대신 이름·연락처·글비밀번호를 받는다.
                                    (예전엔 여기서 '로그인 후 이용하실 수 있습니다' 로 막았다) */}
                                {true ?
                                    <Stack spacing={3}>
                                        {!user && <GuestInquiryFields value={guestObj} onChange={setGuestObj} />}
                                        <TextField
                                            label='제목'
                                            value={item.post_title}
                                            onChange={(e) => {
                                                setItem({
                                                    ...item,
                                                    ['post_title']: e.target.value
                                                })
                                            }} />
                                        <ReactQuillComponent
                                            value={item.post_content}
                                            setValue={(value) => {
                                                setItem({
                                                    ...item,
                                                    ['post_content']: value
                                                });
                                            }}
                                        />
                                        <div style={{ display: 'flex', columnGap: '0.5rem', marginLeft: 'auto' }}>
                                            <Button variant='outlined' style={{
                                                height: '48px', width: '120px'
                                            }} onClick={() => {
                                                router.push(`/shop/service/${router.query?.article_category}`)
                                            }}>
                                                취소
                                            </Button>
                                            <Button variant='contained' style={{
                                                height: '48px', width: '120px'
                                            }} onClick={() => {
                                                setModal({
                                                    func: () => { onSave() },
                                                    icon: 'material-symbols:edit-outline',
                                                    title: '저장 하시겠습니까?'
                                                })
                                            }}>
                                                저장
                                            </Button>
                                        </div>
                                    </Stack>
                                    :
                                    <LoginPrompt themeMode={themeMode}>
                                        <div>로그인 후 이용할 수 있습니다.</div>
                                        <Button variant='contained' size='large' sx={{ height: '48px', width: '180px' }} onClick={() => {
                                            router.push('/shop/auth/login')
                                        }}>
                                            로그인하기
                                        </Button>
                                    </LoginPrompt>
                                }
                            </>
                            :
                            <>
                                <PostHead themeMode={themeMode}>
                                    <PostTitle themeMode={themeMode}>{item?.post_title}</PostTitle>
                                    <PostMeta themeMode={themeMode}>
                                        {item?.writer_nickname && <span>{item?.writer_nickname}</span>}
                                        {item?.created_at && <span>{item?.created_at}</span>}
                                    </PostMeta>
                                </PostHead>
                                {item?.post_title_img &&
                                    <img src={item?.post_title_img} style={{ width: '100%' }} />}
                                <ReactQuill
                                    className='none-padding'
                                    value={item?.post_content ?? `<body></body>`}
                                    readOnly={true}
                                    theme={'bubble'}
                                    bounds={'.app'}
                                />
                                {item?.replies && item?.replies.map((reply, idx) => (
                                    <ReplyBox key={idx} themeMode={themeMode}>
                                        <ReplyLabel themeMode={themeMode}>답변</ReplyLabel>
                                        {reply?.post_title &&
                                            <PostTitle themeMode={themeMode} style={{ fontSize: '1.05rem' }}>{reply?.post_title}</PostTitle>}
                                        <ReactQuill
                                            className='none-padding'
                                            value={reply?.post_content ?? `<body></body>`}
                                            readOnly={true}
                                            theme={'bubble'}
                                            bounds={'.app'}
                                        />
                                    </ReplyBox>
                                ))}
                                <Button variant='outlined' style={{
                                    height: '48px', width: '120px', margin: '1.5rem 0 0 auto'
                                }} onClick={() => {
                                    router.push(`/shop/service/${router.query?.article_category}`)
                                }}>
                                    목록
                                </Button>
                            </>
                        }
                    </Content>
                }
            </Wrappers>
        </>
    )
}
export default Demo5
