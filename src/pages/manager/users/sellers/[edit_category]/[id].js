
import { Avatar, Button, Card, Grid, IconButton, Stack, TextField, Tooltip, Typography, alpha } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Row, themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { base64toFile, getAllIdsWithParents } from "src/utils/function";
import styled from "styled-components";
import { react_quill_data } from "src/data/manager-data";
import { axiosIns } from "src/utils/axios";
import $ from 'jquery';
import Iconify from "src/components/iconify/Iconify";
import { addSellerByManager, getSellerByManager, updateSellerByManager } from "src/utils/api-manager";
import dynamic from "next/dynamic";
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
    label: '파일 설정'
  }
]
const SellerEdit = () => {

  const { themeMode } = useSettingsContext();

  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    user_name: '',//
    user_pw: '',//
    nick_name: '',//
    mcht_name: 'asd',
    addr: '',
    resident_num: '',
    business_num: '',
    acct_bank_name: '',
    acct_num: '',
    acct_name: '',
    phone_num: '',//
    note: '',
    passbook_file: undefined,
    passbook_img: '',
    contract_file: undefined,
    contract_img: '',
    bsin_lic_file: undefined,
    bsin_lic_img: '',
    id_file: undefined,
    id_img: '',
    profile_file: undefined,
    profile_img: '',
  })
  const [currentTab, setCurrentTab] = useState(0);
  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    if (router.query?.edit_category == 'edit') {
      let data = await getSellerByManager({ id: router.query?.id });
      if (data) {
        setItem(data);
      }
    }
    setLoading(false);
  }
  const addProfileImg = (e) => {
    if (e.target.files[0]) {
      setItem(
        {
          ...item,
          ['profile_file']: e.target.files[0],
        }
      );
      $('#profile-img').val("");
    }
  }
  const onSave = async () => {
    let result = undefined;
    if (router.query?.edit_category == 'edit') {
      result = await updateSellerByManager({ ...item, id: router.query?.id });
    } else {
      result = await addSellerByManager(item);
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push('/manager/users/sellers');
    }
  }
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
                                      ['profile_img']: '',
                                      ['profile_file']: undefined
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
                              {/* <Avatar sx={{ width: '84px', height: '84px' }} src={item.profile_img ? `${typeof item.profile_img == 'string' ? item.profile_img : URL.createObjectURL(item.profile_img)}` : ''} /> */}
                              <Avatar sx={{ width: '84px', height: '84px' }} src={item.profile_file ? URL.createObjectURL(item.profile_file) : item.profile_img} />
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
                        value={item.user_pw}
                        type='password'
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['user_pw']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='닉네임'
                        value={item.nick_name}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['nick_name']: e.target.value
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
                      <TextField
                        label='주소'
                        value={item.addr}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['addr']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='상세주소'
                        value={item.addr_detail}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['addr_detail']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='사업자 번호'
                        value={item.business_num}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['business_num']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='주민등록번호'
                        value={item.resident_num}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['resident_num']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='은행명'
                        value={item.acct_bank_name}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['acct_bank_name']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='은행코드'
                        value={item.acct_bank_code}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['acct_bank_code']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='계좌번호'
                        value={item.acct_num}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['acct_num']: e.target.value
                            }
                          )
                        }} />
                      <TextField
                        label='예금주명'
                        value={item.acct_name}
                        onChange={(e) => {
                          setItem(
                            {
                              ...item,
                              ['acct_name']: e.target.value
                            }
                          )
                        }} />
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
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          통장사본 이미지
                        </Typography>
                        <Upload file={item.passbook_file} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['passbook_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['passbook_file']: undefined,
                              ['passbook_img']: '',
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
                      </Stack>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          계약서 이미지
                        </Typography>
                        <Upload file={item.contract_file} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['contract_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['contract_file']: undefined,
                              ['contract_img']: '',
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
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          사업자등록증 이미지
                        </Typography>
                        <Upload file={item.bsin_lic_file} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['bsin_lic_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['bsin_lic_file']: undefined,
                              ['bsin_lic_img']: '',
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
                      </Stack>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                          신분증 사본 이미지
                        </Typography>
                        <Upload file={item.id_file} onDrop={(acceptedFiles) => {
                          const newFile = acceptedFiles[0];
                          if (newFile) {
                            setItem(
                              {
                                ...item,
                                ['id_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile),
                                })
                              }
                            );
                          }
                        }} onDelete={() => {
                          setItem(
                            {
                              ...item,
                              ['id_file']: undefined,
                              ['id_img']: '',
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
                  }} onClick={onSave}>
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
