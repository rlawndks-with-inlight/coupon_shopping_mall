
import { Avatar, Button, Card, CardHeader, FormControl, Grid, InputLabel, MenuItem, Select, Stack, Switch, TextField, Typography, } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSettingsContext } from "src/components/settings";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { apiManager } from "src/utils/api";
import { paymentModuleTypeList, forspayMethodList, forspayProviderList } from "src/utils/format";
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
  // 포스페이(41) 수단별 노출/PG 라우팅 설정
  const [forspayCfg, setForspayCfg] = useState({ methods: {} });
  const isForspayMethodEnabled = (m) => {
    const mc = forspayCfg?.methods?.[m.key];
    if (mc && typeof mc.enabled !== 'undefined') return !!mc.enabled;
    return !m.pending; // 설정 없으면 pending(삼성페이) 제외 기본 활성
  };
  const getForspayProvider = (key) => {
    const p = forspayCfg?.methods?.[key]?.provider;
    return (p === undefined || p === null) ? '' : p;
  };
  const setForspayMethod = (key, patch) => {
    setForspayCfg((prev) => ({
      ...prev,
      methods: { ...(prev?.methods || {}), [key]: { ...(prev?.methods?.[key] || {}), ...patch } },
    }));
  };
  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    if (router.query?.edit_category == 'edit') {
      let data = await apiManager('payment-modules', 'get', { id: router.query?.id });
      if (data) {
        setItem(data);
        if (data?.forspay_config) {
          try { setForspayCfg(JSON.parse(data.forspay_config) || { methods: {} }); } catch (e) { /* noop */ }
        }
      }
    }
    setLoading(false);
  }
  const onSave = async () => {
    let payload = { ...item };
    if (item?.trx_type == 41) {
      // 수단별 설정을 실제로 지정한 경우에만 전송 (미설정이면 컬럼 없이도 저장 가능 → 단일 PG 테스트는 ALTER 불필요)
      const methods = forspayCfg?.methods || {};
      if (Object.keys(methods).length > 0) {
        payload.forspay_config = JSON.stringify({ methods });
      }
    }
    let result = undefined;
    if (router.query?.edit_category == 'edit') {
      result = await apiManager('payment-modules', 'update', { ...payload, id: router.query?.id });
    } else {
      result = await apiManager('payment-modules', 'create', payload);
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
                  {item?.trx_type == 41 &&
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>포스페이 결제수단 · PG 라우팅</Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                        구매자에게 노출할 결제수단을 켜고, 각 수단이 어느 PG(페이레터/나이스 등)로 처리될지 지정합니다. PG를 &apos;기본&apos;으로 두면 위 MID값(또는 포스페이 자동 라우팅)을 따릅니다.
                      </Typography>
                      <Stack spacing={1.5}>
                        {forspayMethodList.map((m) => {
                          const enabled = isForspayMethodEnabled(m);
                          return (
                            <Grid container spacing={1} alignItems="center" key={m.key}>
                              <Grid item xs={12} sm={5}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Switch
                                    size="small"
                                    checked={enabled}
                                    onChange={(e) => setForspayMethod(m.key, { enabled: e.target.checked })}
                                  />
                                  <Typography variant="body2">{m.label}</Typography>
                                </Stack>
                              </Grid>
                              <Grid item xs={12} sm={7}>
                                <FormControl fullWidth size="small" disabled={!enabled}>
                                  <InputLabel shrink>PG</InputLabel>
                                  <Select
                                    label="PG"
                                    displayEmpty
                                    notched
                                    value={getForspayProvider(m.key)}
                                    onChange={(e) => setForspayMethod(m.key, { provider: e.target.value })}
                                  >
                                    {forspayProviderList.map((p) => (
                                      <MenuItem key={String(p.value)} value={p.value}>{p.label}</MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </Grid>
                            </Grid>
                          );
                        })}
                      </Stack>
                    </Card>}
                  {item?.trx_type == 10 &&
                    <>
                      <TextField
                        label='무통장입금 발급 url'
                        value={item.virtual_acct_url}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['virtual_acct_url']: e.target.value
                            }
                          )
                        }} />
                      <div>
                        발급 url이 없을 시 아래 정보 입력
                      </div>
                      <TextField
                        label='무통장입금 예금은행'
                        value={item.virtual_acct_bank}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['virtual_acct_bank']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='무통장입금 예금주'
                        value={item.virtual_acct_name}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['virtual_acct_name']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='무통장입금 계좌번호'
                        value={item.virtual_acct_num}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['virtual_acct_num']: e.target.value
                            }
                          )
                        }} />
                    </>}
                  {item?.trx_type == 11 &&
                    <>
                      <TextField
                        label='상품권결제 발급 url'
                        value={item.gift_certificate_url}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['gift_certificate_url']: e.target.value
                            }
                          )
                        }} />
                    </>}
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
