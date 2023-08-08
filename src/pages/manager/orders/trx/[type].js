import { Card, Container, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";
import { deleteTrxByManager, getTrxsByManager } from "src/utils/api-manager";
import { useModal } from "src/components/dialog/ModalProvider";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { commarNumber } from "src/utils/function";


const TrxList = () => {
  const { setModal } = useModal()
  const defaultColumns = [
    {
      id: 'product_img',
      label: '상품이미지',
      action: (row) => {
        return <LazyLoadImage src={row['product_img']} style={{ height: '56px' }} />
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'item_name',
      label: '상품명',
      action: (row) => {
        return row['item_name'] ?? "---"
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'amount',
      label: '구매금액',
      action: (row) => {
        return commarNumber(row['amount'])
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'appr_num',
      label: '승인번호',
      action: (row) => {
        return row['appr_num'] ?? "---"
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'card_num',
      label: '카드번호',
      action: (row) => {
        return row['card_num'] ?? "---"
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'buyer_name',
      label: '구매자명',
      action: (row) => {
        return row['buyer_name'] ?? "---"
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'buyer_phone',
      label: '구매자휴대폰번호',
      action: (row) => {
        return row['buyer_phone'] ?? "---"
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'created_at',
      label: '구매시간',
      action: (row) => {
        return `${row['trx_dt']} ${row['trx_tm']}`
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'updated_at',
      label: '업데이트시간',
      action: (row) => {
        return row['updated_at'] ?? "---"
      },
      sx: (row) => {
        return {
          color: `${row?.is_cancel == 1 ? 'red' : ''}`
        }
      },
    },
    {
      id: 'edit',
      label: `수정/삭제`,
      action: (row) => {
        return (
          <>
            <IconButton>
              <Icon icon='material-symbols:edit-outline' onClick={() => {
                router.push(`default/${row?.id}`)
              }} />
            </IconButton>
            <IconButton onClick={() => {
              setModal({
                func: () => { deleteTrx(row?.id) },
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
    trx_status: ''
  })
  useEffect(() => {
    pageSetting();
  }, [router.query])
  const pageSetting = () => {
    let cols = defaultColumns;
    setColumns(cols)
    onChangePage({ ...searchObj, trx_status: (router.query?.type == 'all' || !router.query?.type) ? '' : router.query?.type, page: 1 });
  }
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    });
    let data_ = await getTrxsByManager(obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
  }
  const deleteTrx = async (id) => {
    let result = await deleteTrxByManager({ id: id });
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
            add_button_text={''}
          />
        </Card>
      </Stack>
    </>
  )
}
TrxList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default TrxList

