import { Card, Container, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";
//매출 리스트
const test_data = [
  {
    id: 1,
    user_name: 'test1',
    phone: '01000000000',
  },
  {
    id: 2,
    user_name: 'test2',
    phone: '01000000000',
  }
]
const ArticleList = () => {
  const defaultColumns = [
    {
      id: 'main_img',
      label: '메인이미지',
      action: (row) => {
        return row['main_img'] ?? "---"
      }
    },
    {
      id: 'title',
      label: '제목',
      action: (row) => {
        return row['title'] ?? "---"
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
                router.push(`/manager/users/edit/${row?.id}`)
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
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(10);
  useEffect(() => {
    pageSetting();
  }, [])
  const pageSetting = () => {
    let cols = defaultColumns;
    setColumns(cols)
    onChangePage(1);
  }
  const onChangePage = (num) => {
    setPage(num);
    setData(test_data)

  }
  return (
    <>
      <Stack spacing={3}>
        <Card>
          <ManagerTable
            data={data}
            columns={columns}
            page={page}
            maxPage={maxPage}
            onChangePage={onChangePage}
          />
        </Card>
      </Stack>
    </>
  )
}
ArticleList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default ArticleList