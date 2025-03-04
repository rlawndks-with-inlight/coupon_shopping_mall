
import { Avatar, Button, Card, CardHeader, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSettingsContext } from "src/components/settings";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiManager } from "src/utils/api";
import { paymentModuleTypeList } from "src/utils/format";
const Tour = dynamic(
    () => import('reactour'),
    { ssr: false },
);
const OrderEdit = () => {
    const { setModal } = useModal()
    const { themeMode } = useSettingsContext();
    const { user } = useAuthContext();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [item, setItem] = useState({
        appr_num: '',
        buyer_name: '',
        buyer_phone: '',
        trx_dt: '',
        trx_tm: '',
    })
    useEffect(() => {
        settingPage();
    }, [])
    const settingPage = async () => {
        if (router.query?.edit_category == 'edit') {
            let data = await apiManager('transactions', 'get', { id: router.query?.id });
            if (data) {
                setItem(data);
            }
            console.log(data)
        }
        setLoading(false);
    }
    const onSave = async () => {
        let result = undefined;
        if (router.query?.edit_category == 'edit') {
            result = await apiManager('transactions', 'update', { ...item, id: router.query?.id });
        } else {
            result = await apiManager('transactions', 'create', item);
        }
        if (result) {
            toast.success("성공적으로 저장 되었습니다.");
            window.location.href = '/manager/orders/trx/all';
        }
    }

    return (
        <>
            {!loading &&
                <>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={12}>
                            <Card sx={{ p: 2, height: '100%' }}>
                                <Stack spacing={3}>
                                    <TextField
                                        label='승인번호'
                                        value={item.appr_num}
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['appr_num']: e.target.value
                                                }
                                            )
                                        }} />
                                    <TextField
                                        label='구매자명'
                                        value={item.buyer_name}
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['buyer_name']: e.target.value
                                                }
                                            )
                                        }} />
                                    <TextField
                                        label='구매자휴대폰번호'
                                        value={item.buyer_phone}
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['buyer_phone']: e.target.value
                                                }
                                            )
                                        }} />
                                    <TextField
                                        label='구매날짜(예: 2024-01-01)'
                                        value={item.trx_dt ?? "---"}
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['trx_dt']: e.target.value
                                                }
                                            )
                                        }} />
                                    <TextField
                                        label='구매시간(예: 01:01:01)'
                                        value={item.trx_tm}
                                        onChange={(e) => {
                                            setItem(
                                                {
                                                    ...item,
                                                    ['trx_tm']: e.target.value
                                                }
                                            )
                                        }} />
                                </Stack>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={12}>
                            <Card sx={{ p: 3 }}>
                                <Stack spacing={1} style={{ display: 'flex' }}>
                                    <Button variant="contained" style={{
                                        height: '48px', width: '120px', marginLeft: 'auto'
                                    }} onClick={() => {
                                        setModal({
                                            func: () => { onSave() },
                                            icon: 'material-symbols:edit-outline',
                                            title: '저장 하시겠습니까?'
                                        })
                                    }}>
                                        저장
                                    </Button>
                                </Stack>
                            </Card>
                        </Grid>
                    </Grid>
                </>}
        </>
    )
}
OrderEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default OrderEdit
