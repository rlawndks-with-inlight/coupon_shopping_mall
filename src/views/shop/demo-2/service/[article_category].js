import { useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';
import ContentTable from 'src/components/elements/content-table';
import { Col, Row, RowMobileColumn, themeObj } from 'src/components/elements/styled-components';
import { useSettingsContext } from 'src/components/settings';
import styled from 'styled-components'
import _ from 'lodash'
import { Button, IconButton, Box, Typography, Divider } from '@mui/material';
import { Icon } from '@iconify/react';
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext';
import { toast } from 'react-hot-toast';
import { apiShop } from 'src/utils/api';
import { useModal } from 'src/components/dialog/ModalProvider';
import { useLocales } from 'src/locales';
import { formatLang } from 'src/utils/format';
const Wrapper = styled.div`
display:flex;
flex-direction:column;
min-height:90vh;
`
const ContentWrapper = styled.div`
max-width:1200px;
width:90%;
margin: 1rem auto;
display:flex;
flex-direction:column;
`
const ColumnMenu = styled.div`
display:flex;
flex-direction: column;
width:220px;
white-space:pre-wrap;
margin-right:2rem;
@media (max-width:1000px){
  display:-webkit-box;
  overflow:auto;
  width:100%;
  flex-direction: row;
  margin-right:0;
  margin-bottom:1.5rem;
}
`
const ArticleCategory = styled.div`
border-bottom:1px solid ${themeObj.grey[300]};
padding:0.75rem 0.25rem;
cursor:pointer;
transition:0.2s;
font-size:0.95rem;
color:${props => props.isSelect ? props => props.selectColor : themeObj.grey[500]};
font-weight:${props => props.isSelect ? '700' : '400'};
&:hover{
  color: ${props => props.isSelect ? '' : props => props.theme.palette.primary.main};
}
@media (max-width:1000px){
  padding:0.5rem 0.75rem;
  border-bottom:2px solid ${props => props.isSelect ? props => props.selectColor : 'transparent'};
  margin-right:0.25rem;
  white-space:nowrap;
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
        return (
          <span
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => { router.push(`/shop/service/${router.query?.article_category}/${row?.id}`) }}
          >
            {formatLang(row, 'post_title', currentLang) ?? "---"}
          </span>
        )
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
            {row['created_at'] ?? "---"}
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
    ...(postCategory?.is_able_user_add == 1 ? [
      {
        id: 'edit',
        label: translate('관리'),
        action: (row) => {
          // 답변이 달린 글은 작성자가 더 이상 손댈 수 없다(서버도 같은 규칙으로 막는다 —
          // back shop.controller post.update/remove). 여기서 열어 두면 눌러도 실패하는 버튼이 된다.
          if (!(user?.id && row?.user_id == user?.id)) return null;
          if (row?.replies?.length > 0) return null;
          return (
            <>
              <IconButton onClick={() => { router.push(`/shop/service/${router.query?.article_category}/${row?.id}`) }}>
                <Icon icon='material-symbols:edit-outline' />
              </IconButton>
              <IconButton onClick={() => { setModal({ func: () => { deletePost(row?.id) }, icon: 'material-symbols:delete-outline', title: translate('정말 삭제하시겠습니까?') }) }}>
                <Icon icon='material-symbols:delete-outline' />
              </IconButton>
            </>
          )
        }
      }
    ] : []),
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
      <Wrapper>
        <ContentWrapper>
          <div style={{ margin: '2.5rem 0 1rem' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {formatLang(postCategory, 'post_category_title', currentLang)}
            </Typography>
          </div>
          <Divider sx={{ mb: 3 }} />
          {postCategory?.children && postCategory?.children.length > 0 &&
            <Row style={{ margin: '0 0 1.5rem', overflowX: 'auto', whiteSpace: 'nowrap', columnGap: '0.5rem' }} className='none-scroll'>
              <Button size="small" onClick={() => {
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
              {postCategory?.children.map((category) => (
                <>
                  <Button size="small" onClick={() => {
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
            </Row>}
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
                <Box
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 3,
                  }}
                >
                  <ContentTable
                    data={data}
                    onChangePage={onChangePage}
                    searchObj={searchObj}
                    columns={columns}
                    postCategory={postCategory}
                  />
                </Box>}
              {postCategory?.is_able_user_add == 1 &&
                <>
                  <Button variant="contained" style={{
                    height: '48px', width: '120px', marginLeft: 'auto'
                  }} onClick={() => {
                    // 비회원도 1:1문의를 남길 수 있다 — 작성 화면에서 이름·연락처·글비밀번호를 받는다.
                  // 여기서 로그인을 요구하면 비회원은 작성 화면에 도달할 방법이 없다.
                  router.push(`/shop/service/${router.query?.article_category}/add`)
                  }}>
                    {translate('작성')}
                  </Button>
                </>}
            </Col>
          </RowMobileColumn>
        </ContentWrapper>
      </Wrapper>
    </>
  )
}
export default ArticlesDemo
