import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Tabs, Tab } from '@mui/material';
import { useState, useEffect } from 'react';
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
`

const ListRow = styled.div`
display:flex;
align-items:center;
gap:1rem;
padding:1rem 0.5rem;
cursor:pointer;
border-bottom:1px solid ${props => props.themeMode == 'dark' ? '#333' : '#eee'};
color:${props => props.themeMode == 'dark' ? '#eee' : '#333'};
&:hover{
    background:${props => props.themeMode == 'dark' ? '#1c1c1c' : '#fafafa'};
}
`

const RowTitle = styled.div`
flex:1;
font-size:1rem;
overflow:hidden;
text-overflow:ellipsis;
white-space:nowrap;
`

const RowWriter = styled.div`
font-size:0.9rem;
color:${props => props.themeMode == 'dark' ? '#aaa' : '#888'};
min-width:80px;
text-align:right;
`

const AnswerBadge = styled.div`
font-size:0.8rem;
font-weight:bold;
min-width:64px;
text-align:center;
color:${props => props.done ? '#fff' : (props.themeMode == 'dark' ? '#aaa' : '#888')};
background:${props => props.done ? (props.mainColor || '#1976d2') : 'transparent'};
border:1px solid ${props => props.done ? 'transparent' : (props.themeMode == 'dark' ? '#555' : '#ddd')};
border-radius:4px;
padding:3px 8px;
`

const EmptyBox = styled.div`
text-align:center;
padding:4rem 0;
color:${props => props.themeMode == 'dark' ? '#888' : '#aaa'};
`

// 공지사항, faq 등 리스트 페이지 김인욱
const Demo1 = (props) => {
    const {
        data: {

        },
        func: {
            router
        },
    } = props;

    const [inquiryType, setInquiryType] = useState(0)
    const [inquiryList, setInquiryList] = useState([])
    const { themeMode, themeDnsData, themePostCategoryList } = useSettingsContext();
    const { user } = useAuthContext();
    const [category, setCategory] = useState({});
    const mainColor = themeDnsData?.theme_css?.main_color;

    const isAbleAdd = category?.is_able_user_add == 1;
    const showWriter = category?.is_able_user_add == 1 && category?.post_category_read_type == 0;
    const isInquiry = category?.is_able_user_add == 1 && category?.post_category_read_type == 1;

    useEffect(() => {
        pageSetting();
    }, [router.query?.article_category, themePostCategoryList])

    const pageSetting = async () => {
        let found = _.find(themePostCategoryList, { id: parseInt(router.query?.article_category) });
        if (!found) return;
        let cat = {
            ...found,
            children: [
                { id: router.query?.article_category, post_category_title: '전체' },
                ...(found.children || [])
            ]
        };
        setCategory(cat);
        setInquiryType(router.query?.article_category)
        getArticleList(1, router.query?.article_category)
    }
    const getArticleList = async (page, category_id) => {
        let inquiry_data = await apiShop('post', 'list', {
            page: page,
            page_size: 1000,
            category_id: category_id
        })
        setInquiryList(inquiry_data?.content || [])
    }
    const onClickAdd = () => {
        if (user?.id) {
            router.push(`/shop/service/${router.query?.article_category}/add`)
        } else {
            toast.error('로그인을 해주세요.')
            router.push('/shop/auth/login')
        }
    }

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
                    {inquiryList.map((item, idx) => (
                        <ListRow
                            key={item?.id ?? idx}
                            themeMode={themeMode}
                            onClick={() => {
                                router.push(`/shop/service/${router.query?.article_category}/${item?.id}`)
                            }}
                        >
                            <RowTitle>{item?.post_title ?? '---'}</RowTitle>
                            {showWriter &&
                                <RowWriter themeMode={themeMode}>{item?.writer_nickname ?? '---'}</RowWriter>}
                            {isInquiry &&
                                <AnswerBadge
                                    themeMode={themeMode}
                                    mainColor={mainColor}
                                    done={item?.replies?.length > 0}
                                >
                                    {item?.replies?.length > 0 ? '답변완료' : '답변대기'}
                                </AnswerBadge>}
                        </ListRow>
                    ))}
                </ListContainer>
                {inquiryList.length == 0 &&
                    <EmptyBox themeMode={themeMode}>게시글이 없습니다.</EmptyBox>}
                {isAbleAdd &&
                    <ServiceFaq themeMode={themeMode} onClick={onClickAdd}>서비스 문의</ServiceFaq>}
            </Wrappers>
        </>
    )
}
export default Demo1
