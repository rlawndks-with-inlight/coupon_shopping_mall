import { Card, Container, Grid, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { AppWidget } from "src/views/@dashboard/general/app";
import { useTheme } from "@emotion/react";
import _ from 'lodash'
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
const DeliveryList = () => {
  const defaultColumns = [
    {
      id: 'id',
      label: '주문일',
      action: (row) => {
        return row['id']
      }
    },
    {
      id: 'id',
      label: '주문번호',
      action: (row) => {
        return row['id']
      }
    },
    {
      id: 'id',
      label: '주문자아이디',
      action: (row) => {
        return row['id']
      }
    },
    {
      id: 'id',
      label: '운송장정보',
      action: (row) => {
        return row['id']
      }
    },
    {
      id: '공급사',
      label: '운송장정보',
      action: (row) => {
        return row['id']
      }
    },
    {
      id: '상품명/옵션',
      label: '운송장정보',
      action: (row) => {
        return row['id']
      }
    },
    {
      id: '수량',
      label: '운송장정보',
      action: (row) => {
        return row['id']
      }
    },
  ]
  const test_total = [
    52,
    6,
    12,
    22,
    44,
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
        <Grid container spacing={2}>
          <Grid item xs={12} md={2.4}>
            <AppWidget
              title="배송준비중"
              total={test_total[0]}
              icon="pajamas:status-preparing-borderless"
              chart={{
                series: parseInt(test_total[0] / _.sum(test_total) * 100),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <AppWidget
              title="배송대기"
              total={test_total[1]}
              icon="nimbus:stop"
              chart={{
                series: parseInt(test_total[1] / _.sum(test_total) * 100),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <AppWidget
              title="배송중"
              total={38566}
              icon="icon-park-solid:play"
              chart={{
                series: parseInt(test_total[2] / _.sum(test_total) * 100),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <AppWidget
              title="배송완료"
              total={test_total[3]}
              icon="fluent-mdl2:completed-solid"
              chart={{
                series: parseInt(test_total[3] / _.sum(test_total) * 100),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2.4}>
            <AppWidget
              title="배송취소"
              total={test_total[4]}
              icon="ic:baseline-cancel"
              chart={{
                series: parseInt(test_total[4] / _.sum(test_total) * 100),
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
          />
        </Card>
      </Stack>
    </>
  )
}
DeliveryList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default DeliveryList
