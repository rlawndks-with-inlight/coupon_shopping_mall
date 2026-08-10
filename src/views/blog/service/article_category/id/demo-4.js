import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Button, Stack, TextField, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import _ from 'lodash';
import { useModal } from 'src/components/dialog/ModalProvider';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import GuestInquiryFields, { GUEST_INQUIRY_EMPTY, validateGuestInquiry } from 'src/components/elements/shop/GuestInquiryFields';
import { apiShop } from 'src/utils/api';
import ReactQuillComponent from 'src/views/manager/react-quill';
import { formatLang } from 'src/utils/format';
import { useLocales } from 'src/locales';

const PostTitle = styled.h3`
font-size:1.25rem;
font-weight:bold;
line-height:1.4;
padding:1rem 0 0.75rem 0;
color:${props => props.themeMode == 'dark' ? '#fff' : '#222'};
`
const MetaRow = styled.div`
display:flex;
column-gap:1rem;
font-size:13px;
color:${props => props.themeMode == 'dark' ? '#aaa' : '#888'};
padding-bottom:0.75rem;
border-bottom:1px solid ${props => props.themeMode == 'dark' ? '#333' : '#eee'};
margin-bottom:1.5rem;
`
const Content = styled.div`
font-size:15px;
line-height:1.75;
min-height:120px;
color:${props => props.themeMode == 'dark' ? '#eee' : '#333'};
& img { max-width:100%; height:auto; }
`
const AnswerBox = styled.div`
margin-top:2rem;
padding:1.25rem;
border-radius:8px;
background:${props => props.themeMode == 'dark' ? '#1e1e1e' : '#f7f7f7'};
`
const AnswerLabel = styled.div`
font-size:14px;
font-weight:bold;
margin-bottom:0.75rem;
color:${props => props.themeMode == 'dark' ? '#fff' : '#333'};
`
const BackLink = styled.div`
font-size:1rem;
text-align:center;
margin:2.5rem 0 1rem 0;
text-decoration:underline;
cursor:pointer;
color:${props => props.themeMode == 'dark' ? '#fff' : 'gray'};
`

// 공지사항, 1:1문의 등 상세/작성 페이지 김인욱
const Demo4 = (props) => {
  const { translate } = useLocales();
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
    });

    const isAdd = router.query?.id == 'add';

    useEffect(() => {
        if (router.query?.article_category) {
            settingPage();
        }
    }, [router.query?.article_category, router.query?.id, themePostCategoryList])

    const settingPage = async () => {
        setPostCategory(_.find(themePostCategoryList, { id: parseInt(router.query?.article_category) }));
        if (router.query?.id > 0) {
            // 비회원이 조회 화면(/shop/auth/inquiry-check)에서 넘어온 경우 연락처·글비밀번호를 함께 보낸다.
            // 백엔드 post.get 이 이 두 값으로 '작성자 본인' 을 인정한다(계정이 없어 이것뿐이다).
            // 회원이거나 일반 게시판이면 router.query 에 없으므로 아무 영향이 없다.
            const data = await apiShop('post', 'get', {
              id: router.query?.id,
              none_user_phone: router.query?.none_user_phone,
              password: router.query?.password,
            });
            setItem(data);
        }
        setLoading(false);
    }

    const onSave = async () => {
        if (!item?.post_title) {
            toast.error('제목을 입력해 주세요.');
            return;
        }
        // 비회원은 이름·연락처·글비밀번호가 있어야 저장할 수 있다(백엔드와 같은 기준).
        if (!user) {
            const invalid = validateGuestInquiry(guestObj);
            if (invalid) { toast.error(invalid); return; }
        }
        const result = await apiShop('post', 'create', {
            ...item,
            category_id: router.query?.article_category,
            ...(user ? {} : guestObj),
        });
        if (result) {
            toast.success('성공적으로 저장 되었습니다.');
            router.push(`/shop/service/${router.query?.article_category}`);
        }
    }

    const isAnswered = item?.replies && item.replies.length > 0;

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
                                    <Stack spacing={3} sx={{ mt: 2 }}>
                                        {!user && <GuestInquiryFields value={guestObj} onChange={setGuestObj} />}
                                        <TextField
                                            label={translate('제목')}
                                            value={item.post_title}
                                            onChange={(e) => {
                                                setItem({ ...item, post_title: e.target.value })
                                            }}
                                        />
                                        <ReactQuillComponent
                                            value={item.post_content}
                                            setValue={(value) => {
                                                setItem({ ...item, post_content: value })
                                            }}
                                        />
                                        <Button variant='contained' style={{
                                            height: '48px', width: '120px', margin: '1rem 0 0 auto'
                                        }} onClick={() => {
  const { translate } = useLocales();
                                            setModal({
                                                func: () => { onSave() },
                                                icon: 'material-symbols:edit-outline',
                                                title: translate('저장 하시겠습니까?')
                                            })
                                        }}>{translate('저장')}</Button>
                                    </Stack>
                                    :
                                    <Stack spacing={2} sx={{ mt: 5, alignItems: 'center' }}>
                                        <Typography variant='body1'>{translate('로그인 후 이용하실 수 있습니다.')}</Typography>
                                        <Button variant='contained' style={{ height: '48px', width: '160px' }}
                                            onClick={() => { router.push('/shop/auth/login') }}>{translate('로그인 하러가기')}</Button>
                                    </Stack>
                                }
                            </>
                            :
                            <>
                                <PostTitle themeMode={themeMode}>{formatLang(item, 'post_title')}</PostTitle>
                                <MetaRow themeMode={themeMode}>
                                    {item?.writer_nickname && <span>{item.writer_nickname}</span>}
                                    {item?.created_at && <span>{item.created_at}</span>}
                                </MetaRow>
                                <Content themeMode={themeMode} dangerouslySetInnerHTML={{ __html: formatLang(item, 'post_content') ?? '' }} />
                                {isAnswered &&
                                    item.replies.map((reply, idx) => (
                                        <AnswerBox key={reply?.id ?? idx} themeMode={themeMode}>
                                            <AnswerLabel themeMode={themeMode}>답변{reply?.post_title ? ` - ${reply.post_title}` : ''}</AnswerLabel>
                                            <Content themeMode={themeMode} dangerouslySetInnerHTML={{ __html: formatLang(reply, 'post_content') ?? '' }} />
                                        </AnswerBox>
                                    ))
                                }
                                <BackLink themeMode={themeMode} onClick={() => {
                                    router.push(`/shop/service/${router.query?.article_category}`)
                                }}>{translate('목록으로')}</BackLink>
                            </>
                        }
                    </>
                }
            </Wrappers>
        </>
    )
}
export default Demo4
