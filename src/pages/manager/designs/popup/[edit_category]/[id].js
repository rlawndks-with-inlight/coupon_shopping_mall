
import { Alert, Button, Card, Grid, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { base64toFile, returnMoment } from "src/utils/function";
import styled from "styled-components";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import {
  DatePicker,
  StaticDatePicker,
  MobileDatePicker,
  DesktopDatePicker,
} from '@mui/x-date-pickers';

import { useModal } from "src/components/dialog/ModalProvider";
import ReactQuillComponent from "src/views/manager/react-quill";
import { apiManager } from "src/utils/api";
const PopupEdit = () => {
  const { setModal } = useModal()
  const { themeMode } = useSettingsContext();

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState({})
  const [item, setItem] = useState({
    popup_title: '',
    popup_content: '',
    open_s_dt: new Date(),
    open_e_dt: new Date(),
  })

  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {

    if (router.query?.edit_category == 'edit') {
      let item = await apiManager('popups', 'get',{
        id: router.query.id
      })
      item['open_s_dt'] = new Date(item?.open_s_dt ?? "");
      item['open_e_dt'] = new Date(item?.open_e_dt ?? "");
      setItem(item);
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined;
    let item_result = { ...item };
    if (typeof item_result.open_s_dt == 'object') {
      item_result.open_s_dt = returnMoment(false, item_result.open_s_dt).substring(0, 10);
    }
    if (typeof item_result.open_e_dt == 'object') {
      item_result.open_e_dt = returnMoment(false, item_result.open_e_dt).substring(0, 10);
    }
    if (router.query?.edit_category == 'edit') {
      result = await apiManager('popups', 'update', { ...item_result, id: router.query?.id });
    } else {
      result = await apiManager('popups', 'create', { ...item_result });
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push(`/manager/designs/popup`);
    }
  }
  return (
    <>
      {!loading &&
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack spacing={3}>
                  {/* 팝업이 언제·어디에 뜨는지 화면에 아무 안내가 없었다. 그래서 '저장했는데 안 뜬다'는
                      문의가 반복됐다 — 실제로는 홈에서만, 기간 안에서만, 하루 한 번만 뜬다.
                      (조건: StorefrontPopups 의 isStorefrontHome / shop.controller 의 open_s_dt·open_e_dt) */}
                  <Alert severity="info" sx={{ fontSize: '0.8rem' }}>
                    팝업은 <b>홈 화면에서만</b> 뜹니다(상품·게시판 등 다른 화면에는 나오지 않습니다).<br />
                    아래 <b>시작일~종료일 안</b>에 있을 때만 노출되며, 고객이 <b>‘오늘 하루 보지않기’</b>를 누르면 그날은 다시 뜨지 않습니다.
                  </Alert>
                  <TextField
                    label='제목'
                    value={item.popup_title}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['popup_title']: e.target.value
                        }
                      )
                    }} />
                  <Row>
                    <DesktopDatePicker
                      label="시작일 선택"
                      value={item.open_s_dt}
                      format='yyyy-MM-dd'
                      onChange={(newValue) => {
                        setItem(
                          {
                            ...item,
                            ['open_s_dt']: newValue
                          }
                        )
                      }}
                      renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                      sx={{ marginRight: '0.5rem', width: '50%' }}
                    />
                    <DesktopDatePicker
                      label="종료일 선택"
                      value={item.open_e_dt}
                      format='yyyy-MM-dd'
                      onChange={(newValue) => {
                        setItem(
                          {
                            ...item,
                            ['open_e_dt']: newValue
                          }
                        )
                      }}
                      renderInput={(params) => <TextField fullWidth {...params} margin="normal" />}
                      sx={{ marginLeft: '0.5rem', width: '50%' }}
                    />
                  </Row>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack spacing={3}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      상세설명
                    </Typography>

                    <ReactQuillComponent
                      value={item.popup_content}
                      setValue={(value) => {
                        setItem({
                          ...item,
                          ['popup_content']: value
                        });
                      }}
                    />
                  </Stack>
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
PopupEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default PopupEdit
