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
  FormHelperText,
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
import { useEffect, useRef, useState } from 'react'
import { Row, themeObj } from 'src/components/elements/styled-components'
import { useSettingsContext } from 'src/components/settings'
import { Upload } from 'src/components/upload'
import ManagerLayout from 'src/layouts/manager/ManagerLayout'
import styled from 'styled-components'
import { createDefaultManagerObj } from 'src/data/manager-data'
import { toast } from 'react-hot-toast'
import { useModal } from 'src/components/dialog/ModalProvider'
import { useAuthContext } from 'src/layouts/manager/auth/useAuthContext'
import ReactQuillComponent from 'src/views/manager/react-quill'
import { apiManager } from 'src/utils/api'
import { commarNumber } from 'src/utils/function'
import { BLOG_DEMO_DATA, SHOP_DEMO_DATA } from 'src/data/data'
import { FRAMES } from 'src/components/main-site/frameList'
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

// --- 프레임(디자인) 선택 ---
// 화면상 입력칸은 하나지만 저장 형식은 그대로다. 'shop:1' 같은 키를 골라
// setting_obj.shop_demo_num / blog_demo_num 두 값에 나눠 담는다(번호체계 통합 아님).
//
// 판매중 프레임 목록은 frameList.js 의 FRAMES 가 단일 소스다(여기서 매핑을 다시 만들지 않는다).
// FRAMES 에 없는 조합(미판매·레거시 데모)도 반드시 목록에 남긴다 —
// 기존 브랜드가 그 값을 쓰고 있는데 목록에서 빠지면 저장하는 순간 값이 날아간다.
const FRAME_OPTION_KEYS = new Set(FRAMES.map(f => f.key))
const DEMO_FRAME_OPTIONS = [
  ...FRAMES.map(f => ({
    value: f.key,
    label: `프레임${String(f.no).padStart(2, '0')} · ${f.title}`
  })),
  ...[
    ...SHOP_DEMO_DATA.map(d => ({ value: `shop:${d.value}`, label: `(구) 쇼핑몰 데모 ${d.value}` })),
    ...BLOG_DEMO_DATA.map(d => ({ value: `blog:${d.value}`, label: `(구) 블로그 데모 ${d.value}` }))
  ].filter(o => !FRAME_OPTION_KEYS.has(o.value))
]

// 저장값 → Select value.
// shop 우선. utils/blog-shop-route.js 의 isBlogBrand 가 `!(shop_demo_num > 0) && blog_demo_num > 0` 이라
// 둘 다 0보다 크면 실제 화면은 쇼핑몰형으로 뜬다. 폼도 그 결과를 그대로 보여준다.
const getDemoFrameValue = (setting_obj) => {
  const shopNum = Number(setting_obj?.shop_demo_num) || 0
  const blogNum = Number(setting_obj?.blog_demo_num) || 0
  return shopNum > 0 ? `shop:${shopNum}` : blogNum > 0 ? `blog:${blogNum}` : ''
}

// 목록에 없는 번호(예: 아직 정의되지 않은 데모)가 저장돼 있으면 그 항목만 임시로 덧붙인다.
// 안 그러면 선택칸이 빈 칸으로 보여 무엇이 걸려 있는지 알 수 없다.
const getDemoFrameOptions = (value) =>
  !value || DEMO_FRAME_OPTIONS.some(o => o.value === value)
    ? DEMO_FRAME_OPTIONS
    : [...DEMO_FRAME_OPTIONS, { value, label: `(구) ${value}` }]

const DefaultSetting = () => {
  const { setModal } = useModal()
  const { themeMode, themeDnsData } = useSettingsContext()
  const { user } = useAuthContext()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [currentTab, setCurrentTab] = useState(0)
  // 모듈 전역 기본객체를 그대로 넣으면 이 화면에서 변형될 때 원본이 오염된다(브랜드 추가 시 직전 브랜드가 섞임).
  const [item, setItem] = useState(() => createDefaultManagerObj('brands'))
  const [saveLoading, setSaveLoading] = useState(false)
  const [useBasicInfo, setUseBasicInfo] = useState(false)
  // 화면 진입 시점의 값(깊은 복사). 저장할 때 '실제로 바뀐 키'만 가려내는 기준으로만 쓴다.
  const loadedItemRef = useRef(null)
  // 추가/수정 분기는 폼 상태(obj.id)가 아니라 '경로'로 판단한다.
  // SPA 로 다른 화면(디자인관리 등)을 거쳐 들어오면 상태에 직전 브랜드 id 가 남아 있을 수 있고,
  // 그 id 를 믿으면 신규 브랜드 정보가 기존 가맹점에 PUT 되어 그 가맹점 dns 가 바뀐다(도메인 접속 사망).
  const isAddMode = router.query?.brand_id == 'add'
  // 수정 경로에서 다룰 브랜드 id. 조회와 저장이 반드시 같은 값을 써야 한다.
  const getTargetBrandId = () =>
    (!isNaN(parseInt(router.query?.brand_id)) ? router.query?.brand_id : '') || themeDnsData?.id

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
    ...(isAddMode
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
    ...(user?.level >= 50
      ? [
        {
          value: 5,
          label: '포인트설정'
        }
      ]
      : []),
    // SEO설정만 가맹점(레벨40)에게 연다 — 자기 몰의 검색 노출 문구는 가맹점이 직접 써야 한다.
    // (데모설정=프레임 교체라 본사 결정 / 포인트=기능 미사용 / 발송번호=문자 게이트웨이 미사용 → 50 유지)
    ...(user?.level >= 40
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
    ...(user?.level >= 40
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
  // 조회한 브랜드 값을 폼 기본값(default_obj) 위에 얹는다.
  // ⚠ 인자로 받은 객체를 직접 변형하지 않는다 — 예전엔 state(=모듈 전역 기본객체)를 그대로 변형해
  //    defaultManagerObj.brands 가 통째로 오염됐다(브랜드 추가가 직전 브랜드를 덮어쓴 원인).
  const settingBrandObj = (default_obj, brand_data) => {
    let obj = { ...default_obj }
    let brand_data_keys = Object.keys(brand_data ?? {})
    for (var i = 0; i < brand_data_keys.length; i++) {
      let key = brand_data_keys[i]
      let value = brand_data[key]
      if (value === undefined || value === null) {
        continue // 서버가 값을 안 준 컬럼은 폼 기본값을 그대로 둔다
      }
      if (Array.isArray(value)) {
        // 배열은 서버 값을 통째로 쓴다.
        // 예전엔 Object.assign(기본배열, 서버배열) 이라 서버가 빈 배열을 준 shop_obj/blog_obj 에
        // 기본값(개발용 테스트 배너)이 그대로 남았고, 저장하면 그게 DB로 나갔다.
        obj[key] = value
      } else if (typeof value == 'object' && obj[key] && typeof obj[key] == 'object' && !Array.isArray(obj[key])) {
        // 수정 경로에서는 base 의 setting_obj/theme_css 등이 비어 있으므로(clearAddOnlyDefaults)
        // 결과는 서버 값 그대로다. 모듈 기본값을 여기서 채워 넣지 않는다 — 아래 주석 참고.
        obj[key] = { ...obj[key], ...value }
      } else {
        obj[key] = value
      }
    }
    return obj
  }
  // 모듈 기본값 중 '브랜드 추가(create)' 때만 의미가 있는 키.
  // 수정 경로에서 이 기본값을 서버 값에 섞으면, 서버에 없던 키가 폼에 들어오고
  // 스냅샷(loadedItemRef)도 '섞은 뒤'에 뜨기 때문에 diff 에 잡히지 않은 채 payload 로 나간다.
  // 특히 setting_obj 기본값의 is_use_lang:1 / lang_list 5개국 때문에,
  // 언어팩을 안 쓰던 브랜드가 설정을 한 번 저장하는 것만으로 언어팩이 켜지고
  // 백엔드가 그 브랜드 콘텐츠 전량을 번역 큐에 적재했다(번역 API 부하·과금, 고객화면에 언어선택 UI 노출).
  // → 수정 경로에서는 이 키들을 빈 값으로 비우고 서버 값만 싣는다. 없는 키는 렌더에서 `?? 0` 등으로 폴백한다.
  const DEFAULT_ONLY_ON_ADD_KEYS = ['setting_obj', 'seo_obj', 'bonaeja_obj', 'theme_css', 'shop_obj', 'blog_obj']
  const clearAddOnlyDefaults = obj => {
    let result = { ...obj }
    for (var i = 0; i < DEFAULT_ONLY_ON_ADD_KEYS.length; i++) {
      let key = DEFAULT_ONLY_ON_ADD_KEYS[i]
      result[key] = Array.isArray(result[key]) ? [] : {}
    }
    return result
  }
  const settingPage = async () => {
    // 브랜드가 바뀔 때마다 기본값을 새로 복사해서 시작한다.
    // ('브랜드 추가'는 조회를 안 하므로, 여기서 초기화하지 않으면 직전에 열어본 브랜드가 id째로 남는다)
    let obj = createDefaultManagerObj('brands')
    if (isAddMode) {
      // 추가 경로에서는 id 를 절대 물고 가지 않는다(오염된 id 로 기존 가맹점을 덮어쓰는 사고 방지).
      delete obj.id
    } else {
      obj = clearAddOnlyDefaults(obj)
      let brand_data = await apiManager('brands', 'get', {
        id: getTargetBrandId()
      })
      obj = settingBrandObj(obj, brand_data)
    }
    setItem(obj)
    // 저장 시 비교 기준. 폼에서 setting_obj 를 직접 변형하는 곳(언어팩 체크박스)이 있어
    // 참조를 공유하면 비교가 무의미해진다 → 깊은 복사본으로 따로 보관한다.
    loadedItemRef.current = JSON.parse(JSON.stringify(obj))
    setLoading(false)
  }
  // 이 화면이 편집하지 않는 컬럼. 조회해서 받은 값을 저장 때 되돌려 보내지 않는다.
  // shop_obj/blog_obj(홈 섹션)는 디자인관리에서 편집한다.
  // none_use_column_obj 는 설정관리 › 컬럼관리에서 편집한다.
  const NOT_EDITABLE_COLUMNS = ['shop_obj', 'blog_obj', 'none_use_column_obj']
  // 값 비교. 객체·배열은 JSON 문자열로 비교한다.
  // 새로 고른 이미지(File)는 JSON 으로 비교되지 않으므로 항상 '바뀜'으로 본다.
  const isSameValue = (origin_value, value) => {
    if (origin_value === value) return true
    if (value && typeof value == 'object' && typeof value.name == 'string' && typeof value.size == 'number') {
      return false
    }
    return JSON.stringify(origin_value) === JSON.stringify(value)
  }
  // 저장 payload: 불러온 값과 비교해 실제로 바뀐 키만 담는다.
  // 백엔드 updateQuery 는 body 에 없는 컬럼을 SET 절에서 빼므로, 보내지 않으면 DB 값이 그대로 유지된다.
  const getUpdatePayload = (obj) => {
    let origin = loadedItemRef.current ?? {}
    let payload = {}
    let keys = Object.keys(obj)
    for (var i = 0; i < keys.length; i++) {
      let key = keys[i]
      if (NOT_EDITABLE_COLUMNS.includes(key)) continue
      if (isSameValue(origin[key], obj[key])) continue
      payload[key] = obj[key]
    }
    return payload
  }
  const onSave = async () => {

    let result = undefined
    let obj = item
    // ⚠ 분기 기준은 경로다. obj?.id 로 판단하면 SPA 로 다른 화면을 거쳐 들어왔을 때
    //    상태에 남은 직전 브랜드 id 때문에 '브랜드 추가'가 그 가맹점을 update 해버린다.
    if (!isAddMode) {
      //수정
      let payload = getUpdatePayload(obj)
      if (Object.keys(payload).length == 0) {
        toast.success('변경된 내용이 없습니다.')
        return
      }
      setSaveLoading(true);
      result = await apiManager('brands', 'update', { ...payload, id: obj?.id || getTargetBrandId() })
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
      // 신규 생성에는 id 를 절대 싣지 않는다(백엔드가 id 를 보면 기존 행을 건드릴 여지를 남기지 않는다).
      let { id, ...create_data } = obj
      result = await apiManager('brands', 'create', { ...create_data })
    }
    if (result) {
      toast.success('성공적으로 저장 되었습니다.')
      window.location.reload()
    }
    // 저장 실패(result=false) 시에도 로딩 오버레이를 닫아 화면이 멈추지 않도록.
    setSaveLoading(false)
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
                        // 수정 경로에서는 theme_css 에 모듈 기본값을 얹지 않으므로(서버 값 그대로)
                        // 서버에 값이 없을 때를 대비해 렌더에서만 폴백한다. 저장값은 사용자가 고를 때만 생긴다.
                        value={item.theme_css?.main_color ?? '#00ab55'}
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
                      {item.id == 5 &&
                        <>
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
                          {
                            /*
                                                      <div>
                                                      <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                                                        위탁 수수료 설정
                                                      </Typography>
                          
                                                    </div>
                            */
                          }
                        </>}

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
                      <TextField
                        label='법인설립일자'
                        value={item.establish_date}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['establish_date']: e.target.value
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
                      <TextField
                        label='통신판매번호'
                        value={item.mail_order_num}
                        onChange={e => {
                          setItem({
                            ...item,
                            ['mail_order_num']: e.target.value
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
                      {/* 쇼핑몰/블로그 데모넘버 입력칸을 하나로 통합. 저장은 기존 두 키를 그대로 쓴다. */}
                      <FormControl>
                        <InputLabel>프레임(디자인)</InputLabel>
                        <Select
                          label='프레임(디자인)'
                          value={getDemoFrameValue(item.setting_obj)}
                          onChange={e => {
                            const value = String(e.target.value || '')
                            const matched = /^(shop|blog):(\d+)$/.exec(value)
                            // 고른 쪽만 번호를 넣고 반대쪽은 0 — 두 값이 같이 살아 있으면 shop 이 이겨 블로그 설정이 묻힌다.
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                shop_demo_num: matched && matched[1] == 'shop' ? Number(matched[2]) : 0,
                                blog_demo_num: matched && matched[1] == 'blog' ? Number(matched[2]) : 0
                              }
                            })
                          }}
                        >
                          <MenuItem value=''>사용안함</MenuItem>
                          {getDemoFrameOptions(getDemoFrameValue(item.setting_obj)).map((option) => {
                            return <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                          })}
                        </Select>
                        <FormHelperText>쇼핑몰형과 블로그형은 동시에 선택할 수 없습니다. 하나를 고르면 반대쪽은 자동으로 해제됩니다.</FormHelperText>
                      </FormControl>
                      {/* '대표 상품' 입력은 여기 두지 않는다 — 디자인관리 › 대표 상품
                          (/manager/designs/featured)이 유일한 편집 화면이다.
                          예전엔 같은 setting_obj.featured_product_ids 를 이 데모설정 탭에서도
                          편집할 수 있었는데, 두 가지 이유로 위험한 잔재였다.
                            1) 후보 목록이 themeDnsData.products 였다. 그 배열은 백엔드가
                               shop_obj/blog_obj 에 배치된 상품 id 로만 IN 조회해 만들기 때문에
                               (shop.controller 의 홈 섹션 쿼리) 섹션빌더가 없는 블로그 4~9
                               프레임에서는 항상 0건이다. 즉 '선택'은 불가능하고 '전체 해제'만
                               가능한 상태였다 — 값을 지우는 방향으로만 동작하는 함정이다.
                            2) 저장 시 setting_obj 를 객체 단위로 통째 전송하므로, 본사(레벨50)가
                               이 탭에서 아무거나 저장하면 가맹점이 디자인관리에서 지정해 둔
                               대표상품이 빈 값으로 덮어써질 수 있었다.
                          프레임 선택 Select 만 남긴다. */}
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
                        <FormControlLabel control={<Switch checked={item?.is_use_otp == 1} />} label="otp 사용여부"
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['is_use_otp']: e.target.checked ? 1 : 0,
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item?.is_closure == 1} />} label="폐쇄몰 사용여부"
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['is_closure']: e.target.checked ? 1 : 0,
                            })
                          }}
                        />
                      </Stack>
                      <Stack>
                        <FormControlLabel control={<Switch checked={item?.setting_obj?.is_sign_up_status_1 == 1} />} label="가입시 승인후 정상"
                          onChange={(e) => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item.setting_obj,
                                is_sign_up_status_1: e.target.checked ? 1 : 0,
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
            {currentTab == 8 && (
              <>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={1.5}>
                      <FormControl variant='outlined'>
                        <InputLabel>기본 배송비</InputLabel>
                        <OutlinedInput
                          label='기본 배송비'
                          type='number'
                          value={item?.setting_obj?.delivery_fee_default ?? 0}
                          endAdornment={<InputAdornment position='end'>원</InputAdornment>}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item?.setting_obj,
                                ['delivery_fee_default']: e.target.value
                              }
                            })
                          }}
                        />
                      </FormControl>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        주문 1건당 부과되는 기본 배송비입니다. 0원이면 무료배송으로 표시됩니다.
                      </Typography>
                    </Stack>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card sx={{ p: 2, height: '100%' }}>
                    <Stack spacing={1.5}>
                      <FormControl variant='outlined'>
                        <InputLabel>무료배송 기준금액</InputLabel>
                        <OutlinedInput
                          label='무료배송 기준금액'
                          type='number'
                          value={item?.setting_obj?.free_ship_min ?? 0}
                          endAdornment={<InputAdornment position='end'>원</InputAdornment>}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item?.setting_obj,
                                ['free_ship_min']: e.target.value
                              }
                            })
                          }}
                        />
                      </FormControl>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        주문 금액이 이 값 이상이면 배송비가 무료가 됩니다. 0원이면 미사용(항상 기본 배송비 부과).
                      </Typography>
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
