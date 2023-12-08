
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
const PaymentModuleEdit = () => {
  const { setModal } = useModal()
  const { themeMode } = useSettingsContext();
  const { user } = useAuthContext();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    pay_key: '',
    mid: '',
    tid: '',
    trx_type: 1,
    is_old_auth: 0,
  })
  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    if (router.query?.edit_category == 'edit') {
      let data = await apiManager('payment-modules', 'get', { id: router.query?.id });
      if (data) {
        setItem(data);
      }
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined;
    if (router.query?.edit_category == 'edit') {
      result = await apiManager('payment-modules', 'update', { ...item, id: router.query?.id });
    } else {
      result = await apiManager('payment-modules', 'create', item);
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      window.location.href = '/manager/settings/payment-modules';
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
                    label='결제키'
                    value={item.pay_key}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['pay_key']: e.target.value
                        }
                      )
                    }} />
                  <TextField
                    label='MID'
                    value={item.mid}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['mid']: e.target.value
                        }
                      )
                    }} />
                  <TextField
                    label='TID'
                    value={item.tid}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['tid']: e.target.value
                        }
                      )
                    }} />
                  <FormControl>
                    <InputLabel>결제타입</InputLabel>
                    <Select label='결제타입' value={item.trx_type} onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['trx_type']: e.target.value
                        }
                      )
                    }}>
                      {paymentModuleTypeList.map((itm) => {
                        return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                      })}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <InputLabel>비/구인증</InputLabel>
                    <Select label='비/구인증' value={item.is_old_auth} onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['is_old_auth']: e.target.value
                        }
                      )
                    }}>
                      <MenuItem value={0}>비인증</MenuItem>
                      <MenuItem value={1}>구인증</MenuItem>
                    </Select>
                  </FormControl>

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
PaymentModuleEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default PaymentModuleEdit
