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
const InvoiceList = () => {
  const defaultColumns = [
    {
      id: 'name',
      label: '주문번호',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'name',
      label: '구매자아이디',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'name',
      label: '택배사',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'name',
      label: '송장번호',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'name',
      label: '연락처',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'name',
      label: '주문내용',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'name',
      label: '주문시간',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'name',
      label: '결제/입금시간',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'name',
      label: '결제수단',
      action: (row) => {
        return row['name'] ?? "---"
      }
    },
    {
      id: 'name',
      label: '주문상태',
      action: (row) => {
        return row['name'] ?? "---"
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
        <Card>
          <ManagerTable
            data={data}
            columns={columns}
            page={page}
            maxPage={maxPage}
            onChangePage={onChangePage}
            add_button_text={'송장 추가'}
          />
        </Card>
      </Stack>
    </>
  )
}
InvoiceList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default InvoiceList
