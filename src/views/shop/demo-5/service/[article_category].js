import { Icon } from "@iconify/react";
import { Button, IconButton } from "@mui/material";
import _ from "lodash";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ContentTable from "src/components/elements/content-table";
import { AuthMenuSideComponent, ContentWrappers, TitleComponent } from "src/components/elements/shop/demo-5";
import { RowMobileReverceColumn } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiShop } from "src/utils/api";
import styled from "styled-components";

const Wrappers = styled.div`
max-width:1400px;
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
        return (
          <span
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => { router.push(`/shop/service/${router.query?.article_category}/${row?.id}`) }}
          >
            {row['post_title'] ?? "---"}
          </span>
        )
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
    ...((postCategory?.is_able_user_add == 1 && postCategory?.post_category_read_type == 1) ? [
      {
        id: 'replies',
        label: '답변여부',
        action: (row) => {
          return row?.replies.length > 0 ? '답변완료' : '답변안함'
        }
      }
    ] : []),
    ...(postCategory?.is_able_user_add == 1 ? [
      {
        id: 'edit',
        label: '관리',
        action: (row) => {
          if (!(user?.id && row?.user_id == user?.id)) return null;
          if (row?.replies.length > 0) return null; // 답변 완료 후 수정/삭제 잠금(기존 동작 유지)
          return (
            <>
              <IconButton onClick={() => { router.push(`/shop/service/${router.query?.article_category}/${row?.id}`) }}>
                <Icon icon='material-symbols:edit-outline' />
              </IconButton>
              <IconButton onClick={() => { setModal({ func: () => { deletePost(row?.id) }, icon: 'material-symbols:delete-outline', title: '정말 삭제하시겠습니까?' }) }}>
                <Icon icon='material-symbols:delete-outline' />
              </IconButton>
            </>
          )
        }
      }
    ] : []),
  ]
  const { themePostCategoryList } = useSettingsContext();
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