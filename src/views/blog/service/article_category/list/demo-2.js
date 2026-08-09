import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Button, Tabs, Tab } from '@mui/material';
import { useState, useEffect } from 'react';
import Iconify from 'src/components/iconify/Iconify';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import _ from 'lodash';
import toast from 'react-hot-toast';
import { apiShop } from 'src/utils/api';

const ServiceFaq = styled.div`
display:flex;
justify-content:center;
font-size:1rem;
font-weight:regular;
margin:2rem 0 2rem 0;
color:${props => props.themeMode == 'dark' ? '#fff' : 'gray'};
text-decoration:underline;
cursor:pointer;
`

const ListContainer = styled.div`
display:flex;
flex-direction:column;
border-top:2px solid ${props => props.themeMode == 'dark' ? '#555' : '#333'};
color:${props => props.themeMode == 'dark' ? '#fff' : '#333'};
`

const ListRow = styled.div`
display:flex;
align-items:center;
gap:0.75rem;
padding:1rem 0.5rem;
border-bottom:1px solid ${props => props.themeMode == 'dark' ? '#333' : '#eee'};
cursor:pointer;
transition:background 0.15s ease;
&:hover{
    background:${props => props.themeMode == 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)'};
}
`

const RowTitle = styled.div`
font-size:1rem;
font-weight:500;
flex:1;
overflow:hidden;
text-overflow:ellipsis;
white-space:nowrap;
`

const RowWriter = styled.div`
font-size:0.85rem;
white-space:nowrap;
color:${props => props.themeMode == 'dark' ? '#aaa' : 'gray'};
`

const StatusBadge = styled.span`
font-size:0.8rem;
font-weight:600;
padding:0.2rem 0.6rem;
border-radius:12px;
white-space:nowrap;
`

const EmptyText = styled.div`
text-align:center;
padding:3rem 0;
font-size:0.95rem;
color:${props => props.themeMode == 'dark' ? '#888' : '#999'};
`

// 공지사항, faq 등 리스트 페이지 김인욱
const Demo2 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const [inquiryType, setInquiryType] = useState(0)
    const [inquiryList, setInquiryList] = useState([])
    // 게시판 목록 페이지네이션.
    // 예전엔 page_size:1000 으로 한 번에 긁어왔다 — 1000건이 넘으면 조용히 잘리고,
    // 그 전에도 게시글이 많은 브랜드에서는 한 번에 다 받아 화면이 느려졌다.
    const [postPage, setPostPage] = useState(1)
    const [postTotal, setPostTotal] = useState(0)
    const [postLoading, setPostLoading] = useState(false)
    const { themeMode, themePostCategoryList } = useSettingsContext();
    const { user } = useAuthContext();
    const [category, setCaetgory] = useState({});
    const [postCategory, setPostCategory] = useState({});
    useEffect(() => {
        if (router.query?.article_category) {
            pageSetting();
        }
    }, [router.query?.article_category, themePostCategoryList])

    const pageSetting = () => {
        let found = _.find(themePostCategoryList, { id: parseInt(router.query?.article_category) });
        if (!found) return;
        let category = {
            ...found,
            children: [
                {
                    id: router.query?.article_category,
                    post_category_title: '전체'
                },
                ...(found.children ?? [])
            ]
        }
        setCaetgory(category);
        setPostCategory(found);
        setInquiryType(router.query?.article_category)
        getArticleList(1, router.query?.article_category)
    }
    const getArticleList = async (page, category_id, append = false) => {
        setPostLoading(true);
        let inquiry_data = await apiShop('post', 'list', {
            page: page,
            page_size: 20,
            category_id: category_id
        })
        setPostLoading(false);
        const rows = inquiry_data?.content ?? [];
        setPostTotal(Number(inquiry_data?.total) || 0);
        setPostPage(page);
        setInquiryList((prev) => (append ? [...prev, ...rows] : rows));
    }
    const isInquiry = postCategory?.is_able_user_add == 1 && postCategory?.post_category_read_type == 1;

    return (
        <>
            <Wrappers>
                <Title style={{ paddingBottom: '0' }}>{category?.post_category_title}</Title>
                <Tabs
                    indicatorColor='primary'
                    textColor='primary'
                    scrollButtons='false'
                    variant='scrollable'
                    value={inquiryType}
                    sx={{
                        width: '100%',
                        float: 'left',
                        marginBottom: '1rem'
                    }}
                    onChange={(event, newValue) => {
                        setInquiryType(newValue)
                        getArticleList(1, newValue)
                    }}
                >
                    {category?.children && category?.children.map((item,) => (
                        <Tab key={item?.id} value={item?.id} label={item?.post_category_title} style={{
                            borderBottom: '1px solid',
                            borderColor: 'inherit',
                            textColor: 'inherit',
                            fontSize: '1rem',
                            fontWeight: 'bold',
                            marginRight: '1rem'
                        }} />
                    ))}
                </Tabs>
                <ListContainer themeMode={themeMode}>
                    {inquiryList.length > 0 ?
                        inquiryList.map((item, idx) => {
                            let answered = item?.replies?.length > 0;
                            return (
                                <ListRow key={idx} themeMode={themeMode} onClick={() => {
                                    router.push(`/shop/service/${router.query?.article_category}/${item.id}`)
                                }}>
                                    <RowTitle>{item?.post_title ?? '---'}</RowTitle>
                                    {item?.writer_nickname &&
                                        <RowWriter themeMode={themeMode}>{item?.writer_nickname}</RowWriter>}
                                    {isInquiry &&
                                        <StatusBadge style={{
                                            color: answered ? '#2e7d32' : (themeMode == 'dark' ? '#aaa' : '#999'),
                                            background: answered
                                                ? (themeMode == 'dark' ? 'rgba(46,125,50,0.15)' : '#e8f5e9')
                                                : (themeMode == 'dark' ? 'rgba(255,255,255,0.06)' : '#f5f5f5')
                                        }}>
                                            {answered ? '답변완료' : '답변대기'}
                                        </StatusBadge>}
                                    <Iconify icon="eva:arrow-ios-forward-fill" />
                                </ListRow>
                            )
                        })
                        :
                        <EmptyText themeMode={themeMode}>등록된 게시글이 없습니다.</EmptyText>}
                </ListContainer>
                {inquiryList.length < postTotal &&
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                        <Button variant="outlined" disabled={postLoading}
                            onClick={() => getArticleList(postPage + 1, router.query?.article_category, true)}>
                            {postLoading ? '불러오는 중...' : `더 보기 (${inquiryList.length}/${postTotal})`}
                        </Button>
                    </div>}
                {postCategory?.is_able_user_add == 1 &&
                    <ServiceFaq themeMode={themeMode} onClick={() => {
                        // 비회원도 1:1문의를 남길 수 있다 — 작성 화면에서 이름·연락처·글비밀번호를 받는다.
                        // 여기서 로그인을 요구하면 비회원은 작성 화면에 도달할 방법이 없다.
                        router.push(`/shop/service/${router.query?.article_category}/add`)
                    }}>서비스 문의</ServiceFaq>}
            </Wrappers>
        </>
    )
}
export default Demo2
