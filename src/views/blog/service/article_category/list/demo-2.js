import styled from 'styled-components'
import { Wrappers, Title } from 'src/components/elements/blog/demo-1';
import { Tabs, Tab, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import Iconify from 'src/components/iconify/Iconify';
import { useSettingsContext } from 'src/components/settings';
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

const AccordionContainer = styled.div`
color:${props => props.themeMode == 'dark' ? '#fff' : 'gray'};
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
    const [controlled, setControlled] = useState(undefined)
    const { themeMode, themePostCategoryList } = useSettingsContext();
    const [category, setCaetgory] = useState({});
    useEffect(() => {
        pageSetting();
    }, [])

    const pageSetting = async () => {
        let category = _.find(themePostCategoryList, { id: parseInt(router.query?.article_category) });
        category.children = [
            ...[{
                id: router.query?.article_category,
                post_category_title: '전체'
            }],
            ...category.children
        ]
        setCaetgory(category);
        setInquiryType(router.query?.article_category)
        getArticleList(1, router.query?.article_category)
    }
    const getArticleList = async (page, category_id) => {
        let inquiry_data = await apiShop('post', 'list', {
            page: page,
            page_size: 100000,
            category_id: category_id
        })
        setInquiryList(inquiry_data.content)
    }
    /*const settingPage = () => {
        let inquiry_data = [...test_inquiry];
        inquiry_data = inquiry_data.map((item) => {
            return {
                ...item
            }
        })
        setInquiryList(inquiry_data);
    }*/

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
                <AccordionContainer themeMode={themeMode}>
                    {inquiryList.map((item, idx) => (
                        <>
                            <Accordion
                                key={idx}
                                expanded={controlled === item.id}
                                onChange={() => {
                                    if (item.id == controlled) {
                                        setControlled(undefined);
                                    } else {
                                        setControlled(item.id)
                                    }
                                }}
                                disabled={item.answer ? false : true}
                            >
                                <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}>
                                    <Typography variant="subtitle1">[{item.post_writer}] {item.post_title}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography>{item.answer}</Typography>
                                </AccordionDetails>
                            </Accordion>
                        </>
                    ))}
                </AccordionContainer>
                <ServiceFaq themeMode={themeMode}>BS컴퍼니 서비스 문의</ServiceFaq>
            </Wrappers>
        </>
    )
}
export default Demo2
