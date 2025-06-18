import { Avatar, Button, Card, Container, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, Stack, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import ManagerTable from "src/views/manager/mui/table/ManagerTable";
import { Icon } from "@iconify/react";
import { useRouter } from "next/router";
import { useModal } from "src/components/dialog/ModalProvider";
import { apiManager } from "src/utils/api";
import toast from "react-hot-toast";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
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
const AgentList = () => {
    const { user } = useAuthContext();
    const { setModal } = useModal()
    const defaultColumns = [
        /*{
          id: 'profile_img',
          label: '셀러로고',
          action: (row) => {
            return <Avatar src={row['profile_img'] ?? "---"} />
          }
        },*/
        {
            id: 'user_name',
            label: '영업자명',
            action: (row) => {
                return row['name'] ?? "---"
            }
        },
        /*{
          id: 'nickname',
          label: '닉네임',
          action: (row) => {
            return row['nickname'] ?? "---"
          }
        },*/
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
                                router.push(`agents/edit/${row?.id}`)
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
        category_id: null,
        is_agent: user?.level >= 20 ? 1 /*: user?.level == 20 ? 2*/ : '',
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
        let data_ = await apiManager('users', 'list', obj);
        if (data_) {
            setData(data_);
        }
    }
    const deleteSeller = async (id) => {
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
                        add_button_text={user?.level >= 20 ? '영업자 추가' : ''}
                    />
                </Card>
            </Stack>
        </>
    )
}
AgentList.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default AgentList
