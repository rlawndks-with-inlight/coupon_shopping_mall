import { Card, Container, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";
import { getPostCategoriesByManager, getProductsByManager, getSellersByManager } from "src/utils/api-manager";

const test_items = [
  {
    id: 1,
    post_category_title: '공지사항',
    status: 0,
    created_at: '0000-00-00 00:00:00',
    updated_at: '0000-00-00 00:00:00',
  },
  {
    id: 1,
    post_category_title: '자주묻는질문',
    status: 0,
    created_at: '0000-00-00 00:00:00',
    updated_at: '0000-00-00 00:00:00',
  },
]
const ArticleCategoryList = () => {
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
            <IconButton>
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
    onChangePage(searchObj);
  }
  const onChangePage = async (obj) => {
    let data_ = await getPostCategoriesByManager(obj);
    if (data_) {
      setData(data_);
    } else {
      setData({
        page: obj?.page,
        page_size: obj?.page_size,
        total: 102,
        content: [...test_items]
      })
    }
    setSearchObj(obj);
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
          />
        </Card>
      </Stack>
    </>
  )
}
ArticleCategoryList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ArticleCategoryList
