import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Button, Tabs, Tab } from '@mui/material';
import { useState, useEffect } from 'react';
import { useSettingsContext } from 'src/components/settings';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import toast from 'react-hot-toast';
import _ from 'lodash';
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
color:${props => props.themeMode == 'dark' ? '#fff' : 'gray'};
border-top:1px solid ${props => props.themeMode == 'dark' ? '#333' : '#eee'};
`

const ListRow = styled.div`
display:flex;
justify-content:space-between;
align-items:center;
column-gap:1rem;
padding:1rem 0.5rem;
border-bottom:1px solid ${props => props.themeMode == 'dark' ? '#333' : '#eee'};
cursor:pointer;
&:hover{
    background-color:${props => props.themeMode == 'dark' ? '#222' : '#fafafa'};
}
`

const RowTitle = styled.div`
font-size:1rem;
overflow:hidden;
text-overflow:ellipsis;
white-space:nowrap;
`

const RowWriter = styled.span`
color:${props => props.themeMode == 'dark' ? '#aaa' : '#999'};
margin-right:0.35rem;
`

const RowStatus = styled.div`
flex-shrink:0;
font-size:0.85rem;
font-weight:bold;
color:${props => props.done ? '#2e7d32' : (props.themeMode == 'dark' ? '#aaa' : '#bbb')};
`

const EmptyBox = styled.div`
text-align:center;
padding:3rem 0;
color:${props => props.themeMode == 'dark' ? '#aaa' : '#bbb'};
`

// 공지사항, faq 등 리스트 페이지 김인욱
const Demo5 = (props) => {
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

    useEffect(() => {
        if (router.query?.article_category) {
            pageSetting();
        }
    }, [router.query?.article_category, themePostCategoryList])

    const pageSetting = async () => {
        let found = _.find(themePostCategoryList, { id: parseInt(router.query?.article_category) });
        let categoryData = {
            ...found,
            children: [
                {
                    id: router.query?.article_category,
                    post_category_title: '전체'
                },
                ...(found?.children || [])
            ]
        }
        setCaetgory(categoryData);
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

    const isInquiry = category?.is_able_user_add == 1 && category?.post_category_read_type == 1;

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
                        <Tab key={item?.post_category_title} value={item?.id} label={item?.post_category_title} style={{
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
                        inquiryList.map((item, idx) => (
                            <ListRow
                                key={idx}
                                themeMode={themeMode}
                                onClick={() => {
                                    router.push(`/shop/service/${router.query?.article_category}/${item?.id}`)
                                }}
                            >
                                <RowTitle>
                                    {item?.writer_nickname &&
                                        <RowWriter themeMode={themeMode}>[{item?.writer_nickname}]</RowWriter>}
                                    {item?.post_title}
                                </RowTitle>
                                {isInquiry &&
                                    <RowStatus themeMode={themeMode} done={item?.replies?.length > 0}>
                                        {item?.replies?.length > 0 ? '답변완료' : '답변대기'}
                                    </RowStatus>}
                            </ListRow>
                        ))
                        :
                        <EmptyBox themeMode={themeMode}>등록된 게시글이 없습니다.</EmptyBox>
                    }
                </ListContainer>
                {inquiryList.length < postTotal &&
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
                        <Button variant="outlined" disabled={postLoading}
                            onClick={() => getArticleList(postPage + 1, router.query?.article_category, true)}>
                            {postLoading ? '불러오는 중...' : `더 보기 (${inquiryList.length}/${postTotal})`}
                        </Button>
                    </div>}
                {category?.is_able_user_add == 1 &&
                    <ServiceFaq themeMode={themeMode} onClick={() => {
                        // 비회원도 1:1문의를 남길 수 있다 — 작성 화면에서 이름·연락처·글비밀번호를 받는다.
                        // 여기서 로그인을 요구하면 비회원은 작성 화면에 도달할 방법이 없다.
                        router.push(`/shop/service/${router.query?.article_category}/add`)
                    }}>서비스 문의</ServiceFaq>}
            </Wrappers>
        </>
    )
}
export default Demo5
