import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Button, Stack, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import _ from 'lodash';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import GuestInquiryFields, { GUEST_INQUIRY_EMPTY, validateGuestInquiry } from 'src/components/elements/shop/GuestInquiryFields';
import { apiShop } from 'src/utils/api';
import ReactQuillComponent from 'src/views/manager/react-quill';
import { formatLang } from 'src/utils/format';
import { useLocales } from 'src/locales';

const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <p>Loading ...</p>,
})

const DetailCard = styled.div`
border:1px solid ${props => props.themeMode == 'dark' ? '#333' : '#e0e0e0'};
border-radius:12px;
padding:1.5rem;
color:${props => props.themeMode == 'dark' ? '#eee' : '#333'};
`
const PostTitle = styled.div`
font-size:1.15rem;
font-weight:700;
line-height:1.4;
padding-bottom:0.75rem;
border-bottom:1px solid ${props => props.themeMode == 'dark' ? '#333' : '#eee'};
`
const PostMeta = styled.div`
font-size:0.85rem;
color:${props => props.themeMode == 'dark' ? '#aaa' : 'gray'};
margin-top:0.5rem;
`
const ReplyBlock = styled.div`
margin-top:1.25rem;
padding:1.25rem;
border-radius:12px;
background:${props => props.themeMode == 'dark' ? 'rgba(255,255,255,0.04)' : '#f7f8fa'};
`
const ReplyLabel = styled.div`
display:inline-block;
font-size:0.8rem;
font-weight:700;
color:#2e7d32;
margin-bottom:0.5rem;
`
const BackText = styled.div`
display:flex;
justify-content:center;
font-size:1rem;
margin:2rem 0 2rem 0;
color:${props => props.themeMode == 'dark' ? '#fff' : 'gray'};
text-decoration:underline;
cursor:pointer;
`
const LoginGuide = styled.div`
display:flex;
flex-direction:column;
align-items:center;
gap:1rem;
padding:4rem 0;
color:${props => props.themeMode == 'dark' ? '#ccc' : '#666'};
`

// 공지사항, faq 등 상세페이지 김인욱
const Demo2 = (props) => {
  const { translate } = useLocales();
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const { themeMode, themePostCategoryList } = useSettingsContext();
    const { user } = useAuthContext();
    // 비회원 1:1문의 입력값. 로그인 상태면 쓰지 않는다.
    const [guestObj, setGuestObj] = useState({ ...GUEST_INQUIRY_EMPTY });
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
        if (router.query?.article_category) {
            settingPage();
        }
    }, [router.query?.article_category, router.query?.id, themePostCategoryList])

    const settingPage = async () => {
        setPostCategory(_.find(themePostCategoryList, { id: parseInt(router.query?.article_category) }))
        if (router.query?.id > 0) {
            // 비회원이 조회 화면(/shop/auth/inquiry-check)에서 넘어온 경우 연락처·글비밀번호를 함께 보낸다.
            // 백엔드 post.get 이 이 두 값으로 '작성자 본인' 을 인정한다(계정이 없어 이것뿐이다).
            // 회원이거나 일반 게시판이면 router.query 에 없으므로 아무 영향이 없다.
            let data = await apiShop('post', 'get', {
              id: router.query?.id,
              none_user_phone: router.query?.none_user_phone,
              password: router.query?.password,
            })
            if (data) {
                setItem(data);
            }
        }
        setLoading(false);
    }

    const onSave = async () => {
        if (!item?.post_title) {
            toast.error(translate('제목을 입력해주세요.'));
            return;
        }
        // 비회원은 이름·연락처·글비밀번호가 있어야 저장할 수 있다(백엔드와 같은 기준).
        if (!user) {
            const invalid = validateGuestInquiry(guestObj);
            if (invalid) { toast.error(translate(invalid)); return; }
        }
        let result = await apiShop('post', 'create', {
            ...item,
            category_id: router.query?.article_category,
            ...(user ? {} : guestObj),
        });
        if (result) {
            toast.success(translate('성공적으로 저장 되었습니다.'));
            router.push(`/shop/service/${router.query?.article_category}`);
        }
    }

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>{formatLang(postCategory, 'post_category_title')}</Title>
                {!loading &&
                    <>
                        {isAdd ?
                            <>
                                {/* 비회원도 문의를 남길 수 있다 — 로그인 대신 이름·연락처·글비밀번호를 받는다.
                                    (예전엔 여기서 '로그인 후 이용하실 수 있습니다' 로 막았다) */}
                                {true ?
                                    <Stack spacing={3} sx={{ marginTop: '1rem' }}>
                                        {!user && <GuestInquiryFields value={guestObj} onChange={setGuestObj} />}
                                        <TextField
                                            label={translate('제목')}
                                            value={item.post_title}
                                            onChange={(e) => {
                                                setItem({ ...item, ['post_title']: e.target.value })
                                            }} />
                                        <ReactQuillComponent
                                            value={item.post_content}
                                            setValue={(value) => {
                                                setItem({ ...item, ['post_content']: value });
                                            }}
                                        />
                                        <Button variant="contained" style={{
                                            height: '48px', width: '120px', margin: '1rem 0 1rem auto'
                                        }} onClick={() => {
                                            onSave()
                                        }}>{translate('저장')}</Button>
                                    </Stack>
                                    :
                                    <LoginGuide themeMode={themeMode}>
                                        <div>{translate('로그인 후 이용하실 수 있습니다.')}</div>
                                        <Button variant="contained" style={{ height: '48px', width: '160px' }}
                                            onClick={() => { router.push('/shop/auth/login') }}>{translate('로그인 하러가기')}</Button>
                                    </LoginGuide>}
                            </>
                            :
                            <DetailCard themeMode={themeMode} style={{ marginTop: '1rem' }}>
                                <PostTitle themeMode={themeMode}>{formatLang(item, 'post_title') ?? '---'}</PostTitle>
                                {item?.writer_nickname &&
                                    <PostMeta themeMode={themeMode}>작성자 {item?.writer_nickname}</PostMeta>}

                                <ReactQuill
                                    className='none-padding'
                                    value={formatLang(item, 'post_content') ?? `<body></body>`}
                                    readOnly={true}
                                    theme={"bubble"}
                                    bounds={'.app'}
                                />
                                {item?.replies && item?.replies.map((reply, idx) => (
                                    <ReplyBlock key={idx} themeMode={themeMode}>
                                        <ReplyLabel>{translate('답변')}</ReplyLabel>
                                        <PostTitle themeMode={themeMode} style={{ fontSize: '1rem', border: 'none', paddingBottom: '0' }}>{formatLang(reply, 'post_title')}</PostTitle>
                                        <ReactQuill
                                            className='none-padding'
                                            value={formatLang(reply, 'post_content') ?? `<body></body>`}
                                            readOnly={true}
                                            theme={"bubble"}
                                            bounds={'.app'}
                                        />
                                    </ReplyBlock>
                                ))}
                            </DetailCard>}
                        <BackText themeMode={themeMode} onClick={() => {
                            router.push(`/shop/service/${router.query?.article_category}`)
                        }}>{translate('목록으로')}</BackText>
                    </>}
            </Wrappers>
        </>
    )
}
export default Demo2
