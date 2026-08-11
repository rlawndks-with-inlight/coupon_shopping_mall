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
    // '상태' 열은 다른 목록에서 복사해 온 잔재였다. post_categories 에는 상태 개념이 없고
    // (post_category.controller 가 저장하는 컬럼: 제목·부모·유저추가·타입·열람대상)
    // 있지도 않은 row['name'] 을 읽고 있어 어느 줄에서나 "---" 만 찍혔다.
    // 대신 상위/하위 관계를 보여 준다 — 목록이 평면이라 구분이 안 되던 자리다.
    {
      id: 'parent_id',
      label: '구분',
      action: (row) => {
        return row['parent_id'] > 0 ? '하위 게시판' : '상위 게시판'
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
    // 게시판 생성·수정·삭제는 백엔드가 레벨50(본사)만 허용한다
    // (post_category.controller 의 create/update/remove 가드).
    // 그런데 이 화면은 레벨과 무관하게 수정·삭제 아이콘을 그려서, 가맹점이 누르면
    // 서버가 거부하는 '눌러도 안 되는 버튼' 이 남아 있었다 — 특히 1:1문의 게시판을
    // 지우려다 실패하는 흐름이 그대로 노출됐다. 권한 있는 계정에게만 보여준다.
    ...(user?.level >= 50 ? [{
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
    }] : []),
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
    setSearchObj(obj);
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('post-categories', 'list', obj);
    if (data_) {
      setData(data_);
    }
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
