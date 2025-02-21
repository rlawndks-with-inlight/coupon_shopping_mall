import { Avatar, Button, Card, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { Row } from "src/components/elements/styled-components";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { commarNumber, getPointType } from "src/utils/function";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { apiManager } from "src/utils/api";
const PointList = () => {
  const { setModal } = useModal()
  const defaultColumns = [
    {
      id: 'product_id',
      label: '상품 No.',
      action: (row) => {
        return commarNumber(row['product_id'])
      }
    },
    {
      id: 'product_name',
      label: '상품명',
      action: (row) => {
        return row['product_name']
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
      id: 'created_at',
      label: '생성일',
      action: (row) => {
        return row['created_at'].split("T").join(" ").replace("Z", "").split(".")[0] ?? "---" ?? "---"
      }
    },
    {
      id: 'edit',
      label: '삭제',
      action: (row) => {
        return (
          <>
            <IconButton onClick={() => {
              setModal({
                func: () => { deleteItem(row?.id) },
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
  const [dialogObj, setDialogObj] = useState({
    changePassword: false,
  })
  const [changePasswordObj, setChangePasswordObj] = useState({
    id: '',
    user_pw: ''
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
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('user-wishs', 'list', obj);
    if (data_) {
      setData(data_);
    }
  }
  const deleteItem = async (id) => {
    let data = await apiManager('user-wishs', 'delete', { id });
    if (data) {
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
PointList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default PointList
