
import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { themeObj } from "src/components/elements/styled-components";
import { useSettingsContext } from "src/components/settings";
import { Upload } from "src/components/upload";
import ManagerLayout from "src/layouts/manager/ManagerLayout";
import { toast } from "react-hot-toast";
import { useModal } from "src/components/dialog/ModalProvider";
import { apiManager } from "src/utils/api";
import { useAuthContext } from "src/layouts/manager/auth/useAuthContext";
import { userLevelList } from "src/utils/format";

const UserEdit = () => {
  const { setModal } = useModal()
  const { themeMode, themeDnsData } = useSettingsContext();

  const { user } = useAuthContext();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState({
    profile_file: undefined,
    user_name: '',
    phone_num: '',
    nickname: '',
    name: '',
    user_pw: '',
    note: '',
    level: 0,
  })

  useEffect(() => {
    settingPage();
  }, [])
  const settingPage = async () => {
    if (router.query?.edit_category == 'edit' || router.query?.edit_category == 'view') {
      let user = await apiManager('users', 'get', {
        id: router.query.id
      })
      setItem(user);
    }
    setLoading(false);
  }

  const onSave = async () => {
    let result = undefined
    if (item?.id) {//수정
      result = await apiManager('users', 'update', item);
    } else {//추가
      result = await apiManager('users', 'create', item);
    }
    if (result) {
      toast.success("성공적으로 저장 되었습니다.");
      router.push('/manager/users/list');
    }
  }

  return (
    <>
      {!loading &&
        <>
          <Grid container spacing={3}>
            {
              router.query?.edit_category == 'edit' ?
                <>
                  <Grid item xs={12} md={6}>
                    <Card sx={{ p: 2, height: '100%' }}>
                      <Stack spacing={3}>
                        <Stack spacing={1}>
                          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                            프로필사진
                          </Typography>
                          <Upload file={item.profile_file || item.profile_img} onDrop={(acceptedFiles) => {
                            const newFile = acceptedFiles[0];
                            if (newFile) {
                              setItem(
                                {
                                  ...item,
                                  ['profile_file']: Object.assign(newFile, {
                                    preview: URL.createObjectURL(newFile),
                                  })
                                }
                              );
                            }
                          }} onDelete={() => {
                            setItem(
                              {
                                ...item,
                                ['profile_img']: '',
                                ['profile_file']: undefined,
                              }
                            )
                          }}
                          />
                          <Typography variant='subtitle2' sx={{ color: 'text.secondary', marginTop: '10px' }}>
                            계약서 사본
                          </Typography>
                          <Upload
                            file={item.contract_file || item.contract_img}
                            onDrop={acceptedFiles => {
                              const newFile = acceptedFiles[0]
                              if (newFile) {
                                setItem({
                                  ...item,
                                  ['contract_file']: Object.assign(newFile, {
                                    preview: URL.createObjectURL(newFile)
                                  })
                                })
                              }
                            }}
                            onDelete={() => {
                              setItem({
                                ...item,
                                ['contract_file']: undefined,
                                ['contract_img']: '',
                              })
                            }}
                          />
                          <Typography variant='subtitle2' sx={{ color: 'text.secondary', marginTop: '10px' }}>
                            사업자등록증 사본
                          </Typography>
                          <Upload
                            file={item.bsin_lic_file || item.bsin_lic_img}
                            onDrop={acceptedFiles => {
                              const newFile = acceptedFiles[0]
                              if (newFile) {
                                setItem({
                                  ...item,
                                  ['bsin_lic_file']: Object.assign(newFile, {
                                    preview: URL.createObjectURL(newFile)
                                  })
                                })
                              }
                            }}
                            onDelete={() => {
                              setItem({
                                ...item,
                                ['bsin_lic_file']: undefined,
                                ['bsin_lic_img']: '',
                              })
                            }}
                          />
                          <Typography variant='subtitle2' sx={{ color: 'text.secondary', marginTop: '10px' }}>
                            주주명부 사본
                          </Typography>
                          <Upload
                            file={item.shareholder_file || item.shareholder_img}
                            onDrop={acceptedFiles => {
                              const newFile = acceptedFiles[0]
                              if (newFile) {
                                setItem({
                                  ...item,
                                  ['shareholder_file']: Object.assign(newFile, {
                                    preview: URL.createObjectURL(newFile)
                                  })
                                })
                              }
                            }}
                            onDelete={() => {
                              setItem({
                                ...item,
                                ['shareholder_file']: undefined,
                                ['shareholder_img']: '',
                              })
                            }}
                          />
                          <Typography variant='subtitle2' sx={{ color: 'text.secondary', marginTop: '10px' }}>
                            등기부 사본
                          </Typography>
                          <Upload
                            file={item.register_file || item.register_img}
                            onDrop={acceptedFiles => {
                              const newFile = acceptedFiles[0]
                              if (newFile) {
                                setItem({
                                  ...item,
                                  ['register_file']: Object.assign(newFile, {
                                    preview: URL.createObjectURL(newFile)
                                  })
                                })
                              }
                            }}
                            onDelete={() => {
                              setItem({
                                ...item,
                                ['register_file']: undefined,
                                ['register_img']: '',
                              })
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
                        {router.query?.edit_category == 'add' &&
                          <>
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
                          </>}
                        {user?.level >= 50 &&
                          <>
                            <FormControl>
                              <InputLabel>볼수 있는 대상</InputLabel>
                              <Select label='볼수 있는 대상' value={item.level} onChange={(e) => {
                                setItem(
                                  {
                                    ...item,
                                    ['level']: e.target.value
                                  }
                                )
                              }}>
                                {userLevelList.map((itm) => {
                                  return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                })}
                              </Select>
                            </FormControl>
                          </>}
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
                          label='이름'
                          value={item.name}
                          placeholder=""
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['name']: e.target.value
                              }
                            )
                          }} />
                        <TextField
                          label='전화번호'
                          value={item.phone_num}
                          placeholder="하이픈(-) 제외 입력"
                          onChange={(e) => {
                            setItem(
                              {
                                ...item,
                                ['phone_num']: e.target.value
                              }
                            )
                          }} />
                        {
                          themeDnsData?.id == 34 &&
                          <>
                            <TextField
                              label='회사명'
                              value={item.company_name}
                              placeholder=""
                              onChange={(e) => {
                                setItem(
                                  {
                                    ...item,
                                    ['company_name']: e.target.value
                                  }
                                )
                              }} />
                            <TextField
                              label='사업자등록번호'
                              value={item.business_num}
                              placeholder=""
                              onChange={(e) => {
                                setItem(
                                  {
                                    ...item,
                                    ['business_num']: e.target.value
                                  }
                                )
                              }} />
                            <TextField
                              label='예금주명'
                              value={item.acct_name}
                              placeholder=""
                              onChange={(e) => {
                                setItem(
                                  {
                                    ...item,
                                    ['acct_name']: e.target.value
                                  }
                                )
                              }} />
                            <TextField
                              label='은행'
                              onChange={(e) => {
                                setItem({ ...item, ['acct_bank_name']: e.target.value })
                              }}
                              value={item.acct_bank_name}
                              select
                            >
                              <MenuItem value='국민'>국민</MenuItem>
                              <MenuItem value='농협'>농협</MenuItem>
                              <MenuItem value='신한'>신한</MenuItem>
                              <MenuItem value='우리'>우리</MenuItem>
                              <MenuItem value='기업'>기업</MenuItem>
                              <MenuItem value='하나'>하나</MenuItem>
                              <MenuItem value='새마을'>새마을</MenuItem>
                              <MenuItem value='부산'>부산</MenuItem>
                              <MenuItem value='대구'>대구</MenuItem>
                              <MenuItem value='신협'>신협</MenuItem>
                              <MenuItem value='제일'>제일</MenuItem>
                              <MenuItem value='경남'>경남</MenuItem>
                              <MenuItem value='광주'>광주</MenuItem>
                              <MenuItem value='수협'>수협</MenuItem>
                              <MenuItem value='전북'>전북</MenuItem>
                              <MenuItem value='시티'>시티</MenuItem>
                              <MenuItem value='산업'>산업</MenuItem>
                            </TextField>
                            <TextField
                              label='계좌번호'
                              onChange={(e) => {
                                setItem({ ...item, ['acct_num']: e.target.value })
                              }}
                              value={item.acct_num}
                              placeholder=""
                            />
                          </>
                        }
                        <Stack spacing={1}>
                          <TextField
                            fullWidth
                            label="고객메모"
                            multiline
                            rows={4}
                            value={item.note}
                            onChange={(e) => {
                              setItem({
                                ...item,
                                ['note']: e.target.value
                              })
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
                </>
                :
                router.query?.edit_category == 'view' ?
                  <>
                    <Grid item xs={12} md={6}>
                      <Card sx={{ p: 2, height: '100%' }}>
                        <Stack spacing={3}>
                          <Stack spacing={1}>
                            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                              프로필사진
                            </Typography>
                            <Upload file={item.profile_file || item.profile_img} onDrop={(acceptedFiles) => {
                              const newFile = acceptedFiles[0];
                              if (newFile) {
                                setItem(
                                  {
                                    ...item,
                                    ['profile_file']: Object.assign(newFile, {
                                      preview: URL.createObjectURL(newFile),
                                    })
                                  }
                                );
                              }
                            }} onDelete={() => {
                              setItem(
                                {
                                  ...item,
                                  ['profile_img']: '',
                                  ['profile_file']: undefined,
                                }
                              )
                            }}
                            />
                            <Typography variant='subtitle2' sx={{ color: 'text.secondary', marginTop: '10px' }} onClick={() => { console.log(item.contract_file || item.contract_img) }}>
                              계약서 사본
                            </Typography>
                            <Upload
                              file={item.contract_file || item.contract_img}
                            />
                            <Typography variant='subtitle2' sx={{ color: 'text.secondary', marginTop: '10px' }}>
                              사업자등록증 사본
                            </Typography>
                            <Upload
                              file={item.bsin_lic_file || item.bsin_lic_img}
                            />
                            <Typography variant='subtitle2' sx={{ color: 'text.secondary', marginTop: '10px' }}>
                              주주명부 사본
                            </Typography>
                            <Upload
                              file={item.shareholder_file || item.shareholder_img}
                            />
                            <Typography variant='subtitle2' sx={{ color: 'text.secondary', marginTop: '10px' }}>
                              등기부 사본
                            </Typography>
                            <Upload
                              file={item.register_file || item.register_img}
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
                            disabled
                          />
                          {router.query?.edit_category == 'add' &&
                            <>
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
                            </>}
                          {user?.level >= 50 &&
                            <>
                              <FormControl>
                                <InputLabel>볼수 있는 대상</InputLabel>
                                <Select label='볼수 있는 대상' value={item.level} disabled>
                                  {userLevelList.map((itm) => {
                                    return <MenuItem value={itm.value}>{itm.label}</MenuItem>
                                  })}
                                </Select>
                              </FormControl>
                            </>}
                          <TextField
                            label='닉네임'
                            value={item.nickname}
                            disabled
                          />
                          <TextField
                            label='이름'
                            value={item.name}
                            disabled
                          />
                          <TextField
                            label='전화번호'
                            value={item.phone_num}
                            disabled
                          />
                          {
                            themeDnsData?.id == 34 &&
                            <>
                              <TextField
                                label='회사명'
                                value={item.company_name}
                                disabled
                              />
                              <TextField
                                label='사업자등록번호'
                                value={item.business_num}
                                disabled
                              />
                              <TextField
                                label='예금주명'
                                value={item.acct_name}
                                disabled
                              />
                              <TextField
                                label='은행'
                                value={item.acct_bank_name}
                                disabled
                              />
                              <TextField
                                label='계좌번호'
                                disabled
                                value={item.acct_num}
                              />
                            </>
                          }
                          <Stack spacing={1}>
                            <TextField
                              fullWidth
                              label="고객메모"
                              multiline
                              rows={4}
                              value={item.note}
                              disabled
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
                            router.push('/manager/users/list');
                          }}>
                            뒤로가기
                          </Button>
                        </Stack>
                      </Card>
                    </Grid>
                  </>
                  :
                  ''
            }
          </Grid>
        </>}
    </>
  )
}
UserEdit.getLayout = (page) => <ManagerLayout>{page}</ManagerLayout>;
export default UserEdit
