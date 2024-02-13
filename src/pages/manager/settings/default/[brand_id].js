import {
  Avatar,
  Button,
  Card,
  CardHeader,
  Checkbox,
  CircularProgress,
  Dialog,
  FormControl,
  FormControlLabel,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Switch,
  TextField,
  TextareaAutosize,
  Typography
} from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { useSettingsContext } from 'src/components/settings'
import { Upload } from 'src/components/upload'
import ManagerLayout from 'src/layouts/manager/ManagerLayout'
import styled from 'styled-components'
import { defaultManagerObj } from 'src/data/manager-data'
import { toast } from 'react-hot-toast'
import { useModal } from 'src/components/dialog/ModalProvider'
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext'
import ReactQuillComponent from 'src/views/manager/react-quill'
import { apiManager } from 'src/utils/api'
import { BLOG_DEMO_DATA, DEMO_DATA, SHOP_DEMO_DATA } from 'src/data/data'
import { allLangs } from 'src/locales'

const KakaoWrappers = styled.div`
  width: 100%;
  background: #b3c9db;
  min-height: 400px;
  display: flex;
  padding-bottom: 1rem;
`
const BubbleTail = styled.div``
const OgWrappers = styled.div`
  border-radius: 16px;
  background: #fff;
  margin-top: 0.5rem;
  width: 400px;
`
const OgImg = styled.div`
  width: 400px;
  height: 200px;
  border-top-right-radius: 16px;
  border-top-left-radius: 16px;
`
const OgDescription = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
`
const DefaultSetting = () => {
  const { setModal } = useModal()
  const { themeMode, themeDnsData } = useSettingsContext()
  const { user } = useAuthContext()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState(0)
  const [item, setItem] = useState(defaultManagerObj.brands)
  const [saveLoading, setSaveLoading] = useState(false)
  const [useBasicInfo, setUseBasicInfo] = useState(false)

  const tab_list = [
    {
      value: 0,
      label: '기본정보'
    },
    {
      value: 1,
      label: '카카오톡 설정'
    },
    {
      value: 2,
      label: '회사정보'
    },
    ...(router.query?.brand_id == 'add'
      ? [
        {
          value: 3,
          label: '사용할 본사 계정'
        }
      ]
      : []),
    ...(user?.level >= 50
      ? [
        {
          value: 4,
          label: '데모설정'
        }
      ]
      : []),
    ...(user?.level >= 40
      ? [
        {
          value: 5,
          label: '포인트설정'
        }
      ]
      : []),
    ...(user?.level >= 50
      ? [
        {
          value: 6,
          label: 'SEO설정'
        }
      ]
      : []),
    ...(user?.level >= 50
      ? [
        {
          value: 7,
          label: '발송번호설정'
        }
      ]
      : []),
    ...(user?.level >= 50
      ? [
        {
          value: 8,
          label: '배송비설정'
        }
      ]
      : []),
    /*...(user?.level >= 40
      ? [
        {
          value: 9,
          label: '기본정보설정'
        }
      ]
      : []),*/
  ]

  useEffect(() => {
    setLoading(true)
    if (Object.keys(router.query).length > 0) {
      settingPage()
    }
  }, [router.query])
  const settingBrandObj = (item, brand_data) => {
    let obj = item
    let brand_data_keys = Object.keys(brand_data)
    for (var i = 0; i < brand_data_keys.length; i++) {
      if (brand_data[brand_data_keys[i]]) {
        if (typeof obj[brand_data_keys[i]] == 'object') {
          obj[brand_data_keys[i]] = Object.assign(obj[brand_data_keys[i]], brand_data[brand_data_keys[i]])
        } else {
          obj[brand_data_keys[i]] = brand_data[brand_data_keys[i]]
        }
      }
    }
    return obj
  }
  const settingPage = async () => {
    if (router.query?.brand_id != 'add') {
      let brand_data = await apiManager('brands', 'get', {
        id: router.query.brand_id || themeDnsData?.id
      })
      brand_data = settingBrandObj(item, brand_data)
      setItem(brand_data)
    }
    setLoading(false)
  }
  const onSave = async () => {

    let result = undefined
    let obj = item
    if (obj?.id) {
      //수정
      setSaveLoading(true);
      result = await apiManager('brands', 'update', { ...obj, id: obj?.id })
    } else {
      //추가
      if (!obj?.user_name || !obj?.user_pw || !obj?.seller_name || !obj?.user_pw_check) {
        toast.error('본사 계정정보를 입력해 주세요.')
        return
      }
      if (obj?.user_pw != obj?.user_pw_check) {
        toast.error('본사 비밀번호가 일치하지 않습니다.')
        return
      }
      setSaveLoading(true);
      result = await apiManager('brands', 'create', { ...obj })
    }
    if (result) {
      toast.success('성공적으로 저장 되었습니다.')
      window.location.reload()
    }
  }
  return (
    <>
      <Dialog
        open={saveLoading}
        onClose={() => {
          setSaveLoading(false)
        }}
        PaperProps={{
          style: {
            background: 'transparent',
            overflow: 'hidden'
          }
        }}
      >
        <CircularProgress />
      </Dialog>
      {!loading && (
        <>
          <Row style={{ margin: '0 0 1rem 0', columnGap: '0.5rem' }}>
            {tab_list.map(tab => (
              <Button
                variant={tab.value == currentTab ? 'contained' : 'outlined'}
                onClick={() => {
                  setCurrentTab(tab.value)
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Row>
          <Grid container spacing={3}>
            {currentTab == 0 && (
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <CardHeader title={`브랜드 이미지 설정`} sx={{ padding: '0' }} />
                        <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                          브랜드로고
                        </Typography>
                        <Upload
                          file={item.logo_file || item.logo_img}
                          onDrop={acceptedFiles => {
                            const newFile = acceptedFiles[0]
                            if (newFile) {
                              setItem({
                                ...item,
                                ['logo_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile)
                                })
                              })
                            }
                          }}
                          onDelete={() => {
                            setItem({
                              ...item,
                              ['logo_img']: '',
                              ['logo_file']: undefined
                            })
                          }}
                        />
                        <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                          브랜드 다크모드 로고
                        </Typography>
                        <Upload
                          file={item.dark_logo_file || item.dark_logo_img}
                          onDrop={acceptedFiles => {
                            const newFile = acceptedFiles[0]
                            if (newFile) {
                              setItem({
                                ...item,
                                ['dark_logo_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile)
                                })
                              })
                            }
                          }}
                          onDelete={() => {
                            setItem({
                              ...item,
                              ['dark_logo_img']: '',
                              ['dark_logo_file']: undefined
                            })
                          }}
                        />
                        <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                          브랜드 파비콘
                        </Typography>
                        <Upload
                          file={item.favicon_file || item.favicon_img}
                          onDrop={acceptedFiles => {
                            const newFile = acceptedFiles[0]
                            if (newFile) {
                              setItem({
                                ...item,
                                ['favicon_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile)
                                })
                              })
                            }
                          }}
                          onDelete={() => {
                            setItem({
                              ...item,
                              ['favicon_img']: '',
                              ['favicon_file']: undefined
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
                        label='쇼핑몰명'
                        value={item.name}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['name']: e.target.value
                          })
                        }}
                      />
                      <TextField
                        label='도메인'
                        value={item.dns}
                        disabled={user?.level < 50}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['dns']: e.target.value
                          })
                        }}
                      />
                      <TextField
                        label='메인색상'
                        value={item.theme_css.main_color}
                        type='color'
                        style={{
                          border: 'none'
                        }}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['theme_css']: {
                              ...item.theme_css,
                              main_color: e.target.value
                            }
                          })
                        }}
                      />
                      <Row>
                        <TextField
                          size='medium'
                          sx={{ maxWidth: '200px', marginRight: '2rem' }}
                          label='메인상품 출력 행 갯수'
                          type='number'
                          value={item?.slider_css?.rows ?? 0}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['slider_css']: {
                                ...item?.slider_css,
                                ['rows']: e.target.value
                              }
                            })
                          }}
                          InputProps={{
                            endAdornment: <>개</>
                          }}
                        />
                        <TextField
                          size='medium'
                          sx={{ maxWidth: '200px' }}
                          label='메인슬라이더 이동 주기'
                          type='number'
                          value={item?.slider_css?.autoplay_speed ?? 0}
                          //defaultValue={item?.style?.margin_top ?? 10}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['slider_css']: {
                                ...item?.slider_css,
                                ['autoplay_speed']: e.target.value
                              }
                            })
                          }}
                          InputProps={{
                            endAdornment: <>초</>
                          }}
                        />
                      </Row>
                      <div>
                        <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                          상품 탭에 기본정보 사용
                        </Typography>
                        <Switch
                          sx={{ marginLeft: '-10px' }}
                          defaultChecked={item?.show_basic_info ? true : false}
                          onChange={() => {
                            setItem({
                              ...item,
                              ['show_basic_info']: item?.show_basic_info ? 0 : 1
                            })
                          }
                        }
                        />
                      </div>
                      {item?.show_basic_info ?
                      <>
                      <Stack spacing={1}>
                        <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                          기본정보
                        </Typography>
                        <ReactQuillComponent
                          value={item.basic_info}
                          setValue={value => {
                            setItem({
                              ...item,
                              ['basic_info']: value
                            })
                          }}
                        />
                      </Stack>
                      </>
                      :
                      ""
                      }
                      <Stack spacing={1}>
                        <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                          비고
                        </Typography>
                        <ReactQuillComponent
                          value={item.note}
                          setValue={value => {
                            setItem({
                              ...item,
                              ['note']: value
                            })
                          }}
                        />
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </>
            )}
            {currentTab == 1 && (
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <CardHeader title={`카카오 미리보기 설정`} sx={{ padding: '0' }} />
                      </Stack>
                      <TextField
                        fullWidth
                        label='미리보기 디스트립션'
                        multiline
                        rows={4}
                        value={item.og_description}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['og_description']: e.target.value
                          })
                        }}
                      />
                      <Stack spacing={1}>
                        <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                          미리보기 이미지
                        </Typography>
                        <Upload
                          file={item.og_file || item.og_img}
                          onDrop={acceptedFiles => {
                            const newFile = acceptedFiles[0]
                            if (newFile) {
                              setItem({
                                ...item,
                                ['og_file']: Object.assign(newFile, {
                                  preview: URL.createObjectURL(newFile)
                                })
                              })
                            }
                          }}
                          onDelete={() => {
                            setItem({
                              ...item,
                              ['og_img']: '',
                              ['og_file']: undefined
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
                      <Stack spacing={1}>
                        <CardHeader title={`카카오톡 링크 전송 시 예시`} sx={{ padding: '0' }} />
                        <KakaoWrappers>
                          <Avatar style={{ margin: '0.5rem' }} />
                          <Row style={{ flexDirection: 'column', marginTop: '0.5rem' }}>
                            <div>사용자</div>
                            <div
                              style={{
                                background: '#fff',
                                padding: '0.5rem',
                                borderRadius: '16px',
                                color: 'blue',
                                textDecoration: 'underline',
                                width: 'auto',
                                maxWidth: '300px'
                              }}
                            >
                              {window.location.origin}
                            </div>
                            <OgWrappers>
                              {item?.og_img || item?.og_file ? (
                                <>
                                  <OgImg
                                    style={{
                                      backgroundImage: `url(${item?.og_file ? URL.createObjectURL(item?.og_file) : item?.og_img
                                        })`,
                                      backgroundSize: 'cover',
                                      backgroundRepeat: 'no-repeat',
                                      backgroundPosition: 'center'
                                    }}
                                  />
                                </>
                              ) : (
                                <></>
                              )}
                              <OgDescription>
                                <div>{item?.name ? item?.name : '미리보기가 없습니다.'}</div>
                                <div
                                  style={{
                                    fontSize: themeObj.font_size.size8,
                                    color: themeObj.grey[700],
                                    wordBreak: 'break-all'
                                  }}
                                >
                                  {item?.og_description ? item?.og_description : '여기를 눌러 링크를 확인하세요.'}
                                </div>
                                <div
                                  style={{
                                    fontSize: themeObj.font_size.size9,
                                    color: themeObj.grey[500],
                                    marginTop: '0.5rem'
                                  }}
                                >
                                  {window.location.origin}
                                </div>
                              </OgDescription>
                            </OgWrappers>
                          </Row>
                        </KakaoWrappers>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>
              </>
            )}
            {currentTab == 2 && (
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label='회사명'
                        value={item.company_name}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['company_name']: e.target.value
                          })
                        }}
                      />
                      <TextField
                        label='사업자번호'
                        value={item.business_num}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['business_num']: e.target.value
                          })
                        }}
                      />
                      <TextField
                        label='주민등록번호'
                        value={item.resident_num}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['resident_num']: e.target.value
                          })
                        }}
                      />
                      <TextField
                        label='대표자명'
                        value={item.ceo_name}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['ceo_name']: e.target.value
                          })
                        }}
                      />
                      <TextField
                        label='개인정보 책임자명'
                        value={item.pvcy_rep_name}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['pvcy_rep_name']: e.target.value
                          })
                        }}
                      />
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label='주소'
                        value={item.addr}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['addr']: e.target.value
                          })
                        }}
                      />
                      <TextField
                        label='휴대폰번호'
                        value={item.phone_num}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['phone_num']: e.target.value
                          })
                        }}
                      />
                      <TextField
                        label='팩스번호'
                        value={item.fax_num}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['fax_num']: e.target.value
                          })
                        }}
                      />
                    </Stack>
                  </Card>
                </Grid>
              </>
            )}
            {currentTab == 4 && (
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <FormControl>
                        <InputLabel>쇼핑몰 데모넘버</InputLabel>
                        <Select
                          label='쇼핑몰 데모넘버'
                          value={item.setting_obj?.shop_demo_num}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                shop_demo_num: e.target.value
                              }
                            })
                          }}
                        >
                          <MenuItem value={0}>사용안함</MenuItem>
                          {SHOP_DEMO_DATA.map((item, idx) => {
                            return <MenuItem value={item.value}>{item.title}</MenuItem>
                          })}
                        </Select>
                      </FormControl>

                      <FormControl>
                        <InputLabel>블로그 데모넘버</InputLabel>
                        <Select
                          label='블로그 데모넘버'
                          value={item.setting_obj?.blog_demo_num}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                blog_demo_num: e.target.value
                              }
                            })
                          }}
                        >
                          <MenuItem value={0}>사용안함</MenuItem>
                          {BLOG_DEMO_DATA.map((item, idx) => {
                            return <MenuItem value={item.value}>{item.title}</MenuItem>
                          })}
                        </Select>
                      </FormControl>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj?.is_use_seller == 1} />} label="셀러 사용여부"
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                is_use_seller: e.target.checked ? 1 : 0
                              }
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj?.is_use_consignment == 1} />} label="위탁 사용여부"
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                is_use_consignment: e.target.checked ? 1 : 0
                              }
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj?.is_use_item_card_style == 1} />} label="상품카드스타일 사용여부"
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                is_use_item_card_style: e.target.checked ? 1 : 0
                              }
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj?.is_use_shop_obj_style == 1} />} label="메인페이지 스타일 사용여부"
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                is_use_shop_obj_style: e.target.checked ? 1 : 0
                              }
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj?.is_use_blog_obj_style == 1} />} label="블로그 메인페이지 스타일 사용여부"
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                is_use_blog_obj_style: e.target.checked ? 1 : 0
                              }
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item.setting_obj?.is_use_lang == 1} />} label="언어팩 사용여부"
                          onChange={(e) => {
                            let obj = {
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                is_use_lang: e.target.checked ? 1 : 0,
                              }
                            }
                            if (e.target.checked) {

                            } else {
                              obj.setting_obj.lang_list = [];
                              obj.setting_obj.default_lang = '';
                            }
                            setItem(obj)
                          }}
                        />
                        {item.setting_obj?.is_use_lang == 1 &&
                          <>
                            <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                              사용할 언어
                            </Typography>
                            <Row style={{ flexWrap: 'wrap' }}>
                              {allLangs.map((itm) => (
                                <>
                                  <FormControlLabel
                                    label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>{itm.label}</Typography>}
                                    control={<Checkbox checked={(item.setting_obj?.lang_list ?? []).includes(itm.value)} />}
                                    onChange={(e) => {
                                      let obj = { ...item };
                                      if (!obj.setting_obj?.lang_list) {
                                        obj.setting_obj.lang_list = [];
                                      }
                                      if (e.target.checked == 1) {
                                        obj.setting_obj.lang_list.push(itm.value)
                                      } else {
                                        let find_idx = obj.setting_obj.lang_list.indexOf(itm.value);
                                        obj.setting_obj.lang_list.splice(find_idx, 1);
                                      }
                                      setItem({ ...obj });
                                    }}
                                  />
                                </>
                              ))}
                            </Row>
                            <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                              기본 언어
                            </Typography>
                            <RadioGroup>
                              <Row style={{ flexWrap: 'wrap' }}>
                                {allLangs.map((itm) => (
                                  <>
                                    <FormControlLabel
                                      label={<Typography style={{ fontSize: themeObj.font_size.size6 }}>{itm.label}</Typography>}
                                      control={<Radio checked={item.setting_obj?.default_lang == itm.value} />}
                                      onChange={(e) => {
                                        let obj = { ...item };
                                        if (e.target.checked == 1) {
                                          obj.setting_obj.default_lang = itm.value;
                                        }
                                        setItem({ ...obj });
                                      }}
                                    />
                                  </>
                                ))}
                              </Row>
                            </RadioGroup>
                          </>}
                      </Stack>


                    </Stack>
                  </Card>
                </Grid>
              </>
            )}
            {currentTab == 3 && (
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label='본사아이디'
                        value={item?.user_name}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['user_name']: e.target.value
                          })
                        }}
                      />
                      <TextField
                        label='본사명'
                        value={item?.seller_name}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['seller_name']: e.target.value
                          })
                        }}
                      />
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <TextField
                        label='본사 비밀번호'
                        value={item?.user_pw}
                        type='password'
                        onChange={e => {
                          setItem({
                            ...item,
                            ['user_pw']: e.target.value
                          })
                        }}
                      />
                      <TextField
                        label='본사 비밀번호 확인'
                        value={item?.user_pw_check}
                        type='password'
                        onChange={e => {
                          setItem({
                            ...item,
                            ['user_pw_check']: e.target.value
                          })
                        }}
                      />
                    </Stack>
                  </Card>
                </Grid>
              </>
            )}
            {currentTab == 5 && (
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <FormControl variant='outlined'>
                        <InputLabel>최대포인트 사용금액</InputLabel>
                        <OutlinedInput
                          label='최대포인트 사용금액'
                          type='number'
                          value={item?.setting_obj?.max_use_point ?? 0}
                          endAdornment={<InputAdornment position='end'>원</InputAdornment>}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item?.setting_obj,
                                ['max_use_point']: e.target.value
                              }
                            })
                          }}
                        />
                      </FormControl>
                      <FormControl variant='outlined'>
                        <InputLabel>포인트 사용가능 최소 주문금액 (배송비제외)</InputLabel>
                        <OutlinedInput
                          type='number'
                          label='포인트 사용가능 최소 주문금액 (배송비제외)'
                          value={item?.setting_obj?.use_point_min_price ?? 0}
                          endAdornment={<InputAdornment position='end'>원</InputAdornment>}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item?.setting_obj,
                                ['use_point_min_price']: e.target.value
                              }
                            })
                          }}
                        />
                      </FormControl>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <FormControl variant='outlined'>
                        <InputLabel>포인트 적립비율</InputLabel>
                        <OutlinedInput
                          label='포인트 적립비율'
                          type='number'
                          value={item?.setting_obj?.point_rate ?? 0}
                          endAdornment={<InputAdornment position='end'>%</InputAdornment>}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item?.setting_obj,
                                ['point_rate']: e.target.value
                              }
                            })
                          }}
                        />
                      </FormControl>
                    </Stack>
                  </Card>
                </Grid>
              </>
            )}
            {currentTab == 6 && (
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <FormControl variant='outlined'>
                        <InputLabel>네이버토큰</InputLabel>
                        <OutlinedInput
                          label='네이버토큰'
                          value={item?.seo_obj?.naver_token ?? 0}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['seo_obj']: {
                                ...item?.seo_obj,
                                ['naver_token']: e.target.value
                              }
                            })
                          }}
                        />
                      </FormControl>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <FormControl variant='outlined'>
                        <InputLabel>구글토큰</InputLabel>
                        <OutlinedInput
                          label='구글토큰'
                          value={item?.seo_obj?.google_token ?? 0}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['seo_obj']: {
                                ...item?.seo_obj,
                                ['google_token']: e.target.value
                              }
                            })
                          }}
                        />
                      </FormControl>
                    </Stack>
                  </Card>
                </Grid>
              </>
            )}
            {currentTab == 7 && (
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <FormControl variant='outlined'>
                        <InputLabel>APIKEY</InputLabel>
                        <OutlinedInput
                          label='APIKEY'
                          value={item?.bonaeja_obj?.api_key ?? 0}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['bonaeja_obj']: {
                                ...item?.bonaeja_obj,
                                ['api_key']: e.target.value
                              }
                            })
                          }}
                        />
                      </FormControl>
                      <FormControl variant='outlined'>
                        <InputLabel>사용자id</InputLabel>
                        <OutlinedInput
                          label='사용자id'
                          value={item?.bonaeja_obj?.user_id ?? 0}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['bonaeja_obj']: {
                                ...item?.bonaeja_obj,
                                ['user_id']: e.target.value
                              }
                            })
                          }}
                        />
                      </FormControl>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={3}>
                      <FormControl variant='outlined'>
                        <InputLabel>발신자 전화번호</InputLabel>
                        <OutlinedInput
                          label='발신자 전화번호'
                          value={item?.bonaeja_obj?.sender ?? 0}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['bonaeja_obj']: {
                                ...item?.bonaeja_obj,
                                ['sender']: e.target.value
                              }
                            })
                          }}
                        />
                      </FormControl>
                    </Stack>
                  </Card>
                </Grid>
              </>
            )}

            <Grid item xs={12} md={12}>
              <Card sx={{ p: 3 }}>
                <Stack spacing={1} style={{ display: 'flex' }}>
                  <Button
                    variant='contained'
                    style={{
                      height: '48px',
                      width: '120px',
                      marginLeft: 'auto'
                    }}
                    onClick={() => {
                      setModal({
                        func: () => {
                          onSave()
                        },
                        icon: 'material-symbols:edit-outline',
                        title: '저장 하시겠습니까?'
                      })
                    }}
                  >
                    저장
                  </Button>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </>
      )}
    </>
  )
}
DefaultSetting.getLayout = page => <ManagerLayout>{page}</ManagerLayout>
export default DefaultSetting
