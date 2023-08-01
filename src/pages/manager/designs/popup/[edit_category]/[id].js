
import { Button, Card, Grid, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { base64toFile, returnMoment } from "src/utils/function";
import styled from "styled-components";
import dynamic from "next/dynamic";
import { react_quill_data } from "src/data/manager-data";
import { axiosIns } from "src/utils/axios";
import { addPopupByManager, getPopupByManager, updatePopupByManager, uploadFileByManager } from "src/utils/api-manager";
import { toast } from "react-hot-toast";
import {
  DatePicker,
  StaticDatePicker,
  MobileDatePicker,
  DesktopDatePicker,
} from '@mui/x-date-pickers';
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})
import { useModal } from "src/components/dialog/ModalProvider";
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
      let item = await getPopupByManager({
        id: router.query.id
      })
      item['open_s_dt'] = new Date(item?.open_s_dt??"");
      item['open_e_dt'] = new Date(item?.open_e_dt??"");
      setItem(item);
    }
    setLoading(false);
  }
  const onSave = async () => {
    let result = undefined;
    let item_result = {...item};
    if(typeof item_result.open_s_dt == 'object'){
      item_result.open_s_dt = returnMoment(false, item_result.open_s_dt).substring(0, 10);
    }
    if(typeof item_result.open_e_dt == 'object'){
      item_result.open_e_dt = returnMoment(false, item_result.open_e_dt).substring(0, 10);
    }
    if (router.query?.edit_category == 'edit') {
      result = await updatePopupByManager({ ...item_result, id: router.query?.id });
    } else {
      result = await addPopupByManager({ ...item_result });
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
                        console.log(typeof newValue)
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
                      sx={{ marginLeft: '0.5rem', width: '50%'}}
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
                    <ReactQuill
                      className="max-height-editor"
                      theme={'snow'}
                      id={'content'}
                      placeholder={''}
                      value={item.popup_content}
                      modules={react_quill_data.modules}
                      formats={react_quill_data.formats}
                      onChange={async (e) => {
                        let note = e;
                        if (e.includes('<img src="') && e.includes('base64,')) {
                          let base64_list = e.split('<img src="');
                          for (var i = 0; i < base64_list.length; i++) {
                            if (base64_list[i].includes('base64,')) {
                              let img_src = base64_list[i];
                              img_src = await img_src.split(`"></p>`);
                              let base64 = img_src[0];
                              img_src = await base64toFile(img_src[0], 'note.png');
                              let formData = new FormData();
                              formData.append('file', img_src);
                              const response = await uploadFileByManager({
                                formData
                              });
                              note = await note.replace(base64, response?.data?.url)
                            }
                          }
                        }
                        setItem({
                          ...item,
                          ['popup_content']: note
                        });
                      }} />
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
