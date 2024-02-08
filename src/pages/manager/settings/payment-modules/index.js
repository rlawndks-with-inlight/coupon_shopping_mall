import { Card, Container, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useModal } from "src/components/dialog/ModalProvider";
import { apiManager } from "src/utils/api";
import { paymentModuleTypeList } from "src/utils/format";

const PaymentModuleList = () => {
  const { setModal } = useModal()
  const defaultColumns = [
    {
      id: 'pay_key',
      label: '결제키',
      action: (row) => {
        return row['pay_key'] ?? "---"
      }
    },
    {
      id: 'mid',
      label: 'MID',
      action: (row) => {
        return row['mid'] ?? "---"
      }
    },
    {
      id: 'tid',
      label: 'TID',
      action: (row) => {
        return row['tid'] ?? "---"
      }
    },
    {
      id: 'virtual_acct_url',
      label: '가상계좌 발급 url',
      action: (row) => {
        return row['virtual_acct_url'] ?? "---"
      }
    },
    {
      id: 'trx_type',
      label: '결제타입',
      action: (row) => {
        return _.find(paymentModuleTypeList, { value: row?.trx_type })?.label ?? "---"
      }
    },
    {
      id: 'is_old_auth',
      label: '비/구인증',
      action: (row) => {
        if (row['is_old_auth'] == 0) {
          return '비인증'
        } else if (row['is_old_auth'] == 1) {
          return '구인증'
        }
        return "---"
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
                router.push(`/manager/settings/payment-modules/edit/${row?.id}`)
              }} />
            </IconButton>
            <IconButton onClick={() => {
              setModal({
                func: () => { deletePaymentModule(row?.id) },
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
    let data_ = await apiManager('payment-modules', 'list', obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
  }
  const deletePaymentModule = async (id) => {
    let result = await apiManager('payment-modules', 'delete', { id: id });
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
            add_button_text={'결제모듈 추가'}
            want_move_card={true}
            table={'payment_modules'}
          />
        </Card>
      </Stack>
    </>
  )
}
PaymentModuleList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default PaymentModuleList
