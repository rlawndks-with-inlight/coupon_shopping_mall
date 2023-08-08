import { Avatar, Card, Container, IconButton, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";
import { deleteSellerByManager, getProductsByManager, getSellersByManager } from "src/utils/api-manager";
import { useModal } from "src/components/dialog/ModalProvider";
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
const SellerList = () => {
  const { setModal } = useModal()
  const defaultColumns = [
    {
      id: 'profile_img',
      label: '유저프로필',
      action: (row) => {
        return <Avatar src={row['profile_img'] ?? "---"} />
      }
    },
    {
      id: 'user_name',
      label: '유저아이디',
      action: (row) => {
        return row['user_name'] ?? "---"
      }
    },
    {
      id: 'nick_name',
      label: '닉네임',
      action: (row) => {
        return row['nick_name'] ?? "---"
      }
    },
    {
      id: 'phone_num',
      label: '휴대폰번호',
      action: (row) => {
        return row['phone_num'] ?? "---"
      }
    },
    {
      id: 'created_at',
      label: '가입일',
      action: (row) => {
        return row['created_at'] ?? "---"
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
                router.push(`sellers/edit/${row?.id}`)
              }} />
            </IconButton>
            <IconButton onClick={() => {
               setModal({
                func: () => { deleteSeller(row?.id) },
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
    category_id: null
  })
  useEffect(() => {
    pageSetting();
  }, [])
  const pageSetting = () => {
    let cols = defaultColumns;
    setColumns(cols)
    onChangePage({...searchObj, page: 1,});
  }
  const onChangePage = async (obj) => {
    setData({
      ...data,
      content: undefined
    })
    let data_ = await getSellersByManager(obj);
    if (data_) {
      setData(data_);
    }
    setSearchObj(obj);
  }
  const deleteSeller = async (id) => {
    let result = await deleteSellerByManager({ id: id });
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
            add_button_text={'셀러 추가'}
          />
        </Card>
      </Stack>
    </>
  )
}
SellerList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default SellerList
