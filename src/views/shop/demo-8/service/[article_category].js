import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import ContentTable from 'src/components/elements/content-table';
import { Col, Row, RowMobileColumn, Title, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import styled from 'styled-components'
import _ from 'lodash'
import { Button, IconButton } from '@mui/material';
import { Icon } from '@iconify/react';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { toast } from 'react-hot-toast';
import { apiShop } from 'src/utils/api';
import { useModal } from 'src/components/dialog/ModalProvider';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
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
const ArticlesDemo = (props) => {
  const { translate, currentLang } = useLocales();
  const { user } = useAuthContext();
  const { setModal } = useModal()
  const [postCategory, setPostCategory] = useState({});

  const defaultColumns = [
    {
      id: 'post_title',
      label: translate('제목'),
      action: (row) => {
        return formatLang(row, 'post_title', currentLang) ?? "---"
      }
    },
    ...((postCategory?.is_able_user_add == 1 && postCategory?.post_category_read_type == 0) ? [
      {
        id: 'writer_nickname',
        label: translate('작성자'),
        action: (row) => {
          return row['writer_nickname'] ?? "---"
        }
      }
    ] : []),
    {
      id: 'created_at',
      label: translate('생성시간'),
      action: (row) => {
        return <>
          <div style={{ color: themeObj.grey[500] }}>
            {row['created_at'].split("T").join(" ").replace("Z", "").split(".")[0] ?? "---"}
          </div>
        </>
      }
    },
    ...((postCategory?.is_able_user_add == 1 && postCategory?.post_category_read_type == 1) ? [
      {
        id: 'replies',
        label: translate('답변여부'),
        action: (row) => {
          return row?.replies.length > 0 ? translate('답변완료') : translate('답변안함')
        }
      }
    ] : []),
    {
      id: 'edit',
      label: translate('자세히보기'),
      action: (row) => {
        return (
          <>
            <IconButton onClick={() => {
              router.push(`/shop/service/${router.query?.article_category}/${row?.id}`)
            }}>
              <Icon icon={row?.user_id == user?.id ? 'material-symbols:edit-outline' : 'bx:detail'} />
            </IconButton>
            {row?.user_id == user?.id &&
              <>
                <IconButton onClick={() => {
                  setModal({
                    func: () => { deletePost(row?.id) },
                    icon: 'material-symbols:delete-outline',
                    title: translate('정말 삭제하시겠습니까?')
                  })
                }}>
                  <Icon icon='material-symbols:delete-outline' />
                </IconButton>
              </>}
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
    setSearchObj(obj);
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiShop('post', 'list', obj);
    setData(data_);
  }
  const deletePost = async (id) => {
    let result = await apiShop('post', 'delete', { id });
    if (result) {
      onChangePage({ ...searchObj });
    }
  }
  return (
    <>
      <Wrappers>
        <Title style={{
          marginBottom: '2rem'
        }}>{formatLang(postCategory, 'post_category_title', currentLang)}</Title>
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
                {translate('전체')}
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
                {formatLang(category, 'post_category_title', currentLang)}
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
                  {formatLang(item, 'post_category_title', currentLang)}
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
                    toast.error(translate("로그인을 해주세요."))
                  }
                }}>
                  {translate('작성')}
                </Button>
              </>}
          </Col>
        </RowMobileColumn>
      </Wrappers>
    </>
  )
}
export default ArticlesDemo