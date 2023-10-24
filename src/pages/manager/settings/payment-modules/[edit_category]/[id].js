
import { Avatar, Button, Card, CardHeader, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import dynamic from "next/dynamic";

import { addPaymentModuleByManager, addPostCategoryByManager, getPaymentModuleByManager, getPostCategoriesByManager, getPostCategoryByManager, updatePaymentModuleByManager, updatePostCategoryByManager } from "src/utils/api-manager";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
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
    trx_type: 0,
    is_old_auth: 0,
  })
  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    if (router.query?.edit_category == 'edit') {
      let data = await getPaymentModuleByManager({ id: router.query?.id });
      if (data) {
        setItem(data);
      }
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined;
    if (router.query?.edit_category == 'edit') {
      result = await updatePaymentModuleByManager({ ...item, id: router.query?.id });
    } else {
      result = await addPaymentModuleByManager(item);
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
                      <MenuItem value={1}>수기결제</MenuItem>
                      <MenuItem value={2}>인증결제</MenuItem>
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
