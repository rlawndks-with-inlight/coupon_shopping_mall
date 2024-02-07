import { Icon } from "@iconify/react";
import { Button, IconButton } from "@mui/material";
import _ from "lodash";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
import { useModal } from "src/components/dialog/ModalProvider";
import ContentTable from "src/components/elements/content-table";
import { AuthMenuSideComponent, ContentWrappers, TitleComponent } from "src/components/elements/shop/demo-4";
import { Col, RowMobileColumn, RowMobileReverceColumn, Title, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiShop } from "src/utils/api";
import styled from "styled-components";

const Wrappers = styled.div`
max-width:1300px;
display:flex;
flex-direction:column;
margin: 0 auto;
width: 90%;
min-height:90vh;
margin-top: 2rem;
`

const ArticlesDemo = (props) => {

  const { user } = useAuthContext();
  const { setModal } = useModal()
  const router = useRouter();

  const [postCategory, setPostCategory] = useState({});

  const defaultColumns = [
    {
      id: 'post_title',
      label: '제목',
      action: (row) => {
        return row['post_title'] ?? "---"
      }
    },
    ...((postCategory?.is_able_user_add == 1 && postCategory?.post_category_read_type == 0) ? [
      {
        id: 'writer_nickname',
        label: '작성자',
        action: (row) => {
          return row['writer_nickname'] ?? "---"
        }
      }
    ] : []),
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
    ...((postCategory?.is_able_user_add == 1 && postCategory?.post_category_read_type == 1) ? [
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
              <Icon icon={row?.user_id == user?.id ? 'material-symbols:edit-outline' : 'bx:detail'} />
            </IconButton>
            {row?.user_id == user?.id &&
              <>
                <IconButton onClick={() => {
                  setModal({
                    func: () => { deletePost(row?.id) },
                    icon: 'material-symbols:delete-outline',
                    title: '정말 삭제하시겠습니까?'
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
  const { themeMode, themePostCategoryList } = useSettingsContext();
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
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiShop('post', 'list', obj);
    setData(data_);
    setSearchObj(obj);
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
        <RowMobileReverceColumn>
          <AuthMenuSideComponent />
          <ContentWrappers>
            <TitleComponent>{_.find(themePostCategoryList, { id: parseInt(router.query?.article_category) })?.post_category_title}</TitleComponent>
            <ContentTable
              data={data}
              onChangePage={onChangePage}
              searchObj={searchObj}
              columns={columns}
              postCategory={postCategory}
            />
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
          </ContentWrappers>
        </RowMobileReverceColumn>
      </Wrappers>
    </>
  )
}
export default ArticlesDemo