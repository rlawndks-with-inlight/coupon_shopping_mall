
import {  Button, Card, Grid,  Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import {themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { base64toFile, getAllIdsWithParents } from "src/utils/function";
import styled from "styled-components";
import dynamic from "next/dynamic";
import { react_quill_data } from "src/data/manager-data";
import { axiosIns } from "src/utils/axios";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const UserEdit = () => {

  const { themeMode } = useSettingsContext();

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    profile_img: '',
    user_name: '',
    password: '',
    name: '',
    nickname: '',
    phone_num: '',
    note: '',
  })

  useEffect(() => {
    setLoading(false);
  }, [])
  return (
    <>
      {!loading &&
        <>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack spacing={3}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      프로필사진
                    </Typography>
                    <Upload file={item.profile_img} onDrop={(acceptedFiles) => {
                      const newFile = acceptedFiles[0];
                      if (newFile) {
                        setItem(
                          {
                            ...item,
                            ['profile_img']: Object.assign(newFile, {
                              preview: URL.createObjectURL(newFile),
                            })
                          }
                        );
                      }
                    }} onDelete={() => {
                      setItem(
                        {
                          ...item,
                          ['profile_img']: ''
                        }
                      )
                    }}

                    />
                  </Stack>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ p: 2, height: '100%' }}>
                <Stack spacing={3}>
                  <TextField
                    label='아이디'
                    value={item.user_name}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['user_name']: e.target.value
                        }
                      )
                    }} />
                    <TextField
                    label='패스워드'
                    value={item.password}
                    type='password'
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['password']: e.target.value
                        }
                      )
                    }} />
                    <TextField
                    label='이름'
                    value={item.name}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['name']: e.target.value
                        }
                      )
                    }} />
                    <TextField
                    label='닉네임'
                    value={item.nickname}
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['nickname']: e.target.value
                        }
                      )
                    }} />
                      <TextField
                    label='전화번호'
                    value={item.phone_num}
                    placeholder="하이픈(-) 제외 입력"
                    type='number'
                    onChange={(e) => {
                      setItem(
                        {
                          ...item,
                          ['phone_num']: e.target.value
                        }
                      )
                    }} />
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      고객메모 (고객에게 노출되지 않습니다.)
                    </Typography>
                    <ReactQuill
                      className="max-height-editor"
                      theme={'snow'}
                      id={'content'}
                      placeholder={''}
                      value={item.note}
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
                              let config = {
                                headers: {
                                  'Content-Type': "multipart/form-data",
                                }
                              };
                              const response = await axiosIns().post('/api/v1/manager/posts/upload', formData, config);
                              note = await note.replace(base64, response?.data?.file)
                            }
                          }
                        }
                        setItem({
                          ...item,
                          ['note']: note
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
UserEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default UserEdit
