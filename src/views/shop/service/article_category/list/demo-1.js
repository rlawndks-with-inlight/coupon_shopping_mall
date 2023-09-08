import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import ContentTable from 'src/components/elements/content-table';
import { Col, Row, RowMobileColumn, Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { returnArticleCategory } from 'src/data/data';
import { test_articles } from 'src/data/test-data';
import styled from 'styled-components'
import _ from 'lodash'
import { getPostsByUser } from 'src/utils/api-shop';
import { Button, IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { toast } from 'react-hot-toast';
const Wrappers = styled.div`
max-width:1600px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
`
const ColumnMenu = styled.div`
display:flex;
flex-direction: column;
width:200px;
white-space:pre-wrap;
margin-right:1rem;
@media (max-width:1000px){
  display:-webkit-box;
  overflow:auto;
  width:100%;
  flex-direction: row;
  margin-bottom:1rem;
}
`
const ArticleCategory = styled.div`
border-bottom:1px solid ${themeObj.grey[300]};
padding:0.5rem 0;
cursor:pointer;
transition:0.3s;
color:${props => props.isSelect ? props => props.selectColor : themeObj.grey[300]};
font-weight:${props => props.isSelect ? 'bold' : ''};
&:hover{
  color: ${props => props.isSelect ? '' : props => props.theme.palette.primary.main};
}
@media (max-width:1000px){
  padding:0.25rem 0;
  border-bottom:2px solid ${props => props.isSelect ? props => props.selectColor : 'transparent'};
  margin-right:0.5rem;
}
`
const Demo1 = (props) => {
  const { user } = useAuthContext();
  const [postCategory, setPostCategory] = useState({});

  const defaultColumns = [
    {
      id: 'post_title',
      label: '제목',
      action: (row) => {
        return row['post_title'] ?? "---"
      }
    },
    {
      id: 'created_at',
      label: '생성시간',
      action: (row) => {
        return <>
          <div style={{ color: themeObj.grey[500] }}>
            {row['created_at'] ?? "---"}
          </div>
        </>
      }
    },
    ...(postCategory?.is_able_user_add == 1 ? [
      {
        id: 'replies',
        label: '답변여부',
        action: (row) => {
          return row?.replies.length > 0 ? '답변완료' : '답변안함'
        }
      }
    ] : []),
    {
      id: 'edit',
      label: '자세히보기',
      action: (row) => {
        return (
          <>
            <IconButton onClick={() => {
              router.push(`/shop/service/${router.query?.article_category}/${row?.id}`)
            }}>
              <Icon icon='bx:detail' />
            </IconButton>
          </>
        )
      }
    },
  ]
  const {
    data: {

    },
    func: {
      router
    },
  } = props;
  const { themeMode, themePostCategoryList } = useSettingsContext();
  const theme = useTheme();
  const [data, setData] = useState({

  })
  const [columns, setColumns] = useState([]);
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
    category_id: null
  })
  useEffect(() => {
    setColumns(defaultColumns)
  }, [postCategory])
  useEffect(() => {
    setPostCategory(_.find(themePostCategoryList, { id: parseInt(router.query?.article_category) }))
    console.log(_.find(themePostCategoryList, { id: parseInt(router.query?.article_category) }))
  }, [router.query?.article_category, themePostCategoryList])
  useEffect(() => {
    if (router.query?.article_category) {
      onChangePage({
        ...searchObj,
        category_id: router.query?.article_category,
        page: 1
      });
    }
  }, [router.query?.article_category])
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    })
    let data_ = await getPostsByUser(obj);
    setData(data_);
    setSearchObj(obj);
  }
  return (
    <>
      <Wrappers>
        <Title style={{
          marginBottom: '2rem'
        }}>{postCategory?.post_category_title}</Title>
        <Row style={{ margin: '1rem auto', overflowX: 'auto', whiteSpace: 'nowrap', columnGap: '0.25rem' }} className='none-scroll'>
          {postCategory?.children && postCategory?.children.length > 0 &&
            <>
              <Button onClick={() => {
                onChangePage({
                  ...searchObj,
                  category_id: router.query?.article_category,
                  page: 1,
                })
              }}
                variant={searchObj.category_id == router.query?.article_category ? 'contained' : 'outlined'}
              >
                전체
              </Button>
            </>}
          {postCategory?.children && postCategory?.children.map((category) => (
            <>
              <Button onClick={() => {
                onChangePage({
                  ...searchObj,
                  category_id: category?.id,
                  page: 1,
                })
              }}
                variant={searchObj.category_id == category?.id ? 'contained' : 'outlined'}>
                {category?.post_category_title}
              </Button>
            </>
          ))}
        </Row>
        <RowMobileColumn>
          <ColumnMenu>
            {themePostCategoryList.map((item, idx) => (
              <>
                <ArticleCategory theme={theme}
                  isSelect={item?.id == router.query?.article_category}
                  selectColor={themeMode == 'dark' ? '#fff' : '#000'}
                  onClick={() => {
                    router.push(`/shop/service/${item?.id}`)
                  }}
                >
                  {item.post_category_title}
                </ArticleCategory >
              </>
            ))}
          </ColumnMenu>

          <Col style={{ width: '100%' }}>
            {router.query?.article_category &&
              <>
                <ContentTable
                  data={data}
                  onChangePage={onChangePage}
                  searchObj={searchObj}
                  columns={columns}
                  postCategory={postCategory}
                />
              </>}
            {postCategory?.is_able_user_add == 1 &&
              <>
                <Button variant="contained" style={{
                  height: '48px', width: '120px', marginLeft: 'auto'
                }} onClick={() => {
                  if (user?.id) {
                    router.push(`/shop/service/${router.query?.article_category}/add`)
                  } else {
                    toast.error("로그인을 해주세요.")
                  }
                }}>
                  작성
                </Button>
              </>}
          </Col>
        </RowMobileColumn>
      </Wrappers>
    </>
  )
}
export default Demo1
