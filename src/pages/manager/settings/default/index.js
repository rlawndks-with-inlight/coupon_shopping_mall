
import { Avatar, Button, Card, CardHeader, Grid, Stack, Tab, Tabs, TextField, TextareaAutosize, Typography } from "@mui/material";
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
const ReactQuill = dynamic(() => import('react-quill'), {
  ssr: false,
  loading: () => <p>Loading ...</p>,
})

const tab_list = [
  {
    value: 0,
    label: '기본정보'
  },
  {
    value: 1,
    label: '카카오톡 설정'
  }
]
const KakaoWrappers = styled.div`
width:100%;
background:#b3c9db;
min-height:400px;
display:flex;
padding-bottom: 1rem;
`
const BubbleTail = styled.div`

`
const OgWrappers = styled.div`
border-radius:16px;
background:#fff;
margin-top:0.5rem;
width:400px;

`
const OgImg = styled.div`
width:400px;
height:200px;
border-top-right-radius:16px;
border-top-left-radius:16px;
`
const OgDescription = styled.div`
display:flex;
flex-direction:column;
padding:0.5rem;
`
const DefaultSetting = () => {

  const { themeMode } = useSettingsContext();

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);
  const [item, setItem] = useState({
    name: '',
    dns: '',
    og_description: '',
    note: '',
    logo_img: undefined,
    dark_logo_img: undefined,
    favicon_img: undefined,
    passbook_img: undefined,
    contract_img: undefined,
    id_img: undefined,
    og_img: undefined,
  })

  useEffect(() => {

    setLoading(false);
  }, [])
  return (
    <>
      {!loading &&
        <>
          <Row style={{ margin: '0 0 1rem 0', columnGap: '0.5rem' }}>
            {tab_list.map((tab) => (
              <Button
                variant={tab.value == currentTab ? 'contained' : 'outlined'}
                onClick={() => {
                  setCurrentTab(tab.value)
                }}
              >{tab.label}</Button>
            ))}
          </Row>
          <Grid container spacing={3}>
            {currentTab == 0 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <CardHeader title={`브랜드 이미지 설정`} sx={{ padding: '0' }} />
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          브랜드로고
                        </Typography>
                        <Upload file={item.logo_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['logo_img']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['logo_img']: ''
                            }
                          )
                        }}
                        />
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          브랜드 파비콘
                        </Typography>
                        <Upload file={item.favicon_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['favicon_img']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['favicon_img']: ''
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
                        label='브랜드명'
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
                        label='도메인'
                        value={item.dns}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['dns']: e.target.value
                            }
                          )
                        }} />
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          비고
                        </Typography>
                        <ReactQuill
                          className="max-height-editor"
                          theme={'snow'}
                          id={'note'}
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
              </>}
            {currentTab == 1 &&
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <CardHeader title={`카카오 미리보기 설정`} sx={{ padding: '0' }} />
                      </Stack>
                      <TextField
                        fullWidth
                        label="미리보기 디스트립션"
                        multiline
                        rows={4}
                        value={item.og_description}
                        onChange={(e) => {
                          setItem({
                            ...item,
                            ['og_description']: e.target.value
                          })
                        }}
                      />
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          미리보기 이미지
                        </Typography>
                        <Upload file={item.og_img} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['og_img']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['og_img']: ''
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
                      <Stack spacing={1}>
                        <CardHeader title={`카카오톡 링크 전송 시 예시`} sx={{ padding: '0' }} />
                        <KakaoWrappers>
                          <Avatar style={{ margin: '0.5rem' }} />
                          <Row style={{ flexDirection: 'column', marginTop: '0.5rem' }}>
                            <div>사용자</div>
                            <div style={{ background: '#fff', padding: '0.5rem', borderRadius: '16px', color: 'blue', textDecoration: 'underline', width: 'auto', maxWidth: '300px' }}>
                              {window.location.origin}
                            </div>
                            <OgWrappers>
                              {item.og_img ?
                                <>
                                  <OgImg style={{
                                    backgroundImage: `url(${typeof item?.og_img == 'string' ? item?.og_img : URL.createObjectURL(item?.og_img)})`,
                                    backgroundSize: 'cover',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center'
                                  }} />
                                </>
                                :
                                <>
                                </>}
                              <OgDescription>
                                <div>{item?.name ? item?.name : '미리보기가 없습니다.'}</div>
                                <div style={{ fontSize: themeObj.font_size.size8, color: themeObj.grey[700] }}>{item?.og_description ? item?.og_description : '여기를 눌러 링크를 확인하세요.'}</div>
                                <div style={{ fontSize: themeObj.font_size.size9, color: themeObj.grey[500], marginTop: '0.5rem' }}>{window.location.origin}</div>
                              </OgDescription>
                            </OgWrappers>
                          </Row>
                        </KakaoWrappers>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </>}
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
DefaultSetting.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default DefaultSetting
