import {
  Alert,
  Avatar,
  Box,
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
  Slider,
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
import LogoPreview from 'src/components/manager/LogoPreview'
import {
  LOGO_SCALE_기본, LOGO_SCALE_최소, LOGO_SCALE_최대
} from 'src/components/elements/shop/LogoScaleStyle'

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
import { FRAMES, LEGACY_FRAMES } from 'src/components/main-site/frameList'
import { allLangs } from 'src/locales'
import { isShopgoMerchant } from 'src/utils/is-shopgo'
import { COURIER_LIST } from 'src/data/couriers';
import { 금액표시, 금액입력 } from 'src/utils/money-input'
import PasswordField from 'src/components/elements/PasswordField';
// 저장돼 있지 않으면 기본(100%). 이상한 값이 들어와도 슬라이더가 범위를 벗어나면 안 된다.
const 로고배율 = (item) => {
  const v = Number(item?.setting_obj?.logo_scale)
  if (!v || isNaN(v)) return LOGO_SCALE_기본
  return Math.min(LOGO_SCALE_최대, Math.max(LOGO_SCALE_최소, v))
}


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
const FRAME_OPTION_KEYS = new Set([...FRAMES, ...LEGACY_FRAMES].map(f => f.key))
const DEMO_FRAME_OPTIONS = [
  ...FRAMES.map(f => ({
    value: f.key,
    label: `프레임${String(f.no).padStart(2, '0')} · ${f.title}`
  })),
  // 판매를 중단한 프레임. 그 값을 쓰는 브랜드가 실제로 있어서 목록에 남겨야 한다 —
  // 빠지면 '(구) 블로그 데모 5' 같은 raw 라벨로 격하되고, 무엇을 쓰는 몰인지 알 수 없다.
  ...LEGACY_FRAMES.map(f => ({
    value: f.key,
    label: `(판매중단) ${f.title}`
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
    // 포인트설정: 본사(50) + shopgo 산하 가맹점에게 노출. shopgo 하위는 적립형/즉시사용형을 직접 설정.
    ...((user?.level >= 50 || isShopgoMerchant(item))
      ? [
        {
          value: 5,
          label: '포인트설정'
        }
      ]
      : []),
    // SEO설정: 본사만.
    //
    // 한 번 가맹점(40)에게 열었다가 되돌린다. '자기 몰의 검색 노출 문구는 가맹점이 직접
    // 써야 한다' 는 이유였는데, 이 탭에 그런 칸이 없다 — 들어 있는 것은 네이버토큰·구글토큰
    // 두 칸이 전부고, 둘 다 서치어드바이저·서치콘솔에서 발급받아 붙이는 소유확인 값이다.
    // 가맹점이 채울 수 있는 성질이 아니고, 비어 있어도 몰은 정상 동작한다.
    // 탭 이름만 보고 판단했던 것이라 실제 내용으로 다시 잡는다.
    // (데모설정=프레임 교체라 본사 결정 / 포인트=기능 미사용 / 발송번호=문자 게이트웨이 미사용 → 50 유지)
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
                        {/* 예전 문구: '가로형 권장 · PNG(투명배경) 권장 · 1MB 이하 (표시 크기는 자동으로 최적화됩니다)'
                            가맹점에서 "표시 크기는 자동으로 최적화됩니다"가 무슨 뜻인지,
                            모든 로고가 일괄 같은 크기로 찍힌다는 말인지 모르겠다는 얘기가 나왔다.
                            실제 동작을 그대로 풀어 쓴다 — 확인한 내용은 이렇다.
                              · data.js 의 logoDeliveryUrl 이 e_trim 으로 둘레 여백을 깎고
                                c_fit 으로 비율을 유지한 채 맞춘다. 자르거나 찌그러뜨리지 않는다.
                              · 헤더는 height 30~80px + width auto 로 그린다(프레임마다 다름).
                                즉 '높이는 정해져 있고 가로는 로고 모양대로'다 — 가로형을 권하는 이유.
                              · 용량 안내('1MB 이하')는 뺐다. 지키게 만드는 장치가 아무 데도 없었다 —
                                화면(Upload)에 maxSize 가 없고 백엔드(multerConfig.js)는 100MB 에서야 막는다.
                                게다가 배달 때 f_auto,q_auto 가 알아서 줄인다(실측 393KB → 4.8KB).
                                지키지도 않고 지킬 필요도 없는 숫자라 지웠다.
                                ▶ 정말 막아야 할 일이 생기면 이 Upload 에 maxSize 를 주고 문구를 되살릴 것. */}
                        {/* 수치는 '하한선' 하나만 준다. 목표 규격(예: 900×300)은 일부러 뺐다.
                            예시를 적으면 그게 규격으로 읽힌다 — 정사각 로고를 가진 가맹점이 거기 맞추려고
                            늘리거나(찌그러짐) 여백을 채워 넣는다. 여백은 e_trim 이 어차피 깎아 내니 헛수고다.
                            애초에 로고는 브랜드 마크라 대부분 바꾸지 못한다. 바꿀 수 있는 건 '더 큰 파일로
                            내보내기' 정도라, 지킬 수도 없는 목표치를 요구하는 꼴이 된다.

                            세로 200px 의 근거 — 프레임별 대표 가맹점 13곳 로고 실측(2026-08-14).
                            여백을 뺀 세로가 배달 규격(h_176)보다 작으면 늘려 내보내서 흐려지는데,
                            13곳 중 6곳이 이미 미달이었다 — bs-company 73px · asapmall 83px · jjpay 106px ·
                            glamup 112px · forsmall 159px · buddymall 174px. 176 에 여유를 얹어 200 으로 적는다.

                            e_trim·c_fit·헤더 40px 같은 건 안 적는다 — 가맹점이 알아야 할 건
                            규격이 아니라 '내 로고를 다시 만들어야 하나'다. 답은 대개 '아니오'다. */}
                        <Stack spacing={0.25}>
                          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                            PNG(배경 투명) 권장 · 지금 쓰시는 로고를 그대로 올리시면 됩니다 (맞춰야 할 규격은 없습니다)
                          </Typography>
                          {[
                            '올리신 비율 그대로 자리에 맞춰 들어갑니다. 잘리거나 찌그러지지 않습니다.',
                            '로고 둘레의 빈 여백은 자동으로 잘립니다. 여백을 넣어 크기를 맞추실 필요는 없습니다.',
                            '여백을 뺀 로고 부분이 세로 200px보다 작으면 흐려 보일 수 있으니, 되도록 큰 파일로 올려 주세요.',
                            '헤더는 높이가 정해져 있어, 가로로 긴 로고가 정사각형·세로로 긴 로고보다 크게 보입니다.',
                          ].map(줄 => (
                            <Typography key={줄} variant='caption' sx={{ color: 'text.disabled', lineHeight: 1.6 }}>
                              · {줄}
                            </Typography>
                          ))}
                        </Stack>
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
                        {/* 문구로 '작으면 흐려집니다'라고 적어 두는 것과, 그 자리에서
                            '지금 작습니다'라고 말해 주는 것은 다르다. 실측해 보니 대표 13곳 중
                            6곳이 이미 미달이었는데 정작 그 가맹점들은 알 방법이 없었다. */}
                        <LogoPreview file={item.logo_file} url={item.logo_img} scale={로고배율(item)} />
                        {/* 로고 크기 조절 — Shopify(Custom logo width) · Squarespace(Logo Height) ·
                            아임웹(드래그)에 다 있는 기능인데 우리만 없었다. 자동 축소는 하면서
                            가맹점이 손댈 수단이 없으니, 작아 보여도 할 수 있는 게 없었다.
                            프레임마다 기준 높이가 다르므로(28~88px) 절대값이 아니라 배율로 준다. */}
                        <Box sx={{ pt: 1 }}>
                          <Stack direction='row' justifyContent='space-between' alignItems='baseline'>
                            <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>로고 크기</Typography>
                            <Typography variant='caption' sx={{ color: 'text.secondary', fontWeight: 700 }}>
                              {로고배율(item)}%
                            </Typography>
                          </Stack>
                          <Typography variant='caption' sx={{ color: 'text.disabled', lineHeight: 1.6 }}>
                            · 쇼핑몰 상단·하단의 로고 크기를 함께 조절합니다. 위 미리보기에 바로 반영됩니다.
                          </Typography>
                          <Slider
                            value={로고배율(item)}
                            min={LOGO_SCALE_최소}
                            max={LOGO_SCALE_최대}
                            step={5}
                            marks={[
                              { value: LOGO_SCALE_최소, label: `${LOGO_SCALE_최소}%` },
                              { value: LOGO_SCALE_기본, label: '기본' },
                              { value: LOGO_SCALE_최대, label: `${LOGO_SCALE_최대}%` },
                            ]}
                            onChange={(e, v) => {
                              setItem({
                                ...item,
                                ['setting_obj']: { ...item.setting_obj, logo_scale: Number(v) }
                              })
                            }}
                            sx={{ mt: 1 }}
                          />
                        </Box>
                        {/* shopgo 산하 가맹점은 다크모드 로고·파비콘 미노출(본사 방침). 로고만 사용. */}
                        {!isShopgoMerchant(item) && (
                          <>
                            <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                              브랜드 다크모드 로고
                            </Typography>
                            {/* '안 올리면 어떻게 되나'가 실제로 헷갈리던 자리다.
                                data.js 의 logoSrc() 는 dark_logo_img 가 없으면 logo_img 로 폴백한다
                                (예전엔 폴백이 없어서 고객이 달 아이콘을 누르면 로고가 통째로 사라졌다). */}
                            <Typography variant='caption' sx={{ color: 'text.disabled', lineHeight: 1.6 }}>
                              어두운 배경에서 쓰입니다. 안 올리시면 위의 기본 로고가 그대로 쓰입니다.
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
                            <LogoPreview file={item.dark_logo_file} url={item.dark_logo_img} dark />
                            <Typography variant='subtitle2' sx={{ color: 'text.secondary' }}>
                              브랜드 파비콘
                            </Typography>
                            <Typography variant='caption' sx={{ color: 'text.disabled', lineHeight: 1.6 }}>
                              브라우저 탭에 뜨는 작은 아이콘입니다. 아주 작게 보이니 정사각형에 단순한 그림이 좋습니다.
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
                          </>
                        )}
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
                      {/* shopgo 산하 가맹점은 메인색상 미노출 — 기본값(테마 main_color)으로 고정. */}
                      {!isShopgoMerchant(item) && (
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
                      )}
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

                      {/* shopgo 산하 가맹점은 비고 미노출. */}
                      {!isShopgoMerchant(item) && (
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
                      )}
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
                        {/* 여기는 로고와 정반대라, 수치를 정확히 준다.
                              로고 — 비율 유지해서 통째로 들어간다. 가맹점이 못 바꾸는 브랜드 마크다.
                                     그래서 목표 규격을 주면 지킬 수도 없는 걸 요구하는 꼴이 된다.
                              OG   — 고정 비율로 '잘린다'. 그 용도로 새로 만드는 그림이다.
                                     규격을 안 주면 만들 방법이 없다.
                            근거:
                              · 오른쪽 '카카오톡 링크 전송 시 예시'의 OgImg 가 400x200 = 2:1 이다.
                                background-size: cover 라 비율이 다르면 실제로 잘린다.
                              · 규격·용량은 이제 시스템이 맞춰서 내보낸다(data.js 의 ogDeliveryUrl).
                                예전에는 저장된 주소를 그대로 내보내서 1923x818 · 2,608KB 짜리가 그대로 나갔다.
                                지금은 800x400 · 62KB 로 나간다.
                                ⚠ 예전에 여기 '500KB 넘으면 카카오가 안 가져간다'고 적혀 있었다. 사실이 아니다.
                                  2,608KB 짜리도 카카오가 그대로 가져갔다(2026-08-24, ?v=2 로 확인).
                                  '바꿔도 반영이 안 되던' 원인은 용량이 아니라 카카오의 URL 단위 캐시였다. */}
                        <Stack spacing={0.25}>
                          <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                            가로 : 세로 = 2 : 1 · 800 × 400 권장
                          </Typography>
                          {[
                            '카카오톡으로 쇼핑몰 주소를 보내거나 검색 결과에 뜰 때 함께 보이는 그림입니다.',
                            '로고와 달리, 비율이 2:1 이 아니면 넘치는 부분이 잘립니다. 중요한 글자는 가장자리에 두지 마세요.',
                            '용량은 신경 쓰지 않으셔도 됩니다. 큰 파일을 올리셔도 카카오톡에 맞는 크기로 줄여서 내보냅니다.',
                            '바꾸신 내용이 카카오톡에 바로 안 보이면 아래 안내를 참고하세요.',
                          ].map(줄 => (
                            <Typography key={줄} variant='caption' sx={{ color: 'text.disabled', lineHeight: 1.6 }}>
                              · {줄}
                            </Typography>
                          ))}
                        </Stack>
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
                        {/* 용량은 고르는 순간 File.size 로 바로 알 수 있다. 저장한 뒤에 알면 늦다 —
                            카카오는 넘치면 그냥 안 띄우고, 왜 안 뜨는지 알려 주지 않는다.
                            이미 저장된 주소는 용량을 알 수 없으므로(다른 도메인) 그때는 아무 말도 안 한다. */}
                        {/* 바꾼 직후에 안 바뀌어 보이는 진짜 이유는 카카오의 URL 단위 캐시다.
                            2026-08-24 에 실제로 겪었고, 주소 뒤에 ?v=2 를 붙이니 즉시 새 카드가 떴다.
                            '주소를 바꿔 보내기'를 먼저 안내하는 이유: 카카오 계정도, 개발자 사이트도 필요 없다.
                            (개발자 도구의 캐시 초기화는 어떤 계정이어야 하는지 확인되지 않았다 — 확인 전에는
                             가맹점에게 그걸 먼저 시키지 않는다) */}
                        {(item.og_file || item.og_img) && (
                          <Alert severity='info' sx={{ py: 0.5 }}>
                            <Typography variant='caption'>
                              <b>바꾸신 내용이 카카오톡에 바로 안 보이나요?</b> 저장이 안 된 것이 아닙니다.
                              카카오톡이 주소마다 예전 내용을 기억해 두기 때문입니다.
                              주소 뒤에 <b>?v=2</b> 를 붙여서 보내 보세요 &mdash;
                              예: {`https://${item?.dns || '내쇼핑몰주소'}/?v=2`}
                              <br />
                              화면은 똑같이 열리고, 바꾸신 내용이 바로 보입니다.
                              (다음에 또 바꾸시면 v=3, v=4 처럼 숫자만 올리시면 됩니다)
                            </Typography>
                          </Alert>
                        )}
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
                      {/* 주민등록번호 — 본사(50)에게만 보인다.
                          고객 화면 어디에도 안 나가고, 코드 어느 곳에서도 읽지 않는다.
                          그런데 122개 몰 중 27곳이 채워 뒀다 — 쓰지도 않을 개인정보를 받아 둔 셈이다.
                          칸을 아예 지우지 않는 이유는 이미 들어간 값을 지울 자리가 필요해서다. */}
                      {user?.level >= 50 &&
                        <TextField
                          label='주민등록번호'
                          value={item.resident_num}
                          helperText='고객 화면에 쓰이지 않습니다. 가맹점에게는 보이지 않습니다.'
                          onChange={e => {
                            setItem({
                              ...item,
                              ['resident_num']: e.target.value
                            })
                          }}
                        />}
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
                      {/* 법인설립일자 — 본사(50)에게만 보인다.
                          쓰이는 곳은 약관 시행일 한 곳뿐이고, 그마저 created_at 이 있으면 그쪽을 쓴다
                          (pages/shop/auth/policy.js). 122개 몰 중 19곳만 채워져 있다. */}
                      {user?.level >= 50 &&
                        <TextField
                          label='법인설립일자'
                          value={item.establish_date}
                          helperText='약관 시행일이 없을 때만 대신 쓰입니다.'
                          onChange={e => {
                            setItem({
                              ...item,
                              ['establish_date']: e.target.value
                            })
                          }}
                        />}
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
                      <PasswordField
                        label='본사 비밀번호'
                        value={item?.user_pw}

                        onChange={e => {
                          setItem({
                            ...item,
                            ['user_pw']: e.target.value
                          })
                        }}
                      />
                      <PasswordField
                        label='본사 비밀번호 확인'
                        value={item?.user_pw_check}

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
                      {/* '즉시사용형 / 적립형' 택일을 없앴다.
                          고른 쪽의 조건만 걸려서, 안 고른 쪽 칸은 값을 채워도 아무 효과가 없는
                          죽은 칸이었다. 두 조건은 서로 다른 것을 막는 별개의 장치이고
                          (소액 주문에 몰아 쓰기 / 잔돈 포인트 소진), 국내 몰들은 보통 둘 다 건다.
                          이제 둘 다 조건으로 걸고, 비워 두면(0) 그 조건은 없는 것으로 본다. */}
                      <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                        아래 두 조건을 모두 만족해야 포인트를 쓸 수 있습니다. 비워 두면 그 조건은 적용되지 않습니다.
                      </Typography>
                      <FormControl variant='outlined'>
                        <InputLabel>사용 가능 최소 적립 포인트</InputLabel>
                        <OutlinedInput
                          type='text'
              inputProps={{ inputMode: 'numeric' }}
                          label='사용 가능 최소 적립 포인트'
                          value={금액표시(item?.setting_obj?.point_use_min ?? 0)}
                          endAdornment={<InputAdornment position='end'>P</InputAdornment>}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item?.setting_obj,
                                ['point_use_min']: 금액입력(e)
                              }
                            })
                          }}
                        />
                      </FormControl>
                      <FormControl variant='outlined'>
                        <InputLabel>포인트 사용가능 최소 주문금액 (배송비제외)</InputLabel>
                        <OutlinedInput
                          type='text'
              inputProps={{ inputMode: 'numeric' }}
                          label='포인트 사용가능 최소 주문금액 (배송비제외)'
                          value={금액표시(item?.setting_obj?.use_point_min_price ?? 0)}
                          endAdornment={<InputAdornment position='end'>원</InputAdornment>}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item?.setting_obj,
                                ['use_point_min_price']: 금액입력(e)
                              }
                            })
                          }}
                        />
                      </FormControl>
                      <FormControl variant='outlined'>
                        <InputLabel>최대포인트 사용금액</InputLabel>
                        <OutlinedInput
                          label='최대포인트 사용금액'
                          type='text'
                          inputProps={{ inputMode: 'numeric' }}
                          value={금액표시(item?.setting_obj?.max_use_point ?? 0)}
                          endAdornment={<InputAdornment position='end'>원</InputAdornment>}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item?.setting_obj,
                                ['max_use_point']: 금액입력(e)
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
                      <Typography variant='caption' sx={{ color: 'text.disabled', lineHeight: 1.8 }}>
                        · 즉시사용형: 주문금액이 최소 주문금액 이상이면 포인트 사용 가능<br />
                        · 적립형: 보유 포인트가 최소 적립 포인트 이상 모이면 사용 가능<br />
                        · 적립비율·최대 사용금액은 두 방식 공통 적용
                      </Typography>
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
                          type='text'
                          inputProps={{ inputMode: 'numeric' }}
                          value={금액표시(item?.setting_obj?.delivery_fee_default ?? 0)}
                          endAdornment={<InputAdornment position='end'>원</InputAdornment>}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item?.setting_obj,
                                ['delivery_fee_default']: 금액입력(e)
                              }
                            })
                          }}
                        />
                      </FormControl>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        주문 1건당 부과되는 기본 배송비입니다. 0원이면 무료배송으로 표시됩니다.
                      </Typography>

                      {/* 기본 택배사 — 주문관리에서 택배사를 미리 골라 둔 상태로 띄운다.
                          늘 같은 택배사를 쓰는 가맹점이 주문마다 같은 값을 고르고 있었다.
                          주문마다 바꾸는 것은 그대로 된다(여기 값은 시작값일 뿐이다). */}
                      <FormControl variant='outlined'>
                        {/* ⚠ displayEmpty 를 쓸 때는 라벨을 손으로 올려야 한다(shrink).
                            안 그러면 값이 비어 있는 동안 라벨이 안 뜨는데, displayEmpty 라
                            칸에는 '지정 안 함' 이 이미 그려져 있어 두 글자가 겹쳐 보인다.
                            테두리 홈도 같이 뚫어 준다(notched) — 안 그러면 라벨이 선을 가로지른다.
                            이 파일의 다른 칸들은 값이 늘 있어서 이 문제가 없다. */}
                        <InputLabel shrink>기본 택배사</InputLabel>
                        <Select
                          input={<OutlinedInput notched label='기본 택배사' />}
                          displayEmpty
                          value={item?.setting_obj?.default_courier ?? ''}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item?.setting_obj,
                                ['default_courier']: e.target.value
                              }
                            })
                          }}
                        >
                          <MenuItem value={''}>{'지정 안 함'}</MenuItem>
                          {COURIER_LIST.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <Typography variant='caption' sx={{ color: 'text.secondary' }}>
                        주문관리에서 택배사가 이 값으로 미리 골라져 있습니다. 주문마다 바꿀 수 있습니다.
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
                          type='text'
                          inputProps={{ inputMode: 'numeric' }}
                          value={금액표시(item?.setting_obj?.free_ship_min ?? 0)}
                          endAdornment={<InputAdornment position='end'>원</InputAdornment>}
                          onChange={e => {
                            setItem({
                              ...item,
                              ['setting_obj']: {
                                ...item?.setting_obj,
                                ['free_ship_min']: 금액입력(e)
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
