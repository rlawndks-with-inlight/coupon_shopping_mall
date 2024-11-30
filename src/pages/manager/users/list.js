import { Avatar, Button, Card, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, MenuItem, Select, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import { apiManager } from "src/utils/api";
import { commarNumber } from "src/utils/function";
import { useSettingsContext } from "src/components/settings";
import { userStatusList } from "src/utils/format";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
const UserList = () => {
  const { themeDnsData } = useSettingsContext();
  const { setModal } = useModal()
  const { user } = useAuthContext();
  const defaultColumns = [
    {
      id: 'profile_img',
      label: '유저프로필',
      action: (row) => {
        return <Avatar src={row['profile_img'] ?? "---"} onClick={() => { router.push(`view/${row?.id}`) }} style={{ cursor: 'pointer' }} />
      }
    },
    {
      id: 'user_name',
      label: '아이디',
      action: (row) => {
        return row['user_name'] ?? "---"
      }
    },
    {
      id: `${themeDnsData.id != 5 ? 'nickname' : 'name'}`,
      label: `${themeDnsData.id != 5 ? '닉네임' : '이름'}`,
      action: (row) => {
        return row[`${themeDnsData.id != 5 ? 'nickname' : 'name'}`] ?? "---"
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
      id: 'point',
      label: '보유포인트',
      action: (row) => {
        return commarNumber(row['point'])
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
      id: 'status',
      label: '유저상태',
      action: (row, is_excel) => {
        if (is_excel) {
          return getUserStatusByNum(row?.status)
        }
        return <Select
          size='small'
          value={row?.status}
          disabled={!(user?.level >= 40)}
          onChange={async (e) => {
            let result = await apiManager(`users/change-status`, 'update', {
              id: row?.id,
              status: e.target.value
            });
            if (result) {
              onChangePage(searchObj)
            }
          }}
        >
          {userStatusList.map((itm) => {
            return <MenuItem value={itm.value}>{itm.label}</MenuItem>
          })}
        </Select>
      }
    },
    {
      id: 'edit_password',
      label: '비밀번호 변경',
      action: (row) => {
        return (
          <>
            <IconButton onClick={() => {
              setDialogObj({ ...dialogObj, changePassword: true })
              setChangePasswordObj({
                user_pw: '',
                id: row?.id
              })
            }}>
              <Icon icon='material-symbols:lock-outline' />
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
                router.push(`edit/${row?.id}`)
              }} />
            </IconButton>
            <IconButton onClick={() => {
              setModal({
                func: () => { deleteUser(row?.id) },
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
    is_user: 1,
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

  useEffect(() => {
    onChangePage({ ...router.query }, searchObj)
  }, [
    router.query.page,
    router.query.page_size,
    router.query.s_dt,
    router.query.e_dt,
    router.query.search,
    router.query.order
  ])

  const onChangePage = async (query_ = {}, search_obj_ = {}) => {
    let query = query_;
    let search_obj = search_obj_;

    let query_str = new URLSearchParams(query).toString();
    router.push(`/manager/users/list?${query_str}`);

    setSearchObj({ ...search_obj, ...query });
    setData({
      ...data,
      content: undefined
    })
    let data_ = await apiManager('users', 'list', {
      ...search_obj,
      ...query
    });
    if (data_) {
      setData(data_);
    }
  }
  const deleteUser = async (id) => {
    let result = await apiManager('users', 'delete', { id });
    if (result) {
      onChangePage(searchObj);
    }
  }
  const onChangeUserPassword = async () => {
    let result = await apiManager(`users/change-pw`, 'update', changePasswordObj);
    if (result) {
      setDialogObj({
        ...dialogObj,
        changePassword: false
      })
      toast.success("성공적으로 변경 되었습니다.");
    }
  }
  return (
    <>
      <Dialog
        open={dialogObj.changePassword}
      >
        <DialogTitle>{`비밀번호 변경`}</DialogTitle>

        <DialogContent>
          <DialogContentText>
            새 비밀번호를 입력 후 확인을 눌러주세요.
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            value={changePasswordObj.user_pw}
            type="password"
            margin="dense"
            label="새 비밀번호"
            onChange={(e) => {
              setChangePasswordObj({
                ...changePasswordObj,
                user_pw: e.target.value
              })
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={onChangeUserPassword}>
            변경
          </Button>
          <Button color="inherit" onClick={() => {
            setDialogObj({
              ...dialogObj,
              changePassword: false
            })
          }}>
            취소
          </Button>
        </DialogActions>
      </Dialog>
      <Stack spacing={3}>
        <Card>
          <ManagerTable
            data={data}
            columns={columns}
            searchObj={searchObj}
            onChangePage={onChangePage}
          //add_button_text={'유저 추가'}
          />
        </Card>
      </Stack>
    </>
  )
}
UserList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default UserList
