
import { Avatar, Button, Card, Grid, IconButton, Stack, TextField, Tooltip, Typography, alpha } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { base64toFile, getAllIdsWithParents } from "src/utils/function";
import styled from "styled-components";
import dynamic from "next/dynamic";
import { react_quill_data } from "src/data/manager-data";
import { axiosIns } from "src/utils/axios";
import $ from 'jquery';
import Iconify from "src/components/iconify/Iconify";
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const SellerEdit = () => {

  const { themeMode } = useSettingsContext();

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    profile_img: '',
    background_img: '',
    instagram_id: '',
    youtube_channel: '',
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
  const addProfileImg = (e) => {
    if (e.target.files[0]) {
      setItem(
        {
          ...item,
          ['profile_img']: e.target.files[0]
        }
      );
      $('#profile-img').val("");
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
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                      프로필사진 및 배경사진
                    </Typography>
                    <Upload file={item.background_img} onDrop={(acceptedFiles) => {
                      const newFile = acceptedFiles[0];
                      if (newFile) {
                        setItem(
                          {
                            ...item,
                            ['background_img']: Object.assign(newFile, {
                              preview: URL.createObjectURL(newFile),
                            })
                          }
                        );
                      }
                    }} onDelete={() => {
                      setItem(
                        {
                          ...item,
                          ['background_img']: ''
                        }
                      )
                    }}
                      fileExplain={{
                        width: '(800x300 추천)'
                      }}
                      boxStyle={{
                        padding: '0',
                        height: '300px',
                        display: 'flex'
                      }}
                    />
                    <Row style={{ margin: 'auto', transform: 'translateY(-42px)', position: 'relative', flexDirection: 'column', alignItems: 'center' }}>
                      {item.profile_img &&
                        <>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setItem(
                                {
                                  ...item,
                                  ['profile_img']: ''
                                }
                              );
                            }}
                            sx={{
                              top: -16,
                              right: -16,
                              zIndex: 9,
                              position: 'absolute',
                              color: (theme) => alpha(theme.palette.common.white, 0.8),
                              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.72),
                              '&:hover': {
                                bgcolor: (theme) => alpha(theme.palette.grey[900], 0.48),
                              },
                            }}
                          >
                            <Iconify icon="eva:close-fill" width={18} />
                          </IconButton>
                        </>}
                      <Tooltip title={`${item.profile_img ? '' : '프로필사진을 업로드 해주세요.'}`} >
                        <label for='profile-img' style={{ cursor: 'pointer' }}>
                          <Avatar sx={{ width: '84px', height: '84px' }} src={item.profile_img ? `${typeof item.profile_img == 'string' ? item.profile_img : URL.createObjectURL(item.profile_img)}` : ''} />
                        </label>
                      </Tooltip>
                      <input type="file" style={{ display: 'none' }} id='profile-img' onChange={addProfileImg} />
                      <div style={{ marginTop: '1rem', fontWeight: 'bold', height: '24px' }}>{item.instagram_id}</div>
                    </Row>
                  </Stack>
                  <Stack spacing={1}>
                    <TextField
                      label='인스타그램 아이디'
                      value={item.instagram_id}
                      onChange={(e) => {
                        setItem(
                          {
                            ...item,
                            ['instagram_id']: e.target.value
                          }
                        )
                      }} />
                  </Stack>
                  <Stack spacing={1}>
                    <TextField
                      label='유튜브 채널'
                      value={item.youtube_channel}
                      onChange={(e) => {
                        setItem(
                          {
                            ...item,
                            ['youtube_channel']: e.target.value
                          }
                        )
                      }} />
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
SellerEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default SellerEdit
