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

const PhoneRegistration = () => {
    const { user } = useAuthContext();
    const { setModal } = useModal()
    const defaultColumns = [
        {
            id: 'seller_id',
            label: '셀러몰',
            action: (row) => {
                return <div
                    style={{ cursor: 'pointer', color: 'blue' }}
                    onClick={() => {
                        //console.log(row)
                        window.open('https://' + row['dns'] ?? '---')
                    }}
                >
                    {`${row['dns'] ?? '---'}`}
                </div>
            }
        },
        {
            id: 'phone_number',
            label: '휴대폰번호',
            action: (row) => {
                return row['phone_number'] ?? "---"
            }
        },
        {
            id: 'created_at',
            label: '가입가능 설정일',
            action: (row) => {
                return row['created_at'] ?? "---"
            }
        },
        {
            id: 'edit',
            label: '삭제',
            action: (row) => {
                return (
                    <>
                        <IconButton onClick={() => {
                            console.log(row);
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
        let data_ = await apiManager('phone-registration', 'list', obj);
        if (data_) {
            setData(data_);
        }
    }
    const deleteSeller = async (id) => {
        let result = await apiManager('phone-registration', 'delete', { id });
        if (result) {
            onChangePage(searchObj);
        }
    }
    /*const onChangeUserPassword = async () => {
        let result = await apiManager(`phone-registration/change-pw`, 'update', changePasswordObj);
        if (result) {
            setDialogObj({
                ...dialogObj,
                changePassword: false
            })
            toast.success("성공적으로 변경 되었습니다.");
        }
    }*/
    return (
        <>
            <Stack spacing={3}>
                <Card>
                    <ManagerTable
                        data={data}
                        columns={columns}
                        searchObj={searchObj}
                        onChangePage={onChangePage}
                        add_button_text={'가입 가능 번호 추가'}
                        type={'dialog'}
                    />
                </Card>
            </Stack>
        </>
    )
}
PhoneRegistration.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default PhoneRegistration