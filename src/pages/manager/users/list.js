import { Card, Container, Grid, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { AppWidgetSummary } from "src/views/@dashboard/general/app";
import { useTheme } from "@emotion/react";
//매출 리스트
const test_data = [
  {
    id: 1,
    user_name: 'test1',
    phone_num: '01000000000',
  },
  {
    id: 2,
    user_name: 'test2',
    phone_num: '01000000000',
  }
]
const UserList = () => {
  const defaultColumns = [
    {
      id: 'id',
      label: 'No.',
      action: (row) => {
        return row['id']
      }
    },
    {
      id: 'user_name',
      label: '회원아이디',
      action: (row) => {
        return row['user_name'] ?? "---"
      }
    },
    {
      id: 'name',
      label: '이름',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'phone_num',
      label: '전화번호',
      action: (row) => {
        return row['phone_num'] ?? "---"
      }
    },
    {
      id: 'order',
      label: '주문내역',
      action: (row) => {
        return (
          <>
            <IconButton>
              <Icon icon='material-symbols:history' />
            </IconButton>
          </>
        )
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
  const theme = useTheme();
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
        <Grid container spacing={3}>

          <Grid item xs={12} md={3}>
            <AppWidgetSummary
              title="신규회원"
              percent={2.6}
              total={18765}
              chart={{
                colors: [theme.palette.info.main],
                series: [50, 180, 120, 510, 680, 110, 390, 370, 270, 200],
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <AppWidgetSummary
              title="방문회원"
              percent={0.2}
              total={4876}
              chart={{
                colors: [theme.palette.primary.main],
                series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26],
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <AppWidgetSummary
              title="탈퇴회원"
              percent={-0.1}
              total={678}
              chart={{
                colors: [theme.palette.error.main],
                series: [80, 9, 31, 8, 16, 37, 8, 33, 46, 31],
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <AppWidgetSummary
              title="유저수"
              percent={-0.1}
              total={678}
              chart={{
                colors: [theme.palette.warning.main],
                series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31],
              }}
            />
          </Grid>
        </Grid>
        <Card>
          <ManagerTable
            data={data}
            columns={columns}
            page={page}
            maxPage={maxPage}
            onChangePage={onChangePage}
            add_button_text={'회원 추가'}
          />
        </Card>
      </Stack>
    </>
  )
}
UserList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default UserList
