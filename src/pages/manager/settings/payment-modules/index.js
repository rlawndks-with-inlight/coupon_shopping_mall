import { Card, Container, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useModal } from "src/components/dialog/ModalProvider";
import { apiManager } from "src/utils/api";
import { paymentModuleTypeList } from "src/utils/format";
import _ from 'lodash';

const PaymentModuleList = () => {
  const { setModal } = useModal()
  // PG 자격증명은 목록에 전체를 찍지 않는다.
  //
  // 결제키·MID·TID 는 그대로 결제 요청에 쓰이는 값이다. 예전엔 표에 평문 전체가 떠서
  // 화면 공유·원격지원·어깨너머로 그대로 새어나갔다. 어느 값이 들어있는지 확인하는 용도로는
  // 앞뒤 일부만 있으면 충분하고, 전체 값은 수정 화면에서 본다.
  const maskSecret = (value) => {
    const v = String(value ?? '');
    if (!v) return "---";
    if (v.length <= 8) return v.slice(0, 2) + '*'.repeat(Math.max(1, v.length - 2));
    return v.slice(0, 4) + '*'.repeat(6) + v.slice(-4);
  };
  const defaultColumns = [
    {
      id: 'pay_key',
      label: '결제키',
      action: (row) => {
        return maskSecret(row['pay_key'])
      }
    },
    {
      id: 'mid',
      label: 'MID',
      action: (row) => {
        return maskSecret(row['mid'])
      }
    },
    {
      id: 'tid',
      label: 'TID',
      action: (row) => {
        return maskSecret(row['tid'])
      }
    },
    {
      id: 'virtual_acct_url',
      label: '무통장입금 발급 url',
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
    setSearchObj(obj);
    let data_ = await apiManager('payment-modules', 'list', obj);
    if (data_) {
      setData(data_);
    }
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
            // 드래그 정렬을 껐다. 백엔드 util/sort 의 ALLOWED_SORT_TABLES 에 payment_modules 가 없어
            // 순서를 바꿀 때마다 500 이 났다. 화이트리스트에 넣더라도 이 테이블에 sort_idx 컬럼이
            // 있는지부터 확인해야 한다(없으면 Unknown column 으로 여전히 실패).
            // 결제모듈은 건수가 적어 순서에 의미가 없으므로 UI 를 없애는 편이 정직하다.
            want_move_card={false}
            table={'payment_modules'}
          />
        </Card>
      </Stack>
    </>
  )
}
PaymentModuleList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default PaymentModuleList
