import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Button, TextField } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import _ from 'lodash';
import toast from 'react-hot-toast';
import { apiShop } from 'src/utils/api';
import { useModal } from 'src/components/dialog/ModalProvider';
import ReactQuillComponent from 'src/views/manager/react-quill';

const PostTitle = styled.h1`
font-size:1.25rem;
font-weight:bold;
line-height:1.4;
margin-bottom:0.5rem;
color:${props => props.themeMode == 'dark' ? '#fff' : '#212121'};
`
const MetaRow = styled.div`
display:flex;
align-items:center;
column-gap:0.75rem;
font-size:0.9rem;
color:${props => props.themeMode == 'dark' ? '#aaa' : '#888'};
padding-bottom:0.75rem;
margin-bottom:1.5rem;
border-bottom:1px solid ${props => props.themeMode == 'dark' ? '#333' : '#eee'};
`
const Content = styled.div`
font-size:0.95rem;
line-height:1.7;
min-height:160px;
color:${props => props.themeMode == 'dark' ? '#ddd' : '#333'};
word-break:break-word;
& img{max-width:100%;height:auto;}
`
const ReplyBox = styled.div`
margin-top:2rem;
padding:1.25rem;
border-radius:8px;
background:${props => props.themeMode == 'dark' ? '#222222' : '#F6F6F6'};
color:${props => props.themeMode == 'dark' ? '#eee' : '#333'};
`
const ReplyLabel = styled.div`
display:inline-block;
font-size:0.8rem;
font-weight:bold;
color:#fff;
background:${props => props.mainColor || '#1976d2'};
border-radius:4px;
padding:2px 8px;
margin-bottom:0.75rem;
`
const FormLabel = styled.div`
font-size:0.95rem;
font-weight:bold;
margin:1.5rem 0 0.5rem 0;
color:${props => props.themeMode == 'dark' ? '#fff' : '#212121'};
`
const LoginBox = styled.div`
display:flex;
flex-direction:column;
align-items:center;
gap:1rem;
margin:4rem 0;
color:${props => props.themeMode == 'dark' ? '#bbb' : '#888'};
`
const ButtonRow = styled.div`
display:flex;
justify-content:flex-end;
gap:0.5rem;
margin-top:1.5rem;
`

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
    const { setModal } = useModal();
    const { themeMode, themeDnsData, themePostCategoryList } = useSettingsContext();
    const mainColor = themeDnsData?.theme_css?.main_color;

    const [category, setCategory] = useState({});
    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState({
        parent_id: -1,
        post_title: '',
        post_content: '',
        is_reply: 0,
    });

    const isAdd = router.query?.id == 'add';

    useEffect(() => {
        pageSetting();
    }, [router.query?.article_category, router.query?.id, themePostCategoryList])

    const pageSetting = async () => {
        if (!router.query?.article_category) return;
        setCategory(_.find(themePostCategoryList, { id: parseInt(router.query?.article_category) }) || {});
        if (router.query?.id > 0) {
            let data = await apiShop('post', 'get', {
                id: router.query?.id
            })
            if (data) setItem(data);
        }
        setLoading(false);
    }

    const onSave = async () => {
        let result = await apiShop('post', 'create', {
            ...item,
            category_id: router.query?.article_category
        });
        if (result) {
            toast.success('성공적으로 저장 되었습니다.');
            router.push(`/shop/service/${router.query?.article_category}`);
        }
    }

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '1rem' }}>{category?.post_category_title}</Title>
                {!loading &&
                    <>
                        {isAdd ?
                            <>
                                {user?.id ?
                                    <>
                                        <FormLabel themeMode={themeMode}>제목</FormLabel>
                                        <TextField
                                            fullWidth
                                            placeholder='제목을 입력해주세요.'
                                            value={item.post_title}
                                            onChange={(e) => {
                                                setItem({
                                                    ...item,
                                                    ['post_title']: e.target.value
                                                })
                                            }}
                                        />
                                        <FormLabel themeMode={themeMode}>내용</FormLabel>
                                        <ReactQuillComponent
                                            value={item.post_content}
                                            setValue={(value) => {
                                                setItem({
                                                    ...item,
                                                    ['post_content']: value
                                                });
                                            }}
                                        />
                                        <ButtonRow>
                                            <Button color='inherit' onClick={() => {
                                                router.push(`/shop/service/${router.query?.article_category}`)
                                            }}>취소</Button>
                                            <Button variant='contained' onClick={() => {
                                                if (!item.post_title) {
                                                    toast.error('제목을 입력해주세요.');
                                                    return;
                                                }
                                                setModal({
                                                    func: () => { onSave() },
                                                    icon: 'material-symbols:edit-outline',
                                                    title: '저장 하시겠습니까?'
                                                })
                                            }}>등록</Button>
                                        </ButtonRow>
                                    </>
                                    :
                                    <LoginBox themeMode={themeMode}>
                                        <div>로그인 후 이용하실 수 있습니다.</div>
                                        <Button variant='contained' onClick={() => {
                                            router.push('/shop/auth/login')
                                        }}>로그인하기</Button>
                                    </LoginBox>
                                }
                            </>
                            :
                            <>
                                <PostTitle themeMode={themeMode}>{item?.post_title}</PostTitle>
                                <MetaRow themeMode={themeMode}>
                                    {item?.writer_nickname && <span>{item?.writer_nickname}</span>}
                                    {item?.created_at && <span>{item?.created_at}</span>}
                                </MetaRow>
                                {item?.post_title_img &&
                                    <img src={item?.post_title_img} style={{ width: '100%', marginBottom: '1rem' }} />}
                                <Content themeMode={themeMode} dangerouslySetInnerHTML={{ __html: item?.post_content ?? '' }} />
                                {item?.replies && item?.replies.map((reply, idx) => (
                                    <ReplyBox key={idx} themeMode={themeMode}>
                                        <ReplyLabel mainColor={mainColor}>답변</ReplyLabel>
                                        {reply?.post_title &&
                                            <PostTitle themeMode={themeMode} style={{ fontSize: '1.05rem' }}>{reply?.post_title}</PostTitle>}
                                        <Content themeMode={themeMode} dangerouslySetInnerHTML={{ __html: reply?.post_content ?? '' }} />
                                    </ReplyBox>
                                ))}
                                <ButtonRow>
                                    <Button color='inherit' onClick={() => {
                                        router.push(`/shop/service/${router.query?.article_category}`)
                                    }}>목록</Button>
                                </ButtonRow>
                            </>
                        }
                    </>
                }
            </Wrappers>
        </>
    )
}
export default Demo1
