import { Card, Container, Grid, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { AppWidget } from "src/views/@dashboard/general/app";
import { useTheme } from "@emotion/react";
import _ from 'lodash'
import { BookingCheckInWidgets, BookingWidgetSummary } from "src/views/@dashboard/general/booking";
import { CheckInIllustration, CheckOutIllustration } from "src/assets/illustrations";
import { AnalyticsWidgetSummary } from "src/views/@dashboard/general/analytics";
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
const SaleList = () => {
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
      id: 'phone',
      label: '전화번호',
      action: (row) => {
        return row['phone'] ?? "---"
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
  const test_total = {
    count: 72,
    card_price: 2310000,
    money_price: 12310000
  }
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
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <AnalyticsWidgetSummary
              title="주문"
              total={1352831}
              color="primary"
              icon="solar:bag-4-bold"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <AnalyticsWidgetSummary
              title="총 매출"
              total={test_total.card_price + test_total.money_price}
              color="info"
              label='₩'
              not_use_number_format={true}
              icon="nimbus:money"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <AnalyticsWidgetSummary
              title="카드 매출"
              total={test_total.card_price}
              color="warning"
              label='₩'
              not_use_number_format={true}
              icon="ion:card"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <AnalyticsWidgetSummary
              title="무통장입금 매출"
              total={test_total.money_price}
              color="error"
              label='₩'
              not_use_number_format={true}
              icon="solar:hand-money-outline"
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
            add_button_text={'매출 추가'}
          />
        </Card>
      </Stack>
    </>
  )
}
SaleList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default SaleList
