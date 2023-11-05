import { Card, Container, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";
import { useModal } from "src/components/dialog/ModalProvider";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { getPostCategoryReadTypeByNumber, getPostCategoryTypeByNumber } from "src/utils/function";
import { apiManager } from "src/utils/api";

const ArticleCategoryList = () => {
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const defaultColumns = [
    {
      id: 'post_category_title',
      label: '카테고리명',
      action: (row) => {
        return row['post_category_title'] ?? "---"
      }
    },
    {
      id: 'status',
      label: '상태',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    ...(user?.level >= 50 ? [{
      id: 'is_able_user_add',
      label: '유저추가가능여부',
      action: (row) => {
        return row['is_able_user_add'] == 1 ? '가능 O' : '가능 X'
      }
    },] : []),
    ...(user?.level >= 50 ? [{
      id: 'post_category_type',
      label: '카테고리타입',
      action: (row) => {
        return getPostCategoryTypeByNumber(row['post_category_type'])
      }
    },] : []),
    ...(user?.level >= 50 ? [{
      id: 'post_category_read_type',
      label: '볼수있는대상',
      action: (row) => {
        return getPostCategoryReadTypeByNumber(row['post_category_read_type'])
      }
    },] : []),
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
      label: '수정/삭제',
      action: (row) => {
        return (
          <>
            <IconButton>
              <Icon icon='material-symbols:edit-outline' onClick={() => {
                router.push(`categories/edit/${row?.id}`)
              }} />
            </IconButton>
            <IconButton onClick={() => {
              setModal({
                func: () => { deletePostCategory(row?.id) },
                icon: 'material-symbols:delete-outline',
                title: '정말 삭제하시겠습니까?'
              })
            }}>
              <Icon icon='material-symbols:delete-outline' />
            </IconButton>
          </>
        )
      }
    },
  ]
  const router = useRouter();
  const [columns, setColumns] = useState([]);
  const [data, setData] = useState({});
  const [searchObj, setSearchObj] = useState({
    page: 1,
    page_size: 10,
    s_dt: '',
    e_dt: '',
    search: '',
    category_id: null
  })
  useEffect(() => {
    pageSetting();
  }, [])
  const pageSetting = () => {
    let cols = defaultColumns;
    setColumns(cols)
    onChangePage({ ...searchObj, page: 1, });
  }
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('post-categories', 'list', obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
  }
  const deletePostCategory = async (id) => {
    let result = await apiManager('post-categories', 'delete', { id });
    if (result) {
      onChangePage(searchObj);
    }
  }
  return (
    <>
      <Stack spacing={3}>
        <Card>
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
            add_button_text={'카테고리 추가'}
            want_move_card={true}
            table={'post_categories'}
          />
        </Card>
      </Stack>
    </>
  )
}
ArticleCategoryList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ArticleCategoryList
