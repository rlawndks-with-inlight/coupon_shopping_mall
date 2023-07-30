import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import ContentTable from 'src/components/elements/content-table';
import { Row, RowMobileColumn, Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import { returnArticleCategory } from 'src/data/data';
import { test_articles } from 'src/data/test-data';
import styled from 'styled-components'
import _ from 'lodash'
import { getPostsByUser } from 'src/utils/api-shop';
import { IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
const Wrappers = styled.div`
max-width:1500px;
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
margin-right:1rem;
@media (max-width:1000px){
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
  const defaultColumns = [
    {
      id: 'product_name',
      label: '상품명',
      action: (row) => {
        return row['product_name'] ?? "---"
      }
    },
    {
      id: 'status',
      label: '상태',
      action: (row) => {
        return row['status'] ?? "---"
      }
    },
    {
      id: 'created_at',
      label: '생성시간',
      action: (row) => {
        return row['created_at'] ?? "---"
      }
    },
    {
      id: 'updated_at',
      label: '최종수정시간',
      action: (row) => {
        return row['updated_at'] ?? "---"
      }
    },
    {
      id: 'edit',
      label: '리뷰 확인하기',
      action: (row) => {
        return (
          <>
            <IconButton onClick={() => {
               router.push(`edit/${row?.id}?type=1`)
            }}>
              <Icon icon='ic:outline-rate-review' />
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
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(20);
  const [postCategory, setPostCategory] = useState({});
  const [data, setData] = useState({

  })
  const [columns, setColumns] = useState([]);
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
    category_id: null
  })
  useEffect(()=>{
    setColumns(defaultColumns)
  },[])
  useEffect(() => {
    setPostCategory(_.find(themePostCategoryList, {id: parseInt(router.query?.article_category)}))
  }, [router.query?.article_category, themePostCategoryList])
  useEffect(()=>{
    if(router.query?.article_category){
      onChangePage({
        ...searchObj,
        category_id: router.query?.article_category
      });
    }
  },[router.query?.article_category])
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
          {router.query?.article_category &&
            <>
              <ContentTable
                data={data}
                onChangePage={onChangePage}
                searchObj={searchObj}
                columns={columns}
              />
            </>}
        </RowMobileColumn>
      </Wrappers >
    </>
  )
}
export default Demo1
